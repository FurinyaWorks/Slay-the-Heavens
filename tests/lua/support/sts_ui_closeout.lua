local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Gate=require('abyss_page_reveal')
local Preview=STS_UI_CAPTURE and dofile('scripts/official-assets-preview.lua')
local function shot(name,ui,root)
    if Preview then Preview.capture(name,ui,root,'Official configuration projected by the offline Lua Host')end
end
local function hit(box)return box:GetChild('hit')end
local function start(ui)
    assert(F.start(ui))
    assert(ui.mode=='map')
end

local ui,root=F.fixture(nil,nil,nil,{CursorEnter='enter',CursorExit='exit'})
if not STS_UI_BASELINE then
    assert(not root:GetChild('prologuePanel'),'legacy controls shipped in the official layout')
    local details=root:GetChild('characterPanel'):GetChild('details')
    for _,name in ipairs({'deckTitle','deckSummary','deckOpen'})do assert(not details:GetChild(name),name)end
end
start(ui)
local run=ui.run
local menu=root:GetChild('menuPanel')
assert(ui:openMenu() and ui:returnToMainMenu())
shot('menu',ui,root)
assert(menu:GetChild('continueRun').visible and hit(menu:GetChild('start')).click())
local dialog=root:GetChild('exitPanel')
shot('abandon',ui,root)
if not STS_UI_BASELINE then
    assert(menu:GetChild('start'):GetChild('label').text=='放弃本局')
    assert(dialog:GetChild('title').text=='放弃本局？')
    assert(dialog:GetChild('message').text=='当前本局进度将被清除。')
    assert(not dialog:GetChild('whyText').visible and not dialog:GetChild('border').visible)
end
assert(hit(dialog:GetChild('cancel')).click() and ui.run==run)
assert(hit(menu:GetChild('continueRun')).click() and ui.run==run and ui.mode=='map')
assert(ui:openDeck() and ui.deckUI.visible)
assert(ui:closeDeck())

run.relics={'burning_blood','maw_bank'}
run.relicCounters={maw_bank=-2}
assert(Run.obtainPotion(run,'fire_potion') and Run.obtainPotion(run,'fruit_juice'))
ui:refresh()
local relicBar=root:GetChild('relicBar')
local relic=hit(relicBar:GetChild('slot1'))
relic.listeners.enter()
if not STS_UI_BASELINE then
    local tip=relicBar:GetChild('tooltip')
    assert(tip.visible and tip:GetChild('name').text=='岩脉残晶')
    assert(tip:GetChild('effect').text:find('6点生命',1,true))
    shot('relic-hover',ui,root)
