-- UI-only candidate fixture. Real discard begin/choose enforce Core's hand/count rules.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Combat=require('abyss_combat')
local Discard=require('abyss_discard')
local Choice=require('abyss_choice_ui')
local Theme=require('abyss_theme')
assert(Theme.layout.combatChoice.columns*Theme.layout.combatChoice.rows==2)
local spec
for _,layer in ipairs(F.Layout)do for _,panel in ipairs(layer.children or {})do if panel.name=='choicePanel'then spec=panel end end end
local function setup()
 local deck={};for i=1,15 do deck[i]='defend'end
 local battle=Combat.new(F.Data,{deck=deck,enemies={'raven_adept'},seed=42})
 Combat.draw(battle,10-#battle.hand);assert(#battle.hand==10)
 -- count==10 auto-discards in Core, so the largest genuine pending choice is nine.
 assert(Discard.begin(battle,9));assert(battle.pendingDiscard and battle.pendingDiscard.count==9)
 local run={phase='combat',combat=battle,combatGeneration=7}
 local root=F.control(assert(spec));local calls=0
 local view=Choice.new(root,F.Presentation,'click',{imageSource='static',
  cursorEvents={CursorDown='down',CursorUp='up'},color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end},
  function(kind,uids,token,generation,owner)
   calls=calls+1;assert(kind=='discard'and generation==7 and owner==battle)
   return Discard.choose(battle,uids,token)
  end)
 assert(view:refresh(run,true))
 local function event(name,kind,touch)
  return assert(root:GetChild(name):GetChild('hit').listeners[kind])({touchId=touch})
 end
 local function tap(name,touch)event(name,'down',touch or 1);event(name,'up',touch or 1);return event(name,'click',touch or 1)end
 return view,root,battle,run,tap,event,function()return calls end
end
local view,root,battle,run,tap,event,calls=setup()
local candidates={};for i,card in ipairs(battle.hand)do candidates[i]=card.uid end
assert(not tap('before')and not tap('confirm')and calls()==0)
assert(not view:select(3),'unbuilt slot accepted')
local expected={}
for page=1,5 do
 assert(view.page==page and #view.selected==#expected)
 assert(tap('card2'));expected[#expected+1]=candidates[page*2]
 if page<5 then assert(tap('card1'));expected[#expected+1]=candidates[page*2-1]end
 if page==1 then event('confirm','down',9);event('confirm','up',9)end
 if page<5 then
  assert(tap('after'));assert(event('confirm','click',9)==false and calls()==0,'old physical confirm survived paging')
 end
end
assert(#view.selected==9 and root:GetChild('confirm'):GetChild('hit').interactable)
local ok,why=tap('card1');assert(not ok and why=='too_many_choices')
assert(not tap('after'),'sixth page accepted')
assert(tap('before')and view.page==4 and tap('after')and view.page==5)
for i,uid in ipairs(expected)do assert(view.selected[i]==uid,'page return changed UID selection order')end
assert(#battle.hand==10 and #battle.discard==0,'preview mutated Core')
assert(tap('confirm')and calls()==1 and battle.pendingDiscard==nil)
assert(not view.visible and #battle.hand==1 and battle.hand[1].uid==candidates[9])
for i,uid in ipairs(expected)do assert(battle.discard[i].uid==uid,'real discard commit changed selection order')end
assert(not tap('confirm')and calls()==1,'duplicate confirmation committed')
for _,change in ipairs({'generation','candidate','pending'})do
 local u,r,b,s,click,emit,commits=setup()
 assert(click('card1'));emit('confirm','down',4);emit('confirm','up',4)
 if change=='generation'then s.combatGeneration=s.combatGeneration+1
 elseif change=='candidate'then b.hand[1],b.hand[2]=b.hand[2],b.hand[1]
 else b.pendingDiscard=Combat.copy(b.pendingDiscard)end
 assert(not emit('confirm','click',4)and not click('after')and not u:select(1)and commits()==0,'stale choice accepted '..change)
 assert(#b.hand==10 and #b.discard==0)
end
local function sourceChoice(module,begin,confirm)
 local deck={};for i=1,25 do deck[i]='defend'end
 local b=Combat.new(F.Data,{deck=deck,enemies={'raven_adept'},seed=42})
 local run={phase='combat',combat=b,combatGeneration=7}
 assert(begin(module,b)=='pause')
 local r=F.control(spec)
 local u=Choice.new(r,F.Presentation,'click',{imageSource='static',color=function(red,g,blue,a)return {r=red,g=g,b=blue,a=a}end},
  function(_kind,uids,token,generation)return confirm(module,b,uids,token,generation)end)
 assert(u:refresh(run,true))
 local function click(name)return assert(r:GetChild(name):GetChild('hit').listeners.click)()end
 return u,r,b,click
end
local scry=require('abyss_scry')
local u,r,b,click=sourceChoice(scry,function(m,s)return m.begin(s,10)end,
 function(m,s,uids,token)return m.choose(s,uids,token)end)
local top=b.draw[#b.draw];local size=#b.draw
assert(#u.cards==10 and r:GetChild('confirm'):GetChild('hit').interactable,'Scry lost zero-selection confirmation')
for page=2,5 do assert(click('after')and u.page==page)end
assert(click('before')and click('after')and #u.selected==0)
assert(click('confirm')and not u.visible and b.pendingScry==nil and #b.draw==size and b.draw[#b.draw]==top and #b.discard==0)
local pile=require('abyss_pile_choice')
u,r,b,click=sourceChoice(pile,function(m,s)return m.begin(s,'seek',2,7)end,
 function(m,s,uids,token,generation)return m.choose(s,uids,token,generation,Combat)end)
assert(#u.cards>10,'large pile fixture lost candidates')
local first=u.cards[2].uid
assert(click('card2')and click('after')and click('after')and click('after')and click('after')and click('after'))
assert(u.page==6)
local later=u.cards[11].uid
assert(click('card1')and click('before')and click('after'))
assert(u.selected[1]==first and u.selected[2]==later and click('confirm')and not u.visible and b.pendingPileChoice==nil)
assert(b.hand[#b.hand-1].uid==first and b.hand[#b.hand].uid==later,'pile retrieval lost cross-page order')
print('OFFICIAL_CHOICE_PAGINATION_PASS')
