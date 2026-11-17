// Exact outer continuation of the retained Release union and Quick receipts.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=value=>createHash('sha256').update(value).digest('hex');
const norm=value=>value.replaceAll('\r\n','\n');
const path='tests/helpers/release-preflight-union-source.json.gz';
const bytes=readFileSync(new URL('./release-preflight-union-source.json.gz',import.meta.url));
const sha='fe6450c752cea6f6eac13afd0e7d7cb28532151dbcdefe4baafa5a83b8c36712';
assert.equal(hash(bytes),sha,'complete Release preflight union continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.deepEqual(packet.parents,{release:'b6d24eed1cfab7d27c078ffdb3d2c76541065639',advisory:'8457762c7f93fc0201ac15ee9386e0d3e6e2bd58',preflight:'2089991e6cb893de3690622ecc3e52edd27658d2'});
for(const files of Object.values(packet.views))for(const row of Object.values(files))for(const side of ['current','before']){
 assert.equal(norm(row[side].source),row[side].source);
 assert.equal(hash(row[side].source),row[side].sha256,'complete Release preflight predecessor');
}
export function assertReleasePreflightUnionArchive(read=readFileSync){
 assert.equal(hash(read(path)),sha,'fresh immutable Release preflight union archive');
}
export function assertReleasePreflightUnionCurrent(read=readFileSync){
 assertCapacityFastUnionCurrent(read);
 read=capacityFastUnionRead('fast',read);
 assertReleasePreflightUnionArchive(read);
 for(const [path,row]of Object.entries(packet.views.release)){
  const source=read(path,'utf8');assert.equal(typeof source,'string');assert(!source.includes('\r\r\n'));
  assert.equal(hash(norm(source)),row.current.sha256,'fresh complete Release preflight input: '+path);
 }
}
// The two fixed Release candidates retain complete independent CI histories.
const capacityFastBytes=readFileSync(new URL('./release-capacity-fast-union.json.gz',import.meta.url));
assert.equal(hash(capacityFastBytes),'7b65d5ae5ae75c0fdfcba38ed5ae10adf70d1fb26443ecbb97db287f631d57d4','complete capacity Fast union');
const capacityFast=JSON.parse(gunzipSync(capacityFastBytes));
assert.deepEqual(capacityFast.parents,{fast:'620106856f4457501275db212c70a58ff79e5b67',capacity:'6980b909db9e3d1a2f425ebaf31524aebc156416'});
assert.equal(capacityFast.currentTreeCommitted,false);
for(const [path,row]of Object.entries(capacityFast.files))for(const binding of [row.current,...Object.values(row.views)].filter(Boolean)){
 assert.equal(norm(binding.source),binding.source);assert.equal(hash(binding.source),binding.sha256,'complete capacity Fast source: '+path);
}
export const capacityFastUnionBindings=Object.freeze(Object.fromEntries(Object.entries(capacityFast.files).map(([path,row])=>[path,Object.freeze({current:row.current.sha256,fast:row.views.fast?.sha256??null,capacity:row.views.capacity?.sha256??null})])));
export function capacityFastUnionSource(path,source,view){
 const row=Object.hasOwn(capacityFast.files,path)?capacityFast.files[path]:null;
 const prior=row&&Object.hasOwn(row.views,view)?row.views[view]:null;
 if(!prior||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 return source.includes('\r\n')?prior.source.replaceAll('\n','\r\n'):prior.source;
}
export function capacityFastUnionRead(view,read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=capacityFastUnionSource(path,text,view);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
export function assertCapacityFastUnionCurrent(read=readFileSync){
 assert.equal(hash(read('tests/helpers/release-capacity-fast-union.json.gz')),hash(capacityFastBytes),'fresh immutable capacity Fast union archive');
 for(const [path,row]of Object.entries(capacityFast.files)){
  const source=read(path,'utf8');assert.equal(typeof source,'string');assert(!source.includes('\r\r\n'));
  assert.equal(hash(norm(source)),row.current.sha256,'fresh complete integration source: capacity Fast union '+path);
 }
}
export function releasePreflightUnionSource(path,source,target,applyCapacityUnion=true){
 if(applyCapacityUnion&&['release','advisory'].includes(target))source=capacityFastUnionSource(path,source,'fast');
 if(target==='release'&&path==='tests/release-selection-map-source.test.mjs'&&typeof source==='string'&&!source.includes('\r\r\n')&&hash(norm(source))==='045dd56326acbe32ff06ba8d80ba20aa454bf86d919e437645b52c42b85823a6'){
  const prior=norm(source).replaceAll('norm(raw).replaceAll(', 'raw.replaceAll(');
  assert.equal(hash(prior),'5726b421c7e56d56e28d5787f795df5e442c58f38f55e61ca283b1fcac189eba','exact selection line-ending fixture predecessor');
  source=source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 if(target==='release'&&path==='tests/sts-style-source-epoch.test.mjs'&&typeof source==='string'&&!source.includes('\r\r\n')&&hash(norm(source))==='8541039a7c6c15f497bc678bc29cd43e68183297b7f9ad54bc8c527b8d076164'){
  const prior=norm(source).replace("(p,e)=>{const value=readFileSync(p,e);return p===path?value+'\\n':value;}","(p,e)=>readFileSync(p,e)+(p===path?'\\n':'')");
  assert.equal(hash(prior),'eb5fa6dad1ad421aa4c565d2e700f91e04b510ae2602c4186c26c0732eb78435','exact StS mutation-reader predecessor');
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 const files=Object.hasOwn(packet.views,target)?packet.views[target]:null;
 const row=files&&Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}
