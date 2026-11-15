// Compact historical witness over existing immutable archives, not a live source projector.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync,gzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=readFileSync(new URL('./c240-ci-source-delta.json.gz',import.meta.url));
assert.equal(hash(bytes),'c36f5df9fbffee5ac7de431c1d963a83f1dcb839ecbe29a44a8a1daeba9ba0b7','complete c240 historical delta');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const c240CiDelta=freeze(JSON.parse(gunzipSync(bytes)));
export const c240CiRawSha256='3f8b16b87379d4922c13326783492bca79cb3e9354387b6e8a3aa0f5bb6ebe9a';
const readArchive=name=>readFileSync(new URL('./'+name+'.json.gz',import.meta.url));
export function reconstructC240CiArchive(packet=c240CiDelta,read=readArchive){
 assert.equal(packet.schemaVersion,1);assert.equal(packet.sourceCommit,'c2409ad750c15124b7b843c6bbfa5b222537cb75');
 assert.equal(packet.originalArchiveSha256,'f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35');
 assert.equal(packet.originalRawSha256,c240CiRawSha256);
 assert.deepEqual(packet.refs,c240CiDelta.refs,'exact complete historical archive references');
 const archives={};for(const[name,row]of Object.entries(packet.refs)){
  const source=read(name);assert.equal(hash(source),row.sha256,'fresh historical reference archive: '+name);archives[name]=JSON.parse(gunzipSync(source));
 }
 const reference=ref=>ref.steps.reduce((value,key)=>{assert(value&&Object.hasOwn(value,key),'complete historical reference path');return value[key];},archives[ref.packet]);
 const body={...packet.body};for(const[key,ref]of Object.entries(packet.bodyRefs)){
  const value=reference(ref);body[key]=ref.keys?Object.fromEntries(ref.keys.map(k=>[k,value[k]])):ref.omit?value.filter(p=>!ref.omit.includes(p)):value;
 }
 assert.equal(packet.fileOrder.length,224);assert.equal(new Set(packet.fileOrder).size,224);
 assert.deepEqual(Object.keys(packet.slots),packet.fileOrder,'complete historical file order');
 const bindings=new Map(),binding=sha=>{
  if(sha===null)return null;if(bindings.has(sha))return bindings.get(sha);
  assert(Object.hasOwn(packet.pool,sha),'complete historical source pool');const row=packet.pool[sha];
  const source=Object.hasOwn(row,'source')?row.source:reference(row.ref);
  assert.equal(typeof source,'string');assert.equal(source.replaceAll('\r\n','\n'),source);assert.equal(hash(source),sha,'complete historical source bytes');
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),row.gitBlob,'complete historical source Git blob');
  const result={source,sha256:sha,gitBlob:row.gitBlob};bindings.set(sha,result);return result;
 };
 body.files=Object.fromEntries(packet.fileOrder.map(path=>{
  const row=packet.slots[path];assert.deepEqual(Object.keys(row),['current',...Object.keys(body.sources)],'complete six historical views');
  return[path,{current:binding(row.current),views:Object.fromEntries(Object.keys(body.sources).map(view=>[view,binding(row[view])]))}];
 }));
 const raw=Buffer.from(JSON.stringify(body));assert.equal(hash(raw),c240CiRawSha256,'complete original c240 JSON');
 const archive=gzipSync(raw);archive[9]=packet.gzipOs;assert.equal(hash(archive),packet.originalArchiveSha256,'complete original c240 gzip');
 return{proof:freeze(body),raw,bytes:archive};
}
export const c240CiProof=reconstructC240CiArchive().proof;
