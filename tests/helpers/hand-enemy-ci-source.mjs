// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {releaseUnionCiPacket,assertReleaseUnionCurrent} from './hand-enemy-release-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./hand-enemy-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'846739b2262bae6420518f67c4515d01f3942fd64de0ebea71fa38d60d5d5eba','complete hand enemy CI packet');
const originalPacket=JSON.parse(gunzipSync(bytes));
const successorBytes=readFileSync(new URL('./hand-enemy-successor-ci.json.gz',import.meta.url));
assert.equal(hash(successorBytes),'4a54b03723289875f50c5e4b9e3ecacac42486dcc3dceaba3097edccbefe0fa4','complete hand enemy successor packet');
const successor=JSON.parse(gunzipSync(successorBytes));
assert.equal(successor.schemaVersion,1);
assert.equal(successor.baseCommit,'e3ba2c96bb5f57959b24b817a5df7b325cfa1afb');
assert.equal(successor.successorCommit,'1508139e1918af4eeb455e4124241fd927c896b2');
assert.equal(successor.currentTreeCommitted,false);
assert.deepEqual(Object.keys(successor.files),["scripts/test-lua.mjs", "tests/enemy-geometry-metrics.test.mjs", "tests/helpers/enemy-post697-ci-source.mjs", "tests/sts-style-source-epoch.test.mjs"]);
const files={...originalPacket.files};
for(const [path,row]of Object.entries(successor.files)){
 assert(row.before&&row.current,'complete successor before/current');
 assert.deepEqual(Object.keys(row.views),Object.keys(originalPacket.viewCommits),'complete successor historical domains');
 if(files[path]){assert.deepEqual(row.before,files[path].current);assert.deepEqual(row.views,files[path].views);}
 else assert.equal(row.before.gitBlob,'059255988db003a7eab7e49a9245cccb82d71577');
 for(const item of [row.before,row.current,...Object.values(row.views)].filter(Boolean)){
  assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob);
 }
 files[path]={current:row.current,views:row.views};
}
for(const [path,row]of Object.entries(releaseUnionCiPacket.files)){
 if(files[path]){
  assert.deepEqual(row.before,files[path].current,'exact reviewed union continuation predecessor: '+path);
  for(const [target,view]of Object.entries(files[path].views))assert.deepEqual(row.views[target],view,'immutable original union history: '+path);
  files[path]={current:row.current,views:files[path].views};
 }
}
const packet={...originalPacket,files,currentInventory:releaseUnionCiPacket.currentInventory,immutableArchives:{...originalPacket.immutableArchives,
 'tests/helpers/hand-enemy-ci-source.json.gz':hash(bytes),
 'tests/helpers/hand-enemy-successor-ci.json.gz':hash(successorBytes),
 'tests/helpers/enemy-post697-ci-reader-repair.json.gz':'6498b91931c1d214c61d687ae5be3ec1816e0e1bb1685b414388f90dc1a45818'}};
assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.viewCommits,{"hand": "e259ca49be9d2e3b3526a5efa762814ef96df1c9", "enemy": "4d40bdac703c80e51054d551f1512ff02fc0adbc"});
assert.equal(packet.productCommit,'dff8e86a26f1b309f21bcc5999c2c1f750da3208');
for(const [path,row]of Object.entries(packet.files))for(const item of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const handEnemyCiPacket=freeze(packet);
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit hand enemy history domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:Object.hasOwn(releaseUnionCiPacket.files,path)?releaseUnionCiPacket.files[path]:null,view=row?.views[target];
 // Already-historical and unchanged sources gain no authorization and remain
 // byte-for-byte raw, including CRLF and binary callers handled by the reader.
 if(!view||view.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==view.sha256)return source;
 return hash(norm(source))===row.current.sha256?view.source:source;
}
export function handEnemyCiSource(path,source,before,read=readFileSync,target='hand'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertHandEnemyCiCurrent(read);
 return prior;
}
export function handEnemyCiRead(read=readFileSync,target='hand'){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=handEnemyCiSource(path,text,undefined,read,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function handEnemyHistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertHandEnemyCiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function handEnemyPriorInventory(paths,kind='js',read=readFileSync,target='hand'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const before=packet.viewInventories[target][kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete hand enemy current raw inventory');
 assertHandEnemyCiCurrent(read);
 return [...before];
}
export function assertHandEnemyRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete hand enemy raw discovery inventory');
}
export function assertHandEnemyCiCurrent(read=readFileSync){
 assertReleaseUnionCurrent(read);
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete hand enemy source: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable hand enemy predecessor: '+path);
}
