// Exact product continuation, not a new historical source epoch.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const bytes=readFileSync(new URL('../fixtures/pc13-reward-cover-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'8955ace9a39d59c5635e393b8fe2a988d87f236c3cfe2909dde3d3e3506edefc','PC13 exact predecessor archive');
const {base,files}=JSON.parse(gunzipSync(bytes));
assert.equal(base,'901f87c9e7922c78f31154d9c88d2a5f5ef2720c');
for(const {before,after} of Object.values(files)){
 assert.equal(hash(before.source),before.sha256);
 assert.equal(hash(`blob ${Buffer.byteLength(before.source)}\0${before.source}`,'sha1'),before.gitBlob);
 for(const [id,length] of [[after.sha256,64],[after.gitBlob,40]])assert.match(id,new RegExp('^[a-f0-9]{'+length+'}$'));
}
const matches=(source,binding)=>{
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256&&hash(`blob ${Buffer.byteLength(text)}\0${text}`,'sha1')===binding.gitBlob;
};
export const pc13RewardCoverSourcePaths=Object.freeze(Object.keys(files));
export function beforePc13RewardCover(path,source){
 const row=files[path];if(!Object.hasOwn(files,path)||!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}
export function authorizePc13RewardCover(samples,read){
 for(const [path,{after}] of Object.entries(files)){
  const input=samples.find(sample=>sample[0]===path)?.[1];
  if(!matches(input,after))continue;
  let live;try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,after),'combined linked owner identity: '+path+' changed during owner validation');
 }
}

export function beforeAuthenticatedPc13RewardCover(path,source,read){
 const prior=beforePc13RewardCover(path,source);
 if(prior!==source)authorizePc13RewardCover([[path,source]],read);
 return prior;
}
