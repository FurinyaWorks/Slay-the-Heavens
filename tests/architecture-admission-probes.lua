-- These probes execute the complete immutable old modules and current modules
-- in separate VMs. Public full integration fixtures run separately; dependency
-- faults here expose short-circuit order and partial writes at each boundary.
local Copy=require('abyss_copy').copy
local Random=require('abyss_sts_random')
local count=0
local function observe(label,fn,...)
 local input=table.pack(...)
 local result=table.pack(pcall(fn,table.unpack(input,1,input.n)))
 if not result[1] and type(result[2])=='string'then result[2]=result[2]:gsub(':%d+: ',':LINE: ')end
 ADMISSION_GRAPH_WRITE({input=input,result=result},label,false)
 count=count+1
end
local function private(name,entry)
 local source=assert(ADMISSION_SOURCES[name])
 local extended,n=source:gsub('return M%s*$','return M,'..entry)
 assert(n==1,'exact module export')
 local _,fn=assert(load(extended,'@src/lua/'..name..'.lua'))()
 return fn
end
local Map=require('abyss_map')
local emerald=private('abyss_map','emeraldNode')
local Data={rules={map={floors=17,generatedRows=15,bossFloor=16,bossTreasureFloor=17,restFloor=15,treasureFloor=9,
 nodeTypes={'combat','elite','camp','shop','event','treasure','boss'}}},enemies={encounters={}}}
local base=Map.generate(Data,'42',1,{endingUnlocked=true,emeraldOwned=false})
local selected=assert(base.emeraldSelection.nodeId)
observe('emerald-valid',emerald,Copy(base),selected)
for i,value in ipairs({false,1,'owner',{},setmetatable({}, {})})do observe('emerald-owner-'..i,emerald,value,selected)end
local function mapCase(label,edit)
 local map=Copy(base);edit(map);observe('emerald-'..label,emerald,map,selected)
end
for _,field in ipairs({'nodes','emeraldSelection','runSeed','seed','sourceSignature','mapSeed'})do
 for i,value in ipairs({false,1,'',{},setmetatable({}, {})})do
  mapCase(field..'-'..i,function(map)map[field]=value end)
 end
 mapCase(field..'-nil',function(map)map[field]=nil end)
end
for _,field in ipairs({'version','act','x','y','nodeId'})do
 for i,value in ipairs({false,'invalid',-1,0,1,3,6,7,14,15,1.5,0/0})do
  mapCase('selection-'..field..'-'..i,function(map)map.emeraldSelection[field]=value end)
 end
 mapCase('selection-'..field..'-nil',function(map)map.emeraldSelection[field]=nil end)
