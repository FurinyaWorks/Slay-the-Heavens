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
test('deck round trip recovers a fresh anonymous target without an old terminal',function()
    local host,ui,panel,event,tap,drain,cover=H.setup({'strike'},{'cultist'}, {touchScreen=function()return true end})
    local battle=host.run.combat
    local hit=F.actorControl(panel,'enemy1'):GetChild('hit')
    local hp=battle.enemies[1].hp
    tap('card1',1);event('enemy1','down',2);cover()
    assert(not ui.selected,'deck entry must clear selected Strike')
    tap('card1',3);assert(ui.selected==battle.hand[1].uid,'Strike was not reselected')
    -- No Up/EndDrag for ID 2 before the next complete tap.
    event('enemy1','down',4);event('enemy1','up',4);hit.click({})
    assert(battle.energy==2 and battle.enemies[1].hp==hp-6,'old covered contact blocked fresh target')
    drain()
    event('enemy1','up',2);event('enemy1','endDrag',2);event('enemy1','click',2);hit.click({})
    assert(battle.energy==2 and battle.enemies[1].hp==hp-6,'late old tail repeated the play')
end)
test('deck round trip retires cross-control contacts even when a number is reused',function()
    for _,fresh in ipairs({4,2})do
        local host,ui,panel,event,tap,_,cover=H.setup({'strike','defend'},{'cultist'}, {touchScreen=function()return true end})
        local battle=host.run.combat
        local strike,defend
        for i,card in ipairs(battle.hand)do
            if card.cardId=='strike'then strike=i elseif card.cardId=='defend'then defend=i end
        end
        assert(strike and defend)
        local card='card'..defend
        tap('card'..strike,1);event('enemy1','down',2);cover()
        assert(not ui.selected)
        event(card,'down',fresh);event(card,'up',fresh)
        panel:GetChild(card):GetChild('hit').click({})
        local uid=battle.hand[defend].uid
        assert(ui.selected==uid and battle.energy==3,'orphan enemy contact blocked Defend, fresh ID '..fresh)
        event('enemy1','up',2);event('enemy1','endDrag',2);event('enemy1','click',2)
        assert(ui.selected==uid and not ui.info and battle.energy==3,'old enemy tail affected new card owner')
    end
end)
test('Down delivered while the battle is covered does not claim the resumed epoch',function()
    local host,ui,panel,event,tap=H.setup({'strike'},{'cultist'}, {touchScreen=function()return true end})
    local battle=host.run.combat
    tap('card1',1);assert(host:openDeck() and not ui.active)
    event('enemy1','down',2)
    assert(host:closeDeck() and ui.active)
    tap('card1',3);event('enemy1','down',4);event('enemy1','up',4)
    F.actorControl(panel,'enemy1'):GetChild('hit').click({})
    assert(battle.energy==2,'Down received under the overlay blocked fresh input')
end)
test('cover cancels moving potion and keeps its old named Click suppressed until fresh Down',function()
    local host,ui,panel,event,tap,drain,cover=H.setup({'defend'},{'cultist'}, {touchScreen=function()return true end})
    local battle=host.run.combat
    assert(H.Run.obtainPotion(host.run,'fire_potion'));host:refresh()
    local enemy=F.actorControl(panel,'enemy1')
    local hp=battle.enemies[1].hp
    event('potion1','down',2);event('potion1','drag',2,enemy.x,enemy.y)
    assert(ui.potionAim and ui.potionAim.moving,'moving potion was not armed')
    cover();assert(not ui.potionAim and not panel:GetChild('dragLayer').visible)
    assert(host.run.potions[1]=='fire_potion' and battle.enemies[1].hp==hp)
    event('dragLayer','up',2,enemy.x,enemy.y);event('potion1','click',2)
    event('endTurn','click',2);event('endTurn','click',2)
    assert(battle.turn==1 and not ui.potionMenu and host.run.potions[1]=='fire_potion' and battle.enemies[1].hp==hp,
        'cancelled potion tail opened a popup, used a potion, or ended the turn')
    tap('endTurn',2);drain()
    assert(battle.turn==2,'fresh Down could not reclaim numeric ID')
end)
test('cover clears the retained enemy contact beyond a retired slot',function()
    local host,ui,panel,event,tap,_,cover=H.setup({'strike'},{'cultist','jaw_worm'}, {touchScreen=function()return true end})
    local surfaces=assert(require('abyss_monster_surfaces').get(panel))
    local battle=host.run.combat
    local survivor=assert(surfaces:control(2))
    battle.enemies[1].hp=0;host:refresh()
    assert(not surfaces:control(1) and surfaces:control(2)==survivor,'fixture must retain a sparse enemy slot')
    tap('card1',1);event('enemy2','down',2);cover()
    assert(surfaces:control(2)==survivor,'cover must reuse the surviving actor control')
    tap('card1',3);event('enemy2','down',4);event('enemy2','up',4)
    survivor:GetChild('hit').click({})
    assert(battle.energy==2,'sparse enemy contact survived the cover')
end)
print('TARGET_ANONYMOUS_CONTEXT_PASS '..passed)
