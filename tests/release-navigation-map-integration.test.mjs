import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {discoverJs,jsShard,timings} from '../scripts/ci-shards.mjs';
import {shardLuaScripts} from '../scripts/test-lua.mjs';
import {sourceEpoch,releaseNavigationSourceEpoch,releaseSelectionMapSourceEpoch,preReleaseNavigationSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {navigationFixturePacket,navigationFixtureBefore,assertNavigationFixturesCurrent,navigationMapPacket,navigationMapSource,navigationMapRead,navigationMapProductionRead,navigationMapPriorInventory,assertNavigationMapCurrent,assertNavigationMapRawInventory,navigationDomainSource,navigationDomainRead} from './helpers/navigation-map-integration.mjs';
import {releaseMergeCiPacket,releaseMergeRead,assertReleaseMergeCurrent} from './helpers/release-bootstrap-merge-ci-source.mjs';
import {assertReleaseNavigationCiCurrent} from './helpers/release-navigation-ci-source.mjs';
import {assertReleaseSelectionMapCiCurrent,assertReleaseSelectionMapExecutionGuards} from './helpers/release-selection-map-ci-source.mjs';
import {integratedSource,integratedRead} from './helpers/integrated-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
test('navigation map union retains both complete producer domains and exact three-way input',()=>{
 const p=sourceEpoch.proof,base=preReleaseNavigationSourceEpoch.proof;
 const paths=['config/architecture.json',...readdirSync('src/lua').filter(p=>p.endsWith('.lua')).map(p=>'src/lua/'+p)].sort();
 assert.equal(paths.length,352);assert.equal(p.owners.length,116);assert.equal(Object.keys(p.targets).length,68);
 for(const path of paths)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path);
 for(const [name,target]of Object.entries(base.targets))assert.deepEqual(p.targets[name],target);
 for(const side of [releaseNavigationSourceEpoch,releaseSelectionMapSourceEpoch])for(const [name,target]of Object.entries(side.proof.targets))assert.deepEqual(p.targets[name],target,name);
 assert.deepEqual(p.targets.releaseNavigationReviewed.files,releaseNavigationSourceEpoch.proof.current);
 assert.deepEqual(p.targets.releaseSelectionMapReviewed.files,releaseSelectionMapSourceEpoch.proof.current);
 const input='src/lua/abyss_game_ui_input.lua',source=p.current[input].source;
 assert.notEqual(source,releaseNavigationSourceEpoch.proof.current[input].source);
 assert.notEqual(source,releaseSelectionMapSourceEpoch.proof.current[input].source);
 assert.equal(createHash('sha1').update('blob '+Buffer.byteLength(source)+'\0').update(source).digest('hex'),'d8641d59e71235de7b108e23d8416d280e15639c');
 assert.equal(p.currentTreeCommitted,false);
 for(const target of ['releaseNavigationReviewed','releaseSelectionMapReviewed']){
  const read=p=>readFileSync(p,'utf8');assert.equal(sourceEpoch.preCombinedSource(input,source,{target,readSource:read}),p.targets[target].files[input].source);
  for(const owner of p.owners)for(const bad of [null,read(owner)+'\n',Buffer.from(read(owner))])
   assert.throws(()=>sourceEpoch.preCombinedSource(input,source,{target,readSource:p=>p===owner?bad:read(p)}),/linked owner/);
 }
});
test('navigation map actual raw input rejects every current drift before either historical domain',()=>{
 assertNavigationMapCurrent();
 for(const [path,row]of Object.entries(navigationMapPacket.files)){
  const raw=readFileSync(path,'utf8');assert.equal(hash(norm(navigationFixtureBefore(path,raw))),row.current,path);
  for(const mode of ['missing','changed','buffer'])assert.throws(()=>assertNavigationMapCurrent((p,e)=>{
   if(p!==path)return readFileSync(p,e);if(mode==='missing')throw Error('missing '+p);
   return mode==='buffer'?Buffer.from(raw):raw+'\n';
  }),error=>{assert(error.message.includes(path));return true;});
  for(const side of ['navigation','selection'])for(const foreign of [raw+'\n',raw.slice(1),null,{},17,Buffer.from(raw)])
   assert.equal(navigationMapSource(path,foreign,side),foreign,path);
  if(path.startsWith('src/')||path==='config/architecture.json')for(const side of ['navigation','selection'])assert.equal(navigationMapRead(side)(path,'utf8'),raw);
 }
 for(const path of Object.keys(navigationMapPacket.archives))assert.throws(()=>assertNavigationMapCurrent((p,e)=>p===path?readFileSync(p).subarray(1):readFileSync(p,e)),/immutable navigation\/map predecessor/);
 const nav=navigationMapProductionRead('navigation');
 assertReleaseMergeCurrent(nav);
 assertReleaseNavigationCiCurrent(releaseMergeRead('slicePrior',nav));
 assertReleaseSelectionMapCiCurrent(navigationMapProductionRead('selection'));
 for(const [path,row]of Object.entries(releaseMergeCiPacket.files))for(const target of ['slicePrior','bootstrapView']){
  const raw=nav(path,'utf8'),got=releaseMergeRead(target,nav)(path,'utf8');
  assert.equal(norm(got),path.startsWith('src/')?norm(raw):row[target]?.source??norm(raw),path+':'+target);
 }
});
test('retired-help fixture continuation keeps complete old assertions and freshly rejects every changed owner',()=>{
 assertNavigationFixturesCurrent();
 for(const [path,row]of Object.entries(navigationFixturePacket.files)){
  const raw=readFileSync(path,'utf8');
  assert.equal(navigationFixtureBefore(path,raw),row.before.source);
  for(const foreign of [raw+'\n',raw.slice(1),raw.replaceAll('\n','\r\r\n'),null,{},Buffer.from(raw)]){
   let reads=0;assert.equal(navigationFixtureBefore(path,foreign,()=>{reads++;throw Error('foreign read');}),foreign);assert.equal(reads,0);
  }
  for(const mode of ['changed','stale','missing','buffer']){
   let bad=false;
   const read=(p,e)=>{
    if(p!==path||!bad)return readFileSync(p,e);
    if(mode==='missing')throw Error('missing '+p);
    return mode==='changed'?raw+'\n':mode==='stale'?row.before.source:Buffer.from(raw);
   };
   const anchor='tests/ci-complete-calibration.test.mjs',source=readFileSync(anchor,'utf8');
   const expected=integratedSource(anchor,source,'native',read),reader=integratedRead('native',{read});
   assert.notEqual(expected,source);assert.equal(reader(anchor,'utf8'),expected);
   bad=true;
   for(const call of [()=>assertNavigationMapCurrent(read),()=>integratedSource(anchor,source,'native',read),()=>reader(anchor,'utf8')])
    assert.throws(call,error=>{assert(error.message.includes(path));return true;});
   bad=false;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 const archive='tests/helpers/navigation-help-retirement-fixtures.json.gz';
 const anchor='tests/ci-complete-calibration.test.mjs',source=readFileSync(anchor,'utf8');
 let bad=false;
 const read=(p,e)=>p===archive&&bad?readFileSync(p).subarray(1):readFileSync(p,e);
 const expected=integratedSource(anchor,source,'native',read),reader=integratedRead('native',{read});
 assert.equal(reader(anchor,'utf8'),expected);bad=true;
 for(const call of [()=>assertNavigationFixturesCurrent(read),()=>integratedSource(anchor,source,'native',read),()=>reader(anchor,'utf8')])
  assert.throws(call,/immutable navigation fixture predecessor/);
 bad=false;assert.equal(reader(anchor,'utf8'),expected);
});
test('navigation map actual Full inventory and execution guards cover the complete union',()=>{
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()};
 assertReleaseSelectionMapExecutionGuards(readFileSync('.github/workflows/quality.yml','utf8'));
 assert.equal(timings.unknownJsMs,10000);assert.equal(timings.unknownLuaMs,10000);
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,navigationMapPacket.inventories.joint[kind]);
  for(const side of ['navigation','selection']){
   assert.deepEqual(navigationMapPriorInventory(paths,side,kind),navigationMapPacket.inventories[side][kind]);
   for(const path of navigationMapPacket.inventories[side][kind])assert(paths.includes(path));
  }
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,'tests/foreign.test.mjs']])
   assert.throws(()=>assertNavigationMapRawInventory(bad,kind),/raw inventory/);
 }
 for(const [platform,n]of [['win32',18],['linux',15]]){
  const bins=Array.from({length:n},(_,i)=>jsShard(inventories.js,(i+1)+'/'+n,platform));
  assert.deepEqual(bins.flatMap(b=>b.files).sort(),inventories.js);
  if(platform==='win32'){
   const lua=Array.from({length:n},(_,i)=>shardLuaScripts(inventories.lua,(i+1)+'/'+n,{...timings,windowsJsShardMs:bins[0].loads},2));
   assert.deepEqual(lua.flat().sort(),inventories.lua);
  }
 }
});
test('navigation domain authorization is fresh on every call after warm success and recovery',()=>{
 const path='tests/helpers/integrated-ci-source.mjs',source=readFileSync(path,'utf8');
 const linked=sourceEpoch.proof.owners.find(p=>!Object.hasOwn(navigationMapPacket.files,p));assert(linked);
 let bad=false,calls=0;
 const read=(p,e)=>{if(p===linked){calls++;if(bad)return e?readFileSync(p,e)+'\n':Buffer.concat([readFileSync(p),Buffer.from('\n')]);}return readFileSync(p,e);};
 const expected=releaseMergeCiPacket.files[path].slicePrior.source;
 for(let i=0;i<2;i++){calls=0;assert.equal(navigationDomainSource(path,source,'slicePrior',read),expected);assert(calls>0);}
 bad=true;assert.throws(()=>navigationDomainSource(path,source,'slicePrior',read),/linked owner identity/);
 bad=false;calls=0;assert.equal(navigationDomainSource(path,source,'slicePrior',read),expected);assert(calls>0);
});
test('accepted navigation domains freshly reject map-only CI source and archive drift',()=>{
 const path='tests/helpers/integrated-ci-source.mjs',source=readFileSync(path,'utf8'),expected=releaseMergeCiPacket.files[path].slicePrior.source;
 assert.equal(navigationDomainSource(path,source,'slicePrior'),expected);
 assert.deepEqual(navigationDomainRead('slicePrior')(path),Buffer.from(expected));
 const opaque=Buffer.from(source);assert.equal(navigationDomainRead('slicePrior',()=>opaque)(path,'utf8'),opaque,'wrong-typed UTF8 input remains opaque');
 for(const owner of ['scripts/official-map-return-controls.mjs','tests/helpers/release-selection-map-ci-source.json.gz']){
  assert(Object.hasOwn(navigationMapPacket.files,owner)||Object.hasOwn(navigationMapPacket.archives,owner));
  for(const absent of [false,true])assert.throws(()=>navigationDomainSource(path,source,'slicePrior',(p,e)=>{
   if(p!==owner)return readFileSync(p,e);if(absent)throw Error('missing '+p);
   const raw=readFileSync(p,e);return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }),error=>{assert(error.message.includes(owner));return true;});
  assert.equal(navigationDomainSource(path,source,'slicePrior'),expected,'fresh recovery after '+owner);
 }
 let reads=0;const foreign=source+'\n';
 assert.equal(navigationDomainSource(path,foreign,'slicePrior',()=>{reads++;throw Error('foreign read');}),foreign);assert.equal(reads,0);
});
test('integrated public source and reader freshly reject map-only drift after warm success',()=>{
 const path='tests/ci-complete-calibration.test.mjs',source=readFileSync(path,'utf8');
 const expected=integratedSource(path,source,'native');assert.notEqual(expected,source);
 for(const owner of ['scripts/official-map-return-controls.mjs','tests/helpers/release-selection-map-ci-source.json.gz']){
  let bad=false,absent=false;
  const read=(p,e)=>{
   if(!bad||p!==owner)return readFileSync(p,e);if(absent)throw Error('missing '+p);
   const raw=readFileSync(p,e);return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  };
  const reader=integratedRead('native',{read});
  assert.equal(integratedSource(path,source,'native',read),expected);assert.equal(reader(path,'utf8'),expected);
  bad=true;
  for(absent of [false,true])for(const call of [()=>integratedSource(path,source,'native',read),()=>reader(path,'utf8')])
   assert.throws(call,error=>{assert(error.message.includes(owner));return true;});
  bad=false;assert.equal(integratedSource(path,source,'native',read),expected);assert.equal(reader(path,'utf8'),expected);
 }
 let reads=0;const foreign=source+'\n';assert.equal(integratedSource(path,foreign,'native',()=>{reads++;throw Error('foreign read');}),foreign);assert.equal(reads,0);
});

test('historical menu authorization uses the current raw closure afresh without accepting stale owners',async()=>{
 const {assertNavigationDomainCurrent}=await import('./helpers/navigation-map-integration.mjs');
 assertNavigationDomainCurrent();
 const input='src/lua/abyss_game_ui_input.lua';
 for(const replacement of [s=>s+'\n',()=>undefined,s=>Buffer.from(s)]){
  const raw=(p,e)=>p===input?replacement(readFileSync(p,e)):readFileSync(p,e);
  assert.throws(()=>assertNavigationDomainCurrent(raw),/navigation\/map.*abyss_game_ui_input/);
 }
 const crlf=(p,e)=>{const s=readFileSync(p,e);return typeof s==='string'?s.replaceAll('\n','\r\n'):s;};
 assertNavigationDomainCurrent(crlf);
 assertNavigationDomainCurrent();
 assert.throws(()=>assertNavigationDomainCurrent((p,e)=>p===input?readFileSync(p,e)+'\n':readFileSync(p,e)),/navigation\/map.*abyss_game_ui_input/);
});
