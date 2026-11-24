-- The actual official layout and virtual cell callbacks drive the core choices.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Combat=require('abyss_combat')
local Discard=require('abyss_discard')
local Choice=require('abyss_choice_ui')
local Gate=require('abyss_page_reveal')
local spec
for _,layer in ipairs(F.Layout)do
 for _,panel in ipairs(layer.children or {})do if panel.name=='choicePanel'then spec=panel end end
end

local function setup(begin,confirm,base,cardId)
 local deck={};for i=1,30 do deck[i]=cardId or 'defend'end
 local data=cardId and require('abyss_warrior_cards').withFoundationCards(F.Data) or F.Data
 local battle=Combat.new(data,{deck=deck,enemies={'raven_adept'},seed=42,enableStances=true})
 local run={phase='combat',combat=battle,combatGeneration=7}
 begin(battle)
 local root=F.control(assert(spec))
 local grid=root:GetChild('cards')
 grid.indexBase=base or 0
 local calls=0
 local view=Choice.new(root,F.Presentation,'click',{imageSource='static',
  cursorEvents={CursorDown='down',CursorUp='up',CursorEndDrag='endDrag'},
  color=function(red,g,blue,a)return {r=red,g=g,b=blue,a=a}end},
  function(kind,uids,token,generation,owner)
   calls=calls+1;assert(generation==7 and owner==battle)
   return confirm(battle,uids,token,generation,kind)
  end)
 assert(view:refresh(run,true))
 local function getHit(name)
  local item=type(name)=='number' and grid.items[name-1] or root:GetChild(name)
  return assert(item:GetChild('hit'))
 end
 local function event(name,kind,touch)
  return assert(getHit(name).listeners[kind])({touchId=touch})
 end
 local function tap(name,touch)
  touch=touch or 1;event(name,'down',touch);event(name,'up',touch);return event(name,'click',touch)
 end
 return view,root,grid,battle,run,tap,event,function()return calls end,getHit
end

