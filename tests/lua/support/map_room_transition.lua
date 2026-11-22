local native=dofile('tests/lua/support/map_room_transition_fixture.lua')
local Nodes=require('abyss_nodes')
local Map=require('abyss_map')
local Run=require('abyss_run')
local F,frame,onMap,hitFor,tap=native.ui,native.frame,native.onMap,native.hitFor,native.tap
local enter=Nodes.enter
local section=assert(ABYSS_MAP_ROOM_SECTION,'map room transition test section required')

local function observeCore(host,root)
    local trace={calls=0,opaqueFrame=false,alphaStarts=0,frames=0}
    local cover=root:GetChild('pageReveal')
    local veil=cover:GetChild('veil')
    local subtitle=cover:GetChild('subtitle')
    trace.subtitles=0
    Nodes.enter=function(...)
        trace.calls=trace.calls+1
        assert(trace.opaqueFrame and veil.imageColor.a==255,'core started before a separate opaque update')
        return enter(...)
    end
    function trace.tick(dt)
        local prior=cover.visible and veil.imageColor.a or 0
        OnUpdate(dt or frame)
        trace.frames=trace.frames+1
        assert(script.updating and not host.disabled,'unexpected fatal UI fallback')
        local alpha=cover.visible and veil.imageColor.a or 0
        if subtitle.visible then
            assert(alpha==255 and host.pageReveal:covered(),'subtitle escaped opaque black or the input lock')
            assert(not cover:GetChild('message').visible and not cover:GetChild('cancel').visible)
            trace.subtitles=trace.subtitles+1
        end
        if prior==0 and alpha>0 then trace.alphaStarts=trace.alphaStarts+1 end
        if trace.calls>0 and cover.visible then
            assert(alpha<=prior,'room entry darkened a second time')
        end
        if cover.visible and veil.imageColor.a==255 then trace.opaqueFrame=true end
    end
    function trace.settle(count)
        for _=1,count or 120 do
            if not host.pageReveal:covered() then return end
            trace.tick()
        end
        assert(not host.pageReveal:covered(),'page did not become interactive')
    end
    return trace,cover,veil
end
local function assertLocal(host,cover,action)
    assert(action())
    assert(host.pageReveal.state~='fadingOut' and host.pageReveal.state~='fadingIn')
    assert(not cover.visible or host.pageReveal.localFrame,'ready UI showed a fullscreen loading cover')
end

local function same(a,b,seen)
    if type(a)~=type(b) then return false end
    if type(a)~='table' then return a==b end
    seen=seen or {}
    if seen[a] then return seen[a]==b end
    seen[a]=b
    for k,v in pairs(a) do if not same(v,b[k],seen) then return false end end
    for k in pairs(b) do if a[k]==nil then return false end end
    return true
end

local function finishBattle(host,root,settle,cover)
    -- Terminal combat setup follows scripts/runtime-baseline/host.lua.
    for _,enemy in ipairs(host.run.combat.enemies)do enemy.hp=0 end
    assert(Run.finishCombat(host.run))
    assertLocal(host,cover,function()host:refresh();return true end);settle()
    assertLocal(host,cover,function()F.click(root,'battlePanel','continue');return true end);settle()
    assert(host.mode=='map' and host.mapUI.navigationEnabled)
end

