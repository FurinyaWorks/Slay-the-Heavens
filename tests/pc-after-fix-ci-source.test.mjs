import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {pcAfterFixCiPacket as packet,pcAfterFixCiSource,pcAfterFixHistoricalCiSource,pcAfterFixCurrentInventory,pcAfterFixPriorInventory,assertPcAfterFixCiCurrent} from './helpers/pc-after-fix-ci-source.mjs';
import {preCloseoutCiSource,closeoutCiProof} from './helpers/closeout-ci-source.mjs';
import {preRunHudCiSource,runHudCiProof} from './helpers/run-hud-ci-source.mjs';
import {perfFinalPriorInventory} from './helpers/perf-final-ci-source.mjs';
import {assertIntegratedCurrent,integratedCurrentInventory} from './helpers/integrated-ci-source.mjs';
const raw=path=>readFileSync(path,'utf8');

test('final appended CI keeps complete raw discovery, old inventories, and unconditional fresh sources',()=>{
 assertPcAfterFixCiCurrent(readFileSync);assertIntegratedCurrent();
 assert(Object.isFrozen(packet));
 const actual={js:readdirSync('tests').filter(path=>path.endsWith('.test.mjs')).map(path=>'tests/'+path).sort(),lua:readdirSync('tests/lua').filter(path=>path.endsWith('.lua')).map(path=>'tests/lua/'+path).sort()};
 for(const kind of ['js','lua']){
  assert.deepEqual(perfFinalPriorInventory(actual[kind],kind,readFileSync),packet.currentInventory[kind]);assert.deepEqual(actual[kind],integratedCurrentInventory(kind));
  assert.deepEqual(pcAfterFixCurrentInventory(packet.priorInventory[kind],kind),actual[kind]);
  assert.deepEqual(pcAfterFixPriorInventory(actual[kind],kind,readFileSync),packet.priorInventory[kind]);
  const added=packet.currentInventory[kind].filter(path=>!packet.priorInventory[kind].includes(path));
  for(const path of added){
   assert.throws(()=>pcAfterFixPriorInventory(actual[kind],kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh appended raw test source/);
   if(added.length>1)assert.throws(()=>pcAfterFixPriorInventory(actual[kind].filter(p=>p!==path),kind,readFileSync),/inventory/);
  }
 }
});

test('appended CI authenticates all new source bytes and rejects every warm drift, foreign path and wrong input shape',()=>{
 for(const [view,target]of Object.entries(packet.historicalBindings)){
  assert.equal(target.commit,view==='closeoutCurrent'?runHudCiProof.base:closeoutCiProof.targets[view].commit);
  for(const [path,row]of Object.entries(target.files)){
   assert.equal(raw(path).replaceAll('\r\n','\n'),row.current.source);assert.equal(pcAfterFixHistoricalCiSource(path,raw(path),view),row.historical.source);
   assert.equal(view==='closeoutCurrent'?preRunHudCiSource(path,raw(path)):preCloseoutCiSource(path,raw(path),view),row.historical.source);
   for(const bad of [raw(path)+'\n',raw(path).slice(1),raw(path).replaceAll('\n','\r\r\n'),null])assert.equal(pcAfterFixHistoricalCiSource(path,bad,view),bad);
   assert.equal(pcAfterFixHistoricalCiSource(path,raw(path),'foreign'),raw(path));assert.equal(pcAfterFixHistoricalCiSource('foreign/'+path,raw(path),view),raw(path));
   assert.throws(()=>assertIntegratedCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh appended historical CI source/);
  }
 }
 for(const [path,row]of Object.entries(packet.files)){
  const source=raw(path);
  if(row.before)assert.equal(pcAfterFixCiSource(path,source),row.before.source);
  for(const bad of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),null,17])assert.equal(pcAfterFixCiSource(path,bad),bad);
  assert.equal(pcAfterFixCiSource('foreign/'+path,source),source);
  assert.throws(()=>assertPcAfterFixCiCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh appended CI source/,path);
  assert.throws(()=>assertIntegratedCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh appended CI source/,path);
 }
});
