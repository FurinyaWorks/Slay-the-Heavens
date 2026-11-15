import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {withPortraitVm} from './helpers/portrait-runtime-vm.mjs';
import {preMobileUiSourceEpoch} from './helpers/closeout-source-epoch.mjs';
const old=preMobileUiSourceEpoch.proof.current['src/lua/abyss_traveler_portraits.lua'];
assert.equal(old.gitBlob,'3046e3ba9443517d9254d8001b7b5acc6db8d847','complete original portrait oracle');
const require=createRequire(import.meta.url),{lua,to_luastring,to_jsstring}=require('fengari');
function measured(code){
 let report;const close=lua.lua_close;
 lua.lua_close=L=>{
  const read=index=>{const at=lua.lua_absindex(L,index),kind=lua.lua_type(L,at);
   if(kind===lua.LUA_TNUMBER)return lua.lua_tonumber(L,at);
   if(kind===lua.LUA_TBOOLEAN)return !!lua.lua_toboolean(L,at);
   if(kind===lua.LUA_TSTRING)return to_jsstring(lua.lua_tostring(L,at));
   if(kind!==lua.LUA_TTABLE)return null;
   const value={};lua.lua_pushnil(L);while(lua.lua_next(L,at)){const key=read(-2);value[key]=read(-1);lua.lua_pop(L,1);}return value;
  };
  try{lua.lua_getglobal(L,to_luastring('IDLE_REVEAL_REPORT'));report=read(-1);lua.lua_pop(L,1);}finally{close(L);}
 };
 try{withPortraitVm(`OldPortraits=(function()\n${old.source}\nend)()\n`+harness+code,{officialAssets:true,runtimeV2:true});}
 finally{lua.lua_close=close;}
 return report;
}
const harness=`
local baseCreate,baseDestroy=game.InstantiateClientUIControl,game.DestroyClientUIControl
local methods={'SetVisible','SetActive','SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetImage','SetFillHorizontal','SetFillUnused'}
local function same(a,b)
 assert(type(a)==type(b),'native state type differs')
 if type(a)~='table'then assert(a==b,'native state differs: '..tostring(a)..'/'..tostring(b));return end
 for k,v in pairs(a)do same(v,b[k])end;for k in pairs(b)do assert(a[k]~=nil,'native state key differs')end
end
local function session(host)
 controls={};destroyed=0
 local s={host=host,events={},nodes={},calls={},creates=0,setters=0,properties=0,steps=0,reveals=0,publications=0}
 local function event(id,kind,...)
  s.events[#s.events+1]={id,kind,...};s.calls[kind]=(s.calls[kind]or 0)+1
 end
 local function instrument(node,id)
  rawset(node,'serial',id)
  for _,name in ipairs(methods)do if type(node[name])=='function'then
   local original=node[name]
   node[name]=function(self,...)
    local args={...};event(id,name,...);s.setters=s.setters+1
    if s.before then local accepted=s.before(self,name,args);if accepted==false then return false end end
    local accepted=original(self,...)
    if self==host and name=='SetVisible' and args[1]then
     s.publications=s.publications+1
     local status=s.status and s.status() or s.controller:status()
     assert(status.nextIndex==status.total+1,'partial image published')
     for _,child in ipairs(s.nodes)do
      if child.alive then assert(child.visible and child.imageColor~=nil or child.isGroup and child.active and child.visible,'incomplete child published')end
     end
    elseif self~=host and s.controller and(s.status and s.status()or s.controller:status()).phase=='building' then
     assert(not host.visible,'a native child write exposed a partial figure')
    end
    return accepted
   end
  end end
  local mt=getmetatable(node);local write=mt.__newindex
  mt.__newindex=function(self,key,value)
   if key=='imageColor'then event(id,key,value);s.properties=s.properties+1 end
   return write(self,key,value)
  end
 end
 instrument(host,0)
 game.InstantiateClientUIControl=function(prefab,parent)
  assert(not host.visible,'creation happened outside the hidden host')
  local ancestor=parent;while ancestor~=host do assert(ancestor,'unowned portrait control');ancestor=ancestor.parent end
  local c=baseCreate(prefab,parent);if not c then return nil end
  s.creates=s.creates+1;s.nodes[#s.nodes+1]=c;instrument(c,s.creates)
  event(c.serial,'InstantiateClientUIControl',prefab,parent.serial)
  if s.onCreate then s.onCreate(c)end
  return c
 end
 game.DestroyClientUIControl=function(c)event(c.serial,'DestroyClientUIControl');return baseDestroy(c)end
 return s
end
local function drain(s)
 for _=1,20000 do
  if s.controller:status().phase=='ready'then return end
  assert(s.controller:status().phase=='building' or s.controller:status().phase=='revealing','build failed: '..tostring(s.controller:status().reason))
  s.steps=s.steps+1;local _,kind=s.controller:step();if kind=='reveal'then s.reveals=s.reveals+1 end
 end
 error('portrait build did not complete')
end
local function snapshot(s)
 local function nativeState(node)
  local value={id=node.id,parent=node.parent and node.parent.serial,alive=node.alive,active=node.active,visible=node.visible,
   imageColor=node.imageColor,imageType=node.imageType,imageSource=node.imageSource,imageId=node.imageId,
   enableMask=node.enableMask,fillType=node.fillType,top=node.top}
  for _,name in ipairs(methods)do if node[name..'Value']then value[name]=node[name..'Value']end end
  return value
 end
 local out={status=s.controller:status(),host=nativeState(s.host),nodes={}}
 for _,node in ipairs(s.nodes)do out.nodes[#out.nodes+1]=nativeState(node)end
 return out
end
local function build(module,data)
 local host=tree();local s=session(host)
 s.controller=module.createController(host,data,210,Asset,{retryFailedOnPause=true})
 assert(s.controller:begin()and host.active and not host.visible)
 drain(s);assert(host.visible and s.controller:status().owned==s.creates and s.publications==1)
 s.ready=snapshot(s);s.buildEvents=s.events;s.events={}
 s.buildCalls=s.calls;s.calls={};s.buildSetters=s.setters;s.buildProperties=s.properties
 local allocated=s.creates;local generation=s.controller:status().generation
 assert(s.controller:pause()and not host.visible and not host.active)
 assert(s.controller:begin()and host.active and host.visible)
 assert(s.creates==allocated and s.controller:status().generation==generation,'ready cache rebuilt')
 assert(s.controller:release()and LiveCount()==0 and not host.visible)
 assert(s.controller:release()and LiveCount()==0)
 return s
end
`;

