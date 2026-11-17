local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Theme,Run,Hooks=require('abyss_theme'),require('abyss_run'),require('abyss_relic_hooks')
local Art,Random,Pool=require('abyss_lowcost_art'),require('abyss_sts_random'),require('abyss_relic_pool')
local h,root=F.fixture();assert(F.start(h));assert(Run.startCombat(h.run,'cultist_solo'))
local run=h.run;run.phase='reward'
run.rewards={manualContinue=true,gold=0,goldClaimed=true,cardResolved=true,cards={},
 relics={{id='blue_candle',sourceId='Blue Candle'},{id='strike_dummy',sourceId='StrikeDummy'}}}
local rows={}
for i=1,2 do rows[i]=root:GetChild('battlePanel'):GetChild('potionHelp'):GetChild('relicReward'..i)end
local function shown(control)
 while control do if control.visible==false then return false end;control=control.parent end
 return true
end
local function same(a,b)
 assert(type(a)==type(b),'snapshot type')
 if type(a)~='table'then assert(a==b,'snapshot value');return end
 for k,v in pairs(a)do same(v,b[k])end
 for k in pairs(b)do assert(a[k]~=nil,'unexpected snapshot key')end
end
local function streams()
 return {Pool.snapshot(run.relicPool),Random.snapshot(run.cardRng),Random.snapshot(run.miscRng),Random.snapshot(run.treasureRng)}
end
local function painted(icon,id)
 local pool=assert(icon.parent:GetChild(icon.name..'Art'),'shared/native pool required')
 local asset=assert(Theme.lowCostArt.relic.assets[id])
 assert(pool.visible and not icon.visible,'visible recipe '..id)
 for i=0,15 do
  local part,shape=pool:GetChild('shape'..i),asset.shapes[i+1]
  assert(part.visible==(shape~=nil),'no stale shapes '..id)
  if shape then
   assert(part.imageId==shape.image and part.x==shape.x and part.y==shape.y,'same recipe '..id)
   assert(part.sizeDeltaX==shape.w and part.sizeDeltaY==shape.h,'same dimensions '..id)
   same(part.imageColor,shape.colour)
  end
 end
 return pool
end
local function verify(index,id)
 local row=rows[index];local icon=assert(row:GetChild('rewardIcon'))
 local pool=painted(icon,id)
 for _,state in ipairs({'normal','hover','pressed','disabled'})do
  local face=row:GetChild(state)
  assert(not face:GetChild('rewardIcon') and not face:GetChild('rewardIconArt'),'no per-state copies')
  for _,other in ipairs({'normal','hover','pressed','disabled'})do row:GetChild(other):SetVisible(other==state)end
  assert(shown(pool),'shared recipe survives state '..state)
  assert(face:GetChild('label') and face:GetChild('stsRewardFace'),'state background and label retained')
 end
 row:GetChild('normal'):SetVisible(true);row:GetChild('disabled'):SetVisible(false)
 return icon,pool
