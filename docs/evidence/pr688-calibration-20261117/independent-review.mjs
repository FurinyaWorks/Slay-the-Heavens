import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {enemyPost697CiPacket as packet,assertEnemyPost697CiCurrent,enemyPost697HistoricalRead,enemyPost697CiSource} from '../../../tests/helpers/enemy-post697-ci-source.mjs';
import {sourceEpoch,sourceSlice} from '../../../tests/helpers/closeout-source-epoch.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),base='1508139e1918af4eeb455e4124241fd927c896b2';let checks=0;
const ok=(fn)=>{fn();checks++;};
const path='tests/ci-complete-calibration.test.mjs';
const repair=JSON.parse(gunzipSync(readFileSync('tests/helpers/enemy-calibration-reader-repair.json.gz'))),row=repair.files[path];
ok(()=>assert.equal(row.before.source,execFileSync('git',['show',base+':'+path],{encoding:'utf8'})));
ok(()=>assert.equal(row.current.source,readFileSync(path,'utf8')));
for(const [view,commit]of Object.entries(packet.viewCommits))ok(()=>assert.equal(row.views[view].source,execFileSync('git',['show',commit+':'+path],{encoding:'utf8'})));
const before=execFileSync('git',['show',base+':'+path],{encoding:'utf8'}),after=readFileSync(path,'utf8');
ok(()=>assert.equal(after.replace("const historicalCiReadFileSync=releaseBootstrapCiRead(rawBootstrapReadFileSync);\n// Authenticate the final current production closure before historical projection.\nconst liveDiskReadFileSync=(path,encoding)=>(path.startsWith('src/')||path==='config/architecture.json'\n ?actualEnemyPost697ReadFileSync:historicalCiReadFileSync)(path,encoding);",'const liveDiskReadFileSync=releaseBootstrapCiRead(rawBootstrapReadFileSync);'),before));
ok(()=>assertEnemyPost697CiCurrent());
for(const target of [path,'src/lua/abyss_game_ui_input.lua','tests/helpers/enemy-calibration-reader-repair.json.gz']){
 for(const kind of ['missing','empty','drift']){
  const read=(p,e)=>{if(p!==target)return readFileSync(p,e);if(kind==='missing')throw Object.assign(Error('missing'),{code:'ENOENT'});const raw=readFileSync(p,e);return kind==='empty'?(e?'':Buffer.alloc(0)):(typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]))};
  ok(()=>assert.throws(()=>assertEnemyPost697CiCurrent(read)));
  ok(()=>assert.throws(()=>enemyPost697CiSource(path,row.current.source,undefined,read)));
  ok(()=>assertEnemyPost697CiCurrent());
 }
}
for(const e of [undefined,'utf8'])ok(()=>{
 const value=enemyPost697HistoricalRead('enemy')(path,e);assert.equal(Buffer.isBuffer(value),e===undefined);assert.equal(value.toString(),row.views.enemy.source);
});
for(const value of ['foreign',row.before.source,undefined,null,Buffer.from('foreign')])ok(()=>{let reads=0;assert.equal(enemyPost697CiSource(path,value,undefined,()=>{reads++;throw Error('unexpected read');}),value);assert.equal(reads,0);});
// The production public projector must authenticate raw final owners on every call.
const proof=sourceEpoch.proof,target='pr620';
const producer=proof.owners.find(p=>proof.targets[target].files[p]&&proof.targets[target].files[p].sha256!==proof.current[p].sha256);
assert(producer);const raw=readFileSync(producer,'utf8');
ok(()=>assert.equal(sourceSlice(producer,raw,target),proof.targets[target].files[producer].source));
for(const kind of ['missing','empty','drift']){
 const live=p=>{if(p!=='src/lua/abyss_game_ui_input.lua')return readFileSync(p,'utf8');if(kind==='missing')throw Object.assign(Error('missing'),{code:'ENOENT'});return kind==='empty'?'':readFileSync(p,'utf8')+'\n';};
 ok(()=>assert.throws(()=>sourceSlice(producer,raw,target,live)));
 ok(()=>assert.equal(sourceSlice(producer,raw,target),proof.targets[target].files[producer].source));
}
console.log(JSON.stringify({checks,base,production: Object.keys(proof.current).length,owners:proof.owners.length,ciFiles:Object.keys(packet.files).length,archives:Object.keys(packet.immutableArchives).length,files:Object.fromEntries(['tests/ci-complete-calibration.test.mjs','tests/helpers/enemy-post697-ci-source.mjs','tests/helpers/enemy-calibration-reader-repair.json.gz'].map(p=>[p,hash(readFileSync(p))]))},null,2));
