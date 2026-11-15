// CI-only trust leaf; production and isolated production copies never import it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./mobile-forethought-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'4c0fd333e6fbc56a2e34ff0029cc46d5ec8753119ae7e5da5d0633cf0f22f932','complete mobile forethought CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'f564aea6a3c517b71a85534a81be5e2e36278baf');
assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.deepEqual(packet.prerequisites,['f564aea6a3c517b71a85534a81be5e2e36278baf']);
assert.equal(packet.currentCommit,'c590b6c129a305cf68de15c5c264b0f45e4c7b9b');
assert.equal(packet.currentTreeCommitted,false,'auxiliary after bindings are captured separately from the product commit');
for(const [path,row]of Object.entries(packet.files))assert.equal(row.beforeCommit,packet.baseCommit,'exact forethought CI predecessor: '+path);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const mobileForethoughtCiPacket=freeze(packet);
function checkedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
// Only the explicit complete-CI validator may compare a production owner's
// freshly checked after binding with its immutable CI predecessor record.
export const mobileForethoughtCiCheckedSource=checkedSource;
export function mobileForethoughtCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return checkedSource(path,source,before);
}
export function mobileForethoughtCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=mobileForethoughtCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
// Explicit before-forethought epoch only; never use as the current entry.
export function mobileForethoughtHistoricalRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checkedSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function mobileForethoughtPriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 // Older complete receipt inventories have already left this outer layer.
 // Their own immutable validators retain the original missing/duplicate checks.
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete mobile forethought raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of current.filter(p=>!before.includes(p)))
  assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh mobile forethought added inventory source: '+path);
 return [...before];
}
export function assertMobileForethoughtRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete mobile forethought raw discovery inventory');
}
export function assertMobileForethoughtCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: mobile forethought '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable release predecessor: '+path);
}
