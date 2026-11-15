import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure,integratedCurrentInventory,integratedCurrentSource,integratedPriorInventory} from './helpers/integrated-ci-source.mjs';
import {itemIconCi,itemIconCiSource,assertItemIconAddedSources,itemIconCurrentInventory,itemIconPriorInventory} from './helpers/item-semantic-icons-ci.mjs';
import {pcFinalCiPacket,pcFinalPriorInventory} from './helpers/pc-final-ci-source.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');

test('integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(discoverJs(),integratedCurrentInventory());assert.equal(new Set(proof.inventory).size,proof.inventory.length);
 for(const [path,row]of Object.entries(proof.files))for(const target of Object.keys(proof.sources)){
  const source=raw(path),production=path.startsWith('src/')||path==='config/architecture.json';
  const expected=production?source:row.views[target]?.source??source;
  assert.equal(integratedSource(path,source,target),expected);
  if(!production&&row.views[target]){
   const crlf=source.replaceAll('\n','\r\n');
   assert.equal(integratedSource(path,crlf,target),row.views[target].sha256===row.current.sha256&&integratedCurrentSource(path,source)===source?crlf:expected);
  }
  for(const input of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(integratedSource(path,input,target),input);
  for(const foreign of ['__proto__','constructor','foreign/'+path])assert.equal(integratedSource(foreign,source,target),source);
 }
 for(const path of ['.gitattributes','docs/legal/assets.json','tests/helpers/closeout-source-epoch.mjs','tests/helpers/run-hud-ci-source.mjs','tests/helpers/integrated-ci-source.mjs'])
  assert.throws(()=>assertIntegratedCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh complete integration source/);
 assert.equal(raw('tests/helpers/integrated-ci-binding.mjs'),renderIntegratedCiBinding(hash(readFileSync('tests/helpers/integrated-ci-source.json.gz'))));
 assert.equal(hash(readFileSync('tests/helpers/menu-red-before-integration-production-source.json.gz')),'ee888fd1686beaeffc2e439164619ecedee9ac00d2ca00a2711bd74c63e28cae');
});

test('integration copy closure requires its complete exact predecessor and current dependency bytes',()=>{
 const predecessor=Object.fromEntries(Object.entries(proof.closure).filter(([,row])=>row.before!==null).map(([p,row])=>[p,row.before]));
 predecessor['tests/helpers/retained.mjs']='a'.repeat(64);
 const result=extendIntegratedHelperClosure(predecessor);assert.equal(result['tests/helpers/retained.mjs'],predecessor['tests/helpers/retained.mjs']);
 for(const [path,row]of Object.entries(proof.closure)){
  assert.equal(result[path],row.after);
  assert.equal(hash(path.endsWith('.gz')?readFileSync(path):integratedCurrentSource(path,raw(path))),row.after);
  assert.throws(()=>extendIntegratedHelperClosure({...predecessor,[path]:'f'.repeat(64)}),/copy predecessor/);
 }
});
test('item icon CI continuation pins only reviewed aliases and complete new raw test inventories',()=>{
 const snapshot=JSON.stringify(proof);assert.equal(Object.keys(itemIconCi.aliases).length,12);
 let unknownReads=0;assert.throws(()=>integratedPriorInventory(discoverJs(),'unknown','js',()=>{unknownReads++;throw Error('unexpected');}),/known integration inventory/);assert.equal(unknownReads,0);
 for(const [path,aliases]of Object.entries(itemIconCi.aliases)){
  const row=proof.files[path].current,source=raw(path);assert(aliases.some(alias=>alias.before===row.sha256&&alias.after===hash(source))||(pcFinalCiPacket.files[path]?.before?.sha256===row.sha256&&pcFinalCiPacket.files[path]?.current?.sha256===hash(source)),path);
  assert.equal(itemIconCiSource(path,source,row),row.source);assert.equal(itemIconCiSource(path,source.replaceAll('\n','\r\n'),row),row.source);
  assert.equal(itemIconCiSource(path,source,{...row,sha256:'f'.repeat(64)}),source);
  for(const changed of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),null,{},17])assert.equal(itemIconCiSource(path,changed,row),changed);
  assert.equal(itemIconCiSource('foreign/'+path,source,row),source);
  for(const target of Object.keys(proof.sources))if(!proof.files[path].views[target])assert.equal(integratedSource(path,source,target),source,'null view remains opaque');
  assert.throws(()=>assertIntegratedCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh complete integration source/);
 }
 for(const kind of ['js','lua']){
  const current=kind==='js'?discoverJs():readdirSync('tests/lua').filter(path=>path.endsWith('.lua')).map(path=>'tests/lua/'+path).sort();
  assert.deepEqual(current,integratedCurrentInventory(kind));
  const before=kind==='js'?proof.inventory:proof.luaInventory;
  assert.deepEqual(pcFinalPriorInventory(current,kind,readFileSync).filter(path=>!before.includes(path)),Object.keys(itemIconCi.added[kind]).sort());
  for(const path of Object.keys(itemIconCi.added[kind])){
   assert.throws(()=>integratedPriorInventory(current.filter(p=>p!==path),'release',kind),/inventory/);
   assert.throws(()=>integratedPriorInventory(current,'release',kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/added inventory source/);
   assert.throws(()=>assertIntegratedCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/added inventory source/);
  }
  for(const bad of [[...current,current[0]],[...current,'tests/foreign.'+kind]])assert.throws(()=>integratedPriorInventory(bad,'release',kind),/inventory/);
 }
 for(const path of Object.keys(itemIconCi.support)){
  assert.throws(()=>assertIntegratedCurrent((p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/runtime support source/);
  assert.throws(()=>integratedPriorInventory(discoverJs(),'release','js',(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/runtime support source/);
 }
 const adopted={...proof,inventory:integratedCurrentInventory(),luaInventory:integratedCurrentInventory('lua'),files:{...proof.files}};
 for(const path of Object.keys(itemIconCi.support))adopted.files[path]={current:{source:'future reviewed support',sha256:'f'.repeat(64)}};
 let retiredReads=0;const retired=()=>{retiredReads++;throw Error('retired bridge');};
 assertItemIconAddedSources(retired,adopted);
 for(const [kind,base]of [['js',adopted.inventory],['lua',adopted.luaInventory]]){
  assert.deepEqual(itemIconCurrentInventory(base,kind),base);
  assert.deepEqual(itemIconPriorInventory(base,base,kind,retired,adopted),base);
 }
 assert.equal(retiredReads,0,'formal base owns the runtime JS/support; the bridge imposes no stale source lock');
 assert.equal(JSON.stringify(proof),snapshot,'original immutable proof object remains unchanged');
});
