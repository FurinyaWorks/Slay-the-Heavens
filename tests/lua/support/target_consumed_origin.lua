-- Module-boundary receipt fixture: real InputState/Gestures/Run, native hit controls.
-- The caller supplies the existing named consumption receipt; no popup code is copied.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Input=require('abyss_battle_input_state')
local Gestures=require('abyss_battle_card_gestures')
local Targets=require('abyss_battle_target_bindings')
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS consumed origin - '..name)end
local function setup()
    local run=Run.new(F.Data,1);assert(Run.startCombat(run,'cultist_solo'))
    run.combat=F.Combat.new(F.Data,{deck={'strike'},enemies={'cultist','jaw_worm'}})
    local owner={run=run,active=true,busy=false,dragEnabled=true,selectionEpoch=1,
        selected=run.combat.hand[1].uid,suppressClick=false,commands=0}
    function owner:render()end
    function owner:playSelected(target)
        self.commands=self.commands+1
        local ok,why=Run.play(self.run,self.selected,target);assert(ok,why)
        self.selected=nil;return true
    end
    local ownership={cardInputs={},potionInputs={},actionInputs={},enemyInputs={}}
    local controls={}
    for i=1,5 do controls['enemy'..i]=F.control({name='enemy'..i,kind='container',children={
        {name='hit',kind='cursorArea',size={100,100}}}})end
    local host={stage={GetChild=function(_,name)return controls[name]end},options={embedded=true},platform={},
        clickEvent='click',cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag',CursorDrag='drag'}}
    local deps=Input.install(owner,ownership,host,{})
    deps.closeInfo=function()return false end
    for name,fn in pairs(Gestures.install(owner,ownership,host,deps))do deps[name]=fn end
    Targets.install(owner,ownership,host,deps).bindEnemyControls()
    local function emit(slot,kind,touch)
        local hit=controls['enemy'..slot]:GetChild('hit')
        return assert(hit.listeners[kind])({touchId=touch})
    end
    local function anonymous(slot)return controls['enemy'..slot]:GetChild('hit').click({})end
    return owner,ownership,emit,anonymous,deps
end
test('post-Down receipt retires the old origin before anonymous tails or a fresh different ID',function()
    local owner,receipt,event,anonymous=setup()
    event(1,'down',2);receipt.releasedDragTouch=2
    anonymous(1);event(1,'click',2);assert(owner.commands==0 and owner.run.combat.energy==3)
    event(2,'down',4);anonymous(2);assert(owner.commands==0,'fresh Down borrowed an old anonymous tail without Up')
    event(2,'up',4);anonymous(2)
    assert(owner.commands==1 and owner.run.combat.energy==2)
end)
test('post-Down receipt also invalidates a pending release after same-ID preflight reclaim',function()
    for _,oldMarker in ipairs({false,true})do
        local owner,receipt,event,anonymous=setup()
        if oldMarker then receipt.releasedDragTouch=2 end
        event(1,'down',2);assert(receipt.releasedDragTouch==nil)
        event(1,'up',2);receipt.releasedDragTouch=2;anonymous(1)
        assert(owner.commands==0,'consumed pending release remained actionable')
        event(2,'down',4);event(2,'up',4);anonymous(2);assert(owner.commands==1)
    end
end)
test('pre-Down old matching marker cannot retire a genuine busy-period contact',function()
    local owner,receipt,event,anonymous=setup()
    receipt.releasedDragTouch=2;owner.busy=true;event(1,'down',2);owner.busy=false
    event(2,'down',4);event(2,'up',4);anonymous(2)
    assert(owner.commands==0,'old marker was treated as proof that a newer finger ended')
    event(1,'up',2);event(2,'down',4);event(2,'up',4);anonymous(2);assert(owner.commands==1)
end)
test('fresh same-ID preflight clears the old receipt and preserves its new live contact',function()
    local owner,receipt,event,anonymous=setup()
    receipt.releasedDragTouch=2;event(1,'down',2);assert(receipt.releasedDragTouch==nil)
    event(2,'down',4);event(2,'up',4);anonymous(2);assert(owner.commands==0)
    event(1,'up',2);event(1,'click',2);assert(owner.commands==1)
end)
test('receipt retirement stays on its named enemy origin and retains another live finger',function()
    local owner,receipt,event,anonymous=setup()
    event(1,'down',5);event(2,'down',2);receipt.releasedDragTouch=2;anonymous(2)
    event(2,'down',4);event(2,'up',4);anonymous(2);assert(owner.commands==0,'another live origin was globally cleared')
    event(1,'up',5);event(1,'click',5);assert(owner.commands==1)
end)
test('without consumption proof an unmatched live origin still makes a new ID ambiguous',function()
    local owner,receipt,event,anonymous=setup()
    event(1,'down',2);event(2,'down',4);event(2,'up',4);anonymous(2)
    assert(owner.commands==0)
    event(1,'endDrag',2);event(2,'down',4);event(2,'up',4);anonymous(2);assert(owner.commands==1)
end)
test('a reentrant Down cannot regain anonymous eligibility after a concurrent origin ends',function()
    local owner,receipt,event,anonymous,deps=setup()
    local original=deps.closeInfo;local reentered=false
    deps.closeInfo=function()
        if not reentered then reentered=true;event(1,'down',3)end
        return false
    end
    event(1,'down',2);deps.closeInfo=original
    event(1,'up',3);anonymous(1);event(1,'up',2);anonymous(1)
    assert(reentered and owner.commands==0,'outer Down regained eligibility lost during native reentry')
    event(1,'down',4);event(1,'up',4);anonymous(1);assert(owner.commands==1)
end)
print('TARGET_CONSUMED_ORIGIN_PASS '..passed)
