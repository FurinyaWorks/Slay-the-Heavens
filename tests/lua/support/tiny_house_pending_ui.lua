-- Public GameUI/Nodes/Run on one generated native control tree. Earlier floors
-- and (for real settlement) low boss HP are controlled, not a device run.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Map,Pending=require('abyss_run'),require('abyss_map'),require('abyss_relic_pending')
local canvas=F.control({children=F.Layout});local root=F.Viewport.apply(canvas,1280,720)
local host=F.GameUI.new(root,F.Data,F.Presentation,'click',{
 seed=TINY_HOUSE_REAL_BOSS and 11 or 1,campaign=true,campaignProfile='competition-two-act',imageSource='static',
 color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,
})
assert(F.start(host));local nodeUI=host.nodeUI
local event=root:GetChild('nodePanel'):GetChild('eventView')
assert(host.run.nodeFlow.event.id=='neow')
assert(nodeUI:press('eventView/option1'));assert(nodeUI:press('eventView/option2'))
assert(nodeUI:press('eventView/option1'));assert(host.run.phase=='map')
local run,map=host.run,host.map
local boss=require('abyss_acts').get(1).boss
while Map.available(map)[1].floor<boss do assert(Map.choose(map,Map.available(map)[1].id))end
if TINY_HOUSE_REAL_BOSS then
 -- Start from a reached earlier map floor, not a fabricated terminal result.
 -- Initial Neow completion is real; its recorded floor is now behind this fixture.
 run.floor,run.nodeFlow=boss-1,nil
 assert(F.Nodes.enter(run,map,Map.available(map)[1].id))
 assert(run.floor==boss and run.phase=='combat')
 assert(#run.combat.enemies==1,'fixture must have a single boss')
 local strike
 for _,card in ipairs(run.combat.hand)do if card.cardId=='strike'then strike=card.uid;break end end
 assert(strike,'fixture must draw a starter Strike')
 run.combat.enemies[1].hp=1
 assert(Run.play(run,strike,1))
 assert(run.phase=='reward' and Run.claimCardReward(run,0))
 dofile('tests/lua/support/finish_combat_rewards.lua')(run)
 assert(F.Nodes.completeCombat(run,map))
 assert(run.nodeFlow.result=='boss_victory')
else
 assert(Map.choose(map,Map.available(map)[1].id))
 run.floor,run.phase=boss,'map'
 run.nodeFlow={id=map.currentNodeId,floor=boss,type='boss',complete=true,result='boss_victory',mapSeed=map.seed,mapSignature=map.sourceSignature}
end
if not TINY_HOUSE_REAL_BOSS then
 local queue=run.relicPool.queues.boss;local position
 for i,id in ipairs(queue)do if id=='Tiny House'then position=i;break end end
 assert(position);table.insert(queue,1,table.remove(queue,position))
end
assert(F.Nodes.enter(run,map,Map.available(map)[1].id));assert(F.Nodes.openTreasure(run))
local rewardSlot
for i,id in ipairs(run.nodeFlow.reward.relics)do if id=='tiny_house'then rewardSlot=i;break end end
assert(rewardSlot,'fixture must draw Tiny House; first offer is '..run.nodeFlow.reward.relics[1])
local maxHp,gold,size=run.maxHp,run.gold,#run.deck
assert(F.Nodes.claimBossTreasure(run,rewardSlot));host:refresh()
assert(host.nodeUI==nodeUI and root:GetChild('nodePanel'):GetChild('eventView')==event,'same production control owner')
assert(run.maxHp==maxHp+5 and run.gold==gold and run.phase=='act_transition','selection must not charge a fee')
assert(not host:advanceAct());assert(run.act==1,'unresolved relic rewards must keep the originating act')
local function visible(control)
 while control do if control.visible==false then return false end;control=control.parent end
 return true
end
local function readable()
 local view=assert(Pending.view(run));local first=(nodeUI.pendingPage-1)*3+1
 assert(visible(event:GetChild('name')),'pending heading remains hidden after Neow')
 local body=event:GetChild('body');assert(body.text~='' and visible(body))
 assert(body.fontColor.r==F.Theme.color.text.r,'pending body retains dark Neow ink')
 local bodyRect=F.Theme.layout.nativeNode.event.body
 assert(body.x==bodyRect[1]and body.y==bodyRect[2]and body.sizeDeltaX==bodyRect[3]and body.sizeDeltaY==bodyRect[4],
  'pending body retains Neow bubble geometry')
 for i=1,3 do
  local row=view.rows[first+i-1];local box=event:GetChild('option'..i)
  assert(visible(box)==(row~=nil),'only actual choices are visible')
  if row then
   local title=box:GetChild('title')
   assert(visible(title) and title.text~='','pending choice text remains hidden after Neow')
   assert(box.sizeDeltaX==F.Theme.layout.nativeNode.event.options.size[1],'pending choice retains Neow hit width')
   assert(box:GetChild('hit').sizeDeltaX==box.sizeDeltaX,'pending text and input must share geometry')
   local nextPage=root:GetChild('nodePanel'):GetChild('confirm')
   if visible(nextPage)then
    assert(nextPage.y+nextPage.sizeDeltaY/2<=box.y-box.sizeDeltaY/2,
     'pending pagination overlays a reward choice: footer '..nextPage.y..'/'..nextPage.sizeDeltaY..' row '..box.y..'/'..box.sizeDeltaY)
   end
   local line=box:GetChild('stsNeowText');assert(not line or not visible(line),'stale Neow text overlays pending')
   assert(nodeUI.actions['eventView/option'..i].enabled,'visible choice has a legal action')
  end
 end
 assert(not visible(event:GetChild('option4')),'unused fourth row must hide')
end
readable()
local function choose(kind,choice)
 for i,row in ipairs(Pending.view(run).rows)do if row.token.kind==kind and(choice==nil or row.token.choice==choice)then
  assert(nodeUI:setPage(math.floor((i-1)/3)+1));readable()
  return nodeUI:press('eventView/option'..((i-1)%3+1))
 end end
 error('missing pending reward '..kind)
end
local stale=nodeUI.actions['eventView/option1'].handler
assert(choose('gold'));assert(run.gold==gold+50);assert(not stale());assert(run.gold==gold+50)
for _=1,Run.potionCapacity(run)do assert(Run.obtainPotion(run,'fire_potion'))end
local owner=run.pendingBossRelic;local ok,why=choose('potion')
assert(not ok and why=='potion_slots_full');assert(run.pendingBossRelic==owner and not owner.potion.claimed)
assert(Run.potionCount(run)==Run.potionCapacity(run)and run.gold==gold+50 and #run.deck==size)
nodeUI:setVisible(false);nodeUI:setVisible(true);readable()
assert(Run.discardPotion(run,1));assert(choose('potion'));assert(Run.potionCount(run)==Run.potionCapacity(run))
assert(choose('card',1));assert(#run.deck==size+1)
-- Only Continue remains: one-row page, no stale reward callbacks or duplicates.
readable();assert(#Pending.view(run).rows==1)
assert(choose('done'));assert(not Pending.owner(run))
assert(host:advanceAct());assert(run.act==2 and run.phase=='map')
assert(run.gold==gold+50 and run.maxHp==maxHp+5 and #run.deck==size+1)
assert(not F.Nodes.claimBossTreasure(run,1),'old boss reward cannot be claimed after act transition')
assert(not stale());assert(run.gold==gold+50)
-- Reuse the same page once more: pending footer/inline text cannot leak into
-- an ordinary event or a different permanent-relic choice owner.
local H=dofile('tests/helpers/act2_event_ui.lua')
local other,otherMap=H.fixture('lab')
host.run,host.map,host.mapUI.map,host.battleUI.run=other,otherMap,otherMap,other
nodeUI.run,nodeUI.map=other,otherMap;nodeUI:render();host:refresh()
assert(host.nodeUI==nodeUI and visible(event:GetChild('name')),'rebound event must use the same visible control owner')
local layout=F.Theme.layout.nativeNode
for _,key in ipairs({'back','confirm'})do
 local button=root:GetChild('nodePanel'):GetChild(key)
 assert(button.x==layout[key][1]and button.y==layout[key][2],'pending pagination position leaks into ordinary event')
end
assert(visible(event:GetChild('option1'):GetChild('title'))and event:GetChild('option1'):GetChild('title').text~='')
assert(Run.obtainRelic(other,'DollysMirror'));host:refresh()
local copied=#other.deck;assert(visible(event:GetChild('option1'):GetChild('title')))
assert(nodeUI:press('eventView/option1'))
assert(not Pending.owner(other)and #other.deck==copied+1 and run.gold==gold+50)
assert(other.nodeFlow.event.id=='lab'and visible(event:GetChild('option1'):GetChild('title')))
print('TINY_HOUSE_PENDING_UI_PASS Neow -> public boss claim -> readable rewards -> once-only -> Act2')
