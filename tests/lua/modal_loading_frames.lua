package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local GameUI=require('abyss_game_ui');local make=GameUI.new
local held=false;local heldPage='deckPanel';local failure;local onReady
GameUI.new=function(root,data,presentation,event,p)
 p.controllerApi={events={Confirm='navConfirm',Cancel='navCancel'},directions={Left='left',Right='right'},modes={Specified='specified'},
  isController=function()return false end,getFocus=function()end,setFocus=function()end}
 p.presentationReady=function(intent)
  if onReady then local callback=onReady;onReady=nil;callback()end
  if intent.page==heldPage and held then return false,failure end
  return true
 end
 return make(root,data,presentation,event,p)
end
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Gate=require('abyss_page_reveal')
local host,root=F.fixture(nil,function()return true end,nil,{CursorDown='down',CursorUp='up'})
local cover=root:GetChild('pageReveal');local veil=cover:GetChild('veil')
local function tick()host:update(1/60);host.pageReveal:step(Gate.intent(host));host:refresh()end
local function settle()for _=1,4 do tick()end;assert(not host.pageReveal:covered())end
settle();assert(host:start());settle();assert(F.confirmStart(host));settle()
assert(require('abyss_run').startCombat(host.run,'cultist_solo'));host:refresh();settle()
local run=host.run;local originalBattle=run.combat;local before=F.Combat.copy(run)
local function same(a,b)
 if type(a)~='table' or type(b)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
assert(host:openMenu() and not cover.visible,'ready settings uses its existing modal without a loading flash')
assert(host:closeExit() and not cover.visible)
assert(host:openPotions() and not cover.visible,'ready potion modal publishes synchronously')
assert(host:closePotions() and not cover.visible)
heldPage='potionPanel';held=true;assert(host:openPotions())
assert(cover.visible and veil.size[1]==F.Theme.layout.modal.size[1] and veil.size[2]==F.Theme.layout.modal.size[2])
assert(host:closePotions() and not cover.visible);held=false;heldPage='deckPanel'
root:GetChild('battlePanel'):GetChild('topBar'):GetChild('battleRoute'):GetChild('hit').click()
assert(host.routeOpen and cover.visible,'a whole-page route preview must retain its full publication boundary')
assert(veil.size[1]==F.Theme.canvas.base[1] and veil.size[2]==F.Theme.canvas.base[2],'route map incorrectly borrowed a battle-local loading frame')
assert(host:closeExit());settle()
held=true;assert(host:openDeck('draw'))
assert(host.pageReveal:covered() and cover.visible,'unready modal retains input barrier')
assert(veil.size[1]<F.Theme.canvas.base[1] and veil.size[2]<F.Theme.canvas.base[2],'same ready base must not acquire a full-screen black veil')
local viewport=F.Theme.layout.deckView.viewport
assert(veil.size[1]==viewport[3] and veil.size[2]==viewport[4],'pending list is protected by its existing viewport bounds')
assert(not host.battleUI.active,'covered battle input stays disabled')
assert(root:GetChild('battlePanel').visible,'same-page backdrop stays mounted')
for _=1,5 do tick();assert(cover.visible and host.pageReveal:covered())end
assert(host:closeDeck())
assert(not cover.visible and not host.pageReveal:covered(),'closing pending modal immediately restores its ready base');held=false
assert(host:openDeck('draw'));assert(not host.pageReveal:covered() and not cover.visible,'warm synchronous modal publishes in the same paint')
local geometryWrites=0;local setSize=veil.SetSizeDelta
veil.SetSizeDelta=function(self,...)geometryWrites=geometryWrites+1;return setSize(self,...)end
for i=1,100 do assert(host.deckUI:setPileSort(i%2==0 and 'name' or 'cost'))end
assert(not cover.visible,'sorting must not flash the global veil')
assert(geometryWrites==0,'ready sorting redundantly rewrote cover geometry')
veil.SetSizeDelta=setSize
assert(host:closeDeck() and not cover.visible,'closing a ready modal must not flash the global veil')
assert(host.run==run and host.run.combat==originalBattle,'modal transitions preserve current run and battle identity')
local after=F.Combat.copy(run);after.elapsedSeconds=before.elapsedSeconds
assert(same(after,before),'modal transitions preserve complete rules and RNG; only ordinary elapsed time may advance')
-- Failure does not expose unready content or strand the ready parent.
held=true;assert(host:openDeck('draw'));failure='injected unavailable';tick()
assert(host.pageReveal.state=='failed' and cover.visible and not host.battleUI.active)
assert(veil.size[1]==viewport[3] and veil.size[2]==viewport[4])
assert(host:closeDeck() and not cover.visible and not host.pageReveal:covered())
failure=nil
-- A late ready result cannot publish a modal closed by a reentrant callback.
assert(host:openDeck('draw'));local epoch=host.pageReveal.epoch
onReady=function()assert(host:closeDeck())end
tick()
assert(not host.deckUI.visible and host.pageReveal.intent.page=='battlePanel' and host.pageReveal.epoch>epoch)
assert(not cover.visible and not host.pageReveal:covered())
held=false
for _=1,8 do assert(host:openDeck('draw') and not cover.visible);assert(host:closeDeck() and not cover.visible)end
-- A different battle is a real page owner change and still needs the full cover.
host.run.combat=F.Combat.new(F.Data,{enemies={'jaw_worm'},deck={'strike'}});host:refresh()
assert(cover.visible and veil.size[1]==F.Theme.canvas.base[1] and veil.size[2]==F.Theme.canvas.base[2])
settle()
-- Real same-battle settlement and its reward-card picker retain the ready scene.
host.run.combat=F.Combat.new(host.run.data,{enemies={'acid_slime_s'},deck={'bludgeon'}});host:refresh();settle()
host.battleUI:playSlot(1);host.battleUI:playSelected(1)
for _=1,400 do
 assert(not cover.visible,'same battle death/reward transition flashed a full cover')
 if not host.battleUI.busy then break end
 tick()
