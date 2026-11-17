// Explicit continuation of the complete reviewed union and Release domains.
// This trust leaf and its packet are excluded from their own source closure.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./hand-enemy-release-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'69515fa112d60dc9e2b675fc52f052fb273a31ea97a655fbf62a81f88ddd48c7','complete hand enemy Release continuation');
const packed=JSON.parse(gunzipSync(bytes));
assert.equal(packed.storageFormat,'deduplicated-complete-records-v1');
const record=id=>{
 if(id===null)return null;
 assert(typeof id==='string'&&Object.hasOwn(packed.records,id),'complete stored source record');
 const row=packed.records[id];assert.equal(row.sha256,id,'exact stored source identity');return row;
};
const packet={...packed,files:Object.fromEntries(Object.entries(packed.files).map(([path,row])=>[path,{...row,before:record(row.before),current:record(row.current),views:Object.fromEntries(Object.entries(row.views).map(([domain,id])=>[domain,record(id)]))}]))};
delete packet.records;delete packet.storageFormat;
assert.equal(packet.baseCommit,'5bb154a0649b2a5c372f0f08c0f93ee0ec716249');
assert.equal(packet.viewCommits.release,'00ab3fe6d386f55aecfb063e59aeca2cf5065807');
assert.equal(packet.viewCommits.enemyCalibration,'e229f7c4943915e33109e6bdc293c4dd3fcbedc2');
assert.equal(packet.currentTreeCommitted,false);
for(const [path,row]of Object.entries(packet.files))for(const item of [row.before,row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const releaseUnionCiPacket=freeze(packet);
export function assertReleaseUnionCurrent(read=readFileSync){
 assert.equal(hash(read('tests/helpers/hand-enemy-release-ci-source.json.gz')),hash(bytes),'immutable Release union continuation packet');
 for(const [path,row]of Object.entries(packet.files)){
  const raw=read(path,'utf8');assert.equal(typeof raw,'string','fresh complete integration source: '+path);
  assert(!raw.includes('\r\r\n'),'fresh complete integration source: '+path);
  assert.equal(hash(norm(raw)),row.current.sha256,'fresh complete integration source: '+path);
 }
 for(const [path,sha]of Object.entries(packet.archives))assert.equal(hash(read(path)),sha,'immutable Release union predecessor: '+path);
}
// Production history is explicit and independently authenticated. Public CI
// projections below never substitute an older production owner.
export function releaseUnionHistoricalRead(target,read=readFileSync){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit Release union domain');
 return(path,encoding)=>{
  const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
  const text=typeof raw==='string'?raw:raw.toString('utf8'),row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
  if(!row?.views[target]||text.includes('\r\r\n')||hash(norm(text))!==row.current.sha256||row.views[target].sha256===row.current.sha256)return raw;
  assertReleaseUnionCurrent(read);
  const prior=row.views[target].source;return typeof raw==='string'?prior:Buffer.from(prior);
 };
}
export function releaseUnionCiSource(path,source,target,read=readFileSync){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit Release union domain');
 if(path.startsWith('src/')||path==='config/architecture.json'||typeof source!=='string')return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;if(!row?.views[target]||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256||row.views[target].sha256===row.current.sha256)return source;
 assertReleaseUnionCurrent(read);return row.views[target].source;
}
export function releaseUnionPriorInventory(paths,kind='js',target='release',read=readFileSync){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const sorted=[...paths].sort(),prior=packet.viewInventories[target][kind];
 if(JSON.stringify(sorted)===JSON.stringify(prior))return [...paths];
 assert.deepEqual(sorted,packet.currentInventory[kind],'complete Release union raw inventory');
 assertReleaseUnionCurrent(read);return [...prior];
}
