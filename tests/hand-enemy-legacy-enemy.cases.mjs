import {handEnemyHistoricalRead,handEnemyPriorInventory,handEnemyCiPacket} from './helpers/hand-enemy-ci-source.mjs';
const actualEnemyPost697ReadFileSync=enemyTestRead;
const actualEnemyPost697DiscoverJs=()=>[...handEnemyCiPacket.viewInventories.enemy.js];
const unionLegacyLua=()=>[...handEnemyCiPacket.viewInventories.enemy.lua];
import test,{beforeEach} from 'node:test';
import {prepareHandEnemyTestDomain,enemyTestRead} from './helpers/hand-enemy-test-domains.mjs';
beforeEach(()=>prepareHandEnemyTestDomain('enemy'));
import assert from 'node:assert/strict';
import {readFileSync as unionActualReadFileSync,readdirSync} from 'node:fs';
import {enemyPost697HistoricalRead,enemyPost697PriorInventory} from './helpers/hand-enemy-enemy-post697-ci-source.mjs';
const actualEnemyGeometryReadFileSync=enemyPost697HistoricalRead('enemy',actualEnemyPost697ReadFileSync);
import {enemyGeometryCiRead,enemyGeometryCiPacket,enemyGeometryCiSource as priorEnemyGeometryCiSource,enemyGeometryPriorInventory,assertEnemyGeometryCiCurrent,assertEnemyGeometryRawInventory} from './helpers/enemy-geometry-ci-source.mjs';
const rawReadFileSync=enemyGeometryCiRead(actualEnemyGeometryReadFileSync);
const enemyGeometryCiSource=(path,source,before,read=actualEnemyGeometryReadFileSync)=>priorEnemyGeometryCiSource(path,source,before,read);
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent as priorBootstrapCurrent,assertReleaseBootstrapRawInventory} from './helpers/hand-enemy-bootstrap-ci-source.mjs';
const assertReleaseBootstrapCiCurrent=(read=rawReadFileSync)=>priorBootstrapCurrent(enemyGeometryCiRead(read));
import {createHash} from 'node:crypto';
import {discoverJs as unionActualDiscoverJs} from '../scripts/ci-shards.mjs';
const actualEnemyGeometryDiscoverJs=()=>enemyPost697PriorInventory(actualEnemyPost697DiscoverJs(),'js',actualEnemyPost697ReadFileSync);
const enemyLegacyLua=()=>enemyPost697PriorInventory(unionLegacyLua(),'lua',actualEnemyPost697ReadFileSync);
const discoverJs=()=>enemyGeometryPriorInventory(actualEnemyGeometryDiscoverJs(),'js',actualEnemyGeometryReadFileSync);
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/hand-enemy-enemy-integrated.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const readFileSync=releaseBootstrapCiRead(rawReadFileSync);

test('integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(discoverJs(),proof.inventory);assert.equal(new Set(proof.inventory).size,proof.inventory.length);
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
   const value=actualEnemyPost697ReadFileSync(p,e);
   return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh complete (?:integration|enemy post697) source/);assert(error.message.includes(path),'reject the intended current owner');return true;});
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
 assertReleaseBootstrapCiCurrent();
 for(const [path,row]of Object.entries(releaseBootstrapCiPacket.files)){
  const source=rawReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(releaseBootstrapCiSource(path,source),row.before.source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(releaseBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseBootstrapCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{
   const value=rawReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return rawReadFileSync(p,e);}),/missing/);
  if(path.startsWith('.github/')){
   for(const input of [source,source.replaceAll('\n','\r\n')])assert.equal(releaseBootstrapWorkflowBefore(path,input),row.before.source);
   for(const foreign of [source+'\n',source.slice(1),source.replace('release/**','foreign/**')])
    assert.throws(()=>releaseBootstrapWorkflowBefore(path,foreign),/fresh complete Release bootstrap workflow/);
  }
 }
 const archive=Object.keys(releaseBootstrapCiPacket.immutableArchives)[0];
 assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>p===archive?rawReadFileSync(p).subarray(1):rawReadFileSync(p,e)),/immutable bootstrap predecessor/);
 const inventories={js:discoverJs(),lua:enemyGeometryPriorInventory(enemyLegacyLua(),'lua',actualEnemyGeometryReadFileSync)};
 for(const [kind,paths]of Object.entries(inventories)){
  assertReleaseBootstrapRawInventory(paths,kind);
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertReleaseBootstrapRawInventory(bad,kind),/raw discovery inventory/);
 }
 const leaf=rawReadFileSync('tests/helpers/release-bootstrap-ci-source.mjs','utf8');
 const bytes=rawReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-bootstrap-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete Release bootstrap CI continuation/);
});

