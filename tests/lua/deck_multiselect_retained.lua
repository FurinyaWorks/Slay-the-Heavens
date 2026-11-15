local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local h,u,p,event,tap,drain=H.setup({'forethought','defend','defend','defend'},{'cultist','jaw_worm'})
local F,Run=H.F,H.Run
local CardDisplay=require('abyss_card_display')
local function forethought(upgraded)
 h.run.combat=F.Combat.new(F.Data,{deck={'forethought','defend','defend','defend'},enemies={'cultist'}})
 local b=h.run.combat
 local slot;for i,c in ipairs(b.hand)do if c.cardId=='forethought'then slot=i;c.upgraded=upgraded end end
 h:refresh();tap('card'..slot,1);tap('playArea',2);drain();h.deckUI:update()
 assert(h.deckUI.visible and b.pendingChoice)
 return b,h.deckUI,h.deckUI.root:GetChild('grid')
end
local b,deck,grid=forethought(true)
local generation,session=deck.generation,deck.openSession
local rng=b.cardRandomRng.counter
local refreshes,artWrites=0,0
local refresh,write=grid.RefreshItems,CardDisplay.writeNativeArt
grid.RefreshItems=function(self,...)refreshes=refreshes+1;return refresh(self,...)end
CardDisplay.writeNativeArt=function(...)artWrites=artWrites+1;return write(...)end
local cell=grid.items[1];local uid=deck.bindings[cell].uid
local token=b.pendingChoice.token
cell:GetChild('hit').listeners.click({touchId=10})
assert(#b.pendingChoice.selected==1 and b.pendingChoice.selected[1]==uid,'one click selects exact live UID')
assert(deck.visible and deck.openSession==session and deck.generation==generation,'multi-select retains its modal session')
assert(cell:GetChild('uid').text=='已选择','choice marker appears in the same callback')
assert(refreshes==0 and artWrites==0,'choice toggle does not rebuild Grid or native art')
assert(deck.root:GetChild('title').text:find('已选1',1,true))
assert(not Run.chooseCard(h.run,token,uid),'old token remains rejected')
for _,selected in ipairs({false,true,false,true})do
 cell:GetChild('hit').listeners.click({touchId=11})
 assert((#b.pendingChoice.selected==1)==selected,'rapid second click toggles exactly once')
 assert((cell:GetChild('uid').text=='已选择')==selected)
 assert(deck.openSession==session and refreshes==0 and artWrites==0)
end
assert(b.cardRandomRng.counter==rng,'selection does not advance RNG')
local stale=cell:GetChild('hit').listeners.click
deck.root:GetChild('close'):GetChild('hit').listeners.click()
drain()
assert(not b.pendingChoice and not deck.visible,'explicit confirm commits and closes')
local free
for _,c in ipairs(b.draw)do if c.uid==uid then free=c.freeToPlayOnce end end
assert(free and b.cardRandomRng.counter==rng,'Forethought retains source free-play effect and RNG')
local hand=#b.hand;stale({touchId=12});assert(#b.hand==hand,'closed session callback is inert')
CardDisplay.writeNativeArt=write;grid.RefreshItems=refresh

-- Single-select remains an immediate command and closes its old modal.
b,deck,grid=forethought(false)
assert(deck:back()==false,'single mandatory choice cannot cancel')
local oldSession=deck.openSession
local chosen=deck.bindings[grid.items[0]].uid
grid.items[0]:GetChild('hit').listeners.click({touchId=20});drain()
assert(not deck.visible and not b.pendingChoice and deck.openSession==oldSession,'single-select commits once without reopening')
local found;for _,c in ipairs(b.draw)do if c.uid==chosen then found=c.freeToPlayOnce end end
assert(found)

-- Source Forethought+ explicitly permits zero selected cards.
b,deck,grid=forethought(true)
local zeroHand,zeroRng=#b.hand,b.cardRandomRng.counter
assert(#b.pendingChoice.selected==0);deck:back();drain()
assert(not b.pendingChoice and not deck.visible and #b.hand==zeroHand and b.cardRandomRng.counter==zeroRng,'zero selection confirms without changing cards or RNG')

-- A command callback may switch owners before returning to this view.
b,deck,grid=forethought(true)
local original=deck.onPick
deck.onPick=function(token,id)
 original(token,id);deck:close()
 h.run.combat=F.Combat.new(F.Data,{deck={'defend'},enemies={'cultist'}});h:refresh()
end
grid.items[0]:GetChild('hit').listeners.click({touchId=21})
assert(not deck.visible and h.run.combat~=b,'returning callback cannot resurrect its old modal')

-- A real doubled Liquid Memories choice requires two distinct cards. The core
-- replaces selected[] while toggling; the retained view must adopt that table.
h.run.combat=F.Combat.new(F.Data,{deck={'defend','defend','defend','strike'},enemies={'cultist'}})
b=h.run.combat
while #b.hand>1 do b.discard[#b.discard+1]=table.remove(b.hand)end
assert(Run.obtainRelic(h.run,'sacred_bark'))
-- Relic acquisition commits a detached Run transaction, replacing its combat
-- table. The UI follows the live owner rather than the pre-acquisition copy.
assert(h.run.combat~=b,'fixture must follow the committed relic transaction')
b=h.run.combat
h.run.potions={'liquid_memories'};h:refresh();assert(u:usePotion(1));drain();deck=h.deckUI;deck:update()
grid=deck.root:GetChild('grid');local close=deck.root:GetChild('close'):GetChild('hit')
assert(b.pendingChoice.required==2 and not close.interactable)
session=deck.openSession
local first,second,third=grid.items[0],grid.items[1],grid.items[2]
first:GetChild('hit').listeners.click({touchId=30});assert(not close.interactable)
second:GetChild('hit').listeners.click({touchId=31});assert(close.interactable and #b.pendingChoice.selected==2)
local limited=b.pendingChoice.token
third:GetChild('hit').listeners.click({touchId=32})
assert(#b.pendingChoice.selected==2 and b.pendingChoice.token==limited and third:GetChild('uid').text=='','required limit rejects overflow')
first:GetChild('hit').listeners.click({touchId=33});assert(not close.interactable and #b.pendingChoice.selected==1)
assert(deck.openSession==session and deck.choiceSelected==b.pendingChoice.selected)
assert(deck:back()==false,'incomplete required selection cannot confirm')
first:GetChild('hit').listeners.click({touchId=34});assert(close.interactable)
assert(h:openMenu());assert(h:returnToMainMenu());assert(not deck.visible)
assert(h:continueRun());deck:update();assert(deck.visible and deck.openSession>session)
assert(deck.choiceToken==b.pendingChoice.token,'reopen adopts current core token')
local owner=b.pendingChoice
h.run.combat=F.Combat.new(F.Data,{deck={'defend'},enemies={'cultist'}})
first:GetChild('hit').listeners.click({touchId=35})
assert(b.pendingChoice==owner and #owner.selected==2,'old battle owner rejects queued click')
print('DECK_MULTISELECT_RETAINED_PASS')
