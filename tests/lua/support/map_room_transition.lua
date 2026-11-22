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
    trace.settle()
    assert(trace.alphaStarts==1 and trace.frames>=96 and trace.frames<=102,'normal entry must show one .8 s fade in each direction')
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
        assertLocal(host,cover,function()return F.click(root,'nodePanel','eventView/option1')end);settle()
        assert(host.run.nodeFlow.event.stage=='result')
        assertLocal(host,cover,function()return F.click(root,'nodePanel','eventView/option1')end);settle()
        if host.mode=='node' then assertLocal(host,cover,function()return F.click(root,'nodePanel','confirm')end);settle()end
        assert(host.mode=='map')
    elseif host.mode=='battle' then
        finishBattle(host,root,settle,cover)
    end
    Nodes.enter=enter
    OnDestroy()
end
end

if section=='fast' then
    local host,root,_,_,resize,id,hit=onMap('combat',true,'pc')
    resize(1600)
    local trace,cover,veil=observeCore(host,root)
    assert(tap(hit,15) and trace.calls==0)
    trace.tick()
    assert(trace.calls==0 and cover.visible and veil.imageColor.a==255)
    trace.settle(6)
    assert(trace.calls==1 and trace.alphaStarts==1 and host.map.currentNodeId==id)
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
