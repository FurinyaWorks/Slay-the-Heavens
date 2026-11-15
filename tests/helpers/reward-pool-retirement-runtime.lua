-- PR689's unavailable/replaced/foreign-owner pool contract on PC18's existing
-- per-state owners. This does not adopt PR689's separate shared-root geometry.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Theme,View=require('abyss_run'),require('abyss_theme'),require('abyss_relic_view_ui')
local Copy=require('abyss_copy').copy
local host,root=F.fixture();assert(F.start(host));assert(Run.startCombat(host.run,'cultist_solo'))
local run=host.run;run.phase='reward'
run.rewards={manualContinue=true,gold=0,goldClaimed=true,cardResolved=true,cards={},relics={{id='blue_candle'},{id='strike_dummy'}}}
local rows=root:GetChild('battlePanel'):GetChild('potionHelp')
host:refresh()
local expected=Copy(run)
local Painter=require('abyss_battle_reward_layout')
local platform={imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
local activePart,activeState,activeName,peerPart
local passed,failed=0,{}
local function check(name,fn)
 local ok,why=pcall(fn)
 if ok then passed=passed+1 else failed[#failed+1]=name..': '..tostring(why);print('REWARD_POOL_RETIREMENT_FAIL '..failed[#failed])end
end
local function same(a,b)
 assert(type(a)==type(b),'full Run/RNG snapshot type')
 if type(a)~='table'then assert(a==b,'full Run/RNG snapshot value');return end
 for k,v in pairs(a)do same(v,b[k])end
 for k in pairs(b)do assert(a[k]~=nil,'full Run/RNG extra key')end
end
local function peerPixels()
 local icon,pool=peerPart:GetChild('rewardIcon'),peerPart:GetChild('rewardIconArt')
 local pixels={iconVisible=icon.visible,imageId=icon.imageId,poolVisible=pool.visible,shapes={}}
 for n=0,15 do
  local shape=pool:GetChild('shape'..n)
  pixels.shapes[n+1]={visible=shape.visible,imageId=shape.imageId,x=shape.x,y=shape.y,
   w=shape.sizeDeltaX,h=shape.sizeDeltaY,rotation=Copy(shape.rotation),colour=Copy(shape.imageColor)}
 end
 return pixels
end
local function refresh()
 -- Keep the real generated Host owner, invoke its current production painter
 -- directly for each fault; avoid repeating unrelated full scene refreshes.
 -- Only the fixture's deliberate reward replacement changes the oracle.
 -- Keep one complete immutable deep snapshot of all other Run/data/RNG fields.
 expected.rewards=Copy(run.rewards)
 local peerBefore=peerPixels()
 assert(peerBefore.poolVisible and not peerBefore.iconVisible,'both real rows stay painted in this fixture')
 assert(Painter.paintButton(activeName,activePart,activeState,run,platform,function()end,function()end))
 same(run,expected)
 same(peerPixels(),peerBefore)
end
local function painted(part,id)
 local icon,pool=part:GetChild('rewardIcon'),assert(part:GetChild('rewardIconArt'))
 assert(pool.visible and not icon.visible,'current recipe must recover '..id)
 for n=0,15 do
  local shape,source=pool:GetChild('shape'..n),Theme.lowCostArt.relic.assets[id].shapes[n+1]
  assert(shape.visible==(source~=nil),'no stale shapes')
  if source then assert(shape.imageId==source.image and shape.x==source.x and shape.y==source.y,'current recipe identity')end
 end
 return icon,pool
end
local function replacement(part)
 local children={};for n=0,15 do children[#children+1]={name='shape'..n,kind='image',size={1,1}}end
 return F.control({name='rewardIconArt',kind='container',children=children},part)
end
local row=tonumber(os.getenv('REWARD_POOL_ROW'))
assert(row==1 or row==2,'one existing row per fresh process; retain the original 60-second budget')
for index=row,row do for _,state in ipairs({'normal','hover','pressed','disabled'})do
 local part=rows:GetChild('relicReward'..index):GetChild(state)
 activePart,activeState,activeName=part,state,'relicReward'..index
 peerPart=rows:GetChild('relicReward'..(3-index)):GetChild(state)
 local label='row'..index..' '..state
 for _,changed in ipairs({false,true})do for _,mode in ipairs({'missing','dead','throw'})do
  run.rewards.relics[index]={id='blue_candle'};refresh()
  local icon,pool=painted(part,'blue_candle');local get=part.GetChild
  if mode=='missing'then part.children.rewardIconArt=nil
  elseif mode=='dead'then part.children.rewardIconArt={alive=false}
  else part.GetChild=function(self,name)if name=='rewardIconArt'then error('injected unavailable pool')end;return get(self,name)end end
  local id=changed and'calling_bell'or'blue_candle';run.rewards.relics[index]={id=id};refresh()
  check(label..' '..(changed and'changed'or'same')..' '..mode,function()
   assert(icon.visible and icon.imageId==View.icon(id,true),'correct native fallback')
   assert(not pool.visible,'old recipe must be retired when lookup is unavailable')
  end)
  part.children.rewardIconArt,part.GetChild=pool,get;refresh();painted(part,id)
 end end
 run.rewards.relics[index]={id='blue_candle'};refresh()
 local _,pool=painted(part,'blue_candle');local nextPool=replacement(part)
 part.children.rewardIconArt=nextPool;refresh();painted(part,'blue_candle')
 local oldHidden=not pool.visible
 part.children.rewardIconArt=pool;refresh();painted(part,'blue_candle')
 check(label..' replacement',function()
  assert(oldHidden,'live replaced pool must retire')
  assert(not nextPool.visible,'replacement retires when original returns')
 end)
 local foreign=rows:GetChild('relicReward'..(3-index)):GetChild(state)
 local set=pool.SetVisible;pool.parent=foreign
 pool.SetVisible=function()error('must not write another owner')end
 part.children.rewardIconArt=nextPool
 check(label..' foreign owner',function()refresh();painted(part,'blue_candle')end)
 pool.parent,pool.SetVisible=part,set;part.children.rewardIconArt=pool;refresh();painted(part,'blue_candle')
 F.monsterActors().destroy(pool)
 pool.SetVisible=function()error('must not write a destroyed handle')end
 assert(pool.alive==false and not pcall(pool.GetChild,pool,'shape0'),'engine destroyed handle is inaccessible')
 check(label..' destroyed handle',function()
  refresh();local icon=part:GetChild('rewardIcon')
  assert(icon.visible and icon.imageId==View.icon('blue_candle',true),'destroyed pool keeps native fallback')
 end)
 part.children.rewardIconArt=replacement(part);refresh();painted(part,'blue_candle')
end end
print('REWARD_POOL_RETIREMENT_CASES row'..row..' '..passed..' '..#failed)
assert(#failed==0,table.concat(failed,'; '))
assert(passed==36,'one row x 4 states x (6 unavailable + replacement + foreign owner + destroyed handle)')
print('REWARD_POOL_RETIREMENT_PASS row'..row..' 36 FULL_RUN_RNG_UNCHANGED')
