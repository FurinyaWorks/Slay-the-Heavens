-- Real generated Host regression for mixed native pointer metadata.
-- No input queue: every command is submitted after the previous feedback unlocks.
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local passed,failed=0,0
local function test(name,fn)
    local ok,why=pcall(fn)
    if ok then passed=passed+1;print('PASS pointer identity '..name)
    else failed=failed+1;print('FAIL pointer identity '..name..': '..tostring(why))end
end
local function setup(deck,enemies)
    return H.setup(deck or {'defend','defend'},enemies,{touchScreen=function()return true end})
end
local function tap(event,name,touch)
    local x,y
    if name=='playArea'then x,y=0,0 end
    event(name,'down',touch,x,y);event(name,'up',touch,x,y)
    event(name,'click',touch,x,y)
end
-- Lua's and/or idiom cannot represent a nil result.
local function anonymousTap(event,name,touch)
    local x,y;if name=='playArea'then x,y=0,0 end
    event(name,'down',touch,x,y);event(name,'up',touch,x,y);event(name,'click',nil,x,y)
end
local function selected(ui,event)
    if not ui.selected then tap(event,'card1',17)end
    assert(ui.selected,'named setup must select a card')
end
local function unchanged(battle,energy,hand,hp)
    assert(battle.energy==(energy or 3) and #battle.hand==(hand or 2),'unexpected command or energy loss')
    if hp then assert(battle.enemies[1].hp==hp,'unexpected target damage')end
end
local function field(event,kind,touch)event('playArea',kind,touch,0,0)end

test('unique released card accepts anonymous Click once',function()
    local h,u,_,e=setup();local uid=h.run.combat.hand[1].uid
    anonymousTap(e,'card1',17)
    assert(u.selected==uid,'named Down/Up then anonymous Click lost card selection')
    e('card1','click',nil)
    assert(u.selected==uid,'duplicate anonymous Click toggled selection')
    unchanged(h.run.combat)
end)

test('unique released field accepts anonymous Click once',function()
    local h,u,_,e=setup();selected(u,e)
    anonymousTap(e,'playArea',18)
    unchanged(h.run.combat,2,1)
    field(e,'click',nil);unchanged(h.run.combat,2,1)
end)

test('anonymous selection and field confirmation resume immediately after feedback',function()
    local h,u,_,e,_,drain=setup()
    anonymousTap(e,'card1',17);anonymousTap(e,'playArea',18)
    unchanged(h.run.combat,2,1)
    assert(u.busy,'first committed card must enter real feedback')
    drain();assert(not u.busy)
    anonymousTap(e,'card1',19);anonymousTap(e,'playArea',20)
    unchanged(h.run.combat,1,0)
    assert(h.run.combat.player.block==10,'two deliberate commands must grant exactly two blocks')
end)

test('anonymous enemy confirmation commits explicit target once',function()
    local h,u,_,e=setup({'strike'},{'cultist','jaw_worm'});selected(u,e)
    local b=h.run.combat;local hp1,hp2=b.enemies[1].hp,b.enemies[2].hp
    anonymousTap(e,'enemy2',21)
    assert(b.energy==2 and #b.hand==0 and b.enemies[1].hp==hp1 and b.enemies[2].hp==hp2-6)
    e('enemy2','click',nil)
    assert(b.energy==2 and b.enemies[2].hp==hp2-6,'anonymous enemy Click replayed')
end)

test('named and fully anonymous card field compatibility',function()
    for _,touch in ipairs({17,false})do
        local h,u,_,e=setup();local id=touch or nil
        tap(e,'card1',id);assert(u.selected)
        tap(e,'playArea',id);unchanged(h.run.combat,2,1)
    end
end)

test('anonymous card Click without Up cannot select',function()
    local h,u,_,e=setup()
    e('card1','down',17);e('card1','click',nil)
    assert(not u.selected);unchanged(h.run.combat)
end)

test('anonymous field Click without Up cannot submit',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'click',nil);unchanged(h.run.combat)
end)

test('foreign named Click cannot borrow released card',function()
    local h,u,_,e=setup()
    e('card1','down',17);e('card1','up',17);e('card1','click',18)
    assert(not u.selected);unchanged(h.run.combat)
end)

test('EndDrag consumes release before anonymous Click',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'up',18);field(e,'endDrag',18);field(e,'click',nil)
    unchanged(h.run.combat)
end)

test('same control overlapping field pointers cannot submit anonymously',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'down',19);field(e,'up',19);field(e,'click',nil)
    unchanged(h.run.combat)
    field(e,'up',18);field(e,'click',nil);unchanged(h.run.combat)
end)

