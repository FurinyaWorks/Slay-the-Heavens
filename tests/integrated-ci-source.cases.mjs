import {blueCandleCiPacket,blueCandleCiSource,assertBlueCandleCiCurrent} from './helpers/blue-candle-ci-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as rawReadFileSync,readdirSync} from 'node:fs';
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent,assertReleaseBootstrapRawInventory} from './helpers/release-bootstrap-ci-source.mjs';
import {blueCandleCiRead,blueCandlePriorInventory} from './helpers/blue-candle-ci-source.mjs';
import {integrationRead,integrationPriorInventory} from './helpers/release-candle-map-integration.mjs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const sideRead=integrationRead('candle',rawReadFileSync);
const pickerBeforeRead=blueCandleCiRead(sideRead);
const readFileSync=releaseBootstrapCiRead(pickerBeforeRead);

test('integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(blueCandlePriorInventory(integrationPriorInventory(discoverJs(),'candle'),'js',sideRead),proof.inventory);assert.equal(new Set(proof.inventory).size,proof.inventory.length);
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
   const value=rawReadFileSync(p,e);
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
 const inventories={js:blueCandlePriorInventory(integrationPriorInventory(discoverJs(),'candle'),'js',sideRead),lua:blueCandlePriorInventory(integrationPriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'candle','lua'),'lua',sideRead)};
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

const actualDiskReadFileSync=integrationRead('candle',rawReadFileSync);
test('blue candle production continuation preserves all targets and rejects stale partial and missing owners',async()=>{
 const {blueCandleSourceEpoch:current,preBlueCandleSourceEpoch:prior}=await import('./helpers/closeout-source-epoch.mjs');
 const {blueCandleSourcePacket:packet,extendBlueCandleSource}=await import('./helpers/blue-candle-source.mjs');
 for(const [name,target]of Object.entries(prior.proof.targets))assert.deepEqual(current.proof.targets[name],target);
 assert.deepEqual(current.proof.targets.blueCandlePrior.files,prior.proof.current);
 assert.equal(current.proof.currentCommit,packet.currentCommit);
 for(const bad of [{...packet,current:{}},{...packet,before:{}},{...packet,producerCommit:'0'.repeat(40)}])
  assert.throws(()=>extendBlueCandleSource(prior,bad),/complete blue candle production bindings/);
 const path=Object.keys(packet.current)[0],source=actualDiskReadFileSync(path,'utf8').replaceAll('\r\n','\n');
 const reader=p=>current.proof.current[p]?.source??null;
 for(const input of [source,source.replaceAll('\n','\r\n')])
  assert.equal(current.preCombinedSource(path,input,{target:'blueCandlePrior',readSource:reader}),prior.proof.current[path].source);
 for(const corrupt of [null,source+'\n'])assert.throws(()=>current.preCombinedSource(path,source,{target:'blueCandlePrior',readSource:p=>p===path?corrupt:reader(p)}),/linked owner identity/);
 let reads=0;assert.equal(current.preCombinedSource(path,source+'\n',{target:'blueCandlePrior',readSource:()=>{reads++;}}),source+'\n');assert.equal(reads,0);
});

test('blue candle CI authenticates fresh complete sources archives and actual raw discovery',async()=>{
 assertBlueCandleCiCurrent(actualDiskReadFileSync);assert.equal(blueCandleCiPacket.currentTreeCommitted,false);
 for(const [path,row]of Object.entries(blueCandleCiPacket.files)){
  const source=actualDiskReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  const production=path.startsWith('src/');
  assert.equal(blueCandleCiSource(path,source),production?source:row.before?.source??source);
  for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(blueCandleCiSource(path,foreign),foreign);
  assert.equal(blueCandleCiSource('__proto__',source),source);
  assert.equal(blueCandleCiSource(path,source,{sha256:'0'.repeat(64)}),source);
  for(const mode of ['drift','missing'])assert.throws(()=>assertBlueCandleCiCurrent((p,e)=>{
   if(p===path&&mode==='missing')throw Error('missing '+p);
   const value=actualDiskReadFileSync(p,e);return p===path?value.slice(1):value;
  }),error=>{assert(error.message.includes(path));return true;});
 }
 for(const path of Object.keys(blueCandleCiPacket.immutableArchives))
  assert.throws(()=>assertBlueCandleCiCurrent((p,e)=>p===path?actualDiskReadFileSync(p).subarray(1):actualDiskReadFileSync(p,e)),/immutable.*predecessor/);
 const inventories={js:integrationPriorInventory(discoverJs(),'candle'),lua:integrationPriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'candle','lua')};
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,blueCandleCiPacket.currentInventory[kind]);
  assert.deepEqual(blueCandlePriorInventory(paths,kind,actualDiskReadFileSync),blueCandleCiPacket.priorInventory[kind]);
  for(const bad of [[...paths,paths[0]],[...paths,'tests/foreign.test.mjs'],paths.slice(1)])
   assert.throws(()=>blueCandlePriorInventory(bad,kind),/raw discovery inventory/);
  const added=paths.filter(p=>!blueCandleCiPacket.priorInventory[kind].includes(p));
  for(const path of added)assert.throws(()=>blueCandlePriorInventory(paths,kind,(p,e)=>actualDiskReadFileSync(p,e)+(p===path?'\n':'')),/fresh blue candle added inventory source/);
 }
 const path='tests/helpers/blue-candle-ci-source.mjs',leaf=actualDiskReadFileSync(path,'utf8');
 const bytes=actualDiskReadFileSync('tests/helpers/blue-candle-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./blue-candle-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete blue candle CI continuation/);
});
