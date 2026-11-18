local H=dofile('tests/lua/support/potion_tap_anonymous_fixture.lua')
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS potion tap safety - '..name)end
test('A to B aim replacement rejects the old release and preserves the new physical slot',function()
    local host,ui,panel,event,tap,arm,anonymous=H.setup();local battle=host.run.combat
    local hand=H.hand(battle);local hp=battle.enemies[2].hp
    local a=arm(1,1);event('enemy2','down',2);event('enemy2','up',2)
    local b=arm(2,3);assert(a~=b);anonymous(2,{})
    assert(host.run.potions[1]=='fire_potion' and host.run.potions[2]=='fire_potion' and battle.enemies[2].hp==hp)
    ui.potionAim=a;anonymous(2,{});assert(host.run.potions[1]=='fire_potion','old A revived after replacement')
    ui.potionAim=b;event('enemy2','down',4);event('enemy2','up',4);anonymous(2,{})
    assert(host.run.potions[1]=='fire_potion' and host.run.potions[2]==nil and battle.enemies[2].hp==hp-20)
    H.unchangedHand(battle,hand)
end)
test('stale inventory slot actor and turn reject before recovery without replaying the release',function()
    for _,kind in ipairs({'slot','inventory','actor','turn'})do
        local host,ui,panel,event,tap,arm,anonymous=H.setup();local battle=host.run.combat
        local hand=H.hand(battle);local inventory,actor,turn=host.run.potions,battle.enemies[1],battle.turn
        local hp=actor.hp;arm(1,1);event('enemy1','down',2);event('enemy1','up',2)
        if kind=='slot'then inventory[1]='energy_potion'
        elseif kind=='inventory'then host.run.potions=H.F.Combat.copy(inventory)
        elseif kind=='actor'then battle.enemies[1]=H.F.Combat.copy(actor)
        else battle.turn=turn+1 end
        anonymous(1,{});assert(battle.enemies[1].hp==hp and host.run.potions[1]~=nil,kind..' consumed stale potion')
        inventory[1]='fire_potion';host.run.potions=inventory;battle.enemies[1]=actor;battle.turn=turn
        anonymous(1,{});assert(inventory[1]=='fire_potion' and actor.hp==hp,kind..' revived the rejected release')
        event('enemy1','down',3);event('enemy1','up',3);anonymous(1,{})
        assert(host.run.potions[1]==nil and battle.enemies[1].hp==hp-20,kind..' fresh target did not commit once')
        H.unchangedHand(battle,hand)
    end
end)
test('a captured tap that becomes moving loses its release and real potion drag gets no tap fallback',function()
    local host,ui,panel,event,tap,arm,anonymous=H.setup();local battle=host.run.combat
    local hand=H.hand(battle);local aim=arm(1,1);local hp=battle.enemies[1].hp
    event('enemy1','down',2);event('enemy1','up',2);aim.moving=true;anonymous(1,{})
    aim.moving=false;anonymous(1,{});assert(host.run.potions[1]=='fire_potion' and battle.enemies[1].hp==hp)
    event('enemy1','down',3);event('enemy1','up',3);anonymous(1,{})
    assert(host.run.potions[1]==nil and battle.enemies[1].hp==hp-20);H.unchangedHand(battle,hand)
    host,ui,panel,event,tap,arm,anonymous=H.setup();battle=host.run.combat;hand=H.hand(battle)
    for i,actor in ipairs(battle.enemies)do actor.sourcePosition={x=-850+(i-1)*750,y=0}end;host:refresh()
    local enemy=dofile('tests/lua/support/monster_control_fixture.lua')(panel,'enemy2')
    event('potion1','down',4);event('potion1','drag',4,enemy.x,enemy.y)
    assert(ui.potionAim and ui.potionAim.moving,'native potion drag did not exercise moving aim')
    event('enemy1','down',5);event('enemy1','up',5);anonymous(1,{})
    assert(host.run.potions[1]=='fire_potion');H.unchangedHand(battle,hand)
    event('dragLayer','up',4,-620,-350);assert(host.run.potions[1]=='fire_potion')
end)
print('POTION_TAP_ANONYMOUS_SAFETY_PASS '..passed)
