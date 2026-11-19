import {releasePotionEnemyRead,releasePotionEnemyInventory} from './helpers/release-potion-enemy-source.mjs';
import {enemyFastRead} from './helpers/release-enemy-fast-source.mjs';
import {sourceEpoch as jointProductionEpoch} from './helpers/closeout-source-epoch.mjs';
import {beforePreflightSource} from './helpers/fork-preflight-source.mjs';
import test from 'node:test';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {readFileSync as mergedReadFileSync,readdirSync} from 'node:fs';
import {potionPost697HistoricalRead,potionPost697PriorInventory} from './helpers/potion-post697-ci-source.mjs';
const actualPost697ReadFileSync=releasePotionEnemyRead('potion',mergedReadFileSync);
const actualPotionClickReadFileSync=potionPost697HistoricalRead('potion',actualPost697ReadFileSync);
import {potionClickHistoricalRead,potionClickCiSource,potionClickCiPacket,assertPotionClickCiCurrent,assertPotionClickRawInventory} from './helpers/potion-click-ci-source.mjs';
const actualPotionRegressionReadFileSync=potionClickHistoricalRead(actualPotionClickReadFileSync);
import {potionRegressionHistoricalRead,potionRegressionCiRead,potionRegressionCiPacket,potionRegressionCiSource,potionRegressionPriorInventory,assertPotionRegressionCiCurrent,assertPotionRegressionRawInventory} from './helpers/potion-regression-ci-source.mjs';
const actualDiskReadFileSync=potionRegressionHistoricalRead(actualPotionRegressionReadFileSync);
import {releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent,assertReleaseBootstrapRawInventory,
 capacityCiPacket,capacityReviewCiPacket,defaultReductionCiPacket,defaultReductionAudioCiPacket} from './helpers/release-bootstrap-ci-source.mjs';
import {potionBootstrapCiPacket,potionBootstrapCiSource,potionBootstrapHistoricalRead,assertPotionBootstrapCiCurrent,assertPotionBootstrapRawInventory} from './helpers/potion-bootstrap-ci-source.mjs';
const rawReadFileSync=potionBootstrapHistoricalRead('potion',actualDiskReadFileSync);
const historicalBootstrapRead=potionBootstrapHistoricalRead('bootstrap',actualDiskReadFileSync);
const currentCapacityRead=enemyFastRead('release',releasePotionEnemyRead('release',mergedReadFileSync));
const capacityOwnerPaths=new Set(Object.keys({...capacityCiPacket.files,...capacityReviewCiPacket.files,
 ...defaultReductionCiPacket.files,...defaultReductionCiPacket.addedFiles,...defaultReductionAudioCiPacket.files}));
const rawBootstrapReadFileSync=(path,encoding)=>capacityOwnerPaths.has(path)
 ?currentCapacityRead(path,encoding):historicalBootstrapRead(path,encoding);
import {mobilePotionCiRead,mobilePotionPriorInventory,mobilePotionCiPacket,mobilePotionCiSource,assertMobilePotionCiCurrent,assertMobilePotionRawInventory} from './helpers/mobile-potion-ci-source.mjs';
import {createHash} from 'node:crypto';
import {discoverJs as discoverMergedJs} from '../scripts/ci-shards.mjs';
const actualPost697DiscoverJs=()=>releasePotionEnemyInventory(discoverMergedJs(),potionPost697CiPacket.currentInventory.js,'js',mergedReadFileSync);
const actualPost697Lua=()=>releasePotionEnemyInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n),potionPost697CiPacket.currentInventory.lua,'lua',mergedReadFileSync);
const actualPotionRegressionDiscoverJs=()=>potionPost697PriorInventory(actualPost697DiscoverJs(),'js',actualPost697ReadFileSync);
const potionLegacyLua=()=>potionPost697PriorInventory(actualPost697Lua(),'lua',actualPost697ReadFileSync);
const discoverJs=()=>potionRegressionPriorInventory(actualPotionRegressionDiscoverJs(),'js',actualPotionRegressionReadFileSync);
const beforePotionRegressionLua=()=>potionRegressionPriorInventory(potionLegacyLua(),'lua',actualPotionRegressionReadFileSync);
import {integratedCiProof as proof,integratedCurrentInventory,integratedPriorInventory,integratedRead,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
// Keep every original complete predecessor assertion; new raw after contracts follow.
const readFileSync=mobilePotionCiRead(rawReadFileSync);
const newerReleaseOwners=[
 'src/lua/abyss_ui.lua',
 'src/lua/abyss_battle_action_bindings.lua',
 'src/lua/abyss_battle_card_bindings.lua',
 'src/lua/abyss_battle_card_gestures.lua',
 'src/lua/abyss_battle_card_view.lua',
 'src/lua/abyss_battle_details.lua',
 'src/lua/abyss_battle_enemy_view.lua',
 'src/lua/abyss_battle_input_state.lua',
 'src/lua/abyss_battle_intent_view.lua',
 'src/lua/abyss_battle_potion_bindings.lua',
 'src/lua/abyss_battle_render_actors.lua',
 'src/lua/abyss_battle_target_bindings.lua',
 'src/lua/abyss_battle_targeting.lua',
 'src/lua/abyss_battle_ui.lua',
 'src/lua/abyss_battle_unit_view.lua',
 'src/lua/abyss_card_flow.lua',
 'src/lua/abyss_lowcost_art.lua',
 'src/lua/abyss_monster_intent_particle_view.lua',
 'src/lua/abyss_node_ui_input.lua',
 'src/lua/abyss_shop_selection.lua',
];
function readLegacyPotionProduction(read,target='potionBeforeSelection'){
 const readSource=p=>mergedReadFileSync(p,'utf8');
 // Authenticate the later Release owners before constructing each historical fixture.
 const prior=new Map(newerReleaseOwners.map(path=>[path,
  jointProductionEpoch.preCombinedSource(path,readSource(path),{target,readSource})]));
 return path=>prior.has(path)?prior.get(path):read(path,'utf8');
}
function readHistoricalFixture(read){
 const inputs=new Map();
 return (path,encoding)=>{
  const key=`${encoding??''}\0${path}`;
  if(!inputs.has(key))inputs.set(key,read(path,encoding));
  return inputs.get(key);
 };
}

test('integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(mobilePotionPriorInventory(discoverJs(),'js',rawReadFileSync),proof.inventory);assert.equal(new Set(proof.inventory).size,proof.inventory.length);
 for(const [path,row]of Object.entries(proof.files))for(const target of Object.keys(proof.sources)){
  const source=raw(path),production=path.startsWith('src/')||path==='config/architecture.json';
  const expected=production?source:row.views[target]?.source??source;
  assert.equal(integratedSource(path,source,target),expected);
  if(!production&&row.views[target]){
   const crlf=source.replaceAll('\n','\r\n');
   assert.equal(integratedSource(path,crlf,target),row.views[target].sha256===row.current.sha256?crlf:expected);
  }
  for(const input of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(integratedSource(path,input,target),input);
  for(const foreign of ['__proto__','constructor','foreign/'+path])assert.equal(integratedSource(foreign,source,target),source);
 }
 for(const [path,layer,owner='']of [
  ['.gitattributes','integration'],
  ['docs/legal/assets.json','integration'],
  ['tests/helpers/closeout-source-epoch.mjs','post697'],
  ['tests/helpers/run-hud-ci-source.mjs','integration','potion Release '],
  ['tests/helpers/integrated-ci-source.mjs','post697'],
 ])
  assert.throws(()=>assertIntegratedCurrent((p,e)=>{
   const value=mergedReadFileSync(p,e);
   return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.equal(error.code,'ERR_ASSERTION');assert.equal(error.message.split('\n')[0],`fresh complete ${layer} source: ${owner}${path}`,'the intended first rejecting owner must match exactly');return true;});
 assert.equal(raw('tests/helpers/integrated-ci-binding.mjs'),renderIntegratedCiBinding(hash(readFileSync('tests/helpers/integrated-ci-source.json.gz'))));
 assert.equal(hash(readFileSync('tests/helpers/menu-red-before-integration-production-source.json.gz')),'ee888fd1686beaeffc2e439164619ecedee9ac00d2ca00a2711bd74c63e28cae');
});

test('integration copy closure requires its complete exact predecessor and current dependency bytes',()=>{
 const predecessor=Object.fromEntries(Object.entries(proof.closure).filter(([,row])=>row.before!==null).map(([p,row])=>[p,row.before]));
 predecessor['tests/helpers/retained.mjs']='a'.repeat(64);
 const result=extendIntegratedHelperClosure(predecessor);assert.equal(result['tests/helpers/retained.mjs'],predecessor['tests/helpers/retained.mjs']);
 for(const [path,row]of Object.entries(proof.closure)){
  assert.equal(result[path],row.after);
  assert.equal(hash(path.endsWith('.gz')?readFileSync(path):raw(path)),row.after);
  assert.throws(()=>extendIntegratedHelperClosure({...predecessor,[path]:'f'.repeat(64)}),/copy predecessor/);
 }
});

test('mobile potion production packet retains all old views and rejects partial or stale owner bindings',async()=>{
 const {prePotionRegressionSourceEpoch:sourceEpoch,preMobilePotionSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {mobilePotionSourcePacket:p,extendMobilePotionSource}=await import('./helpers/mobile-potion-source.mjs');
 const prior=preMobilePotionSourceEpoch.proof,current=sourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.mobilePotionPrior.files,prior.current);
 assert.equal(current.currentCommit,'551677b7966437e07a95fc3b08ef8747d48a1a10');
 assert.equal(current.currentTreeCommitted,true,'only the unchanged committed product corpus is claimed committed');
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(current.current).filter(path=>current.current[path]!==null).sort());
 const productionRead=readLegacyPotionProduction(rawReadFileSync,'potionRegressionPrior');
 for(const path of files)assert.equal(productionRead(path).replaceAll('\r\n','\n'),current.current[path].source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)}])
  assert.throws(()=>extendMobilePotionSource(preMobilePotionSourceEpoch,bad));
 const path=Object.keys(p.current)[0],source=current.current[path].source;
 for(const owner of Object.keys(p.current)){
  const read=p=>current.current[p]?.source??null;
  assert.equal(sourceEpoch.preCombinedSource(path,source,{target:'mobilePotionPrior',readSource:read}),prior.current[path].source);
  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'mobilePotionPrior',readSource:p=>p===owner?read(p)+'\n':read(p)}),/linked owner identity/);
  assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'mobilePotionPrior',readSource:p=>p===owner?null:read(p)}),/linked owner identity/);
 }
});

