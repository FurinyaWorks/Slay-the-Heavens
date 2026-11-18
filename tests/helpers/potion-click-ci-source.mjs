// CI-only sparse leaf; never imported by production or isolated production copies.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./potion-click-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'f4f85ac76b7d5682dcede88f5cb3215206327e4176221d67c7e31296b803760f','complete potion click CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'89dfc774b1c6bb146b91e6064039f4d648db0d33');
assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.deepEqual(packet.prerequisites,[packet.baseCommit]);
assert.equal(packet.currentCommit,'c126877c31b37396b6148e1101a8dba555d03feb');
assert.equal(packet.currentTreeCommitted,false,'auxiliary capture is separate from the committed product');
assert.deepEqual(packet.currentInventory,packet.priorInventory,'no raw discovery additions or losses');
for(const [path,row]of Object.entries(packet.files)){
 assert.equal(row.beforeCommit,packet.baseCommit);
 for(const binding of [row.before,row.current].filter(Boolean)){
  assert.equal(binding.source,norm(binding.source));assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const potionClickCiPacket=freeze(packet);
export function potionClickCiCheckedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function potionClickCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return potionClickCiCheckedSource(path,source,before);
}
// Explicit historical epoch only, including production; raw guards use the actual reader.
export function potionClickHistoricalRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 // Authenticate the entire fresh corpus before exposing any historical bytes.
 // Unknown/already-historical bytes remain raw and gain no authorization.
 if(row?.before&&row.before.sha256!==row.current.sha256&&hash(norm(text))===row.current.sha256)
  assertPotionClickCiCurrent(read);
 const prior=potionClickCiCheckedSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function assertPotionClickRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete potion click raw discovery inventory');
}
export function assertPotionClickCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: potion click '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable click predecessor: '+path);
}
