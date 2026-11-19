import assert from 'node:assert/strict';
import {readFileSync as raw} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const cwd=process.cwd(),load=p=>import(pathToFileURL(resolve(cwd,p)));
const H=b=>createHash('sha256').update(b).digest('hex');
const norm=s=>s.replaceAll('\r\n','\n');
const git=(...a)=>execFileSync('git',a);
const base='676508d246b6033d543fd8515b881cba27ad41b6';
assert.equal(git('rev-parse',base+'^{tree}').toString().trim(),'5306436d010dc6bf7ddf88e65b8135047989dfb2');
assert.equal(git('rev-parse','HEAD^{tree}').toString().trim(),'5306436d010dc6bf7ddf88e65b8135047989dfb2');
const {sourceEpoch}=await load('tests/helpers/closeout-source-epoch.mjs');
const {integratedSource,integratedRead}=await load('tests/helpers/integrated-ci-source.mjs');
const {assertReleasePotionEnemyCurrent,isCurrentReleaseCiReplay}=await load('tests/helpers/release-potion-enemy-source.mjs');
const epochs=sourceEpoch.proof;
assert.equal(Object.keys(epochs.current).length,352);
assert.equal(epochs.owners.length,129);
assert.equal(Object.keys(epochs.targets).length,88);
const packetPath='tests/helpers/release-historical-input-ci.json.gz';
const producer='tests/helpers/release-full-followup-source.json.gz';
const archive=raw(packetPath), packet=JSON.parse(gunzipSync(archive));
assert.equal(H(archive),'7a3dbcce1c581f810c837faca4a6a1ce74db40bf1f62de79105527eb812bfc2e');
assert.equal(packet.base,base);
assert.equal(packet.productionArchive,H(raw(producer)));
const fixed={
 'tests/helpers/historical-card-input.mjs':'ca9fde49f25f161b476da6e7269f7a3020851b20',
 'tests/card-input-slices.test.mjs':'25a6a8a13cb3adf95849c7b1de4e7f267a5da894',
 'tests/helpers/release-potion-enemy-source.mjs':'b0759f6b1339390bc92f7137b8133f0f4e2f7433',
 [packetPath]:'41dc2647d39ea977171d219675023b9244c821b4',
 'tests/integrated-ci-source.cases.mjs':'a5162b7ffc9d5f9a9c818a5d9a15855263c767f6',
};
for(const [p,b] of Object.entries(fixed))assert.equal(git('hash-object','--no-filters',p).toString().trim(),b,p);
assert.deepEqual(Object.keys(packet.files),['tests/helpers/historical-card-input.mjs','tests/card-input-slices.test.mjs','tests/integrated-ci-source.cases.mjs']);
const unchanged=['tests/helpers/closeout-source-epoch.mjs','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/integrated-ci-source.mjs',
 'scripts/test-lua.mjs','tests/lua/card_input_port.lua','tests/lua/card_input_port_slice_2.lua','tests/lua/card_input_port_slice_3.lua',
 'tests/lua/support/card_input_port_cases.lua',
 ...['pointer-identity','pointer-overlay','fatal-bgm','full-repair','full-followup'].flatMap(s=>['ci','source'].map(k=>'tests/helpers/release-'+s+'-'+k+'.json.gz')),
 'tests/helpers/release-pointer-bgm-ci.json.gz'];
for(const p of unchanged)assert.deepEqual(raw(p),git('show',base+':'+p),p);
assert.equal(git('diff','--name-only',base,'--','src','scripts','tests/lua').toString(),'','no active runtime/runner/original Lua fixture diff');
const oldTest=path=>git('show',base+':'+path).toString().split("\ntest('only the three")[0];
assert.equal(raw('tests/card-input-slices.test.mjs','utf8').split("\ntest('only the three")[0],oldTest('tests/card-input-slices.test.mjs'));
const receipts={};
let linkedNegatives=0,freshLeafNegatives=0;
for(const [p,row] of Object.entries(packet.files)){
 const current=raw(p,'utf8');
 assert.equal(row.before,norm(git('show',base+':'+p).toString()),p);
 assert.equal(row.beforeGitBlob,git('rev-parse',base+':'+p).toString().trim(),p);
 assert.equal(row.beforeSha256,H(row.before),p);assert.equal(row.afterSha256,H(norm(current)),p);
 const before=integratedSource(p,current,'native');assert.notEqual(before,current,p);
 assert(isCurrentReleaseCiReplay(p,current),p);assert.equal(integratedRead('native')(p).toString(),before);
 for(const bad of [packetPath,producer,'src/lua/abyss_battle_actions.lua'])
  for(const kind of ['drift','missing']){
   let hits=0;
   const read=(q,e)=>{
    if(q!==bad)return raw(q,e);hits++;
    if(kind==='missing')throw Error('independent missing: '+q);
    const data=raw(q,e);
    return typeof data==='string'?data+'\n':Buffer.concat([data,Buffer.from('\n')]);
   };
   assert.throws(()=>integratedSource(p,current,'native',read));
   assert.throws(()=>integratedRead('native',{read})(p));assert.equal(hits,2);
   assert.equal(integratedSource(p,current,'native'),before);
   linkedNegatives+=2;
  }
 for(const kind of ['drift','missing','prior']){
  let hits=0;
  const own=(q,e)=>{
   if(q!==p)return raw(q,e);hits++;
   if(kind==='missing')throw Error('independent missing: '+q);
   const text=kind==='prior'?row.before:raw(q,'utf8')+'\n';
   return e?text:Buffer.from(text);
  };
  assert.throws(()=>assertReleasePotionEnemyCurrent(own),e=>
    e.message.split('\n')[0]===(kind==='missing'?'independent missing: ':'fresh historical input source: ')+p);
  assert.equal(hits,1);freshLeafNegatives++;
 }
 receipts[p]={blob:fixed[p],currentSha256:row.afterSha256,priorSha256:row.beforeSha256};
}
assertReleasePotionEnemyCurrent(raw);
const kept='tests/lua/support/potion_tap_anonymous_safety.lua',rawFixture=raw(kept,'utf8');
assert.equal(integratedSource(kept,rawFixture,'native',()=>{throw Error('must not project live fixture')}),rawFixture);
const liveOriginal='tests/lua/card_input_port.lua';
const matchingLive=raw(liveOriginal,'utf8');const noRead=()=>{throw Error('must not authorize live original fixture')};
assert.equal(integratedSource(liveOriginal,matchingLive,'native',noRead),matchingLive);
console.log(JSON.stringify({scope:'exact CI source and live-only fixture review; no Lua or Full',base,reviewedBlobs:fixed,
 packet:H(archive),receipts,prod:[352,129,88],unchangedFiles:unchanged.length,linkedNegatives,freshLeafNegatives,
 state:'all three executable CI leaves replay text/Buffer only with genuine live sources and exact ancestors'},null,2));
