local F=dofile('tests/lua/support/game_ui_fixture.lua')
local cursor={CursorDown='down',CursorUp='up',CursorEndDrag='endDrag'}
local h,root=F.fixture(nil,nil,nil,cursor)
assert(F.start(h))
local capacity=h.relicUI.barCapacity
h.run.relics={}
for i=1,capacity*2+1 do h.run.relics[i]='anchor' end
h:refresh()
local open,close=h.openRelics,h.closeDeck
local opens,closes=0,0
h.openRelics=function(self,...)opens=opens+1;return open(self,...)end
h.closeDeck=function(self,...)closes=closes+1;return close(self,...)end
local function tap(hit,id)
    local touch={touchId=id}
    hit.listeners.down(touch);hit.listeners.up(touch)
    return hit.click(touch)
end
local bar=root:GetChild('relicBar')
local previous,next=bar:GetChild('previous'):GetChild('hit'),bar:GetChild('next'):GetChild('hit')
local slot=bar:GetChild('slot1'):GetChild('hit')
local panel=root:GetChild('relicPanel')
assert(not tap(previous,1) and h.relicUI.barPage==1,'owned strip must stop at its first page')
assert(tap(next,2) and h.relicUI.barPage==2)
local staleSlot={touchId=3}
slot.listeners.down(staleSlot)
assert(tap(next,4) and h.relicUI.barPage==3)
slot.listeners.up(staleSlot)
assert(not slot.click(staleSlot) and opens==0,'old slot touch selected an item on another page')
assert(not tap(next,5) and h.relicUI.barPage==3,'owned strip must stop at its last page')
assert(tap(previous,6) and h.relicUI.barPage==2)
assert(tap(slot,7) and opens==1 and h.relicUI.selectedIndex==capacity+1)
assert(panel:GetChild('single').visible and not panel:GetChild('row1').visible)
assert(tap(panel:GetChild('next'):GetChild('hit'),8) and h.relicUI.selectedIndex==capacity+2)
assert(tap(panel:GetChild('previous'):GetChild('hit'),9) and h.relicUI.selectedIndex==capacity+1)
local closeHit=panel:GetChild('close'):GetChild('hit')
local staleClose={touchId=10}
closeHit.listeners.down(staleClose);closeHit.listeners.up(staleClose)
assert(tap(panel:GetChild('blocker'),11))
assert(closes==1 and not h.relicUI.visible and not h.deckUI.visible and h.mode=='map')
assert(h.relicUI.barPage==2,'closing detail changed the strip page')
assert(h:openDeck())
assert(not closeHit.click(staleClose) and closes==1 and h.deckUI.visible,'stale relic close cannot reach the deck')
assert(close(h))
assert(tap(slot,12) and h.relicUI.selectedIndex==capacity+1 and opens==2)
assert(tap(closeHit,13));assert(closes==2 and not h.deckUI.visible and not h.relicUI.visible)
print('RELIC_POINTER_PASS next previous close bar')

