// CI-only exact continuation; production projectors never import this leaf.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./dependency-ci-repair-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'193d80b2c6e97f18fdc26229d9e6f82265560a0d308fabb9a7b8d134a917c8f8','complete dependency CI reader repair');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.baseCommit,'1b60f71c4733ced0c91dc814dc5c7a6644c8fe56');
assert.equal(packet.fixtureCommit,'cfe8a040c1f7e937f1a38c14d6822f44fc6ac717');
assert.equal(packet.currentTreeCommitted,false);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current]){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const dependencyCiRepairPacket=freeze(packet);
export function assertDependencyCiRepairCurrent(read=readFileSync){
 assert.equal(hash(read('tests/helpers/dependency-ci-repair-source.json.gz')),hash(bytes),'fresh complete integration source: dependency reader repair packet');
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: dependency reader repair '+path);
 for(const [path,sha]of Object.entries(packet.archives))assert.equal(hash(read(path)),sha,'fresh complete integration source: retained immutable dependency reader repair '+path);
 for(const [path,sha]of Object.entries(packet.production)){
  const source=norm(read(path,'utf8'));
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex'),sha,'fresh complete integration source: unchanged dependency production '+path);
 }
 const inventory=(dir,extension)=>readdirSync(dir).filter(p=>p.endsWith(extension)).map(p=>dir+'/'+p).sort();
 assert.deepEqual(inventory('tests','.test.mjs'),packet.inventory.js,'fresh complete integration source: dependency repair JS inventory');
 assert.deepEqual(inventory('tests/lua','.lua'),packet.inventory.lua,'fresh complete integration source: dependency repair Lua inventory');
}
export function dependencyCiRepairSource(path,source,{read=readFileSync}={}){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 assertDependencyCiRepairCurrent(read);return row.before.source;
}
export function dependencyCiRepairRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(!Object.hasOwn(packet.files,path)||typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const source=typeof raw==='string'?raw:raw.toString('utf8'),prior=dependencyCiRepairSource(path,source,{read});
 return typeof raw==='string'?prior:prior===source?raw:Buffer.from(prior);
};}
