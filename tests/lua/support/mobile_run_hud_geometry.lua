-- Coordinate dispatch over generated controls with the real host's runtime
-- writes, visibility, preset state, and sibling order. Offline native mock.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Map=require('abyss_map')
local Routes=dofile('tests/lua/support/map_routes.lua')
local stage
for _,spec in ipairs(F.Layout)do if spec.name=='stage'then stage=spec end end
local phone={2556,1179}
local cursor={CursorDown='down',CursorUp='up',CursorDrag='drag',CursorEndDrag='endDrag',CursorEnter='enter',CursorExit='exit'}
local function near(a,b)assert(math.abs(a-b)<.001,tostring(a)..' != '..tostring(b))end

local function geometry(root,screen)
    local records,serial={},0
    local function mount(c,s,parent,path,order)
        local row={control=c,spec=s,parent=parent,path=path,children={},order=order}
        records[path]=row
        local raise=c.SetAsLastSibling
        c.SetAsLastSibling=function(self)
            serial=serial+1;row.raised=serial
            return raise(self)
        end
        for index,part in ipairs(s.children or {})do
            local child=assert(c:GetChild(part.name),path..'/'..part.name)
            row.children[#row.children+1]=mount(child,part,row,path..'/'..part.name,index)
        end
        return row
    end
    local tree=mount(root,stage,nil,'',1)
    local function pose(row)
        local x,y,sx,sy=screen[1]/2,-screen[2]/2,1,1
        if row.parent then x,y,sx,sy=pose(row.parent)end
        local c,s=row.control,row.spec
        local p=s.position or {0,0}
        local k=s.scale or {1,1}
        return x+(c.x or p[1])*sx,y+(c.y or p[2])*sy,
            sx*(c.localScaleX or k[1]),sy*(c.localScaleY or k[2])
    end
    local function rect(row)
        local x,y,sx,sy=pose(row)
        local c=row.control
        return {x=x,y=y,w=(c.sizeDeltaX or 0)*sx,h=(c.sizeDeltaY or 0)*sy,path=row.path}
    end
    local function visit(row,x,y,found)
        local c,s=row.control,row.spec
        if c.visible==false or c.activeInHierarchy==false then return end
        if c.listeners and c.raycastTarget~=false and (s.kind~='presetButton' or c.interactable)then
            local box=rect(row)
            if math.abs(x-box.x)<box.w/2 and math.abs(y-box.y)<box.h/2 then found[#found+1]=row end
        end
        table.sort(row.children,function(a,b)return (a.raised or a.order-100)<(b.raised or b.order-100)end)
        for _,part in ipairs(row.children)do
            if s.kind~='presetButton' or part.spec.name=='normal' then visit(part,x,y,found)end
        end
    end
    local function query(x,y)
        local hits={};visit(tree,x,y,hits);return hits
    end
    local function dispatch(x,y,touch,expected,kinds)
        local rows=query(x,y)
        local row=rows[#rows]
        assert(row and row.path==expected,'expected '..expected..' at '..x..','..y..'; found '..(row and row.path or 'empty'))
        local event={touchId=touch,GetUIPos=function()return x,screen[2]+y end}
        for _,kind in ipairs(kinds)do
            local f=row.control.listeners[kind]
            if f then f(event)end
        end
    end
    local function tap(x,y,touch,expected)dispatch(x,y,touch,expected,{'down','up','click'})end
    local function at(path)
        local row=assert(records[path],path)
        return rect(row),row.control
    end
    return {hits=query,tap=tap,at=at,dispatch=dispatch}
end

local function create(mobile, platformOptions)
    local screen=mobile and phone or {1920,1080}
    local platform=platformOptions or {}
    platform.touchScreen=function()return mobile end
    platform.keyEvents={KeyboardCraftspersonKey42Down='backspace'}
    local host,root=F.fixture(nil,nil,nil,cursor,nil,nil,platform)
    local picture=geometry(root,screen)
    local canvas={GetChild=function(_,name)if name=='stage'then return root end;return {} end}
    F.Viewport.apply(canvas,table.unpack(screen));host:resize(table.unpack(screen))
    assert(F.start(host))
    return host,root,picture,screen
end
local function checkTarget(picture,path,k,screen)
    local box=picture.at(path)
    assert(box.w/3>=44 and box.h/3>=44,path..' is below 44pt: '..(box.w/3)..'×'..(box.h/3))
    assert(box.x-box.w/2>=screen[1]/2-(640-40)*k and box.x+box.w/2<=screen[1]/2+(640-40)*k,path..' outside horizontal stage inset')
    assert(-box.y-box.h/2>=(screen[2]-720*k)/2+20*k-.001,path..' outside top stage inset')
    return box
end
local function nonOverlap(a,b)
    return math.abs(a.x-b.x)>(a.w+b.w)/2 or math.abs(a.y-b.y)>(a.h+b.h)/2
end
local function inspectTop(host,picture,screen,page,capacity,base)
    local k=screen[2]/720
    local hits={}
    local function include(path)hits[#hits+1]=checkTarget(picture,path,k,screen);return hits[#hits]end
    for i=1,capacity do
        local path=base(i)
        local hit=include(path)
        local battle=page=='battlePanel' and host.run.phase=='combat'
        for _,state in ipairs({'normal','hover','pressed','disabled'})do
            local pathFace=battle and path..'/'..state or '/potionEntry/open/hit/'..state..'/slot'..i
            local bottle=picture.at(pathFace..'/bottle')
            local shadow=picture.at(pathFace..'/emptyShell/dashes/bottleShadow')
            near(hit.x,bottle.x);near(hit.y,bottle.y)
            near(bottle.w,shadow.w);near(bottle.h,shadow.h)
            assert(bottle.w/k>=40 and bottle.h/k>=45,'official bottle frame did not grow on '..pathFace)
        end
    end
    if page~='nodePanel' then
        for _,kind in ipairs({'hp','gold'})do include('/'..page..'/resourceHints/'..kind..'/hit')end
    end
    if page=='battlePanel'then include('/battlePanel/topBar/battleRoute/hit')
    elseif page=='nodePanel'then include('/nodePanel/runRoute/hit')end
    include('/deckEntry/open/hit');include('/exitEntry/open/hit')
    if #host.run.relics>0 then include('/relicBar/slot1/hit')end
    for i,a in ipairs(hits)do for j=i+1,#hits do
        local b=hits[j]
        assert(nonOverlap(a,b),a.path..' competes with '..b.path)
    end end
    local bar=picture.at('/'..page..(page=='battlePanel' and '/topBar/steel' or '/officialRunBar/steel'))
    near(-bar.y-bar.h/2,(screen[2]-720*k)/2)
    return hits
end

local function battlePath(i)return '/battlePanel/'..(i>3 and 'potionHelp/' or '')..'potion'..i end
local function sharedPath(i)return '/potionEntry/slot'..i..'/hit' end
local function click(picture,path,touch,dx,dy)
    local box=picture.at(path);picture.tap(box.x+(dx or 0),box.y+(dy or 0),touch,path)
end
local function noPotionAt(picture,x,y)
    for _,row in ipairs(picture.hits(x,y))do
        assert(not row.path:match('/potionEntry/slot') and not row.path:match('/battlePanel/.*/?potion%d$'),
            'a gap resolved to '..row.path)
    end
end
local function popupSlot(host,picture,slot,touch,path,dx,dy)
    click(picture,path,touch,dx,dy)
    local combat=host.run.phase=='combat'
    local popupRoot=combat and '/battlePanel/potionHelp/potionPopup' or '/potionPanel'
    local popup,state=picture.at(popupRoot)
    local expected=picture.at(path)
    assert(state.visible,'touch did not open a potion popup')
    near(popup.x,expected.x)
    local title=select(2,picture.at(popupRoot..'/title'))
    assert(title.text==Run.potionSlotView(host.run,slot).name,'wrong physical potion slot')
    return popupRoot
end

if ...=='helpers' then return {create=create,click=click,nonOverlap=nonOverlap,inspectTop=inspectTop,sharedPath=sharedPath,geometry=geometry} end

if ...=='events' then
    local eventHost,eventRoot,eventPicture=create(true)
    eventHost.run.potions={[1]='speed_potion',[3]='block_potion'}
    assert(#eventHost.run.relics>0,'missing starter relic')
    eventHost:refresh()
    assert(eventRoot:GetChild('potionEntry').visible and eventRoot:GetChild('relicBar').visible)
    eventHost.run.data.rules.events.encounterId='upgrade_shrine'
    local eventPath=Routes.to(eventHost.map,function(n)return n.type=='event'end)
    for i=1,#eventPath-1 do assert(Map.choose(eventHost.map,eventPath[i]))end
    eventHost:refresh();assert(eventHost.mapUI:choose(eventPath[#eventPath]))
    assert(eventRoot:GetChild('nodePanel'):GetChild('eventView').visible,'ordinary event not rendered')
    local function eventInventory()
        assert(eventRoot:GetChild('potionEntry').visible,'PD01 event potion slots missing')
        assert(eventRoot:GetChild('relicBar').visible,'PD01 event relics missing')
        popupSlot(eventHost,eventPicture,3,60,sharedPath(3))
        assert(eventHost:closePotions())
        click(eventPicture,'/relicBar/slot1/hit',61)
        assert(eventHost.relicUI.selectedIndex==1 and eventHost:closeDeck())
    end
    eventInventory()
    assert(eventHost.run.nodeFlow.event.id=='upgrade_shrine','fixture did not open Upgrade Shrine')
    click(eventPicture,'/nodePanel/eventView/option2/hit',70)
    assert(eventHost.run.phase=='map' and eventHost.mode=='node' and eventHost.nodeUI:holding(),
        'event result must stay in front after the rule phase becomes map')
    eventInventory()
    click(eventPicture,'/nodePanel/confirm/hit',71)
    assert(eventHost.mode=='map' and eventRoot:GetChild('potionEntry').visible and eventRoot:GetChild('relicBar').visible)
    popupSlot(eventHost,eventPicture,3,72,sharedPath(3))
    assert(eventHost:closePotions() and eventHost.run.potions[3]=='block_potion')

    local lab,labRoot,labPicture=create(true)
    lab.run.data.rules.events.encounterId='lab'
    lab.run.potions={'speed_potion','block_potion','fire_potion'}
    local labPath=Routes.to(lab.map,function(n)return n.type=='event'end)
    for i=1,#labPath-1 do assert(Map.choose(lab.map,labPath[i]))end
    lab:refresh();assert(lab.mapUI:choose(labPath[#labPath]))
    assert(lab.run.nodeFlow.event.id=='lab' and labRoot:GetChild('potionEntry').visible)
    local _,hiddenHit=labPicture.at(sharedPath(3))
    local stale={touchId=89}
    hiddenHit.listeners.down(stale)
    click(labPicture,'/nodePanel/eventView/option1/hit',80)
    assert(lab.run.nodeFlow.event.stage=='potion_rewards' and labRoot:GetChild('relicBar').visible)
    hiddenHit.listeners.up(stale);hiddenHit.listeners.click(stale)
    assert(not lab.potionUI.visible,'a previous event stage accepted a queued touch')
    local labPopup=popupSlot(lab,labPicture,3,81,sharedPath(3))
    click(labPicture,labPopup..'/discard',82)
    assert(not lab.run.potions[3] and lab.nodeUI.actions['eventView/option1'].enabled,
        'discard must free a slot in the potion reward event')
    click(labPicture,'/nodePanel/eventView/option1/hit',83)
    assert(lab.run.nodeFlow.event.potionOffers[1].claimed and lab.run.potions[3])
    print('MOBILE_EVENT_INVENTORY_PASS')
    return
end

local host,root,picture,screen=create(true)
assert(Run.startCombat(host.run,'raven_adept_solo'));host:refresh();host:update(1)
local battle,ui=root:GetChild('battlePanel'),host.battleUI
host.run.combat.enemies[1].hp=99
host.run.potionSlots=5
host.run.potions={[1]='fire_potion',[2]='energy_potion',[4]='block_potion',[5]='speed_potion'}
host:refresh()
local hits=inspectTop(host,picture,screen,'battlePanel',5,battlePath)
local relicIcon,relicArt=picture.at('/relicBar/slot1/icon')
local nativeRelic,pool=picture.at('/relicBar/slot1/iconArt')
local chrome=picture.at('/battlePanel/topBar/steel')
assert(relicArt.visible or pool.visible,'relic art is not visible')
near(relicIcon.x,nativeRelic.x);near(relicIcon.y,nativeRelic.y)
assert(relicIcon.y+relicIcon.h/2<=chrome.y-chrome.h/2,'relic icon crosses mobile top bar')
local relicHit=picture.at('/relicBar/slot1/hit')
assert(relicHit.y+relicHit.h/2<=chrome.y-chrome.h/2,'relic hit crosses mobile top bar')
near(relicIcon.x,relicHit.x);near(relicIcon.y,relicHit.y)
local _,empty=picture.at(battlePath(3));assert(empty.visible and not empty.interactable)
local opened=popupSlot(host,picture,1,1,battlePath(1))
assert(host.run.potions[1]=='fire_potion')
click(picture,opened..'/use',2)
assert(ui.potionAim and host.run.potions[1]=='fire_potion','targeting must wait for an enemy')
local enemy=F.actorControl(battle,'enemy1'):GetChild('hit')
enemy.click()
assert(not host.run.potions[1])
for i=1,80 do if not ui.busy then break end;host:update(.05)end
popupSlot(host,picture,2,3,battlePath(2))
click(picture,opened..'/use',4)
assert(not host.run.potions[2],'explicit self-use did not consume its own slot')
for i=1,80 do if not ui.busy then break end;host:update(.05)end
local last=popupSlot(host,picture,5,5,battlePath(5))
local dismiss=picture.at(last..'/dismiss')
local target=picture.at(battlePath(5))
picture.tap(target.x,target.y,6,last..'/dismiss')
assert(not select(2,picture.at(last)).visible and host.run.potions[5])
near(dismiss.w,screen[2]/720*1280)
picture.dispatch(target.x,target.y,7,battlePath(5),{'down','drag','up','click'})
assert(not select(2,picture.at(last)).visible and host.run.potions[5],'drag or late click used a potion')
picture.dispatch(target.x,target.y,8,battlePath(5),{'down'})
local gap=(hits[4].x+hits[5].x)/2
noPotionAt(picture,gap,hits[4].y)

-- Keep the real host battle-to-reward transition, then open the card picker by
-- routing a physical screen point into the active reward command.
host.run.combat.enemies[1].hp=0;host.run.combat.phase='victory'
assert(Run.finishCombat(host.run));host:refresh()
local function clearRewardBar(name)
    local bar=picture.at('/battlePanel/topBar/steel')
    local dark=picture.at('/battlePanel/'..name..'/v25RewardField/dark')
    local relic=picture.at('/relicBar/slot1/hit')
    assert(dark.y+dark.h/2<=relic.y-relic.h/2+.001,'reward veil crosses relic band')
end
clearRewardBar('rewardList')
click(picture,'/battlePanel/cardReward',30)
clearRewardBar('rewardStage')
assert(ui.rewardScreen=='cards' and battle:GetChild('rewardStage').visible)
host.run.potions={[1]='speed_potion',[2]='energy_potion',[3]='block_potion',[4]='strength_potion',[5]='fire_potion'}
host:refresh()
hits=inspectTop(host,picture,screen,'battlePanel',5,sharedPath)
picture.dispatch(hits[5].x,hits[5].y,8,sharedPath(5),{'up','click'})
assert(not select(2,picture.at('/potionPanel')).visible,'stale battle touch opened reward potion')
for i,delta in ipairs({{0,0},{-2,0},{2,0},{0,-2},{0,2}})do
    local slot=({1,5,1,5,1})[i]
    local hit=hits[slot]
    local function edge(d,half)return d==0 and 0 or (d>0 and 1 or -1)*(half-math.abs(d))end
    local popup=popupSlot(host,picture,slot,30+i,sharedPath(slot),edge(delta[1],hit.w/2),edge(delta[2],hit.h/2))
    local picker=picture.at('/battlePanel/card1/hit')
    picture.tap(picker.x,picker.y,40+i,popup..'/dismiss')
    assert(ui.rewardScreen=='cards' and not host.run.rewards.cardResolved and host.run.potions[slot])
end
noPotionAt(picture,(hits[1].x+hits[2].x)/2,hits[1].y)
host.run.potions[3]=nil;host:refresh()
noPotionAt(picture,hits[3].x,hits[3].y)
local popup=popupSlot(host,picture,5,52,sharedPath(5))
click(picture,popup..'/discard',53)
assert(host.run.potions[4]=='strength_potion' and not host.run.potions[5] and ui.rewardScreen=='cards')
host:resize(table.unpack(screen));host:refresh()
local resized=picture.at(sharedPath(5))
near(hits[5].x,resized.x);near(hits[5].w,resized.w)
click(picture,'/battlePanel/topBar/battleRoute/hit',54)
assert(host.routeOpen)
inspectTop(host,picture,screen,'mapPanel',5,sharedPath)
assert(host:closeExit())
assert(ui.rewardScreen=='cards')
click(picture,'/deckEntry/open/hit',55)
assert(host.deckUI.visible and host:closeDeck())
click(picture,'/exitEntry/open/hit',56)
assert(host.exitOpen and host:closeExit())
host.run.relics[2]='potion_belt';host:refresh()
local relic=picture.at('/relicBar/slot1/hit')
assert(nonOverlap(relic,picture.at('/nodePanel/pickerView/previous/hit')))
click(picture,'/relicBar/slot1/hit',57,0,-relic.h/2+2)
assert(host.relicUI.visible and host.relicUI.selectedIndex==1 and host:closeDeck())
assert(ui.rewardScreen=='cards')

-- Independently enter each room through the real MapUI/Nodes path and
-- keep three slots in the same physical order even with an empty middle slot.
for _,kind in ipairs({'shop','camp','treasure'})do
    local u,_,g,s=create(true)
    u.run.potionSlots=3;u.run.potions={[1]='speed_potion',[3]='block_potion'}
    local path=Routes.to(u.map,function(n)return n.type==kind and n.roomKind~='boss_treasure'end)
    for i=1,#path-1 do assert(Map.choose(u.map,path[i]))end
    u:refresh();assert(u.mapUI:choose(path[#path]))
    inspectTop(u,g,s,'nodePanel',3,sharedPath)
    local lastSlot=g.at(sharedPath(3))
    near(lastSlot.x,hits[3].x)
    local middle=g.at(sharedPath(2))
    noPotionAt(g,middle.x,middle.y)
    local modal=popupSlot(u,g,3,60,sharedPath(3))
    local outer=g.at(sharedPath(3))
    g.tap(outer.x,outer.y,61,modal..'/dismiss')
    assert(u.mode=='node' and u.run.potions[3]=='block_potion')
end

local desktop,_,d,desktopScreen=create(false)
desktop.run.potions[1]='fire_potion';desktop:refresh()
local old=d.at(sharedPath(1))
local oldArt=d.at('/potionEntry/open/hit/normal/slot1/bottle')
local deskK=desktopScreen[2]/720
near(old.w/deskK,49);near(old.h/deskK,44)
near(oldArt.w/deskK,32*F.Theme.officialAssets.battleHud.potionScale[1])
print(('HUD_GEOMETRY widths px %.2fx%.2f, bottle %.2fx%.2f'):format(hits[1].w,hits[1].h,
    picture.at('/potionEntry/open/hit/normal/slot1/bottle').w,picture.at('/potionEntry/open/hit/normal/slot1/bottle').h))