test('same card overlapping pointers cannot select anonymously',function()
    local h,u,_,e=setup()
    e('card1','down',17);e('card1','down',18);e('card1','up',17);e('card1','click',nil)
    assert(not u.selected);unchanged(h.run.combat)
    e('card1','up',18);e('card1','click',nil);assert(not u.selected)
end)

test('cross card field overlap refuses anonymous confirmation',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);e('card2','down',19);field(e,'up',18);field(e,'click',nil)
    unchanged(h.run.combat)
    e('card2','up',19);e('card2','click',nil);unchanged(h.run.combat)
end)

test('enemy and field competing origins refuse anonymous target',function()
    local h,u,_,e=setup({'strike'},{'cultist'});selected(u,e)
    local b=h.run.combat;local hp=b.enemies[1].hp
    e('enemy1','down',18);field(e,'down',19);e('enemy1','up',18);e('enemy1','click',nil)
    unchanged(b,3,1,hp)
    field(e,'up',19);field(e,'click',nil);unchanged(b,3,1,hp)
end)

test('stale turn anonymous release is consumed before recovery',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'up',18);h.run.combat.turn=h.run.combat.turn+1
    field(e,'click',nil);unchanged(h.run.combat)
    h.run.combat.turn=h.run.combat.turn-1;field(e,'click',nil);unchanged(h.run.combat)
end)

test('busy anonymous Click cannot replay after feedback guard clears',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'up',18);u.busy=true
    field(e,'click',nil);unchanged(h.run.combat)
    u.busy=false;field(e,'click',nil);unchanged(h.run.combat)
end)

test('old enemy callback cannot submit into replacement battle',function()
    local h,u,p,e=setup({'strike'},{'cultist'});selected(u,e)
    local old=H.F.actorControl(p,'enemy1'):GetChild('hit').listeners.click
    e('enemy1','down',18);e('enemy1','up',18)
    h.run.combat=H.F.Combat.new(H.F.Data,{deck={'strike'},enemies={'cultist'}});h:refresh()
    local b=h.run.combat;local hp=b.enemies[1].hp
    old({});unchanged(b,3,1,hp)
end)

test('drag release trailing anonymous Click cannot select shifted hand',function()
    local h,u,_,e,_,drain=setup()
    e('card1','down',17);e('card1','drag',17,40,0);e('dragLayer','up',17,40,0)
    unchanged(h.run.combat,2,1)
    e('card1','endDrag',17,40,0);e('card1','click',nil)
    drain();e('card1','click',nil);field(e,'click',nil)
    unchanged(h.run.combat,2,1);assert(not u.selected and not u.gesture and not u.carry)
    anonymousTap(e,'card1',19);anonymousTap(e,'playArea',20);unchanged(h.run.combat,1,0)
end)

test('inactive lifecycle retires old release and fresh input recovers',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'up',18)
    u:setActive(false);u:setActive(true)
    field(e,'click',nil);unchanged(h.run.combat)
    selected(u,e);anonymousTap(e,'playArea',19);unchanged(h.run.combat,2,1)
end)

test('resize retires old release and fresh input recovers',function()
    local h,u,_,e=setup();selected(u,e)
    field(e,'down',18);field(e,'up',18);h:resize(1600,900)
    field(e,'click',nil);unchanged(h.run.combat)
    selected(u,e);anonymousTap(e,'playArea',19);unchanged(h.run.combat,2,1)
end)

test('independent hosts retain independent active pointer evidence',function()
    local Input=require('abyss_battle_input_state')
    local function host()
        local owner={};local input={}
        local ownership={cardInputs={input},actionInputs={},potionInputs={},enemyInputs={}}
        local deps=Input.install(owner,ownership,{stage={},platform={},options={}}, {})
        return deps,input
    end
    local a,ia=host();local b,ib=host()
    a.pointerBegin(ia,{touchId=1})
    local event={touchId=2};local origin=b.pointerBegin(ib,event)
    local token={touch=2};ib.held=token;b.pointerArm(ib,token,event,origin)
    b.pointerEnd(ib,event);ib.held=nil;ib.released=token
    assert(b.pointerTake(ib,{})==token,'another Host borrowed or tainted this Host pointer')
end)

test('clearing one control retains another live origin',function()
    local Input=require('abyss_battle_input_state')
    local first,second,third={},{},{}
    local ownership={cardInputs={first},actionInputs={second,third},potionInputs={},enemyInputs={}}
    local deps=Input.install({},ownership,{stage={},platform={},options={}}, {})
    deps.pointerBegin(first,{touchId=1});deps.pointerBegin(second,{touchId=2})
    deps.pointerClear(first)
    local event={touchId=3};local origin=deps.pointerBegin(third,event)
    local token={touch=3};third.held=token;deps.pointerArm(third,token,event,origin)
    deps.pointerEnd(third,event);third.held=nil;third.released=token
    assert(not deps.pointerTake(third,{}),'clearing one control erased another physical pointer')
end)

