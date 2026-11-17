// One exact outer source view. Earlier archives and behavioral oracles stay frozen.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const base='c2409ad750c15124b7b843c6bbfa5b222537cb75';
const normalize=s=>s.replaceAll('\r\n','\n');
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const live=path=>{try{return readFileSync(new URL('../../'+path,import.meta.url),'utf8');}catch(error){if(error.code==='ENOENT')return null;throw error;}};
function inputBinding(binding){
 if(binding===null)return;
 assert(binding&&typeof binding==='object','architecture input identity object');
 assert.deepEqual(Object.keys(binding).sort(),['gitBlob','sha256','source'],'architecture input own identity fields');
 assert.equal(typeof binding?.source,'string','architecture input complete source');
 assert.equal(normalize(binding.source),binding.source,'architecture input LF');
 assert.equal(hash(binding.source),binding.sha256,'architecture input source identity');
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,'architecture input Git blob');
}
export function composeDevelopArchitectureEpoch(original,input){
 const patch=JSON.parse(JSON.stringify(input)),prior=original.proof;
 assert.equal(patch.schemaVersion,1);assert.equal(patch.normalization,'LF');assert.equal(patch.baseCommit,base);
 assert.deepEqual(patch.inventoryBefore,Object.keys(prior.current).sort(),'complete architecture predecessor inventory');
 assert.deepEqual(Object.keys(patch.before).sort(),Object.keys(patch.current).sort(),'complete architecture changed source slice');
 for(const [path,row]of Object.entries(patch.before))assert.deepEqual(row,prior.current[path]??null,'exact architecture predecessor: '+path);
 for(const row of Object.values(patch.current))inputBinding(row);
 const current={...prior.current,...patch.current},paths=Object.keys(current).sort();
 assert.deepEqual(paths,patch.inventoryAfter,'complete architecture current inventory');
 const inputs=Object.hasOwn(patch,'inputs')?patch.inputs:{};
 for(const [path,row]of Object.entries(inputs)){
  assert(/^(?:scripts\/[A-Za-z0-9_/-]+\.(?:lua|mjs|json)|tests\/(?:lua|helpers)\/[A-Za-z0-9_/-]+\.lua|tests\/[A-Za-z0-9_-]+\.test\.mjs)$/.test(path),'explicit auxiliary executable input path');
  assert.deepEqual(Object.keys(row).sort(),['before','current']);inputBinding(row.before);inputBinding(row.current);
 }
 const inventories=Object.hasOwn(patch,'inventories')?patch.inventories:{};
 for(const [kind,row]of Object.entries(inventories)){
  assert(['js','lua'].includes(kind),'architecture inventory kind');
  assert.deepEqual(Object.keys(row).sort(),['before','current'],'architecture inventory own fields');
  for(const side of ['before','current']){
   assert(Array.isArray(row[side]),'complete architecture inventory');
   assert.deepEqual(row[side],[...new Set(row[side])].sort(),'sorted unique architecture inventory');
   for(const path of row[side])assert(kind==='js'?/^tests\/[A-Za-z0-9_-]+\.test\.mjs$/.test(path):/^tests\/lua\/[A-Za-z0-9_-]+\.lua$/.test(path),'architecture inventory path');
  }
  for(const path of row.current.filter(path=>!row.before.includes(path)))assert(inputs[path]?.before===null&&inputs[path]?.current,'complete added architecture inventory identity: '+path);
 }
 const pad=files=>Object.fromEntries(paths.map(path=>[path,files[path]??null]));
 const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,target])=>[name,{...target,files:pad(target.files)}]));
 assert(!Object.hasOwn(targets,'developArchitecturePrior'));
 targets.developArchitecturePrior={commit:base,files:pad(prior.current)};
 const owners=paths.filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 const epoch=createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,currentCommit:patch.sourceCommit??base,
  currentCommitRole:'complete develop architecture candidate on the recorded production commit; per-file hashes identify its complete source inputs',
  current,targets,owners,developArchitectureInputs:inputs,developArchitectureInventories:inventories}),{allowConfigLayout:true,reuseFrozenInput:true});
 // Auxiliary test/script ABI changes are explicit historical inputs, separate
 // from the established production-only projector path contract.
 function preArchitectureInput(path,source,{readSource=live}={}){
  const row=Object.hasOwn(inputs,path)?inputs[path]:null;
  if(typeof source!=='string'||!row?.before||!row.current||row.before.sha256===row.current.sha256||hash(normalize(source))!==row.current.sha256)return source;
  assert.equal(typeof readSource,'function','architecture linked input reader');
  const linked={...Object.fromEntries(owners.map(path=>[path,current[path]])),...Object.fromEntries(Object.entries(inputs).map(([path,row])=>[path,row.current]))};
  for(const [owner,binding]of Object.entries(linked)){
   let actual;try{actual=readSource(owner);}catch(error){assert.fail('architecture linked owner missing: '+owner+': '+String(error?.message??error));}
   assert(binding===null?actual===null||actual===undefined:typeof actual==='string'&&hash(normalize(actual))===binding.sha256,'architecture linked owner identity: '+owner);
  }
  return row.before.source;
 }
 return Object.freeze({...epoch,preArchitectureInput});
}
export function extendDevelopArchitectureEpoch(original){return composeDevelopArchitectureEpoch(original,readDevelopArchitecturePatch());}
export {inputBinding as validateArchitectureBinding};
export function readDevelopArchitecturePatch(){
 const bytes=readFileSync(new URL('./develop-architecture-source-epoch.json.gz',import.meta.url));
 assert.equal(hash(bytes),'2aabf052632f8fd9de8f2a228db46dfab41366b6da084297f2a5e942f17c86da','complete develop architecture source archive');
 return freeze(JSON.parse(gunzipSync(bytes)));
}