-- Combat details also select the exact owned identity.
do
    local h2,r2=F.fixture()
    assert(F.start(h2))
    assert(require('abyss_run').startCombat(h2.run,'cultist_solo'))
    h2.run.relics={'anchor','burning_blood','maw_bank'}
    h2.run.combat.relicCounters.maw_bank=-2
    h2:refresh()
    local p=r2:GetChild('relicPanel')
    local run,combat=h2.run,h2.run.combat
    local turn,energy,hp,hand=combat.turn,combat.energy,run.hp,#combat.hand
    assert(r2:GetChild('relicBar'):GetChild('slot2'):GetChild('hit').click())
    assert(h2.relicUI.selectedIndex==2,'combat must select exact clicked relic')
    local single=assert(p:GetChild('single'),'missing single relic view')
    assert(single.visible and not p:GetChild('row1').visible)
    -- RELIC_NAMING.md: approved display name; stable burning_blood identity below.
    assert(single:GetChild('name').text=='岩脉残晶','single detail must show the approved starter relic name')
    assert(single:GetChild('rarity').text=='初始遗物')
    assert(single:GetChild('description').text=='每场战斗胜利后，回复6点生命。',
        'single detail must retain the approved trigger and 6-point healing description')
    assert(h2.relicUI.selected.id=='burning_blood')
    assert(h2.relicUI:turn(1) and h2.relicUI.selectedIndex==3)
    assert(single:GetChild('status').text=='已失效')
    assert(not p:GetChild('next').visible and not h2.relicUI:turn(1),'single view must stop at owned boundary')
    assert(h2.relicUI:turn(-1) and h2.relicUI.selectedIndex==2)
    -- Clicking content consumes the event, while outside closes exactly once.
    assert(p:GetChild('contentBlocker').click() and h2.relicUI.visible)
    assert(p:GetChild('blocker').click())
    assert(not h2.deckUI.visible and not h2.relicUI.visible)
    assert(not p:GetChild('blocker').click(),'retired outside click must not close another owner')
    assert(h2:openRelics(1))
    local close2=p:GetChild('close'):GetChild('hit')
    assert(close2.click(),'close must close the single view')
    assert(not h2.deckUI.visible and not h2.relicUI.visible)
    assert(not close2.click() and not h2.deckUI.visible,'stale close cannot reach combat')
    assert(run==h2.run and combat==run.combat and combat.turn==turn and combat.energy==energy and run.hp==hp and #combat.hand==hand)
    assert(run.relics[1]=='anchor' and run.relics[2]=='burning_blood' and run.relics[3]=='maw_bank')
end
do
    local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
    local h3,_,_,emit,_,_,_,r3=H.setup()
    local combat=h3.run.combat
    emit('endTurn','down',7)
    assert(tap(r3:GetChild('relicBar'):GetChild('slot1'):GetChild('hit'),8))
    assert(h3.relicUI.selectedIndex==1)
    assert(tap(r3:GetChild('relicPanel'):GetChild('blocker'),9))
    emit('endTurn','up',7);emit('endTurn','click',7)
    assert(combat.turn==1 and not h3.deckUI.visible,'outside close must not revive an older battle input')
end
print('RELIC_SINGLE_COMBAT_PASS exact identity owned navigation outside cancel readonly')

if require('abyss_theme').presentationProfile=='official-assets-first' then
    local Theme=require('abyss_theme')
    local events={CursorEnter='nativeRelicEnter',CursorExit='nativeRelicExit'}
    local h4,r4=F.fixture(nil,nil,nil,events)
    assert(F.start(h4));assert(require('abyss_run').startCombat(h4.run,'cultist_solo'))
    h4.run.relics={'burning_blood','ancient_tea_set','maw_bank','omamori'}
    h4.run.relicCounters={burning_blood=1,ancient_tea_set=-2,maw_bank=-2,omamori=0}
    h4.run.combat.relicCounters={burning_blood=3}
    h4:refresh()
    local bar4=r4:GetChild('relicBar')
    local slot1,slot2=bar4:GetChild('slot1'),bar4:GetChild('slot2')
    local icon1,hit1=slot1:GetChild('icon'),slot1:GetChild('hit')
    local battleStyle=Theme.officialAssets.battleRelicBar
    assert(slot1.x==battleStyle.origin[1] and slot1.y==battleStyle.origin[2])
    assert(icon1.sizeDeltaX==battleStyle.icon and hit1.sizeDeltaX==battleStyle.hit and hit1.sizeDeltaY==battleStyle.hit)
    assert(not slot1:GetChild('rim').visible and not slot1:GetChild('face').visible)
    assert(slot1:GetChild('counter').visible and slot1:GetChild('counter').text=='3','HUD must prefer raw combat count')
    assert(not slot2:GetChild('counter').visible,'charged tea set has no numeric count')
    assert(slot2:GetChild('icon').imageColor.r==255,'tea set -2 is charged, never dimmed')
    assert(bar4:GetChild('slot3'):GetChild('icon').imageColor.r<255,'maw bank -2 must be visibly spent')
    assert(bar4:GetChild('slot4'):GetChild('counter').text=='0','zero is still a visible raw count')
    assert(bar4:GetChild('slot4'):GetChild('icon').imageColor.r<255,'omamori zero is exhausted')
    local width,height=hit1.sizeDeltaX,hit1.sizeDeltaY
    hit1.listeners[events.CursorEnter]()
    assert(icon1.localScaleX==1.25 and hit1.localScaleX==nil and hit1.sizeDeltaX==width and hit1.sizeDeltaY==height,'hover enlarges icon only')
    hit1.listeners[events.CursorExit]();assert(icon1.localScaleX==1)
    hit1.listeners[events.CursorEnter]();assert(h4:openRelics(1))
    assert(icon1.localScaleX==1,'modal opening resets the HUD hover')
    hit1.listeners[events.CursorEnter]();assert(icon1.localScaleX==1,'covered HUD cannot acquire hover')
    assert(h4:closeDeck());hit1.listeners[events.CursorEnter]();assert(icon1.localScaleX==1.25)
    h4.relicUI:refreshBar(h4.run,false);assert(icon1.localScaleX==1,'hidden HUD resets hover')
    -- One profile selects one shared strip and one owned-detail entrance.
    local run,combat=h4.run,h4.run.combat
    local turn,energy,hp,hand=combat.turn,combat.energy,run.hp,#combat.hand
    for _,phase in ipairs({'map','node','reward','combat','map'})do
        h4.run.phase=phase;h4.relicUI:refreshBar(h4.run,true)
        assert(slot1.x==battleStyle.origin[1] and slot1.y==battleStyle.origin[2],phase..' changed canonical position')
        assert(icon1.sizeDeltaX==battleStyle.icon and hit1.sizeDeltaX==battleStyle.hit and hit1.sizeDeltaY==battleStyle.hit,phase..' changed canonical dimensions')
        assert(not slot1:GetChild('rim').visible and not slot1:GetChild('face').visible,phase..' restored old discs')
        assert(slot1:GetChild('counter').text==(phase=='combat' and '3'or'1'),'counter reads the actual phase owner')
        assert(icon1.imageId==Theme.officialAssets.battleRelicIcons.burning_blood.id,phase..' HUD reverted to the old relic atlas')
        hit1.listeners[events.CursorEnter]();assert(icon1.localScaleX==1.25,phase..' lost shared hover')
        hit1.listeners[events.CursorExit]();assert(icon1.localScaleX==1)
        assert(h4.relicUI:open(h4.run,1));assert(h4.relicUI.selectedIndex==1,phase..' reopened the old list')
        assert(h4.relicUI.root:GetChild('single').visible and not h4.relicUI.root:GetChild('row1').visible)
        assert(h4.relicUI.root:GetChild('single'):GetChild('icon').imageId==Theme.officialAssets.battleRelicIcons.burning_blood.id,phase..' detail reverted to the old relic atlas')
        assert(h4.relicUI:close())
    end
    assert(h4.run==run and run.combat==combat and combat.turn==turn and combat.energy==energy and run.hp==hp and #combat.hand==hand,'inspection cannot mutate the controlled run')
    assert(run.relicCounters.burning_blood==1 and combat.relicCounters.burning_blood==3 and #run.relics==4)
    print('RELIC_HUD_FEEDBACK_PASS native hover raw counters charged and exhausted states')
end
