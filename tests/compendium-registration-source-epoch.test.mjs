import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const runtime=process.env.COMPENDIUM_EPOCH_TEST_RUNTIME
 ?pathToFileURL(resolve(process.env.COMPENDIUM_EPOCH_TEST_RUNTIME)).href
 :'./helpers/combined-epoch/source-epoch-runtime.mjs';
const {createSourceEpochProjector}=await import(runtime);
const witness=JSON.parse(readFileSync('tests/fixtures/compendium-ui-registration-continuation.json','utf8'));
const architecture=witness.path,actor='src/lua/abyss_actor.lua',ui='src/lua/abyss_ui.lua';
const hash=source=>createHash('sha256').update(source).digest('hex');
const bind=source=>({source,sha256:hash(source)});
const currentActor='local stage=2\n',oldActor='local stage=1\n';
function setup(){
 const current={[architecture]:witness.before,[actor]:bind(currentActor),[ui]:witness.linkedOwners[ui].before};
 const files={[architecture]:bind('{}\n'),[actor]:bind(oldActor),[ui]:witness.linkedOwners[ui].before};
 const projector=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:witness.parentCommit,
  current,owners:[architecture,actor],targets:{prior:{commit:witness.baseCommit,files}}},{allowConfigLayout:true});
 const live={[architecture]:witness.after.source,[actor]:currentActor,[ui]:witness.linkedOwners[ui].after.source};
 return {projector,live,project:(path,source)=>projector.preCombinedSource(path,source,{target:'prior',readSource:p=>live[p]})};
}
test('six UI registrations project only exact complete source and retain the old epoch',()=>{
 const {project,live}=setup();
 for(const source of [witness.after.source,witness.after.source.replaceAll('\n','\r\n'),JSON.stringify(JSON.parse(witness.after.source))])
  assert.equal(project(architecture,source),'{}\n');
 assert.equal(project(actor,currentActor),oldActor);
 assert.equal(project(architecture,witness.before.source),'{}\n');
 live[architecture]=witness.before.source;live[ui]=witness.linkedOwners[ui].before.source;
 assert.equal(project(actor,currentActor),oldActor);
 assert.equal(project(architecture,witness.before.source),'{}\n');
});
test('an explicit new registration input cannot be authenticated by the old raw owner',()=>{
 const {project,live}=setup();live[architecture]=witness.before.source;live[ui]=witness.linkedOwners[ui].before.source;
 assert.throws(()=>project(architecture,witness.after.source),/registration raw owner identity/);
});
test('foreign registration tokens remain unknown and never trigger linked reads',()=>{
 const {projector}=setup();
 const policy=JSON.parse(witness.after.source),variants=[];
 for(const name of ['model','input','card','actions','ui','host']){
  const missing=structuredClone(policy);delete missing.layers['abyss_compendium_'+name];variants.push(JSON.stringify(missing));
  const wrong=structuredClone(policy);wrong.layers['abyss_compendium_'+name]='core';variants.push(JSON.stringify(wrong));
 }
 variants.push(witness.after.source+'\n-- foreign\n',witness.after.source.replace('"abyss_compendium_model": "ui",','"abyss_compendium_model": "ui", "abyss_compendium_model": "ui",'));
 const reversed=structuredClone(policy);reversed.deferredImports.reverse();variants.push(JSON.stringify(reversed));
 for(const source of variants){let reads=0;
  assert.equal(projector.preCombinedSource(architecture,source,{target:'prior',readSource:()=>{reads++;throw Error('must not read');}}),source);
  assert.equal(reads,0);
 }
});
test('fresh raw registration owners reject drift, missing data and input-layout tricks',()=>{
 const {project,live}=setup();
 for(const actual of [undefined,null,witness.after.source+'\n',JSON.stringify(JSON.parse(witness.after.source)),witness.after.source.slice(1)]){
  live[architecture]=actual;
  assert.throws(()=>project(actor,currentActor),/combined linked owner identity|continuation owner pair/);
 }
 live[architecture]=witness.after.source.replaceAll('\n','\r\n');
 assert.equal(project(actor,currentActor),oldActor);
});
test('warm calls still authenticate every other current owner without authorization caches',()=>{
 const {project,live}=setup();assert.equal(project(actor,currentActor),oldActor);
 for(const actual of [undefined,null,currentActor+'-- changed\n']){
  live[actor]=actual;assert.throws(()=>project(architecture,witness.after.source),/combined linked owner identity/);
 }
 live[actor]=currentActor;assert.equal(project(architecture,witness.after.source),'{}\n');
 live[architecture]=witness.before.source;live[ui]=witness.linkedOwners[ui].before.source;
 assert.throws(()=>project(architecture,witness.after.source),/registration raw owner identity/);
});
test('the continuation samples each raw owner once and cannot authorize another epoch',()=>{
 const {projector,live}=setup(),calls={};
 assert.equal(projector.preCombinedSource(architecture,witness.after.source,{target:'prior',readSource:path=>{
  calls[path]=(calls[path]??0)+1;return calls[path]===1?live[path]:null;
 }}),'{}\n');
 assert.deepEqual(calls,{[architecture]:1,[ui]:1,[actor]:1});
 const other=createSourceEpochProjector({schemaVersion:1,normalization:'LF',currentCommit:witness.parentCommit,
  current:{[architecture]:bind('{"different":true}\n')},owners:[architecture],targets:{prior:{commit:witness.baseCommit,files:{[architecture]:bind('{}\n')}}}});
 assert.equal(other.preCombinedSource(architecture,witness.after.source,{target:'prior',readSource:()=>{throw Error('must not read');}}),witness.after.source);
});
test('the UI host and registrations form one call-local complete pair',()=>{
 const {project,live}=setup(),after=witness.linkedOwners[ui].after.source;
 assert.equal(project(ui,after),witness.linkedOwners[ui].before.source);
 for(const owner of [architecture,ui]){
  const row=owner===architecture?witness:witness.linkedOwners[ui];
  live[owner]=row.before.source;
  assert.throws(()=>project(actor,currentActor),/continuation owner pair/);
  assert.throws(()=>project(owner,row.after.source),/registration raw owner identity/);
  live[owner]=row.after.source;
 }
 live[ui]=after+'-- changed\n';assert.throws(()=>project(actor,currentActor),/continuation owner pair/);
});
