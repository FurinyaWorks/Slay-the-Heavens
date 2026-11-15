import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,mkdirSync,rmSync,existsSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {copyIntegrationSourceClosure} from './helpers/copy-integration-source-closure.mjs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,preReleasePc22BasicFeedbackSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {releasePc22BasicFeedbackSourcePacket,extendReleasePc22BasicFeedbackSource} from './helpers/release-pc22-basic-feedback-source.mjs';
import {releasePc22BasicFeedbackCiPacket,releasePc22BasicFeedbackCiSource,releasePc22BasicFeedbackPriorInventory,assertReleasePc22BasicFeedbackRawInventory,assertReleasePc22BasicFeedbackCiCurrent,assertReleasePc22BasicFeedbackExecutionGuards} from './helpers/release-pc22-basic-feedback-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');

test('release PC22 basic feedback production preserves every complete prior target and freshly authenticates the committed source tree',()=>{
 const p=sourceEpoch.proof,prior=preReleasePc22BasicFeedbackSourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name);
 assert.deepEqual(p.targets.releasePc22BasicFeedbackPrior.files,prior.current);
 assert.equal(p.currentTreeCommitted,true);assert.equal(p.currentCommit,releasePc22BasicFeedbackSourcePacket.currentCommit);
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path);
 for(const [path,before]of Object.entries(releasePc22BasicFeedbackSourcePacket.before))assert.deepEqual(before,prior.current[path]);
 assert.throws(()=>extendReleasePc22BasicFeedbackSource(preReleasePc22BasicFeedbackSourceEpoch,{...releasePc22BasicFeedbackSourcePacket,current:{}}),/only the approved PC22 basic feedback owners advance/);
});

test('release PC22 basic feedback CI validates complete live bindings while unknown or changed bytes stay visible',()=>{
 assertReleasePc22BasicFeedbackCiCurrent();
 for(const [path,row]of Object.entries(releasePc22BasicFeedbackCiPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(releasePc22BasicFeedbackCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(releasePc22BasicFeedbackCiSource(path,foreign),foreign,path);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releasePc22BasicFeedbackCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleasePc22BasicFeedbackCiCurrent((p,encoding)=>{
   const raw=readFileSync(p,encoding);return p===path?typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]):raw;
  }),/fresh complete integration source/);
 }
 for(const path of Object.keys(releasePc22BasicFeedbackSourcePacket.current))assert.equal(releasePc22BasicFeedbackCiSource(path,sourceEpoch.proof.current[path].source),sourceEpoch.proof.current[path].source,'CI does not intercept production authorization');
});

test('release PC22 basic feedback raw JS and Lua inventories reject missing duplicate foreign and changed additions',()=>{
 assert.deepEqual(releasePc22BasicFeedbackCiPacket.rawLuaOwners,{'tests/lua/card_flow_contact_continuity.lua':['src/lua/abyss_card_flow.lua']});
 assert.deepEqual(Object.keys(releasePc22BasicFeedbackCiPacket.rawLuaOwners),
  releasePc22BasicFeedbackCiPacket.currentInventory.lua.filter(path=>!releasePc22BasicFeedbackCiPacket.priorInventory.lua.includes(path)),
  'the complete new raw Lua inventory belongs to the exact CardFlow production owner');
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,releasePc22BasicFeedbackCiPacket.currentInventory[kind]);
  assertReleasePc22BasicFeedbackRawInventory(paths,kind);
  assert.deepEqual(releasePc22BasicFeedbackPriorInventory(paths,kind),releasePc22BasicFeedbackCiPacket.priorInventory[kind]);
  const opaque=[`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`];
  assert.deepEqual(releasePc22BasicFeedbackPriorInventory(opaque,kind),opaque,'unrelated historical input stays opaque for its own validator');
  const noAdditions=paths.filter(path=>releasePc22BasicFeedbackCiPacket.priorInventory[kind].includes(path));
  if(paths.length!==noAdditions.length)assert.throws(()=>assertReleasePc22BasicFeedbackRawInventory(noAdditions,kind),/raw discovery inventory/,'deleting every release addition cannot pass raw Full validation');
  assert.throws(()=>assertReleasePc22BasicFeedbackRawInventory(opaque,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertReleasePc22BasicFeedbackRawInventory(bad,kind),/raw discovery inventory/);
  for(const path of paths.filter(p=>!releasePc22BasicFeedbackCiPacket.priorInventory[kind].includes(p)))
   assert.throws(()=>releasePc22BasicFeedbackPriorInventory(paths,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh release PC22 basic feedback added inventory source/);
 }
});

