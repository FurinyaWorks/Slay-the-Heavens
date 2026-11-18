local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local F=H.F
local host,ui,panel,event,tap,drain,cover=H.setup({'strike','strike','defend'},{'cultist','jaw_worm'},{touchScreen=function()return true end})
local battle=host.run.combat
local function slot(id)
    for i,c in ipairs(battle.hand) do if c.cardId==id then return 'card'..i,c.uid end end
    error('card unavailable: '..id)
end
local function hit(name)return F.actorControl(panel,name):GetChild('hit')end
local function anonymous(name)hit(name).click({})end
local actor=F.actorControl(panel,'enemy1')
local strike=slot('strike')
tap(strike,1);event('enemy1','down',2);cover()
assert(F.actorControl(panel,'enemy1')==actor and actor.alive,'Deck round trip replaced actor binding')
print('REVIEW PASS retained actor identity on Deck')
tap(strike,3)
event('enemy1','down',4);event('enemy2','down',5);event('enemy1','up',4)
anonymous('enemy1');event('enemy2','up',5);anonymous('enemy2')
assert(battle.energy==3,'post-cover overlapping pointers were accepted')
print('REVIEW PASS post-cover fresh multitouch rejected')
event('enemy1','down',6);assert(ui.cardAim,'Down did not create owned preview')
host:refresh();assert(ui.active and ui.cardAim,'active-to-active refresh erased owned preview')
event('enemy1','up',6);anonymous('enemy1')
assert(battle.energy==2 and #battle.discard==1,'ordinary refresh erased the completing contact')
print('REVIEW PASS active-to-active refresh preserves genuine target contact')
drain()
strike=slot('strike');tap(strike,7);event('enemy1','down',2);cover()
local defend,uid=slot('defend')
event(defend,'down',2);event(defend,'up',2);anonymous(defend)
assert(ui.selected==uid and battle.energy==2)
event('enemy1','up',2);event('enemy1','endDrag',2);event('enemy1','click',2)
assert(ui.selected==uid and not ui.info)
event('playArea','down',8);event('playArea','up',8);anonymous('playArea')
assert(battle.energy==1 and #battle.discard==2 and battle.player.block>=5,'fresh cross-control selection did not play Defend')
print('REVIEW PASS cross-control reused ID makes real Defend transaction after stale tail')
drain()

host,ui,panel,event,tap,drain=H.setup({'strike'},{'cultist'},{touchScreen=function()return true end})
battle=host.run.combat
tap('card1',1);event('enemy1','down',2)
local original=panel.SetVisible
local reentered=false
panel.SetVisible=function(self,active)
    if not active and not reentered then
        reentered=true
        event('enemy1','up',2);anonymous('enemy1')
        error('injected visibility error')
    end
    return original(self,active)
end
local ok,why=pcall(ui.setActive,ui,false,true,true)
assert(not ok and tostring(why):find('injected visibility error',1,true) and reentered)
assert(not ui.active and battle.energy==3,'throwing native hide let old tail commit')
panel.SetVisible=original
ui:setActive(false,true,true)
event('enemy1','down',4)
ui:setActive(false,true,true)
local showReentered=false
panel.SetVisible=function(self,active)
    if active and not showReentered then
        showReentered=true
        event('enemy1','up',4);anonymous('enemy1')
        assert(battle.energy==3,'old hidden Down committed from native show reentry')
    end
    return original(self,active)
end
ui:setActive(true,true,true)
panel.SetVisible=original
assert(showReentered,'native show reentry was not exercised')
ui:render()
event('enemy1','up',4);anonymous('enemy1')
assert(battle.energy==3,'hidden Down revived after repeated false and deferred resume')
if not ui.selected then tap('card1',5)end
event('enemy1','down',6);event('enemy1','up',6);anonymous('enemy1')
assert(battle.energy==2,'fresh contact failed after failed hide/repeated false/deferred resume')
print('REVIEW PASS native hide error, repeated false, deferred render')
