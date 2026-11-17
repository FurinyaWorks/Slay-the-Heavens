import {beforePreflightSource} from './helpers/fork-preflight-source.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as unionActualReadFileSync,readdirSync} from 'node:fs';
import {intentReleaseFixtureRead,intentReleaseFixtureInventory} from './helpers/intent-release-union.mjs';
const rawReadFileSync=intentReleaseFixtureRead('release',unionActualReadFileSync);
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent,assertReleaseBootstrapRawInventory} from './helpers/release-bootstrap-ci-source.mjs';
import {releasePc22BasicFeedbackCiRead,releasePc22BasicFeedbackPriorInventory} from './helpers/release-pc22-basic-feedback-ci-source.mjs';
import {integrationRead,integrationPriorInventory} from './helpers/release-af77-fixture-integration.mjs';
import {createHash} from 'node:crypto';
import {discoverJs as unionActualDiscoverJs} from '../scripts/ci-shards.mjs';
const discoverJs=()=>intentReleaseFixtureInventory('js','release');
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/release-af77-standalone-integrated-ci-source.mjs';
const raw=p=>beforePreflightSource(p,readFileSync(p,'utf8')).replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const sideRead=integrationRead('pc22',rawReadFileSync);
const pickerBeforeRead=releasePc22BasicFeedbackCiRead(sideRead);
const readFileSync=releaseBootstrapCiRead(pickerBeforeRead);

