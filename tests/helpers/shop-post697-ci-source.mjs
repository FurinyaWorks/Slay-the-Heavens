// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./shop-post697-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'28f9a0ae8811ffeff2b967a5df982e943de70e49b251b1affe5cccddc13bb823','complete shop post697 CI packet');
const originalPacket=JSON.parse(gunzipSync(bytes));
// Separate exact auxiliary consumer continuation; original evidence stays intact.
const repairBytes=readFileSync(new URL('./shop-post697-ci-reader-repair.json.gz',import.meta.url));
assert.equal(hash(repairBytes),'1849c6b5f7f93ecf6941c9d7731ebd36ae9ab8960ed8ef21437e5f6092788e37','complete shop post697 CI reader repair');
const repair=JSON.parse(gunzipSync(repairBytes));
assert.equal(repair.schemaVersion,1);assert.equal(repair.baseCommit,'ad3a53cb3eb87fbad4ae015d11ea870deb6d5db1');
assert.equal(repair.currentTreeCommitted,false,'reader repair capture is separate from committed product');
assert.deepEqual(Object.keys(repair.files),['tests/ci-complete-calibration.test.mjs','tests/defect-final-source-epoch.test.mjs','tests/encounter-formation-source-epoch.test.mjs','tests/sts-style-source-epoch.test.mjs']);
const addedBeforeGit={"tests/defect-final-source-epoch.test.mjs":"072e6fd3f0ed3ef7d797b221329c91fdfc1200e7","tests/encounter-formation-source-epoch.test.mjs":"d137ae680404eb393544e301c08d0b1f7589afb6"},files={...originalPacket.files};
for(const [path,row]of Object.entries(repair.files)){
 if(Object.hasOwn(originalPacket.files,path)){
  assert.deepEqual(row.before,originalPacket.files[path].current,'exact original shop post697 CI reader: '+path);
  assert.deepEqual(row.views,originalPacket.files[path].views,'immutable original reader history: '+path);
 }else assert.equal(row.before.gitBlob,addedBeforeGit[path],'original committed test reader: '+path);
 assert.deepEqual(Object.keys(row.views),Object.keys(originalPacket.viewCommits),'both exact original reader domains');
 for(const item of [row.before,row.current,...Object.values(row.views)]){
  assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
 }
 files[path]={current:row.current,views:row.views};
}
const packet={...originalPacket,files,immutableArchives:{...originalPacket.immutableArchives,
 'tests/helpers/shop-post697-ci-source.json.gz':hash(bytes),
 'tests/helpers/shop-post697-ci-reader-repair.json.gz':hash(repairBytes)}};
assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.viewCommits,{release:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9',shop:'d9cc12bfc0e620847afa10c7e5c515d748b8ccc3'});
assert.equal(packet.productCommit,'5e2375f03a9a80d2abc8420ab7a401e89d525add');
for(const [path,row]of Object.entries(packet.files))for(const item of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const shopPost697CiPacket=freeze(packet);
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit post697 history domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,view=row?.views[target];
 // Already-historical and unchanged sources gain no authorization and remain
 // byte-for-byte raw, including CRLF and binary callers handled by the reader.
 if(!view||view.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==view.sha256)return source;
 return hash(norm(source))===row.current.sha256?view.source:source;
}
export function shopPost697CiSource(path,source,before,read=readFileSync,target='release'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertShopPost697CiCurrent(read);
 return prior;
}
export function shopPost697CiRead(read=readFileSync,target='release'){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=shopPost697CiSource(path,text,undefined,read,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function shopPost697HistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertShopPost697CiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function shopPost697PriorInventory(paths,kind='js',read=readFileSync,target='release'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const before=packet.viewInventories[target][kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete post697 current raw inventory');
 assertShopPost697CiCurrent(read);
 return [...before];
}
export function assertShopPost697RawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete post697 raw discovery inventory');
}
export function assertShopPost697CiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete shop post697 source: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable post697 predecessor: '+path);
}
