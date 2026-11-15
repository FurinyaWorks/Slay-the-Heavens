import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pcFinalCiPacket as packet,pcFinalCiSource,pcFinalCurrentInventory,pcFinalPriorInventory,assertPcFinalCiCurrent} from './helpers/pc-final-ci-source.mjs';
import {pcFinalStorageSource,pcFinalStorageBindings} from './helpers/pc-final-storage-source.mjs';
import {assertIntegratedCurrent} from './helpers/integrated-ci-source.mjs';
import {pcAfterFixCiSource,pcAfterFixCurrentInventory} from './helpers/pc-after-fix-ci-source.mjs';
test('complete final CI continuation retains original packet and rejects byte, before-identity and inventory drift',()=>{
 assertPcFinalCiCurrent(readFileSync);
 assert(Object.isFrozen(packet));
 for(const [path,row]of Object.entries(packet.files))if(row.before){
  const source=readFileSync(path,'utf8');assert.equal(pcFinalCiSource(path,source,row.before),row.before.source);
  assert.equal(pcFinalCiSource(path,source,{...row.before,source:'forged original text'}),row.before.source,'projection uses authenticated packet text');
  assert.equal(pcFinalCiSource(path,source+'\n',row.before),source+'\n');
  assert.equal(pcFinalCiSource(path,source,{...row.before,sha256:'f'.repeat(64)}),source);
 }
 for(const kind of ['js','lua']){
  assert.deepEqual(pcFinalCurrentInventory(packet.priorInventory[kind],kind),pcAfterFixCurrentInventory(packet.currentInventory[kind],kind));
  assert.deepEqual(pcFinalPriorInventory(packet.currentInventory[kind],kind,readFileSync),packet.priorInventory[kind]);
  const added=packet.currentInventory[kind].filter(path=>!packet.priorInventory[kind].includes(path));
  for(const path of added){
   assert.throws(()=>pcFinalPriorInventory(packet.currentInventory[kind],kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh added final CI source/);
   assert.throws(()=>pcFinalPriorInventory(packet.currentInventory[kind].filter(p=>p!==path),kind,readFileSync),/inventory/);
  }
 }
});

test('LFS-only source continuation authenticates complete new bytes and keeps every unknown drift visible',()=>{
 for(const row of pcFinalStorageBindings){
  const source=readFileSync(row.path,'utf8');
  const storageCheckpoint=pcAfterFixCiSource(row.path,source);
  assert.notEqual(pcFinalStorageSource(row.path,storageCheckpoint),storageCheckpoint);
  assert.equal(pcFinalStorageSource(row.path,source+'\n'),source+'\n');
  assert.equal(pcFinalStorageSource('foreign/'+row.path,source),source);
  assert.equal(pcFinalStorageSource(row.path,null),null);
  assert.throws(()=>assertIntegratedCurrent((path,encoding)=>readFileSync(path,encoding)+(path===row.path?'\n':'')),/fresh/);
 }
});