test('mobile potion CI bindings authenticate complete fresh after sources and unchanged archives',async()=>{
 assertMobilePotionCiCurrent(rawReadFileSync);
 assert.equal(mobilePotionCiPacket.currentTreeCommitted,false,'auxiliary after bindings have a separate uncommitted capture identity');
 for(const [path,row]of Object.entries(mobilePotionCiPacket.files)){
  const source=rawReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(mobilePotionCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(mobilePotionCiSource(path,foreign),foreign);
  assert.throws(()=>assertMobilePotionCiCurrent((p,e)=>{
   const value=rawReadFileSync(p,e);return p===path?typeof value==='string'?value.slice(1):value.subarray(1):value;
  }),/fresh complete integration source/);
  assert.throws(()=>assertMobilePotionCiCurrent((p,e)=>{if(p===path)throw Object.assign(Error('missing '+p),{code:'ENOENT'});return rawReadFileSync(p,e);}),/missing/);
 }
 const archive=Object.keys(mobilePotionCiPacket.immutableArchives)[0];
 assert.throws(()=>assertMobilePotionCiCurrent((p,e)=>p===archive?rawReadFileSync(p).subarray(1):rawReadFileSync(p,e)),/immutable.*predecessor/);
 const leaf=rawReadFileSync('tests/helpers/mobile-potion-ci-source.mjs','utf8');
 const bytes=rawReadFileSync('tests/helpers/mobile-potion-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./mobile-potion-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2,'one complete packet trust leaf');
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete mobile potion CI continuation/);
});

test('potion bootstrap combination authenticates raw union before either historical view and rejects fresh drift',async()=>{
 assertPotionBootstrapCiCurrent(actualDiskReadFileSync);
 assertReleaseBootstrapCiCurrent(rawBootstrapReadFileSync);
 assertMobilePotionCiCurrent(rawReadFileSync);
 const readFixture=readHistoricalFixture(actualDiskReadFileSync);
 for(const [path,row]of Object.entries(potionBootstrapCiPacket.files)){
  const source=readFixture(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(potionBootstrapCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(potionBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(potionBootstrapCiSource(foreignPath,source),source);
  assert.equal(potionBootstrapCiSource(path,source,{sha256:'0'.repeat(64)}),source,'wrong predecessor stays visible');
  assert.throws(()=>assertPotionBootstrapCiCurrent((p,e)=>{
   const value=readFixture(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path),'the exact raw current owner rejects');return true;});
  assert.throws(()=>assertPotionBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return readFixture(p,e);}),/missing/);
 }
 for(const path of Object.keys(potionBootstrapCiPacket.immutableArchives))
  assert.throws(()=>assertPotionBootstrapCiCurrent((p,e)=>p===path?readFixture(p).subarray(1):readFixture(p,e)),/immutable.*predecessor/);
 const inventories={js:discoverJs(),lua:beforePotionRegressionLua()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertPotionBootstrapRawInventory(paths,kind);
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertPotionBootstrapRawInventory(bad,kind),/raw discovery inventory/);
 }
 const leaf=actualDiskReadFileSync('tests/helpers/potion-bootstrap-ci-source.mjs','utf8'),bytes=actualDiskReadFileSync('tests/helpers/potion-bootstrap-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./potion-bootstrap-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete potion bootstrap CI continuation/);
});

test('mobile potion raw inventories retain every new test and reject missing duplicate foreign or changed additions',()=>{
 const all={js:discoverJs(),lua:beforePotionRegressionLua()};
 for(const [kind,paths]of Object.entries(all)){
  assertMobilePotionRawInventory(paths,kind);
  assert.deepEqual(mobilePotionPriorInventory(paths,kind),mobilePotionCiPacket.priorInventory[kind]);
  const before=paths.filter(p=>mobilePotionCiPacket.priorInventory[kind].includes(p));
  assert.throws(()=>assertMobilePotionRawInventory(before,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>mobilePotionPriorInventory(bad,kind),/raw .* inventory/);
  for(const path of paths.filter(p=>!before.includes(p))){
   for(const drift of ['\n','cut'])assert.throws(()=>mobilePotionPriorInventory(paths,kind,(p,e)=>{
    const value=rawReadFileSync(p,e);return p===path?drift==='cut'?value.slice(1):value+'\n':value;
   }),/fresh mobile potion added inventory source/);
  }
 }
});
test('Release bootstrap exact sources retain every old byte and reject missing drift and partial packets',async()=>{
 assertReleaseBootstrapCiCurrent(rawBootstrapReadFileSync);
 const readFixture=readHistoricalFixture(rawBootstrapReadFileSync);
 for(const [path,row]of Object.entries(releaseBootstrapCiPacket.files)){
  const source=readFixture(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(releaseBootstrapCiSource(path,source),row.before.source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(releaseBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseBootstrapCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{
   const value=readFixture(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return readFixture(p,e);}),/missing/);
  if(path.startsWith('.github/')){
   for(const input of [source,source.replaceAll('\n','\r\n')])assert.equal(releaseBootstrapWorkflowBefore(path,input),row.before.source);
   for(const foreign of [source+'\n',source.slice(1),source.replace('release/**','foreign/**')])
    assert.throws(()=>releaseBootstrapWorkflowBefore(path,foreign),/fresh complete Release bootstrap workflow/);
  }
 }
 const archive=Object.keys(releaseBootstrapCiPacket.immutableArchives)[0];
 assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>p===archive?readFixture(p).subarray(1):readFixture(p,e)),/immutable bootstrap predecessor/);
 const inventories={js:mobilePotionPriorInventory(discoverJs()),lua:beforePotionRegressionLua()};
 inventories.lua=mobilePotionPriorInventory(inventories.lua,'lua');
 for(const [kind,paths]of Object.entries(inventories)){
  assertReleaseBootstrapRawInventory(paths,kind);
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertReleaseBootstrapRawInventory(bad,kind),/raw discovery inventory/);
 }
 const leaf=rawBootstrapReadFileSync('tests/helpers/release-bootstrap-ci-source.mjs','utf8');
 const bytes=rawBootstrapReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-bootstrap-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete Release bootstrap CI continuation/);
});

test('potion regression composition production sources retain original owners and reject partial fresh authorizations',async()=>{
 const {prePotionClickSourceEpoch:sourceEpoch,prePotionRegressionSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {potionRegressionSourcePacket:p,extendPotionRegressionSource}=await import('./helpers/potion-regression-source.mjs');
 const prior=prePotionRegressionSourceEpoch.proof,current=sourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.potionRegressionPrior.files,prior.current);
 assert.equal(current.currentCommit,'567f259158e592491bd1fc44fb82ffb78c47789f');assert.equal(current.currentTreeCommitted,true);
 assert.equal(Object.keys(p.combinedProducers).length,3);
 const productionRead=readLegacyPotionProduction(actualPotionRegressionReadFileSync,'potionClickPrior');
 for(const [path,row]of Object.entries(p.inheritedSources))assert.equal(productionRead(path).replaceAll('\r\n','\n'),row.source,path);
 for(const [path,row]of Object.entries(p.current))assert.equal(productionRead(path).replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,prerequisites:[]},{...p,inheritedSources:{}},{...p,combinedProducers:{}}])
  assert.throws(()=>extendPotionRegressionSource(prePotionRegressionSourceEpoch,bad));
 const path=Object.keys(p.current)[0],source=p.current[path].source;
 const read=p=>{try{return productionRead(p);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
 for(const owner of [...Object.keys(p.current),...Object.keys(p.inheritedSources)]){
  assert.equal(sourceEpoch.preCombinedSource(path,source,{target:'potionRegressionPrior',readSource:read}),prior.current[path].source);
  for(const missing of [false,true])assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'potionRegressionPrior',readSource:p=>p===owner?missing?null:read(p)+'\n':read(p)}),/linked owner identity/);
 }
});

