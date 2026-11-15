import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {perfFinalCiPacket as packet,perfFinalCiSource,perfFinalCurrentInventory,perfFinalPriorInventory,assertPerfFinalCiCurrent} from './helpers/perf-final-ci-source.mjs';
import {assertIntegratedCurrent,integratedCurrentInventory} from './helpers/integrated-ci-source.mjs';
import {pcAfterFixCiPacket} from './helpers/pc-after-fix-ci-source.mjs';
import {itemIconPriorInventory} from './helpers/item-semantic-icons-ci.mjs';
import {reconciliationPriorInventory} from './helpers/reconciliation-ci-source.mjs';
const raw=path=>readFileSync(path,'utf8');

test('performance CI retains complete 1f before sources, all new raw tests and unconditional fresh current checks',()=>{
 assertPerfFinalCiCurrent(readFileSync);assertIntegratedCurrent();assert(Object.isFrozen(packet));
 let retiredReads=0;const retired=()=>{retiredReads++;throw Error('retired complete inventory reader');};
 for(const checkpoint of [pcAfterFixCiPacket.currentInventory,packet.currentInventory])for(const kind of ['js','lua']){
  const paths=checkpoint[kind];
  assert.deepEqual(itemIconPriorInventory(paths,paths,kind,retired,{}),paths,'each exact complete checkpoint keeps its no-I/O identity');
 }
 assert.equal(retiredReads,0);
 for(const path of ['scripts/lua-utf8-literal.mjs','scripts/official-portraits.mjs'])assert(packet.files[path].before?.source,'an existing builder must not become historical absence: '+path);
 for(const kind of ['js','lua']){
  const actual=readdirSync(kind==='js'?'tests':'tests/lua').filter(path=>path.endsWith(kind==='js'?'.test.mjs':'.lua')).map(path=>(kind==='js'?'tests/':'tests/lua/')+path).sort();
  assert.deepEqual(reconciliationPriorInventory(actual,kind,readFileSync),packet.currentInventory[kind]);assert.deepEqual(actual,integratedCurrentInventory(kind));
  assert.deepEqual(packet.priorInventory[kind],pcAfterFixCiPacket.currentInventory[kind]);
  assert.deepEqual(perfFinalCurrentInventory(packet.priorInventory[kind],kind),actual);
  assert.deepEqual(perfFinalPriorInventory(actual,kind,readFileSync),packet.priorInventory[kind]);
  const added=packet.currentInventory[kind].filter(path=>!packet.priorInventory[kind].includes(path));
  for(const path of added){
   assert.throws(()=>perfFinalPriorInventory(actual,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh performance raw test source/);
   if(added.length>1)assert.throws(()=>perfFinalPriorInventory(actual.filter(p=>p!==path),kind,readFileSync),/inventory/);
   else assert.deepEqual(perfFinalPriorInventory(actual.filter(p=>p!==path),kind,readFileSync),packet.priorInventory[kind],'complete historical predecessor remains an idempotent input');
  }
  for(const invalid of [[...actual,actual[0]],[...actual,'tests/foreign.'+kind]])assert.throws(()=>perfFinalPriorInventory(invalid,kind,readFileSync),/inventory/);
 }
});

test('performance CI rejects every warm drift, missing source, foreign path and malformed source without trusting supplied text',()=>{
 for(const [path,row]of Object.entries(packet.files)){
  const source=raw(path);
  if(row.before)assert.equal(perfFinalCiSource(path,source),row.before.source);
  for(const bad of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),null,17])assert.equal(perfFinalCiSource(path,bad),bad);
  assert.equal(perfFinalCiSource('foreign/'+path,source),source);
  for(const missing of [false,true]){
   const read=(p,e)=>p===path?(missing?'':readFileSync(p,e)+'\n'):readFileSync(p,e);
   assert.throws(()=>assertPerfFinalCiCurrent(read),/fresh performance CI source/,path);
   assert.throws(()=>assertIntegratedCurrent(read),/fresh performance CI source/,path);
  }
 }
});
