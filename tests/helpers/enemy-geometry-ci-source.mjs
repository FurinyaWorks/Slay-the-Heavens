// CI-only trust leaf; production and isolated production copies never import it.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./enemy-geometry-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'04848f5f8d39bdd8dc2f1aa9b9eb605982aa5f3025710dd91b16836d4d8e2475','complete enemy geometry CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
assert.equal(packet.baseCommit,'b67226945c2be47c8fff31f1362412b973f68875');
assert.equal(packet.releaseBase,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
assert.deepEqual(packet.prerequisites,['b67226945c2be47c8fff31f1362412b973f68875']);
assert.equal(packet.currentCommit,'d8f03fa79aacb62fd663d75fdfd3a037a9eb2984');
assert.equal(packet.currentTreeCommitted,false,'auxiliary after bindings are captured separately from the product commit');
for(const [path,row]of Object.entries(packet.files))assert.equal(row.beforeCommit,packet.baseCommit,'exact enemy geometry CI predecessor: '+path);
for(const [path,row]of Object.entries(packet.files))for(const binding of [row.before,row.current].filter(Boolean)){
 assert.equal(binding.source,norm(binding.source),path);assert.equal(hash(binding.source),binding.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex'),binding.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const enemyGeometryCiPacket=freeze(packet);
function checkedSource(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row?.before||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&row.before.sha256!==before.sha256)return source;
 return hash(norm(source))===row.current.sha256?row.before.source:source;
}
// Only the explicit complete-CI validator may compare a production owner's
// freshly checked after binding with its immutable CI predecessor record.
export const enemyGeometryCiCheckedSource=checkedSource;
export function enemyGeometryCiSource(path,source,before){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 return checkedSource(path,source,before);
}
export function enemyGeometryCiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding),text=typeof raw==='string'?raw:raw.toString('utf8'),prior=enemyGeometryCiSource(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function enemyGeometryPriorInventory(paths,kind='js',read=readFileSync){
 assert(['js','lua'].includes(kind));
 const before=packet.priorInventory[kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 // Older complete receipt inventories have already left this outer layer.
 // Their own immutable validators retain the original missing/duplicate checks.
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete enemy geometry raw '+(kind==='lua'?'Lua discovery':'JS')+' inventory');
 for(const path of current.filter(p=>!before.includes(p)))
  assert.equal(hash(norm(read(path,'utf8'))),packet.files[path].current.sha256,'fresh enemy geometry added inventory source: '+path);
 return [...before];
}
export function assertEnemyGeometryRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));
 assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete enemy geometry raw discovery inventory');
}
export function assertEnemyGeometryCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))
  assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source: enemy geometry '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))
  assert.equal(hash(read(path)),sha,'retained complete immutable release predecessor: '+path);
}
