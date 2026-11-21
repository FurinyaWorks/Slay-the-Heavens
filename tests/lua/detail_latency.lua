local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local host,ui,panel,_,_,_,_,root=H.setup({'bash','defend'})
local counts={render=0,deck=0,close=0,refresh=0}
local function spy(object,key,counter)
 local old=object[key];object[key]=function(...) counts[counter]=counts[counter]+1;return old(...) end
end
spy(ui,'render','render');spy(host.deckUI,'open','deck');spy(host.deckUI,'close','close');spy(host,'refresh','refresh')
local before=H.F.Combat.copy(host.run)
assert(host:openRelics(1));assert(host.relicUI.visible and host.deckUI.visible and not ui.active)
assert(counts.deck==0 and counts.close==0,'relic entry built then discarded the deck')
assert(counts.refresh==1,'relic entry refreshed twice')
assert(host:closeDeck());assert(ui.active)
counts.render=0
assert(ui:openHelp({kind='card',index=0,uid=host.run.combat.hand[1].uid},panel:GetChild('card1'):GetChild('hit'),false))
assert(ui.info and panel:GetChild('statusInfo').visible)
assert(counts.render==0,'detail open repainted the battle')
assert(ui:showStatus(0));assert(not ui.info)
assert(ui:showStatus(0));assert(ui.info.index==0)
assert(ui:showStatus(0));assert(not ui.info and not panel:GetChild('statusInfo').visible)
assert(counts.render==0,'status toggle repainted the battle')
-- Existing Down closes the reader and consumes its Click; no card is played.
local beforeHand=#host.run.combat.hand
assert(ui:showStatus(0))
local hit=panel:GetChild('card1'):GetChild('hit')
hit.listeners.down({touchId=71})
assert(not ui.info,'new Down must close explicit details')
if hit.listeners.up then hit.listeners.up({touchId=71}) end
hit.listeners.click({touchId=71})
assert(#host.run.combat.hand==beforeHand and not ui.selected,'close click passed through')
-- Content is re-read, never cached by mutable actor identity.
host.run.combat.player.hp=17
assert(ui:showStatus(0))
assert(panel:GetChild('statusInfo'):GetChild('summary').text:find('17',1,true))
ui:showStatus(0)
host.run.combat.player.hp=before.combat.player.hp
local function same(a,b)
 if type(a)~='table' or type(b)~='table' then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
assert(same(before,host.run),'detail browsing changed run/RNG')
-- Guards preserved without opening a hidden deck first.
ui.busy=true;assert(not host:openRelics(1));ui.busy=false
host.exitOpen=true;assert(not host:openRelics(1));host.exitOpen=false
assert(host:openRelics(1));assert(not host:openRelics(1));assert(host:closeDeck())
print('DETAIL_LATENCY_PASS')
