import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as physicalReadFileSync,readdirSync} from 'node:fs';
import {releaseMergeRead,releaseMergeSource,releaseMergeCiPacket,assertReleaseMergeCurrent,assertReleaseMergeGitProvenance} from './helpers/release-bootstrap-merge-ci-source.mjs';
const readFileSync=releaseMergeRead('slicePrior',physicalReadFileSync);
import {createHash} from 'node:crypto';
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
 assertReleaseMergeGitProvenance();
 assert.equal(releaseMergeCiPacket.releaseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.equal(releaseMergeCiPacket.releaseParent,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.equal(Object.keys(releaseMergeCiPacket.bootstrapGitBindings).length,10,'every complete bootstrap current binding has actual Git provenance');
});

test('actual Release merge CI trust packet rejects truncated isolated copies',async()=>{
 const leaf=physicalReadFileSync('tests/helpers/release-bootstrap-merge-ci-source.mjs','utf8');
 const bytes=physicalReadFileSync('tests/helpers/release-bootstrap-merge-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-bootstrap-merge-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete actual Release merge CI composition/);
});
