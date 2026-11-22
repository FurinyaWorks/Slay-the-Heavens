-- Actual production bootstrap and map hit handlers. The generated controls and
-- manually scheduled callbacks model the Lua boundary, not client presentation.
local F = dofile('tests/lua/support/game_ui_fixture.lua')
local GameUI = require('abyss_game_ui')
local Map = require('abyss_map')
local Routes = dofile('tests/lua/support/map_routes.lua')
local Portraits = require('abyss_traveler_portraits')
local make, makePortraits = GameUI.new, Portraits.new
local frame = 1/60

local function quiet() end
local function untilState(condition, label, maxFrames)
    for _ = 1, maxFrames or 60 do
        if condition() then return end
        OnUpdate(frame)
    end
    assert(condition(), label)
end

local function makeNativeHost(fast,device)
    local canvas = F.control({children=F.Layout})
    local stage = canvas:GetChild('stage')
    for _, name in ipairs({'nodePanel', 'choicePanel'}) do
        local panel = stage:GetChild(name)
        panel.active = true
        function panel:SetActive(active)
            self.active = active
            F.setEngineActive(self, active)
        end
    end
    local host, width = nil, 1280
    local assets = {value=true,ticks=0,created=0,destroyed=0,events={}}
    function assets.ready()
        return assets.value,assets.failure,assets.progress
    end
    GameUI.new = function(root, data, presentation, click, platform)
        assert(platform.prologue and platform.campaign and platform.nativePageLifecycle)
        local trace=platform.entryTrace
        if trace then
            platform.entryTrace=function(phase,request,detail)
                assets.events[#assets.events+1]={phase=phase,request=request}
                trace(phase,request,detail)
            end
        end
        host = make(root,data,presentation,click,platform)
        root.ui = host
        return host
    end
    Portraits.new = function()
        return {
            tick=function() assets.ticks=assets.ticks+1 end,
            sync=quiet, syncResult=quiet, battlePose=quiet,
            status=function() return {} end, release=quiet, onEngineDestroy=quiet,
            readyForPage=function(_,mode,_,_,page)
                if mode=='node' and page=='nodePanel' or mode=='battle' and page=='battlePanel' then
                    return assets.ready()
                end
                return true
            end,
        }
    end
    local actors=F.monsterActors()
    package.loaded.abyss_monster_actor_binding={enabled=true,templateIndex=actors.templateIndex,
        containerTemplateIndex=actors.containerTemplateIndex,powerTemplateIndex=actors.powerTemplateIndex}
    script={object=canvas,GetParam=function()return false end,
        EnableUpdate=function(self,value)self.updating=value end}
    Enum={CursorEventType={CursorClick='click',CursorDown='down',CursorUp='up'},ImageSource={StaticReference='static'},
        Device={Mobile='mobile',Controller='controller',MobileController='mobile-controller'}}
    Color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end
    game={IsTestPlay=function()return true end,GetUICanvasSize=function()return width,720 end,
        InstantiateClientUIControl=function(...)
            local control=actors.instantiate(...)
            assets.created=assets.created+1
            return control
        end,
        DestroyClientUIControl=function(...)
            actors.destroy(...)
            assets.destroyed=assets.destroyed+1
        end,
        GetDevice=function()return device or 'mobile' end,GetCursorUIPos=function()return 0,0 end}
    dofile('src/lua/abyss_ui.lua')
    OnStart()
    GameUI.new,Portraits.new=make,makePortraits
    assert(host and script.updating and host.pageReveal:usesFade(),'native motion is required')
    host.seed=42
    local function settled()
        untilState(function()return not host.pageReveal:covered()end,'native page did not publish')
        assert(script.updating and not host.disabled)
    end
    settled()
    if fast then assert(host:setFastMode(true)) end
    assert(host:start());settled()
    assert(host:selectCharacter('traveler'));settled()
    assert(host:confirmCharacter());settled()
    if host.mode=='node' then
        for _, option in ipairs({1, 2, 1}) do
            assert(F.click(stage,'nodePanel','eventView/option'..option));settled()
        end
    end
    assert(host.mode=='map' and host.mapUI.navigationEnabled)
    return host,stage,assets,settled,function(value)width=value end
end

local function hitFor(host, root, nodeId)
    for slot, id in pairs(host.mapUI.slots) do
        if id==nodeId then
            local node=F.mapControl(root:GetChild('mapPanel'),'node'..slot)
            return node.click and node or node:GetChild('hit')
        end
    end
    error('no actual map button for '..nodeId)
end

local function tap(hit, id)
    local event={touchId=id}
    if hit.listeners.down then hit.listeners.down(event) end
    if hit.listeners.up then hit.listeners.up(event) end
    return hit.click(event)
end

local function onMap(kind,fast,device)
    local host,root,assets,settle,resize=makeNativeHost(fast,device)
    if kind=='camp' then host.run.hp=host.run.maxHp-10 end
    local path=Routes.to(host.map,function(node)return node.type==kind end)
    -- Project a route checkpoint through real edges. The regression starts
    -- here, and measures only the final actual tap and complete Nodes.enter.
    if #path>1 then
        host.run.nodeFlow=nil
        for i=1,#path-1 do assert(Map.choose(host.map,path[i])) end
        host.run.floor=host.map.floor
        host:refresh()
        settle()
    end
    local id=path[#path]
    local hit=hitFor(host,root,id)
    assert(hit.raycastTarget and host.mapUI.navigationEnabled,'route target must be interactive')
    return host,root,assets,settle,resize,id,hit,#path
end

return {onMap=onMap,hitFor=hitFor,tap=tap,frame=frame,ui=F}
