-- Short real Host coverage for the additional battle reward binding. Other
-- potion surfaces retain their earlier full 42-recipe test evidence.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Art,Theme,Run=require('abyss_lowcost_art'),require('abyss_theme'),require('abyss_run')
local host,root=F.fixture();assert(F.start(host))
local run=host.run;run.nodeFlow=nil;run.phase='map';assert(Run.startCombat(run,'cultist_solo'))
run.phase='reward';run.rewards={manualContinue=true,gold=0,goldClaimed=true,cardResolved=true,cards={},relics={},potion={id='strength_potion'}}
local battle=root:GetChild('battlePanel')
local states={'normal','hover','pressed','disabled'}
local function icon(row,state)local owner=battle:GetChild(row)or battle:GetChild('potionHelp'):GetChild(row);return owner:GetChild('rewardIcon')or owner:GetChild(state):GetChild('rewardIcon')end
local function pool(i)return assert(i.parent:GetChild(i.name..'Art'))end
local function painted(i,kind,id)
 local asset=Theme.lowCostArt[kind].assets[id];local p=pool(i)
 assert(p.visible and not i.visible,kind..' visible '..id)
 for n=0,Theme.lowCostArt[kind].capacity-1 do
  local s=p:GetChild('shape'..n);assert(s.visible==(n<#asset.shapes),'stale shape '..id)
  if asset.shapes[n+1]then assert(s.imageId==asset.shapes[n+1].image and s.x==asset.shapes[n+1].x,'recipe '..id)end
 end
end
local writes=0
for _,row in ipairs({'relicReward1','relicReward2','claimPotion'})do for _,state in ipairs(states)do
 for _,s in pairs(pool(icon(row,state)).children)do
  for _,name in ipairs({'SetImage','SetAnchoredPosition','SetSizeDelta','SetLocalRotation'})do
   local original=s[name];s[name]=function(self,...)writes=writes+1;return original(self,...)end
  end
  local prior=getmetatable(s);local colour=s.imageColor;rawset(s,'imageColor',nil)
  local meta={};for key,value in pairs(prior)do meta[key]=value end
  meta.__index=function(self,key)if key=='imageColor'then return colour end;return prior.__index(self,key)end
  meta.__newindex=function(self,key,value)if key=='imageColor'then writes=writes+1;colour=value else prior.__newindex(self,key,value)end end
  setmetatable(s,meta)
 end
end end
local function cached()local before=writes;host:refresh();assert(writes==before,'same-frame reward art rewrites no primitive')end
for _,pair in ipairs({{{id='old_coin',sourceId='Old Coin'},{id='pear',sourceId='Pear'}},
 {{id='pear',sourceId='Pear'},{id='old_coin',sourceId='Old Coin'}},
 {{id='calling_bell'},{id='boot',sourceId='Boot'}}})do
 run.rewards.relics=pair;host:refresh()
 for _,state in ipairs(states)do for slot=1,2 do painted(icon('relicReward'..slot,state),'relic',pair[slot].id)end end
 cached()
end
-- These two potion IDs share the old atlas resource; authored recipes must
-- still switch, clear stale shapes and keep repeated refreshes cached.
assert(Theme.icon.potion.strength_potion==Theme.icon.potion.fear_potion,'same-atlas fixture')
for _,id in ipairs({'strength_potion','fear_potion'})do
 run.rewards.potion={id=id};host:refresh()
 for _,state in ipairs(states)do painted(icon('claimPotion',state),'potion',id)end;cached()
end
for _,row in ipairs({'relicReward1','relicReward2','claimPotion'})do
 local target=icon(row,'normal');local first=pool(target):GetChild('shape0');local original=first.SetImage
 Art.hide(target);local calls=0;first.SetImage=function()calls=calls+1;return false end
 host:refresh();assert(target.visible and not pool(target).visible,'native failure retains '..row..' fallback')
 host:refresh();assert(calls==1,'failed reward source not retried every refresh')
 first.SetImage=original;Art.hide(target);host:refresh();assert(pool(target).visible,'recover after explicit reset')
end
run.rewards.relics={{id='unknown_relic'},{id='old_coin',sourceId='unknown_relic'}};run.rewards.potion={id='unknown_potion'};host:refresh()
for _,row in ipairs({'relicReward1','relicReward2','claimPotion'})do for _,state in ipairs(states)do
 local i=icon(row,state);assert(i.visible and not pool(i).visible,'unknown reward fallback')
end end
run.rewards.relics={};run.rewards.potion=nil;host:refresh()
for _,row in ipairs({'relicReward1','relicReward2','claimPotion'})do for _,state in ipairs(states)do assert(not pool(icon(row,state)).visible,'empty row clears art')end end
-- Unrelated gold/key/card owners retain their independent pool if present.
local platform={imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
for _,row in ipairs({'goldReward','emeraldKeyReward','cardReward'})do
 local target=icon(row,'normal');local parts={};for i=0,15 do parts[#parts+1]={name='shape'..i,kind='image',size={1,1}}end
 target.parent.children.rewardIconArt=F.control({name='rewardIconArt',kind='container',children=parts},target.parent)
 assert(Art.paint(target,'relic','old_coin',28,platform))
 require('abyss_battle_reward_layout').paintButton(row,target.parent,'normal',run,platform,function()end,function()end)
 painted(target,'relic','old_coin');target.parent.children.rewardIconArt=nil
end
run.rewards.relics={{id='pear',sourceId='Pear'},{id='old_coin',sourceId='Old Coin'}};run.rewards.potion={id='strength_potion'};host:refresh()
for _,state in ipairs(states)do painted(icon('relicReward1',state),'relic','pear');painted(icon('relicReward2',state),'relic','old_coin');painted(icon('claimPotion',state),'potion','strength_potion')end
-- Pool lookup may disappear after a successful paint hid the original icon.
-- Exercise the real callers on the same item, not only Art.paint's return value.
local function unavailablePool(target,kind,id,fallback)
 for _,mode in ipairs({'missing','dead','throw'})do
  host:refresh();painted(target,kind,id)
  local parent,name=target.parent,target.name..'Art'
  local original,parentGet=parent.children[name],parent.GetChild
  if mode=='missing'then parent.children[name]=nil
  elseif mode=='dead'then parent.children[name]={alive=false}
  else parent.GetChild=function(self,key)if key==name then error('injected pool lookup failure')end;return parentGet(self,key)end end
  host:refresh()
  assert(target.visible and target.imageId==fallback,'same-item '..kind..' '..mode..' pool must expose original fallback')
  parent.children[name],parent.GetChild=original,parentGet
  host:refresh();painted(target,kind,id)
 end
end
for _,row in ipairs({'relicReward1','relicReward2'})do
 local id=row=='relicReward1'and'pear'or'old_coin'
 unavailablePool(icon(row,'normal'),'relic',id,require('abyss_relic_view_ui').icon(id,true))
end
unavailablePool(icon('claimPotion','normal'),'potion','strength_potion',Theme.icon.potion.strength_potion)
-- The shop uses its existing Host controller and generated offers unchanged.
local Map,Nodes=require('abyss_map'),require('abyss_nodes')
local shopRun,map=Run.new(F.Data,42),Map.generate(F.Data,42)
while not shopRun.nodeFlow do
 local available=Map.available(map);assert(#available>0)
 for _,node in ipairs(available)do if node.type=='shop'then assert(Nodes.enter(shopRun,map,node.id));break end end
 if not shopRun.nodeFlow then assert(Map.choose(map,available[1].id))end
end
host.run,host.map=shopRun,map;host.nodeUI.run,host.nodeUI.map=shopRun,map
shopRun.nodeFlow.potions[1].id='strength_potion';host:refresh()
local shopIcon=root:GetChild('nodePanel'):GetChild('shopView'):GetChild('potion1'):GetChild('icon')
unavailablePool(shopIcon,'potion','strength_potion',Theme.icon.potion.strength_potion)
print('REWARD_ART_RUNTIME_PASS 2 4')
