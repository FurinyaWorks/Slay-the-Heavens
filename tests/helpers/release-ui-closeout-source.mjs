// Exact v2 UI closeout predecessors for immutable historical replay only.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const normalize=source=>source.replaceAll('\r\n','\n');
const bytes=readFileSync(new URL('../fixtures/release-ui-closeout-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'1798bb413901e57c51a19f359721a4621212c7a48d51a7d4b48bdc4be05eddba','exact Release UI closeout archive');
const {base,files}=JSON.parse(gunzipSync(bytes));
assert.equal(base,'b895de06186f866ac1a85fc4f4e948631074ca6b');
const displayBytes=readFileSync(new URL('../fixtures/release-reward-display-source.json.gz',import.meta.url));
assert.equal(hash(displayBytes),'16fb43b697f02531c0d25a8504b43294c0535ba4f432ac6b04a20ec42bd962cd','exact Release reward display archive');
const display=JSON.parse(gunzipSync(displayBytes));
assert.equal(display.base,'778e50b7af3868ce2d5adcf389e7235faa8455d3');

function matches(source,binding){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=normalize(source);
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}
for(const [path,{before,after}] of [...Object.entries(files),...Object.entries(display.files)]){
 assert(matches(before.source,before),'exact Release UI closeout predecessor: '+path);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}
function beforeSource(layer,path,source,read,currentOnly=false){
 if(!Object.hasOwn(layer,path))return source;
 const {before,after}=layer[path];
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

const ownsRewardDisplay=path=>Object.hasOwn(display.files,path);
export const ownsReleaseUiCloseoutSource=path=>ownsRewardDisplay(path)||Object.hasOwn(files,path);

function priorRead(read,owns,project,firstCurrentPath){
 const currentPaths=new Set(firstCurrentPath?[firstCurrentPath]:[]);
 return (path,encoding)=>{
  const value=read(path,encoding);
  if(!owns(path))return value;
  const source=Buffer.isBuffer(value)?value.toString('utf8'):value;
  const prior=project(path,source,read,currentPaths.has(path));
  if(source===prior)return value;
  currentPaths.add(path);
  return Buffer.isBuffer(value)?Buffer.from(prior):prior;
 };
}

const beforeRewardDisplay=(path,source,read,currentOnly)=>beforeSource(display.files,path,source,read,currentOnly);
export function releaseRewardDisplayPriorRead(read,firstCurrentPath){
 return priorRead(read,ownsRewardDisplay,beforeRewardDisplay,firstCurrentPath);
}

export function beforeReleaseUiCloseoutSource(path,source,read,currentOnly=false){
 const earlier=beforeRewardDisplay(path,source,read,currentOnly);
 const prior=read&&releaseRewardDisplayPriorRead(read,earlier!==source?path:undefined);
 return beforeSource(files,path,earlier,prior,currentOnly&&!ownsRewardDisplay(path));
}

export function releaseUiCloseoutPriorRead(read,firstCurrentPath){
 return priorRead(read,ownsReleaseUiCloseoutSource,beforeReleaseUiCloseoutSource,firstCurrentPath);
}
