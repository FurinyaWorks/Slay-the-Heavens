import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createSourceEpochProjector} from './helpers/combined-epoch/source-epoch-runtime.mjs';
import {composeDevelopArchitectureEpoch} from './helpers/develop-architecture-source-epoch.mjs';
const hash=source=>createHash('sha256').update(source).digest('hex');
const bind=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const path='src/lua/architecture_probe.lua',added='src/lua/architecture_leaf.lua',input='tests/lua/architecture_probe.lua';
const base='c2409ad750c15124b7b843c6bbfa5b222537cb75';
function fixture(){
 const before=bind('return 1\n'),original=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:base,
  owners:[path],current:{[path]:before},targets:{old:{commit:'a'.repeat(40),files:{[path]:bind('return 0\n')}}}});
 const patch={schemaVersion:1,normalization:'LF',baseCommit:base,inventoryBefore:[path],inventoryAfter:[added,path].sort(),
  before:{[path]:before,[added]:null},current:{[path]:bind("return require('architecture_leaf')\n"),[added]:bind('return 1\n')},
  inputs:{[input]:{before:bind('old()\n'),current:bind('new(host)\n')}}};
 const epoch=composeDevelopArchitectureEpoch(original,patch);
 const raw=p=>epoch.proof.current[p]?.source??patch.inputs[p]?.current.source??null;
 return {original,patch,epoch,raw};
}
test('architecture outer epoch retains complete predecessors and pads introduced modules without inventing history',()=>{
 const {original,patch,epoch,raw}=fixture();
 assert.deepEqual(epoch.proof.targets.developArchitecturePrior.files[path],original.proof.current[path]);
 assert.equal(epoch.proof.targets.old.files[added],null);
 assert.equal(epoch.preCombinedSource(path,raw(path),{target:'old',readSource:raw}),'return 0\n');
 assert.equal(epoch.preCombinedSource(added,raw(added),{target:'old',readSource:()=>assert.fail('witness cannot authorize')}),raw(added));
 assert.equal(epoch.preArchitectureInput(input,raw(input),{readSource:raw}),patch.inputs[input].before.source);
 assert(Object.isFrozen(epoch.proof)&&Object.isFrozen(epoch.proof.developArchitectureInputs));
});
test('every real owner is freshly authenticated after warm success for LF and CRLF callers',()=>{
 const {epoch,raw}=fixture(),source=raw(path),target='old';
 for(const owner of epoch.proof.owners){
  let drift=false;const read=p=>p===owner&&drift?raw(p)+'-- drift':raw(p);
  assert.equal(epoch.preCombinedSource(path,source,{target,readSource:read}),'return 0\n');drift=true;
  assert.throws(()=>epoch.preCombinedSource(path,source,{target,readSource:read}),/linked owner identity/);
  assert.throws(()=>epoch.preCombinedSource(path,source,{target,readSource:p=>p===owner?null:raw(p)}),/linked owner identity/);
 }
 assert.equal(epoch.preCombinedSource(path,source.replaceAll('\n','\r\n'),{target,readSource:p=>raw(p)?.replaceAll('\n','\r\n')}),'return 0\n');
 for(const value of [null,17,source+'\n',source.slice(1)])assert.equal(epoch.preCombinedSource(path,value,{target,readSource:()=>assert.fail('foreign input cannot authorize reads')}),value);
 assert.throws(()=>epoch.preCombinedSource(path,source,{target:'missing',readSource:raw}),/unknown source target/);
});
test('auxiliary Lua ABI projections authenticate their complete current production and input closure',()=>{
 const {epoch,raw,patch}=fixture(),source=raw(input);
 for(const owner of [...epoch.proof.owners,...Object.keys(patch.inputs)]){
  let drift=false;const read=p=>p===owner&&drift?raw(p)+'-- drift':raw(p);
  assert.equal(epoch.preArchitectureInput(input,source,{readSource:read}),'old()\n');drift=true;
  assert.throws(()=>epoch.preArchitectureInput(input,source,{readSource:read}),/linked owner identity/);
 }
 for(const value of [null,source+'\n',patch.inputs[input].before.source])assert.equal(epoch.preArchitectureInput(input,value,{readSource:()=>assert.fail('foreign input cannot authorize reads')}),value);
});

test('inherited auxiliary identity fields cannot gain or retain authorization through prototype metadata',()=>{
 const {original,patch}=fixture();
 for(const field of ['source','sha256','gitBlob']){
  const variant=structuredClone(patch),value=variant.inputs[input].before[field];
  delete variant.inputs[input].before[field];
  assert(!Object.hasOwn(Object.prototype,field),'prototype probe owns only a previously absent field');
  Object.defineProperty(Object.prototype,field,{value,writable:true,configurable:true});
  try{
   assert.throws(()=>composeDevelopArchitectureEpoch(original,variant),/own identity fields/);
  }finally{delete Object.prototype[field];}
 }
 const {epoch,raw}=fixture();
 assert.equal(epoch.preArchitectureInput(input,raw(input),{readSource:raw}),'old()\n');
 Object.defineProperty(Object.prototype,'source',{value:'forged unvalidated old bytes\n',writable:true,configurable:true});
 try{assert.equal(epoch.preArchitectureInput(input,raw(input),{readSource:raw}),'old()\n');}
 finally{delete Object.prototype.source;}
});

test('new production bindings also require complete own identity metadata',()=>{
 const {original,patch}=fixture();
 for(const field of ['source','sha256','gitBlob']){
  const variant=structuredClone(patch),value=variant.current[path][field];delete variant.current[path][field];
  Object.defineProperty(Object.prototype,field,{value,writable:true,configurable:true});
  try{assert.throws(()=>composeDevelopArchitectureEpoch(original,variant),/own identity fields/);}
  finally{delete Object.prototype[field];}
 }
});

test('the complete actual architecture continuation keeps every old target and current owner source identity',async()=>{
 const {sourceEpoch:epoch,preDevelopArchitectureEpoch:prior}=await import('./helpers/closeout-source-epoch.mjs');
 const proof=epoch.proof;
 for(const [name,target]of Object.entries(prior.proof.targets)){
  assert.equal(proof.targets[name].commit,target.commit);
  for(const [file,binding]of Object.entries(target.files))assert.deepEqual(proof.targets[name].files[file],binding,`${name}:${file}`);
 }
 for(const [file,binding]of Object.entries(prior.proof.current))assert.deepEqual(proof.targets.developArchitecturePrior.files[file],binding,file);
 for(const [file,binding]of Object.entries(proof.current)){
  const source=readFileSync(file,'utf8').replaceAll('\r\n','\n');assert.equal(hash(source),binding.sha256,file+' complete current identity');
  const before=proof.targets.developArchitecturePrior.files[file];
  if(before&&before.sha256!==binding.sha256)assert.equal(epoch.preCombinedSource(file,source,{target:'developArchitecturePrior'}),before.source,file+' exact predecessor');
 }
});