test('potion regression composition CI keeps the bootstrap packet and rejects missing drift and incomplete after bytes',async()=>{
 assertPotionRegressionCiCurrent(actualPotionRegressionReadFileSync);
 assert.equal(potionRegressionCiPacket.currentTreeCommitted,false);
 assert.equal(potionRegressionCiPacket.baseCommit,'f564aea6a3c517b71a85534a81be5e2e36278baf');
 assert.equal(hash(actualPotionRegressionReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz')),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6');
 for(const [path,row]of Object.entries(potionRegressionCiPacket.files)){
  const source=actualPotionRegressionReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(potionRegressionCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(potionRegressionCiSource(path,foreign),foreign);
  for(const key of ['__proto__','constructor','foreign/'+path])assert.equal(potionRegressionCiSource(key,source),source);
  assert.throws(()=>assertPotionRegressionCiCurrent((p,e)=>{
   const value=actualPotionRegressionReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertPotionRegressionCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return actualPotionRegressionReadFileSync(p,e);}),/missing/);
 }
 const bytes=actualPotionRegressionReadFileSync('tests/helpers/potion-regression-ci-source.json.gz');
 const leaf=actualPotionRegressionReadFileSync('tests/helpers/potion-regression-ci-source.mjs','utf8');
 const marker="const bytes=readFileSync(new URL('./potion-regression-ci-source.json.gz',import.meta.url));";assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete potion regression CI continuation/);
});

test('potion regression composition raw JS and Lua inventory rejects missing duplicate foreign and source drift',()=>{
 const inventories={js:actualPotionRegressionDiscoverJs(),lua:potionLegacyLua()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertPotionRegressionRawInventory(paths,kind);
  assert.deepEqual(potionRegressionPriorInventory(paths,kind,actualPotionRegressionReadFileSync),potionRegressionCiPacket.priorInventory[kind]);
  const noAdded=paths.filter(p=>potionRegressionCiPacket.priorInventory[kind].includes(p));
  if(noAdded.length===paths.length)assertPotionRegressionRawInventory(noAdded,kind);
  else assert.throws(()=>assertPotionRegressionRawInventory(noAdded,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertPotionRegressionRawInventory(bad,kind),/raw discovery inventory/);
  for(const path of paths.filter(p=>!noAdded.includes(p)))assert.throws(()=>potionRegressionPriorInventory(paths,kind,(p,e)=>{
   const value=actualPotionRegressionReadFileSync(p,e);return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),/fresh potion regression added inventory source/);
 }
});

test('legacy 3e potion click production closure authenticates new bytes and retains every complete predecessor',async()=>{
 const {prePotionPost697SourceEpoch:sourceEpoch,prePotionClickSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {potionClickSourcePacket:p,extendPotionClickSource}=await import('./helpers/potion-click-source.mjs');
 const prior=prePotionClickSourceEpoch.proof,current=sourceEpoch.proof;
 assert.equal(current.currentCommit,'c126877c31b37396b6148e1101a8dba555d03feb');assert.equal(current.currentTreeCommitted,true);
 assert.deepEqual(current.owners,prior.owners,'117 owners; no newly owned path');
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.potionClickPrior,{commit:p.baseCommit,files:prior.current});
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(current.current).filter(path=>current.current[path]!==null).sort());
 const productionRead=readLegacyPotionProduction(actualPotionClickReadFileSync);
 for(const path of files)assert.equal(productionRead(path).replaceAll('\r\n','\n'),current.current[path].source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,prerequisites:[]},{...p,inheritedSources:{}},{...p,combinedProducers:{}}])
  assert.throws(()=>extendPotionClickSource(prePotionClickSourceEpoch,bad));
 const path=Object.keys(p.current)[0],source=p.current[path].source;
 const read=path=>current.current[path]?.source??null; // Explicit immutable 3e projector domain; not live-current authorization.
 for(const owner of current.owners){
  assert.equal(sourceEpoch.preCombinedSource(path,source,{target:'potionClickPrior',readSource:read}),prior.current[path].source);
  for(const missing of [false,true])assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'potionClickPrior',readSource:p=>p===owner?missing?null:read(p)+'\n':read(p)}),/linked owner identity/);
 }
});

