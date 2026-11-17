// Current-combination trust leaf. Independent before domains remain historical.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./enemy-post697-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'46b8f11973ff930fd8e884b9bd4b2ef154eff1a8424d779c63fc0110c4a71beb','complete enemy post697 CI packet');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,false);
assert.deepEqual(packet.viewCommits,{enemy:'13a3c70046391cadee86ecffb57ded3450906687',selection:'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9'});
assert.equal(packet.productCommit,'bc106cce4f8fde5d1b0dec5ae9c0403cb5436a0c');
for(const [path,row]of Object.entries(packet.files))for(const item of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(item.source,norm(item.source));assert.equal(hash(item.source),item.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(item.source)}\0`).update(item.source).digest('hex'),item.gitBlob,path);
}
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const enemyPost697CiPacket=freeze(packet);
function checked(path,source,target,before){
 assert(Object.hasOwn(packet.viewCommits,target),'explicit post697 history domain');
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null,view=row?.views[target];
 // Already-historical and unchanged sources gain no authorization and remain
 // byte-for-byte raw, including CRLF and binary callers handled by the reader.
 if(!view||view.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 if(before&&before.sha256!==view.sha256)return source;
 return hash(norm(source))===row.current.sha256?view.source:source;
}
export function enemyPost697CiSource(path,source,before,read=readFileSync,target='enemy'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target,before);
 if(prior!==source)assertEnemyPost697CiCurrent(read);
 return prior;
}
export function enemyPost697CiRead(read=readFileSync,target='enemy'){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=enemyPost697CiSource(path,text,undefined,read,target);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function enemyPost697HistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertEnemyPost697CiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function enemyPost697PriorInventory(paths,kind='js',read=readFileSync,target='enemy'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(packet.viewCommits,target));
 const before=packet.viewInventories[target][kind],current=packet.currentInventory[kind],sorted=[...paths].sort();
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(path=>!before.includes(path)&&sorted.includes(path)))return [...paths];
 assert.deepEqual(sorted,current,'complete post697 current raw inventory');
 assertEnemyPost697CiCurrent(read);
 return [...before];
}
export function assertEnemyPost697RawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),packet.currentInventory[kind],'complete post697 raw discovery inventory');
}
export function assertEnemyPost697CiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(packet.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete enemy post697 source: '+path);
 for(const [path,sha]of Object.entries(packet.immutableArchives))assert.equal(hash(read(path)),sha,'immutable post697 predecessor: '+path);
}
