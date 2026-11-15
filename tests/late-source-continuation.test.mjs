import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceEpoch,e65SourceEpoch,sourceSlice} from './helpers/closeout-source-epoch.mjs';
import {lateProduction,lateProductionPaths} from './helpers/late-source-continuation.mjs';
import {lateCiProof,renderLateCiBinding} from './helpers/late-ci-source.mjs';
import {integratedCiProof,priorIntegratedCiProof,assertIntegratedCurrent,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
import {feedbackCiPatch} from './helpers/sts-feedback-ci.mjs';
import {extendFeedbackHelperClosure} from './helpers/sts-feedback-source-runtime.mjs';
import {extendLateHelperClosure} from './helpers/late-helper-closure.mjs';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
const hash=s=>createHash('sha256').update(s).digest('hex');
test('three-owner current advances while every e65 target and source predecessor remains intact',()=>{
 const prior=e65SourceEpoch.proof,current=sourceEpoch.proof;
 assert.deepEqual(current.targets.e65Prior.files,prior.current);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(Object.keys(current.current),Object.keys(prior.current));
 for(const [path,row]of Object.entries(current.current)){
  assert.deepEqual(row,lateProduction[path]?.after??prior.current[path],path);
  assert.equal(read(path),row.source,'complete raw production current: '+path);
 }
 for(const path of lateProductionPaths){
  assert.deepEqual(lateProduction[path].before,prior.current[path]);
  assert.equal(sourceSlice(path,read(path),'e65Prior'),prior.current[path].source);
  assert.equal(sourceSlice(path,read(path).replaceAll('\n','\r\n'),'e65Prior'),prior.current[path].source);
 }
});
test('each live source slice rejects all three stale, missing and drifting owners on cold and warm reads',()=>{
 for(const path of lateProductionPaths){
  const input=read(path),project=reader=>sourceSlice(path,input,'e65Prior',reader);
  assert.equal(project(read),lateProduction[path].before.source);
  for(const owner of lateProductionPaths){
   for(const bad of [read(owner)+'\n',lateProduction[owner].before.source,null,undefined,17])
    assert.throws(()=>project(p=>p===owner?bad:read(p)),/linked owner identity/);
   assert.throws(()=>project(p=>{if(p===owner)throw Error('missing');return read(p);}),/linked owner missing/);
   for(const reverse of [false,true]){
    let calls=0;const changing=p=>p===owner&&((++calls===1)!==reverse)?read(p):p===owner?lateProduction[p].before.source:read(p);
    assert.throws(()=>project(changing),/linked owner identity/,'within-call continuation switch rejected');
   }
   assert.equal(project(read),lateProduction[path].before.source,'valid warm reads recover');
  }
  for(const [inputPath,source,target]of [[path,input+'\n','e65Prior'],[path,input.slice(1),'e65Prior'],['foreign',input,'e65Prior'],[path,input,'followupCurrent']]){
   let reads=0;assert.equal(sourceSlice(inputPath,source,target,()=>{reads++;throw Error('unexpected');}),source);assert.equal(reads,0);
  }
 }
});
test('late CI authenticates full current sources, discovery and unchanged trust leaves independently',()=>{
 assertIntegratedCurrent();
 assert.deepEqual(lateCiProof.inventoryBefore,priorIntegratedCiProof.inventory);
 assert.deepEqual(lateCiProof.luaInventoryBefore,priorIntegratedCiProof.luaInventory);
 assert.deepEqual(lateCiProof.inventoryAfter,integratedCiProof.inventory);
 for(const path of lateProductionPaths){
  assert.equal(lateCiProof.files[path].after.source,read(path));
  assert.throws(()=>assertIntegratedCurrent((p,e)=>p===path?readFileSync(p,e)+'\n':readFileSync(p,e)),/fresh complete late CI source/);
 }
 for(const path of Object.keys(lateCiProof.files).filter(p=>!priorIntegratedCiProof.files[p]))
  assert.throws(()=>assertIntegratedCurrent((p,e)=>p===path?readFileSync(p,e)+'\n':readFileSync(p,e)),/fresh complete late CI source/);
 assert.equal(read('tests/helpers/late-ci-binding.mjs'),renderLateCiBinding(hash(readFileSync('tests/helpers/late-ci-source.json.gz'))));
 assert.equal(hash(readFileSync('tests/helpers/integrated-ci-source.json.gz')),lateCiProof.priorArchiveSha256);
});
test('helper closure advances strictly after feedback and integrated predecessors',()=>{
 const base=JSON.parse(read('tests/helpers/closeout-source-closure.json'));
 assert.equal(hash(readFileSync('tests/helpers/closeout-source-closure.json')),'031c42758ec5b37d1782c5fdb70542358d4b2631a5ee9b486b6bb5faccc988b5');
 const prior=extendIntegratedHelperClosure(extendFeedbackHelperClosure(base,feedbackCiPatch.helperClosure));
 const current=extendLateHelperClosure(prior);
 for(const [path,row]of Object.entries(lateCiProof.helperClosure)){
  assert.equal(row.before,prior[path]??null);assert.equal(current[path],row.after);
  assert.equal(hash(path.endsWith('.gz')?readFileSync(path):read(path)),row.after);
  assert.throws(()=>extendLateHelperClosure({...prior,[path]:'f'.repeat(64)}),/exact late copy predecessor/);
 }
 assert.equal(lateCiProof.helperClosure['tests/helpers/closeout-source-epoch.mjs'].before,priorIntegratedCiProof.closure['tests/helpers/closeout-source-epoch.mjs'].after);
});
