package.preload.abyss_battle_actions=function()return dofile('/tmp/pointer-review-0115/actions-prototype.lua')end
local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')
local NativeContract = dofile('tests/lua/support/native_ui_contract.lua')
package.path = "src/lua/?.lua;build/lua/?.lua;" .. package.path
local UI = require("abyss_battle_ui")
local Combat = require("abyss_combat")
local Run = require("abyss_run")
local Data = require("abyss_data")
local Presentation = require("abyss_presentation")
local Layout = require("abyss_ui_layout")
local F = dofile('tests/lua/support/game_ui_fixture.lua')
-- Use the full generated native import tree; missing controls fail loudly.
local function control(definition)
    local c = { name = definition.name, visible = definition.visible ~= false, children = {}, text = "",
        sizeDeltaX = definition.size[1], sizeDeltaY = definition.size[2], interactable = true,
        x = definition.position and definition.position[1] or 0, y = definition.position and definition.position[2] or 0 }
    for _, entry in ipairs(definition.children or {}) do c.children[entry.name] = control(entry) end
    function c:GetChild(key) return assert(self.children[key], "unknown control " .. self.name .. "/" .. key) end
    function c:SetVisible(value) assert(type(value) == "boolean") self.visible = value end
    function c:AddCursorEventListener(event, fn) NativeContract.listener(event,fn);
        self.listeners = self.listeners or {}
        self.listeners[event] = fn
        if event == "click" then self.click = fn end
    end
    function c:SetAnchoredPosition(x, y) self.x, self.y = x, y end
    function c:SetSizeDelta(x, y) NativeContract.sizeDelta(x,y); self.sizeDeltaX, self.sizeDeltaY = x, y end
    function c:SetLocalScale(x, y) self.localScaleX, self.localScaleY = x, y end
    function c:SetImage(...)
        assert(select("#", ...) == 2, "SetImage expects exactly source and id")
        local source, id = ...
        assert(source == "static" and type(id) == "number") self.imageId = id
    end
    function c:SetAsLastSibling() self.raised = true end
    return c
end

local function setup()
    local root = control({name="root",size={1280,720},children=Layout})
    local panel = root:GetChild("stage"):GetChild("battlePanel")
    local ui = UI.new(panel,Data,Presentation,"click",F.withMonsterActors({
        imageSource="static",color=function(r,g,b,a) return {r=r,g=g,b=b,a=a} end,
        cursorEvents={CursorDown="down",CursorDrag="drag",CursorUp="up",CursorEndDrag="endDrag"}
    }),{embedded=true})
    ui.run = Run.new(Data,1)
    assert(Run.startCombat(ui.run,"cultist_solo"))
    ui.run.combat = Combat.new(Data,{deck={"defend","defend"},enemies={"cultist"}})
    ui:resize(1280,720) ui:render()
    local function event(name,kind,x,y,touch)
        local box = assert(F.actorControl(panel,name))
        local hit = box.listeners and box or box:GetChild("hit")
        local callback = assert(hit.listeners[kind],"missing native listener: "..name.."/"..kind)
        callback({touchId=touch or 7,GetUIPos=function() return 640+x,360+y end})
    end
    local function tap(name,touch)
        local box = assert(F.actorControl(panel,name))
        event(name,"down",box.x,box.y,touch)
        event(name,"up",box.x,box.y,touch)
        event(name,"click",box.x,box.y,touch)
    end
    return ui,panel,event,tap
end

local ui,panel,event,tap=setup()
for _=1,80 do ui:update(1/60) end
local card=panel:GetChild('card1');local x,y=card.x,card.y
event('card1','down',x,y)
event('card1','drag',x+100,y)
assert(ui.gesture and ui.gesture.browsed and not ui.gesture.moving)
event('card1','drag',x,y)
ui:update(0.45)
print('BROWSE_RETURN_DETAIL',ui.info~=nil)
assert(not ui.info,'browsing then returning must not become stationary long hold')
local nextui,nextpanel,nextevent=setup()
for _=1,80 do nextui:update(1/60)end
local c=nextpanel:GetChild('card1')
nextevent('card1','down',c.x,c.y)
nextui:update(0.45)
assert(nextui.info and not nextui.info.transient,'fresh stationary hold remains deliberate reader')
print('NEW_BOUNDARY_PROBE_PASS 2')
