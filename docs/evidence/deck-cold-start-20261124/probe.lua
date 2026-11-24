-- Runs the checkout's actual abyss_ui.lua OnStart/OnUpdate with generated
-- native-page templates and repository fixture controls. No client pixels.
local source=os.getenv('DECK_SOURCE') or 'src/lua'
package.path=assert(os.getenv('DECK_GENERATED'))..'/?.lua;'..source..'/?.lua;'..package.path
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Native=dofile('tests/lua/support/native_art_controls.lua')
local GameUI=require('abyss_game_ui')
local CardArt=require('abyss_card_art_runtime')
local Portraits=require('abyss_traveler_portraits')
local createPortraits=Portraits.new
local Binding=require('abyss_deck_browser_binding')
local createHost=GameUI.new
local frame=1/60
local report=print
if not os.getenv('DECK_VERBOSE') then print=function()end end

-- Unimported UI export has zero template IDs. Supply local fixture IDs and
-- resolve them to the actual generated template tree in both arms.
Binding.templateIndex=101
local deckParts={}
for i,part in ipairs(Binding.parts) do
    part.templateIndex=101+i
    deckParts[part.templateIndex]=part
end
local step=tonumber(os.getenv('DECK_SYNTHETIC_CLOCK')) or 0
local stepClock=0
local function clockTick()
    stepClock=stepClock+step
    return stepClock
end

local function quiet()end

