local Run,Nodes,Map,Combat,Data=require('abyss_run'),require('abyss_nodes'),require('abyss_map'),require('abyss_combat'),require('abyss_data')
local Pool,R,Unknown=require('abyss_event_pool'),require('abyss_sts_random'),require('abyss_unknown')
local function same(a,b,path)
 if a==b then return end;path=path or 'state';assert(type(a)==type(b),path)
 if type(a)~='table'then assert(a==b,path);return end
 for k,v in pairs(a)do same(v,b[k],path..'.'..tostring(k))end
 for k in pairs(b)do assert(a[k]~=nil,path..' missing '..tostring(k))end
end
local function snapshot(run)return Combat.copy(run,{[run.data]=run.data})end
local function fixture(id,act)
 local r=Run.new(Data,'42',{experimental=true,campaign=true,campaignProfile='competition-two-act',character='ironclad'})
 act=act or 1;r.act,r.floor=act,act==2 and 17 or 0
 r.unknown.pools=Pool.new('full',false,act)
 local m=Map.generate(r.data,'42',act);local n=Map.available(m)[1]
 for _,node in ipairs(m.nodes)do if node.id==n.id then node.type,node.eventId='event',id end end
 return r,m,n.id
end
local function reject(r,m,id,reason)
 local before,map=snapshot(r),Combat.copy(m)
 local deck,pools,eventRng,miscRng,path,nodes=r.deck,r.unknown.pools,r.eventRng,r.miscRng,m.path,m.nodes
 local ok,why,receipt=Nodes.enter(r,m,id)
 assert(ok==false and why==reason,'original rejection changed: '..tostring(why))
 assert(type(receipt)=='table','event failure has no detached diagnostic receipt')
 same(r,before);same(m,map)
 assert(r.deck==deck and r.unknown.pools==pools and r.eventRng==eventRng and r.miscRng==miscRng)
 assert(m.path==path and m.nodes==nodes,'failure replaced map owners')
 return receipt