test('full approved idle is published atomically with identical ready children and fewer actual native calls',t=>{
 const report=measured(`
local data=Asset.battleApprovedIdle;assert(data.runtimeV2 and data.count==7303 and #data.bands==18)
local old=build(OldPortraits,data);local current=build(Portraits,data)
same(old.ready,current.ready)
local function unaffected(s)
 local out={};for _,e in ipairs(s.buildEvents)do
  local node=s.nodes[e[1]]
  if not(node and node.isGroup and(e[2]=='SetVisible'or e[2]=='SetActive'))then out[#out+1]=e end
 end;return out
end
same(unaffected(old),unaffected(current));same(old.events,current.events)
assert(current.reveals==0,'approved idle still schedules a group reveal phase')
assert(old.creates==7459 and current.creates==old.creates)
assert(old.steps-current.steps==old.reveals,'extra build work replaced reveal work')
local internal=0;for _,n in ipairs(current.nodes)do if n.isGroup then internal=internal+1 end end
assert(old.buildSetters-current.buildSetters==internal*2,'unexpected native API changes')
IDLE_REVEAL_REPORT={before={creates=old.creates,steps=old.steps,revealCalls=old.reveals,setters=old.buildSetters,properties=old.buildProperties,calls=old.buildCalls},
 after={creates=current.creates,steps=current.steps,revealCalls=current.reveals,setters=current.buildSetters,properties=current.buildProperties,calls=current.buildCalls},
 internalContainers=internal,allReadyChildrenAndOwnershipEqual=true,allUnaffectedNativeCallsEqual=true}
`);
 t.diagnostic(JSON.stringify(report));
});

test('selection and legacy full-body preserve their complete original native call traces',()=>{
 measured(`
for _,data in ipairs({Asset.avatar96,Asset.battle133,Asset.lowpolyLumine})do
 local old=build(OldPortraits,data);local current=build(Portraits,data)
 same(old.ready,current.ready);same(old.buildEvents,current.buildEvents);same(old.events,current.events)
 assert(old.steps==current.steps and old.reveals==current.reveals)
end
`);
});

