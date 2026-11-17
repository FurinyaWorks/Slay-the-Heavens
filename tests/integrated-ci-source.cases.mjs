import {handEnemyHistoricalRead,handEnemyPriorInventory,handEnemyCiPacket} from './helpers/hand-enemy-ci-source.mjs';
const actualHandPost697ReadFileSync=handTestRead;
const actualHandPost697DiscoverJs=()=>[...handEnemyCiPacket.viewInventories.hand.js];
const handEnemyLegacyLua=()=>[...handEnemyCiPacket.viewInventories.hand.lua];
import test,{beforeEach} from 'node:test';
import {prepareHandEnemyTestDomain,handTestRead} from './helpers/hand-enemy-test-domains.mjs';
beforeEach(()=>prepareHandEnemyTestDomain('hand'));
import assert from 'node:assert/strict';
import {readFileSync as unionActualReadFileSync,readdirSync} from 'node:fs';
import {handPost697HistoricalRead,handPost697PriorInventory} from './helpers/hand-post697-ci-source.mjs';
const rawReadFileSync=handPost697HistoricalRead('release',actualHandPost697ReadFileSync);
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent as priorBootstrapCurrent,assertReleaseBootstrapRawInventory} from './helpers/hand-enemy-bootstrap-ci-source.mjs';
import {releaseSelectionMapCiRead,releaseSelectionMapPriorInventory} from './helpers/hand-enemy-selection-ci-source.mjs';
const actualHandReadFileSync=handPost697HistoricalRead('hand',actualHandPost697ReadFileSync);
import {mobileHandCiRead,mobileHandCiPacket,mobileHandCiSource as priorMobileHandCiSource,mobileHandPriorInventory,assertMobileHandCiCurrent as priorAssertMobileHandCiCurrent,assertMobileHandRawInventory} from './helpers/mobile-hand-ci-source.mjs';
const mobileHandCiSource=(path,source,before,read=actualHandReadFileSync)=>priorMobileHandCiSource(path,source,before,read);
const assertMobileHandCiCurrent=(read=actualHandReadFileSync)=>priorAssertMobileHandCiCurrent(read);
import {createHash} from 'node:crypto';
import {discoverJs as unionActualDiscoverJs} from '../scripts/ci-shards.mjs';
const actualHandDiscoverJs=()=>handPost697PriorInventory(actualHandPost697DiscoverJs(),'js',actualHandPost697ReadFileSync,'hand');
const handLegacyLua=()=>handPost697PriorInventory(handEnemyLegacyLua(),'lua',actualHandPost697ReadFileSync,'hand');
const releaseLegacyLua=()=>handPost697PriorInventory(handEnemyLegacyLua(),'lua',actualHandPost697ReadFileSync);
const discoverJs=()=>handPost697PriorInventory(actualHandPost697DiscoverJs(),'js',actualHandPost697ReadFileSync);
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/hand-enemy-hand-integrated.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const pickerBeforeRead=releaseSelectionMapCiRead(rawReadFileSync);
const assertReleaseBootstrapCiCurrent=(read=pickerBeforeRead)=>priorBootstrapCurrent(read);
const readFileSync=releaseBootstrapCiRead(pickerBeforeRead);

test('integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(releaseSelectionMapPriorInventory(discoverJs(),'js',rawReadFileSync),proof.inventory);assert.equal(new Set(proof.inventory).size,proof.inventory.length);
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
   const value=actualHandPost697ReadFileSync(p,e);
   return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh complete (?:integration|hand post697) source/);assert(error.message.includes(path),'reject the intended current owner');return true;});
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

