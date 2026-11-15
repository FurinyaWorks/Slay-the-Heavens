// New append-only CI checkpoint. The three earlier packets remain immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {perfFinalCiSource,perfFinalCurrentInventory,perfFinalPriorInventory,assertPerfFinalCiCurrent} from './perf-final-ci-source.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./pc-after-fix-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'e3b0a221e1e9a19975924f88fae49c797a55260575a221480f4b6d83c4e5fc37','complete appended CI checkpoint');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.match(packet.currentCommit,/^[a-f0-9]{40}$/);
for(const [path,sha]of Object.entries(packet.immutablePackets))assert.equal(hash(readFileSync(new URL('./'+path,import.meta.url))),sha,'retained complete prior packet: '+path);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
for(const target of Object.values(packet.historicalBindings)){
 assert.match(target.commit,/^[a-f0-9]{40}$/);
 for(const [path,row]of Object.entries(target.files))for(const binding of [row.current,row.historical]){
  assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
 }
}
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const pcAfterFixCiPacket=freeze(packet);
export function pcAfterFixHistoricalCiSource(path,source,view){
 const target=Object.hasOwn(packet.historicalBindings,view)?packet.historicalBindings[view]:null;
 const row=target&&Object.hasOwn(target.files,path)?target.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n'))return source;
 source=perfFinalCiSource(path,source);
 return hash(norm(source))===row.current.sha256?row.historical.source:source;
}
export function pcAfterFixCiSource(path,source){
 source=perfFinalCiSource(path,source);
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(typeof source!=='string'||source.includes('\r\r\n')||!row?.before)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function pcAfterFixCurrentInventory(base,kind){
 assert(['js','lua'].includes(kind));
 const sorted=[...base].sort();
 if(JSON.stringify(sorted)!==JSON.stringify(packet.currentInventory[kind]))assert.deepEqual(sorted,packet.priorInventory[kind],'complete pre-fix raw inventory');
 return perfFinalCurrentInventory(packet.currentInventory[kind],kind);
}
export function pcAfterFixPriorInventory(paths,kind,read){
 paths=perfFinalPriorInventory(paths,kind,read);
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],added=current.filter(path=>!before.includes(path));
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),current,'complete final appended raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of added)assert.equal(hash(norm(perfFinalCiSource(path,read(path,'utf8')))),packet.files[path].current.sha256,'fresh appended raw test source: '+path);
 return [...before];
}
export function assertPcAfterFixCiCurrent(read){
 assertPerfFinalCiCurrent(read);
 for(const target of Object.values(packet.historicalBindings))for(const [path,row]of Object.entries(target.files))assert.equal(hash(norm(perfFinalCiSource(path,read(path,'utf8')))),row.current.sha256,'fresh appended historical CI source: '+path);
 for(const [path,row]of Object.entries(packet.files)){
  const category=['tests/item-semantic-icons-source.test.mjs','tests/potion-art-runtime.test.mjs','tests/potion-art.test.mjs'].includes(path)?'added inventory source':/^tests\/helpers\/(potion-art-runtime|reward-art-runtime)\.lua$/.test(path)?'runtime support source':'complete integration source';
  assert.equal(hash(norm(perfFinalCiSource(path,read(path,'utf8')))),row.current.sha256,'fresh '+category+': fresh appended CI source: '+path);
 }
}
