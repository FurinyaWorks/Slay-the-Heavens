import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {potionPost697CiPacket as packet,assertPotionPost697CiCurrent} from '../../../tests/helpers/potion-post697-ci-source.mjs';
import {assertStsStyleCiCurrent} from '../../../tests/helpers/sts-style-ci-source.mjs';
import {discoverJs} from '../../../scripts/ci-shards.mjs';
const base='eabff9b0bf2cce17ae05913c0e5d47366d0ff173',release='af77fb2461c548f0faf104761d107397f75dca08';
const target='tests/sts-style-source-epoch.test.mjs',archive='tests/helpers/potion-post697-ci-sts-repair.json.gz';
const hash=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',args,{maxBuffer:32*1024*1024});
const sourceBind=source=>({source:source.toString('utf8'),sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${source.length}\0`).update(source).digest('hex')});
const repair=JSON.parse(gunzipSync(readFileSync(archive)));
assert.equal(repair.baseCommit,base);assert.equal(repair.currentTreeCommitted,false);
assert.deepEqual(Object.keys(repair.files),[target]);
assert.deepEqual(repair.files[target].before,sourceBind(git('show',base+':'+target)));
assert.deepEqual(repair.files[target].current,sourceBind(readFileSync(target)));
const original=JSON.parse(gunzipSync(readFileSync('tests/helpers/potion-post697-ci-source.json.gz')));
assert.equal(Object.keys(packet.files).length,42);
for(const [path,row]of Object.entries(original.files))assert.deepEqual(packet.files[path].views,row.views,'historical views unchanged: '+path);
const oldArchives={...original.immutableArchives};
for(const path of ['tests/helpers/potion-post697-ci-source.json.gz','tests/helpers/potion-post697-ci-reader-repair.json.gz','tests/helpers/potion-post697-ci-matcher-repair.json.gz'])oldArchives[path]=hash(readFileSync(path));
assert.equal(Object.keys(oldArchives).length,108);assert.equal(Object.keys(packet.immutableArchives).length,109);
for(const [path,sha]of Object.entries(oldArchives)){
 assert.equal(packet.immutableArchives[path],sha,path);
 const old=git('show',base+':'+path),pointer=old.toString().match(/^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize (\d+)\n$/);
 assert.equal(pointer?pointer[1]:hash(old),sha,'old Git archive remains exact: '+path);
 assert.equal(hash(readFileSync(path)),sha,'materialized archive: '+path);
}
assert.deepEqual(discoverJs(),packet.currentInventory.js);
assert.deepEqual(readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort(),packet.currentInventory.lua);
assertPotionPost697CiCurrent();
const releaseWrapper="(p,e)=>{const value=readFileSync(p,e);return p===path?value+'\\n':value;}";
assert(git('show',release+':'+target).toString().includes(releaseWrapper),'reuse actual Release binary preservation');
assert(readFileSync(target,'utf8').includes(releaseWrapper));
const binary='tests/helpers/battle-queue-ci-source-epoch.json.gz',binaryBytes=readFileSync(binary);let seen=0;
const zeroInjection=(p,e)=>{const value=readFileSync(p,e);if(p===binary){assert(Buffer.isBuffer(value));assert.deepEqual(value,binaryBytes);seen++;}return value;};
assertStsStyleCiCurrent(discoverJs(),zeroInjection);assert(seen>0,'zero injection checks the original unrelated gzip as Buffer');
const mutations=[];
for(const path of ['scripts/test-affected.mjs','tests/helpers/closeout-source-epoch.mjs','tests/sts-style-source-epoch.test.mjs']){
 const expected=(path==='scripts/test-affected.mjs'?'fresh complete StS CI source: ':'fresh complete post697 source: ')+path;
 assert.throws(()=>assertStsStyleCiCurrent(discoverJs(),(p,e)=>{const value=readFileSync(p,e);return p===path?value+'\n':value;}),error=>{
  assert(error instanceof assert.AssertionError);assert.equal(error.message.split('\n')[0],expected);mutations.push(expected);return true;
 });
}
assertStsStyleCiCurrent(discoverJs(),zeroInjection);
const report={base,release,bindings:42,oldArchivesUnchanged:108,archives:109,rawJs:packet.currentInventory.js.length,rawLua:packet.currentInventory.lua.length,
 source:sourceBind(readFileSync(target)),helper:sourceBind(readFileSync('tests/helpers/potion-post697-ci-source.mjs')),
 archive:{path:archive,sha256:hash(readFileSync(archive))},mutations,zeroInjectionBinary:binary,releaseWrapperReused:true};
delete report.source.source;delete report.helper.source;
writeFileSync('docs/evidence/pr679-sts-regression-20261117/audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
