-- Enumerate source aliases from the actual Geo queue; no parallel alias table.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Theme,Run,Rewards,Hooks,View=require('abyss_theme'),require('abyss_run'),require('abyss_relic_rewards'),require('abyss_relic_hooks'),require('abyss_relic_view_ui')
local Copy=require('abyss_copy').copy
local host,root=F.fixture();assert(F.start(host))
local run=host.run;run.nodeFlow=nil;run.phase='map';assert(Run.startCombat(run,'cultist_solo'))
run.phase='reward';run.rewards={manualContinue=true,gold=0,goldClaimed=true,cardResolved=true,cards={},relics={}}
local aliases={}
for _,queue in pairs(run.relicPool.catalog.queues)do for _,sourceId in ipairs(queue)do
 local definition=assert(Rewards.definition(run,sourceId))
 if Hooks.localId(sourceId)~=definition.id then aliases[#aliases+1]={id=definition.id,sourceId=sourceId}end
end end
table.sort(aliases,function(a,b)return a.id<b.id end);assert(#aliases==13,'complete existing unresolved queue alias set')
local expected=Copy(run)
local function same(a,b,path)
 if a==b then return end
 assert(type(a)==type(b),'state type '..path)
 if type(a)~='table'then assert(a==b,'state value '..path);return end
 for key,value in pairs(a)do same(value,b[key],path..'/'..tostring(key))end
 for key in pairs(b)do assert(a[key]~=nil,'state field '..path..'/'..tostring(key))end
end
local battle=root:GetChild('battlePanel'):GetChild('potionHelp')
local states={'normal','hover','pressed','disabled'}
local function face(row,state)return battle:GetChild('relicReward'..row):GetChild(state)end
local passed,failed=0,{}
local function check(name,fn)
 local ok,why=pcall(fn)
 if ok then passed=passed+1 else failed[#failed+1]=name..': '..tostring(why);print('REWARD_ALIAS_FAIL '..failed[#failed])end
end
local function assertFace(part,id)
 local icon,pool=part:GetChild('rewardIcon'),part:GetChild('rewardIconArt')
 assert(icon.imageId==View.icon(id,true),'canonical native image '..tostring(id))
 local asset=Theme.lowCostArt.relic.assets[id]
 assert(pool.visible==(asset~=nil)and icon.visible==(asset==nil),'canonical semantic/native visibility '..tostring(id))
 if asset then for i=0,15 do
  local shape=pool:GetChild('shape'..i);local source=asset.shapes[i+1]
  assert(shape.visible==(source~=nil),'stale primitive '..tostring(id))
  if source then assert(shape.imageId==source.image and shape.x==source.x and shape.y==source.y,'canonical primitive '..tostring(id))end
 end end
end
local function setItems(items)
 run.rewards.relics=items;expected.rewards=Copy(run.rewards)
 host:refresh();same(run,expected,'fullRun/RNG')
end
for _,tuple in ipairs(aliases)do
 setItems({Copy(tuple),Copy(tuple)})
 for row=1,2 do for _,state in ipairs(states)do
  check(tuple.sourceId..' row'..row..' '..state,function()assertFace(face(row,state),tuple.id)end)
 end end
end
print('REWARD_ALIAS_MATRIX '..passed..' '..#failed)
-- Authoritative source remains first even when a contradictory old ID is known.
for _,fixture in ipairs({
 {item={id='calling_bell',sourceId='Old Coin'},wanted='old_coin'},
 {item={id='unknown_relic',sourceId='Bronze Scales'},wanted='bronze_scales'},
 {item={id='old_coin',sourceId='unknown_relic'},wanted='unknown_relic'},
 {item={id='old_coin'},wanted='old_coin'},
})do
 setItems({fixture.item,Copy(fixture.item)})
 for row=1,2 do for _,state in ipairs(states)do
  check('source-first '..fixture.wanted..' row'..row..' '..state,function()assertFace(face(row,state),fixture.wanted)end)
 end end
end
-- Existing previews without run.data keep the preexisting Hooks alias fallback.
local platform={imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
for _,fixture in ipairs({{source='Old Coin',wanted='old_coin'},{source='Bronze Scales',wanted='Bronze Scales'},{source='unknown_relic',wanted='unknown_relic'}})do
 local preview={rewards={relics={{id='calling_bell',sourceId=fixture.source}}}}
 local before=Copy(preview)
 check('no-data preview '..fixture.source,function()
  assert(require('abyss_battle_reward_layout').paintButton('relicReward1',face(1,'normal'),'normal',preview,platform,function()end,function()end))
  assertFace(face(1,'normal'),fixture.wanted);same(preview,before,'preview')
 end)
end
setItems({});for row=1,2 do for _,state in ipairs(states)do assert(not face(row,state):GetChild('rewardIconArt').visible,'empty reward clears previous art')end end
same(run,expected,'finalFullRun/RNG')
print('REWARD_ALIAS_FULL_RUN_RNG_UNCHANGED')
assert(#failed==0,table.concat(failed,'; '))
assert(passed==139,'104 alias faces + 32 source-first faces + 3 no-data previews')
print('REWARD_ALIAS_RUNTIME_PASS 13_ALIASES 2_ROWS 4_STATES 139_CHECKS')
