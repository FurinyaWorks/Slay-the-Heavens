// CI-only exact continuation. Never imported by production source authorization.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-item-ci-repair-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'a0e4ebb49f81dbf0d59c4f80a0c1e4ed2588eb0051b7397206c6d79265efbbaa','complete item CI repair packet');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.baseCommit,'73da2626d37fb52f90e71cd65838c08a1b9cae7c');
assert.equal(packet.fixtureCommit,'e03736adbe11d6c49a0e07abc5234a9be972e1e8');
assert.equal(packet.currentTreeCommitted,false);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current]){
 assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(binding.source,norm(binding.source),path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
// The new log has no frozen binary predecessor in the historical media manifest.
// Preserve the original packet above, and authorize only removal of its accidental
// whitespace exemption. LFS storage, pointer identity and every old input remain.
export const itemCiRepairHistoricalAttributes=Object.freeze({...packet.files['.gitattributes'].current});
const logAttribute='docs/evidence/release-item-ci-repair-20261116/source-boundary-green.log.gz filter=lfs diff=lfs merge=lfs -text';
assert.equal(itemCiRepairHistoricalAttributes.sha256,'f7702ae2d584225a86ba4b8b5b5858fe4760ebf318ec9d7cffb2cc417bad168b');
assert.equal(itemCiRepairHistoricalAttributes.source.split(logAttribute+' ci-immutable-media\n').length,2);
const correctedAttributes=itemCiRepairHistoricalAttributes.source.replace(logAttribute+' ci-immutable-media\n',logAttribute+'\n');
assert.equal(hash(correctedAttributes),'e64e037b08cb742811832dba786d4846a8d604bb5826f22291bcfa210baca4d2');
packet.files['.gitattributes']={...packet.files['.gitattributes'],current:{source:correctedAttributes,
 sha256:'e64e037b08cb742811832dba786d4846a8d604bb5826f22291bcfa210baca4d2',gitBlob:'c31770e2df91bf2c920abf2d0c9c4bab241834d0'}};
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const itemCiRepairPacket=freeze(packet);
export function itemCiRepairSource(path,source,{read=readFileSync}={}){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 assertItemCiRepairCurrent(read);
 return row.before.source;
}
export function itemCiRepairRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const source=typeof raw==='string'?raw:raw.toString('utf8'),prior=itemCiRepairSource(path,source,{read});
 return typeof raw==='string'?prior:prior===source?raw:Buffer.from(prior);
};}
export function assertItemCiRepairCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: item CI repair '+path);
 for(const [path,sha]of Object.entries(packet.archives))assert.equal(hash(read(path)),sha,'retained immutable item CI repair archive: '+path);
 for(const [path,sha]of Object.entries(packet.production)){
  const source=norm(read(path,'utf8'));
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),sha,'unchanged item CI repair production: '+path);
 }
}
