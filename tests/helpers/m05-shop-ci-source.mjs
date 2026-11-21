import {beforeStsFadeCi} from './sts-fade-ci-source.mjs';
import {beforeStsSelectionFade} from './sts-selection-fade-source.mjs';
// Authenticated CI-only continuation; raw scheduler discovery stays unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const hash=(s,alg='sha256')=>createHash(alg).update(s).digest('hex');
const blob=s=>hash(`blob ${Buffer.byteLength(s)}\0${s}`,'sha1');
const archive=readFileSync(new URL('../fixtures/m05-shop-ci-source.json.gz',import.meta.url));
assert.equal(hash(archive),'9dd0b49c2d5c2eb084ac798a91b6a38b4a8f36269677bb730b863b8d53727e8d','exact M05 CI archive');
const {base,files,inventories}=JSON.parse(gunzipSync(archive));
assert.equal(base,'ff6af63d9bf93056dd772347d10dc749e7fa8d34');
const additions=Object.freeze({js:'tests/shop-dismiss.test.mjs',lua:'tests/lua/shop_dismiss.lua'});
for(const [kind,path]of Object.entries(additions)){
 const prior=inventories[kind];
 assert.deepEqual(prior,[...new Set(prior)].sort(),'complete M05 predecessor '+kind+' inventory');
 assert(!prior.includes(path));assert.equal(files[path].before,null);
}
for(const {before,after} of Object.values(files)){
 if(before){assert.equal(hash(before.source),before.sha256);assert.equal(blob(before.source),before.gitBlob);}
 assert.match(after.sha256,/^[a-f0-9]{64}$/);assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const matches=(source,binding)=>{
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
};
export function beforeM05ShopCiSource(path,source){
 source=beforeStsFadeCi(path,source);
 source=beforeStsSelectionFade(path,source);
 if(!Object.hasOwn(files,path)||!files[path].before||!matches(source,files[path].after))return source;
 const prior=files[path].before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function m05CurrentDiscovery(paths,kind,read=readFileSync){
 assert(Object.hasOwn(additions,kind),'known M05 inventory kind');
 const path=additions[kind],prior=inventories[kind];
 assert.deepEqual([...paths].sort(),[...prior,path].sort(),'complete M05 raw '+(kind==='lua'?'Lua':'JS')+' discovery inventory');
 assert(matches(read(path,'utf8'),files[path].after),'fresh M05 added '+kind+' source: '+path);
 return paths.filter(candidate=>candidate!==path);
}
export function m05HistoricalDiscovery(paths,kind,read=readFileSync){
 assert(Object.hasOwn(additions,kind),'known M05 inventory kind');
 // Genuine older callers retain their existing contracts; only live M05 mode
 // may remove the exact newly discovered entry after hashing it.
 return paths.includes(additions[kind])?m05CurrentDiscovery(paths,kind,read):paths;
}