end
assert(host.run.phase=='reward')
root:GetChild('battlePanel'):GetChild('cardReward').click()
assert(host.battleUI.rewardScreen=='cards' and not cover.visible)
assert(host.battleUI:controllerBack() and not cover.visible)
-- A real upgraded True Grit command opens the shared mandatory choice UI.
host.run.phase='combat';host.run.combat=F.Combat.new(host.run.data,{enemies={'cultist'},deck={'true_grit','defend','strike'}})
local slot
for i,card in ipairs(host.run.combat.hand)do if card.cardId=='true_grit'then card.upgraded=true;slot=i end end
assert(slot);host:refresh();settle();heldPage='choicePanel';held=true;host.battleUI:playSlot(slot);host.battleUI:playSelected(nil)
for _=1,400 do if not host.battleUI.busy then break end tick()end
assert(host.choiceUI.visible and cover.visible and host.pageReveal:covered(),'pending choice keeps input barrier')
assert(veil.size[1]==F.Theme.layout.combatChoice.panel[3] and veil.size[2]==F.Theme.layout.combatChoice.panel[4])
local chosen=#host.choiceUI.selected
assert(not root:GetChild('choicePanel'):GetChild('card1'):GetChild('hit').click())
assert(#host.choiceUI.selected==chosen,'pending choice accepted an input')
held=false;tick()
assert(host.choiceUI.visible and not cover.visible,'mandatory same-battle choice must not flash a full cover')
print('MODAL_LOADING_FRAMES_PASS settings/potions/rewards/mandatory-choice')
local Run,Map=require('abyss_run'),require('abyss_map')
for _,kind in ipairs({'camp','shop','treasure'})do
 local h,r=F.fixture(nil,function()return true end)
 local current,map=Run.new(F.Data,42),Map.generate(F.Data,42)
 while true do
  local choices=Map.available(map);assert(#choices>0)
  local found;for _,node in ipairs(choices)do if node.type==kind then found=node;break end end
  if found then assert(F.Nodes.enter(current,map,found.id));break end
  assert(Map.choose(map,choices[1].id))
 end
 current.gold=999
 h.run,h.map=current,map;h.battleUI.run=current;h.mapUI.map=map;h.nodeUI.run,h.nodeUI.map=current,map;h:refresh()
 for _=1,4 do h:update(1/60);h.pageReveal:step(Gate.intent(h));h:refresh()end
 assert(not h.pageReveal:covered())
 local frame=r:GetChild('pageReveal')
 local action=({camp='campView/forge',shop='shopView/removal',treasure='treasureView/chest'})[kind]
 assert(h.nodeUI:press(action))
 assert(not frame.visible and not h.pageReveal:covered(),kind..' same-room action flashed full cover')
 if kind~='treasure'then assert(h.nodeUI:press('back') and not frame.visible)end
 h.run.roomGeneration=h.run.roomGeneration+1;h:refresh()
 local body=frame:GetChild('veil')
 assert(frame.visible and body.size[1]==F.Theme.canvas.base[1] and body.size[2]==F.Theme.canvas.base[2],'new room generation borrowed an old ready base')
 h:disable()
 assert(not h:openDeck() and not h:refresh(),'retired host accepted a delayed modal action')
end
print('MODAL_LOADING_FRAMES_PASS ready-base/cold-local/warm-immediate/100sort/close/failure/reentry/reopen/new-battle')
