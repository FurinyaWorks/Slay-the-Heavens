local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local host,ui,panel,event,tap,drain=H.setup({'defend'},{'cultist','jaw_worm'})
local battle=host.run.combat
host.run.potions={'energy_potion','fire_potion','regen_potion'};host:refresh()
local group=panel:GetChild('potionHelp')
local popup=assert(group:GetChild('potionPopup'))
local function action(name,touch)
 local c=popup:GetChild(name)
 for _,kind in ipairs({'down','up','click'})do if c.listeners and c.listeners[kind]then c.listeners[kind]({touchId=touch})end end
end
local energy=battle.energy
local first=tap('potion1',201)
assert(ui.potionMenu and popup.visible,'first tap opens source effect panel')
assert(battle.energy==energy and host.run.potions[1]=='energy_potion','opening does not use a bottle')
assert(popup:GetChild('title').text=='能量药水')
action('use',201);drain()
assert(battle.energy==energy+2 and not host.run.potions[1] and not ui.potionMenu,'explicit use commits one self potion')
action('use',201);assert(battle.energy==energy+2,'queued use cannot consume another bottle')
local hp=battle.enemies[2].hp
tap('potion2',202);action('use',202)
assert(ui.potionAim and not ui.potionMenu,'target potion enters existing aim only after explicit use')
tap('enemy2',203);drain()
assert(battle.enemies[2].hp==hp-20 and not host.run.potions[2])
local statuses=battle.player.statuses.regen or 0
tap('potion3',204);action('discard',204)
assert(not host.run.potions[3] and (battle.player.statuses.regen or 0)==statuses,'explicit discard never applies effect')
-- A stale release cannot act after a same-slot replacement.
host.run.potions[1]='energy_potion';host:refresh();tap('potion1',205)
local use=popup:GetChild('use')
use.listeners.down({touchId=206})
host.run.potions[1]='regen_potion';host:refresh()
use.listeners.up({touchId=206});use.listeners.click({touchId=206})
assert(host.run.potions[1]=='regen_potion' and battle.energy==energy+2,'slot replacement retires popup action ownership')
-- Original physical fifth slot remains available when the core grants capacity.
assert(H.Run.obtainRelic(host.run,'Potion Belt'));host.run.potions[5]='energy_potion';host:refresh()
local fifth=group:GetChild('potion5');assert(fifth.visible)
for _,kind in ipairs({'down','up','click'})do fifth.listeners[kind]({touchId=207})end
assert(ui.potionMenu and ui.potionMenu.slot==5,'fifth physical slot remains addressable')
action('dismiss',208);assert(not ui.potionMenu and host.run.potions[5]=='energy_potion')
-- Foreign pointers cannot steal A's release/click capability.
for offset,mode in ipairs({'foreignUp','foreignClick','foreignEndDrag','foreignDown'})do
 host.run.potions[1]='energy_potion';host:refresh();tap('potion1',300+offset)
 local a,b=400+offset,500+offset
 local current=host.run.combat
 local before=current.energy
 use.listeners.down({touchId=a})
 if mode=='foreignDown'then use.listeners.down({touchId=b})
 elseif mode=='foreignUp'then use.listeners.up({touchId=b})
 elseif mode=='foreignEndDrag'then use.listeners.endDrag({touchId=b})end
 use.listeners.up({touchId=a})
 if mode=='foreignClick'then use.listeners.click({touchId=b})end
 use.listeners.click({touchId=a});drain()
 assert(current.energy==before+2 and not host.run.potions[1],mode..' cannot cancel matching pointer A')
end
host.run.potions[1]='energy_potion';host:refresh();tap('potion1',601)
local current=host.run.combat
local before=current.energy
use.listeners.down({touchId=602});use.listeners.up({touchId=602});use.listeners.endDrag({touchId=602});use.listeners.click({touchId=602})
assert(current.energy==before and host.run.potions[1]=='energy_potion','matching EndDrag still cancels its token')
action('dismiss',603)
assert(popup.disableCursorEventPassthrough==true,'modal effect card must use native passthrough barrier')