end
local before=streams();h:refresh()
-- Direct Lua discovery runs the default tree. Verify that tree's existing
-- text-only layout, real claim and RNG; the official wrapper still runs every
-- shared-pool assertion below on its explicitly generated official tree.
if Theme.presentationProfile~='official-assets-first'then
 for _,row in ipairs(rows)do
  assert(row.visible and not row:GetChild('rewardIcon') and not row:GetChild('rewardIconArt'),'default reward must remain text-only')
  for _,state in ipairs({'normal','hover','pressed','disabled'})do
   local face=row:GetChild(state)
   assert(face:GetChild('label') and not face:GetChild('stsRewardFace'),'default state face remains generated')
  end
 end
 assert(F.click(root,'battlePanel','potionHelp/relicReward1'))
 assert(run.relics[#run.relics]=='blue_candle' and run.rewards.relics[1].claimed and not rows[1].visible)
 assert(rows[2].visible and not run.rewards.relics[2].claimed)
 same(streams(),before)
 print('REWARD_RELIC_DEFAULT_PASS text-only states, one claim, unchanged RNG')
 return
end
local icon,pool=verify(1,'blue_candle');verify(2,'strike_dummy');same(streams(),before)
local writes=0
for _,shape in pairs(pool.children)do
 local original=shape.SetImage
 shape.SetImage=function(self,...)writes=writes+1;return original(self,...)end
end
h:refresh();assert(writes==0,'same row/recipe refresh is cached')
assert(Hooks.localId('Blue Candle')=='blue_candle')
assert(F.click(root,'battlePanel','potionHelp/relicReward1'))
local index=#run.relics;assert(run.relics[index]=='blue_candle' and run.rewards.relics[1].claimed)
assert(not rows[1].visible and not shown(pool),'claimed row takes fallback and pool with it')
painted(root:GetChild('relicBar'):GetChild('slot'..index):GetChild('icon'),'blue_candle')
assert(h:openRelics(index));painted(root:GetChild('relicPanel'):GetChild('single'):GetChild('icon'),'blue_candle')
same(streams(),before);assert(h:closeDeck())
-- Reuse both real rows across recipes, aliases, page hide and re-entry.
for _,pair in ipairs({{'strike_dummy','blue_candle'},{'blue_candle','calling_bell'},{'calling_bell','blue_candle'}})do
 run.rewards.relics={{id=pair[1]},{id=pair[2]}};h:refresh()
 verify(1,pair[1]);verify(2,pair[2]);assert(h:openDeck());assert(not h.battleUI.active,'overlay suspends underlying battle input')
 assert(h:closeDeck());verify(1,pair[1]);verify(2,pair[2])
end
run.rewards.relics={{id='blue_candle'},{id='strike_dummy'}};h:refresh()
icon,pool=verify(1,'blue_candle')
local function fallback(id)assert(icon.visible and icon.imageId==require('abyss_relic_view_ui').icon(id or 'blue_candle',true),'correct native fallback')end
-- Missing recipe, missing/dead/throwing pool never leave the old hidden icon.
local recipe=Theme.lowCostArt.relic.assets.blue_candle
Theme.lowCostArt.relic.assets.blue_candle=nil;h:refresh();fallback();assert(not pool.visible)
Theme.lowCostArt.relic.assets.blue_candle=recipe;h:refresh();verify(1,'blue_candle')
for _,mode in ipairs({'missing','dead','throw'})do
 local row,originalGet=rows[1],rows[1].GetChild
 if mode=='missing'then row.children.rewardIconArt=nil
 elseif mode=='dead'then row.children.rewardIconArt={alive=false}
 else row.GetChild=function(self,name)if name=='rewardIconArt'then error('injected missing pool')end;return originalGet(self,name)end end
 h:refresh();fallback();assert(not shown(pool),'unavailable pool must not leave the old recipe under fallback: '..mode);verify(2,'strike_dummy')
 row.children.rewardIconArt,row.GetChild=pool,originalGet
 h:refresh();verify(1,'blue_candle')
end
do
 local row,originalGet=rows[1],rows[1].GetChild
 row.GetChild=function(self,name)if name=='rewardIconArt'then error('injected missing pool')end;return originalGet(self,name)end
 run.rewards.relics[1]={id='calling_bell'};h:refresh();fallback('calling_bell');assert(not shown(pool));verify(2,'strike_dummy')
 row.GetChild=originalGet;h:refresh();verify(1,'calling_bell')
 run.rewards.relics[1]={id='blue_candle'};h:refresh();verify(1,'blue_candle')
end
do
 local row=rows[1];local parts={}
 for i=0,15 do parts[#parts+1]={name='shape'..i,kind='image',size={1,1}}end
 local replacement=F.control({name='rewardIconArt',kind='container',children=parts},row)
 row.children.rewardIconArt=replacement;h:refresh();verify(1,'blue_candle')
 assert(not pool.visible,'live replaced pool is retired before fallback/recipe changes')
 row.children.rewardIconArt=pool;h:refresh();verify(1,'blue_candle');assert(not replacement.visible)
 -- A stale native handle rebound to another owner must never be hidden by A.
 local previous=pool.SetVisible;pool.parent=rows[2]
 pool.SetVisible=function()error('must not write another row owner')end
 row.children.rewardIconArt=replacement;h:refresh();verify(1,'blue_candle');verify(2,'strike_dummy')
 pool.parent,pool.SetVisible=row,previous;row.children.rewardIconArt=pool
 h:refresh();verify(1,'blue_candle');assert(not replacement.visible)
end
local first=pool:GetChild('shape0');local original=first.SetImage
Art.hide(icon);local calls=0
first.SetImage=function()calls=calls+1;return false end
h:refresh();fallback();assert(not pool.visible)
h:refresh();assert(calls==1,'failed native setter is not retried by four state faces')
first.SetImage=original;Art.hide(icon);h:refresh();verify(1,'blue_candle')
-- A reentrant item replacement may not bless stale pixels or another row.
Art.hide(icon);local reentered=false
first.SetImage=function(self,...)
 if not reentered then reentered=true;run.rewards.relics[1]={id='calling_bell'};h:refresh()end
 return original(self,...)
end
h:refresh();first.SetImage=original;h:refresh();verify(1,'calling_bell');verify(2,'strike_dummy')
run.rewards.relics={{id='unknown_relic'},{id='blue_candle',sourceId='unknown_relic'}};h:refresh()
for _,row in ipairs(rows)do assert(row:GetChild('rewardIcon').visible and not row:GetChild('rewardIconArt').visible,'unknown ID cannot retain a recipe')end
same(streams(),before)
print('REWARD_RELIC_SHARED_ART_PASS same-id four-states two-rows fallback cache reentry')
