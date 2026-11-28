local F = dofile('tests/lua/support/game_ui_fixture.lua')
local events = {CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up',
    CursorDrag='drag',CursorEndDrag='endDrag'}
local function equal(a,b)
    if type(a)~='table' or type(b)~='table' then return a==b end
    for key,value in pairs(a) do if not equal(value,b[key]) then return false end end
    for key in pairs(b) do if a[key]==nil then return false end end
    return true
end
local function setup(mobile, id)
    local host,root = F.fixture(nil,nil,nil,events,nil,nil,{touchScreen=function()return mobile end})
    assert(F.start(host))
    local Map = require('abyss_map')
    local room
    for _=1,15 do
        local available = Map.available(host.map)
        for _,node in ipairs(available) do if node.type=='camp' then room=node;break end end
        if room then break end
        assert(Map.choose(host.map,available[1].id))
    end
    assert(room)
    host.run.floor=host.map.floor
    host.run.deck = {{cardId=id or 'apparition',uid=1,upgraded=false}}
    assert(F.Nodes.enter(host.run,host.map,room.id))
    host:refresh();host:update(1)
    assert(host.nodeUI:press('campView/forge'))
    for _=1,5 do host.nodeUI:update(0) end
    local panel = root:GetChild('nodePanel')
    local picker = panel:GetChild('pickerView')
    return host,root,panel,picker
end
local function emit(box,kind,event)
    return assert(box:GetChild('hit').listeners[kind], 'missing '..kind)(event)
end
local function readKeywords(text, upgraded)
    assert(text:find('消耗',1,true) and text:find('无实体',1,true), text)
    assert((text:find('虚无',1,true)~=nil) ~= upgraded, text)
end
local host,_,panel,picker = setup(false)
assert(picker:GetChild('forgeFit').items[0]:GetChild('hit').click())
local before,after = picker:GetChild('before'),picker:GetChild('after')
local tip = assert(panel:GetChild('cardKeywordTip'),'forge keyword tooltip missing')
local state = F.Combat.copy(host.run)
emit(before,'enter');host.nodeUI:update(0.2);assert(not tip.visible,'tooltip at 0.2s')
host.nodeUI:update(0.001);assert(tip.visible);readKeywords(tip:GetChild('copy').text,false)
emit(after,'enter');emit(before,'exit');assert(not tip.visible)
host.nodeUI:update(0.201);assert(tip.visible);readKeywords(tip:GetChild('copy').text,true)
local confirm,back=panel:GetChild('confirm'),panel:GetChild('back')
assert(confirm.visible and back.visible)
emit(after,'exit');assert(not tip.visible)
emit(before,'enter');host.nodeUI:update(0.201);assert(tip.visible)
assert(emit(back,'down',{touchId=1})~=false)
emit(back,'up',{touchId=1});assert(emit(back,'click',{touchId=1}))
assert(not tip.visible and not picker:GetChild('before').visible and equal(host.run,state))
assert(picker:GetChild('forgeFit').items[0]:GetChild('hit').click())
emit(before,'enter');host.nodeUI:update(0.201);assert(tip.visible)
host.nodeUI:setVisible(false);assert(not tip.visible);assert(equal(host.run,state))
print('PASS forge hover timing, independent keywords, stale exit, and room hide')

host,_,panel,picker = setup(false,'strike')
assert(picker:GetChild('forgeFit').items[0]:GetChild('hit').click())
tip = panel:GetChild('cardKeywordTip')
local noKeywords = picker:GetChild('before')
if noKeywords:GetChild('hit').visible then emit(noKeywords,'enter') end
host.nodeUI:update(1);assert(not tip.visible)
print('PASS a card without keywords opens no tooltip')

local root
host,root,panel,picker = setup(true)
local gridCard = picker:GetChild('forgeFit').items[0]
state = F.Combat.copy(host.run)
local touch = {touchId=7,GetUIPos=function()return 450,380 end}
emit(gridCard,'down',touch);host.nodeUI:update(0.1);emit(gridCard,'endDrag',touch);host.nodeUI:update(1)
assert(not host.deckUI.visible,'cancelled hold opened keywords')
emit(gridCard,'down',touch);host.nodeUI:update(0.349);assert(not host.deckUI.visible)
host.nodeUI:update(0.002);assert(host.deckUI.visible,'long press did not open keywords')
emit(gridCard,'up',touch);assert(not emit(gridCard,'click',touch));assert(host.deckUI.visible,'release dismissed keywords')
readKeywords(root:GetChild('deckPanel'):GetChild('details').text,false)
assert(not host.nodeUI.selected and equal(host.run,state),'inspection selected or changed the card')
assert(host:closeDeck());assert(not host.deckUI.visible and equal(host.run,state))
assert(not emit(gridCard,'click',touch),'old trailing click after returning selected the card')
assert(not host.nodeUI.selected and equal(host.run,state))
print('PASS mobile cancel, long press, release, and existing return')

host,root = F.fixture(nil,nil,nil,events,nil,nil,{touchScreen=function()return false end})
assert(F.start(host))
local routes=dofile('tests/lua/support/map_routes.lua')
local path=routes.to(host.map,function(node)return node.type=='shop' end)
local Map=require('abyss_map')
for i=1,#path-1 do assert(Map.choose(host.map,path[i])) end
host.run.floor=host.map.floor
assert(F.Nodes.enter(host.run,host.map,path[#path]));host:refresh()
assert(F.click(root,'nodePanel','merchant/talk'))
dofile('tests/lua/support/shop_timeline.lua')(host)
panel=root:GetChild('nodePanel')
tip=panel:GetChild('cardKeywordTip')
local shop=panel:GetChild('shopView')
state=F.Combat.copy(host.run)
local shown
for i=1,7 do
    local stock=shop:GetChild('card'..i)
    emit(stock,'enter');host.nodeUI:update(0.2);assert(not tip.visible)
    host.nodeUI:update(0.001)
    if tip.visible then
        shown=true
        assert(#tip:GetChild('copy').text>0 and tip:GetChild('copy').text:find('</color>',1,true))
    end
    emit(stock,'exit');assert(not tip.visible)
end
assert(shown and equal(host.run,state),'the deterministic shop must expose a keyword without changing a quote')
print('PASS native shop whole-card hover and exit with unchanged offers')

local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local battle,emitBattle
host,battle,panel,emitBattle=H.setup({'true_grit','true_grit'})
tip=panel:GetChild('statusInfo')
state=F.Combat.copy(host.run)
emitBattle('card1','enter',1)
battle:update(.2);assert(not tip.visible)
battle:update(.001);assert(tip.visible and battle.info.kind=='card','hand hover beyond 0.2s must show keywords')
emitBattle('card1','exit',1);assert(not tip.visible and equal(host.run,state))
for _,enemy in ipairs(host.run.combat.enemies) do enemy.hp=0 end
assert(H.Run.finishCombat(host.run))
host.run.rewards.cards={'true_grit'}
host:refresh()
panel:GetChild('cardReward').click();assert(battle.rewardScreen=='cards')
state=F.Combat.copy(host.run)
emitBattle('card1','enter',1)
battle:update(.2);assert(not tip.visible)
battle:update(.001);assert(tip.visible and battle.info.kind=='rewardCard','reward hover beyond 0.2s must show keywords')
emitBattle('card1','exit',1);assert(not tip.visible and equal(host.run,state))
print('PASS battle and reward whole-card hover timing and unmodified Run')
