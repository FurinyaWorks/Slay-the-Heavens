import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,preReleaseItemTitleShadowSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {releaseItemTitleShadowSourcePacket,extendReleaseItemTitleShadowSource} from './helpers/release-item-title-shadow-source.mjs';
import {releaseItemTitleShadowCiPacket,releaseItemTitleShadowCiSource,releaseItemTitleShadowPriorInventory,assertReleaseItemTitleShadowRawInventory,assertReleaseItemTitleShadowCiCurrent} from './helpers/release-item-title-shadow-ci-source.mjs';
import {retirementPlanningReceipt,assertRetirementPlanningCurrent} from './helpers/release-item-title-shadow-planning.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');

test('retirement observed local floor authenticates its execution inputs and preserves every original cost',()=>{
 const p=assertRetirementPlanningCurrent(),prior=JSON.parse(releaseItemTitleShadowCiPacket.files['scripts/ci-test-timings.json'].before.source),current=JSON.parse(readFileSync('scripts/ci-test-timings.json','utf8'));
 delete current.jsPlanning.localLowerBounds[p.entry];assert.deepEqual(current,prior,'only the new observed lower bound is appended');
 assert.equal(p,retirementPlanningReceipt);
 for(const path of [p.entry,'tests/helpers/reward-pool-retirement-runtime.lua','tests/lua/support/game_ui_fixture.lua','src/lua/abyss_battle_reward_layout.lua','scripts/build-ui.mjs','data/presentation/ui_theme.json',p.closure.find(row=>row.path.endsWith('.png')).path,p.dependencies[0].path]){
  for(const change of ['append','missing'])assert.throws(()=>assertRetirementPlanningCurrent((file,encoding)=>{
   if(file===path){if(change==='missing')throw Error('missing retirement execution input');const b=readFileSync(file,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}
   return readFileSync(file,encoding);
  }),/fresh retirement|missing retirement/,'execution drift is rejected: '+path);
 }
 assertRetirementPlanningCurrent((path,encoding)=>{assert(!path.startsWith('backlog/'),'task metadata is outside execution authentication');return readFileSync(path,encoding);});
});

test('release item-title-shadow production preserves every complete prior target and freshly authenticates the committed source tree',()=>{
 const p=sourceEpoch.proof,prior=preReleaseItemTitleShadowSourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name);
 assert.deepEqual(p.targets.releaseItemTitleShadowPrior.files,prior.current);
 assert.equal(p.currentTreeCommitted,true);assert.equal(p.currentCommit,releaseItemTitleShadowSourcePacket.currentCommit);
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path);
 for(const [path,before]of Object.entries(releaseItemTitleShadowSourcePacket.before))assert.deepEqual(before,prior.current[path]);
 assert.throws(()=>extendReleaseItemTitleShadowSource(preReleaseItemTitleShadowSourceEpoch,{...releaseItemTitleShadowSourcePacket,current:{}}),/only the eight approved item-title-shadow owners advance/);
});

test('release item-title-shadow CI validates complete live bindings while unknown or changed bytes stay visible',()=>{
 assertReleaseItemTitleShadowCiCurrent();
 for(const [path,row]of Object.entries(releaseItemTitleShadowCiPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(releaseItemTitleShadowCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(releaseItemTitleShadowCiSource(path,foreign),foreign,path);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseItemTitleShadowCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseItemTitleShadowCiCurrent((p,encoding)=>{
   const raw=readFileSync(p,encoding);return p===path?typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]):raw;
  }),/fresh complete integration source/);
 }
 for(const path of Object.keys(releaseItemTitleShadowSourcePacket.current))assert.equal(releaseItemTitleShadowCiSource(path,sourceEpoch.proof.current[path].source),sourceEpoch.proof.current[path].source,'CI does not intercept production authorization');
});

test('release item-title-shadow raw JS and Lua inventories reject missing duplicate foreign and changed additions',()=>{
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,releaseItemTitleShadowCiPacket.currentInventory[kind]);
  assertReleaseItemTitleShadowRawInventory(paths,kind);
  assert.deepEqual(releaseItemTitleShadowPriorInventory(paths,kind),releaseItemTitleShadowCiPacket.priorInventory[kind]);
  const opaque=[`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`];
  assert.deepEqual(releaseItemTitleShadowPriorInventory(opaque,kind),opaque,'unrelated historical input stays opaque for its own validator');
  const noAdditions=paths.filter(path=>releaseItemTitleShadowCiPacket.priorInventory[kind].includes(path));
  assert.throws(()=>assertReleaseItemTitleShadowRawInventory(noAdditions,kind),/raw discovery inventory/,'deleting every release addition cannot pass raw Full validation');
  assert.throws(()=>assertReleaseItemTitleShadowRawInventory(opaque,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>releaseItemTitleShadowPriorInventory(bad,kind),/raw .* inventory/);
  for(const path of paths.filter(p=>!releaseItemTitleShadowCiPacket.priorInventory[kind].includes(p)))
   assert.throws(()=>releaseItemTitleShadowPriorInventory(paths,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh release item-title-shadow added inventory source/);
 }
});
