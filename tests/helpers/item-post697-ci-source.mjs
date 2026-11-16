// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {assertReleaseItemEvidenceCurrent} from '../../scripts/release-item-evidence.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./item-post697-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'5181f98e5a2d89e9cf533a8c2ba42cd8eaacef17e99dfde5d3cc648ea4203618','complete item post697 CI packet');
const atomArchives=Object.freeze({"tests/helpers/integrated-ci-source.json.gz":"f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35","tests/helpers/release-item-ci-repair-source.json.gz":"a0e4ebb49f81dbf0d59c4f80a0c1e4ed2588eb0051b7397206c6d79265efbbaa","tests/helpers/release-item-title-shadow-bootstrap-source.json.gz":"dabab7788653b45eff7f570f2ab2ae3797b40e1d91a5fe9ea0a54d0354a45be8","tests/helpers/release-selection-map-base-source.json.gz":"4678cdb4036cab5217a359657ae15735c7a2af47936ec58067018dd2d53c9dfa","tests/helpers/release-selection-map-ci-before-release1cc-source.json.gz":"ab9597d0237daaf530f609ca6772576e170d0785e1fd66852c7e54800909fd66","tests/helpers/release-selection-map-ci-source.json.gz":"c2aebd6d6748a87026870c3524ea644d10b350ab820da5c4710a24043205ba03"});
// This one packet's storage encoding only. It does not authorize reads.
export function decodeItemPost697Storage(storage,{read=readFileSync}={}){
 assert([1,2].includes(storage.storageSchemaVersion),'item packet storage schema');
 assert.equal(storage.codec,storage.storageSchemaVersion===1?'sha256-exact-utf8':'sha256-exact-utf8-with-archive-sources','item packet storage codec');
 assert.deepEqual(Object.keys(storage).sort(),['codec','packet','sourceTable','storageSchemaVersion']);
 assert.equal(storage.packet?.schemaVersion,1,'item packet semantic schema');
 assert(storage.sourceTable&&typeof storage.sourceTable==='object'&&!Array.isArray(storage.sourceTable));
 const used=new Set(),sources={},archives=new Map();
 for(const [key,atom]of Object.entries(storage.sourceTable)){
  let value=atom;
  if(typeof atom!=='string'){
   assert.equal(storage.storageSchemaVersion,2,'archive atoms require explicit storage schema');
   assert(atom&&typeof atom==='object'&&!Array.isArray(atom),'exact archive source atom');
   assert.deepEqual(Object.keys(atom).sort(),['archive','archiveSha256','jsonPath','kind'],'exact archive source fields');
   assert.equal(atom.kind,'archive-source','explicit immutable archive source atom');
   assert(Object.hasOwn(atomArchives,atom.archive),'known immutable source archive');
   assert.equal(atom.archiveSha256,atomArchives[atom.archive],'fixed immutable source archive identity');
   assert.equal(storage.packet.immutableArchives[atom.archive],atom.archiveSha256,'semantic packet retains referenced archive identity');
   assert(Array.isArray(atom.jsonPath)&&atom.jsonPath.length>0&&atom.jsonPath.length<=8,'bounded exact archive field path');
   if(!archives.has(atom.archive)){
    const raw=read(atom.archive);assert.equal(hash(raw),atom.archiveSha256,'exact referenced archive bytes');
    archives.set(atom.archive,JSON.parse(gunzipSync(raw)));
   }
   value=archives.get(atom.archive);
   for(const part of atom.jsonPath){
    assert(typeof part==='string'&&part!==''&&!['__proto__','constructor','prototype'].includes(part),'ordinary exact archive field');
    assert(value&&typeof value==='object'&&Object.hasOwn(value,part),'existing exact archive field');value=value[part];
   }
  }

  assert.equal(typeof value,'string','source table exact UTF8 text');
  assert.equal(Buffer.from(value,'utf8').toString('utf8'),value,'source table UTF8 roundtrip');
  assert.equal(hash(value),key,'source table same-hash bytes');sources[key]=value;
 }
 const binding=b=>{
  if(b===null)return null;
  assert(b&&typeof b==='object'&&!Array.isArray(b),'explicit binding or null');
  assert.deepEqual(Object.keys(b).sort(),['gitBlob','sha256','sourceKey']);
  assert.equal(b.sourceKey,b.sha256,'binding source reference hash');
  assert(Object.hasOwn(storage.sourceTable,b.sourceKey),'binding source reference exists');
  const source=sources[b.sourceKey];used.add(b.sourceKey);
  assert.equal(hash(source),b.sha256,'decoded binding exact hash');
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),b.gitBlob,'decoded binding exact Git blob');
  return{source,sha256:b.sha256,gitBlob:b.gitBlob};
 };
 const files=Object.fromEntries(Object.entries(storage.packet.files).map(([path,row])=>{
  assert(row&&typeof row==='object'&&!Array.isArray(row),'exact post697 source row object');
  assert.deepEqual(Object.keys(row).sort(),['current','views'],'exact post697 source row fields');
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
assert.deepEqual(packet.viewCommits,{release:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9',item:'16cf4a2e862ccfa0eaed06c5cf11cb8546e6095f'});
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
 assertReleaseItemEvidenceCurrent(read);
 const fresh=(path,encoding,label)=>{
  let raw;try{raw=read(path,encoding);}catch(error){assert.fail(label+path+': '+String(error?.message??error));}
  assert(encoding?typeof raw==='string':Buffer.isBuffer(raw),label+path+' exact input type');return raw;
 };
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(fresh(path,'utf8','fresh complete integration source: item post697 '))),row.current.sha256,'fresh complete integration source: item post697 '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(fresh(path,undefined,'immutable post697 predecessor: ')),sha,'immutable post697 predecessor: '+path);
 for(const [path,oid]of Object.entries(packet.production)){
  const text=norm(fresh(path,'utf8','fresh complete post697 production: '));
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex'),oid,'fresh complete post697 production: '+path);
 }
}
