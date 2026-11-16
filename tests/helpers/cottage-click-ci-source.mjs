// CI-only trust leaf; production and isolated production copies never import it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./cottage-click-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'aad69c2ebe301444ccf72294ffbb0a71d8a7d2ec275dab4a7bcecb48ae12d01e','complete mobile cottage CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'3e96a1589435f8b06645db095775a789f24b1350');
assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
assert.deepEqual(packet.prerequisites,['3e96a1589435f8b06645db095775a789f24b1350']);
assert.equal(packet.currentCommit,'329d13a72d3abcc8a80fe09fb4cfbd503972f08b');
assert.equal(packet.currentTreeCommitted,false,'auxiliary after bindings are captured separately from the product commit');
for(const [path,row]of Object.entries(packet.files))assert.equal(row.beforeCommit,packet.baseCommit,'exact cottage CI predecessor: '+path);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const cottageClickCiPacket=freeze(packet);
function checkedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
// Only the explicit complete-CI validator may compare a production owner's
// freshly checked after binding with its immutable CI predecessor record.
export const cottageClickCiCheckedSource=checkedSource;
export function cottageClickCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return checkedSource(path,source,before);
}
export function cottageClickCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=cottageClickCiSource(path,text);
 if(prior!==text)assertCottageClickCiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
// Explicit before-cottage epoch only; never use as the current entry.
export function cottageClickHistoricalRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checkedSource(path,text);
 if(prior!==text)assertCottageClickCiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function cottageClickPriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 // Older complete receipt inventories have already left this outer layer.
 // Their own immutable validators retain the original missing/duplicate checks.
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete mobile cottage raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of current.filter(p=>!before.includes(p)))
  assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh mobile cottage added inventory source: '+path);
 return [...before];
}
export function assertCottageClickRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete mobile cottage raw discovery inventory');
}
export function assertCottageClickCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: mobile cottage '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable release predecessor: '+path);
}
