import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as actualSerializationReadFileSync,readdirSync} from 'node:fs';
import {serializationHistoricalRead,serializationCiRead,serializationCiPacket,serializationCiSource,serializationPriorInventory,assertSerializationCiCurrent,assertSerializationRawInventory} from './helpers/lua-serialization-ci-source.mjs';
const actualDiskReadFileSync=serializationHistoricalRead(actualSerializationReadFileSync);
import {releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent,assertReleaseBootstrapRawInventory} from './helpers/release-bootstrap-ci-source.mjs';
import {potionBootstrapCiPacket,potionBootstrapCiSource,potionBootstrapHistoricalRead,assertPotionBootstrapCiCurrent,assertPotionBootstrapRawInventory} from './helpers/potion-bootstrap-ci-source.mjs';
const rawReadFileSync=potionBootstrapHistoricalRead('potion',actualDiskReadFileSync);
const rawBootstrapReadFileSync=potionBootstrapHistoricalRead('bootstrap',actualDiskReadFileSync);
import {mobilePotionCiRead,mobilePotionPriorInventory,mobilePotionCiPacket,mobilePotionCiSource,assertMobilePotionCiCurrent,assertMobilePotionRawInventory} from './helpers/mobile-potion-ci-source.mjs';
import {createHash} from 'node:crypto';
import {discoverJs as actualSerializationDiscoverJs} from '../scripts/ci-shards.mjs';
const discoverJs=()=>serializationPriorInventory(actualSerializationDiscoverJs(),'js',actualSerializationReadFileSync);
const beforeSerializationLua=()=>serializationPriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualSerializationReadFileSync);
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
// Keep every original complete predecessor assertion; new raw after contracts follow.
const readFileSync=mobilePotionCiRead(rawReadFileSync);

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
 for(const path of ['.gitattributes','docs/legal/assets.json','tests/helpers/closeout-source-epoch.mjs','tests/helpers/run-hud-ci-source.mjs','tests/helpers/integrated-ci-source.mjs'])
  assert.throws(()=>assertIntegratedCurrent((p,e)=>{
   const value=actualSerializationReadFileSync(p,e);
   return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh complete integration source/);assert(error.message.includes(path),'the intended after owner must reject');return true;});
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
 const {sourceEpoch,preMobilePotionSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {mobilePotionSourcePacket:p,extendMobilePotionSource}=await import('./helpers/mobile-potion-source.mjs');
 const prior=preMobilePotionSourceEpoch.proof,current=sourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.mobilePotionPrior.files,prior.current);
 assert.equal(current.currentCommit,'551677b7966437e07a95fc3b08ef8747d48a1a10');
 assert.equal(current.currentTreeCommitted,true,'only the unchanged committed product corpus is claimed committed');
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(current.current).filter(path=>current.current[path]!==null).sort());
 for(const path of files)assert.equal(rawReadFileSync(path,'utf8').replaceAll('\r\n','\n'),current.current[path].source,path);
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
 for(const [path,row]of Object.entries(potionBootstrapCiPacket.files)){
  const source=actualDiskReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(potionBootstrapCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(potionBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(potionBootstrapCiSource(foreignPath,source),source);
  assert.equal(potionBootstrapCiSource(path,source,{sha256:'0'.repeat(64)}),source,'wrong predecessor stays visible');
  assert.throws(()=>assertPotionBootstrapCiCurrent((p,e)=>{
   const value=actualDiskReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path),'the exact raw current owner rejects');return true;});
  assert.throws(()=>assertPotionBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return actualDiskReadFileSync(p,e);}),/missing/);
 }
 for(const path of Object.keys(potionBootstrapCiPacket.immutableArchives))
  assert.throws(()=>assertPotionBootstrapCiCurrent((p,e)=>p===path?actualDiskReadFileSync(p).subarray(1):actualDiskReadFileSync(p,e)),/immutable.*predecessor/);
 const inventories={js:discoverJs(),lua:beforeSerializationLua()};
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
 const all={js:discoverJs(),lua:beforeSerializationLua()};
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
 for(const [path,row]of Object.entries(releaseBootstrapCiPacket.files)){
  const source=rawBootstrapReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(releaseBootstrapCiSource(path,source),row.before.source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(releaseBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseBootstrapCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{
   const value=rawBootstrapReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return rawBootstrapReadFileSync(p,e);}),/missing/);
  if(path.startsWith('.github/')){
   for(const input of [source,source.replaceAll('\n','\r\n')])assert.equal(releaseBootstrapWorkflowBefore(path,input),row.before.source);
   for(const foreign of [source+'\n',source.slice(1),source.replace('release/**','foreign/**')])
    assert.throws(()=>releaseBootstrapWorkflowBefore(path,foreign),/fresh complete Release bootstrap workflow/);
  }
 }
 const archive=Object.keys(releaseBootstrapCiPacket.immutableArchives)[0];
 assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>p===archive?rawBootstrapReadFileSync(p).subarray(1):rawBootstrapReadFileSync(p,e)),/immutable bootstrap predecessor/);
 const inventories={js:mobilePotionPriorInventory(discoverJs()),lua:beforeSerializationLua()};
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