test('Release bootstrap exact sources retain every old byte and reject missing drift and partial packets',async()=>{
 assertReleaseBootstrapCiCurrent(pickerBeforeRead);
 for(const [path,row]of Object.entries(releaseBootstrapCiPacket.files)){
  const source=pickerBeforeRead(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(releaseBootstrapCiSource(path,source),row.before.source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(releaseBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseBootstrapCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{
   const value=pickerBeforeRead(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return pickerBeforeRead(p,e);}),/missing/);
  if(path.startsWith('.github/')){
   for(const input of [source,source.replaceAll('\n','\r\n')])assert.equal(releaseBootstrapWorkflowBefore(path,input),row.before.source);
   for(const foreign of [source+'\n',source.slice(1),source.replace('release/**','foreign/**')])
    assert.throws(()=>releaseBootstrapWorkflowBefore(path,foreign),/fresh complete Release bootstrap workflow/);
  }
 }
 const archive=Object.keys(releaseBootstrapCiPacket.immutableArchives)[0];
 assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>p===archive?pickerBeforeRead(p).subarray(1):pickerBeforeRead(p,e)),/immutable bootstrap predecessor/);
 const inventories={js:releaseSelectionMapPriorInventory(discoverJs(),'js',rawReadFileSync),lua:releaseLegacyLua()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertReleaseBootstrapRawInventory(paths,kind);
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertReleaseBootstrapRawInventory(bad,kind),/raw discovery inventory/);
 }
 const leaf=pickerBeforeRead('tests/helpers/release-bootstrap-ci-source.mjs','utf8');
 const bytes=pickerBeforeRead('tests/helpers/release-bootstrap-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-bootstrap-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete Release bootstrap CI continuation/);
});

test('hand composition production sources retain original owners and reject partial fresh authorizations',async()=>{
 const {handBeforeMapSourceEpoch:sourceEpoch,preMobileHandSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {mobileHandSourcePacket:p,extendMobileHandSource}=await import('./helpers/mobile-hand-source.mjs');
 const prior=preMobileHandSourceEpoch.proof,current=sourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.mobileHandPrior.files,prior.current);
 assert.equal(current.currentCommit,'f5169260880043c0fbf5d51ad869e1b493cea85d');assert.equal(current.currentTreeCommitted,true);
 for(const [path,row]of Object.entries(p.current))assert.equal(actualHandReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,prerequisites:[]}])
  assert.throws(()=>extendMobileHandSource(preMobileHandSourceEpoch,bad));
 const path=Object.keys(p.current)[0],source=p.current[path].source;
 const read=p=>{try{return actualHandReadFileSync(p,'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}};
 for(const owner of Object.keys(p.current)){
  assert.equal(sourceEpoch.preCombinedSource(path,source,{target:'mobileHandPrior',readSource:read}),prior.current[path].source);
  for(const missing of [false,true])assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'mobileHandPrior',readSource:p=>p===owner?missing?null:read(p)+'\n':read(p)}),/linked owner identity/);
 }
});

