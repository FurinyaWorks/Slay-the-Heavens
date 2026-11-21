import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');

function matches(source,binding){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}

export function releaseUiRestoreArchive(bytes,expectedSha){
 assert.equal(hash(bytes),expectedSha,'exact Release UI source archive');
 const {base,files}=JSON.parse(gunzipSync(bytes));
 assert.equal(base,'ff6af63d9bf93056dd772347d10dc749e7fa8d34');
 for(const [path,{before,after}] of Object.entries(files)){
  assert.equal(hash(before.source),before.sha256,path+' base SHA256');
  assert.equal(blob(before.source),before.gitBlob,path+' base Git blob');
  assert.match(after.sha256,/^[a-f0-9]{64}$/);
  assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
 }
 function project(path,source){
  if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
  const prior=files[path].before.source;
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
 }
 return {files,project};
}

const {files,project}=releaseUiRestoreArchive(readFileSync(new URL('./release-ui-restore-source.json.gz',import.meta.url)),
 '71c7c20e615dd0d5ec8324a2eec5f503ddcab7ca04db63b928a9dff6c21a36c9');
export const releaseUiRestoreSourcePaths=Object.freeze(Object.keys(files));
export const beforeReleaseUiRestore=project;

export function authorizeReleaseUiRestore(samples,read){
 for(const path of releaseUiRestoreSourcePaths){
  const inputs=samples.filter(sample=>sample[0]===path).map(sample=>sample[1]);
  const expected=files[path].after;
  if(!inputs.some(input=>matches(input,expected)))continue;
  const message='combined linked owner identity: '+path+' changed during owner validation';
  assert(inputs.every(input=>matches(input,expected)),message);
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,expected),message);
 }
}

export function beforeAuthenticatedReleaseUiRestore(path,source,read){
 const prior=beforeReleaseUiRestore(path,source);
 if(prior!==source)authorizeReleaseUiRestore([[path,source]],read);
 return prior;
}
