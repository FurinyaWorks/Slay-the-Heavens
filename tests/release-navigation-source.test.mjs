import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
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
 assertReleaseNavigationCiCurrent();
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
  assert.deepEqual(releaseNavigationPriorInventory(paths,kind),releaseNavigationCiPacket.priorInventory[kind]);
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
