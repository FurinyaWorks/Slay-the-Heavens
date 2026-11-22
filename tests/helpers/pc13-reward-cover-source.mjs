// Exact product continuation, not a new historical source epoch.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeV2UiHudSource} from './v2-ui-hud-source.mjs';
import {beforeLoadingRecoverySource} from './loading-recovery-source.mjs';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const bytes=readFileSync(new URL('../fixtures/pc13-reward-cover-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'9779296bb7bedc99990fa6ccad9c7ba0a0e581982a020c9dcc4a71210b3299cd','PC13 exact predecessor archive');
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
  source=beforeLoadingRecoverySource(path,source);
  const row=files[path];if(!Object.hasOwn(files,path)||!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}
export function authorizePc13RewardCover(samples,read){
 for(const [path,{after}] of Object.entries(files)){
    const input=beforeLoadingRecoverySource(path,samples.find(sample=>sample[0]===path)?.[1]);
  if(!matches(input,after))continue;
  let live;try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
    assert(matches(beforeLoadingRecoverySource(path,live),after),'combined linked owner identity: '+path+' changed during owner validation');
 }
}

export function beforeAuthenticatedPc13RewardCover(path,source,read){
 const prior=beforePc13RewardCover(path,source);
 if(prior!==source)authorizePc13RewardCover([[path,source]],read);
 return prior;
}

// Explicit older HUD view: validate the newest owner before offering its exact
// predecessor to the independent HUD continuation. Keep the original reader
// for all non-PC13 source; it still verifies the exact HUD owner invocation.
export function beforePc13ThenV2UiHudSource(path,source,read){
 const prior=beforeAuthenticatedPc13RewardCover(path,source,read);
 return beforeV2UiHudSource(path,prior,owner=>beforePc13RewardCover(owner,read(owner)));
}
