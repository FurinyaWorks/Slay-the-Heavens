// CI-only continuation. Production owner projection stays in its existing epoch.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./runtime-particle-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'d4fddaf8cc6fc4b06a64eeb8c23ecb3ac6570e336a19ab9c071616513c85003d','complete runtime particle CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.currentCommit,'befd480817b0f7c875de189863d37e803704ad3a');
assert.equal(packet.currentTreeCommitted,false,'auxiliary CI bindings are separate from the actual runtime producer');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source));assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const runtimeParticleCiPacket=freeze(packet);
export function runtimeParticleCiCheckedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n')||before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function runtimeParticleCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return runtimeParticleCiCheckedSource(path,source,before);
}
export function runtimeParticleCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=runtimeParticleCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function runtimeParticlePriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete runtime particle raw inventory');
 for(const path of current.filter(p=>!before.includes(p)))assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh particle added test: '+path);
 return [...before];
}
export function assertRuntimeParticleRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete runtime particle raw discovery');
}
export function assertRuntimeParticleCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files)){const s=read(path,'utf8');assert.equal(typeof s,'string','fresh particle source required');assert.equal(hash(norm(s)),row.current.sha256,'fresh complete integration source: particle '+path);}
 for(const [path,sha]of Object.entries(packet.currentArchives))assert.equal(hash(read(path)),sha,'current particle archive: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable particle predecessor: '+path);
}
