// Fixed trust leaf for the final private integration. Original CI packets remain byte-identical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {pcFinalStorageSource} from './pc-final-storage-source.mjs';
import {perfFinalCiPacket} from './perf-final-ci-source.mjs';
import {reconciliationCiPacket} from './reconciliation-ci-source.mjs';
import {pcAfterFixCiPacket,pcAfterFixCiSource,pcAfterFixCurrentInventory,pcAfterFixPriorInventory,assertPcAfterFixCiCurrent} from './pc-after-fix-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./pc-final-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'ee99ca6ed0372689bdd45692bc55a3a8ccb09c958697388d40e40a39c9be1da9','complete final CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(hash(readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url))),packet.originalArchiveSha256,'original full CI packet remains immutable');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const pcFinalCiPacket=freeze(packet);
export function pcFinalCiSource(path,source,before){
 const raw=source;
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(typeof source!=='string'||source.includes('\r\r\n')||(row?.before&&row.before.sha256!==before?.sha256))return raw;
 source=pcFinalStorageSource(path,pcAfterFixCiSource(path,source));
 if(!row?.before)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:raw;
}
export function pcFinalCurrentInventory(base,kind){
 if(JSON.stringify([...base].sort())===JSON.stringify(reconciliationCiPacket.currentInventory[kind]))return [...base];
 if(JSON.stringify([...base].sort())===JSON.stringify(perfFinalCiPacket.currentInventory[kind]))return [...base];
 if(JSON.stringify([...base].sort())===JSON.stringify(pcAfterFixCiPacket.currentInventory[kind]))return [...base];
 if(JSON.stringify([...base].sort())!==JSON.stringify(packet.currentInventory[kind]))assert.deepEqual([...base].sort(),packet.priorInventory[kind],'complete pre-final CI inventory');
 return pcAfterFixCurrentInventory(packet.currentInventory[kind],kind);
}
export function pcFinalPriorInventory(paths,kind,read){
 paths=pcAfterFixPriorInventory(paths,kind,read);
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],added=current.filter(path=>!before.includes(path));
 if(!added.some(path=>paths.includes(path)))return [...paths];
 assert.deepEqual([...paths].sort(),current,'complete final CI raw inventory');
 for(const path of added)assert.equal(hash(norm(pcFinalStorageSource(path,pcAfterFixCiSource(path,read(path,'utf8'))))),packet.files[path].current.sha256,'fresh added final CI source: '+path);
 return [...before];
}
export function assertPcFinalCiCurrent(read){
 assertPcAfterFixCiCurrent(read);
 for(const [path,row]of Object.entries(packet.files)){
  const category=['tests/item-semantic-icons-source.test.mjs','tests/potion-art-runtime.test.mjs','tests/potion-art.test.mjs'].includes(path)?'added inventory source':/^tests\/helpers\/(potion-art-runtime|reward-art-runtime)\.lua$/.test(path)?'runtime support source':'complete integration source';
  assert.equal(hash(norm(pcFinalStorageSource(path,pcAfterFixCiSource(path,read(path,'utf8'))))),row.current.sha256,'fresh '+category+': '+path);
 }
}
