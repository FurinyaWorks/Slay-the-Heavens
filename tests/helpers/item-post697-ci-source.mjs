// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./item-post697-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'6785f5fb56a5117f88d611319ff0322b0501141e8b231f93fbd24c156bacb40f','complete item post697 CI packet');
// This one packet's storage encoding only. It does not authorize reads.
export function decodeItemPost697Storage(storage){
 assert.equal(storage.storageSchemaVersion,1,'item packet storage schema');
 assert.equal(storage.codec,'sha256-exact-utf8','item packet storage codec');
 assert.deepEqual(Object.keys(storage).sort(),['codec','packet','sourceTable','storageSchemaVersion']);
 assert.equal(storage.packet?.schemaVersion,1,'item packet semantic schema');
 assert(storage.sourceTable&&typeof storage.sourceTable==='object'&&!Array.isArray(storage.sourceTable));
 const used=new Set();
 for(const [key,value]of Object.entries(storage.sourceTable)){
  assert.equal(typeof value,'string','source table exact UTF8 text');
  assert.equal(Buffer.from(value,'utf8').toString('utf8'),value,'source table UTF8 roundtrip');
  assert.equal(hash(value),key,'source table same-hash bytes');
 }
 const binding=b=>{
  if(b===null)return null;
  assert(b&&typeof b==='object'&&!Array.isArray(b),'explicit binding or null');
  assert.deepEqual(Object.keys(b).sort(),['gitBlob','sha256','sourceKey']);
  assert.equal(b.sourceKey,b.sha256,'binding source reference hash');
  assert(Object.hasOwn(storage.sourceTable,b.sourceKey),'binding source reference exists');
  const source=storage.sourceTable[b.sourceKey];used.add(b.sourceKey);
  assert.equal(hash(source),b.sha256,'decoded binding exact hash');
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),b.gitBlob,'decoded binding exact Git blob');
  return{source,sha256:b.sha256,gitBlob:b.gitBlob};
 };
 const files=Object.fromEntries(Object.entries(storage.packet.files).map(([path,row])=>{
  assert(Object.hasOwn(row,'current')&&row.current!==null&&Object.hasOwn(row,'views'),'complete current and history record');
  assert.deepEqual(Object.keys(row.views).sort(),Object.keys(storage.packet.viewCommits).sort(),'explicit null or exact history domain');
  return[path,{current:binding(row.current),views:Object.fromEntries(Object.entries(row.views).map(([name,value])=>[name,binding(value)]))}];
 }));
 assert.deepEqual([...used].sort(),Object.keys(storage.sourceTable).sort(),'no unreferenced source atoms');
 return{...storage.packet,files};
}
const stored=JSON.parse(gunzipSync(bytes));
const packet=decodeItemPost697Storage(stored);

assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.viewCommits,{release:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9',item:'68a17f53dd4e8ebd72f6dc146ddc1652eb8b8cdd'});
assert.equal(packet.productCommit,'249adac4baec43183e8c81fecda6047656b564c4');
for(const [path,row]of Object.entries(packet.files))for(const item of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const itemPost697StoredPacket=freeze(stored);
export const itemPost697CiPacket=freeze(packet);
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit post697 history domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,view=row?.views[target];
 // Already-historical and unchanged sources gain no authorization and remain
 // byte-for-byte raw, including CRLF and binary callers handled by the reader.
 if(!view||view.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==view.sha256)return source;
 return hash(norm(source))===row.current.sha256?view.source:source;
}
export function itemPost697CiSource(path,source,before,read=readFileSync,target='release'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertItemPost697CiCurrent(read);
 return prior;
}
export function itemPost697CiRead(read=readFileSync,target='release'){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=itemPost697CiSource(path,text,undefined,read,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function itemPost697HistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertItemPost697CiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function itemPost697PriorInventory(paths,kind='js',read=readFileSync,target='release'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const before=packet.viewInventories[target][kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete post697 current raw inventory');
 assertItemPost697CiCurrent(read);
 return [...before];
}
export function assertItemPost697RawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete post697 raw discovery inventory');
}
export function assertItemPost697CiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete item post697 source: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable post697 predecessor: '+path);
}
