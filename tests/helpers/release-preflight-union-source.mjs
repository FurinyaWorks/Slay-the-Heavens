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
 assertReleasePreflightUnionArchive(read);
 for(const [path,row]of Object.entries(packet.views.release)){
  const source=read(path,'utf8');assert.equal(typeof source,'string');assert(!source.includes('\r\r\n'));
  assert.equal(hash(norm(source)),row.current.sha256,'fresh complete Release preflight input: '+path);
 }
}
export function releasePreflightUnionSource(path,source,target){
 const files=Object.hasOwn(packet.views,target)?packet.views[target]:null;
 const row=files&&Object.hasOwn(files,path)?files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||hash(norm(source))!==row.current.sha256)return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}
