import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {c240CiDelta as delta,c240CiProof as proof,reconstructC240CiArchive,c240CiRawSha256} from './helpers/c240-ci-source-witness.mjs';
import {reconciliationCiPacket,assertReconciliationCiCurrent,reconciliationCiSource} from './helpers/reconciliation-ci-source.mjs';
import {assertIntegratedCurrent,integratedCurrentInventory} from './helpers/integrated-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),read=name=>readFileSync(new URL('./helpers/'+name+'.json.gz',import.meta.url));

test('c240 compact delta reconstructs all 224 current rows and 1344 original views with exact full source, JSON and gzip identities',()=>{
 assert.equal(Object.keys(proof.files).length,224);assert.equal(Object.values(proof.files).reduce((n,r)=>n+Object.keys(r.views).length,0),1344);
 assert.equal(Object.values(delta.pool).filter(r=>Object.hasOwn(r,'source')).length,11);
 for(const [path,row]of Object.entries(proof.files))for(const binding of [row.current,...Object.values(row.views)].filter(Boolean)){
  assert.equal(hash(binding.source),binding.sha256,path);assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
 for(const path of ['tests/helpers/combined-epoch/source-epoch-runtime.mjs','tests/seven-refactor-source-epoch.test.mjs'])assert.equal(Object.keys(proof.files[path].views).length,6);
 const restored=reconstructC240CiArchive();assert.deepEqual(restored.proof,proof);assert.equal(hash(restored.raw),c240CiRawSha256);assert.equal(hash(restored.bytes),delta.originalArchiveSha256);
});

test('historical witness rejects warm archive drift, missing refs, partial files and altered current or view bytes',()=>{
 reconstructC240CiArchive();
 for(const name of Object.keys(delta.refs))for(const missing of [false,true])assert.throws(()=>reconstructC240CiArchive(delta,n=>n===name?(missing?Buffer.alloc(0):Buffer.concat([read(n),Buffer.from('\n')])):read(n)),/fresh historical reference archive/);
 const missing=structuredClone(delta);delete missing.slots[missing.fileOrder[0]];assert.throws(()=>reconstructC240CiArchive(missing),/file order/);
 const altered=structuredClone(delta),key=Object.keys(altered.pool).find(k=>Object.hasOwn(altered.pool[k],'source'));altered.pool[key].source+='\n';assert.throws(()=>reconstructC240CiArchive(altered),/historical source bytes/);
 const view=structuredClone(delta),path=view.fileOrder[0];view.slots[path].native=null;assert.throws(()=>reconstructC240CiArchive(view),/original c240 JSON/);
});

test('reconciliation source bindings freshly authenticate every changed test while full raw discovery stays complete',()=>{
 assertReconciliationCiCurrent(readFileSync);assertIntegratedCurrent();
 for(const kind of ['js','lua']){
  const actual=readdirSync(kind==='js'?'tests':'tests/lua').filter(p=>p.endsWith(kind==='js'?'.test.mjs':'.lua')).map(p=>(kind==='js'?'tests/':'tests/lua/')+p).sort();assert.deepEqual(actual,reconciliationCiPacket.currentInventory[kind]);assert.deepEqual(actual,integratedCurrentInventory(kind));
 }
 for(const[path,row]of Object.entries(reconciliationCiPacket.files)){
  const source=readFileSync(path,'utf8');if(row.before)assert.equal(reconciliationCiSource(path,source),row.before.source);
  for(const foreign of [source+'\n',null,17])assert.equal(reconciliationCiSource(path,foreign),foreign);assert.equal(reconciliationCiSource('foreign/'+path,source),source);
  for(const missing of [false,true])assert.throws(()=>assertIntegratedCurrent((p,e)=>p===path?(missing?'':readFileSync(p,e)+'\n'):readFileSync(p,e)),/fresh reconciliation CI source/);
 }
});
