-- Actual Host/Run, native controls, and actor ownership; no gameplay rules replaced.
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local enemies={'cultist','jaw_worm','acid_slime_s'}
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS anonymous target - '..name)end
local function setup(count)
    local rows={};for i=1,count do rows[i]=enemies[i]end
    return H.setup({'strike'},rows,{touchScreen=function()return true end})
end
local function hit(panel,name)return H.F.actorControl(panel,name):GetChild('hit')end
for count=1,3 do
    test(count..' enemies identified Up accepts anonymous Click exactly once',function()
        local host,ui,panel,event,tap=setup(count)
        local battle=host.run.combat;local uid=battle.hand[1].uid
        tap('card1',7);local target='enemy'..count;local hp=battle.enemies[count].hp
        event(target,'down',8);assert(ui.cardAim and ui.cardAim.uid==uid)
        event(target,'up',8);hit(panel,target).click(count==2 and {} or nil)
        assert(battle.energy==2 and battle.enemies[count].hp==hp-6 and battle.discard[1].uid==uid)
        hit(panel,target).click({});event(target,'click',8)
        assert(battle.energy==2 and #battle.discard==1,'late Click repeated the play')
    end)
end
test('preview render preserves card/target identity and same touch can start a fresh sequence',function()
    local host,ui,panel,event,tap=setup(3);local battle=host.run.combat
    tap('card1',7);local epoch=ui.selectionEpoch;local hp=battle.enemies[2].hp
    event('enemy2','down',7);ui:render();event('enemy2','up',7);hit(panel,'enemy2').click({})
    assert(ui.selectionEpoch==epoch and battle.energy==2 and battle.enemies[2].hp==hp-6)
end)
test('named Down/Click and Down/Up/Click keep existing behavior',function()
    for _,up in ipairs({true,false})do
        local host,ui,panel,event,tap=setup(2);local battle=host.run.combat
        tap('card1',7);event('enemy2','down',8)
        if up then event('enemy2','up',8)end
        event('enemy2','click',8);assert(battle.energy==2 and #battle.discard==1)
    end
end)
test('a completed named Down/Click does not retain an active contact into the next card',function()
    local host,ui,panel,event,tap,drain=H.setup({'strike','strike'},{'cultist'}, {touchScreen=function()return true end})
    local battle=host.run.combat
    tap('card1',1);event('enemy1','down',2);event('enemy1','click',2);drain()
    tap('card1',3);event('enemy1','down',4);event('enemy1','up',4);hit(panel,'enemy1').click({})
    assert(battle.energy==1 and #battle.discard==2)
end)
print('TARGET_ANONYMOUS_CLICK_PASS '..passed)