end
local r,m,id=fixture('invalid_direct_event')
local receipt=reject(r,m,id,'event_unavailable')
assert(receipt.schemaVersion==1 and receipt.reason=='event_unavailable')
assert(receipt.node.id==id and receipt.event.mappedId=='invalid_direct_event')
assert(receipt.event.originalId==nil and receipt.event.originalIdKnown==false,'direct IDs must not invent source identity')
assert(receipt.run.runSeed==r.runSeed and receipt.run.currentSeed==r.seed and receipt.run.eventSeed==r.eventSeed)
assert(receipt.committed.eventCounter==r.eventRng.counter)
assert(receipt.phase=='after_rollback'and receipt.committed.known==true and receipt.run.identityScope=='committed_post_rollback')
local originalPrint=print
local messages={}
local before,map=snapshot(r),Combat.copy(m)
print=function(line)
 same(r,before);same(m,map) -- The actual log sink observes the rolled-back owners.
 messages[#messages+1]=line
end
local called,repeatReceipt=pcall(reject,r,m,id,'event_unavailable');print=originalPrint
assert(called,repeatReceipt)
assert(#messages==1 and messages[1]:match('^ABYSS_EVENT_ENTRY_FAILURE '),'missing actual post-rollback log')
same(receipt,repeatReceipt)
local function detached(value,owned)
 if type(value)~='table'then assert(type(value)=='nil'or type(value)=='string'or type(value)=='number'or type(value)=='boolean');return end
 assert(not owned[value],'receipt aliases live state')
 for _,child in pairs(value)do detached(child,owned)end
end
local function owners(root,saved)
 if type(root)~='table'or saved[root]then return end
 saved[root]=true;for _,value in pairs(root)do owners(value,saved)end
end
local owned={};owners(r,owned);owners(m,owned);detached(receipt,owned)
repeatReceipt.run.runSeed='outside mutation';repeatReceipt.attempted.roomMiscCounter=777
same(r,before);same(m,map)
local again=reject(r,m,id,'event_unavailable');same(again,receipt)

local poor,poorMap,poorId=fixture('cleric');poor.gold=0
local denied=reject(poor,poorMap,poorId,'event_unavailable')
assert(denied.event.mappedId=='cleric' and denied.attempted.roomMiscCounter==0)
assert(denied.attempted.eventCounter==nil and denied.attempted.selectionCounter==nil,'direct event must not fabricate selection counters')

local function sourceDraw(run,node,counter)
 local nextRng=R.atCounter(run.eventSeed,counter)
 if Unknown.advancePc(Combat.copy(run.unknown.chances),R.randomFloat(nextRng),{})~='event'then return end
 local selection=R.atCounter(run.eventSeed,nextRng.counter)
 local original=Pool.draw(Combat.copy(run.unknown.pools),{floor=node.floor,gold=run.gold,act=run.act,
  hp=run.hp,relicCount=#run.relics,elapsedSeconds=run.elapsedSeconds,cursed=false},selection)
 return original,nextRng.counter,selection.counter
end
local source,sourceMap,sourceId=fixture(nil,2)
local node;for _,row in ipairs(sourceMap.nodes)do if row.id==sourceId then node=row end end
local counter,original,eventCounter,selectionCounter
for n=0,63 do
 local chosen,event,selection=sourceDraw(source,node,n)
 if chosen then counter,original,eventCounter,selectionCounter=n,chosen,event,selection;break end
end
assert(counter,'bounded real full-pool draw missing')
source.eventRng=R.atCounter(source.eventSeed,counter)
local saved=assert(Pool.contentId[original]);Pool.contentId[original]=nil
local passed,missing=pcall(reject,source,sourceMap,sourceId,'event_not_implemented')
Pool.contentId[original]=saved;assert(passed,missing)
assert(missing.event.originalId==original and missing.event.originalIdKnown)
assert(missing.event.mappedId==nil and not missing.event.mappedIdKnown,'missing route must not invent a mapping')
assert(missing.node.sourceType=='event' and missing.node.resolvedType=='event')
assert(missing.committed.eventCounter==counter and missing.attempted.eventCounter==eventCounter)
assert(missing.attempted.selectionCounter==selectionCounter and selectionCounter==counter+3)
assert(node.originalEventId==nil,'attempted source identity leaked into the public Map')

local Match=require('abyss_match_event');local prepare=Match.prepare
Match.prepare=function(_,_,rng)R.randomInt(rng,99);return false,'injected_prepare_failure'end
local prepareRun,prepareMap,prepareId=fixture('match_game')
local prepared,unavailable=pcall(reject,prepareRun,prepareMap,prepareId,'node_content_unavailable')
Match.prepare=prepare;assert(prepared,unavailable)
assert(unavailable.event.mappedId=='match_game' and unavailable.attempted.roomMiscCounter==1)
assert(unavailable.committed.miscCounter==prepareRun.miscRng.counter)

print=function()error('injected logger failure')end
local logged,loggerReceipt=pcall(reject,r,m,id,'event_unavailable');print=originalPrint
assert(logged,loggerReceipt);same(loggerReceipt,receipt)
local Diagnostics=require('abyss_event_entry_diagnostics')
local odd=Combat.copy(receipt)
odd.event.originalId='source\n\r\t= '..string.rep('x',10000);odd.event.originalIdKnown=true
odd.reason='reason\0with newline\n'
local line=Diagnostics.line(odd)
assert(not line:find('[\r\n\t%z]') and #line<4096,'log fields were not single-line bounded escaped')
assert(line:find('%%0A')and line:find('%%3D'),'log field separators were not escaped')
local numberFree=Diagnostics.failure({},{nodes={{id='n',type='event'}}},'n','failure')
assert(numberFree.committed.eventCounter==nil and numberFree.run.runSeed==nil,'unavailable state was fabricated as zero')
local invalidCounter=Diagnostics.failure({eventRng={counter='unknown'},miscRng={counter=false}},
 {nodes={{id='n',type='event'}}},'n','failure')
assert(invalidCounter.committed.eventCounter==nil and invalidCounter.committed.miscCounter==nil,'malformed counters were reported as valid')
local hostile=setmetatable({},{__index=function()error('diagnostics invoked a state metatable')end})
assert(Diagnostics.failure(hostile,hostile,'n','failure')==nil)

local successful,successfulMap,successfulId=fixture('cleric')
messages={};print=function(text)messages[#messages+1]=text end
local success=table.pack(pcall(function()return table.pack(Nodes.enter(successful,successfulMap,successfulId))end));print=originalPrint
assert(success[1] and success[2].n==2 and success[2][1]==true and #messages==0,'successful entry changed its return/log contract')
local ordinary,ordinaryMap=fixture('cleric')
local rejected=table.pack(Nodes.enter(ordinary,ordinaryMap,'missing-node'))
assert(rejected.n==2 and rejected[1]==false and rejected[2]=='invalid_node','non-event rejection changed its return contract')

local nestedRun,nestedMap,nestedId=fixture('cleric')
local nestedBefore,nestedMapBefore=snapshot(nestedRun),Combat.copy(nestedMap)
local observed,nestedReceipt,nestedStage
messages={};print=function(text)messages[#messages+1]=text end
local nestedOK,nestedWhy=Run.transaction(nestedRun,function(staged)
 nestedStage=staged
 staged.gold=0;R.randomInt(staged.miscRng,99)
 local accepted,reason,detail=Nodes.enter(staged,nestedMap,nestedId)
 observed={accepted=accepted,reason=reason,gold=staged.gold,miscCounter=staged.miscRng.counter}
 nestedReceipt=detail
 return true -- Ignoring a failed nested command must still poison the outer owner.
end)
print=originalPrint
assert(nestedOK==false and nestedWhy=='event_unavailable','nested transaction poison/reason changed')
assert(observed.accepted==false and observed.reason=='event_unavailable'and observed.gold==0)
assert(observed.miscCounter>nestedBefore.miscRng.counter,'fixture did not enter a genuinely uncommitted stage')
same(nestedRun,nestedBefore);same(nestedMap,nestedMapBefore)
assert(nestedReceipt.phase=='awaiting_outer_rollback','nested failure incorrectly claims rollback is already complete')
assert(nestedReceipt.committed.known==false and nestedReceipt.committed.miscCounter==nil,'nested failure fabricated committed counters')
assert(nestedReceipt.run.identityScope=='uncommitted_transaction'and #messages==0,'nested failure emitted a premature terminal log')
local nestedOwned={};owners(nestedStage,nestedOwned);detached(nestedReceipt,nestedOwned)
assert(Diagnostics.emit(nestedReceipt)==false,'awaiting receipt must not be emitted as terminal failure')

local function json(value)
 if type(value)=='string'then return '"'..value:gsub('[%z\1-\31\\"]',function(char)
  return string.format('\\u%04x',char:byte())
 end)..'"'end
 if type(value)~='table'then return tostring(value)end
 local keys,parts={},{};for key in pairs(value)do keys[#keys+1]=key end;table.sort(keys)
 for _,key in ipairs(keys)do parts[#parts+1]=json(key)..':'..json(value[key])end
 return '{'..table.concat(parts,',')..'}'
end
print('EVENT_ENTRY_DIAGNOSTIC_RECEIPT '..json(missing))
print('EVENT_ENTRY_DIAGNOSTICS_PASS direct, mapping, eligibility, prepare, rollback, detached, logs, success, nested')
