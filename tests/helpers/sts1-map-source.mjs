// Authenticate the four live map/host owners before replaying older UI receipts.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash('blob '+Buffer.byteLength(source)+'\0'+source,'sha1');
const archive=readFileSync(new URL('../fixtures/sts1-map-source.json.gz',import.meta.url));
assert.equal(hash(archive),'a356e09f7fb3a7c2f16c09adbbafaae6290bc615fe3be530a9f02d2c3a6e8d39','exact STS1 map source archive');
const {base,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'d7d77fe88d3b6fef6da233cfad0ec9361094db0d');
export const sts1MapSourcePaths=Object.freeze(Object.keys(files));

const matches=(source,binding)=>{
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
};
for(const {before} of Object.values(files))assert(matches(before.source,before),'exact STS1 map predecessor');

export function beforeSts1MapSource(path,source){
 if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
 const prior=files[path].before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function authorizeSts1MapSource(samples,read){
 for(const [path,{after}] of Object.entries(files)){
  const owners=samples.filter(([owner])=>owner===path);
  if(!owners.some(([,source])=>matches(source,after)))continue;
  assert(owners.every(([,source])=>matches(source,after)),'combined linked owner identity: '+path+' mixed live and stale sources');
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,after),'combined linked owner identity: '+path+' changed during owner validation');
 }
}
