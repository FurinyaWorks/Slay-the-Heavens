local H=assert(loadfile('tests/lua/support/mobile_run_hud_geometry.lua'))('helpers')
local Run=require('abyss_run')
local Theme=require('abyss_theme')
local Map=require('abyss_map')
local Routes=dofile('tests/lua/support/map_routes.lua')
local advanceShop=dofile('tests/lua/support/shop_timeline.lua')
local limit=2147483647
local function enter(host,kind)
    local path=Routes.to(host.map,function(node)return node.type==kind end)
    for i=1,#path-1 do assert(Map.choose(host.map,path[i]))end
    host:refresh()
    assert(host.mapUI:choose(path[#path]))
end
local values={0,9,10,28,99,100,288,999,1000,limit}

local function expectText(picture,path,text,scale,screen,font,stageHalf)
    font=font or 18
    stageHalf=stageHalf or 600
    local box,control=picture.at(path)
    assert(control.visible and control.text==text,path..' expected '..text..', got '..tostring(control.text))
    -- Same ASCII advance allowance as the native text readability contract,
    -- at preferred size, plus edge padding. A second line would be clipped.
    assert(box.w/scale>=#text*.6*font+8,path..' native frame too narrow for '..text)
    assert(box.h/scale>=font*1.45+4,path..' clips a single line vertically')
    assert(box.x-box.w/2>=screen[1]/2-stageHalf*scale-.001 and box.x+box.w/2<=screen[1]/2+stageHalf*scale+.001,
        path..' crosses the stage safe bounds')
    return box
end

local mobile=...=='numbers-phone'
local host,root,picture,screen=H.create(mobile)
local run=host.run
local scale=screen[2]/720
for _,value in ipairs(values)do
    local delta=value-run.gold
    if delta>=0 then Run.gainGold(run,delta) else run.gold=value end
    host:refresh()
    local cash=expectText(picture,'/mapPanel/resources/gold',string.format('%.0f',value),scale,screen)
    local nextSlot=picture.at('/potionEntry/slot1/hit')
    assert(H.nonOverlap(cash,nextSlot),'gold text frame overlaps first potion target')
end
assert(Run.increaseMaxHp(run,limit-run.maxHp))
host:refresh()
local health=expectText(picture,'/mapPanel/resources/hp','2147483647/2147483647',scale,screen)
assert(H.nonOverlap(health,picture.at('/mapPanel/resources/goldIcon')),'HP frame overlaps the gold marker')
local details=root:GetChild('deckPanel'):GetChild('details')
H.click(picture,'/mapPanel/resourceHints/gold/hit',1)
assert(host.deckUI.visible and details.text:find('当前金币 2147483647。',1,true))
assert(host:closeDeck())

local deck=run.deck
run.deck={}
for i=1,1000 do run.deck[i]=deck[1]end
host:refresh()
local deckCount=expectText(picture,'/deckEntry/open/hit/normal/officialBattleHud/count','1000',scale,screen)
assert(H.nonOverlap(deckCount,picture.at('/exitEntry/open/hit')),'deck amount overlaps settings target')
run.deck=deck

local relics,counters=run.relics,run.relicCounters
run.relics,run.relicCounters={'circlet','burning_blood'},{}
for _,value in ipairs({100000,limit})do
    run.relicCounters.circlet=value
    host:refresh()
    local amount=expectText(picture,'/relicBar/slot1/counter',string.format('%.0f',value),scale,screen,Theme.font.small,mobile and 600 or 640)
    local span=mobile and 2 or (value==limit and 3 or 2)
    assert(H.nonOverlap(amount,picture.at('/relicBar/slot'..(span+1)..'/hit')),'relic amount overlaps next relic')
end
H.click(picture,'/relicBar/slot1/hit',2)
assert(host.relicUI.selected.status=='计数 2147483647')
local status,control=picture.at('/relicPanel/single/status')
assert(control.visible and control.text==host.relicUI.selected.status and status.h/scale>=36)
assert(host:closeDeck())
run.relics,run.relicCounters=relics,counters

assert(Run.startCombat(run,'raven_adept_solo'))
run.combat.player.hp,run.combat.player.maxHp,run.combat.player.gold=123,456,288
host:refresh()
expectText(picture,'/battlePanel/player','123/456',scale,screen)
expectText(picture,'/battlePanel/piles','288',scale,screen)
H.click(picture,'/battlePanel/resourceHints/gold/hit',3)
assert(host.deckUI.visible and details.text:find('当前金币 288。',1,true))
assert(host:closeDeck())
H.click(picture,'/battlePanel/topBar/battleRoute/hit',4)
assert(host.routeOpen)
expectText(picture,'/mapPanel/resources/gold','288',scale,screen)
expectText(picture,'/mapPanel/resources/hp','123/456',scale,screen)
assert(host:closeExit())

for _,enemy in ipairs(run.combat.enemies)do enemy.hp=0 end
run.combat.phase='victory'
assert(Run.finishCombat(run))
host:refresh()
local before,reward=run.gold,run.rewards.gold
assert(reward>0)
H.click(picture,'/battlePanel/goldReward',5)
assert(run.gold==before+reward)
expectText(picture,'/battlePanel/piles',string.format('%.0f',run.gold),scale,screen)

for _,spec in ipairs({{'golden_shrine',100},{'cleric',-35}})do
    local eventHost,_,eventPicture=H.create(mobile)
    local rules=eventHost.run.data.rules.events
    local previousEvent=rules.encounterId
    rules.encounterId=spec[1]
    if spec[2]<0 then eventHost.run.hp=10 end
    enter(eventHost,'event')
    rules.encounterId=previousEvent
    local initial=eventHost.run.gold
    H.click(eventPicture,'/nodePanel/eventView/option1/hit',6)
    assert(eventHost.run.gold==initial+spec[2] and eventHost.mode=='node')
    expectText(eventPicture,'/nodePanel/gold',string.format('%.0f',eventHost.run.gold),scale,screen)
    local floor=expectText(eventPicture,'/nodePanel/title',tostring(eventHost.run.floor),scale,screen)
    assert(H.nonOverlap(floor,eventPicture.at('/nodePanel/runRoute/hit')),'floor amount overlaps map target')
end

local shopHost,_,shopPicture=H.create(mobile)
local shopRun=shopHost.run
Run.gainGold(shopRun,1000)
enter(shopHost,'shop')
H.click(shopPicture,'/nodePanel/merchant/talk/hit',7)
advanceShop(shopHost.nodeUI)
local price=shopRun.nodeFlow.cards[1].price
local balance,deckSize=shopRun.gold,#shopRun.deck
H.click(shopPicture,'/nodePanel/shopView/card1/hit',8)
H.click(shopPicture,'/nodePanel/confirm/hit',9)
assert(shopRun.gold==balance-price and #shopRun.deck==deckSize+1)
expectText(shopPicture,'/nodePanel/gold',string.format('%.0f',shopRun.gold),scale,screen)
print('RUN_HUD_PASS '..(...))