test('release PC22 basic feedback raw workflow checks each real execution deadline and trusted local route',()=>{
 const workflow=norm(readFileSync('.github/workflows/quality.yml','utf8'));
 assertReleasePc22BasicFeedbackExecutionGuards(workflow);
 for(const [before,after]of [
  ["matrix.os == 'windows-2025' && 45 || 30","matrix.os == 'windows-2025' && 30 || 30"],
  ["local-special' && 75 || 45","local-special' && 75 || 30"],
  ["local-special' && 75 || 45","local-special' && 76 || 45"],
  ['runs-on: ubuntu-24.04\n    timeout-minutes: 30','runs-on: ubuntu-24.04\n    timeout-minutes: 20'],
  ["github.event_name == 'workflow_dispatch' && inputs.runner_pool",'inputs.runner_pool'],
  ["github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/master'",'true']]){
  assert(workflow.includes(before),'negative control must change a real workflow input');
  assert.throws(()=>assertReleasePc22BasicFeedbackExecutionGuards(workflow.replaceAll(before,after)),/raw Quality/,before);
 }
 const fast="    timeout-minutes: ${{ matrix.os == 'windows-2025' && 45 || 30 }}";
 const posix='    timeout-minutes: 30';
 assert(workflow.includes(fast));assert(workflow.includes(posix));
 for(const bad of [workflow.replace(fast,''),workflow.replace(fast,fast+'\n'+fast),
  workflow.replace(fast,'      timeout-minutes: 45'),
  workflow.replace(fast,'').replace(posix,posix+'\n'+fast)])
  assert.throws(()=>assertReleasePc22BasicFeedbackExecutionGuards(bad),/raw Quality/,'missing, duplicate, step-only and wrong-job guards fail');
});

test('release PC22 basic feedback production requires fresh complete owners and leaves foreign bytes visible',()=>{
 const p=sourceEpoch.proof,prior=preReleasePc22BasicFeedbackSourceEpoch.proof;
 assert.equal(Object.keys(p.current).length,352);assert.equal(prior.owners.length,116);assert.equal(p.owners.length,117);
 assert.equal(Object.keys(prior.targets).length,64);assert.equal(Object.keys(p.targets).length,65);
 const anchor=Object.keys(releasePc22BasicFeedbackSourcePacket.current)[0],raw=path=>readFileSync(path,'utf8');
 const source=norm(raw(anchor)),expected=prior.current[anchor].source;
 for(const current of [source,source.replaceAll('\n','\r\n')]){
  const seen=[];assert.equal(sourceEpoch.preCombinedSource(anchor,current,{target:'releasePc22BasicFeedbackPrior',readSource:path=>{seen.push(path);return raw(path);}}),expected);
  assert.deepEqual(seen,p.owners,'every invocation freshly authenticates all owners');
 }
 for(const owner of p.owners)for(const mode of ['changed','missing','buffer','throw']){
  const read=path=>{if(path!==owner)return raw(path);if(mode==='throw')throw Error('injected missing owner');if(mode==='missing')return null;if(mode==='buffer')return Buffer.from(raw(path));return raw(path)+'\n';};
  assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'releasePc22BasicFeedbackPrior',readSource:read}),/linked owner/);
 }
 for(const foreign of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),Buffer.from(source),null,17]){
  let reads=0;assert.equal(sourceEpoch.preCombinedSource(anchor,foreign,{target:'releasePc22BasicFeedbackPrior',readSource:()=>{reads++;throw Error('foreign bytes');}}),foreign);assert.equal(reads,0);
 }
 assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'foreign'}),/unknown source target/);
 for(const mutate of [v=>{v.before[anchor].source+='\n';},v=>{delete v.current[anchor];},v=>{v.currentCommit='f'.repeat(40);},v=>{v.producers[anchor].parents=[];}]){
  const bad=structuredClone(releasePc22BasicFeedbackSourcePacket);mutate(bad);assert.throws(()=>extendReleasePc22BasicFeedbackSource(preReleasePc22BasicFeedbackSourceEpoch,bad));
 }
});

test('release PC22 basic feedback isolated production copy includes exact helper and packet without CI trust leaf',async t=>{
 const directory=mkdtempSync(join(tmpdir(),'release-pc22-basic-feedback-copy-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 copyIntegrationSourceClosure(directory);
 for(const file of ['release-pc22-basic-feedback-source.mjs','release-pc22-basic-feedback-source.json.gz'])assert(existsSync(join(directory,'tests/helpers',file)));
 assert(!existsSync(join(directory,'tests/helpers/release-pc22-basic-feedback-ci-source.mjs')));
 const copied=await import(pathToFileURL(join(directory,'tests/helpers/closeout-source-epoch.mjs')).href);
 assert.deepEqual(copied.sourceEpoch.proof,sourceEpoch.proof);
 const sourceRoot=join(directory,'drift');mkdirSync(sourceRoot);
 // The original closure copier authenticates dependencies from a distinct root.
 copyIntegrationSourceClosure(sourceRoot,{sourceRoot:directory});
 for(const file of ['closeout-source-epoch.mjs','release-pc22-basic-feedback-source.mjs','release-pc22-basic-feedback-source.json.gz']){
  const adapter=join(directory,'tests/helpers',file),bytes=readFileSync(adapter);
  writeFileSync(adapter,Buffer.concat([bytes,Buffer.from('\n')]));
  assert.throws(()=>copyIntegrationSourceClosure(sourceRoot,{sourceRoot:directory}),/fresh helper copy identity/);
  unlinkSync(adapter);
  assert.throws(()=>copyIntegrationSourceClosure(sourceRoot,{sourceRoot:directory}),/ENOENT/);
  writeFileSync(adapter,bytes);copyIntegrationSourceClosure(sourceRoot,{sourceRoot:directory});
 }
});