test('af77 standalone: integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(releasePc22BasicFeedbackPriorInventory(integrationPriorInventory(discoverJs(),'pc22'),'js',sideRead),proof.inventory);assert.equal(new Set(proof.inventory).size,proof.inventory.length);
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

test('af77 standalone: integration copy closure requires its complete exact predecessor and current dependency bytes',()=>{
 const predecessor=Object.fromEntries(Object.entries(proof.closure).filter(([,row])=>row.before!==null).map(([p,row])=>[p,row.before]));
 predecessor['tests/helpers/retained.mjs']='a'.repeat(64);
 const result=extendIntegratedHelperClosure(predecessor);assert.equal(result['tests/helpers/retained.mjs'],predecessor['tests/helpers/retained.mjs']);
 for(const [path,row]of Object.entries(proof.closure)){
  assert.equal(result[path],row.after);
  assert.equal(hash(path.endsWith('.gz')?readFileSync(path):raw(path)),row.after);
  assert.throws(()=>extendIntegratedHelperClosure({...predecessor,[path]:'f'.repeat(64)}),/copy predecessor/);
 }
});

test('af77 standalone: Release bootstrap exact sources retain every old byte and reject missing drift and partial packets',async()=>{
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
 const inventories={js:releasePc22BasicFeedbackPriorInventory(integrationPriorInventory(discoverJs(),'pc22'),'js',sideRead),lua:releasePc22BasicFeedbackPriorInventory(integrationPriorInventory(intentReleaseFixtureInventory('lua','release'),'pc22','lua'),'lua',sideRead)};
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


import {intentPost697HistoricalRead,intentPost697PriorInventory} from './helpers/intent-post697-ci-source.mjs';
const actualIntentPost697ReadFileSync=intentReleaseFixtureRead('intent',unionActualReadFileSync);
const actualIntentPost697DiscoverJs=()=>intentReleaseFixtureInventory('js','intent');
test('e122 standalone: intent post697 union historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=intentPost697CiPacket.files[anchor].views.release.source;
 const other='src/lua/abyss_game_ui_input.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualIntentPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualIntentPost697ReadFileSync(path,encoding);
 };
 const reader=intentPost697CiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // Independent owner failure must reject history even after warm success.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(intentPost697CiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(intentPost697CiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualIntentPost697ReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_game_ui_input.lua';fault={path:anchor,kind:'missing'};
 assert.equal(intentPost697CiRead((p,e)=>p===production?actualIntentPost697ReadFileSync(p,e):read(p,e))(production,'utf8'),actualIntentPost697ReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=intentPost697CiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=intentPost697CiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=intentPost697CiRead((p,e)=>{seen.push(p);return actualIntentPost697ReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(intentPost697CiPacket.files),...Object.keys(intentPost697CiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('e122 standalone: intent post697 union public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualIntentPost697ReadFileSync(anchor,'utf8');
 const expected=intentPost697CiPacket.files[anchor].views.release.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualIntentPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualIntentPost697ReadFileSync(path,encoding);
 };
 const project=()=>intentPost697CiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(intentPost697CiPacket.files),...Object.keys(intentPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(intentPost697CiSource(anchor,value,undefined,noRead),value);
 assert.equal(intentPost697CiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_game_ui_input.lua',raw=actualIntentPost697ReadFileSync(production,'utf8');
 assert.equal(intentPost697CiSource(production,raw,undefined,noRead),raw);
 assert.equal(intentPost697CiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('e122 standalone: intent post697 union current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualIntentPost697DiscoverJs(),lua:intentReleaseFixtureInventory('lua','intent')};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualIntentPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualIntentPost697ReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(intentPost697PriorInventory(paths,kind,read),intentPost697CiPacket.viewInventories.release[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(intentPost697CiPacket.files),...Object.keys(intentPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>intentPost697PriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(intentPost697PriorInventory(inventories.js,'js',read),intentPost697CiPacket.viewInventories.release.js);
  }
 }
 fault={path:'src/lua/abyss_game_ui_input.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(intentPost697PriorInventory(intentPost697CiPacket.viewInventories.release[kind],kind,read),intentPost697CiPacket.viewInventories.release[kind]);
});

test('e122 standalone: intent post697 union integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead,integratedSource}=await import('./helpers/intent-standalone-integrated-ci-source.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_game_ui_input.lua';
 const raw=actualIntentPost697ReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualIntentPost697ReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualIntentPost697ReadFileSync(path,encoding);
 };
 assertIntentPost697CiCurrent(actualIntentPost697ReadFileSync);
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

import {intentPost697CiRead,intentPost697CiPacket,intentPost697CiSource,assertIntentPost697CiCurrent,assertIntentPost697RawInventory} from './helpers/intent-post697-ci-source.mjs';
import {intentReleasePacket,assertIntentReleaseCurrent,assertIntentReleaseRawInventory} from './helpers/intent-release-union.mjs';
import {integratedSource as currentIntegratedSource,integratedRead as currentIntegratedRead,assertIntegratedCurrent as assertCurrentIntegrated,integratedPriorInventory as currentIntegratedPriorInventory,integratedCurrentInventory} from './helpers/integrated-ci-source.mjs';

test('actual af77 intent union preserves both complete raw inventories and every real production byte',async()=>{
 const p=intentReleasePacket;
 const current={js:unionActualDiscoverJs(),lua:readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()};
 assert.deepEqual(p.parents,{release:'af77fb2461c548f0faf104761d107397f75dca08',intent:'e1221ee0abc265a720cd71a87d01b9d109c51475'});
 assert.equal(Object.keys(p.files).filter(path=>path.startsWith('src/')||path==='config/architecture.json').length,352);
 for(const kind of ['js','lua']){
  const union=[...new Set([...p.parentInventories.release[kind],...p.parentInventories.intent[kind]])].sort();
  assert.deepEqual(p.inventory[kind],union,'complete exact parent inventory union');
  assertIntentReleaseRawInventory(current[kind],kind);assert.deepEqual(integratedCurrentInventory(kind),union);
  for(const bad of [current[kind].slice(1),[...current[kind],current[kind][0]],[...current[kind],'foreign']])assert.throws(()=>assertIntentReleaseRawInventory(bad,kind));
 }
 const {sourceEpoch,preIntentReleaseSourceEpoch,intentPost697StandaloneEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const proof=sourceEpoch.proof;
 assert.equal(proof.owners.length,118);assert.equal(Object.keys(proof.targets).length,72);
 for(const [path,row]of Object.entries(proof.current))if(row)assert.equal(unionActualReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,'actual raw production '+path);
 for(const side of [preIntentReleaseSourceEpoch,intentPost697StandaloneEpoch])for(const [name,target]of Object.entries(side.proof.targets))assert.deepEqual(proof.targets[name],target,'complete unchanged original '+name);
 assert.deepEqual(proof.targets.intentReleaseAf77Reviewed.files,preIntentReleaseSourceEpoch.proof.current);
 assert.deepEqual(proof.targets.intentStandaloneReviewed.files,intentPost697StandaloneEpoch.proof.current);
 for(const target of ['intentReleaseAf77Reviewed','intentStandaloneReviewed']){
  const anchor=target==='intentReleaseAf77Reviewed'?'src/lua/abyss_battle_render_actors.lua':'src/lua/abyss_card_flow.lua',source=proof.current[anchor].source;
  const raw=p=>unionActualReadFileSync(p,'utf8');
  assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target,readSource:raw}),proof.targets[target].files[anchor].source);
  for(const owner of proof.owners)for(const value of [null,raw(owner)+'\n'])assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target,readSource:p=>p===owner?value:raw(p)}),/linked owner identity/);
 }
 assertCurrentIntegrated();assertIntentReleaseCurrent();
});

test('actual af77 intent union public admission freshly rejects each live source and archive fault with the same raw reader',()=>{
 const p=intentReleasePacket,anchor='tests/helpers/closeout-source-epoch.mjs';
 const source=unionActualReadFileSync(anchor,'utf8'),inventory=unionActualDiscoverJs();
 let fault;
 const read=(path,encoding)=>{
  const raw=unionActualReadFileSync(path,encoding);
  if(path!==fault?.path)return raw;
  if(fault.kind==='missing')throw Error('missing '+path);
  if(fault.kind==='null')return null;
  return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
 };
 const reader=currentIntegratedRead('menu',{read});
 const operations=[()=>currentIntegratedSource(anchor,source,'menu',read),()=>reader(anchor,'utf8'),()=>assertCurrentIntegrated(read),()=>currentIntegratedPriorInventory(inventory,'menu','js',read)];
 const expected=operations.map(operation=>operation());
 assert.notEqual(expected[0],source);assert.equal(expected[1],expected[0]);
 const corpus=[...Object.keys(p.files),...Object.keys(p.archives),'tests/helpers/intent-release-union.json.gz','tests/helpers/intent-release-union.mjs'];
 const representatives=['src/lua/abyss_battle_intent_view.lua','src/lua/abyss_card_flow.lua','tests/helpers/integrated-ci-source.mjs','tests/release-selection-map-source.test.mjs',Object.keys(p.archives)[0],'tests/helpers/intent-release-union.json.gz','tests/helpers/intent-release-union.mjs'];
 // Exhaust each field/fault through the shared live gate, then prove all
 // public entries delegate to it for each distinct production/CI/archive case.
 for(const path of corpus)for(const kind of ['missing','null','drift']){
  fault={path,kind};assert.throws(()=>assertIntentReleaseCurrent(read),undefined,path+' '+kind);
  fault=undefined;assertIntentReleaseCurrent(read);
 }
 for(let index=0;index<operations.length;index++)for(const path of representatives)for(const kind of ['missing','null','drift']){
  const operation=operations[index];fault={path,kind};
  assert.throws(operation,undefined,'public '+index+' rejects '+path+' '+kind);
  fault=undefined;assert.deepEqual(operation(),expected[index],'warm recovery public '+index+' '+path);
 }
 // The requested anchor itself must stay foreign or absent rather than being
 // blessed by a packet. These are no-authorization paths, separately observed.
 fault={path:anchor,kind:'null'};assert.equal(currentIntegratedSource(anchor,null,'menu',read),null);
 fault=undefined;
 const noRead=()=>{throw Error('foreign input cannot authorize a historical result');};
 for(const input of [source+'\n',null,{},17])assert.equal(currentIntegratedSource(anchor,input,'menu',noRead),input);
 for(const path of ['foreign/source','__proto__','constructor'])assert.equal(currentIntegratedSource(path,source,'menu',noRead),source);
 for(const path of ['src/lua/abyss_battle_render_actors.lua','config/architecture.json']){
  const raw=unionActualReadFileSync(path,'utf8');assert.equal(currentIntegratedSource(path,raw,'menu',noRead),raw,'CI entry never projects production');
 }
 const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected[0]);
});

test('e122 standalone: intent post697 union both explicit histories reject warm cross-input faults and preserve unchanged before bytes',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_battle_render_actors.lua';let fault;
 const read=(path,encoding)=>{if(path===other&&fault){if(fault==='missing')throw Error('missing '+path);if(fault==='null')return null;const b=actualIntentPost697ReadFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return actualIntentPost697ReadFileSync(path,encoding);};
 for(const target of ['release','intent']){
  const reader=intentPost697HistoricalRead(target,read),expected=intentPost697CiPacket.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);
  for(const kind of ['missing','null','drift']){fault=kind;assert.throws(()=>reader(anchor,'utf8'));fault=undefined;assert.equal(reader(anchor,'utf8'),expected);}
  for(const [kind,paths]of Object.entries(intentPost697CiPacket.currentInventory))assert.deepEqual(intentPost697PriorInventory(paths,kind,read,target),intentPost697CiPacket.viewInventories[target][kind]);
  const untouched=Object.entries(intentPost697CiPacket.files).find(([,row])=>row.views[target]?.sha256===row.current.sha256);
  assert(untouched);const [path,row]=untouched,bytes=row.current.source.replaceAll('\n','\r\n'),seen=[];
  const same=intentPost697HistoricalRead(target,(p,e)=>{seen.push(p);assert.equal(p,path,'unchanged/already-before must not cause blanket authentication');return e?bytes:Buffer.from(bytes);});
  assert.equal(same(path,'utf8'),bytes);assert.deepEqual(seen,[path]);
 }
 const binary=Buffer.from([255,0,128]);assert.equal(intentPost697CiRead(()=>binary)('unknown/binary'),binary);
 for(const kind of ['js','lua']){
  const paths=intentPost697CiPacket.currentInventory[kind];assertIntentPost697RawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertIntentPost697RawInventory(bad,kind));
 }
});

