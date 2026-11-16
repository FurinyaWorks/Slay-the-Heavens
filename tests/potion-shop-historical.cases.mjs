import {potionShopParentFixture} from './helpers/potion-shop-parent-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as actualUnionReadFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {discoverJs as actualUnionDiscoverJs} from '../scripts/ci-shards.mjs';
import {potionShopHistoricalRead,potionShopPriorInventory} from './helpers/potion-shop-ci-source.mjs';
import {shopPost697HistoricalRead,shopPost697PriorInventory} from './helpers/shop-post697-ci-source.mjs';
import {integratedSource} from './helpers/integrated-ci-source.mjs';
const actualShopPost697ReadFileSync=potionShopParentFixture('shop',actualUnionReadFileSync);
const actualShopPost697DiscoverJs=()=>potionShopPriorInventory(actualUnionDiscoverJs(),'js',actualUnionReadFileSync,'shop');
const hash=b=>createHash('sha256').update(b).digest('hex');
test('shop post697 union historical CI reader reauthenticates every current binding and archive after warm success',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',expected=shopPost697CiPacket.files[anchor].views.release.source;
 const other='src/lua/abyss_game_ui_input.lua';let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualShopPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualShopPost697ReadFileSync(path,encoding);
 };
 const reader=shopPost697CiRead(read);
 assert.equal(reader(anchor,'utf8'),expected);
 // Independent owner failure must reject history even after warm success.
 fault={path:other,kind:'missing'};
 assert.throws(()=>reader(anchor,'utf8'),undefined,'the entire declared corpus must authenticate before history');
 fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
 for(const path of Object.keys(shopPost697CiPacket.files).filter(path=>path!==anchor)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 for(const path of Object.keys(shopPost697CiPacket.immutableArchives)){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>reader(anchor,'utf8'),undefined,path+' '+kind);
   fault=undefined;assert.equal(reader(anchor,'utf8'),expected);
  }
 }
 // The selected anchor must itself be exact; null and foreign data are raw,
 // never authenticated historical output. Errors still propagate unchanged.
 fault={path:anchor,kind:'missing'};assert.throws(()=>reader(anchor,'utf8'),/missing/);
 fault={path:anchor,kind:'null'};assert.equal(reader(anchor,'utf8'),null);
 fault={path:anchor,kind:'drift'};assert.equal(reader(anchor,'utf8'),actualShopPost697ReadFileSync(anchor,'utf8')+'\n');
 fault=undefined;const binary=reader(anchor);assert(Buffer.isBuffer(binary));assert.equal(binary.toString('utf8'),expected);
 const production='src/lua/abyss_game_ui_input.lua';fault={path:anchor,kind:'missing'};
 assert.equal(shopPost697CiRead((p,e)=>p===production?actualShopPost697ReadFileSync(p,e):read(p,e))(production,'utf8'),actualShopPost697ReadFileSync(production,'utf8'),'CI reader never projects production');
 fault=undefined;
 const unknown=shopPost697CiRead(()=>null);assert.equal(unknown('foreign/source','utf8'),null);
 const historical=shopPost697CiRead((p,e)=>p===anchor?(e?expected:Buffer.from(expected)):read(p,e));
 fault={path:other,kind:'missing'};assert.equal(historical(anchor,'utf8'),expected,'already historical bytes stay raw and gain no fresh authorization');
 fault=undefined;
 const seen=[],tracked=shopPost697CiRead((p,e)=>{seen.push(p);return actualShopPost697ReadFileSync(p,e);});
 assert.equal(tracked(anchor,'utf8'),expected);
 for(const path of [...Object.keys(shopPost697CiPacket.files),...Object.keys(shopPost697CiPacket.immutableArchives)])assert(seen.includes(path),path+' checked before replay');
});

