// Exact M05 product continuation. Only historical views may project old bytes.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const hash=(s,alg='sha256')=>createHash(alg).update(s).digest('hex');
const blob=s=>hash(`blob ${Buffer.byteLength(s)}\0${s}`,'sha1');
const bytes=readFileSync(new URL('../fixtures/m05-shop-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'0b394bc2fa5a642b3cf14fa257607703fc4bcbd5da766cffbb4e7733661dda59','exact M05 product archive');
const {base,files}=JSON.parse(gunzipSync(bytes));
assert.equal(base,'ff6af63d9bf93056dd772347d10dc749e7fa8d34');
export const m05ShopSourcePaths=Object.freeze(Object.keys(files));
assert.deepEqual(m05ShopSourcePaths,['src/lua/abyss_node_ui_input.lua','src/lua/abyss_shop_selection.lua']);
for(const {before,after}of Object.values(files)){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(blob(before.source),before.gitBlob);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
const matches=(source,binding)=>{
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
};
export function beforeM05ShopSource(path,source){
 if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
 const prior=files[path].before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function authorizeM05ShopSource(samples,read){
 for(const path of m05ShopSourcePaths){
  const sample=samples.find(row=>row[0]===path)?.[1],expected=files[path].after;
  if(!matches(sample,expected))continue;
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,expected),'combined linked owner identity: '+path+' changed during owner validation');
 }
}
export function beforeAuthenticatedM05ShopSource(path,source,read){
 const prior=beforeM05ShopSource(path,source);
 if(prior!==source)authorizeM05ShopSource([[path,source]],read);
 return prior;
}