test('hand composition CI keeps the bootstrap packet and rejects missing drift and incomplete after bytes',async()=>{
 assertMobileHandCiCurrent(actualHandReadFileSync);
 assert.equal(mobileHandCiPacket.currentTreeCommitted,false);
 assert.equal(mobileHandCiPacket.baseCommit,'b67226945c2be47c8fff31f1362412b973f68875');
 assert.equal(hash(actualHandReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz')),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6');
 for(const [path,row]of Object.entries(mobileHandCiPacket.files)){
  const source=actualHandReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(mobileHandCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(mobileHandCiSource(path,foreign),foreign);
  for(const key of ['__proto__','constructor','foreign/'+path])assert.equal(mobileHandCiSource(key,source),source);
  assert.throws(()=>assertMobileHandCiCurrent((p,e)=>{
   const value=actualHandReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertMobileHandCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return actualHandReadFileSync(p,e);}),/missing/);
 }
 const bytes=actualHandReadFileSync('tests/helpers/mobile-hand-ci-source.json.gz');
 const leaf=actualHandReadFileSync('tests/helpers/mobile-hand-ci-source.mjs','utf8');
 const marker="const bytes=readFileSync(new URL('./mobile-hand-ci-source.json.gz',import.meta.url));";assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete mobile hand CI continuation/);
});

test('hand composition raw JS and Lua inventory rejects missing duplicate foreign and source drift',()=>{
 const inventories={js:actualHandDiscoverJs(),lua:handLegacyLua()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertMobileHandRawInventory(paths,kind);
  assert.deepEqual(mobileHandPriorInventory(paths,kind,actualHandReadFileSync),mobileHandCiPacket.priorInventory[kind]);
  const noAdded=paths.filter(p=>mobileHandCiPacket.priorInventory[kind].includes(p));
  assert.throws(()=>assertMobileHandRawInventory(noAdded,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>mobileHandPriorInventory(bad,kind,actualHandReadFileSync),/raw .* inventory/);
  for(const path of paths.filter(p=>!noAdded.includes(p)))assert.throws(()=>mobileHandPriorInventory(paths,kind,(p,e)=>{
   const value=actualHandReadFileSync(p,e);return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh (?:mobile hand added inventory source|complete integration source: mobile hand)/);assert(error.message.includes(path),'reject the intended added source');return true;});
 }
});

test('mobile hand historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=mobileHandCiPacket.files[anchor].before.source;
 const other='src/lua/abyss_battle_card_view.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualHandReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualHandReadFileSync(path,encoding);
 };
 const reader=mobileHandCiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // The exact old implementation exposes the historical anchor without ever
 // consulting this independent missing owner. Keep this first as the RED.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(mobileHandCiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(mobileHandCiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualHandReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_battle_card_view.lua';fault={path:anchor,kind:'missing'};
 assert.equal(mobileHandCiRead((p,e)=>p===production?actualHandReadFileSync(p,e):read(p,e))(production,'utf8'),actualHandReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=mobileHandCiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=mobileHandCiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=mobileHandCiRead((p,e)=>{seen.push(p);return actualHandReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(mobileHandCiPacket.files),...Object.keys(mobileHandCiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('mobile hand public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualHandReadFileSync(anchor,'utf8');
 const expected=mobileHandCiPacket.files[anchor].before.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualHandReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualHandReadFileSync(path,encoding);
 };
 const project=()=>mobileHandCiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(mobileHandCiPacket.files),...Object.keys(mobileHandCiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(mobileHandCiSource(anchor,value,undefined,noRead),value);
 assert.equal(mobileHandCiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_battle_card_view.lua',raw=actualHandReadFileSync(production,'utf8');
 assert.equal(mobileHandCiSource(production,raw,undefined,noRead),raw);
 assert.equal(mobileHandCiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('mobile hand current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualHandDiscoverJs(),lua:handLegacyLua()};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualHandReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualHandReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(mobileHandPriorInventory(paths,kind,read),mobileHandCiPacket.priorInventory[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(mobileHandCiPacket.files),...Object.keys(mobileHandCiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>mobileHandPriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(mobileHandPriorInventory(inventories.js,'js',read),mobileHandCiPacket.priorInventory.js);
  }
 }
 fault={path:'src/lua/abyss_battle_card_view.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(mobileHandPriorInventory(mobileHandCiPacket.priorInventory[kind],kind,read),mobileHandCiPacket.priorInventory[kind]);
});

test('mobile hand integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/hand-enemy-hand-integrated.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_card_view.lua';
 const raw=actualHandReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualHandReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualHandReadFileSync(path,encoding);
 };
 assertMobileHandCiCurrent(actualHandReadFileSync);
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

test('hand post697 union historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=handPost697CiPacket.files[anchor].views.release.source;
 const other='src/lua/abyss_game_ui_input.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualHandPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualHandPost697ReadFileSync(path,encoding);
 };
 const reader=handPost697CiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // Independent owner failure must reject history even after warm success.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(handPost697CiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(handPost697CiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualHandPost697ReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_game_ui_input.lua';fault={path:anchor,kind:'missing'};
 assert.equal(handPost697CiRead((p,e)=>p===production?actualHandPost697ReadFileSync(p,e):read(p,e))(production,'utf8'),actualHandPost697ReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=handPost697CiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=handPost697CiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=handPost697CiRead((p,e)=>{seen.push(p);return actualHandPost697ReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(handPost697CiPacket.files),...Object.keys(handPost697CiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('hand post697 union public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualHandPost697ReadFileSync(anchor,'utf8');
 const expected=handPost697CiPacket.files[anchor].views.release.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualHandPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualHandPost697ReadFileSync(path,encoding);
 };
 const project=()=>handPost697CiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(handPost697CiPacket.files),...Object.keys(handPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(handPost697CiSource(anchor,value,undefined,noRead),value);
 assert.equal(handPost697CiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_game_ui_input.lua',raw=actualHandPost697ReadFileSync(production,'utf8');
 assert.equal(handPost697CiSource(production,raw,undefined,noRead),raw);
 assert.equal(handPost697CiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('hand post697 union current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualHandPost697DiscoverJs(),lua:handEnemyLegacyLua()};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualHandPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualHandPost697ReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(handPost697PriorInventory(paths,kind,read),handPost697CiPacket.viewInventories.release[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(handPost697CiPacket.files),...Object.keys(handPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>handPost697PriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(handPost697PriorInventory(inventories.js,'js',read),handPost697CiPacket.viewInventories.release.js);
  }
 }
 fault={path:'src/lua/abyss_game_ui_input.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(handPost697PriorInventory(handPost697CiPacket.viewInventories.release[kind],kind,read),handPost697CiPacket.viewInventories.release[kind]);
});

test('hand post697 union integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/hand-enemy-hand-integrated.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_game_ui_input.lua';
 const raw=actualHandPost697ReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualHandPost697ReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualHandPost697ReadFileSync(path,encoding);
 };
 assertHandPost697CiCurrent(actualHandPost697ReadFileSync);
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

import {handPost697CiRead,handPost697CiPacket,handPost697CiSource,assertHandPost697CiCurrent,assertHandPost697RawInventory} from './helpers/hand-post697-ci-source.mjs';

test('hand post697 union both explicit histories reject warm cross-input faults and preserve unchanged before bytes',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_card_view.lua';let fault;
 const read=(path,encoding)=>{if(path===other&&fault){if(fault==='missing')throw Error('missing '+path);if(fault==='null')return null;const b=actualHandPost697ReadFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return actualHandPost697ReadFileSync(path,encoding);};
 for(const target of ['release','hand']){
  const reader=handPost697HistoricalRead(target,read),expected=handPost697CiPacket.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);
  for(const kind of ['missing','null','drift']){fault=kind;assert.throws(()=>reader(anchor,'utf8'));fault=undefined;assert.equal(reader(anchor,'utf8'),expected);}
  for(const [kind,paths]of Object.entries(handPost697CiPacket.currentInventory))assert.deepEqual(handPost697PriorInventory(paths,kind,read,target),handPost697CiPacket.viewInventories[target][kind]);
  const untouched=Object.entries(handPost697CiPacket.files).find(([,row])=>row.views[target]?.sha256===row.current.sha256);
  assert(untouched);const [path,row]=untouched,bytes=row.current.source.replaceAll('\n','\r\n'),seen=[];
  const same=handPost697HistoricalRead(target,(p,e)=>{seen.push(p);assert.equal(p,path,'unchanged/already-before must not cause blanket authentication');return e?bytes:Buffer.from(bytes);});
  assert.equal(same(path,'utf8'),bytes);assert.deepEqual(seen,[path]);
 }
 const binary=Buffer.from([255,0,128]);assert.equal(handPost697CiRead(()=>binary)('unknown/binary'),binary);
 for(const kind of ['js','lua']){
  const paths=handPost697CiPacket.currentInventory[kind];assertHandPost697RawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertHandPost697RawInventory(bad,kind));
 }
});


test('hand post697 union complete current production authenticates every one of 116 owners',async()=>{
 const {handPost697SourceEpoch:sourceEpoch,preHandPost697SourceEpoch,handBeforeMapSourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {handPost697SourcePacket:p,extendHandPost697Source}=await import('./helpers/hand-post697-source.mjs');
 const current=sourceEpoch.proof,prior=preHandPost697SourceEpoch.proof,hand=handBeforeMapSourceEpoch.proof;
 assert.deepEqual(current.mobileHandProducers,hand.mobileHandProducers);assert.deepEqual(current.releaseSelectionMapProducers,prior.releaseSelectionMapProducers);
 assert.equal(current.currentCommit,'d956df3e8b429ad4d4042d9489108000fb9b327b');assert.equal(current.currentTreeCommitted,true);
 assert.equal(prior.owners.length,116);assert.equal(current.owners.length,116);assert.deepEqual(current.owners,prior.owners);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 for(const [name,target]of Object.entries(hand.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.handPost697Release,{commit:p.baseCommit,files:prior.current});
 assert.deepEqual(current.targets.handBeforeMap,{commit:p.handCommit,files:hand.current});
 assert.equal(Object.values(current.current).filter(Boolean).length,352);
 for(const [path,row]of Object.entries(current.current))if(row)assert.equal(actualHandPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,handBeforeMap:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)}])assert.throws(()=>extendHandPost697Source(preHandPost697SourceEpoch,handBeforeMapSourceEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=actualHandPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n');return path===fault?.path?text+'\n':crlf?text.replaceAll('\n','\r\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'handPost697Release',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'handPost697Release',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'handPost697Release',readSource:read}),expected);
  }
 }
});
