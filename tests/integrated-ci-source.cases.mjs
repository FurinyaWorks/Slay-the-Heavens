import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as actualEnemyGeometryReadFileSync,readdirSync} from 'node:fs';
import {enemyGeometryCiRead,enemyGeometryCiPacket,enemyGeometryCiSource,enemyGeometryPriorInventory,assertEnemyGeometryCiCurrent,assertEnemyGeometryRawInventory} from './helpers/enemy-geometry-ci-source.mjs';
const rawReadFileSync=enemyGeometryCiRead(actualEnemyGeometryReadFileSync);
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent as priorBootstrapCurrent,assertReleaseBootstrapRawInventory} from './helpers/release-bootstrap-ci-source.mjs';
const assertReleaseBootstrapCiCurrent=(read=rawReadFileSync)=>priorBootstrapCurrent(enemyGeometryCiRead(read));
import {createHash} from 'node:crypto';
import {discoverJs as actualEnemyGeometryDiscoverJs} from '../scripts/ci-shards.mjs';
const discoverJs=()=>enemyGeometryPriorInventory(actualEnemyGeometryDiscoverJs(),'js',actualEnemyGeometryReadFileSync);
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
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
   const value=actualEnemyGeometryReadFileSync(p,e);
   return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh complete integration source/);assert(error.message.includes(path),'reject the intended current owner');return true;});
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
 const inventories={js:discoverJs(),lua:enemyGeometryPriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualEnemyGeometryReadFileSync)};
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

test('enemy geometry composition production sources retain original owners and reject partial fresh authorizations',async()=>{
 const {sourceEpoch,preEnemyGeometrySourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
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

test('enemy geometry composition CI keeps the bootstrap packet and rejects missing drift and incomplete after bytes',async()=>{
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

test('enemy geometry composition raw JS and Lua inventory rejects missing duplicate foreign and source drift',()=>{
 const inventories={js:actualEnemyGeometryDiscoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertEnemyGeometryRawInventory(paths,kind);
  assert.deepEqual(enemyGeometryPriorInventory(paths,kind,actualEnemyGeometryReadFileSync),enemyGeometryCiPacket.priorInventory[kind]);
  const noAdded=paths.filter(p=>enemyGeometryCiPacket.priorInventory[kind].includes(p));
  assert.throws(()=>assertEnemyGeometryRawInventory(noAdded,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>enemyGeometryPriorInventory(bad,kind,actualEnemyGeometryReadFileSync),/raw .* inventory/);
  for(const path of paths.filter(p=>!noAdded.includes(p)))assert.throws(()=>enemyGeometryPriorInventory(paths,kind,(p,e)=>{
   const value=actualEnemyGeometryReadFileSync(p,e);return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),/fresh enemy geometry added inventory source/);
 }
});
