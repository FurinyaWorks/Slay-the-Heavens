import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,preReleasePickerControlsSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {releasePickerControlsSourcePacket,extendReleasePickerControlsSource} from './helpers/release-picker-controls-source.mjs';
import {releasePickerControlsCiPacket,releasePickerControlsCiSource,releasePickerControlsPriorInventory,assertReleasePickerControlsRawInventory,assertReleasePickerControlsCiCurrent,assertReleasePickerControlsExecutionGuards} from './helpers/release-picker-controls-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');

test('actual merged Release authenticates every unchanged Lua and architecture predecessor without advancing the product epoch',()=>{
 const bytes=readFileSync('tests/helpers/release-picker-controls-base-source.json.gz');
 assert.equal(hash(bytes),'4678cdb4036cab5217a359657ae15735c7a2af47936ec58067018dd2d53c9dfa');
 const proof=JSON.parse(gunzipSync(bytes)),prior=preReleasePickerControlsSourceEpoch.proof;
 assert.equal(proof.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.deepEqual(proof.baseParents,['36b9b157ee6f05b65eb9f1da7e2978647d36c210']);
 assert.equal(proof.equivalentCommit,releasePickerControlsSourcePacket.baseCommit);
 assert.equal(proof.sourceCount,352);assert.equal(proof.ownerCount,116);
 assert.deepEqual(Object.keys(proof.files).sort(),Object.keys(prior.current).filter(path=>prior.current[path]!==null).sort());
 for(const [path,row]of Object.entries(proof.files)){
  assert.equal(row.gitBlob,row.oldGitBlob,path+' unchanged exact Git blob');
  assert.equal(hash(row.source),row.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.source)}\0`).update(row.source).digest('hex'),row.gitBlob,path);
  assert.equal(row.source,prior.current[path].source,path+' complete authenticated prior source');
 }
 assert.equal(releasePickerControlsSourcePacket.currentCommit,'93ae73760ecbe6540fac49d96c2309345d6b7824');
});

test('release picker controls production preserves every complete prior target and freshly authenticates the committed source tree',()=>{
 const p=sourceEpoch.proof,prior=preReleasePickerControlsSourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name);
 assert.deepEqual(p.targets.releasePickerControlsPrior.files,prior.current);
 assert.equal(p.currentTreeCommitted,true);assert.equal(p.currentCommit,releasePickerControlsSourcePacket.currentCommit);
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path);
 for(const [path,before]of Object.entries(releasePickerControlsSourcePacket.before))assert.deepEqual(before,prior.current[path]);
 assert.throws(()=>extendReleasePickerControlsSource(preReleasePickerControlsSourceEpoch,{...releasePickerControlsSourcePacket,current:{}}),/only the approved picker controls owner advances/);
});

test('release picker controls CI validates complete live bindings while unknown or changed bytes stay visible',()=>{
 assertReleasePickerControlsCiCurrent();
 for(const [path,row]of Object.entries(releasePickerControlsCiPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(releasePickerControlsCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(releasePickerControlsCiSource(path,foreign),foreign,path);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releasePickerControlsCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleasePickerControlsCiCurrent((p,encoding)=>{
   const raw=readFileSync(p,encoding);return p===path?typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]):raw;
  }),/fresh complete integration source/);
 }
 for(const path of Object.keys(releasePickerControlsSourcePacket.current))assert.equal(releasePickerControlsCiSource(path,sourceEpoch.proof.current[path].source),sourceEpoch.proof.current[path].source,'CI does not intercept production authorization');
});

test('release picker controls raw JS and Lua inventories reject missing duplicate foreign and changed additions',()=>{
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,releasePickerControlsCiPacket.currentInventory[kind]);
  assertReleasePickerControlsRawInventory(paths,kind);
  assert.deepEqual(releasePickerControlsPriorInventory(paths,kind),releasePickerControlsCiPacket.priorInventory[kind]);
  const opaque=[`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`];
  assert.deepEqual(releasePickerControlsPriorInventory(opaque,kind),opaque,'unrelated historical input stays opaque for its own validator');
  const noAdditions=paths.filter(path=>releasePickerControlsCiPacket.priorInventory[kind].includes(path));
  if(paths.length!==noAdditions.length)assert.throws(()=>assertReleasePickerControlsRawInventory(noAdditions,kind),/raw discovery inventory/,'deleting every release addition cannot pass raw Full validation');
  assert.throws(()=>assertReleasePickerControlsRawInventory(opaque,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertReleasePickerControlsRawInventory(bad,kind),/raw discovery inventory/);
  for(const path of paths.filter(p=>!releasePickerControlsCiPacket.priorInventory[kind].includes(p)))
   assert.throws(()=>releasePickerControlsPriorInventory(paths,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh release picker controls added inventory source/);
 }
});

test('release picker controls raw workflow checks each real execution deadline and trusted local route',()=>{
 const workflow=norm(readFileSync('.github/workflows/quality.yml','utf8'));
 assertReleasePickerControlsExecutionGuards(workflow);
 for(const [before,after]of [
  ["matrix.os == 'windows-2025' && 45 || 30","matrix.os == 'windows-2025' && 30 || 30"],
  ["local-special' && 75 || 45","local-special' && 75 || 30"],
  ["local-special' && 75 || 45","local-special' && 76 || 45"],
  ['runs-on: ubuntu-24.04\n    timeout-minutes: 30','runs-on: ubuntu-24.04\n    timeout-minutes: 20'],
  ["github.event_name == 'workflow_dispatch' && inputs.runner_pool",'inputs.runner_pool'],
  ["github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/master'",'true']]){
  assert(workflow.includes(before),'negative control must change a real workflow input');
  assert.throws(()=>assertReleasePickerControlsExecutionGuards(workflow.replaceAll(before,after)),/raw Quality/,before);
 }
});

test('picker pagination CI repair retains its complete committed predecessor and exact actual Release before',()=>{
 const archive='tests/helpers/release-picker-controls-ci-before-pagination-repair-source.json.gz';
 const bytes=readFileSync(archive),expected='8f63e3cb7ee9b5a81139b4193589ce6f098e423d43b576d190925411681776fe';
 assert.equal(hash(bytes),expected,'complete prior outer packet remains immutable');
 const prior=JSON.parse(gunzipSync(bytes)),current=releasePickerControlsCiPacket;
 assert.equal(prior.currentTreeCommitted,true);assert.equal(Object.keys(prior.files).length,25);
 assert.equal(Object.keys(prior.immutableArchives).length,96);
 assert.equal(current.currentTreeCommitted,false);
 assert.match(current.currentCommitRole,/historical basis only; not the repair after producer/);
 for(const key of Object.keys(prior).filter(k=>!['files','immutableArchives','currentTreeCommitted','currentCommitRole'].includes(k)))
  assert.deepEqual(current[key],prior[key],'unchanged prior packet metadata: '+key);
 for(const [path,row]of Object.entries(prior.files)){
  if(path==='tests/release-picker-controls-source.test.mjs'){
   assert.deepEqual(current.files[path].before,row.before);assert.equal(current.files[path].beforeCommit,row.beforeCommit);
   assert.notEqual(current.files[path].current.sha256,row.current.sha256);
  }else assert.deepEqual(current.files[path],row,'unchanged complete prior binding: '+path);
 }
 assert.deepEqual(Object.keys(current.files).filter(path=>!Object.hasOwn(prior.files,path)),['tests/official-choice-pagination.test.mjs']);
 const row=current.files['tests/official-choice-pagination.test.mjs'];
 assert.equal(row.beforeCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.equal(row.before.gitBlob,'c059649d949ead8e31665da238842ea35949a4d3');
 assert.equal(row.current.source,norm(readFileSync('tests/official-choice-pagination.test.mjs','utf8')));
 assert.equal(Object.keys(current.files).length,26);assert.equal(Object.keys(current.immutableArchives).length,97);
 assert.deepEqual(current.immutableArchives,{...prior.immutableArchives,[archive]:expected});
 assert.throws(()=>assertReleasePickerControlsCiCurrent((path,encoding)=>{
  const source=readFileSync(path,encoding);return path===archive?Buffer.concat([source,Buffer.from('\n')]):source;
 }),/retained complete immutable release predecessor/,'a changed complete old packet cannot authorize the repair');
});
