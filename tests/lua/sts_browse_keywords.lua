local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Combat=F.Combat
local cursor={CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up',CursorDrag='drag',CursorEndDrag='endDrag'}
local touch=false
local function send(hit,name,id,dragging)
 return assert(hit.listeners[name],'missing card preview input: '..name)(id and {touchId=id,dragging=dragging} or nil)
end
local function same(a,b,seen)
 if type(a)~='table' or type(b)~='table' then return a==b end
 seen=seen or {};if seen[a]==b then return true end;seen[a]=b
 for k,v in pairs(a)do if not same(v,b[k],seen)then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local host,root=F.fixture(nil,nil,nil,cursor,nil,nil,{touchScreen=function()return touch end})
assert(F.start(host))
host.run.deck={{uid=101,cardId='bash'},{uid=102,cardId='defend'}}
assert(host:openDeck());host:update(0)
local deckPanel=root:GetChild('deckPanel')
local deck=deckPanel:GetChild('grid')
local browse=F.Theme.presentationProfile=='official-assets-first' and deckPanel:GetChild('pileGrid') or deck
local a,b=browse.items[0]:GetChild('hit'),browse.items[1]:GetChild('hit')
local snapshots=Combat.copy(host.run.deck)
send(a,'enter')
local tip=assert(root:GetChild('cardKeywordTip'))
host:update(.2);assert(not tip.visible,'PC tooltip opened at the exact threshold')
host:update(.01);assert(tip.visible and tip:GetChild('copy').text:find('易伤',1,true))
send(a,'exit');assert(not tip.visible,'PC tooltip remained after exit')
send(b,'enter');host:update(.21);assert(not tip.visible,'keyword-free card opened a tip')
assert(same(snapshots,host.run.deck))
assert(host:closeDeck())

-- The separately pooled official browser uses native reusable roots.
local pooled,pooledRoot=F.fixture(nil,nil,nil,cursor,nil,nil,{touchScreen=function()return touch end},nil,F.deckBrowser())
assert(F.start(pooled));pooled.run.deck=Combat.copy(snapshots)
assert(pooled:openDeck())
for _=1,12 do pooled:update(0) end
local native=pooledRoot:GetChild('deckPanel'):GetChild('pileGrid'):GetChild('nativeBrowserCard1')
local pooledTip=pooledRoot:GetChild('cardKeywordTip')
send(native:GetChild('hit'),'enter');pooled:update(.21)
assert(pooledTip.visible and pooledTip:GetChild('copy').text:find('易伤',1,true))
assert(pooled:closeDeck());assert(not pooledTip.visible)

-- Exercise real Scry candidates plus the independent DeckUI generation-choice path.
local data=require('abyss_warrior_cards').withFoundationCards(F.Data)
local cards={};for _=1,16 do cards[#cards+1]='bash' end
local battle=Combat.new(data,{seed=42,enemies={'raven_adept'},deck=cards})
local run={phase='combat',combat=battle,combatGeneration=7,data=data,deck={}}
assert(require('abyss_scry').begin(battle,4)=='pause')
local view=host.choiceUI
assert(view:refresh(run,true));view:update(0)
local panel=root:GetChild('choicePanel')
local grid=panel:GetChild('cards')
a,b=grid and grid.items[0]:GetChild('hit') or panel:GetChild('card1'):GetChild('hit'),
 grid and grid.items[1]:GetChild('hit') or panel:GetChild('card2'):GetChild('hit')
snapshots=Combat.copy(battle)
send(a,'enter');view:update(.21);assert(tip.visible)
send(b,'enter');view:update(.21);send(a,'exit');assert(tip.visible,'late exit dismissed the latest target')
send(b,'exit');assert(not tip.visible)
touch=true
send(a,'down',6);send(a,'drag',6,true);view:update(F.Theme.layout.statusInfo.delay)
assert(not tip.visible);send(a,'up',6);assert(not send(a,'click',6) and #view.selected==0)
send(a,'down',7);view:update(F.Theme.layout.statusInfo.delay);assert(tip.visible)
send(a,'up',7);assert(not tip.visible)
for _=1,2 do
 assert(not send(a,'click',7) and #view.selected==0,'long-press tail selected the card')
end
send(a,'down',8);send(a,'up',8);assert(send(a,'click',8) and #view.selected==1)
assert(same(snapshots,battle),'browsing changed an unresolved battle')
view:close()
assert(not tip.visible)

battle.pendingChoice={op='discover',turn=battle.turn,token=4,uids={1,2},cards={{uid=1,cardId='bash'},{uid=2,cardId='defend'}}}
local picked
assert(host.deckUI:open(run,battle.pendingChoice,function(token,uid)picked={token,uid}end));host.deckUI:update(0)
a=deck.items[0]:GetChild('hit')
send(a,'down',5);send(a,'drag',5,true);host.deckUI:update(F.Theme.layout.statusInfo.delay)
assert(not tip.visible);send(a,'up',5);assert(not send(a,'click',5) and not picked)
send(a,'down',4);host.exitOpen=true;host:update(.1);host.exitOpen=false
send(a,'up',4);assert(not send(a,'click',4) and not picked,'covered touch leaked a click into the choice')
send(a,'down',9);host.deckUI:update(F.Theme.layout.statusInfo.delay);assert(tip.visible)
send(a,'up',9);assert(not tip.visible)
assert(not send(a,'click',9) and not picked,'long-press tail chose the offer')
send(a,'down',10);send(a,'up',10);send(a,'click',10)
assert(picked[1]==4 and picked[2]==1)
print('STS_BROWSE_KEYWORD_PASS browse, Scry, generated choice, timing, state and touch ownership')
