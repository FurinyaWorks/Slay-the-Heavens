local H=dofile('tests/lua/support/potion_tap_anonymous_fixture.lua')
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS potion tap - '..name)end
test('explicit Fire Use and a unique confirmed target consume exactly once without playing the selected card',function()
    for _,empty in ipairs({true,false})do
        local host,ui,panel,event,tap,arm,anonymous=H.setup();local battle=host.run.combat
        local hand=H.hand(battle);local strike
        for i,card in ipairs(battle.hand)do if card.cardId=='strike'then strike=i end end
        tap('card'..assert(strike),10);assert(ui.selected)
        arm(1,11);assert(not ui.selected)
        local hp1,hp2=battle.enemies[1].hp,battle.enemies[2].hp
        event('enemy2','down',12);event('enemy2','up',12);anonymous(2,empty and {} or nil)
        assert(host.run.potions[1]==nil and host.run.potions[2]=='fire_potion')
        assert(battle.enemies[1].hp==hp1 and battle.enemies[2].hp==hp2-20)
        anonymous(2,{});event('enemy2','click',12)
        assert(battle.enemies[2].hp==hp2-20);H.unchangedHand(battle,hand)
    end
end)
test('missing Up foreign Click and multiple releases do not lend a potion target',function()
    local host,ui,panel,event,tap,arm,anonymous=H.setup();local battle=host.run.combat
    local hand=H.hand(battle);arm(1,1)
    event('enemy1','down',2);anonymous(1,{});assert(host.run.potions[1]=='fire_potion')
    event('enemy1','endDrag',2);assert(not ui.potionAim)
    arm(1,3);event('enemy1','down',4);event('enemy1','up',4);event('enemy1','click',90)
    assert(host.run.potions[1]=='fire_potion');event('enemy1','endDrag',4)
    arm(1,5);local hp=battle.enemies[2].hp
    event('enemy1','down',6);event('enemy1','up',6);event('enemy2','down',7);event('enemy2','up',7)
    anonymous(1,{});anonymous(2,{});assert(host.run.potions[1]=='fire_potion')
    event('enemy2','down',8);event('enemy2','up',8);anonymous(2,{})
    assert(host.run.potions[1]==nil and battle.enemies[2].hp==hp-20);H.unchangedHand(battle,hand)
end)
test('unknown Up cancels only that sequence and complete noTouch target input is confirmed',function()
    local host,ui,panel,event,tap,arm,anonymous,hit=H.setup();local battle=host.run.combat
    arm(1,1);event('enemy1','down',2);hit(1).listeners.up();anonymous(1,{})
    assert(host.run.potions[1]=='fire_potion')
    event('enemy1','down',3);event('enemy1','up',3);anonymous(1,{})
    assert(host.run.potions[1]==nil)
    host,ui,panel,event,tap,arm,anonymous,hit=H.setup();battle=host.run.combat
    local hp=battle.enemies[1].hp;arm(1,1);hit(1).listeners.down();hit(1).listeners.up();hit(1).click()
    assert(host.run.potions[1]==nil and battle.enemies[1].hp==hp-20 and battle.energy==3)
end)
test('genuinely click-only target keeps its existing potion path',function()
    local host,ui,panel,event,tap,arm,anonymous=H.setup();local battle=host.run.combat
    local hand=H.hand(battle);local hp=battle.enemies[1].hp
    arm(1,1);anonymous(1,nil)
    assert(host.run.potions[1]==nil and battle.enemies[1].hp==hp-20);H.unchangedHand(battle,hand)
end)
print('POTION_TAP_ANONYMOUS_PASS '..passed)