end
mapCase('already-boosted',function(map)map.emeraldBoost=false;map.nodes=false end)
mapCase('selection-meta',function(map)setmetatable(map.emeraldSelection,{})end)
mapCase('nodes-meta',function(map)setmetatable(map.nodes,{})end)
mapCase('bad-first-node',function(map)map.nodes[1]=false end)
mapCase('duplicate-selected',function(map)map.nodes[#map.nodes+1]=Copy(map.nodes[1]);map.nodes[#map.nodes].id=selected end)
for _,field in ipairs({'type','hasEmeraldKey','lane','floor'})do
 mapCase('selected-'..field,function(map)for _,node in ipairs(map.nodes)do if node.id==selected then node[field]=false end end end)
end
local terminal=private('abyss_ending_history','terminal')
local function endingFixture()
 local run={campaign=true,act=3,floor=51,runSeed='42',character='ironclad',encounterTier='boss',encounterId='boss',
 lastResult={outcome='victory',encounterId='boss'},nodeFlow={id='ending',type='event',roomKind='ending',complete=true,
 result='normal_victory',floor=51,mapSignature='signature',mapSeed='42'}}
 local map={act=3,floor=51,runSeed='42',sourceSignature='signature',currentNodeId='ending',path={'ending'},
 nodes={{id='ending',floor=51,type='event',roomKind='ending'}}}
 local entry={seed='42',character='ironclad',role='ironclad'}
 return run,map,entry
end
observe('ending-valid',terminal,endingFixture())
for _,section in ipairs({'run','flow','result','map','entry','node'})do
 local fields=({run={'campaign','act','floor','runSeed','character','encounterTier','encounterId'},
 flow={'id','type','roomKind','complete','result','floor','mapSignature','mapSeed'},result={'outcome','encounterId','allEnemiesEscaped'},
 map={'act','floor','runSeed','sourceSignature','currentNodeId','path','nodes'},entry={'seed','character','role'},node={'id','floor','type','roomKind'}})[section]
 for _,field in ipairs(fields)do for i,value in ipairs({false,1,'wrong',{}})do
  local run,map,entry=endingFixture()
  local target=({run=run,flow=run.nodeFlow,result=run.lastResult,map=map,entry=entry,node=map.nodes[1]})[section]
  target[field]=value;observe('ending-'..section..'-'..field..'-'..i,terminal,run,map,entry)
 end end
end
for _,section in ipairs({'nodeFlow','lastResult'})do for i,value in ipairs({false,1,'invalid',{}})do
 local run,map,entry=endingFixture();run[section]=value;observe('ending-owner-'..section..'-'..i,terminal,run,map,entry)
end end
for i,value in ipairs({false,1,'invalid',{},setmetatable({}, {})})do local run,_,entry=endingFixture();observe('ending-map-'..i,terminal,run,value,entry)end
local Treasure=require('abyss_treasure_source')
local function treasureFixture()
 local relic={kind='relic',id='anchor',sourceId='Anchor',requestedId='Anchor',tier='common',available=true,
 trace={},origin='base',linkedSlot=3,slot=2}
 return {items={{kind='gold',amount=23,slot=1},relic,{kind='sapphire',relicId='anchor',linkedSlot=2,slot=3}},
 gold=23,relicId='anchor',relicSourceId='Anchor',relicUnavailable=false,sapphireKey={relicId='anchor',linkedSlot=2,slot=3}}
end
observe('treasure-valid',Treasure.pair,treasureFixture())
for _,field in ipairs({'items','gold','relicId','relicSourceId','relicUnavailable','sapphireKey','extraRelics','unknown'})do
 for i,value in ipairs({false,1,'invalid',{},setmetatable({}, {})})do
  local reward=treasureFixture();reward[field]=value;observe('treasure-'..field..'-'..i,Treasure.pair,reward)
 end
end
for slot=1,3 do
 for _,field in ipairs({'kind','slot','amount','id','sourceId','requestedId','tier','available','trace','origin','linkedSlot','relicId'})do
  for i,value in ipairs({false,1,'invalid',{}})do
   local reward=treasureFixture();reward.items[slot][field]=value
   observe('treasure-item-'..slot..'-'..field..'-'..i,Treasure.pair,reward)
  end
 end
end
local function call(run,name,...)
 run.calls[#run.calls+1]={name,...};run.partial=(run.partial or 0)+1
 if run.fault=='throw-'..name then error('injected-'..name)end
 if run.fault=='reject-'..name then return false,'rejected-'..name end
 return true
end
local Run={}
function Run.gainGold(run,n)call(run,'gainGold',n);run.gold=run.gold+n;return n end
function Run.prepareRelic(run,options)
 local ok,why=call(run,'prepareRelic',options);if not ok then return nil,why end
 return {id='anchor'},{pool=true}
end
function Run.heal(run,n)call(run,'heal',n);local h=math.min(n,run.maxHp-run.hp);run.hp=run.hp+h;return h end
function Run.obtainCard(run,id)
 local ok,why=call(run,'obtainCard',id);if not ok then return false,why end
 if run.blocked then return true,'curse_blocked'end
 local uid=#run.deck+10;run.deck[#run.deck+1]={cardId=id,uid=uid};return true,uid
end
function Run.obtainRelic(run,id)local ok,why=call(run,'obtainRelic',id);if not ok then return false,why end;run.relics[#run.relics+1]=id;return true,id end
function Run.eventDamage(run,n)local ok,why=call(run,'eventDamage',n);if not ok then return false,why end;run.hp=run.hp-n;return true,n end
function Run.eventNormalDamage(run,n)return Run.eventDamage(run,n)end
function Run.removeCard(run,uid)
 local ok,why=call(run,'removeCard',uid);if not ok then return false,why end
 for i,card in ipairs(run.deck)do if card.uid==uid then table.remove(run.deck,i);return true,card end end
 return false,'missing-card'
end
package.loaded.abyss_run=Run
package.loaded.abyss_living_wall={purgeCards=function(run)return run.deck end}
local function eventRun(act)
 return {act=act,gold=100,hp=40,maxHp=80,deck={{uid=1,cardId='strike'}},relics={},calls={},miscRng=Random.fromSeed('42'),
 data={cards={cards={{id='strike',name='打击',type='attack'}}}}}
end
local Wheel=require('abyss_wheel_event')
for _,stage in ipairs({'none','result','wheel_result','relic_reward','choose_card','unknown'})do
 for _,choice in ipairs({'spin','accept','leave','claim_relic','skip_relic','purge','unknown'})do
  for _,uid in ipairs({false,1})do
   local run=eventRun(1);local event={stage=stage~='none'and stage or nil,goldAmount=100,goldGained=11,relicOffer={id='anchor'}}
   local flow={event=event};observe('wheel-stage-'..stage..'-'..choice..'-'..tostring(uid),Wheel.choose,run,flow,choice,uid and uid or nil)
  end
 end
end
for outcome=0,6 do for _,fault in ipairs({'none','throw-obtainCard','reject-obtainCard','throw-eventDamage','reject-eventDamage','reject-prepareRelic'})do
 local run=eventRun(1);run.fault=fault;observe('wheel-outcome-'..outcome..'-'..fault,Wheel.choose,run,{event={stage='wheel_result',outcome=outcome,goldGained=13}},'accept')
end end
local Winding=require('abyss_winding_event')
for _,stage in ipairs({'intro','result','choice','unknown'})do for _,choice in ipairs({'continue','leave','madness','writhe','max_hp','unknown'})do
 for _,fault in ipairs({'none','throw-obtainCard','reject-obtainCard','throw-eventDamage','reject-eventDamage'})do
  local run=eventRun(3);run.fault=fault
  observe('winding-'..stage..'-'..choice..'-'..fault,Winding.choose,run,{event={id='winding_halls',stage=stage,hpDamage=10,healAmount=20,maxHpLoss=4}},choice)
 end
end end
for _,field in ipairs({'hp','maxHp'})do for i,value in ipairs({false,'x',-1,0,1.5,0/0,2147483648})do
 local run=eventRun(3);run[field]=value;observe('winding-health-'..field..'-'..i,Winding.choose,run,{event={id='winding_halls',stage='choice'}},'unknown')
end end
local Act2=require('abyss_act2_events')
for _,stage in ipairs({'intro','gave_money','choose_card','leave','unknown'})do for _,choice in ipairs({'donate','confirm','purge','leave','unknown'})do
 for _,uid in ipairs({false,1,2,'1'})do
  local run=eventRun(2);observe('act2-'..stage..'-'..choice..'-'..tostring(uid),Act2.choose,run,{event={id='beggar',stage=stage}},choice,uid and uid or nil)
 end
end end
local Act3=require('abyss_act3_events')
for _,stage in ipairs({'intro','choice','result','unknown'})do for _,choice in ipairs({'continue','leave','escape','attack','skill','unknown'})do
 for _,uid in ipairs({false,1,2,'1'})do
  local run=eventRun(3);local event={id='falling',stage=stage,candidates={attack=Copy(run.deck[1])}}
  observe('act3-'..stage..'-'..choice..'-'..tostring(uid),Act3.choose,run,{event=event},choice,uid and uid or nil)
 end
end end
assert(count>=800,'full admission/fault matrix retained')
ADMISSION_CASE_COUNT=count