test('e122 standalone: intent post697 union complete current production authenticates every one of 117 owners',async()=>{
 const {intentPost697StandaloneEpoch:sourceEpoch,preIntentPost697SourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {intentPost697SourcePacket:p,extendIntentPost697Source}=await import('./helpers/intent-post697-source.mjs');
 const current=sourceEpoch.proof,prior=preIntentPost697SourceEpoch.proof;
 assert.equal(current.currentCommit,'38efba8119e3b812d530e32915907ef842bcafae');assert.equal(current.currentTreeCommitted,true);
 assert.equal(prior.owners.length,116);assert.equal(current.owners.length,117);
 assert.deepEqual(current.owners.filter(path=>!prior.owners.includes(path)),['src/lua/abyss_battle_intent_view.lua']);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.intentPost697Release,{commit:p.baseCommit,files:prior.current});
 assert.equal(current.targets.intentBeforeMap.commit,p.intentCommit);
 assert.equal(Object.values(current.current).filter(Boolean).length,352);
 for(const [path,row]of Object.entries(current.current))if(row)assert.equal(actualIntentPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,intentBeforeMap:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)}])assert.throws(()=>extendIntentPost697Source(preIntentPost697SourceEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=actualIntentPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n');return path===fault?.path?text+'\n':crlf?text.replaceAll('\n','\r\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'intentPost697Release',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'intentPost697Release',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'intentPost697Release',readSource:read}),expected);
  }
 }
});

