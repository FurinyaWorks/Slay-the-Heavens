// Exact v2 UI closeout predecessors for immutable historical replay only.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const normalize=source=>source.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('../fixtures/release-ui-closeout-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'9d169f7f031e95c8a9c329087b0d9a71d526da584f65da18031537897e3fcc5c','exact Release UI closeout archive');
const {base,files}=JSON.parse(gunzipSync(bytes));
assert.equal(base,'b652ab25f83161f4a806c89d90c5eceea9198717');
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
export function beforeReleaseUiCloseoutSource(path,source,read,currentOnly=false){
 if(!ownsReleaseUiCloseoutSource(path))return source;
 const {before,after}=files[path];
 if(!matches(source,after)){
  assert(!currentOnly,'Release UI closeout owner identity: '+path);
  return source;
 }
 if(read){
  let live;try{live=read(path,'utf8');}catch{assert.fail('Release UI closeout owner missing: '+path);}
  assert(matches(live,after),'Release UI closeout owner identity: '+path);
 }
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}

export function releaseUiCloseoutPriorRead(read,firstCurrentPath){
 const currentPaths=new Set(firstCurrentPath?[firstCurrentPath]:[]);
 return (path,encoding)=>{
  const value=read(path,encoding);
  if(!ownsReleaseUiCloseoutSource(path))return value;
  const source=Buffer.isBuffer(value)?value.toString('utf8'):value;
  const prior=beforeReleaseUiCloseoutSource(path,source,read,currentPaths.has(path));
  if(source===prior)return value;
  currentPaths.add(path);
  return Buffer.isBuffer(value)?Buffer.from(prior):prior;
 };
}