local function discard(battle)
 Combat.draw(battle,10-#battle.hand);assert(#battle.hand==10)
 assert(Discard.begin(battle,9));assert(battle.pendingDiscard.count==9)
end
local function discardPick(battle,uids,token)return Discard.choose(battle,uids,token)end
for _,base in ipairs({0,1})do
 local view,root,grid,battle,_,tap,_,calls=setup(discard,discardPick,base)
 grid.deferRefresh=true
 view:update();assert(grid.itemCount==1 and not view:presentationReady())
 grid:flush();view:update();assert(grid.itemCount==10 and not view:presentationReady())
 for i=0,8 do grid:recycle(i,i+base)end
 assert(not view:presentationReady(),'partial viewport published')
 grid:recycle(9,9+base);assert(view:presentationReady())
 assert(not root:GetChild('before').visible and not root:GetChild('after').visible)
 assert(not tap('confirm') and calls()==0)
 local expected={}
 for i=10,2,-1 do
  expected[#expected+1]=battle.hand[i].uid
  assert(tap(i));assert(grid.items[i-1]:GetChild('uid').text=='已选 '..#expected)
 end
 local ok,why=tap(1);assert(not ok and why=='too_many_choices')
 assert(#battle.hand==10 and #battle.discard==0,'preview mutated Core')
 local remaining=battle.hand[1]
 assert(tap('confirm') and calls()==1 and not view.visible and not grid.visible and grid.itemCount==0)
 assert(not battle.pendingDiscard and #battle.hand==1 and battle.hand[1]==remaining)
 for i,uid in ipairs(expected)do assert(battle.discard[i].uid==uid,'real discard commit changed selection order')end
 assert(not tap('confirm') and calls()==1)
end

for _,change in ipairs({'generation','candidate','pending'})do
 local view,_,_,battle,run,tap,event,calls=setup(discard,discardPick)
 view:update();assert(tap(1));event('confirm','down',4);event('confirm','up',4)
 if change=='generation'then run.combatGeneration=run.combatGeneration+1
 elseif change=='candidate'then battle.hand[1],battle.hand[2]=battle.hand[2],battle.hand[1]
 else battle.pendingDiscard=Combat.copy(battle.pendingDiscard)end
 assert(not event('confirm','click',4) and not view:select(1) and calls()==0,'stale choice accepted '..change)
end

local scry=require('abyss_scry')
local view,root,grid,battle,_,tap=setup(function(b)assert(scry.begin(b,10)=='pause')end,scry.choose)
assert(not tap('confirm') and battle.pendingScry,'confirmation ran before the scroller was populated')
view:update()
local top,size=battle.draw[#battle.draw],#battle.draw
assert(#view.cards==10 and root:GetChild('confirm'):GetChild('hit').interactable,'Scry lost zero-selection confirmation')
assert(tap('confirm') and not view.visible and not battle.pendingScry and #battle.draw==size and battle.draw[#battle.draw]==top)

view,root,grid,battle,_,tap=setup(function(b)
 assert(Combat.play(b,b.hand[1].uid));assert(b.pendingHandChoice.mode=='put_on_deck')
end,Combat.chooseHand,0,'warcry')
view:update();assert(root:GetChild('title').text=='放回抽牌堆顶' and grid.itemCount==#battle.hand)
assert(not root:GetChild('before').visible and not root:GetChild('after').visible)
local returned=battle.hand[#battle.hand]
assert(tap(#battle.hand) and tap('confirm') and battle.draw[#battle.draw]==returned and not view.visible)

view,root,grid,battle,_,tap=setup(function(b)
 b.combatGeneration=7;Combat.resolvePotionActions(b,{{op='potionStanceChoice'}})
end,Combat.choosePotionStance)
view:update();assert(not grid.visible and view:presentationReady())
assert(root:GetChild('option1').visible and root:GetChild('option2').visible)
assert(tap('option2') and tap('confirm') and battle.player.stance=='Calm' and not view.visible)

local pile=require('abyss_pile_choice')
local function seek(b)assert(pile.begin(b,'seek',2,7)=='pause')end
local function retrieve(b,uids,token,generation)return pile.choose(b,uids,token,generation,Combat)end
local run,event,calls,hit
view,root,grid,battle,run,tap,event,calls,hit=setup(seek,retrieve)
view:update();assert(grid.itemCount>20 and view:presentationReady())
local coverWrites=0
local cover={SetVisible=function()coverWrites=coverWrites+1 end,SetAsLastSibling=function()end,GetChild=function()end}
local owner={mode='battle',run=run,choiceUI=view}
local gate=Gate.new(cover,function()return view:presentationReady()end)
assert(not gate:step(Gate.intent(owner)) and gate:step(Gate.intent(owner)))
local epoch,writes=gate.epoch,coverWrites
local first,last=view.cards[2].uid,view.cards[#view.cards].uid
assert(tap(2))
event(1,'down',5);event(1,'up',5)
local retired=hit(1)
grid.destroyOnRecycle=true;grid:recycle(0,0);grid.destroyOnRecycle=false
assert(not retired.listeners.click({touchId=5}) and #view.selected==1,'destroyed card executed its queued click')
view:update()
event(1,'down',6);event(1,'up',6)
grid.scrollProgress=.25
assert(not event(1,'click',6) and #view.selected==1,'scroll position moved but the old gesture survived')
event(1,'down',3);event(1,'up',3)
grid.scrollProgress=1
grid:recycle(0,#view.cards-1)
assert(not event(1,'click',3),'a recycled physical cell consumed the previous card gesture')
event(1,'down',4);event(1,'up',4)
assert(not hit(1).listeners.click({touchId=4,dragging=true}),'scroll drag selected a card')
assert(not event(1,'click',4),'second click reused the rejected drag gesture')
assert(tap(1) and view.selected[1]==first and view.selected[2]==last)
assert(grid.items[0]:GetChild('uid').text=='已选 2')
for _,name in ipairs({'before','after'})do
 local button=root:GetChild(name);local target=button:GetChild('hit')
 assert(not button.visible and not target.interactable and not target.raycastTarget and not target.click)
end
grid.scrollProgress=0
assert(grid.itemCount==#view.cards)
grid:recycle(0,1)
assert(grid.items[0]:GetChild('uid').text=='已选 1','recycled cell did not repaint the ordered selection')
assert(not gate:step(Gate.intent(owner)) and not gate:covered() and gate.epoch==epoch and coverWrites==writes,
 'browsing or selecting changed the page reveal')
assert(tap('confirm') and calls()==1 and not battle.pendingPileChoice)
assert(battle.hand[#battle.hand-1].uid==first and battle.hand[#battle.hand].uid==last,'pile retrieval lost order')

view,root,grid,battle,run=setup(seek,retrieve)
grid.deferRefresh=true
view:update()
local stale=grid.refreshCallback
view:close();assert(view:refresh(run,true));view:update()
stale(grid:recycle(0,0),1)
assert(not view:presentationReady())
view:update();grid:flush()
assert(view:presentationReady(),'new choice did not publish after an obsolete callback')
print('OFFICIAL_CHOICE_GRID_PASS')
