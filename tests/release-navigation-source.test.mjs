import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as physicalReadFileSync,readdirSync} from 'node:fs';
import {releaseMergeRead,releaseMergeSource,releaseMergeCiPacket,assertReleaseMergeCurrent,assertReleaseMergeGitProvenance,releaseMergeArchivedGitRead} from './helpers/release-bootstrap-merge-ci-source.mjs';
const readFileSync=releaseMergeRead('slicePrior',physicalReadFileSync);
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,preReleaseNavigationSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {releaseNavigationSourcePacket,extendReleaseNavigationSource} from './helpers/release-navigation-source.mjs';
import {releaseNavigationCiPacket,releaseNavigationCiSource,releaseNavigationPriorInventory,assertReleaseNavigationRawInventory,assertReleaseNavigationCiCurrent} from './helpers/release-navigation-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');

test('release navigation production preserves every complete prior target and freshly authenticates the committed source tree',()=>{
 const p=sourceEpoch.proof,prior=preReleaseNavigationSourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name);
 assert.deepEqual(p.targets.releaseNavigationPrior.files,prior.current);
 assert.equal(p.currentTreeCommitted,true);assert.equal(p.currentCommit,releaseNavigationSourcePacket.currentCommit);
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path);
 for(const [path,before]of Object.entries(releaseNavigationSourcePacket.before))assert.deepEqual(before,prior.current[path]);
 assert.throws(()=>extendReleaseNavigationSource(preReleaseNavigationSourceEpoch,{...releaseNavigationSourcePacket,current:{}}),/only the three approved navigation owners advance/);
});

test('release navigation CI validates complete live bindings while unknown or changed bytes stay visible',()=>{
 assertReleaseNavigationCiCurrent(readFileSync);
 for(const [path,row]of Object.entries(releaseNavigationCiPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(releaseNavigationCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(releaseNavigationCiSource(path,foreign),foreign,path);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseNavigationCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseNavigationCiCurrent((p,encoding)=>{
   const raw=readFileSync(p,encoding);return p===path?typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]):raw;
  }),/fresh complete integration source/);
 }
 for(const path of Object.keys(releaseNavigationSourcePacket.current))assert.equal(releaseNavigationCiSource(path,sourceEpoch.proof.current[path].source),sourceEpoch.proof.current[path].source,'CI does not intercept production authorization');
});

test('release navigation raw JS and Lua inventories reject missing duplicate foreign and changed additions',()=>{
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,releaseNavigationCiPacket.currentInventory[kind]);
  assertReleaseNavigationRawInventory(paths,kind);
  assert.deepEqual(releaseNavigationPriorInventory(paths,kind,readFileSync),releaseNavigationCiPacket.priorInventory[kind]);
  const opaque=[`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`];
  assert.deepEqual(releaseNavigationPriorInventory(opaque,kind),opaque,'unrelated historical input stays opaque for its own validator');
  const noAdditions=paths.filter(path=>releaseNavigationCiPacket.priorInventory[kind].includes(path));
  assert.throws(()=>assertReleaseNavigationRawInventory(noAdditions,kind),/raw discovery inventory/,'deleting every release addition cannot pass raw Full validation');
  assert.throws(()=>assertReleaseNavigationRawInventory(opaque,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>releaseNavigationPriorInventory(bad,kind),/raw .* inventory/);
  for(const path of paths.filter(p=>!releaseNavigationCiPacket.priorInventory[kind].includes(p)))
   assert.throws(()=>releaseNavigationPriorInventory(paths,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh release navigation added inventory source/);
 }
});

