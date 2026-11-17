// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./potion-post697-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'d420bd70be20294eb58edc4b87f61b83c4117e3a444b0c9d1546534e325d9ce7','complete potion post697 CI packet');
const originalPacket=JSON.parse(gunzipSync(bytes));
// Preserve the complete original packet and extend only the two authentic CI
// consumers whose readers mixed current and historical production generations.
const repairBytes=readFileSync(new URL('./potion-post697-ci-reader-repair.json.gz',import.meta.url));
assert.equal(hash(repairBytes),'305056f42d38fc13913304ed356475dbf464e53c9b8e2fec8a79339e2993fe27','complete post697 CI reader repair');
const repair=JSON.parse(gunzipSync(repairBytes));
assert.equal(repair.schemaVersion,1);assert.equal(repair.baseCommit,'10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0');
assert.equal(repair.currentTreeCommitted,false,'reader repair capture is separate from committed product');
assert.deepEqual(Object.keys(repair.files),['tests/ci-complete-calibration.test.mjs','tests/session-menu-navigation.test.mjs']);
const files={...originalPacket.files};
for(const [path,row]of Object.entries(repair.files)){
 assert.deepEqual(row.before,originalPacket.files[path].current,'exact original post697 CI reader: '+path);
 for(const item of [row.before,row.current]){
  assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
 }
 files[path]={...originalPacket.files[path],current:row.current};
}
// Preserve both prior packets; bind the matcher continuation to its exact source.
const matcherBytes=readFileSync(new URL('./potion-post697-ci-matcher-repair.json.gz',import.meta.url));
assert.equal(hash(matcherBytes),'b93106ecdc798c4b9e266af10886b651ece625cdc477006c22253bb5b6703fcc','complete post697 CI matcher repair');
const matcher=JSON.parse(gunzipSync(matcherBytes));
assert.equal(matcher.schemaVersion,1);assert.equal(matcher.baseCommit,'93b94277b26d7ea54399e296bbd6596d345f037f');
assert.equal(matcher.currentTreeCommitted,false,'matcher capture is separate from committed product');
assert.deepEqual(Object.keys(matcher.files),['tests/integrated-ci-source.cases.mjs']);
for(const [path,row]of Object.entries(matcher.files)){
 assert.deepEqual(row.before,files[path].current,'exact pre-matcher source: '+path);
 for(const item of [row.before,row.current]){
  assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
 }
 files[path]={...files[path],current:row.current};
}
// Preserve every predecessor; this continuation repairs only the StS consumer.
const stsBytes=readFileSync(new URL('./potion-post697-ci-sts-repair.json.gz',import.meta.url));
assert.equal(hash(stsBytes),'f6ae4d3f79372323d87be3f2da5945a82b3d5b782018d7c69d68798bbcdeaf4a','complete post697 StS CI repair');
const sts=JSON.parse(gunzipSync(stsBytes));
assert.equal(sts.schemaVersion,1);assert.equal(sts.baseCommit,'eabff9b0bf2cce17ae05913c0e5d47366d0ff173');
assert.equal(sts.currentTreeCommitted,false,'StS capture is separate from committed product');
assert.deepEqual(Object.keys(sts.files),['tests/sts-style-source-epoch.test.mjs']);
for(const [path,row]of Object.entries(sts.files)){
 assert.deepEqual(row.before,files[path].current,'exact pre-repair StS source: '+path);
 for(const item of [row.before,row.current]){
  assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
 }
 files[path]={...files[path],current:row.current};
}
const packet={...originalPacket,files,immutableArchives:{...originalPacket.immutableArchives,
 'tests/helpers/potion-post697-ci-source.json.gz':hash(bytes),
 'tests/helpers/potion-post697-ci-reader-repair.json.gz':hash(repairBytes),
 'tests/helpers/potion-post697-ci-matcher-repair.json.gz':hash(matcherBytes),
 'tests/helpers/potion-post697-ci-sts-repair.json.gz':hash(stsBytes)}};
assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.viewCommits,{potion:'3e96a1589435f8b06645db095775a789f24b1350',selection:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9'});
assert.equal(packet.productCommit,'a9df9dff11779cb1d850dc97b715c711881cf9c6');
for(const [path,row]of Object.entries(packet.files))for(const item of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const potionPost697CiPacket=freeze(packet);
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit post697 history domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,view=row?.views[target];
 // Already-historical and unchanged sources gain no authorization and remain
 // byte-for-byte raw, including CRLF and binary callers handled by the reader.
 if(!view||view.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==view.sha256)return source;
 return hash(norm(source))===row.current.sha256?view.source:source;
}
// Only assertIntegratedCurrent calls this private comparison, after authenticating
// the whole declared current corpus with the same raw reader.
export const potionPost697CiCheckedSource=(path,source,before)=>checked(path,source,'potion',before);
export function potionPost697CiSource(path,source,before,read=readFileSync,target='potion'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertPotionPost697CiCurrent(read);
 return prior;
}
export function potionPost697CiRead(read=readFileSync,target='potion'){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=potionPost697CiSource(path,text,undefined,read,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function potionPost697HistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertPotionPost697CiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function potionPost697PriorInventory(paths,kind='js',read=readFileSync,target='potion'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const before=packet.viewInventories[target][kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete post697 current raw inventory');
 assertPotionPost697CiCurrent(read);
 return [...before];
}
export function assertPotionPost697RawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete post697 raw discovery inventory');
}
export function assertPotionPost697CiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete post697 source: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable post697 predecessor: '+path);
}