end
relic.listeners.exit()
assert(relic.click() and ui.relicUI.selectedIndex==1)
shot('relic',ui,root)
assert(ui.relicUI:turn(1) and ui.relicUI.selected.status=='已失效')
assert(ui:closeDeck() and ui.run==run and #run.relics==2)

local entry=root:GetChild('potionEntry')
local panel=root:GetChild('potionPanel')
if STS_UI_BASELINE then
    assert(hit(entry:GetChild('open')).click() and hit(panel:GetChild('slot1')).click())
    shot('potion',ui,root)
    assert(hit(panel:GetChild('cancel')).click())
else
    local function open(slot)return hit(entry:GetChild('slot'..slot)).click()end
    local before=Gate.intent(ui).page
    assert(open(1) and ui.potionUI.visible)
    assert(Gate.intent(ui).page==before and not panel:GetChild('slot1'))
    assert(not panel:GetChild('use').interactable and panel:GetChild('discard').interactable)
    assert(panel:GetChild('effect').text:find('20',1,true))
    shot('potion',ui,root)
    assert(panel:GetChild('dismiss').click() and not ui.potionUI.visible and run.potions[1]=='fire_potion')
    local maxHp=run.maxHp
    assert(open(2) and panel:GetChild('use').click() and run.maxHp>maxHp and not run.potions[2])
    assert(not panel:GetChild('use').click())
    assert(open(1) and panel:GetChild('discard').click() and not run.potions[1])
    assert(not panel:GetChild('discard').click())
end

assert(ui:openMenu() and ui:returnToMainMenu() and hit(menu:GetChild('start')).click())
local confirm=hit(dialog:GetChild('confirm'))
assert(confirm.click() and not ui.run)
assert(not confirm.click())
if not STS_UI_BASELINE then assert(ui:start()) end
assert(F.confirmStart(ui) and ui.run~=run and #ui.run.relics==1)
if not STS_UI_BASELINE then
    local events={CursorDown='down',CursorUp='up'}
    local touch,touchRoot=F.fixture(nil,nil,nil,events)
    start(touch)
    touch:resize(854,480)
    assert(Run.obtainPotion(touch.run,'fire_potion'))
    touch:refresh()
    local slot=hit(touchRoot:GetChild('potionEntry'):GetChild('slot1'))
    local finger={touchId=77}
    slot.listeners.down(finger)
    assert(Run.discardPotion(touch.run,1) and Run.obtainPotion(touch.run,'fruit_juice'))
    touch:refresh()
    slot.listeners.up(finger)
    assert(not slot.click(finger) and not touch.potionUI.visible,'old press opened a replacement bottle')
    slot.listeners.down(finger);slot.listeners.up(finger)
    assert(slot.click(finger) and touch.potionUI.visible)
    assert(Run.discardPotion(touch.run,1))
    touch:refresh()
    assert(not touch.potionUI.visible and touchRoot:GetChild('deckEntry').visible)
    assert(touch.mapUI:choose(F.Nodes.available(touch.run,touch.map)[1].id),'expired popup left map input disabled')
end

local fadeRoot=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local recovering,waiting,focus
local navigation={events={Confirm='confirm',Cancel='cancel',Focus='focus'},directions={Left='left',Right='right'},
    modes={Specified='specified'},getFocus=function()return focus end,setFocus=function(value)focus=value end,
    isController=function()return true end}
local fade=F.GameUI.new(fadeRoot,F.Data,F.Presentation,'click',{
    seed=1,imageSource='static',prologue=not STS_UI_BASELINE,controllerApi=navigation,
    color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,
    presentationReady=function(intent)
        if recovering==intent.page then return false,'fixture readiness failure'end
        return waiting~=intent.page
    end,
})
local cover=fadeRoot:GetChild('pageReveal')
local veil=cover:GetChild('veil')
local function tick(dt)
    fade:update(dt)
    if fade.pageReveal:step(Gate.intent(fade),dt)then fade:refresh()end
    fade.pageReveal:paint(not fade.exitOpen or fade.routeOpen)
end
local function settle()
    for _=1,20 do tick(.05)end
    assert(not fade.pageReveal:covered())
end
settle()
assert(fade:start())
settle()
assert(fade:selectCharacter('traveler'))
settle()
assert(fade:confirmCharacter())
settle()
waiting='battlePanel'
assert(fade.mapUI:choose(F.Nodes.available(fade.run,fade.map)[1].id))
if not STS_UI_BASELINE then
    assert(fade.pageReveal.state=='fadingOut' and fadeRoot:GetChild('mapPanel').visible)
    tick(.05)
    assert(veil.imageColor.a>0 and veil.imageColor.a<255)
    shot('fade-out',fade,fadeRoot)
end
for _=1,16 do tick(.05)end
assert(cover.visible and cover:GetChild('blocker').click())
if not STS_UI_BASELINE then
    assert(veil.imageColor.a==255 and not cover:GetChild('message').visible)
end
shot('fade-black',fade,fadeRoot)
waiting=nil
settle()
if not STS_UI_BASELINE then
    fade:resize(1600,720)
    assert(veil.sizeDeltaX==1600 and cover:GetChild('blocker').sizeDeltaX==1600)
    for _,input in ipairs({'click','cancel'})do
        recovering='mapPanel'
        assert(fade:openMenu())
        fade.routeOpen=true
        fade:refresh()
        for _=1,16 do tick(.05)end
        assert(fade.pageReveal.state=='failed' and cover:GetChild('message').visible)
        local back=hit(cover:GetChild('cancel'))
        focus=back
        local recover=input=='click' and back.click or back.navigationListeners.cancel
        assert(recover(),'failed route preview could not return to combat by '..input)
        recovering=nil
        settle()
        assert(not fade.routeOpen and fade.mode=='battle' and fade.battleUI.active)
    end
    assert(fade:openMenu() and fade:returnToMainMenu())
    settle()
    assert(hit(fadeRoot:GetChild('menuPanel'):GetChild('start')).click())
    assert(fade:confirmExit() and not fade.pageReveal:covered(),'discard flashed the unchanged menu')
end

if Preview then Preview.print()end
print('STS_UI_CLOSEOUT_PASS')