test('actual Release merge authenticates separate slice and bootstrap views with fresh complete current bindings',()=>{
 assertReleaseMergeCurrent();
 for(const [path,row]of Object.entries(releaseMergeCiPacket.files)){
  const current=physicalReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(hash(current),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  for(const target of ['slicePrior','bootstrapView']){
   assert.equal(releaseMergeSource(path,current,target),production?current:row[target]?.source??current,path+':'+target);
   for(const foreign of [current+'\n',current.slice(1),current.replaceAll('\n','\r\r\n'),Buffer.from(current),null,17]){
    let reads=0;assert.equal(releaseMergeSource(path,foreign,target,()=>{reads++;throw Error('foreign linked read');}),foreign);assert.equal(reads,0);
   }
  }
  for(const mode of ['changed','missing','buffer','throw'])assert.throws(()=>assertReleaseMergeCurrent((p,e)=>{
   if(p!==path)return physicalReadFileSync(p,e);
   if(mode==='throw')throw Error('missing injected '+p);
   if(mode==='missing')return null;
   if(mode==='buffer')return Buffer.from(physicalReadFileSync(p,e));
   return physicalReadFileSync(p,e)+'\n';
  }));
 }
 const archive=Object.keys(releaseMergeCiPacket.immutableArchives)[0];
 assert.throws(()=>assertReleaseMergeCurrent((p,e)=>p===archive?physicalReadFileSync(p).subarray(1):physicalReadFileSync(p,e)),/retained actual Release merge archive/);
 const path=Object.keys(releaseMergeCiPacket.files).find(p=>!p.startsWith('src/')&&p!=='config/architecture.json'),current=physicalReadFileSync(path,'utf8');
 let drift=false;const reader=(p,e)=>{const raw=physicalReadFileSync(p,e);return drift&&p===path?raw+'\n':raw;};
 releaseMergeSource(path,current,'slicePrior',reader);drift=true;
 assert.throws(()=>releaseMergeSource(path,current,'slicePrior',reader),/fresh complete integration source/,'warm success never authorizes later linked drift');
});

test('actual Release merge proves all production base Git blobs and exact bootstrap sources without relabelling producers',()=>{
 assertReleaseMergeGitProvenance(releaseMergeArchivedGitRead());
 assert.equal(releaseMergeCiPacket.releaseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.equal(releaseMergeCiPacket.releaseParent,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.equal(Object.keys(releaseMergeCiPacket.bootstrapGitBindings).length,10,'every complete bootstrap current binding has actual Git provenance');
});

test('navigation fixture repair retains the complete original merge packet and exact historical source views',()=>{
 const archive='tests/helpers/release-bootstrap-merge-before-navigation-fixture-repair-ci-source.json.gz',bytes=physicalReadFileSync(archive);
 assert.equal(hash(bytes),'1656049e4539b353628590e920a0bbb76fab2a23651caf0037aaf981fcc629a9');
 const prior=JSON.parse(gunzipSync(bytes));assert.equal(releaseMergeCiPacket.immutableArchives[archive],hash(bytes));
 const added=['tests/helpers/game-ui-host-live-contract.mjs','tests/lua/formal_campaign_entry.lua','tests/mobile-typography.test.mjs','tests/sts-style-source-epoch.test.mjs'];
 assert.deepEqual(Object.keys(releaseMergeCiPacket.files).sort(),[...Object.keys(prior.files),...added].sort());
 const changed=[];
 for(const [path,row]of Object.entries(prior.files)){
  assert.deepEqual(releaseMergeCiPacket.files[path].slicePrior,row.slicePrior,path);
  assert.deepEqual(releaseMergeCiPacket.files[path].bootstrapView,row.bootstrapView,path);
  if(releaseMergeCiPacket.files[path].current.sha256!==row.current.sha256)changed.push(path);
  else assert.deepEqual(releaseMergeCiPacket.files[path].current,row.current,path);
 }
 assert.deepEqual(changed,['tests/release-navigation-source.test.mjs']);
 // Literal complete-source identities were independently read from both exact Git commits.
 const beforeIds={"tests/helpers/game-ui-host-live-contract.mjs":{"slicePrior":{"gitBlob":"67cb7ea22df2a49f8ec4d21ef562bd0a42c6d7f0","sha256":"0563ff777a64dcd9ca578c3add3bc2a77669b4e4bbd54762d46e24fd75fdaf9e"},"bootstrapView":{"gitBlob":"67cb7ea22df2a49f8ec4d21ef562bd0a42c6d7f0","sha256":"0563ff777a64dcd9ca578c3add3bc2a77669b4e4bbd54762d46e24fd75fdaf9e"}},"tests/lua/formal_campaign_entry.lua":{"slicePrior":{"gitBlob":"abd8a1acd79a5a0445b9d5f28549e1f2d609b8d6","sha256":"a74e6be64363a625e1f24fedc37da2823b8ac8ac43098d1c9a8268530908737a"},"bootstrapView":{"gitBlob":"abd8a1acd79a5a0445b9d5f28549e1f2d609b8d6","sha256":"a74e6be64363a625e1f24fedc37da2823b8ac8ac43098d1c9a8268530908737a"}},"tests/mobile-typography.test.mjs":{"slicePrior":{"gitBlob":"23943307f85cec1aa3480d4e7d555951efdb1dd4","sha256":"3629444610ddafec000edb5c464884f9821d249b04553ef51b1cc804825aa12f"},"bootstrapView":{"gitBlob":"23943307f85cec1aa3480d4e7d555951efdb1dd4","sha256":"3629444610ddafec000edb5c464884f9821d249b04553ef51b1cc804825aa12f"}},"tests/sts-style-source-epoch.test.mjs":{"slicePrior":{"gitBlob":"dfb3119ddbaf2d0ee9661a8eaff1f2b601e30017","sha256":"e07efc666c0fc2c2d956b621d7e770ee47a4a900256fdf891360534f8b7b36be"},"bootstrapView":{"gitBlob":"dfb3119ddbaf2d0ee9661a8eaff1f2b601e30017","sha256":"e07efc666c0fc2c2d956b621d7e770ee47a4a900256fdf891360534f8b7b36be"}}};
 for(const path of added)for(const view of ['slicePrior','bootstrapView']){
  const row=releaseMergeCiPacket.files[path][view],expected=beforeIds[path][view];
  assert.equal(row.gitBlob,expected.gitBlob,path+':'+view);assert.equal(row.sha256,expected.sha256,path+':'+view);
  assert.equal(hash(row.source),expected.sha256,path+':'+view);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.source)}\0`).update(row.source).digest('hex'),expected.gitBlob,path+':'+view);
 }
 assert.deepEqual(Object.keys(releaseMergeCiPacket).sort(),[...Object.keys(prior),'gitObjectProof'].sort());
 assert.equal(Object.keys(prior.immutableArchives).length,95);
 for(const [path,sha]of Object.entries(prior.immutableArchives))assert.equal(releaseMergeCiPacket.immutableArchives[path],sha,path);
 assert.equal(Object.keys(releaseMergeCiPacket.immutableArchives).length,96);
 for(const field of Object.keys(prior).filter(key=>!['files','immutableArchives'].includes(key)))assert.deepEqual(releaseMergeCiPacket[field],prior[field],field);
});

test('archived Git provenance rejects changed missing and mistyped objects without a checkout database',()=>{
 const proof=releaseMergeCiPacket.gitObjectProof,commit=releaseMergeCiPacket.releaseCommit;
 assertReleaseMergeGitProvenance(releaseMergeArchivedGitRead(proof));
 const changed=structuredClone(proof);changed[commit].base64=Buffer.from('changed Git commit').toString('base64');
 assert.throws(()=>releaseMergeArchivedGitRead(changed),/complete archived Git object/);
 const missing=structuredClone(proof);delete missing[commit];
 assert.throws(()=>assertReleaseMergeGitProvenance(releaseMergeArchivedGitRead(missing)),/required complete Git commit/);
 const mistyped=structuredClone(proof);mistyped[commit].type='tree';
 assert.throws(()=>releaseMergeArchivedGitRead(mistyped),/complete archived Git object/);
 for(const [id,row]of Object.entries(proof).filter(([,row])=>row.type==='tree')){
  const missing=structuredClone(proof);delete missing[id];
  assert.throws(()=>assertReleaseMergeGitProvenance(releaseMergeArchivedGitRead(missing)),/required complete Git tree/);
 }
});

test('actual Release merge CI trust packet rejects truncated isolated copies',async()=>{
 const leaf=physicalReadFileSync('tests/helpers/release-bootstrap-merge-ci-source.mjs','utf8');
 const bytes=physicalReadFileSync('tests/helpers/release-bootstrap-merge-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-bootstrap-merge-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete actual Release merge CI composition/);
});