test('potion click CI authenticates new bytes and rejects drift missing packets and incomplete discovery',async()=>{
 assertPotionClickCiCurrent(actualPotionClickReadFileSync);
 const inventories={js:actualPotionRegressionDiscoverJs(),lua:potionLegacyLua()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertPotionClickRawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/foreign.${kind}`]])assert.throws(()=>assertPotionClickRawInventory(bad,kind),/raw discovery inventory/);
 }
 for(const [path,row]of Object.entries(potionClickCiPacket.files)){
  const source=actualPotionClickReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(potionClickCiSource(path,source),path.startsWith('src/')?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(potionClickCiSource(path,foreign),foreign);
  for(const key of ['__proto__','constructor','foreign/'+path])assert.equal(potionClickCiSource(key,source),source);
  assert.throws(()=>assertPotionClickCiCurrent((p,e)=>p===path?source+'\n':actualPotionClickReadFileSync(p,e)),error=>error.message.includes(path));
  assert.throws(()=>assertPotionClickCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return actualPotionClickReadFileSync(p,e);}),/missing/);
 }
 const archive=Object.keys(potionClickCiPacket.immutableArchives)[0];
 assert.throws(()=>assertPotionClickCiCurrent((p,e)=>p===archive?Buffer.from('foreign'):actualPotionClickReadFileSync(p,e)),/immutable click predecessor/);
 const bytes=actualPotionClickReadFileSync('tests/helpers/potion-click-ci-source.json.gz');
 const leaf=actualPotionClickReadFileSync('tests/helpers/potion-click-ci-source.mjs','utf8');
 const marker="const bytes=readFileSync(new URL('./potion-click-ci-source.json.gz',import.meta.url));";assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete potion click CI continuation/);
});

test('potion click historical entry authenticates complete current bindings before replay and after warm success',()=>{
 const path='src/lua/abyss_battle_ui.lua',expected=potionClickCiPacket.files[path].before.source;
 const other='tests/helpers/closeout-source-epoch.mjs';let fault;
 const read=(p,e)=>{
  if(p===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+p);
   if(fault.kind==='null')return null;
   const raw=actualPotionClickReadFileSync(p,e);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualPotionClickReadFileSync(p,e);
 };
 const historical=potionClickHistoricalRead(read);
 assert.equal(historical(path,'utf8'),expected);
 for(const missing of ['missing','null','drift']){
  fault={path:other,kind:missing};
  assert.throws(()=>historical(path,'utf8'),undefined,'complete current must authenticate other binding '+missing);
  fault=undefined;assert.equal(historical(path,'utf8'),expected);
 }
 const archive=Object.keys(potionClickCiPacket.immutableArchives)[0];
 for(const kind of ['missing','drift']){
  fault={path:archive,kind};assert.throws(()=>historical(path,'utf8'),undefined,'archive must authenticate before replay '+kind);
  fault=undefined;assert.equal(historical(path,'utf8'),expected);
 }
 const reads=[];const tracked=potionClickHistoricalRead((p,e)=>{reads.push(p);return actualPotionClickReadFileSync(p,e);});
 assert.equal(tracked(path,'utf8'),expected);
 for(const required of [...Object.keys(potionClickCiPacket.files),...Object.keys(potionClickCiPacket.immutableArchives)])assert(reads.includes(required),'fresh complete read '+required);
});

test('post697 union historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=potionPost697CiPacket.files[anchor].views.potion.source;
 const other='src/lua/abyss_game_ui_input.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualPost697ReadFileSync(path,encoding);
 };
 const reader=potionPost697CiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // The exact old implementation exposes the historical anchor without ever
 // consulting this independent missing owner. Keep this first as the RED.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(potionPost697CiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(potionPost697CiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualPost697ReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_game_ui_input.lua';fault={path:anchor,kind:'missing'};
 assert.equal(potionPost697CiRead((p,e)=>p===production?actualPost697ReadFileSync(p,e):read(p,e))(production,'utf8'),actualPost697ReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=potionPost697CiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=potionPost697CiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=potionPost697CiRead((p,e)=>{seen.push(p);return actualPost697ReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(potionPost697CiPacket.files),...Object.keys(potionPost697CiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('post697 union public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualPost697ReadFileSync(anchor,'utf8');
 const expected=potionPost697CiPacket.files[anchor].views.potion.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualPost697ReadFileSync(path,encoding);
 };
 const project=()=>potionPost697CiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(potionPost697CiPacket.files),...Object.keys(potionPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(potionPost697CiSource(anchor,value,undefined,noRead),value);
 assert.equal(potionPost697CiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_game_ui_input.lua',raw=actualPost697ReadFileSync(production,'utf8');
 assert.equal(potionPost697CiSource(production,raw,undefined,noRead),raw);
 assert.equal(potionPost697CiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('post697 union current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualPost697DiscoverJs(),lua:actualPost697Lua()};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualPost697ReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(potionPost697PriorInventory(paths,kind,read),potionPost697CiPacket.viewInventories.potion[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(potionPost697CiPacket.files),...Object.keys(potionPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>potionPost697PriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(potionPost697PriorInventory(inventories.js,'js',read),potionPost697CiPacket.viewInventories.potion.js);
  }
 }
 fault={path:'src/lua/abyss_game_ui_input.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(potionPost697PriorInventory(potionPost697CiPacket.viewInventories.potion[kind],kind,read),potionPost697CiPacket.viewInventories.potion[kind]);
});

test('post697 union integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/integrated-ci-source.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_game_ui_input.lua';
 const raw=actualPost697ReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualPost697ReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualPost697ReadFileSync(path,encoding);
 };
 assertPotionPost697CiCurrent(actualPost697ReadFileSync);
 const reader=integratedRead('menu',{read}),expected=reader(anchor,'utf8');assert.notEqual(expected,raw,'the test must actually expose an older view');
 for(const invoke of [()=>reader(anchor,'utf8'),()=>integratedSource(anchor,raw,'menu',read)]){
  assert.equal(invoke(),expected);
  for(const kind of ['missing','null','drift']){
   fault=kind;assert.throws(invoke,undefined,'the integrated boundary must use the injected raw owner '+kind);
   fault=undefined;assert.equal(invoke(),expected);
  }
 }
 assert(seen.includes(other),'current owner must be read through this invocation reader');
 const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
});

import {potionPost697CiRead,potionPost697CiPacket,potionPost697CiSource,assertPotionPost697CiCurrent,assertPotionPost697RawInventory} from './helpers/potion-post697-ci-source.mjs';

test('post697 union production retains both complete real inputs and authenticates every current owner',async()=>{
 const {potionPost697SourceEpoch:sourceEpoch,prePotionPost697SourceEpoch,releaseSelectionMapLegacyEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {potionPost697SourcePacket:p,extendPotionPost697Source}=await import('./helpers/potion-post697-source.mjs');
 const current=sourceEpoch.proof,prior=prePotionPost697SourceEpoch.proof,legacy=releaseSelectionMapLegacyEpoch.proof;
 assert.equal(current.currentCommit,'a9df9dff11779cb1d850dc97b715c711881cf9c6');assert.equal(current.currentTreeCommitted,true);
 assert.deepEqual(current.owners,prior.owners);assert.equal(current.owners.length,117);assert.equal(legacy.owners.length,116);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.selectionMapLanded,{commit:p.selectionCommit,files:legacy.current});
 assert.deepEqual(current.targets.potionBeforeSelection,{commit:p.baseCommit,files:prior.current});
 const productionRead=readLegacyPotionProduction(actualPost697ReadFileSync);
 for(const [path,row]of Object.entries(current.current))if(row!==null)assert.equal(productionRead(path).replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,inheritedPotion:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,inputs:[]}])assert.throws(()=>extendPotionPost697Source(prePotionPost697SourceEpoch,releaseSelectionMapLegacyEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=productionRead(path).replaceAll('\r\n','\n');return path===fault?.path?text+'\n':crlf?text.replaceAll('\n','\r\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'potionBeforeSelection',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'potionBeforeSelection',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'potionBeforeSelection',readSource:read}),expected);
  }
 }
});

test('post697 union both explicit histories reject warm cross-input faults and preserve unchanged before bytes',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_ui.lua';let fault;
 const read=(path,encoding)=>{if(path===other&&fault){if(fault==='missing')throw Error('missing '+path);if(fault==='null')return null;const b=actualPost697ReadFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return actualPost697ReadFileSync(path,encoding);};
 for(const target of ['potion','selection']){
  const reader=potionPost697HistoricalRead(target,read),expected=potionPost697CiPacket.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);
  for(const kind of ['missing','null','drift']){fault=kind;assert.throws(()=>reader(anchor,'utf8'));fault=undefined;assert.equal(reader(anchor,'utf8'),expected);}
  for(const [kind,paths]of Object.entries(potionPost697CiPacket.currentInventory))assert.deepEqual(potionPost697PriorInventory(paths,kind,read,target),potionPost697CiPacket.viewInventories[target][kind]);
  const untouched=Object.entries(potionPost697CiPacket.files).find(([,row])=>row.views[target]?.sha256===row.current.sha256);
  assert(untouched);const [path,row]=untouched,bytes=row.current.source.replaceAll('\n','\r\n'),seen=[];
  const same=potionPost697HistoricalRead(target,(p,e)=>{seen.push(p);assert.equal(p,path,'unchanged/already-before must not cause blanket authentication');return e?bytes:Buffer.from(bytes);});
  assert.equal(same(path,'utf8'),bytes);assert.deepEqual(seen,[path]);
 }
 const binary=Buffer.from([255,0,128]);assert.equal(potionPost697CiRead(()=>binary)('unknown/binary'),binary);
 for(const kind of ['js','lua']){
  const paths=potionPost697CiPacket.currentInventory[kind];assertPotionPost697RawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertPotionPost697RawInventory(bad,kind));
 }
});

test('public integrated binary history reauthenticates current owners and archives before returning old bytes',()=>{
 const anchor='tests/helpers/menu-red-production-source.json.gz', saved=proof.binaryViews[anchor].views.menu;
 const owners=['src/lua/abyss_battle_card_view.lua','src/lua/abyss_card_flow.lua',
  'tests/helpers/release-enemy-metrics-ci.json.gz',saved.path];
 let fault;
 const read=(path,encoding)=>{
  if(path!==fault?.path)return mergedReadFileSync(path,encoding);
  if(fault.kind==='missing')throw Error('missing '+path);
  if(fault.kind==='null')return null;
  const source=mergedReadFileSync(path,encoding);
  return typeof source==='string'?source+'\n':Buffer.concat([source,Buffer.from('\n')]);
 };
 const reader=integratedRead('menu',{read}), expected=read(saved.path);
 assert.notDeepEqual(expected,read(anchor),'the binary input must expose an earlier archive');
 assert.deepEqual(reader(anchor),expected);
 for(const path of owners)for(const kind of ['missing','null','drift']){
  fault={path,kind};assert.throws(()=>reader(anchor),undefined,path+' '+kind);
  fault=undefined;assert.deepEqual(reader(anchor),expected);
 }
});

test('PC22 inputs without an earlier menu view retain their exact live bytes',()=>{
 const reader=integratedRead('menu',{read:mergedReadFileSync});
 for(const path of ['tests/helpers/release-pc22-basic-feedback-source.mjs','tests/lua/card_flow_contact_continuity.lua']){
  const raw=mergedReadFileSync(path,'utf8');
  assert.equal(integratedSource(path,raw,'menu',mergedReadFileSync),raw);
  assert.equal(reader(path,'utf8'),raw);
  assert.deepEqual(reader(path),mergedReadFileSync(path));
 }
});

test('composite-intent text history checks the live Release owners before authorizing replay',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',raw=mergedReadFileSync(anchor,'utf8');
 const owners=['src/lua/abyss_game_ui_input.lua','src/lua/abyss_battle_card_bindings.lua',
  'src/lua/abyss_battle_render_actors.lua','src/lua/abyss_monster_intent_particle_view.lua','tests/helpers/release-composite-intent-ci.json.gz'];
 let fault;
 const read=(path,encoding)=>{
  if(path!==fault?.path)return mergedReadFileSync(path,encoding);
  if(fault.kind==='missing')throw Error('missing '+path);
  if(fault.kind==='null')return null;
  const bytes=mergedReadFileSync(path,encoding);
  return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
 };
 const reader=integratedRead('menu',{read}), expected=reader(anchor,'utf8');
 assert.notEqual(expected,raw,'the exact live CI input must expose a historical view');
 for(const invoke of [()=>integratedSource(anchor,raw,'menu',read),()=>reader(anchor,'utf8'),()=>reader(anchor)]){
  assert.equal(invoke().toString(),expected);
  for(const path of owners)for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(invoke,undefined,path+' '+kind);
   fault=undefined;assert.equal(invoke().toString(),expected);
  }
 }
 const production='src/lua/abyss_battle_render_actors.lua',unchanged=mergedReadFileSync(production,'utf8');
 const noRead=()=>{throw Error('unbound source should not authorize a historical view');};
 assert.equal(integratedSource('foreign/source',raw,'menu',noRead),raw);
 assert.equal(integratedSource(anchor,raw+'\n','menu',noRead),raw+'\n');
 assert.equal(integratedSource(production,unchanged,'menu',noRead),unchanged);
});

test('release Lua history authenticates the exact current raw inventory without changing discovery',()=>{
 const raw=readdirSync('tests/lua').filter(path=>path.endsWith('.lua')).map(path=>'tests/lua/'+path).sort();
 const expected=proof.inventories.menu.lua;
 assert.deepEqual(raw,integratedCurrentInventory('lua'));
 assert.notDeepEqual(raw,expected,'the exact current inventory must enter a distinct historical view');
 assert.deepEqual(integratedPriorInventory(raw,'menu','lua'),expected);
 const owners=['src/lua/abyss_game_ui_input.lua','tests/helpers/release-composite-intent-ci.json.gz'];
 for(const owner of owners)for(const fault of ['missing','null','drift']){
  const read=(path,encoding)=>{
   if(path!==owner)return mergedReadFileSync(path,encoding);
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=mergedReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  };
  assert.throws(()=>integratedPriorInventory(raw,'menu','lua',read),undefined,owner+' '+fault);
  assert.deepEqual(integratedPriorInventory(raw,'menu','lua'),expected);
 }
 const noRead=()=>{throw Error('historical inventory does not authorize a live projection');};
 assert.deepEqual(integratedPriorInventory(expected,'menu','lua',noRead),expected);
 assert.deepEqual(raw,integratedCurrentInventory('lua'));
});

test('historical potion production validates its current pointer owners before replay',()=>{
 const path='src/lua/abyss_battle_card_gestures.lua';
 const linked='src/lua/abyss_battle_target_bindings.lua';
 const raw=mergedReadFileSync(path,'utf8');
 const expected=jointProductionEpoch.proof.targets.releaseCardCancelNoticePrior.files[path].source;
 assert.notEqual(raw,expected);
 let drift=false;
 const read=(file,encoding)=>{
  const source=mergedReadFileSync(file,encoding);
  return drift&&file===linked?source+'\n':source;
 };
 const historical=releasePotionEnemyRead('potion',read);
 assert.equal(historical(path,'utf8'),expected);
 assert.equal(releasePotionEnemyRead('release',read)(path,'utf8'),raw);
 drift=true;
 assert.throws(()=>historical(path,'utf8'),/combined linked owner identity: src\/lua\/abyss_battle_target_bindings\.lua/);
 drift=false;
 assert.equal(historical(path,'utf8'),expected);
});


test('pointer history authenticates fresh linked owners before reading earlier public text',()=>{
 const path='tests/ci-complete-calibration.test.mjs';
 const owner='src/lua/abyss_battle_input_state.lua';
 const archive='tests/helpers/release-pointer-identity-ci.json.gz';
 const overlay='src/lua/abyss_battle_actions.lua';
 const overlayArchive='tests/helpers/release-pointer-overlay-ci.json.gz';
 const overlayProduction='tests/helpers/release-pointer-overlay-source.json.gz';
 const overlayFixture='tests/lua/support/target_anonymous_context.lua';
 const current=mergedReadFileSync(path,'utf8');
 let fault;
 const read=(file,encoding)=>{
  const source=mergedReadFileSync(file,encoding);
  if(file!==fault)return source;
  return typeof source==='string'?source+'\n':Buffer.concat([source,Buffer.from('\n')]);
 };
 const reader=integratedRead('native',{read});
 const prior=reader(path,'utf8');
 assert.notEqual(prior,current);
 for(const project of [()=>integratedSource(path,current,'native',read),()=>reader(path,'utf8')]){
  assert.equal(project(),prior);
  fault=owner;
  assert.throws(project,/fresh Release replay owner: src\/lua\/abyss_battle_input_state\.lua/);
  fault=archive;
  assert.throws(project,/fresh pointer identity CI continuation/);
  fault=overlay;
  assert.throws(project,/fresh Release replay owner: src\/lua\/abyss_battle_actions\.lua/);
  fault=overlayArchive;
  assert.throws(project,/fresh pointer overlay CI continuation/);
  fault=overlayProduction;
  assert.throws(project,/fresh immutable pointer overlay production archive/);
  fault=overlayFixture;
  assert.throws(project,/fresh complete integration source: pointer overlay tests\/lua\/support\/target_anonymous_context\.lua/);
  fault=undefined;
  assert.equal(project(),prior);
 }
});

test('composed pointer and BGM history requires BOTH live branches and the outer join',()=>{
 const anchors=['tests/ci-complete-calibration.test.mjs','tests/native-startup-contract.test.mjs'];
 const linked=[
  'src/lua/abyss_ui.lua','src/lua/abyss_battle_input_state.lua','src/lua/abyss_battle_actions.lua',
  ...['fatal-bgm','pointer-identity','pointer-overlay'].flatMap(name=>[
   `tests/helpers/release-${name}-source.json.gz`,`tests/helpers/release-${name}-ci.json.gz`]),
  'tests/helpers/release-pointer-bgm-ci.json.gz',
 ];
 let fault;
 const read=(path,encoding)=>{
  if(path!==fault?.path)return mergedReadFileSync(path,encoding);
  if(fault.kind==='missing')throw Error('missing '+path);
  if(fault.kind==='null')return null;
  const bytes=mergedReadFileSync(path,encoding);
  return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
 };
 const reader=integratedRead('native',{read});
 for(const path of anchors){
  const current=mergedReadFileSync(path,'utf8'),prior=reader(path,'utf8');
  assert.notEqual(prior,current,'real current source must actually project: '+path);
  for(const project of [()=>integratedSource(path,current,'native',read),()=>reader(path,'utf8'),()=>reader(path)]){
   assert.equal(project().toString(),prior);
   for(const owner of linked)for(const kind of ['missing','null','drift']){
    fault={path:owner,kind};assert.throws(project,undefined,owner+' '+kind);
    fault=undefined;assert.equal(project().toString(),prior);
   }
  }
  const noRead=()=>{throw Error('foreign bytes cannot authorize history');};
  assert.equal(integratedSource(path,current+'\n','native',noRead),current+'\n');
  assert.equal(integratedSource('foreign/path',current,'native',noRead),current);
 }
});

test('composed live CI leaves reject drift and new branch fixtures remain visible',()=>{
 const leaves=['tests/helpers/closeout-source-epoch.mjs','tests/helpers/copy-integration-source-closure.mjs',
  'tests/integrated-ci-source.cases.mjs','tests/release-card-contact-integration.test.mjs'];
 for(const leaf of leaves){
  const read=(path,encoding)=>{
   const bytes=mergedReadFileSync(path,encoding);
   if(path!==leaf)return bytes;
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  };
  assert.throws(()=>assertIntegratedCurrent(read),undefined,'live composed drift '+leaf);
  const current=mergedReadFileSync(leaf,'utf8'),noRead=()=>{throw Error('foreign bytes cannot authorize history');};
  assert.equal(integratedSource(leaf,current+'\n','native',noRead),current+'\n');
 }
 assertIntegratedCurrent(mergedReadFileSync);
 const reader=integratedRead('native',{read:mergedReadFileSync});
 for(const fixture of ['tests/lua/support/fatal_bgm_stop.lua','tests/lua/support/target_anonymous_context.lua',
  'tests/lua/support/potion_tap_anonymous_safety.lua']){
  const current=mergedReadFileSync(fixture,'utf8');
  assert.equal(integratedSource(fixture,current,'native',mergedReadFileSync),current);
  assert.equal(reader(fixture,'utf8'),current);
  assert.deepEqual(reader(fixture),mergedReadFileSync(fixture));
 }
});

test('first Full repair binds fresh production and CI leaves without accepting the published failed tree',()=>{
 const packet=JSON.parse(gunzipSync(mergedReadFileSync('tests/helpers/release-full-repair-ci.json.gz')));
 assert.equal(packet.base,'36b96baa93d07cb8a357cb793ea4e8806a5aca87');
 const anchor='tests/native-startup-contract.test.mjs';
 let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const before=packet.files[path]?.before;
   if(fault.kind==='prior')return encoding?before:Buffer.from(before);
   const bytes=mergedReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return mergedReadFileSync(path,encoding);
 };
 const reader=integratedRead('native',{read}),current=mergedReadFileSync(anchor,'utf8');
 const original=reader(anchor,'utf8');assert.notEqual(original,current);
 const project=()=>integratedSource(anchor,current,'native',read);
 const linked=[...Object.keys(packet.files),'tests/helpers/release-full-repair-ci.json.gz',
  'tests/helpers/release-full-repair-source.json.gz','src/lua/abyss_battle_action_bindings.lua','src/lua/abyss_battle_input_state.lua'];
 for(const path of linked)for(const kind of ['missing','null','drift',...(packet.files[path]?.before?['prior']:[])]){
  fault={path,kind};assert.throws(project,undefined,path+' '+kind);
  fault=undefined;assert.equal(project(),original);assert.equal(reader(anchor,'utf8'),original);
 }
 // Every repair-only leaf must authorize through the same live archive too,
 // not just an anchor already recognized by the older pointer/BGM layers.
 for(const leaf of Object.keys(packet.files)){
  const bytes=mergedReadFileSync(leaf,'utf8'),prior=integratedSource(leaf,bytes,'native',read);
  if(prior===bytes)continue; // Newly introduced fixtures stay current, never replayed.
  fault={path:'tests/helpers/release-full-repair-ci.json.gz',kind:'drift'};
  assert.throws(()=>integratedSource(leaf,bytes,'native',read),undefined,leaf+' fresh repair-only archive');
  assert.throws(()=>reader(leaf),undefined,leaf+' binary repair-only archive');
  fault=undefined;assert.equal(integratedSource(leaf,bytes,'native',read),prior);
 }
 assertIntegratedCurrent(read);
});

test('Full follow-up binds cancellation recovery and exact outer rejection checks to fresh live sources',()=>{
 const packet=JSON.parse(gunzipSync(mergedReadFileSync('tests/helpers/release-full-followup-ci.json.gz')));
 assert.equal(packet.base,'4dd97d67883202496f7cb587002ed00f429ef699');
 const anchor='tests/native-startup-contract.test.mjs';
 let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const before=packet.files[path]?.before;
   if(fault.kind==='prior')return encoding?before:Buffer.from(before);
   const bytes=mergedReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return mergedReadFileSync(path,encoding);
 };
 const reader=integratedRead('native',{read}),current=mergedReadFileSync(anchor,'utf8');
 const original=reader(anchor,'utf8');assert.notEqual(original,current);
 const project=()=>integratedSource(anchor,current,'native',read);
 const linked=[...Object.keys(packet.files),'tests/helpers/release-full-followup-ci.json.gz',
  'tests/helpers/release-full-followup-source.json.gz','src/lua/abyss_battle_actions.lua'];
 for(const path of linked)for(const kind of ['missing','null','drift',...(packet.files[path]?.before?['prior']:[])]){
  fault={path,kind};assert.throws(project,undefined,path+' '+kind);
  fault=undefined;assert.equal(project(),original);assert.equal(reader(anchor,'utf8'),original);
 }
 // Every follow-up leaf must authorize through the same live archive too,
 // not just an anchor already recognized by the older pointer/BGM layers.
 for(const leaf of Object.keys(packet.files)){
  const bytes=mergedReadFileSync(leaf,'utf8'),prior=integratedSource(leaf,bytes,'native',read);
  if(prior===bytes)continue; // Newly introduced fixtures stay current, never replayed.
  fault={path:'tests/helpers/release-full-followup-ci.json.gz',kind:'drift'};
  assert.throws(()=>integratedSource(leaf,bytes,'native',read),undefined,leaf+' fresh follow-up archive');
  assert.throws(()=>reader(leaf),undefined,leaf+' binary follow-up archive');
  fault=undefined;assert.equal(integratedSource(leaf,bytes,'native',read),prior);
 }
 assertIntegratedCurrent(read);
});

test('historical input pairing requires fresh executable leaves and rejects the previous unpaired helper',()=>{
 const packet=JSON.parse(gunzipSync(mergedReadFileSync('tests/helpers/release-historical-input-ci.json.gz')));
 assert.equal(packet.base,'676508d246b6033d543fd8515b881cba27ad41b6');
 const anchor='tests/native-startup-contract.test.mjs';
 let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const before=packet.files[path]?.before;
   if(fault.kind==='prior')return encoding?before:Buffer.from(before);
   const bytes=mergedReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return mergedReadFileSync(path,encoding);
 };
 const reader=integratedRead('native',{read}),current=mergedReadFileSync(anchor,'utf8');
 const original=reader(anchor,'utf8');assert.notEqual(original,current);
 const project=()=>integratedSource(anchor,current,'native',read);
 const linked=[...Object.keys(packet.files),'tests/helpers/release-historical-input-ci.json.gz',
  'tests/helpers/release-full-followup-source.json.gz','src/lua/abyss_battle_actions.lua'];
 for(const path of linked)for(const kind of ['missing','null','drift',...(packet.files[path]?.before?['prior']:[])]){
  fault={path,kind};assert.throws(project,undefined,path+' '+kind);
  fault=undefined;assert.equal(project(),original);assert.equal(reader(anchor,'utf8'),original);
 }
 // Every historical input leaf must authorize through the same live archive too,
 // not just an anchor already recognized by the older pointer/BGM layers.
 for(const leaf of Object.keys(packet.files)){
  const bytes=mergedReadFileSync(leaf,'utf8'),prior=integratedSource(leaf,bytes,'native',read);
  if(prior===bytes)continue; // Newly introduced fixtures stay current, never replayed.
  fault={path:'tests/helpers/release-historical-input-ci.json.gz',kind:'drift'};
  assert.throws(()=>integratedSource(leaf,bytes,'native',read),undefined,leaf+' fresh historical input archive');
  assert.throws(()=>reader(leaf),undefined,leaf+' binary historical input archive');
  fault=undefined;assert.equal(integratedSource(leaf,bytes,'native',read),prior);
 }
 assertIntegratedCurrent(read);
});

// No-op projections must not turn a Windows checkout into archived LF bytes.
// Keep the raw input and buffer identity only after the exact boundary accepts it.
import {integrationCiSource,integrationRead} from './helpers/release-card-contact-integration.mjs';
import {releaseSelectionMapCiPacket as pc22NoopSelection} from './helpers/release-selection-map-ci-source.mjs';

test('PC22 authenticated no-op preserves raw LF CRLF text and Buffer identities',()=>{
 for(const path of ['tests/helpers/release-pc22-basic-feedback-source.mjs','tests/lua/card_flow_contact_continuity.lua']){
  const lf=mergedReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  for(const source of [lf,lf.replaceAll('\n','\r\n')]){
   const bytes=Buffer.from(source),read=(p,e)=>p===path?(e?source:bytes):mergedReadFileSync(p,e);
   assert.equal(integrationCiSource(path,source,'pc22',read),source,'authenticated no-op boundary');
   assert.equal(integrationCiSource(path,bytes,'pc22',read),bytes,'non-text direct input stays raw');
   assert.equal(integratedSource(path,source,'menu',read),source,'public direct input');
   assert.equal(integratedSource(path,bytes,'menu',read),bytes,'public direct Buffer input');
   for(const reader of [integrationRead('pc22',read),integratedRead('menu',{read})]){
    assert.equal(reader(path,'utf8'),source,'text read keeps exact EOL');
    assert.equal(reader(path),bytes,'unchanged Buffer keeps original object');
   }
  }
 }
});

test('PC22 real historical projections and foreign-byte rejection remain exact',()=>{
 const path='scripts/noncombat-v25-layout.mjs',lf=mergedReadFileSync(path,'utf8').replaceAll('\r\n','\n');
 const prior=pc22NoopSelection.files[path].before.source,menu=proof.files[path].views.menu.source;
 assert.notEqual(lf,prior);assert.notEqual(lf,menu);
 for(const source of [lf,lf.replaceAll('\n','\r\n')]){
  const bytes=Buffer.from(source),read=(p,e)=>p===path?(e?source:bytes):mergedReadFileSync(p,e);
  assert.equal(integrationCiSource(path,source,'pc22',read),prior);
  assert.equal(integratedSource(path,source,'menu',read),menu);
  for(const [reader,expected]of [[integrationRead('pc22',read),prior],[integratedRead('menu',{read}),menu]]){
   assert.equal(reader(path,'utf8'),expected);
   assert.deepEqual(reader(path),Buffer.from(expected));
   assert.notEqual(reader(path),bytes,'a genuine projection cannot retain the live Buffer');
  }
 }
 for(const anchor of [path,'tests/helpers/release-pc22-basic-feedback-source.mjs','tests/lua/card_flow_contact_continuity.lua']){
  const source=mergedReadFileSync(anchor,'utf8').replaceAll('\r\n','\n');
  for(const foreign of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n')]){
   const bytes=Buffer.from(foreign),read=(p,e)=>p===anchor?(e?foreign:bytes):mergedReadFileSync(p,e);
   assert.equal(integrationCiSource(anchor,foreign,'pc22',read),foreign);
   assert.equal(integratedSource(anchor,foreign,'menu',read),foreign);
   for(const reader of [integrationRead('pc22',read),integratedRead('menu',{read})]){
    assert.equal(reader(anchor,'utf8'),foreign);assert.equal(reader(anchor),bytes);
   }
  }
 }
 const noRead=()=>{throw Error('foreign paths must not authenticate linked inputs');};
 for(const foreignPath of ['__proto__','constructor','foreign/'+path]){
  assert.equal(integrationCiSource(foreignPath,lf,'pc22',noRead),lf);
  assert.equal(integratedSource(foreignPath,lf,'menu',noRead),lf);
 }
 const binary=Buffer.from([255,0,128]);
 assert.equal(integrationRead('pc22',()=>binary)('unknown/binary'),binary);
 assert.equal(integratedRead('menu',{read:()=>binary})('unknown/binary'),binary);
});

test('PC22 no-op repair keeps complete live source and archive drift rejection',()=>{
 const archive='tests/helpers/release-pc22-noop-ci.json.gz';
 const packet=JSON.parse(gunzipSync(mergedReadFileSync(archive)));
 assert.equal(packet.base,'6d267ca80abd80efb334f8f7581111166174de2d');
 assert.deepEqual(Object.keys(packet.files),['tests/helpers/release-card-contact-integration.mjs','tests/integrated-ci-source.cases.mjs']);
 const anchor='tests/native-startup-contract.test.mjs',source=mergedReadFileSync(anchor,'utf8');let fault;
 const read=(path,encoding)=>{
  if(path!==fault?.path)return mergedReadFileSync(path,encoding);
  if(fault.kind==='missing')throw Error('missing '+path);
  if(fault.kind==='null')return null;
  if(fault.kind==='prior')return encoding?packet.files[path].before:Buffer.from(packet.files[path].before);
  const raw=mergedReadFileSync(path,encoding);
  return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
 };
 const reader=integratedRead('menu',{read}),expected=reader(anchor,'utf8');
 assert.notEqual(expected,source,'existing genuine replay must authenticate the repair too');
 assertIntegratedCurrent(read);
 for(const path of [...Object.keys(packet.files),archive])for(const kind of ['drift','missing','null',...(packet.files[path]?['prior']:[])]){
  fault={path,kind};
  assert.throws(()=>integratedSource(anchor,source,'menu',read),undefined,path+' '+kind+' direct');
  assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind+' text');
  assert.throws(()=>reader(anchor),undefined,path+' '+kind+' Buffer');
  fault=undefined;assert.equal(reader(anchor,'utf8'),expected,'restoration must reauthenticate');
 }
 for(const path of Object.keys(packet.files)){
  const live=mergedReadFileSync(path,'utf8'),prior=reader(path,'utf8');
  assert.notEqual(prior,live,'each changed CI leaf retains its exact predecessor');
  fault={path:archive,kind:'drift'};
  assert.throws(()=>integratedSource(path,live,'menu',read));
  assert.throws(()=>reader(path,'utf8'));assert.throws(()=>reader(path));
  fault=undefined;assert.equal(reader(path,'utf8'),prior);
 }
});

test('Full CI convergence freshly authenticates both independent continuations',async()=>{
 const {assertReleasePotionEnemyCurrent}=await import('./helpers/release-potion-enemy-source.mjs');
 const archive='tests/helpers/release-full-converge-ci.json.gz';
 const packet=JSON.parse(gunzipSync(mergedReadFileSync(archive)));
 const casePath='tests/integrated-ci-source.cases.mjs';
 const check=message=>error=>error instanceof assert.AssertionError&&
  error.code==='ERR_ASSERTION'&&error.message.split('\n')[0]===message;
 let fault;
 const read=(path,encoding)=>fault?.path===path?fault.value:mergedReadFileSync(path,encoding);
 assertReleasePotionEnemyCurrent(read);
 const live=mergedReadFileSync(casePath,'utf8');
 fault={path:casePath,value:live.replaceAll('\r\n','\n').replaceAll('\n','\r\n')};
 assertReleasePotionEnemyCurrent(read);
 for(const foreign of [packet.sources.history.text,packet.sources.pc22.text,live+'\n',null]){
  fault={path:casePath,value:foreign};
  assert.throws(()=>assertReleasePotionEnemyCurrent(read),check('fresh Release Full CI convergence source: '+casePath));
 }
 fault=undefined;assertReleasePotionEnemyCurrent(read);
 // Check the actual fresh reads, not just values rejected on the first read.
 // Each exact standalone parent would otherwise satisfy its own old validator.
 const historyPack=JSON.parse(gunzipSync(mergedReadFileSync('tests/helpers/release-historical-input-ci.json.gz')));
 let last=0;
 assertReleasePotionEnemyCurrent((path,encoding)=>{
  if(path===casePath&&encoding==='utf8')last++;
  return mergedReadFileSync(path,encoding);
 });
 assert(last>=4,'shared source flows into the follow-up validator after both parents');
 const rereads=[['history',2,packet.sources.history.text],['pc22',3,packet.sources.pc22.text]];
 for(let at=4;at<=last;at++)rereads.push(['older layer',at,historyPack.files[casePath].before]);
 for(const [side,at,replacement]of rereads){
  let seen=0,enabled=true;
  const changing=(path,encoding)=>{
   if(path===casePath&&encoding==='utf8'&&++seen===at&&enabled)return replacement;
   return mergedReadFileSync(path,encoding);
  };
  assert.throws(()=>assertReleasePotionEnemyCurrent(changing),check('fresh Release Full CI convergence source: '+casePath));
  assert.equal(seen,at,'exact '+side+' reread failed closed');
  seen=0;enabled=false;assertReleasePotionEnemyCurrent(changing);
 }
 for(const [path,message]of [
  ['tests/helpers/release-historical-input-ci.json.gz','fresh historical input CI archive'],
  ['tests/helpers/release-pc22-noop-ci.json.gz','fresh PC22 no-op CI archive'],
  [archive,'fresh Release Full CI convergence archive'],
 ]){
  fault={path,value:Buffer.concat([mergedReadFileSync(path),Buffer.from('drift')])};
  assert.throws(()=>assertReleasePotionEnemyCurrent(read),check(message));
  const missing=(file,encoding)=>{if(file===path)throw Error('missing '+path);return mergedReadFileSync(file,encoding);};
  assert.throws(()=>assertReleasePotionEnemyCurrent(missing),error=>error.message==='missing '+path);
  fault=undefined;assertReleasePotionEnemyCurrent(read);
 }
});
