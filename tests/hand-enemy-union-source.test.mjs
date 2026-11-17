import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,rmSync,writeFileSync,unlinkSync} from 'node:fs';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch as finalSourceEpoch,handEnemySourceEpoch as sourceEpoch,handPost697SourceEpoch,enemyPost697SourceEpoch,releaseJointSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {releaseUnionCiPacket,assertReleaseUnionCurrent,releaseUnionCiSource,releaseUnionPriorInventory} from './helpers/hand-enemy-release-ci-source.mjs';
import {handEnemyCiPacket as p,handEnemyHistoricalRead,handEnemyPriorInventory,assertHandEnemyCiCurrent,assertHandEnemyRawInventory} from './helpers/hand-enemy-ci-source.mjs';
import {integratedSource,integratedRead,integratedCiProof} from './helpers/integrated-ci-source.mjs';

test('public integrated PC22 historical exits reauthenticate the original raw reader after warm success',()=>{
 const owners=['src/lua/abyss_battle_card_view.lua','src/lua/abyss_card_flow.lua','tests/helpers/hand-enemy-release-ci-source.json.gz'];
 for(const anchor of ['tests/helpers/release-pc22-basic-feedback-source.mjs','tests/lua/card_flow_contact_continuity.lua']){
  const raw=readFileSync(anchor,'utf8');let fault;
  const read=(path,encoding)=>{
   if(path===fault?.path){if(fault.kind==='missing')throw Error('missing '+path);if(fault.kind==='null')return null;const bytes=readFileSync(path,encoding);return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);}
   return readFileSync(path,encoding);
  };
  const reader=integratedRead('menu',{read}),expected=integratedSource(anchor,raw,'menu',read);
  assert.notEqual(expected,raw,'the PC22 input must actually expose a historical source');
  for(const invoke of [()=>integratedSource(anchor,raw,'menu',read),()=>reader(anchor,'utf8'),()=>reader(anchor)]){
   const output=invoke();assert.equal(Buffer.isBuffer(output)?output.toString('utf8'):output,expected);
   for(const path of owners)for(const kind of ['missing','null','drift']){
    fault={path,kind};assert.throws(invoke,undefined,anchor+' '+path+' '+kind);fault=undefined;
   }
   const restored=invoke();assert.equal(Buffer.isBuffer(restored)?restored.toString('utf8'):restored,expected);
  }
 }
});

test('public integrated binary history reauthenticates current owners and archives before returning old bytes',()=>{
 const anchor='tests/helpers/menu-red-production-source.json.gz',saved=integratedCiProof.binaryViews[anchor].views.menu;
 let fault;const read=(path,encoding)=>{
  if(path===fault?.path){if(fault.kind==='missing')throw Error('missing '+path);if(fault.kind==='null')return null;const bytes=readFileSync(path,encoding);return typeof bytes==='string'?bytes+'\n':Buffer.concat([bytes,Buffer.from('\n')]);}
  return readFileSync(path,encoding);
 };
 const reader=integratedRead('menu',{read}),expected=readFileSync(saved.path);
 assert.notDeepEqual(expected,readFileSync(anchor),'the binary input must actually expose a historical archive');
 assert.deepEqual(reader(anchor),expected);
 for(const path of ['src/lua/abyss_battle_card_view.lua','src/lua/abyss_card_flow.lua','tests/helpers/hand-enemy-release-ci-source.json.gz',saved.path])for(const kind of ['missing','null','drift']){
  fault={path,kind};assert.throws(()=>reader(anchor),undefined,path+' '+kind);fault=undefined;
 }
 assert.deepEqual(reader(anchor),expected);
});