test('approved idle early native callbacks retain cancellation, failure cleanup and retry boundaries',()=>{
 measured(`
local function small()
 local data={};for k,v in pairs(Asset.battleApprovedIdle)do data[k]=v end
 data.rows={data.rows[1],data.rows[2]};data.count=2;data.bandByRow={1,1};return data
end
for _,mode in ipairs({'instantiateRelease','activationRelease','activationFailure','publishRelease'})do
 local host=tree();local s=session(host);local c=Portraits.createController(host,small(),210,Asset,{retryFailedOnPause=true});s.controller=c
 local fired=false
 if mode=='instantiateRelease'then s.onCreate=function()if not fired then fired=true;assert(not c:begin());c:release()end end
 else s.before=function(node,name,args)
  local activation=node~=host and node.isGroup and name=='SetActive'and args[1]
  local publish=node==host and name=='SetVisible'and args[1]
  if not fired and(mode=='publishRelease'and publish or mode~='publishRelease'and activation)then
   fired=true
   if mode=='activationFailure'then return false end
   c:release()
  end
 end end
 assert(c:begin())
 for _=1,30 do if fired then break end;c:step()end
 assert(fired and not host.visible and LiveCount()==0 and c:status().owned==0,'callback leaked or published controls: '..mode)
 assert(c:status().phase==(mode=='activationFailure'and'failed'or'released'))
 s.before=nil;s.onCreate=nil
 if mode=='activationFailure'then assert(not c:begin());assert(c:pause())end
 assert(c:begin());drain(s);assert(host.visible and c:release()and LiveCount()==0)
end
`);
});

test('approved idle owner retains the shared64-create and8ms budgets, partial pause and same ready cache',t=>{
 const report=measured(`
local clock=os.clock
local function owner(module,slow)
 local host=tree();local s=session(host)
 local fallback=control('image');fallback:SetVisible(true)
 local stage=tree({battlePanel=tree({hero=tree({officialFigure=host,portrait=fallback})})})
 local a=module.new(stage,nil,{battlePortrait=true});s.controller=a;s.status=function()return a:status().battle end
 local time=0;os.clock=function()time=time+(slow and .009 or 0);return time end
 assert(Asset.battleApprovedIdle.runtimeV2 and a:status().batchSize==64)
 assert(a:sync('battle',false,false,'ironclad'))
 local ticks,maxCreates=0,0
 local function tick()
  local before=s.creates;a:tick();local n=s.creates-before
  ticks=ticks+1;maxCreates=math.max(maxCreates,n)
  assert(n<=(slow and 8 or 64),'existing shared create/time budget was increased')
 end
 tick();local partial=a:status().battle;assert(partial.owned>0 and partial.phase=='building'and not host.visible)
 assert(a:sync('map',false,false,'ironclad')and not host.active and not host.visible)
 for _=1,20 do a:tick()end
 assert(s.creates==partial.owned and a:status().battle.nextIndex==partial.nextIndex,'paused partial continued building')
 assert(a:sync('battle',false,false,'ironclad')and not host.visible)
 assert(a:status().battle.generation==partial.generation,'partial cache was replaced')
 for _=1,2000 do if a:status().battle.phase=='ready'then break end;tick()end
 assert(a:status().battle.phase=='ready'and host.visible and s.creates==7459)
 local generation=a:status().battle.generation
 for _=1,3 do
  assert(a:sync('map',false,false,'ironclad'));a:tick();assert(not host.visible)
  assert(a:sync('battle',false,false,'ironclad'));a:tick();assert(host.visible)
  assert(s.creates==7459 and a:status().battle.generation==generation,'ready cache rebuilt')
 end
 assert(a:release()and LiveCount()==0);os.clock=clock
 return{ticks=ticks,maxCreatesPerTick=maxCreates,creates=s.creates}
end
local oldFast=owner(OldPortraits,false);local newFast=owner(Portraits,false)
local oldSlow=owner(OldPortraits,true);local newSlow=owner(Portraits,true)
assert(oldFast.maxCreatesPerTick==64 and newFast.maxCreatesPerTick==64)
assert(oldSlow.maxCreatesPerTick==8 and newSlow.maxCreatesPerTick==8)
IDLE_REVEAL_REPORT={fastClock={before=oldFast,after=newFast},slowClock={before=oldSlow,after=newSlow},
 partialPauseResume=true,sameReadyCache=true,scope='native API fixture; scheduler calls, not physical seconds'}
`);
 t.diagnostic(JSON.stringify(report));
});