test('serialization composition preserves f85 builders while the P0 Lua epoch remains independent',async()=>{
 assertSerializationCiCurrent(actualSerializationReadFileSync);
 const builders=['scripts/build-lua-data.mjs','scripts/build-original-v4.mjs','scripts/build-ui-theme.mjs','scripts/build-ui.mjs','scripts/lua-utf8-literal.mjs'];
 assert.deepEqual(Object.keys(serializationCiPacket.builderInputs).sort(),builders.sort());
 for(const path of builders){
  const row=serializationCiPacket.files[path];
  assert.equal(row.current.gitBlob,serializationCiPacket.builderInputs[path],'exact original f85 builder');
  assert.equal(hash(actualSerializationReadFileSync(path,'utf8').replaceAll('\r\n','\n')),row.current.sha256);
 }
 const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 assert.equal(sourceEpoch.proof.currentCommit,'551677b7966437e07a95fc3b08ef8747d48a1a10','unchanged P0 Lua epoch is separate from the builder checkpoint');
 for(const [path,row]of Object.entries(sourceEpoch.proof.current))if(row!==null)
  assert.equal(actualSerializationReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,'fresh inherited raw owner '+path);
 assert.notEqual(serializationCiPacket.currentCommit,sourceEpoch.proof.currentCommit);
});

test('serialization composition CI keeps the bootstrap packet and rejects missing drift and incomplete after bytes',async()=>{
 assertSerializationCiCurrent(actualSerializationReadFileSync);
 assert.equal(serializationCiPacket.currentTreeCommitted,false);
 assert.equal(serializationCiPacket.baseCommit,'f564aea6a3c517b71a85534a81be5e2e36278baf');
 assert.equal(hash(actualSerializationReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz')),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6');
 for(const [path,row]of Object.entries(serializationCiPacket.files)){
  const source=actualSerializationReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(serializationCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(serializationCiSource(path,foreign),foreign);
  for(const key of ['__proto__','constructor','foreign/'+path])assert.equal(serializationCiSource(key,source),source);
  assert.throws(()=>assertSerializationCiCurrent((p,e)=>{
   const value=actualSerializationReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertSerializationCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return actualSerializationReadFileSync(p,e);}),/missing/);
 }
 const bytes=actualSerializationReadFileSync('tests/helpers/lua-serialization-ci-source.json.gz');
 const leaf=actualSerializationReadFileSync('tests/helpers/lua-serialization-ci-source.mjs','utf8');
 const marker="const bytes=readFileSync(new URL('./lua-serialization-ci-source.json.gz',import.meta.url));";assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete serialization CI continuation/);
});

test('serialization composition raw JS and Lua inventory rejects missing duplicate foreign and source drift',()=>{
 const inventories={js:actualSerializationDiscoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertSerializationRawInventory(paths,kind);
  assert.deepEqual(serializationPriorInventory(paths,kind,actualSerializationReadFileSync),serializationCiPacket.priorInventory[kind]);
  const noAdded=paths.filter(p=>serializationCiPacket.priorInventory[kind].includes(p));
  if(noAdded.length===paths.length)assertSerializationRawInventory(noAdded,kind);
  else assert.throws(()=>assertSerializationRawInventory(noAdded,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertSerializationRawInventory(bad,kind),/raw discovery inventory/);
  for(const path of paths.filter(p=>!noAdded.includes(p)))assert.throws(()=>serializationPriorInventory(paths,kind,(p,e)=>{
   const value=actualSerializationReadFileSync(p,e);return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),/fresh serialization added inventory source/);
 }
});
