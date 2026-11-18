-- Independent read-only product review; production baseline 33d71575.
-- Generate current data/UI into a temporary directory, then run with
-- LUA_PATH='src/lua/?.lua;<temporary generated directory>/?.lua;;'.
-- This probe intentionally exits nonzero on the baseline: the first two
-- cases demonstrate valid named Down/Up followed by anonymous Click loss.
package.path='src/lua/?.lua;'..package.path
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local passed,failed=0,0
local function test(name,fn)
    local ok,why=pcall(fn)
    if ok then passed=passed+1;print('PASS '..name)
    else failed=failed+1;print('FAIL '..name..' '..tostring(why))end
end
local function setup()
    return H.setup({'defend','defend'})
end
local function select(event)
    event('card1','down',17);event('card1','up',17);event('card1','click',17)
end
local function field(event,kind,touch)
    event('playArea',kind,touch,0,0)
end

test('RED unique released card accepts anonymous Click exactly once',function()
    local h,ui,_,event=setup()
    local uid=h.run.combat.hand[1].uid
    event('card1','down',17);event('card1','up',17);event('card1','click',nil)
    assert(ui.selected==uid,'valid unique released card lost its anonymous Click')
    event('card1','click',nil)
    assert(ui.selected==uid,'duplicate anonymous Click cancelled the selection')
    assert(h.run.combat.energy==3 and #h.run.combat.hand==2)
end)

test('RED unique released field accepts anonymous Click exactly once',function()
    local h,_,_,event=setup();select(event)
    field(event,'down',18);field(event,'up',18);field(event,'click',nil)
    assert(h.run.combat.energy==2 and #h.run.combat.hand==1,'valid field confirmation lost anonymous Click')
    field(event,'click',nil)
    assert(h.run.combat.energy==2 and #h.run.combat.hand==1,'duplicate anonymous Click submitted twice')
end)

test('named card and field Click retain compatibility',function()
    local h,ui,_,event=setup();select(event)
    assert(ui.selected==h.run.combat.hand[1].uid)
    field(event,'down',18);field(event,'up',18);field(event,'click',18)
    assert(h.run.combat.energy==2 and #h.run.combat.hand==1)
end)

test('fully anonymous card and field sequence retains compatibility',function()
    local h,ui,_,event=setup()
    event('card1','down',nil);event('card1','up',nil);event('card1','click',nil)
    assert(ui.selected==h.run.combat.hand[1].uid)
    field(event,'down',nil);field(event,'up',nil);field(event,'click',nil)
    assert(h.run.combat.energy==2 and #h.run.combat.hand==1)
end)

test('held card without confirmed Up rejects anonymous Click',function()
    local h,ui,_,event=setup()
    event('card1','down',17);event('card1','click',nil)
    assert(ui.selected==nil and #h.run.combat.hand==2 and h.run.combat.energy==3)
end)

test('foreign named Click rejects released card',function()
    local _,ui,_,event=setup()
    event('card1','down',17);event('card1','up',17);event('card1','click',18)
    assert(ui.selected==nil)
end)

test('EndDrag cancellation rejects anonymous field Click',function()
    local h,_,_,event=setup();select(event)
    field(event,'down',18);field(event,'up',18);field(event,'endDrag',18);field(event,'click',nil)
    assert(h.run.combat.energy==3 and #h.run.combat.hand==2)
end)

test('overlapping same field pointers reject anonymous Click',function()
    local h,_,_,event=setup();select(event)
    field(event,'down',18);field(event,'down',19);field(event,'up',19);field(event,'click',nil)
    assert(h.run.combat.energy==3 and #h.run.combat.hand==2,'first field pointer remains physically held')
end)

test('overlapping card and field pointer rejects anonymous field Click',function()
    local h,_,_,event=setup();select(event)
    field(event,'down',18)
    event('card2','down',19)
    field(event,'up',18);field(event,'click',nil)
    assert(h.run.combat.energy==3 and #h.run.combat.hand==2)
end)

test('stale turn rejects anonymous field Click',function()
    local h,_,_,event=setup();select(event)
    field(event,'down',18);field(event,'up',18)
    h.run.combat.turn=h.run.combat.turn+1
    field(event,'click',nil)
    assert(h.run.combat.energy==3 and #h.run.combat.hand==2)
    h.run.combat.turn=h.run.combat.turn-1
    field(event,'click',nil)
    assert(h.run.combat.energy==3,'stale anonymous Click must not replay after turn recovery')
end)

test('busy at Click rejects field submission',function()
    local h,ui,_,event=setup();select(event)
    field(event,'down',18);field(event,'up',18);ui.busy=true
    field(event,'click',nil)
    assert(h.run.combat.energy==3 and #h.run.combat.hand==2)
    ui.busy=false;field(event,'click',nil)
    assert(h.run.combat.energy==3,'blocked anonymous Click must not replay after busy recovery')
end)

print('FREEZE_P0_REVIEW passed='..passed..' failed='..failed)
assert(failed==0,'expected baseline RED: '..failed..' anonymous Click regressions')
