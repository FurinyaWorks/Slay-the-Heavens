local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Select=require('abyss_character_select')
local canvas=F.control({children=F.Layout})
local root=F.Viewport.apply(canvas,1280,720)
local seeds=0
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='enddrag'}
local ui=F.GameUI.new(root,F.Data,F.Presentation,'click',{campaign=true,campaignProfile='competition-two-act',
 imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,
 cursorEvents=cursor,deckBrowser=F.deckBrowser(),newSeed=function()seeds=seeds+1;return 3 end})
local function hit(name)return root:GetChild('characterPanel'):GetChild(name):GetChild('hit')end
assert(ui:start()and not ui.run and not ui.map)
local panel=root:GetChild('characterPanel')
for i=1,4 do
 local control=hit('character'..i)
 assert(not panel:GetChild('character'..i).visible and not control.click())
 local finger={touchId=30+i}
 control.listeners.down(finger);control.listeners.up(finger)
 assert(not control.click(finger))
end
-- Default layout keeps the available Traveler target and hides the four unavailable tiles.
assert(not panel:GetChild('character4').visible and panel:GetChild('traveler').visible)
local traveler=hit('traveler')
local selectGeo={touchId=40}
traveler.listeners.down(selectGeo);traveler.listeners.up(selectGeo)
assert(traveler.click(selectGeo) and ui.characterSelection.info.id=='ironclad')
assert(not panel:GetChild('elements').visible)
local deckOpen=panel:GetChild('details'):GetChild('deckOpen'):GetChild('hit')
local deckPanel=root:GetChild('deckPanel')
assert(deckOpen.click()and ui.characterSelection.deckOpen and deckPanel.visible)
for _=1,60 do
 if not ui.deckUI.pendingGrid then break end
 ui:update(.016)
end
assert(not ui.deckUI.pendingGrid and not ui.deckUI.prepareError)
-- The real shared browser fills the full starter deck and its live card text.
local visibleCards=0
for _,card in ipairs(deckPanel:GetChild('pileGrid'):GetChildren())do
 if card.visible then
  visibleCards=visibleCards+1
  local face=card:GetChild('face')
  assert(face:GetChild('name').text~='' and face:GetChild('cost').text~='' and face:GetChild('label').text~='',
   'starter browser painted an empty face')
 end
end
assert(visibleCards==10,'starter browser lost cards')
assert(ui:closeCharacters()and not ui.characterSelection.deckOpen and ui.characterOpen)
for _,id in ipairs({'hutao','arlecchino','furina','raiden'})do assert(not ui:selectCharacter(id))end
assert(ui:selectCharacter('traveler')and ui.characterSelection.info.id=='ironclad')
for i,id in ipairs(Select.elements)do
 local box=panel:GetChild('elements'):GetChild('element'..i)
 if i==1 then assert(not panel:GetChild('elements').visible)else
  assert(not box.visible)
  assert(not box:GetChild('hit').click()and not ui:selectElement(id))
 end
end
assert(ui.characterSelection.info.id=='ironclad'and seeds==0 and not ui.run)
-- A stale/corrupt info object must be refused before sampling a new seed.
local valid=ui.characterSelection.info
ui.characterSelection.info={id='silent'}
assert(not ui:confirmCharacter()and seeds==0 and not ui.run)
ui.characterSelection.info=valid
local confirm=hit('confirm')
-- A touch started behind the read-only deck must not survive either return path.
for i,close in ipairs({function()return ui:closeCharacters()end,
 function()return deckPanel:GetChild('close'):GetChild('hit').click()end})do
 confirm.listeners.down({touchId=20+i})
 assert(deckOpen.click()and ui.characterSelection.deckOpen)
 assert(not ui:confirmCharacter()and seeds==0 and not ui.run,'deck modal must reject direct confirmation')
 assert(close()and not ui.characterSelection.deckOpen)
 confirm.listeners.up({touchId=20+i})
 assert(not confirm.click({touchId=20+i})and seeds==0 and not ui.run,'stale confirm crossed starter-deck modal')
end
confirm.listeners.down({touchId=1});assert(ui:selectElement('ironclad'))
confirm.listeners.up({touchId=1});assert(not confirm.click({touchId=1})and seeds==0)
confirm.listeners.down({touchId=2});ui:resize(1600,900)
confirm.listeners.up({touchId=2});assert(not confirm.click({touchId=2})and seeds==0)
assert(ui:closeCharacters()and ui.characterSelection.info==nil)
assert(ui:start()and ui:selectCharacter('traveler'))
local fresh={touchId=3}
confirm.listeners.down(fresh);confirm.listeners.up(fresh)
assert(confirm.click(fresh)and seeds==1 and not ui.run.characterProfile and ui.run.maxHp==80)
assert(not confirm.click(fresh)and not ui:confirmCharacter()and seeds==1)
-- Host configuration can carry a prepared identity even when the nominal
-- selection is Geo. Refuse before sampling a seed, not by throwing from Run.
local prepared=require('abyss_run_card_catalog').prepareSelected(F.Data,'silent')
local blockedRoot=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local samples=0
local blocked=F.GameUI.new(blockedRoot,prepared,F.Presentation,'click',{
 campaign=true,campaignProfile='competition-two-act',imageSource='static',
 color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,newSeed=function()samples=samples+1;return 3 end})
assert(blocked:start())
local selected,selectionReason=blocked:selectCharacter('traveler')
assert(not selected and selectionReason=='competition_character_unavailable')
assert(blocked.characterSelection.character==nil and blocked.characterSelection.info==nil and samples==0 and not blocked.run)
-- Keep the original confirm-time defense covered even if a stale/corrupt
-- selection model bypasses the earlier source-aware selection rejection.
blocked.characterSelection.character,blocked.characterSelection.element='traveler','ironclad'
blocked.characterSelection.info={id='ironclad'}
assert(not blocked.characterSelection:canConfirm())
assert(not blocked:confirmCharacter()and samples==0 and not blocked.run)
-- Fault injection bypasses only the model predicate, not the actual Host/Run
-- source checks; retain the original beginRun pre-seed defense assertion.
local canConfirm=blocked.characterSelection.canConfirm
blocked.characterSelection.canConfirm=function()return true end
local called,accepted,why=pcall(blocked.confirmCharacter,blocked)
blocked.characterSelection.canConfirm=canConfirm
assert(called and not accepted and why=='competition_character_unavailable'and samples==0 and not blocked.run,
 'configured-source denial sampled seed or escaped as a runtime error: '..tostring(samples)..'/'..tostring(accepted))
print('COMPETITION_ROSTER_UI_PASS native controls/direct config/touch/stale confirm; native/natural NOT_RUN')
