local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS anonymous terminal - '..name)end
local function setup(selected,enemies)
    local host,ui,panel,event,tap=H.setup({'strike'},enemies or {'cultist'}, {touchScreen=function()return true end})
    if selected~=false then tap('card1',1)end
    local function hit(name)return H.F.actorControl(panel,name or 'enemy1'):GetChild('hit')end
    local function click(name)hit(name).click({})end
    return host.run.combat,event,tap,hit,click
end
test('unique unknown Exit EndDrag and Up cancel old tails and permit a fresh confirmed origin',function()
    for _,kind in ipairs({'exit','endDrag','up'})do for _,payload in ipairs({'nil','empty'})do
        local battle,event,tap,hit,click=setup()
        event('enemy1','down',2)
        if payload=='empty'then hit().listeners[kind]({})else hit().listeners[kind]()end
        event('enemy1','up',2);click();event('enemy1','click',2)
        assert(battle.energy==3,kind..' lent old ownership')
        event('enemy1','down',3);click();assert(battle.energy==3,'late anonymous tail borrowed a fresh Down without Up')
        event('enemy1','up',3);click();assert(battle.energy==2,kind..' left an orphan contact')
    end end
end)
test('a unique pending release can be cancelled while complete noTouch input still plays',function()
    for _,kind in ipairs({'exit','endDrag'})do
        local battle,event,tap,hit,click=setup()
        event('enemy1','down',2);event('enemy1','up',2);hit().listeners[kind]()
        click();event('enemy1','click',2);assert(battle.energy==3,'unknown terminal retained an actionable old release')
        event('enemy1','down',3);event('enemy1','up',3);click();assert(battle.energy==2)
    end
    local battle,event,tap,hit=setup();hit().listeners.down();hit().listeners.up();hit().click()
    assert(battle.energy==2,'complete noTouch origin regressed')
end)
test('multiple active fingers take priority over the single latest held token',function()
    local battle,event,tap,hit,click=setup()
    event('enemy1','down',2);event('enemy1','down',3);hit().listeners.exit()
    event('enemy1','up',3);event('enemy1','click',3)
    assert(battle.energy==2,'unknown terminal guessed and retired the explicitly named finger')
end)
test('multiple unknown origins cannot anonymously submit and recover once both finish',function()
    for _,kind in ipairs({'endDrag','up'})do
        local battle,event,tap,hit,click=setup()
        event('enemy1','down',2);event('enemy1','down',3);hit().listeners[kind]()
        event('enemy1','up',3);click();assert(battle.energy==3,'unknown multi-pointer terminal guessed the latest finger')
        event('enemy1','up',2);click();assert(battle.energy==3)
        event('enemy1','down',4);event('enemy1','up',4);click();assert(battle.energy==2,'finished origins blocked fresh input')
    end
end)
test('fresh named Down reclaims only its own old sequence before checking other live contacts',function()
    local battle,event,tap,hit,click=setup(false)
    event('enemy1','down',2);tap('card1',3);click();assert(battle.energy==3,'old lower-control tail played a new card')
    event('enemy1','down',2);click();assert(battle.energy==3)
    event('enemy1','up',2);click();assert(battle.energy==2,'same-ID new physical sequence retained an orphan')
    battle,event,tap,hit,click=setup()
    event('enemy1','down',2);event('enemy1','down',3);event('enemy1','down',3);event('enemy1','up',3);click()
    assert(battle.energy==3,'same-ID reclaim cleared another live finger')
    event('enemy1','up',2);click();assert(battle.energy==3)
    event('enemy1','down',2);event('enemy1','up',2);click();assert(battle.energy==2)
end)
test('foreign named terminals do not steal a fresh pointer and late unknown cancellation stays conservative',function()
    local battle,event,tap,hit,click=setup()
    event('enemy1','down',2);event('enemy1','exit',80);event('enemy1','endDrag',80)
    event('enemy1','up',2);click();assert(battle.energy==2)
    battle,event,tap,hit,click=setup()
    event('enemy1','down',2);hit().listeners.exit();event('enemy1','down',3);hit().listeners.endDrag()
    event('enemy1','up',3);click();assert(battle.energy==3,'late unknown terminal lent the cancelled new release')
    event('enemy1','down',4);event('enemy1','up',4);click();assert(battle.energy==2)
end)
test('unknown cancellation stays local to its control',function()
    local battle,event,tap,hit,click=setup(true,{'cultist','jaw_worm'})
    event('enemy1','down',2);event('enemy2','down',3);hit('enemy1').listeners.endDrag()
    event('enemy2','up',3);event('enemy2','click',3)
    assert(battle.energy==2 and battle.enemies[1].hp==52,'local cancellation discarded or redirected the other actor pointer')
end)
print('TARGET_ANONYMOUS_TERMINAL_PASS '..passed)
