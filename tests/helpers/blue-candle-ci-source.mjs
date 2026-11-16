// Sparse CI-only continuation to the actual Release base. This leaf excludes itself.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./blue-candle-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'6c277c08189975b5cb4a7c6f68402036bec7eec5b30634276fb35f64e73d9c89','complete blue candle CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.equal(packet.currentTreeCommitted,false,'auxiliary bindings are separate from the product checkpoint');
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const blueCandleCiPacket=freeze(packet);
export function blueCandleCiCheckedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n')||before&&before.sha256!==row.before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
export function blueCandleCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return blueCandleCiCheckedSource(path,source,before);
}
export function blueCandleCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=blueCandleCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function blueCandlePriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 const added=current.filter(path=>!before.includes(path));
 if(!added.some(path=>sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete blue candle raw discovery inventory');
 for(const path of added)assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh blue candle added inventory source: '+path);
 return [...before];
}
export function assertBlueCandleCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: blue candle '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained immutable blue candle predecessor: '+path);
}
