// CI-only continuation of the exact #698 merge plus the reviewed Release gate.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('./release-fast-b9-ci-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'6e24cdf6dae005b36b77b3cab374a833f6636df22102d019d2f99bba9827c8bf','complete Release Fast B9 CI continuation');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.baseCommit,'b9bca884ed9b9831965b409885d78f719b9a567a');
assert.equal(packet.mergeCommit,'1346295a5223ff99501040a2546f4f97ac615352');
assert.equal(packet.normalization,'LF');
assert.equal(hash(packet.selectionTest.source),packet.selectionTest.sha256,'immutable standalone selection test');
for(const [path,row]of Object.entries(packet.files))assert.equal(hash(row.before.source),row.before.sha256,path+' immutable B9 source');
export function beforeReleaseFastB9Ci(path,source,before){
 const row=Object.hasOwn(packet.files,path)?packet.files[path]:null;
 if(!row||typeof source!=='string'||source.includes('\r\r\n')||before&&before.sha256!==row.before.sha256)return source;
 if(hash(norm(source))!==row.currentSha256)return source;
 const prior=row.before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeReleaseFastB9SelectionTest(path,source){
 const prior=beforeReleaseFastB9Ci(path,source);
 if(prior===source||path!=='tests/release-selection-map-source.test.mjs')return source;
 assert.equal(hash(norm(prior)),packet.files[path].before.sha256);
 return packet.selectionTest.source;
}
export const releaseFastB9CiBindings=Object.freeze(Object.fromEntries(Object.entries(packet.files).map(([path,row])=>[path,Object.freeze({beforeSha256:row.before.sha256,currentSha256:row.currentSha256})])));
export function releaseFastB9CiRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);
 if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8'),prior=beforeReleaseFastB9Ci(path,text);
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
