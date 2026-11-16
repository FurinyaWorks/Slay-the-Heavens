// Run from the repository root: node docs/evidence/pr682-source-negative-20261116.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {discoverJs} from '../../scripts/ci-shards.mjs';
import {integratedRead,assertIntegratedCurrent} from '../../tests/helpers/integrated-ci-source.mjs';
import {assertStsStyleCiCurrent,stsStyleCiProof} from '../../tests/helpers/sts-style-ci-source.mjs';
import {dependencyCiProof} from '../../tests/helpers/dependency-ci-source.mjs';

const parent='1b60f71c4733ced0c91dc814dc5c7a6644c8fe56';
const archive='tests/helpers/dependency-ci-source.json.gz',test='tests/sts-style-source-epoch.test.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const gitSource=(revision,path)=>execFileSync('git',['show',revision+':'+path],{maxBuffer:32*1024*1024});
const oldBytes=gitSource(parent,archive),old=JSON.parse(gunzipSync(oldBytes));
assert.equal(hash(oldBytes),'499f0c0fd32f24178a8d7599d1f1167ff90a3899d791e13235484a47ba31595d');
assert.deepEqual(Object.keys(dependencyCiProof.files).filter(path=>!Object.hasOwn(old.files,path)),[test]);
assert.deepEqual({...dependencyCiProof,files:old.files},old,'only the new complete test binding extends the packet');
for(const [path,row]of Object.entries(old.files))assert.deepEqual(dependencyCiProof.files[path],row,path+' unchanged successor binding');
const row=dependencyCiProof.files[test];
assert.equal(row.before.source,gitSource(dependencyCiProof.baseCommit,test).toString('utf8'));
assert.equal(row.after.source,readFileSync(test,'utf8').replaceAll('\r\n','\n'));

const immutable={
 'tests/helpers/integrated-ci-source.json.gz':'f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35',
 'tests/helpers/sts-style-source-epoch.json.gz':'cc47fd96c79d7a604d2c5c269b012354d887762aecbe2990ac89fbf2ac74c1a9',
 'tests/helpers/sts-style-prior-runtime.json.gz':'10bf3b7d960e4c02ae2d64e26d8d5f16824439b9396949973f08ccec1c9d9330',
};
for(const [path,sha]of Object.entries(immutable))assert.equal(hash(readFileSync(path)),sha,path+' immutable bytes');
for(const path of ['tests/helpers/sts-style-ci-source.json.gz','tests/helpers/closeout-source-closure.json'])
 assert.deepEqual(readFileSync(path),gitSource(parent,path),path+' unchanged historical identity');

const files=discoverJs();
assertIntegratedCurrent();assertStsStyleCiCurrent(files,readFileSync);
const menu='tests/session-menu-navigation.test.mjs',historical=integratedRead('sts');
assert.notEqual(historical(menu,'utf8').replaceAll('\r\n','\n'),readFileSync(menu,'utf8').replaceAll('\r\n','\n'));
const inventoryError='fresh added inventory source: '+menu;
assert.throws(()=>assertStsStyleCiCurrent(files,historical),error=>error.message.split('\n')[0]===inventoryError);
for(const mode of ['drift','missing']){
 const missing=Object.assign(Error('missing raw source: '+menu),{code:'ENOENT'});
 assert.throws(()=>assertStsStyleCiCurrent(files,(path,encoding)=>{
  if(path===menu){if(mode==='missing')throw missing;return readFileSync(path,encoding)+'\n';}
  return readFileSync(path,encoding);
 }),error=>mode==='missing'?error===missing:error.message.split('\n')[0]===inventoryError);
 assertStsStyleCiCurrent(files,readFileSync);
}

const targets=['scripts/test-affected.mjs','tests/test-affected.test.mjs','scripts/ci-media-lfs.mjs',
 'scripts/check-license.mjs','tests/ci-reviewed-lfs.test.mjs','.gitattributes','config/ci-media-lfs.json','docs/legal/assets.json',
 'docs/evidence/sts-neow-reference-20261113/verify-runtime-equivalence.mjs'];
const cases=[...targets.map(path=>[path,['fresh complete StS CI source: '+path]]),
 ...Object.keys(stsStyleCiProof.helperSources).map(path=>[path,['fresh complete StS CI source: '+path,'fresh StS helper source: '+path]])];
for(const [target,messages]of cases){
 let injected=false;
 assert.throws(()=>assertStsStyleCiCurrent(files,(path,encoding)=>{
  const source=readFileSync(path,encoding);
  if(path!==target)return source;
  injected=true;return source+'\n';
 }),error=>injected&&messages.includes(error.message.split('\n')[0]),target+' must reach its intended guard');
}
assertStsStyleCiCurrent(files,readFileSync);
console.log(JSON.stringify({parent,base:dependencyCiProof.baseCommit,intendedGuardMutations:cases.length,
 historicalReaderRejected:true,rawMenuDriftAndMissingRejected:true,rawRecovery:true,
 unchangedPriorBindings:Object.keys(old.files).length,unchangedCopyClosure:Object.keys(old.helperClosure).length,
 archiveBytes:readFileSync(archive).length,archiveSha256:hash(readFileSync(archive)),
 js:dependencyCiProof.inventoryAfter.length,lua:dependencyCiProof.luaInventoryAfter.length}));