test('shop post697 union public CI source authenticates the same raw reader before every historical conversion',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',source=actualShopPost697ReadFileSync(anchor,'utf8');
 const expected=shopPost697CiPacket.files[anchor].views.release.source;let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualShopPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualShopPost697ReadFileSync(path,encoding);
 };
 const project=()=>shopPost697CiSource(anchor,source,undefined,read);
 assert.equal(project(),expected);
 for(const path of [...Object.keys(shopPost697CiPacket.files),...Object.keys(shopPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(project,undefined,path+' '+kind);
   fault=undefined;assert.equal(project(),expected);
  }
 }
 const noRead=()=>{throw Error('foreign input cannot authorize a historical view');};
 for(const value of [source+'\n',source.slice(1),null,{},17,expected])assert.equal(shopPost697CiSource(anchor,value,undefined,noRead),value);
 assert.equal(shopPost697CiSource('foreign/source',source,undefined,noRead),source);
 const production='src/lua/abyss_game_ui_input.lua',raw=actualShopPost697ReadFileSync(production,'utf8');
 assert.equal(shopPost697CiSource(production,raw,undefined,noRead),raw);
 assert.equal(shopPost697CiSource(anchor,source,{sha256:'0'.repeat(64)},noRead),source);
});

test('shop post697 union current inventory authenticates the complete corpus before entering prior inventory',()=>{
 const inventories={js:actualShopPost697DiscoverJs(),lua:potionShopPriorInventory(readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort(),'lua',actualUnionReadFileSync,'shop')};let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){
   if(fault.kind==='missing')throw Error('missing '+path);
   if(fault.kind==='null')return null;
   const raw=actualShopPost697ReadFileSync(path,encoding);
   return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);
  }
  return actualShopPost697ReadFileSync(path,encoding);
 };
 for(const [kind,paths]of Object.entries(inventories))assert.deepEqual(shopPost697PriorInventory(paths,kind,read),shopPost697CiPacket.viewInventories.release[kind]);
 // Both kinds share the same corpus gate. Exercise all declared faults once,
 // and retain separate positive JS/Lua and already-prior boundaries.
 for(const path of [...Object.keys(shopPost697CiPacket.files),...Object.keys(shopPost697CiPacket.immutableArchives)]){
  for(const kind of ['missing','null','drift']){
   fault={path,kind};assert.throws(()=>shopPost697PriorInventory(inventories.js,'js',read),undefined,path+' '+kind);
   fault=undefined;assert.deepEqual(shopPost697PriorInventory(inventories.js,'js',read),shopPost697CiPacket.viewInventories.release.js);
  }
 }
 fault={path:'src/lua/abyss_game_ui_input.lua',kind:'missing'};
 for(const kind of ['js','lua'])assert.deepEqual(shopPost697PriorInventory(shopPost697CiPacket.viewInventories.release[kind],kind,read),shopPost697CiPacket.viewInventories.release[kind]);
});

