// Exact two-parent continuation; every historical conversion authenticates raw current inputs.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./potion-shop-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'cdd685fbad781304910f6b89d9fa87ad48d060c4fbea30eeea223868d1061aad','complete potion/shop current corpus');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const potionShopCiPacket=freeze(JSON.parse(gunzipSync(bytes)));
const p=potionShopCiPacket;
assert.equal(p.schemaVersion,1);assert.equal(p.currentTreeCommitted,false);
assert.deepEqual(p.viewCommits,{potion:'10cfd7ac965c6aa2f640cdfac35c1149ac42c5c0',shop:'ad3a53cb3eb87fbad4ae015d11ea870deb6d5db1'});
for(const [path,row]of Object.entries(p.files))for(const b of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(b.source,norm(b.source));assert.equal(hash(b.source),b.sha256,path);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(b.source)}\0`).update(b.source).digest('hex'),b.gitBlob,path);
}
function checked(path,source,target){
 assert(Object.hasOwn(p.viewCommits,target),'explicit potion/shop history');
 const row=Object.hasOwn(p.files,path)?p.files[path]:null,before=row?.views[target];
 if(!before||before.sha256===row.current.sha256||typeof source!=='string'||source.includes('\r\r\n'))return source;
 return hash(norm(source))===row.current.sha256?before.source:source;
}
export function assertPotionShopCiCurrent(read=readFileSync){
 for(const [path,row]of Object.entries(p.files))assert.equal(hash(norm(read(path,'utf8'))),row.current.sha256,'fresh complete integration source (potion/shop): '+path);
 for(const [path,sha]of Object.entries(p.immutableArchives))assert.equal(hash(read(path)),sha,'immutable potion/shop source archive: '+path);
}
export function potionShopHistoricalRead(target,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(raw===null||raw===undefined)return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=checked(path,text,target);
 if(prior!==text)assertPotionShopCiCurrent(read);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function potionShopCiSource(path,source,read=readFileSync,target='potion'){
 if(path.startsWith('src/')||path==='config/architecture.json')return source;
 const prior=checked(path,source,target);if(prior!==source)assertPotionShopCiCurrent(read);return prior;
}
export function assertPotionShopRawInventory(paths,kind='js'){
 assert(['js','lua'].includes(kind));assert.deepEqual([...paths].sort(),p.currentInventory[kind],'complete potion/shop raw discovery inventory');
}
export function potionShopPriorInventory(paths,kind='js',read=readFileSync,target='potion'){
 assert(['js','lua'].includes(kind));assert(Object.hasOwn(p.viewCommits,target));
 const sorted=[...paths].sort(),before=p.viewInventories[target][kind],current=p.currentInventory[kind];
 if(JSON.stringify(sorted)===JSON.stringify(before))return [...paths];
 if(!current.some(x=>!before.includes(x)&&sorted.includes(x)))return [...paths];
 assertPotionShopRawInventory(paths,kind);assertPotionShopCiCurrent(read);return [...before];
}
