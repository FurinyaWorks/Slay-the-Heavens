// Preparatory dual-joint CI boundary. Not wired into active PR consumers.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./690-outer-packet.json.gz',import.meta.url));
assert.equal(hash(bytes),'5ea1032ae83e2800323a6a8d4d5778c9d44b1e3f8e2f14bb5f1c1c0b0341d8d8','exact staged dual-joint packet');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const packet=freeze(JSON.parse(gunzipSync(bytes)));
assert.equal(packet.schemaVersion,1);assert.equal(packet.status,'staging-consumers-not-integrated');
assert.deepEqual(packet.inputs,{navigation:'cd9106c0e302cb50f83ba8b5c85ce81560c6ed88',pc22:'b9bca884ed9b9831965b409885d78f719b9a567a'});
for(const [id,s]of Object.entries(packet.sources)){assert.equal(s,norm(s));assert.equal(hash(s),id);}
for(const row of Object.values(packet.files)){
 assert.deepEqual(Object.keys(row).sort(),['current','views']);assert(Object.hasOwn(packet.sources,row.current));
 assert.deepEqual(Object.keys(row.views).sort(),['navigation','pc22']);
 for(const id of Object.values(row.views))assert(id===null||Object.hasOwn(packet.sources,id));
}
export function assertCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files)){
  const raw=read(path,'utf8');assert.equal(typeof raw,'string','fresh joint source type: '+path);
  assert(!raw.includes('\r\r\n'),'malformed joint newlines: '+path);
  assert.equal(hash(norm(raw)),row.current,'fresh joint source: '+path);
 }
 for(const [path,id]of Object.entries(packet.archives))assert.equal(hash(read(path)),id,'immutable joint archive: '+path);
}
const production=path=>path.startsWith('src/')||path==='config/architecture.json';
function project(path,source,side,read,allowProduction){
 assert(Object.hasOwn(packet.inputs,side),'known prior joint side');
 if(production(path)&&!allowProduction)return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current)return source;
 const id=row.views[side];
 // Absent historical files are not synthesized, and must not authorize a view.
 if(id===null)return source;
 assertCurrent(read);
 return packet.sources[id];
}
export const ciSource=(path,source,side,read=readFileSync)=>project(path,source,side,read,false);
export function jointRead(side,read=readFileSync,{productionView=false}={}){
 assert(Object.hasOwn(packet.inputs,side),'known prior joint side');
 return(path,encoding)=>{
  const raw=read(path,encoding);
  if(typeof raw==='string')return project(path,raw,side,read,productionView);
  if(encoding||!Buffer.isBuffer(raw))return raw;
  const source=raw.toString('utf8');if(!Buffer.from(source).equals(raw))return raw;
  const prior=project(path,source,side,read,productionView);
  return prior===source?raw:Buffer.from(prior);
 };
}
