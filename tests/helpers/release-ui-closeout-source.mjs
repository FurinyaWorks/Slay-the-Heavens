// Exact v2 UI closeout predecessors for immutable historical replay only.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const normalize=source=>source.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('../fixtures/release-ui-closeout-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'fdc9d7f2fb20acfce5ac2f8973c6f48b877c48b8e0d8c05ec8e376433640727f','exact Release UI closeout archive');
const {base,files}=JSON.parse(gunzipSync(bytes));
assert.equal(base,'1de7634d840c5db93ea29604ba6593007fff23e7');
function matches(source,binding){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=normalize(source);
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}
for(const [path,{before,after}] of Object.entries(files)){
 assert(matches(before.source,before),'exact Release UI closeout predecessor: '+path);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
export const ownsReleaseUiCloseoutSource=path=>Object.hasOwn(files,path);
export function beforeReleaseUiCloseoutSource(path,source,read){
 if(!ownsReleaseUiCloseoutSource(path)||!matches(source,files[path].after))return source;
 const {before,after}=files[path];
 if(read){
  let live;try{live=read(path,'utf8');}catch{assert.fail('Release UI closeout owner missing: '+path);}
  assert(matches(live,after),'Release UI closeout owner identity: '+path);
 }
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}
