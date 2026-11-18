local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local F=H.F
local passed=0
local function test(name,fn)fn();passed=passed+1;print('PASS anonymous context - '..name)end
local function setup()
    local host,ui,panel,event,tap=H.setup({'strike'},{'cultist','jaw_worm'}, {touchScreen=function()return true end})
    tap('card1',1)
    local function anonymous()F.actorControl(panel,'enemy1'):GetChild('hit').click({})end
    return host,ui,panel,event,tap,anonymous
end
test('stale context and busy rejection consume the release before recovery',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    for index,kind in ipairs({'busy','phase','turn','actor','run','battle','epoch'})do
        local touch=10+index*4
        event('enemy1','down',touch);event('enemy1','up',touch)
        local actor,turn,run=battle.enemies[1],battle.turn,ui.run
        if kind=='busy'then ui.busy=true
        elseif kind=='phase'then battle.phase='enemy'
        elseif kind=='turn'then battle.turn=turn+1
        elseif kind=='actor'then battle.enemies[1]=F.Combat.copy(actor)
        elseif kind=='run'then ui.run=H.Run.new(F.Data,99)
        elseif kind=='battle'then run.combat=F.Combat.new(F.Data,{deck={'strike'},enemies={'cultist'}})
        else tap('card1',touch+1);tap('card1',touch+2)end
        anonymous();assert(battle.energy==3,kind..' accepted stale anonymous input')
        ui.busy=false;battle.phase='player';battle.turn=turn;battle.enemies[1]=actor;ui.run=run;run.combat=battle
        anonymous();assert(battle.energy==3,kind..' revived after restoration')
        tap('card1',touch+1);tap('card1',touch+2)
    end
    event('enemy1','down',90);event('enemy1','up',90);anonymous()
    assert(battle.energy==2,'fresh context did not recover')
end)
test('old foreign target terminals do not revoke a newer pointer',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    event('enemy1','down',2);event('enemy1','exit',80);event('enemy1','drag',80)
    event('enemy1','up',2);anonymous();assert(battle.energy==2)
end)
test('native setter reentry cannot commit the same anonymous release twice',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    event('enemy1','down',2);event('enemy1','up',2)
    local button=panel:GetChild('endTurn');local original=button.SetVisible;local injected=false
    button.SetVisible=function(self,value)
        if not injected then injected=true;anonymous()end
        return original(self,value)
    end
    anonymous();button.SetVisible=original
    assert(injected,'reentrant native boundary was not exercised')
    assert(battle.energy==2 and #battle.discard==1,'native reentry duplicated or lost the command')
end)
test('controller-blocked Click and Down cannot revive after the guard opens',function()
    local focus
    local api={events={Confirm='confirm',Cancel='cancel'},getFocus=function()return focus end,
        directions={Left='left',Right='right'},modes={Specified='specified',NearestControl='nearest'},
        setFocus=function(value)focus=value end,isController=function()return true end}
    local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorEndDrag='endDrag',CursorEnter='enter',CursorExit='exit'}
    local host,root=F.fixture(nil,nil,nil,cursor,false,nil,{touchScreen=function()return true end},api)
    assert(F.start(host));assert(H.Run.startCombat(host.run,'cultist_solo'))
    host.run.combat=F.Combat.new(F.Data,{deck={'strike'},enemies={'cultist'}})
    host:resize(1280,720);host:refresh()
    local ui,panel=host.battleUI,root:GetChild('battlePanel')
    local emit,tap=dofile('tests/lua/support/battle_action_fixture.lua').controls(panel)
    local function anonymous()F.actorControl(panel,'enemy1'):GetChild('hit').click({})end
    local battle=host.run.combat;tap('card1',1)
    local original=host.controller.blocked;local blocked=false
    host.controller.blocked=function()return blocked or original and original()end
    emit('enemy1','down',2);emit('enemy1','up',2);blocked=true;anonymous()
    blocked=false;anonymous();assert(battle.energy==3,'blocked Click replayed')
    blocked=true;emit('enemy1','down',3);blocked=false;emit('enemy1','up',3);anonymous()
    assert(battle.energy==3,'blocked Down became valid')
    emit('enemy1','down',4);emit('enemy1','up',4);anonymous();assert(battle.energy==2)
end)
test('confirmed potion tap consumes once and read-only inspection preserves the non-targeted card',function()
    local host,ui,panel,event,tap,anonymous=setup();local battle=host.run.combat
    host.run.potions[1]='fire_potion';ui:render();assert(ui:usePotion(1))
    local hp=battle.enemies[1].hp
    event('enemy1','down',2);event('enemy1','up',2);anonymous()
    assert(host.run.potions[1]==nil and battle.enemies[1].hp==hp-20 and battle.energy==3)
    event('enemy1','click',2)
    assert(host.run.potions[1]==nil and battle.enemies[1].hp==hp-20,'late named potion tail repeated the effect')
    host,ui,panel,event,tap=H.setup({'defend'},{'cultist'})
    battle=host.run.combat;tap('card1',1)
    local selected=ui.selected
    local original,inspections=ui.showStatus,0
    ui.showStatus=function(self,target)inspections=inspections+1;return original(self,target)end
    event('enemy1','down',2);event('enemy1','up',2)
    -- #711 permits read-only inspection for a uniquely released mixed-ID tap.
    F.actorControl(panel,'enemy1'):GetChild('hit').click({})
    assert(battle.energy==3 and ui.selected==selected and ui.info and inspections==1,
        'mixed-ID inspection lost the card or issued a gameplay command')
    event('enemy1','click',2);assert(inspections==1,'late named tail repeated inspection')
    ui.info=nil
    event('enemy1','down',3);event('enemy1','up',3);event('enemy1','click',3)
    assert(ui.info and inspections==2 and battle.energy==3,'fresh named details path changed')
end)
test('existing resize controller cover and hide retire active contacts before a fresh pointer',function()
    for _,kind in ipairs({'resize','controller','cover','hide'})do
        local host,ui,panel,event,tap,drain,cover=H.setup({'strike'},{'cultist'}, {touchScreen=function()return true end})
        local battle=host.run.combat
        tap('card1',1);event('enemy1','down',2)
        if kind=='resize'then host:resize(1280,720)
        elseif kind=='controller'then ui:cancelControllerPointers()
        elseif kind=='cover'then cover()
        else ui:setActive(false);ui:setActive(true)end
        local function anonymous()F.actorControl(panel,'enemy1'):GetChild('hit').click({})end
        event('enemy1','up',2);anonymous();assert(battle.energy==3,kind..' revived old tail Click')
        if not ui.selected then tap('card1',3)end
        event('enemy1','down',4);event('enemy1','up',4);anonymous()
        assert(battle.energy==2,kind..' blocked fresh pointer after retiring old contact')
    end
end)
print('TARGET_ANONYMOUS_CONTEXT_PASS '..passed)
