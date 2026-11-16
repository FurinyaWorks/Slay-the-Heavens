// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./intent-post697-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'fac6548cf310122e0e40e236edd7a616fbab245e573219ca1ce66bb3c89462fc','complete intent post697 CI packet');
const originalPacket=JSON.parse(gunzipSync(bytes));
// Preserve the original Release/intent domains; extend only exact CI consumers.
const repairBytes=readFileSync(new URL('./intent-post697-ci-reader-repair.json.gz',import.meta.url));
assert.equal(hash(repairBytes),'e96bfcf7bddb340fa596f9dab4807be383f10a4a6d7eb331692f0856bf66f4d6','complete intent post697 CI reader repair');
const repair=JSON.parse(gunzipSync(repairBytes));
assert.equal(repair.schemaVersion,1);assert.equal(repair.normalization,'LF');
assert.equal(repair.baseCommit,'d0de2f65454c307f7048bcceac86400dbb40fb35');
assert.equal(repair.currentTreeCommitted,false,'CI reader capture does not change committed production');
assert.deepEqual(Object.keys(repair.files),['tests/ci-complete-calibration.test.mjs','tests/defect-final-source-epoch.test.mjs','tests/encounter-formation-source-epoch.test.mjs','tests/sts-style-source-epoch.test.mjs']);
const addedBeforeGit={'tests/defect-final-source-epoch.test.mjs':'072e6fd3f0ed3ef7d797b221329c91fdfc1200e7','tests/encounter-formation-source-epoch.test.mjs':'d137ae680404eb393544e301c08d0b1f7589afb6'},files={...originalPacket.files};
for(const [path,row]of Object.entries(repair.files)){
 if(Object.hasOwn(originalPacket.files,path)){
  assert.deepEqual(row.before,originalPacket.files[path].current,'complete original intent consumer: '+path);
  assert.deepEqual(row.views,originalPacket.files[path].views,'immutable original intent history: '+path);
 }else assert.equal(row.before.gitBlob,addedBeforeGit[path],'original committed test reader: '+path);
 assert.deepEqual(Object.keys(row.views),Object.keys(originalPacket.viewCommits),'complete original Release/intent domains');
 for(const item of [row.before,row.current,...Object.values(row.views)]){
  assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
 }
 files[path]={current:row.current,views:row.views};
}
const packet={...originalPacket,files,immutableArchives:{...originalPacket.immutableArchives,
 'tests/helpers/intent-post697-ci-source.json.gz':hash(bytes),
 'tests/helpers/intent-post697-ci-reader-repair.json.gz':hash(repairBytes)}};
assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.viewCommits,{release:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9',intent:'f448a9df48054f49af792312cd866c03b53b0197'});
assert.equal(packet.productCommit,'38efba8119e3b812d530e32915907ef842bcafae');
for(const [path,row]of Object.entries(packet.files))for(const item of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const intentPost697CiPacket=freeze(packet);
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit post697 history domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,view=row?.views[target];
 // Already-historical and unchanged sources gain no authorization and remain
 // byte-for-byte raw, including CRLF and binary callers handled by the reader.
 if(!view||view.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==view.sha256)return source;
 return hash(norm(source))===row.current.sha256?view.source:source;
}
export function intentPost697CiSource(path,source,before,read=readFileSync,target='release'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertIntentPost697CiCurrent(read);
 return prior;
}
export function intentPost697CiRead(read=readFileSync,target='release'){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=intentPost697CiSource(path,text,undefined,read,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function intentPost697HistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertIntentPost697CiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function intentPost697PriorInventory(paths,kind='js',read=readFileSync,target='release'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const before=packet.viewInventories[target][kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete post697 current raw inventory');
 assertIntentPost697CiCurrent(read);
 return [...before];
}
export function assertIntentPost697RawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete post697 raw discovery inventory');
}
export function assertIntentPost697CiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete intent post697 source: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable post697 predecessor: '+path);
}