test('controller blocked field Click and Down cannot revive after recovery',function()
    local F=H.F;local focus
    local api={events={Confirm='confirm',Cancel='cancel'},getFocus=function()return focus end,
        directions={Left='left',Right='right'},modes={Specified='specified',NearestControl='nearest'},
        setFocus=function(value)focus=value end,isController=function()return true end}
    local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorEndDrag='endDrag',CursorEnter='enter',CursorExit='exit'}
    local h,root=F.fixture(nil,nil,nil,cursor,false,nil,{touchScreen=function()return true end},api)
    assert(F.start(h));assert(H.Run.startCombat(h.run,'cultist_solo'))
    h.run.combat=F.Combat.new(F.Data,{deck={'defend','defend'},enemies={'cultist'}})
    h:resize(1280,720);h:refresh()
    local emit,tapNamed=dofile('tests/lua/support/battle_action_fixture.lua').controls(root:GetChild('battlePanel'))
    tapNamed('card1',1)
    local original=h.controller.blocked;local blocked=false
    h.controller.blocked=function()return blocked or original and original()end
    field(emit,'down',2);field(emit,'up',2);blocked=true;field(emit,'click',nil)
    blocked=false;field(emit,'click',nil);unchanged(h.run.combat)
    blocked=true;field(emit,'down',3);blocked=false;field(emit,'up',3);field(emit,'click',nil)
    unchanged(h.run.combat)
    anonymousTap(emit,'playArea',4);unchanged(h.run.combat,2,1)
end)

test('fully anonymous enemy inspection is one-shot and cannot poison the next card',function()
    local h,u,_,e=setup();local shown=0
    u.showStatus=function(_,target)assert(target==1);shown=shown+1 end
    tap(e,'enemy1',nil)
    assert(shown==1,'fully anonymous enemy inspection was lost')
    e('enemy1','click',nil);assert(shown==1,'inspection Click tail replayed')
    anonymousTap(e,'card1',30)
    assert(u.selected==h.run.combat.hand[1].uid,'inspection release poisoned the next anonymous card')
    anonymousTap(e,'playArea',31);unchanged(h.run.combat,2,1)
end)

test('selected non-targeted cards still allow mixed-ID enemy inspection without a command',function()
    local h,u,_,e=setup();selected(u,e);local uid=u.selected;local shown=0
    u.showStatus=function(_,target)assert(target==1);shown=shown+1 end
    anonymousTap(e,'enemy1',32)
    assert(shown==1 and u.selected==uid,'non-targeted selection lost enemy inspection or changed selection')
    unchanged(h.run.combat)
    anonymousTap(e,'playArea',33);unchanged(h.run.combat,2,1)
end)

test('overlapping inspection and card pointers remain rejected then recover on a fresh tap',function()
    local h,u,_,e=setup();local shown=0
    u.showStatus=function()shown=shown+1 end
    e('enemy1','down',34);e('card1','down',35)
    e('enemy1','up',34);e('enemy1','click',nil)
    e('card1','up',35);e('card1','click',nil)
    assert(shown==0 and not u.selected,'ambiguous inspection or card was admitted')
    anonymousTap(e,'card1',36)
    assert(u.selected==h.run.combat.hand[1].uid,'rejected inspection left a released pointer behind')
    unchanged(h.run.combat)
end)

test('a rejected anonymous role consumes only its release before a different card tap',function()
    local Input=require('abyss_battle_input_state')
    local owner={run={phase='combat',combat={turn=1}}}
    local input,card={},{}
    local ownership={cardInputs={card},enemyInputs={input},potionInputs={},actionInputs={}}
    local deps=Input.install(owner,ownership,{stage={},platform={},options={}}, {})
    local function release(target,touch)
        local event={touchId=touch};local state=deps.pointerBegin(target,event)
        local token={touch=touch};target.held=token;deps.pointerArm(target,token,event,state)
        deps.pointerEnd(target,event);target.held=nil;target.released=token;return token
    end
    release(input,37)
    assert(deps.pointerTake(input,{},true,function()return false end)==nil)
    assert(input.released==nil,'rejected anonymous role retained a released pointer')
    local token=release(card,38)
    assert(deps.pointerTake(card,{})==token,'rejected role poisoned a different card input')
end)

print('BATTLE_POINTER_IDENTITY '..passed..' passed; '..failed..' failed')
assert(failed==0,'battle pointer identity failures: '..failed)
