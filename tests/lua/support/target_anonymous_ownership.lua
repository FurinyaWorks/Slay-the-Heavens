local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS anonymous ownership - '..name)end
local function setup()
    local host,ui,panel,event,tap=H.setup({'strike'},{'cultist','jaw_worm'}, {touchScreen=function()return true end})
    tap('card1',1)
    local function anonymous(target)H.F.actorControl(panel,target):GetChild('hit').click({})end
    return host,ui,panel,event,tap,anonymous
end
test('no Up, foreign active and concurrent releases cannot supply anonymous ownership',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    event('enemy1','down',2);anonymous('enemy1');assert(battle.energy==3)
    event('enemy1','endDrag',2)
    event('enemy1','down',3);event('enemy1','up',3)
    event('enemy2','down',4);anonymous('enemy1');assert(battle.energy==3)
    event('enemy2','up',4);anonymous('enemy2');assert(battle.energy==3)
    tap('card1',5);tap('card1',6)
    event('enemy1','down',7);event('enemy1','up',7)
    event('enemy2','down',8);event('enemy2','up',8)
    anonymous('enemy1');anonymous('enemy2');assert(battle.energy==3)
    tap('enemy2',9);assert(battle.energy==2,'named fresh input did not recover')
end)
test('same control multi-touch remains ambiguous until all fingers finish',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    event('enemy1','down',2);event('enemy1','down',3);event('enemy1','up',3)
    anonymous('enemy1');assert(battle.energy==3)
    event('enemy1','up',2);anonymous('enemy1');assert(battle.energy==3)
    event('enemy1','down',4);event('enemy1','up',4);anonymous('enemy1')
    assert(battle.energy==2,'fresh unambiguous pointer did not recover')
end)
test('active card or action pointer cannot lend its anonymous Click to an enemy',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    event('enemy1','down',2);event('enemy1','up',2)
    event('endTurn','down',3);anonymous('enemy1');assert(battle.energy==3 and battle.turn==1)
    event('endTurn','endDrag',3)
    tap('card1',4);tap('card1',5)
    event('enemy1','down',6);event('enemy1','up',6)
    event('card1','down',7);anonymous('enemy1');assert(battle.energy==3)
    event('card1','endDrag',7);tap('card1',8)
    assert(battle.energy==3,'cancelling another pointer played the target card')
end)
test('target terminal events invalidate anonymous releases without changing named compatibility',function()
    for _,kind in ipairs({'exit','drag','endDrag'})do
        local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
        event('enemy1','down',2);event('enemy1',kind,2);event('enemy1','up',2);anonymous('enemy1')
        assert(battle.energy==3,kind..' anonymously submitted')
        event('enemy1','down',3);event('enemy1','up',3);anonymous('enemy1')
        assert(battle.energy==2,kind..' blocked fresh recovery')
    end
end)
print('TARGET_ANONYMOUS_OWNERSHIP_PASS '..passed)