test('hand enemy union preserves both entire historical production domains and every live owner',()=>{
 assertReleaseUnionCurrent();
 const readFileSync=(path,encoding)=>{
  const source=sourceEpoch.proof.current[path]?.source;
  return source===undefined?readRaw(path,encoding):encoding?source:Buffer.from(source);
 };
 const c=sourceEpoch.proof;
 for(const old of [handPost697SourceEpoch,enemyPost697SourceEpoch])for(const [name,target]of Object.entries(old.proof.targets))assert.deepEqual(c.targets[name],target);
 assert.equal(Object.keys(c.current).length,352);
 for(const old of [handPost697SourceEpoch,enemyPost697SourceEpoch])for(const key of Object.keys(old.proof).filter(k=>k.endsWith('Producers')))assert.deepEqual(c[key],old.proof[key]);
 for(const [path,row]of Object.entries(c.current))if(row)assert.equal(readFileSync(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const [target,old]of [['handBeforeEnemyUnion',handPost697SourceEpoch],['enemyBeforeHandUnion',enemyPost697SourceEpoch]]){
  assert.deepEqual(c.targets[target].files,old.proof.current);
  const anchor=Object.keys(c.current).find(path=>c.current[path]?.sha256!==old.proof.current[path]?.sha256),raw=c.current[anchor].source;
  let fault;const read=path=>{if(path===fault?.path)return fault.missing?null:readFileSync(path,'utf8')+'\n';return readFileSync(path,'utf8');};
  assert.equal(sourceEpoch.preCombinedSource(anchor,raw,{target,readSource:read}),old.proof.current[anchor].source);
  for(const path of c.owners)for(const missing of [false,true]){fault={path,missing};assert.throws(()=>sourceEpoch.preCombinedSource(anchor,raw,{target,readSource:read}),/linked owner identity/);fault=undefined;}
 }
});

const readRaw=readFileSync;
test('forward Release union authenticates every live production owner and retains both complete reviewed corpora and producers',()=>{
 assertReleaseUnionCurrent();const current=finalSourceEpoch.proof;
 for(const [path,row]of Object.entries(current.current))if(row)assert.equal(readRaw(path,'utf8').replaceAll('\r\n','\n'),row.source,path);
 for(const side of [sourceEpoch,releaseJointSourceEpoch]){
  for(const [name,target]of Object.entries(side.proof.targets))assert.deepEqual(current.targets[name],target,name);
  for(const [name,value]of Object.entries(side.proof).filter(([key])=>key.endsWith('Producers')))assert.deepEqual(current[name],value,name);
 }
 assert.deepEqual(current.targets.handEnemyReviewed.files,sourceEpoch.proof.current);
 assert.deepEqual(current.targets.releasePc22BasicFeedbackReviewed.files,releaseJointSourceEpoch.proof.targets.releasePc22BasicFeedbackReviewed.files);
 assert.equal(current.currentTreeCommitted,false);
});

test('forward Release CI continuation rejects every warm missing null drift and archive edit and preserves inventories and opaque inputs',()=>{
 const packet=releaseUnionCiPacket,anchor='tests/helpers/closeout-source-epoch.mjs',raw=readRaw(anchor,'utf8');let fault;
 const read=(path,encoding)=>{
  if(path===fault?.path){if(fault.kind==='missing')throw Error('missing '+path);if(fault.kind==='null')return null;const b=readRaw(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}
  return readRaw(path,encoding);
 };
 const project=()=>releaseUnionCiSource(anchor,raw,'release',read);
 assert.notEqual(project(),raw);
 for(const path of [...Object.keys(packet.files),...Object.keys(packet.archives),'tests/helpers/hand-enemy-release-ci-source.json.gz'])for(const kind of ['missing','null','drift']){
  fault={path,kind};assert.throws(project,undefined,path+' '+kind);fault=undefined;
 }
 assert.equal(project(),packet.files[anchor].views.release.source);
 for(const bad of [raw+'\n',raw.slice(1),raw.replaceAll('\n','\r\r\n'),null,{},17])assert.strictEqual(releaseUnionCiSource(anchor,bad,'release',()=>{throw Error('opaque');}),bad);
 for(const path of ['foreign/'+anchor,'__proto__','constructor','src/lua/abyss_card_flow.lua','config/architecture.json'])assert.strictEqual(releaseUnionCiSource(path,raw,'release',()=>{throw Error('opaque');}),raw);
 for(const kind of ['js','lua']){
  const paths=packet.currentInventory[kind];assert.deepEqual(releaseUnionPriorInventory(paths,kind,'release'),packet.viewInventories.release[kind]);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,'foreign']])assert.throws(()=>releaseUnionPriorInventory(bad,kind),/inventory/);
 }
});
test('hand enemy full raw inventories and both histories reject warm deletion null drift and archive changes',()=>{
 const inventory={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 assertHandEnemyCiCurrent();
 for(const kind of ['js','lua']){assertHandEnemyRawInventory(inventory[kind],kind);for(const bad of [inventory[kind].slice(1),[...inventory[kind],inventory[kind][0]],[...inventory[kind],'foreign']])assert.throws(()=>assertHandEnemyRawInventory(bad,kind));}
 const anchor='tests/helpers/closeout-source-epoch.mjs';let fault;
 const read=(path,encoding)=>{if(path===fault?.path){if(fault.kind==='missing')throw Error('missing '+path);if(fault.kind==='null')return null;const b=readFileSync(path,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}return readFileSync(path,encoding);};
 for(const target of ['hand','enemy']){
  const reader=handEnemyHistoricalRead(target,read),expected=p.files[anchor].views[target].source;
  assert.equal(reader(anchor,'utf8'),expected);assert.equal(reader(anchor).toString(),expected);
  for(const kind of ['js','lua'])assert.deepEqual(handEnemyPriorInventory(inventory[kind],kind,read,target),p.viewInventories[target][kind]);
  for(const path of [...Object.keys(p.files),...Object.keys(p.immutableArchives)])for(const kind of ['missing','null','drift']){
   fault={path,kind};if(path!==anchor)assert.throws(()=>reader(anchor,'utf8'),undefined,path);else assert.throws(()=>assertHandEnemyCiCurrent(read),undefined,path);assert.throws(()=>handEnemyPriorInventory(inventory.js,'js',read,target),undefined,path);fault=undefined;
  }
  assert.equal(reader(anchor,'utf8'),expected);
 }
});

test('enemy geometry composition copy closure freshly rejects packet dependency drift and deletion after warm success',async()=>{
 const {copyIntegrationSourceClosure,enemyGeometryHelperCopies}=await import('./helpers/copy-integration-source-closure.mjs');
 const temp=tmpdir(),source=mkdtempSync(join(temp,'enemy geometry-copy-source-')),target=mkdtempSync(join(temp,'enemy geometry-copy-target-'));
 try{
  copyIntegrationSourceClosure(source);copyIntegrationSourceClosure(target,{sourceRoot:source});
  for(const {path}of enemyGeometryHelperCopies){
   const file=join(source,path),bytes=readFileSync(file);assert.deepEqual(readFileSync(join(target,path)),bytes);
   writeFileSync(file,Buffer.concat([bytes,Buffer.from('\n')]));
   assert.throws(()=>copyIntegrationSourceClosure(target,{sourceRoot:source}),/fresh helper copy identity/);
   writeFileSync(file,bytes);unlinkSync(file);
   assert.throws(()=>copyIntegrationSourceClosure(target,{sourceRoot:source}),/ENOENT/);
   writeFileSync(file,bytes);copyIntegrationSourceClosure(target,{sourceRoot:source});
  }
 }finally{for(const directory of [source,target]){
  const {realpathSync}=await import('node:fs');const {relative,isAbsolute}=await import('node:path');
  const within=relative(realpathSync.native(temp),realpathSync.native(directory));assert(!isAbsolute(within)&&within.startsWith('enemy geometry-copy-')&&!within.startsWith('..'));
  rmSync(directory,{recursive:true,force:true});
 }}
});