// Regression for exact current inputs unchanged at the outer union but changed
// by a deeper historical layer. No historical fixture participates in admission.
test('actual af77 intent deeper historical outputs authenticate the original raw reader',()=>{
 const owner='src/lua/abyss_battle_intent_view.lua';let fault;
 const paths=['.github/workflows/licenses.yml','.github/workflows/quick-feedback.yml','scripts/art/ready-card-runtime.mjs','scripts/audit-native-candidate.mjs','scripts/build-native-audio-game.mjs','scripts/build-native-bgm-candidate.mjs','scripts/build-native-candidate.mjs','scripts/build-ui.mjs'];
 const read=(p,e)=>{
  const raw=unionActualReadFileSync(p,e);if(p!==owner||!fault)return raw;
  if(fault==='missing')throw Error('missing '+p);if(fault==='null')return null;
  return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
 };
 for(const path of paths){
  const row=intentReleasePacket.files[path],source=unionActualReadFileSync(path,'utf8');
  assert.equal(row.current.sha256,row.parents.release.sha256,'unchanged outer source is the necessary counterexample');
  const reader=currentIntegratedRead('menu',{read});
  const expected=currentIntegratedSource(path,source,'menu',read);assert.notEqual(expected,source);
  for(const invoke of [()=>currentIntegratedSource(path,source,'menu',read),()=>reader(path,'utf8')]){
   assert.equal(invoke(),expected);
   for(const kind of ['missing','null','drift']){fault=kind;assert.throws(invoke);fault=undefined;assert.equal(invoke(),expected);}
  }
 }
 const binary=Buffer.from([255,0,128]);assert.equal(currentIntegratedRead('menu',{read:()=>binary})('unknown/binary'),binary);
 assert.equal(currentIntegratedRead('menu',{read:()=>null})('unknown/source'),null);
});

test('actual intent admission covers every inherited CI anchor before deeper historical output',()=>{
 const owner='src/lua/abyss_battle_intent_view.lua';let fault;
 const read=(p,e)=>p===owner&&fault?null:unionActualReadFileSync(p,e);
 const reader=currentIntegratedRead('menu',{read});let changed=0;
 for(const path of Object.keys(proof.files)){
  assert(Object.hasOwn(intentReleasePacket.files,path),'inherited anchor in complete live capture: '+path);
  const source=unionActualReadFileSync(path,'utf8'),expected=currentIntegratedSource(path,source,'menu',read);
  if(expected===source)continue;changed++;
  fault=true;assert.throws(()=>currentIntegratedSource(path,source,'menu',read),undefined,path+' source');
  assert.throws(()=>reader(path,'utf8'),undefined,path+' reader');
  fault=false;
 }
 assert(changed>=97,'original omitted inherited anchors must be exercised');
 assertCurrentIntegrated();
});
