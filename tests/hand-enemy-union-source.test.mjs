import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,rmSync,writeFileSync,unlinkSync} from 'node:fs';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,handPost697SourceEpoch,enemyPost697SourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {handEnemyCiPacket as p,handEnemyHistoricalRead,handEnemyPriorInventory,assertHandEnemyCiCurrent,assertHandEnemyRawInventory} from './helpers/hand-enemy-ci-source.mjs';

test('hand enemy union preserves both entire historical production domains and every live owner',()=>{
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