if section=='rooms' then
for _,kind in ipairs({'camp','shop','event','combat','elite','boss','treasure'}) do
    local host,root,assets,settle,_,id,hit=onMap(kind)
    local map,run,oldFloor,oldGeneration=host.map,host.run,host.map.floor,host.run.roomGeneration
    local expectedRun=F.Combat.copy(run,{[run.data]=run.data})
    local expectedMap=Map.snapshot(map)
    assert(enter(expectedRun,expectedMap,id))
    local expectedType=expectedRun.nodeFlow.type
    local trace,cover,veil=observeCore(host,root)
    local mapPaints,roomPaints=0,0
    local mapRender, roomRender=host.mapUI.render,host.nodeUI.render
    host.mapUI.render=function(...)mapPaints=mapPaints+1;return mapRender(...)end
    host.nodeUI.render=function(...)roomPaints=roomPaints+1;return roomRender(...)end
    local accepted,status,requestId=tap(hit,1)
    assert(trace.calls==0,'entry work occurred before the source received feedback')
    assert(accepted and status=='selection_pending' and requestId~=nil,'actual map tap did not explicitly accept pending entry')
    assert(host.map==map and host.run==run and host.map.floor==oldFloor and host.run.roomGeneration==oldGeneration)
    assert(trace.calls==0 and cover.visible and root:GetChild('mapPanel').visible,'entry work occurred before source feedback')
    assert(not tap(hit,2),'second touch queued another request')
    for _, other in ipairs(Nodes.available(run,map)) do
        if other.id~=id then assert(not tap(hitFor(host,root,other.id),3),'another node displaced the accepted request');break end
    end
    for _=1,4 do
        trace.tick()
        if veil.imageColor.a>0 then break end
    end
    assert(veil.imageColor.a>0 and trace.calls==0,'fade had no scheduling opportunity before core entry')
    for _=1,60 do if trace.calls>0 then break end;trace.tick() end
    assert(trace.calls==1 and cover.visible,'core completion unlocked input before the destination reveal')
    if host.mode=='battle' then
        local battle=run.combat
        local turn=battle.turn
        local button=root:GetChild('battlePanel'):GetChild('endTurn')
        local endTurn=assert(button.click and button or button:GetChild('hit'))
        assert(not tap(endTurn,4) and battle.turn==turn,'covered battle accepted a direct end-turn listener')
    end
    trace.settle(kind=='boss' and 370 or nil)
    assert(trace.alphaStarts==1,'room entry must use a single blackout')
    if kind=='boss' then
        assert(run.encounterId=='boss_guardian' and trace.subtitles>=260 and trace.subtitles<=265)
        assert(trace.frames>=360 and trace.frames<=366,'ready Guardian entry did not use the expected subtitle and scene fades')
    else
        assert(trace.subtitles==0 and trace.frames>=96 and trace.frames<=102,'ordinary rooms keep their existing fade')
    end
    assert(trace.calls==1 and map.currentNodeId==id and run.roomGeneration==oldGeneration+1 and run.nodeFlow.type==expectedType)
    assert(same(map,expectedMap) and same(run,expectedRun),'UI departure changed rule/RNG outputs')
    local phases={'input_received','feedback_submitted','core_enter_start','core_enter_end','native_preparation_start',
        'projection_built','native_preparation_end','page_ready','input_enabled'}
    assert(#assets.events==#phases,'room telemetry lost or repeated a phase')
    for i, phase in ipairs(phases) do
        assert(assets.events[i].phase==phase and assets.events[i].request==requestId,'out-of-order room telemetry: '..phase)
    end
    assert(not tap(hit,4),'covered or off-page map listener accepted a stale tap')
    if host.mode=='node' then
        assert(roomPaints==1 and mapPaints==0,kind..' reintroduced outgoing map or incoming room redraws: '..mapPaints..'/'..roomPaints)
        assert(root:GetChild('nodePanel').active)
    end
    if kind=='camp' then
        local panel=root:GetChild('nodePanel')
        assertLocal(host,cover,function()return F.click(root,'nodePanel','campView/forge') end);settle()
        assert(host.nodeUI.mode=='picker')
        assertLocal(host,cover,function()return F.click(root,'nodePanel','back') end);settle()
        assertLocal(host,cover,function()return F.click(root,'nodePanel','campView/rest') end);settle()
        assertLocal(host,cover,function()OnUpdate(2);return true end)
        assertLocal(host,cover,function()return F.click(root,'nodePanel','confirm') end);settle()
        assert(host.mode=='map' and host.mapUI.navigationEnabled and not panel.active)
    elseif kind=='shop' then
        assert(not host.nodeUI.actions['shopView/card1'],'entry drew the hidden shelf')
        local talk=root:GetChild('nodePanel'):GetChild('merchant'):GetChild('talk'):GetChild('hit')
        assertLocal(host,cover,function()return tap(talk,5)end)
        dofile('tests/lua/support/shop_timeline.lua')(host)
        assert(host.nodeUI.actions['shopView/card1'],'accepted merchant tap did not populate shelf')
        assertLocal(host,cover,function()return F.click(root,'nodePanel','shopView/card1')end)
        assertLocal(host,cover,function()return F.click(root,'nodePanel','back')end)
        assertLocal(host,cover,function()return F.click(root,'nodePanel','back')end)
        assertLocal(host,cover,function()OnUpdate(2);return true end);settle()
        if host.mode=='node' then assertLocal(host,cover,function()return F.click(root,'nodePanel','confirm')end);settle()end
        assert(host.mode=='map')
    elseif kind=='treasure' then
        assertLocal(host,cover,function()return F.click(root,'nodePanel','treasureView/chest')end)
        OnUpdate(2);settle()
        assertLocal(host,cover,function()return F.click(root,'nodePanel','back')end);settle()
        if host.mode=='node' then assertLocal(host,cover,function()return F.click(root,'nodePanel','confirm')end);settle()end
        assert(host.mode=='map')
    elseif kind=='event' and host.mode=='node' then
        assert(host.run.nodeFlow.event.id=='big_fish')
        local mapView, mapViews = Map.view, 0
        Map.view=function(...)mapViews=mapViews+1;return mapView(...)end
        mapPaints,roomPaints=0,0
        local oldChoice=host.nodeUI.actions['eventView/option1'].handler
        assert(host.nodeUI.actions['eventView/option2'].enabled)
        assert(host.nodeUI.actions['eventView/option3'].enabled)
        assertLocal(host,cover,function()return F.click(root,'nodePanel','eventView/option1')end);settle()
        assert(host.run.nodeFlow.event.stage=='result')
        assert(roomPaints==1 and mapViews==0,'event choice repainted the room or projected the map again')
        assert(not oldChoice(),'the old choice survived the result render')
        assertLocal(host,cover,function()return F.click(root,'nodePanel','eventView/option1')end);settle()
        if host.mode=='node' then assertLocal(host,cover,function()return F.click(root,'nodePanel','confirm')end);settle()end
        assert(host.mode=='map' and host.mapUI.navigationEnabled and host.map.currentNodeId==id)
        assert(mapPaints==1 and mapViews==1 and roomPaints==1,'event return repainted a departed room or the map')
        Map.view=mapView
    elseif host.mode=='battle' then
        finishBattle(host,root,settle,cover)
    end
    Nodes.enter=enter
    OnDestroy()
end

local host,root,_,settle=onMap('event')
local eventFixture=dofile('tests/helpers/act2_event_ui.lua')
local run,map=eventFixture.fixture('the_library')
host.run,host.map=run,map
host.nodeUI.run,host.nodeUI.map=run,map
host.mapUI.map,host.battleUI.run=map,run
host:refresh();settle()
local roomRender, roomPaints=host.nodeUI.render,0
host.nodeUI.render=function(...)roomPaints=roomPaints+1;return roomRender(...)end
local read=root:GetChild('nodePanel'):GetChild('eventView'):GetChild('option1'):GetChild('hit')
assert(tap(read,13))
assert(run.nodeFlow.event.stage=='choose_offer' and host.nodeUI.picker=='library_offer')
assert(#host.nodeUI.offerRows==20 and roomPaints==1 and not host.pageReveal:covered(),
    'ready twenty-card event picker did not publish in a single render')
local deckSize=#run.deck
assert(F.click(root,'nodePanel','pickerView/card1'))
roomPaints=0
assert(F.click(root,'nodePanel','confirm'))
assert(run.nodeFlow.event.stage=='result' and #run.deck==deckSize+1)
assert(host.nodeUI.picker==nil and roomPaints==1 and not host.pageReveal:covered(),
    'ready event result did not publish in a single render')
OnDestroy()
end

if section=='fast' then
    local host,root,_,_,resize,id,hit=onMap('combat',true,'pc')
    resize(1600)
    local trace,cover,veil=observeCore(host,root)
    assert(tap(hit,15) and trace.calls==0)
    trace.tick()
    assert(trace.calls==0 and cover.visible and veil.imageColor.a==255)
    trace.settle(6)
    assert(trace.calls==1 and trace.alphaStarts==1 and trace.subtitles==0 and host.map.currentNodeId==id)
    finishBattle(host,root,function()trace.settle()end,cover)
    Nodes.enter=enter
    local nextNode=assert(Nodes.available(host.run,host.map)[1])
    local again=observeCore(host,root)
    assert(tap(hitFor(host,root,nextNode.id),16))
    again.settle(8)
    assert(again.calls==1 and again.alphaStarts==1 and host.map.currentNodeId==nextNode.id)
    Nodes.enter=enter
    OnDestroy()

    local camp,campRoot,_,settle,_,_,campHit=onMap('camp',true,'pc')
    local forge,shade=observeCore(camp,campRoot)
    assert(tap(campHit,17))
    forge.settle(6)
    assertLocal(camp,shade,function()return F.click(campRoot,'nodePanel','campView/forge')end);settle()
    assertLocal(camp,shade,function()return camp.nodeUI:press('pickerView/forgeScroll/card1')end);settle()
    assertLocal(camp,shade,function()return F.click(campRoot,'nodePanel','confirm')end);settle()
    assertLocal(camp,shade,function()OnUpdate(2);return true end)
    assertLocal(camp,shade,function()return F.click(campRoot,'nodePanel','confirm')end)
    assert(camp.mode=='map')
    Nodes.enter=enter
    OnDestroy()
end

if section=='readiness' then
for _, delay in ipairs({.25,1,3}) do
    local host,root,assets,_,resize,id,hit=onMap('camp')
    local trace,cover=observeCore(host,root)
    local wait,recovery=cover:GetChild('message'),cover:GetChild('cancel')
    assets.value=false
    assert(tap(hit,10))
    resize(1344)
    for _=1,60 do if trace.calls>0 then break end;trace.tick() end
    assert(trace.calls==1,'resized departure never entered its room')
    local hiddenUntil=math.min(delay,.35)
    for _=1,math.floor(hiddenUntil/frame)do
        trace.tick()
        assert(cover.visible and not wait.visible and not recovery.visible,'short pending flashed a prompt')
    end
    for _=1,math.floor((delay-hiddenUntil)/frame)do trace.tick()end
    assert(cover.visible and wait.visible==(delay>=1) and not recovery.visible)
    assert(host.map.currentNodeId==id and not F.click(root,'nodePanel','campView/rest'),'unprepared room accepted rules input')
    assets.value=true;trace.settle()
    assert(trace.calls==1 and not wait.visible and not recovery.visible and host.mode=='node','late ready did not publish same room')
    Nodes.enter=enter
    OnDestroy()
end

for _, reason in ipairs({'injected_room_asset_failure','no_progress','projection_error'}) do
    local host,root,assets,_,_,id,hit=onMap('camp')
    local trace,cover=observeCore(host,root)
    assets.value=reason=='projection_error'
    if reason=='injected_room_asset_failure' then assets.failure=reason end
    if reason=='projection_error' then
        local render=host.nodeUI.render
        host.nodeUI.render=function(...)
            host.nodeUI.render=render
            error('injected_room_projection_failure')
        end
    end
    assert(tap(hit,20))
    for _=1,300 do
        if host.pageReveal.state=='failed' then break end
        trace.tick()
    end
    assert(host.pageReveal.state=='failed' and cover:GetChild('cancel').visible and trace.calls==1)
    if reason~='injected_room_asset_failure' then assets.value=true end
    for _=1,25 do trace.tick() end
    assert(cover.visible and host.pageReveal.state=='failed','late readiness escaped recovery')
    local run,map=host.run,host.map
    assert(tap(cover:GetChild('cancel'):GetChild('hit'),21),'failed presentation recovery unavailable')
    assert(host.exitOpen and host.menuOpen,'recovery did not open the safe menu')
    assets.value,assets.failure=true,nil
    assert(host:closeExit());trace.settle()
    assert(host.run==run and host.map==map and map.currentNodeId==id and trace.calls==1,'recovery replayed or reverted the committed room')
    Nodes.enter=enter
    OnDestroy()
end
end

if section=='cancellation' then
for _, interruption in ipairs({'menu','destroy','rejected'}) do
    local host,root,_,settle,_,id,hit=onMap('camp')
    local trace,cover=observeCore(host,root)
    local map,run=host.map,host.run
    local oldMap,oldRun=Map.snapshot(map),F.Combat.copy(run,{[run.data]=run.data})
    if interruption=='rejected' then
        Nodes.enter=function()
            assert(trace.opaqueFrame,'rejected core still ran before scheduled feedback')
            trace.calls=trace.calls+1
            return false,'combat_unavailable'
        end
    end
    assert(tap(hit,30))
    trace.tick()
    if interruption=='menu' then
        assert(host:openMenu() and host.exitOpen)
        assert(host:closeExit() and not host.exitOpen)
        trace.settle()
        assert(host.mapUI.navigationEnabled and not cover.visible and trace.calls==0)
    elseif interruption=='destroy' then
        OnDestroy();OnUpdate(frame)
        assert(host.disabled and not script.updating and trace.calls==0)
    else
        trace.settle()
        assert(host.mapUI.entryError and host.mapUI.navigationEnabled and trace.calls==1 and not cover.visible)
    end
    assert(same(map,oldMap) and same(run,oldRun),'an uncommitted request changed route, RNG, or rules')
    assert(map.currentNodeId~=id)
    Nodes.enter=enter
    if interruption~='destroy' then settle();OnDestroy()end
end

local host,root,_,_,_,id,hit=onMap('camp')
local trace,cover=observeCore(host,root)
local oldMap=Map.snapshot(host.map)
local oldRun=F.Combat.copy(host.run,{[host.run.data]=host.run.data})
local raise=cover.SetAsLastSibling
function cover:SetAsLastSibling()
    self.SetAsLastSibling=raise
    error('injected_current_cover_raise_failure')
end
assert(not tap(hit,40),'a rejected native cover write accepted a room request')
assert(trace.calls==0 and host.nodeEntry==nil and not host.pageReveal:covered() and not cover.visible)
assert(same(host.map,oldMap) and same(host.run,oldRun),'failed feedback submission ran the room transaction')
assert(tap(hit,41),'failed feedback submission blocked the next legal tap')
trace.settle()
assert(trace.calls==1 and host.map.currentNodeId==id)
Nodes.enter=enter
OnDestroy()
end

if section=='boss' then
for _, scenario in ipairs({'late_ready','asset_failure','cancelled'}) do
    local host,root,assets,_,_,id,hit=onMap('boss',true,'mobile')
    local trace,cover=observeCore(host,root)
    local subtitle=cover:GetChild('subtitle')
    local panel=root:GetChild('battlePanel')
    local notice=panel:GetChild('notice')
    local elapsed=host.run.elapsedSeconds
    assets.value=false
    assert(tap(hit,50))
    trace.tick()
    assert(trace.calls==0 and not subtitle.visible,'subtitle preceded the opaque scheduler turn')
    if scenario=='cancelled' then
        assert(host:openMenu() and host:closeExit())
        trace.settle()
        assert(trace.calls==0 and host.map.currentNodeId~=id and not subtitle.visible)
        assert(tap(hit,51),'a cancelled departure blocked the next legal tap')
    end
    for _=1,12 do trace.tick() end
    assert(trace.calls==1 and host.map.currentNodeId==id and panel.visible and subtitle.visible)
    assert(host.run.encounterId=='boss_guardian' and host.run.phase=='combat')
    assert(subtitle.text=='石门缓缓开启。昔日的封印守卫仍在履行职责，只是漆黑的力量已令它分不清敌友。')
    assert(notice.text=='' and host.run.elapsedSeconds==elapsed)
    local alpha,epoch=subtitle.fontColor.a,host.pageReveal.epoch
    assert(alpha>0 and alpha<255,'subtitle must fade in gradually')
    for _=1,4 do host:refresh() end
    assert(host.pageReveal.epoch==epoch and subtitle.fontColor.a==alpha and trace.calls==1)
    local button=panel:GetChild('endTurn')
    local turn=host.run.combat.turn
    assert(not tap(assert(button.click and button or button:GetChild('hit')),52) and host.run.combat.turn==turn)
    for _=1,20 do trace.tick() end
    assert(subtitle.fontColor.a==255 and host.run.elapsedSeconds==elapsed)
    local recovery=cover:GetChild('cancel')
    if scenario=='asset_failure' then
        assets.failure='injected_guardian_asset_failure'
        trace.tick()
        assert(host.pageReveal.state=='failed' and recovery.visible and not subtitle.visible)
        assert(tap(recovery:GetChild('hit'),53) and host.exitOpen)
        assets.failure=nil
        assert(host:closeExit())
    end
    assets.value=true
    local last,count,fadeOut=255,trace.subtitles,false
    while host.pageReveal:covered() and trace.frames<280 do
        trace.tick()
        if subtitle.visible then
            assert(subtitle.fontColor.a<=last,'subtitle restarted after the hold')
            last=subtitle.fontColor.a
            fadeOut=fadeOut or last<255
        end
    end
    assert(not host.pageReveal:covered() and not subtitle.visible and not recovery.visible)
    assert(trace.calls==1 and not cover.visible and host.run.combat.turn==turn and notice.text=='')
    if scenario=='asset_failure' then
        assert(count==trace.subtitles,'recovery replayed the failed subtitle')
    else
        assert(fadeOut and trace.subtitles>=260 and trace.subtitles<=265,'preparation changed the subtitle duration or skipped the fade-out')
    end
    local revealed=host.pageReveal.epoch
    host:refresh();trace.tick()
    assert(host.pageReveal.epoch==revealed and not subtitle.visible and host.run.elapsedSeconds>elapsed)
    Nodes.enter=enter
    OnDestroy()
end
end
