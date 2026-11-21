import {authorizeRebasedRelease,beforeRebasedRelease} from './rebased-release-source.mjs';
import {beforeReconciledReleaseSource} from './release-integration-source.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(bytes,algorithm='sha256')=>createHash(algorithm).update(bytes).digest('hex');
const normalize=source=>source.replaceAll('\r\n','\n');
const blob=source=>hash('blob '+Buffer.byteLength(source)+'\0'+source,'sha1');
const archive=readFileSync(new URL('./release-map-deck-source.json.gz',import.meta.url));
assert.equal(hash(archive),'8e16866bcec2fdc7628cbc91f7a74f09c18b9f621c6e065b75b2c98a8172a2d4','exact map deck source archive');
const {base,candidate,files}=JSON.parse(gunzipSync(archive));
assert.equal(base,'8af3866714f12abe8d1322f0c2e3cffc623a808b');
assert.equal(candidate,'ac9dcec9f1d6818a340b35075771add6ba6656de');
for(const [path,{before,after}] of Object.entries(files)){
  assert.equal(hash(before.source),before.sha256,path+' predecessor SHA256');
  assert.equal(blob(before.source),before.gitBlob,path+' predecessor Git blob');
  assert.match(after.sha256,/^[a-f0-9]{64}$/);
  assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}

function current(source,binding){
  if(typeof source!=='string'||source.includes('\r\r\n'))return false;
  const text=normalize(source);
  return hash(text)===binding.sha256&&blob(text)===binding.gitBlob;
}

export function beforeMapDeckSource(path,source,read){
  const rebound=beforeRebasedRelease(path,source);
  if(rebound!==source)authorizeRebasedRelease([[path,source]],owner=>read(owner,'utf8'));
  source=beforeReconciledReleaseSource(path,rebound);
  if(!Object.hasOwn(files,path)||!current(source,files[path].after))return source;
  for(const [owner,{after}] of Object.entries(files)){
    let live;
    try{live=read(owner,'utf8');}catch{assert.fail('map deck linked owner missing: '+owner);}
    assert(current(beforeReconciledReleaseSource(owner,beforeRebasedRelease(owner,typeof live==='string'?live:live?.toString('utf8'))),after),'map deck linked owner identity: '+owner);
  }
  const prior=files[path].before.source;
  return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}

export function mapDeckPriorRead(read){
  return (path,encoding)=>{
    const value=read(path,encoding);
    if(typeof value==='string')return beforeMapDeckSource(path,value,read);
    if(!Buffer.isBuffer(value))return value;
    const text=value.toString('utf8'),prior=beforeMapDeckSource(path,text,read);
    return prior===text?value:Buffer.from(prior);
  };
}
