// Authenticate the four live map/host owners before replaying older UI receipts.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash('blob '+Buffer.byteLength(source)+'\0'+source,'sha1');
const archive=readFileSync(new URL('../fixtures/sts1-map-source.json.gz',import.meta.url));
assert.equal(hash(archive),'dd8f2cfbfcacd9fb6cc6cb856cef83bc344e6d65bce490cc6724dfb1f22da0e3','exact STS1 map source archive');
const {base,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'1fe37f4b08cbc21bc51b5b0d16fae94cec594976');
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
  if(!matches(samples.find(row=>row[0]===path)?.[1],after))continue;
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,after),'combined linked owner identity: '+path+' changed during owner validation');
 }
}
