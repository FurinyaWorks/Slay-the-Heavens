// Append-only performance/capacity CI checkpoint; every earlier packet is immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./perf-final-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'4c4d9ecb9f64c66cc5fbca4c84c3017e60c3908ca0fcda05b84cb6e9ee1aab56','complete performance CI checkpoint');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'1f7ce04c53189db8c39b59c797a45d57a2c7bac1');
assert.equal(packet.currentCommit,'be41ed0b07c593d08ff4a75686f99033571830df');
for(const [path,sha]of Object.entries(packet.immutablePackets))assert.equal(hash(readFileSync(new URL('./'+path,import.meta.url))),sha,'retained complete prior packet: '+path);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const perfFinalCiPacket=freeze(packet);
export function perfFinalCiSource(path,source){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(typeof source!=='string'||source.includes('\r\r\n')||!row?.before)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function perfFinalCurrentInventory(base,kind){
 assert(['js','lua'].includes(kind));
 const sorted=[...base].sort();
 if(JSON.stringify(sorted)!==JSON.stringify(packet.currentInventory[kind]))assert.deepEqual(sorted,packet.priorInventory[kind],'complete pre-performance raw inventory');
 return [...packet.currentInventory[kind]];
}
export function perfFinalPriorInventory(paths,kind,read){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],added=current.filter(path=>!before.includes(path));
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),current,'complete performance raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of added)assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh appended raw test source: fresh performance raw test source: '+path);
 return [...before];
}
export function assertPerfFinalCiCurrent(read){
 for(const [path,row]of Object.entries(packet.files)){
  const category=['tests/item-semantic-icons-source.test.mjs','tests/potion-art-runtime.test.mjs','tests/potion-art.test.mjs'].includes(path)?'added inventory source':/^tests\/helpers\/(potion-art-runtime|reward-art-runtime)\.lua$/.test(path)?'runtime support source':'complete integration source';
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh '+category+': fresh appended CI source: fresh performance CI source: '+path);
 }
}