local function makeHost(amount)
    collectgarbage('collect')
    local host,root,progressive
    local canvas=F.control({children=F.Layout})
    local stage=canvas:GetChild('stage')
    for _,name in ipairs({'nodePanel','choicePanel'}) do
        local nativePanel=stage:GetChild(name)
        nativePanel.active=true
        function nativePanel:SetActive(active)
            self.active=active
            F.setEngineActive(self,active)
        end
    end
    local factory,actors=F.deckBrowser(),F.monsterActors()
    local totals={created=0,parts=0,destroyed=0}
    package.loaded.abyss_monster_actor_binding={enabled=true,templateIndex=actors.templateIndex,
        containerTemplateIndex=actors.containerTemplateIndex,powerTemplateIndex=actors.powerTemplateIndex}
    GameUI.new=function(stage,data,presentation,event,platform)
        assert(platform.nativePageLifecycle and platform.deckBrowser)
        progressive=platform.deckBrowser.progressive==true
        if step>0 then
            -- Control the existing soft stop without sleeping, changing
            -- budget or injecting work. CPU metrics use the real clock.
            stepClock=0
            platform.deckBrowser.clock=clockTick
        end
        host=createHost(stage,data,presentation,event,platform)
        root=stage
        root.ui=host
        return host
    end
    script={object=canvas,GetParam=function()return false end,
        EnableUpdate=function(self,v)self.updating=v end}
    Enum={CursorEventType={CursorClick='click',CursorDown='down',CursorUp='up'},
        ImageSource={StaticReference='static'},Device={Mobile='mobile'},
        ImageType={Basic='basic',Stretch='stretch'}}
    Color=setmetatable({FromRGBA=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end},
        {__call=function(_,r,g,b,a)return {r=r,g=g,b=b,a=a}end})
    game={GetUICanvasSize=function()return 1280,720 end,IsTestPlay=function()return true end,
        GetDevice=function()return 'desktop'end,GetCursorUIPos=function()return 0,0 end,
        InstantiateClientUIControl=function(index,parent)
            if index>=Binding.templateIndex then
                local part=deckParts[index]
                assert(index==Binding.templateIndex or part,'unknown browser template ID')
                if part then totals.parts=totals.parts+1 else totals.created=totals.created+1 end
                return factory.create(parent,part)
            end
            local control=actors.instantiate(index,parent)
            if index==actors.templateIndex then Native.decorate(assert(control:GetChild('monsterArt'))) end
            return control
        end,
        DestroyClientUIControl=function(control)
            if control.name=='AbyssBattlePileCard' then
                totals.destroyed=totals.destroyed+1
                return factory.destroy(control)
            end
            return actors.destroy(control)
        end}
    -- Like map_room_transition_fixture.lua, start with a settled portrait
    -- owner. Its GIL template IDs require the official import.
    Portraits.new=function()
        return {tick=quiet,sync=quiet,syncResult=quiet,battlePose=quiet,release=quiet,onEngineDestroy=quiet,
            status=function()return {} end,readyForPage=function()return true end}
    end
    dofile(source..'/abyss_ui.lua')
    OnStart()
    GameUI.new,Portraits.new=createHost,createPortraits
    assert(host and script.updating and host.pageReveal:usesFade(),'native entry did not start')
    host.seed=42
    local function settle()
        for _=1,80 do
            if not host.pageReveal:covered() and not host.starting then
                assert(script.updating and not host.disabled)
                return
            end
            OnUpdate(frame)
        end
        error(host.pageReveal.error or 'base page did not settle')
    end
    settle()
    assert(host:start());settle()
    assert(host:selectCharacter('traveler'));settle()
    assert(host:confirmCharacter());settle()
    if host.mode=='node' then
        for _,option in ipairs({1,2,1}) do
            assert(F.click(root,'nodePanel','eventView/option'..option));settle()
        end
    end
    assert(host.mode=='map' and host.mapUI.navigationEnabled)
    local source,before=host.run.deck,{}
    for i=1,amount do
        local card=F.Combat.copy(source[(i-1)%#source+1])
        card.uid=1000+i
        before[i]=card
    end
    host.run.deck=before
    host:refresh()
    settle()
    assert(totals.created==0 and totals.parts==0,'premature deck creation before first browse')
    return host,root,totals,settle,progressive
end

local function visible(control)
    while control do
        if control.alive==false or control.visible==false then return false end
        control=control.parent
    end
    return true
end

local function inventory(panel,grid)
    local nodes,listeners,roots=0,0,0
    local function walk(control)
        if control.alive==false then return end
        nodes=nodes+1
        for _ in pairs(control.listeners or {}) do listeners=listeners+1 end
        for _ in pairs(control.keyListeners or {}) do listeners=listeners+1 end
        for _,child in pairs(control.children or {}) do walk(child) end
        for _,item in pairs(control.items or {}) do walk(item) end
    end
    walk(panel)
    for _,control in pairs(grid.children) do
        if control.name=='AbyssBattlePileCard' and control.alive~=false then roots=roots+1 end
    end
    return nodes,listeners,roots
end

local function capture(amount,iteration,cycleCount)
    local host,root,totals,settle,progressive=makeHost(amount)
    local panel=root:GetChild('deckPanel')
    local grid,chrome,returnButton=panel:GetChild('pileGrid'),panel:GetChild('pileChrome'),panel:GetChild('pileReturn')
    local open=root:GetChild('deckEntry'):GetChild('open'):GetChild('hit')
    local back=returnButton:GetChild('hit')
    local cover=root:GetChild('pageReveal')
    local veil,message=cover:GetChild('veil'),cover:GetChild('message')
    local expected=math.min(amount,10)

    local function visual()
        local blocking=visible(veil) and (not veil.imageColor or veil.imageColor.a>0)
        local shell=visible(chrome) and visible(returnButton) and (not blocking or host.pageReveal.localFrame)
        local count=0
        if not blocking and visible(grid) then
            for _,control in pairs(grid.children) do
                if control.name=='AbyssBattlePileCard' and visible(control) then
                    assert(control:GetChild('face'):GetChild('name').text~='','exposed an unpainted face')
                    for _,part in ipairs(Binding.parts) do
                        local mount=control
                        for _,segment in ipairs(part.path) do mount=assert(mount:GetChild(segment)) end
                        assert(next(mount.children),'exposed an unmounted face segment')
                    end
                    count=count+1
                end
            end
        end
        local hint=visible(message)
        return shell,visible(panel) and not blocking,count,blocking,hint
    end

    local function measure(phase)
        assert(visible(open) and open.raycastTarget,'actual deck entry unavailable')
        local rootsBefore,partsBefore=totals.created,totals.parts
        local begin=os.clock()
        assert(open.click())
        local callbackMS=(os.clock()-begin)*1000
        local activeMS,peakUpdateMS=callbackMS,0
        local shellFrame,uncoveredFrame,firstFrame,fullFrame,firstCpuMs
        local hintFrames,veilFrames,maxVisible=0,0,0
        for n=0,120 do
            local chromeVisible,uncovered,count,covered,showHint=visual()
            if chromeVisible then shellFrame=shellFrame or n end
            if uncovered then uncoveredFrame=uncoveredFrame or n end
            if count>0 and not firstFrame then firstFrame,firstCpuMs=n,activeMS end
            if covered then veilFrames=veilFrames+1 end
            if showHint then hintFrames=hintFrames+1 end
            maxVisible=math.max(maxVisible,count)
            if not (host.deckUI.pendingGrid or host.pageReveal:covered()) then
                fullFrame=n
                assert(count==expected and uncovered and not showHint,'full page did not expose expected cards')
                break
            end
            local now=os.clock()
            OnUpdate(frame)
            local ms=(os.clock()-now)*1000
            activeMS,peakUpdateMS=activeMS+ms,math.max(peakUpdateMS,ms)
            assert(script.updating and not host.disabled and not host.deckUI.prepareError)
        end
        assert(shellFrame and uncoveredFrame and firstFrame and fullFrame,'unobserved deck milestone')
        local nodes,listeners,roots=inventory(panel,grid)
        local columns={amount,iteration,phase,step,tostring(progressive),callbackMS,shellFrame,uncoveredFrame,
            firstFrame,fullFrame,firstCpuMs,activeMS,peakUpdateMS,veilFrames,hintFrames,nodes,listeners,roots,
            totals.created-rootsBefore,totals.parts-partsBefore,CardArt.status().liveControls}
        report('ROW\t'..table.concat(columns,'\t'))
        assert(back.click())
        settle()
        assert(not visible(panel),'deck still visible after real back hit')
    end

    measure('cold')
    measure('warm')
    local initialNodes,initialListeners,initialRoots=inventory(panel,grid)
    for _=1,cycleCount do
        assert(open.click());settle()
        assert(back.click());settle()
    end
    local nodes,listeners,roots=inventory(panel,grid)
    assert(nodes==initialNodes and listeners==initialListeners and roots==initialRoots)
    local columns={amount,iteration,cycleCount,nodes,listeners,roots,totals.created,totals.parts,totals.destroyed}
    report('RESOURCE\t'..table.concat(columns,'\t'))
    OnDestroy()
    assert(not script.updating)
    script,game=nil,nil
end

report('FIELDS\tamount\titeration\tphase\tsynthetic_clock_seconds\tprogressive\tcallback_ms\tshell_frame\tuncovered_frame\tfirst_complete_frame\tready_frame\tfirst_complete_cpu_ms\tready_cpu_ms\tpeak_update_ms\tveil_frames\thint_frames\tlive_panel_nodes\tlive_listeners\tlive_deck_roots\tnew_roots\tnew_parts\tlive_native_art')
report('RESOURCE_FIELDS\tamount\titeration\tcycles\tlive_closed_panel_nodes\tlive_closed_listeners\tlive_closed_roots\tcreated_roots\tcreated_parts\tdestroyed_roots')
local amount=assert(tonumber(os.getenv('DECK_AMOUNT')))
for i=1,assert(tonumber(os.getenv('DECK_SAMPLES'))) do
    capture(amount,i,tonumber(os.getenv('DECK_CYCLES')) or 0)
end