-- A native event can also reach a lower hand control. Only the popup's explicit
-- dismiss surface may close it; either Down dispatch order must retain Use.
local h,u,p,e,t,d=H.setup({'defend'},{'cultist','jaw_worm'})
local pop=p:GetChild('potionHelp'):GetChild('potionPopup')
for _,count in ipairs({2,5,10})do
 for _,order in ipairs({'handFirst','popupFirst'})do
  local deck={};for i=1,count do deck[i]='defend' end
  h.run.combat=H.F.Combat.new(H.F.Data,{deck=deck,enemies={'cultist','jaw_worm'}})
  local b=h.run.combat
  while #b.hand<count do b.hand[#b.hand+1]=table.remove(b.draw)end
  h.run.potions={'energy_potion','explosive_potion','fire_potion'};h:refresh()
  for slot=1,3 do
   local touch=700+slot
   t('potion'..slot,touch)
   local useButton=pop:GetChild('use')
   local beforeEnergy,beforeBlock=b.energy,b.player.block
   local beforeHp=b.enemies[1].hp
   if order=='popupFirst'then useButton.listeners.down({touchId=touch})end
   e('card1','down',touch)
   assert(u.potionMenu and not u.gesture,'lower hand Down cannot steal popup '..count..'/'..order)
   if order=='handFirst'then useButton.listeners.down({touchId=touch})end
   useButton.listeners.up({touchId=touch});useButton.listeners.click({touchId=touch})
   e('card1','up',touch);e('card1','click',touch)
   e('card1','drag',touch);e('card1','endDrag',touch);e('card1','click',touch)
   if slot==3 then assert(u.potionAim);t('enemy1',touch+10)end
   d()
   assert(not h.run.potions[slot] and not u.potionMenu,'explicit Use retains its bottle ownership')
   assert(#b.hand==count and b.player.block==beforeBlock,'popup press must not play a lower defend')
   assert(not u.selected and not u.gesture,'closed popup tail must not select a lower card')
   assert(b.energy==beforeEnergy+(slot==1 and 2 or 0),'popup press must not spend card energy')
   assert(b.enemies[1].hp==beforeHp-(slot==2 and 10 or slot==3 and 20 or 0),'correct potion effect exactly once')
   useButton.listeners.click({touchId=touch});d()
   assert(b.enemies[1].hp==beforeHp-(slot==2 and 10 or slot==3 and 20 or 0),'duplicate popup Click is inert')
  end
  h.run.potions[1]='energy_potion';h:refresh();t('potion1',800)
  e('card1','click',801)
  assert(u.potionMenu and #b.hand==count,'click-only lower callback cannot dismiss or play through popup')
  local dismiss=pop:GetChild('dismiss')
  for _,kind in ipairs({'down','up','click'})do dismiss.listeners[kind]({touchId=802})end
  assert(not u.potionMenu and h.run.potions[1]=='energy_potion','explicit outside dismissal keeps bottle')
  for _,name in ipairs({'discard','dismiss'})do
   h.run.potions[1]='energy_potion';h:refresh();t('potion1',810)
   local actionButton=pop:GetChild(name)
   if order=='popupFirst'then actionButton.listeners.down({touchId=811})end
   e('card1','down',811)
   if order=='handFirst'then actionButton.listeners.down({touchId=811})end
   actionButton.listeners.up({touchId=811});actionButton.listeners.click({touchId=811})
   e('card1','up',811);e('card1','drag',811);e('card1','endDrag',811);e('card1','click',811)
   assert(not u.potionMenu and not u.selected and #b.hand==count,'discard/dismiss tail must not activate hand')
   assert((h.run.potions[1]~=nil)==(name=='dismiss'),'only discard removes bottle')
  end
  t('card1',811);t('playArea',821);d()
  assert(#b.hand==count-1 and b.player.block==5,'fresh deliberate card input remains usable')
 end
end

-- Forethought's real mandatory choice owns the screen. Queued top-row potion
-- callbacks must leave it intact without scheduling another host refresh.
h.run.combat=H.F.Combat.new(H.F.Data,{deck={'forethought','defend','defend'},enemies={'cultist'}})
h.run.potions={'energy_potion','explosive_potion','fire_potion'};h:refresh()
local b=h.run.combat
local slot;for i,card in ipairs(b.hand)do if card.cardId=='forethought'then slot=i end end
assert(slot,'Forethought fixture must be present')
t('card'..slot,850);t('playArea',851);d()
assert(h.deckUI.visible and not u.active,'real Forethought opens mandatory choice')
local pending=b.pendingChoice
assert(pending,'Forethought retains core pending')
local hand=#b.hand
local refresh,render=h.refresh,u.render
local refreshes,renders=0,0
h.refresh=function(self,...)refreshes=refreshes+1;return refresh(self,...)end
u.render=function(self,...)renders=renders+1;return render(self,...)end
for i=1,3 do t('potion'..i,860+i)end
h.refresh,u.render=refresh,render
assert(refreshes==0 and renders==0,'blocked potion taps must not request redraw or refresh')
assert(h.deckUI.visible and b.pendingChoice==pending and #b.hand==hand and not u.potionMenu,'blocked taps retain selection owner')
assert(h.run.potions[1]=='energy_potion' and h.run.potions[2]=='explosive_potion' and h.run.potions[3]=='fire_potion','blocked taps do not use bottles')

-- Click-only compatibility still owns its trailing native callbacks. A new
-- named touch may act immediately, while a new Down can reclaim the same ID.
local ch,cu,cp,ce,ct,cd=H.setup({'defend','defend'},{'cultist','jaw_worm'})
local clickPopup=cp:GetChild('potionHelp'):GetChild('potionPopup')
for index,name in ipairs({'use','discard','dismiss'})do
 local touch=900+index*10
 ch.run.potions[1]=name=='use' and 'fire_potion' or 'energy_potion';ch:refresh()
 cp:GetChild('potion1').listeners.click({touchId=901})
 assert(cu.potionMenu)
 clickPopup:GetChild(name).listeners.click({touchId=touch})
 cp:GetChild('card1'):GetChild('hit').listeners.click({touchId=touch})
 assert(not cu.selected and not cu.gesture,'click-only popup tail cannot select hand: '..name)
 if name=='use'then assert(cu.potionAim,'click-only tail cannot cancel target potion aim')end
 cp:GetChild('card1'):GetChild('hit').listeners.click({touchId=touch+1})
 assert(cu.selected,'new click-only touch can select a card')
 cu.selected=nil;cu.potionAim=nil;ch:refresh()
end
ch.run.potions[1]='energy_potion';ch:refresh()
cp:GetChild('potion1').listeners.click({touchId=901})
clickPopup:GetChild('dismiss').listeners.click()
cp:GetChild('card1'):GetChild('hit').listeners.click()
assert(not cu.selected,'one anonymous popup tail is conservatively consumed')
cp:GetChild('card1'):GetChild('hit').listeners.click()
assert(cu.selected,'anonymous barrier must retire after one ambiguous click')
cu.selected=nil;ch:refresh()
ct('card1',930);ct('playArea',940);cd()
assert(#ch.run.combat.hand==1,'same-touch fresh Down can still play after popup click-only actions')
print('APPROVED_MAIN_POTIONS_PASS')