test('legacy13a enemy geometry composition production sources retain original owners and reject partial fresh authorizations',async()=>{
 const {preEnemyPost697SourceEpoch:sourceEpoch,preEnemyGeometrySourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {enemyGeometrySourcePacket:p,extendEnemyGeometrySource}=await import('./helpers/enemy-geometry-source.mjs');
 const prior=preEnemyGeometrySourceEpoch.proof,current=sourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.enemyGeometryPrior.files,prior.current);
 assert.equal(current.currentCommit,'d8f03fa79aacb62fd663d75fdfd3a037a9eb2984');assert.equal(current.currentTreeCommitted,true);
 for(const [path,row]of Object.entries(p.current))assert.equal(actualEnemyGeometryReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,prerequisites:[]}])
  assert.throws(()=>extendEnemyGeometrySource(preEnemyGeometrySourceEpoch,bad));
 const path=Object.keys(p.current)[0],source=p.current[path].source;
 const read=p=>{try{return actualEnemyGeometryReadFileSync(p,'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}};
 for(const owner of Object.keys(p.current)){
  assert.equal(sourceEpoch.preCombinedSource(path,source,{target:'enemyGeometryPrior',readSource:read}),prior.current[path].source);
  for(const missing of [false,true])assert.throws(()=>sourceEpoch.preCombinedSource(path,source,{target:'enemyGeometryPrior',readSource:p=>p===owner?missing?null:read(p)+'\n':read(p)}),/linked owner identity/);
 }
});

test('legacy13a enemy geometry composition CI keeps the bootstrap packet and rejects missing drift and incomplete after bytes',async()=>{
 assertEnemyGeometryCiCurrent(actualEnemyGeometryReadFileSync);
 assert.equal(enemyGeometryCiPacket.currentTreeCommitted,false);
 assert.equal(enemyGeometryCiPacket.baseCommit,'b67226945c2be47c8fff31f1362412b973f68875');
 assert.equal(hash(actualEnemyGeometryReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz')),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6');
 for(const [path,row]of Object.entries(enemyGeometryCiPacket.files)){
  const source=actualEnemyGeometryReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(enemyGeometryCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(enemyGeometryCiSource(path,foreign),foreign);
  for(const key of ['__proto__','constructor','foreign/'+path])assert.equal(enemyGeometryCiSource(key,source),source);
  assert.throws(()=>assertEnemyGeometryCiCurrent((p,e)=>{
   const value=actualEnemyGeometryReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertEnemyGeometryCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return actualEnemyGeometryReadFileSync(p,e);}),/missing/);
 }
 const bytes=actualEnemyGeometryReadFileSync('tests/helpers/enemy-geometry-ci-source.json.gz');
 const leaf=actualEnemyGeometryReadFileSync('tests/helpers/enemy-geometry-ci-source.mjs','utf8');
 const marker="const bytes=readFileSync(new URL('./enemy-geometry-ci-source.json.gz',import.meta.url));";assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete enemy geometry CI continuation/);
});

test('legacy13a enemy geometry composition raw JS and Lua inventory rejects missing duplicate foreign and source drift',()=>{
 const inventories={js:actualEnemyGeometryDiscoverJs(),lua:enemyLegacyLua()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertEnemyGeometryRawInventory(paths,kind);
  assert.deepEqual(enemyGeometryPriorInventory(paths,kind,actualEnemyGeometryReadFileSync),enemyGeometryCiPacket.priorInventory[kind]);
  const noAdded=paths.filter(p=>enemyGeometryCiPacket.priorInventory[kind].includes(p));
  assert.throws(()=>assertEnemyGeometryRawInventory(noAdded,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>enemyGeometryPriorInventory(bad,kind,actualEnemyGeometryReadFileSync),/raw .* inventory/);
  for(const path of paths.filter(p=>!noAdded.includes(p)))assert.throws(()=>enemyGeometryPriorInventory(paths,kind,(p,e)=>{
   const value=actualEnemyGeometryReadFileSync(p,e);return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh complete integration source: enemy geometry|fresh enemy geometry added inventory source/);assert(error.message.includes(path),'reject the injected legacy owner');return true;});
 }
});

test('enemy geometry historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=enemyGeometryCiPacket.files[anchor].before.source;
 const other='src/lua/abyss_battle_enemy_view.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyGeometryReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyGeometryReadFileSync(path,encoding);
 };
 const reader=enemyGeometryCiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // The exact old implementation exposes the historical anchor without ever
 // consulting this independent missing owner. Keep this first as the RED.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(enemyGeometryCiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(enemyGeometryCiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualEnemyGeometryReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_battle_enemy_view.lua';fault={path:other,kind:'missing'};
 assert.equal(enemyGeometryCiRead((p,e)=>p===production?actualEnemyGeometryReadFileSync(p,e):read(p,e))(production,'utf8'),actualEnemyGeometryReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=enemyGeometryCiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=enemyGeometryCiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=enemyGeometryCiRead((p,e)=>{seen.push(p);return actualEnemyGeometryReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(enemyGeometryCiPacket.files),...Object.keys(enemyGeometryCiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('enemy geometry public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualEnemyGeometryReadFileSync(anchor,'utf8');
 const expected=enemyGeometryCiPacket.files[anchor].before.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyGeometryReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyGeometryReadFileSync(path,encoding);
 };
 const project=()=>enemyGeometryCiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(enemyGeometryCiPacket.files),...Object.keys(enemyGeometryCiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(enemyGeometryCiSource(anchor,value,undefined,noRead),value);
 assert.equal(enemyGeometryCiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_battle_enemy_view.lua',raw=actualEnemyGeometryReadFileSync(production,'utf8');
 assert.equal(enemyGeometryCiSource(production,raw,undefined,noRead),raw);
 assert.equal(enemyGeometryCiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('enemy geometry current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualEnemyGeometryDiscoverJs(),lua:enemyLegacyLua()};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyGeometryReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyGeometryReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(enemyGeometryPriorInventory(paths,kind,read),enemyGeometryCiPacket.priorInventory[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(enemyGeometryCiPacket.files),...Object.keys(enemyGeometryCiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>enemyGeometryPriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(enemyGeometryPriorInventory(inventories.js,'js',read),enemyGeometryCiPacket.priorInventory.js);
  }
 }
 fault={path:'src/lua/abyss_battle_enemy_view.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(enemyGeometryPriorInventory(enemyGeometryCiPacket.priorInventory[kind],kind,read),enemyGeometryCiPacket.priorInventory[kind]);
});

test('enemy geometry integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/hand-enemy-enemy-integrated.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_targeting.lua';
 const raw=actualEnemyGeometryReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualEnemyGeometryReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualEnemyGeometryReadFileSync(path,encoding);
 };
 assertEnemyGeometryCiCurrent(actualEnemyGeometryReadFileSync);
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

test('enemy post697 union historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=enemyPost697CiPacket.files[anchor].views.enemy.source;
 const other='src/lua/abyss_game_ui_input.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 const reader=enemyPost697CiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // Independent missing current binding must reject history after warm success.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(enemyPost697CiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(enemyPost697CiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualEnemyPost697ReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_game_ui_input.lua';fault={path:anchor,kind:'missing'};
 assert.equal(enemyPost697CiRead((p,e)=>p===production?actualEnemyPost697ReadFileSync(p,e):read(p,e))(production,'utf8'),actualEnemyPost697ReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=enemyPost697CiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=enemyPost697CiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=enemyPost697CiRead((p,e)=>{seen.push(p);return actualEnemyPost697ReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(enemyPost697CiPacket.files),...Object.keys(enemyPost697CiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('enemy post697 union public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualEnemyPost697ReadFileSync(anchor,'utf8');
 const expected=enemyPost697CiPacket.files[anchor].views.enemy.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 const project=()=>enemyPost697CiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(enemyPost697CiPacket.files),...Object.keys(enemyPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(enemyPost697CiSource(anchor,value,undefined,noRead),value);
 assert.equal(enemyPost697CiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_game_ui_input.lua',raw=actualEnemyPost697ReadFileSync(production,'utf8');
 assert.equal(enemyPost697CiSource(production,raw,undefined,noRead),raw);
 assert.equal(enemyPost697CiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('enemy post697 union current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualEnemyPost697DiscoverJs(),lua:unionLegacyLua()};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(enemyPost697PriorInventory(paths,kind,read),enemyPost697CiPacket.viewInventories.enemy[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(enemyPost697CiPacket.files),...Object.keys(enemyPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>enemyPost697PriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(enemyPost697PriorInventory(inventories.js,'js',read),enemyPost697CiPacket.viewInventories.enemy.js);
  }
 }
 fault={path:'src/lua/abyss_game_ui_input.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(enemyPost697PriorInventory(enemyPost697CiPacket.viewInventories.enemy[kind],kind,read),enemyPost697CiPacket.viewInventories.enemy[kind]);
});

test('enemy post697 union integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/hand-enemy-enemy-integrated.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_game_ui_input.lua';
 const raw=actualEnemyPost697ReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualEnemyPost697ReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualEnemyPost697ReadFileSync(path,encoding);
 };
 assertEnemyPost697CiCurrent(actualEnemyPost697ReadFileSync);
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

import {enemyPost697CiRead,enemyPost697CiPacket,enemyPost697CiSource,assertEnemyPost697CiCurrent,assertEnemyPost697RawInventory} from './helpers/hand-enemy-enemy-post697-ci-source.mjs';

test('enemy post697 union production retains both complete real inputs and authenticates every current owner',async()=>{
 const {enemyPost697SourceEpoch:sourceEpoch,preEnemyPost697SourceEpoch,releaseSelectionMapLegacyEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {enemyPost697SourcePacket:p,extendEnemyPost697Source}=await import('./helpers/enemy-post697-source.mjs');
 const current=sourceEpoch.proof,prior=preEnemyPost697SourceEpoch.proof,legacy=releaseSelectionMapLegacyEpoch.proof;
 assert.equal(current.currentCommit,'bc106cce4f8fde5d1b0dec5ae9c0403cb5436a0c');assert.equal(current.currentTreeCommitted,true);
 assert.deepEqual(current.owners,prior.owners);assert.equal(current.owners.length,117);assert.equal(legacy.owners.length,116);
 assert.deepEqual(current.enemyGeometryProducers,prior.enemyGeometryProducers,'all three original enemy producers retained');
 for(const [name,target]of Object.entries(legacy.targets))assert.deepEqual(current.targets[name],target,'complete actual Release target '+name);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.selectionMapLanded,{commit:p.selectionCommit,files:legacy.current});
 assert.deepEqual(current.targets.enemyBeforeSelection,{commit:p.baseCommit,files:prior.current});
 for(const [path,row]of Object.entries(current.current))if(row!==null)assert.equal(actualEnemyPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,producers:{}},{...p,inheritedEnemy:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)},{...p,inputs:[]}])assert.throws(()=>extendEnemyPost697Source(preEnemyPost697SourceEpoch,releaseSelectionMapLegacyEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=actualEnemyPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n');return path===fault?.path?text+'\n':crlf?text.replaceAll('\n','\r\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'enemyBeforeSelection',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'enemyBeforeSelection',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'enemyBeforeSelection',readSource:read}),expected);
  }
 }
});

test('enemy post697 union both explicit histories reject warm cross-input faults and preserve unchanged before bytes',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_targeting.lua';let fault;
 const read=(path,encoding)=>{if(path===other&&fault){if(fault==='missing')throw Error('missing '+path);if(fault==='null')return null;const b=actualEnemyPost697ReadFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return actualEnemyPost697ReadFileSync(path,encoding);};
 for(const target of ['enemy','selection']){
  const reader=enemyPost697HistoricalRead(target,read),expected=enemyPost697CiPacket.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);
  for(const kind of ['missing','null','drift']){fault=kind;assert.throws(()=>reader(anchor,'utf8'));fault=undefined;assert.equal(reader(anchor,'utf8'),expected);}
  for(const [kind,paths]of Object.entries(enemyPost697CiPacket.currentInventory))assert.deepEqual(enemyPost697PriorInventory(paths,kind,read,target),enemyPost697CiPacket.viewInventories[target][kind]);
  const untouched=Object.entries(enemyPost697CiPacket.files).find(([,row])=>row.views[target]?.sha256===row.current.sha256);
  assert(untouched);const [path,row]=untouched,bytes=row.current.source.replaceAll('\n','\r\n'),seen=[];
  const same=enemyPost697HistoricalRead(target,(p,e)=>{seen.push(p);assert.equal(p,path,'unchanged/already-before must not cause blanket authentication');return e?bytes:Buffer.from(bytes);});
  assert.equal(same(path,'utf8'),bytes);assert.deepEqual(seen,[path]);
 }
 const binary=Buffer.from([255,0,128]);assert.equal(enemyPost697CiRead(()=>binary)('unknown/binary'),binary);
 for(const kind of ['js','lua']){
  const paths=enemyPost697CiPacket.currentInventory[kind];assertEnemyPost697RawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertEnemyPost697RawInventory(bad,kind));
 }
});

import {partition,jsShard as rawCurrentJsShard,jsPlanningWeights as rawCurrentJsPlanningWeights,timings as rawCurrentTimings} from '../scripts/ci-shards.mjs';
import {shardLuaScripts} from '../scripts/test-lua.mjs';
test('enemy geometry composition raw Full retains complete discovery costs and real execution guards',t=>{
 assertEnemyGeometryCiCurrent(actualEnemyGeometryReadFileSync);
 const js=actualEnemyGeometryDiscoverJs(),lua=enemyLegacyLua();
 assertEnemyGeometryRawInventory(js,'js');assertEnemyGeometryRawInventory(lua,'lua');
 assert.equal(rawCurrentTimings.unknownJsMs,10000);assert.equal(rawCurrentTimings.unknownLuaMs,10000);
 const physical=actualEnemyGeometryReadFileSync('.github/workflows/quality.yml','utf8').replaceAll('\r\n','\n');
 const job=name=>physical.match(new RegExp(`^  ${name}:\\n[\\s\\S]*?(?=^  [\\w-]+:|(?![\\s\\S]))`,'m'))[0];
 assert.match(job('rules'),/timeout-minutes: \$\{\{ inputs.runner_pool == 'local-special' && 75 \|\| 45 \}\}/);
 assert.match(job('engineering-posix-shards'),/runs-on: ubuntu-24.04\n    timeout-minutes: 30/);
 for(const [platform,count,target,guard]of [['win32',18,1800000,2700000],['linux',15,1200000,1800000]]){
  for(const path of js.filter(p=>!enemyGeometryCiPacket.priorInventory.js.includes(p))){
   assert.equal(rawCurrentTimings.js[platform][path],undefined,'no fabricated hosted measurement');
   assert(rawCurrentJsPlanningWeights([path],platform)[path]>=rawCurrentTimings.unknownJsMs);
  }
  const bins=Array.from({length:count},(_,i)=>rawCurrentJsShard(js,`${i+1}/${count}`,platform));
  assert.deepEqual(bins.flatMap(bin=>bin.files).sort(),js);assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,js.length);
  const loads=bins[0].loads;let combined=loads;
  if(platform==='win32'){
   const luaBins=Array.from({length:count},(_,i)=>shardLuaScripts(lua,`${i+1}/${count}`,{...rawCurrentTimings,windowsJsShardMs:loads},2));
   assert.deepEqual(luaBins.flat().sort(),lua);assert.equal(new Set(luaBins.flat()).size,lua.length);
   const cost=f=>rawCurrentTimings.luaShard[f]??rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;
   const safety=f=>rawCurrentTimings.lua[f]??rawCurrentTimings.unknownLuaMs;
   combined=luaBins.map((bin,i)=>{
    const pool=[0,0];for(const f of bin.filter(f=>safety(f)<10000).sort((a,b)=>safety(b)-safety(a)||a.localeCompare(b)))pool[pool[0]<=pool[1]?0:1]+=cost(f);
    return loads[i]+bin.filter(f=>safety(f)>=10000).reduce((sum,f)=>sum+cost(f),0)+Math.max(...pool);
   });
  }
  const forecast=Math.max(...combined)+60000;
  t.diagnostic(`${platform}: raw ${js.length} JS / ${lua.length} Lua; forecast ${forecast}ms; target ${target}ms; overrun ${Math.max(0,forecast-target)}ms; physical guard ${guard}ms; prediction is not admission`);
 }
});

test('enemy post697 current raw Full retains the actual 880 JS and 1424 Lua under original execution guards',async t=>{
 assertEnemyPost697CiCurrent(actualEnemyPost697ReadFileSync);
 const js=actualEnemyPost697DiscoverJs().sort(),lua=unionLegacyLua();
 assertEnemyPost697RawInventory(js,'js');assertEnemyPost697RawInventory(lua,'lua');
 assert.equal(js.length,880);assert.equal(lua.length,1424);
 for(const kind of ['js','lua']){
  const paths=kind==='js'?js:lua;
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertEnemyPost697RawInventory(bad,kind));
 }
 assert.equal(rawCurrentTimings.unknownJsMs,10000);assert.equal(rawCurrentTimings.unknownLuaMs,10000);
 const {assertReleaseSelectionMapExecutionGuards}=await import('./helpers/release-selection-map-ci-source.mjs');
 assertReleaseSelectionMapExecutionGuards(actualEnemyPost697ReadFileSync('.github/workflows/quality.yml','utf8'));
 for(const [platform,count]of [['win32',18],['linux',15]]){
  for(const path of js.filter(path=>!enemyPost697CiPacket.viewInventories.enemy.js.includes(path))){
   assert.equal(rawCurrentTimings.js[platform][path],undefined,'no invented hosted observation');
   assert(rawCurrentJsPlanningWeights([path],platform)[path]>=rawCurrentTimings.unknownJsMs);
  }
  const bins=Array.from({length:count},(_,i)=>rawCurrentJsShard(js,`${i+1}/${count}`,platform));
  assert.deepEqual(bins.flatMap(bin=>bin.files).sort(),js);assert.equal(new Set(bins.flatMap(bin=>bin.files)).size,js.length);
 }
 t.diagnostic('actual current 880 JS / 1424 Lua discovered; immutable legacy877/879 remain separate; unchanged guards, costs and raw safety; no Hosted completion or full-cost claim');
});
