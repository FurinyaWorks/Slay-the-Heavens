local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Gate=require('abyss_page_reveal')
local Run=require('abyss_run')
local cursor={CursorDown='down',CursorUp='up',CursorEnter='enter',CursorExit='exit',CursorEndDrag='endDrag',CursorDrag='drag'}
local function colour(...)return {...}end
local function hostFixture(shared)
    local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
    local host
    local platform=shared or {seed=1,imageSource='static',color=colour,
        presentationReady=function(intent)
            return intent.page~='deckPanel' or not (host.deckUI.pendingGrid or host.deckUI.pending or host.deckUI.calibrating)
        end,deckBrowser=F.deckBrowser()}
    host=F.GameUI.new(root,F.Data,F.Presentation,'click',platform)
    local function step()
        host:update(.02)
        if host.pageReveal:step(Gate.intent(host),.02) then host:refresh() end
        host.pageReveal:paint(true)
    end
    local function settle()
        for _=1,60 do if not host.pageReveal:covered()then return end;step()end
        error('cover did not settle: '..host.pageReveal.state)
    end
    local function cover()
        host.pageReveal.state='preparing'
        host.pageReveal.entry=nil
        host.pageReveal.localFrame=nil
        host.pageReveal:paint(true)
        assert(host.pageReveal:covered())
    end
    return host,root,settle,cover
end
local function title()
    local host,root,settle,cover=hostFixture();settle();cover()
    local hit=root:GetChild('menuPanel'):GetChild('start'):GetChild('hit')
    assert(not hit.click() and not host.characterOpen,'covered Start opened character selection')
    host.pageReveal.state='visible'
    assert(hit.click() and host.characterOpen,'fresh Start did not open character selection')
end
local function endTurn()
    local host,root,settle,cover=hostFixture()
    settle();assert(F.start(host));settle();assert(Run.startCombat(host.run,'cultist_solo'))
    host:refresh();settle();assert(host.mode=='battle' and host.battleUI.active)
    local battle=host.run.combat;local beforePhase,turn=battle.phase,battle.turn
    cover()
    local hit=root:GetChild('battlePanel'):GetChild('endTurn')
    assert(not hit.click() and not host.battleUI.busy and beforePhase==battle.phase and turn==battle.turn,
        'covered EndTurn issued a battle command')
    host.pageReveal.state='visible'
    hit.click()
    assert(host.battleUI.busy or beforePhase~=battle.phase or turn~=battle.turn,'fresh EndTurn was not accepted')
end
local function discardChoice()
    local layout=F.Viewport.apply(F.control({children=F.Layout}),1280,720):GetChild('choicePanel')
    local data=require('abyss_silent').withFoundationCards(F.Data)
    local state
    for seed=1,100 do
        local battle=F.Combat.new(data,{seed=seed,enemies={'cultist'},deck={'survivor','defend','defend','defend','defend'}})
        for _,card in ipairs(battle.hand)do
            if card.cardId=='survivor' then assert(F.Combat.play(battle,card.uid));state=battle;break end
        end
        if state then break end
    end
    assert(state and state.pendingDiscard)
    local run={phase='combat',combat=state,combatGeneration=7,deck={}}
    local blocked=false;local function isCovered()return blocked end
    local platform={imageSource='static',color=colour,cursorEvents=cursor,pointerBlocked=isCovered}
    local view=require('abyss_choice_ui').new(layout,F.Presentation,'click',platform,function()
        error('choice tap should not commit until confirm')
    end)
    assert(view:refresh(run,true))
    local hit=layout:GetChild('card1'):GetChild('hit')
    local event={touchId=7}
    hit.listeners.down(event);hit.listeners.up(event)
    blocked=true
    assert(not hit.click(event) and #view.selected==0 and state.pendingDiscard,'covered choice accepted the old release')
    blocked=false
    event={touchId=8}
    hit.listeners.down(event);hit.listeners.up(event)
    assert(hit.click(event) and #view.selected==1 and state.pendingDiscard,'fresh choice did not select')
end
local function outsideShop()
    local panel=F.Viewport.apply(F.control({children=F.Layout}),1280,720):GetChild('nodePanel'):GetChild('shopView')
    local offer={id='defend',price=30}
    local owner={run={phase='node',nodeFlow={type='shop',cards={offer}},gold=100},visible=true,map={},mode='main',
        render=function(self) self.renders=(self.renders or 0)+1 end}
    local blocked=false;local function isCovered()return blocked end
    local opts={pointerBlocked=isCovered}
    local selection=require('abyss_shop_selection').new(owner,panel,opts)
    local hit=F.control({name='hit',kind='cursorArea'},panel)
    selection:bindOutside(hit,'click',cursor,opts)
    local selectOffer=selection:bind('shopView/card1','cards',1,function() return true end,'牌','',true)
    assert(selectOffer() and selection.selected)
    local event={touchId=9}
    hit.listeners.down(event);hit.listeners.up(event)
    blocked=true
    assert(hit.click(event) and selection.selected and owner.renders==1 and owner.run.gold==100,
        'covered outside click cancelled a shop selection')
    blocked=false
    event={touchId=10}
    hit.listeners.down(event);hit.listeners.up(event)
    assert(hit.click(event) and not selection.selected and owner.renders==2 and owner.run.gold==100,
        'fresh outside click did not cancel or changed shop inventory')
end
local function sharedHost()
    local platform={seed=1,imageSource='static',color=colour,cursorEvents=cursor,
        presentationReady=function()return true end}
    local a,rootA,settleA,coverA=hostFixture(platform)
    local b,rootB,settleB=hostFixture(platform)
    settleA();settleB();coverA()
    local function start(root)return root:GetChild('menuPanel'):GetChild('start'):GetChild('hit')end
    local hitA,hitB=start(rootA),start(rootB)
    local finger={touchId=42}
    hitA.listeners.down(finger);hitA.listeners.up(finger)
    assert(not hitA.click(finger) and not a.characterOpen,'shared platform let Host B bypass Host A cover')
    hitB.listeners.up(finger)
    assert(not hitB.click(finger) and not b.characterOpen,'Host B borrowed a matching touch ID from Host A')
    hitB.listeners.down(finger);hitB.listeners.up(finger)
    assert(hitB.click(finger) and b.characterOpen and not a.characterOpen,'Host A cover blocked a fresh Host B interaction')
    assert(not hitA.click(finger) and not a.characterOpen,'Host B action retired Host A cover')
    a.pageReveal.state='visible'
    local fresh={touchId=43}
    hitA.listeners.down(fresh);hitA.listeners.up(fresh)
    assert(hitA.click(fresh) and a.characterOpen and b.characterOpen,'fresh Host A input did not recover independently')
    assert(rawget(platform,'pointerBlocked')==nil,'host wrote its private gate onto shared platform')
end
local selected=...
if selected=='shared-host' then
    sharedHost()
    return
end
title()
endTurn()
discardChoice()
outsideShop()
sharedHost()
print('POINTER_COVER_OWNERSHIP_PASS')