test('shop post697 union integrated reader and source forward the same raw reader before historical output',async()=>{
 const {integratedRead}=await import('./helpers/integrated-ci-source.mjs');
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_game_ui_input.lua';
 const raw=actualShopPost697ReadFileSync(anchor,'utf8');let fault;const seen=[];
 const read=(path,encoding)=>{
  seen.push(path);
  if(path===other&&fault){
   if(fault==='missing')throw Error('missing '+path);
   if(fault==='null')return null;
   const bytes=actualShopPost697ReadFileSync(path,encoding);
   return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);
  }
  return actualShopPost697ReadFileSync(path,encoding);
 };
 assertShopPost697CiCurrent(actualShopPost697ReadFileSync);
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

import {shopPost697CiRead,shopPost697CiPacket,shopPost697CiSource,assertShopPost697CiCurrent,assertShopPost697RawInventory} from './helpers/shop-post697-ci-source.mjs';

test('shop post697 union both explicit histories reject warm cross-input faults and preserve unchanged before bytes',()=>{
 const anchor='tests/helpers/closeout-source-epoch.mjs',other='src/lua/abyss_shop_selection.lua';let fault;
 const read=(path,encoding)=>{if(path===other&&fault){if(fault==='missing')throw Error('missing '+path);if(fault==='null')return null;const b=actualShopPost697ReadFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return actualShopPost697ReadFileSync(path,encoding);};
 for(const target of ['release','shop']){
  const reader=shopPost697HistoricalRead(target,read),expected=shopPost697CiPacket.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);
  for(const kind of ['missing','null','drift']){fault=kind;assert.throws(()=>reader(anchor,'utf8'));fault=undefined;assert.equal(reader(anchor,'utf8'),expected);}
  for(const [kind,paths]of Object.entries(shopPost697CiPacket.currentInventory))assert.deepEqual(shopPost697PriorInventory(paths,kind,read,target),shopPost697CiPacket.viewInventories[target][kind]);
  const untouched=Object.entries(shopPost697CiPacket.files).find(([,row])=>row.views[target]?.sha256===row.current.sha256);
  assert(untouched);const [path,row]=untouched,bytes=row.current.source.replaceAll('\n','\r\n'),seen=[];
  const same=shopPost697HistoricalRead(target,(p,e)=>{seen.push(p);assert.equal(p,path,'unchanged/already-before must not cause blanket authentication');return e?bytes:Buffer.from(bytes);});
  assert.equal(same(path,'utf8'),bytes);assert.deepEqual(seen,[path]);
 }
 const binary=Buffer.from([255,0,128]);assert.equal(shopPost697CiRead(()=>binary)('unknown/binary'),binary);
 for(const kind of ['js','lua']){
  const paths=shopPost697CiPacket.currentInventory[kind];assertShopPost697RawInventory(paths,kind);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>assertShopPost697RawInventory(bad,kind));
 }
});

test('shop post697 union complete current production authenticates every one of 118 owners',async()=>{
 const {shopPost697LegacyEpoch:sourceEpoch,preShopPost697SourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const {shopPost697SourcePacket:p,extendShopPost697Source}=await import('./helpers/shop-post697-source.mjs');
 const current=sourceEpoch.proof,prior=preShopPost697SourceEpoch.proof;
 assert.equal(current.currentCommit,'5e2375f03a9a80d2abc8420ab7a401e89d525add');assert.equal(current.currentTreeCommitted,true);
 assert.equal(prior.owners.length,116);assert.equal(current.owners.length,118);
 assert.deepEqual(current.owners.filter(path=>!prior.owners.includes(path)),['src/lua/abyss_node_ui_input.lua','src/lua/abyss_shop_selection.lua']);
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(current.targets[name],target,name);
 assert.deepEqual(current.targets.shopPost697Release,{commit:p.baseCommit,files:prior.current});
 assert.equal(current.targets.shopBeforeMap.commit,p.shopCommit);
 assert.equal(Object.values(current.current).filter(Boolean).length,352);
 for(const [path,row]of Object.entries(current.current))if(row)assert.equal(actualShopPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const bad of [{...p,current:{}},{...p,before:{}},{...p,shopBeforeMap:{}},{...p,currentTreeCommitted:false},{...p,currentCommit:'0'.repeat(40)}])assert.throws(()=>extendShopPost697Source(preShopPost697SourceEpoch,bad));
 const anchor=Object.keys(p.current)[0],source=current.current[anchor].source,expected=prior.current[anchor].source;
 for(const crlf of [false,true]){
  let fault;const seen=[];
  const read=path=>{seen.push(path);if(path===fault?.path&&fault.missing)return null;const text=actualShopPost697ReadFileSync(path,'utf8').replaceAll('\r\n','\n');return path===fault?.path?text+'\n':crlf?text.replaceAll('\n','\r\n'):text;};
  for(const path of current.owners){
   seen.length=0;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'shopPost697Release',readSource:read}),expected);assert.deepEqual(seen,current.owners);
   for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,source,{target:'shopPost697Release',readSource:read}),/linked owner identity/);}
   fault=undefined;assert.equal(sourceEpoch.preCombinedSource(anchor,source,{target:'shopPost697Release',readSource:read}),expected);
  }
 }
});
