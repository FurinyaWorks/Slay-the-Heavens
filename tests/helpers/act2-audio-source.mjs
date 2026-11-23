// Exact audio presentation successors are projected before replaying older views.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {exactSourceMatches as matches} from './source-fingerprint.mjs';

const archive = readFileSync(new URL('../fixtures/act2-audio-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'),
  '16b96dd2b16d2e3bf233554a67983d78fd5cb44e1104c411a9de0e07919a2293','exact Act 2 audio source archive');
const {base,head,files} = JSON.parse(gunzipSync(archive));
assert.equal(base,'73c21489efaab409d4c0c46bee517d410d3427fc');
assert.equal(head,'e2d43734d82552761d377078ac4a4ad60d5b92be');
for(const [path,row] of Object.entries(files)){
  assert(matches(row.before.source,row.before),'exact Act 2 audio predecessor: '+path);
  assert.match(row.after.sha256,/^[a-f0-9]{64}$/);
  assert.match(row.after.gitBlob,/^[a-f0-9]{40}$/);
}

const owns = path => Object.hasOwn(files,path);
export function beforeAudioPresentation(path,source){
  if(!owns(path)||!matches(source,files[path].after))return source;
  const before = files[path].before.source;
  return source.includes('\r\n') ? before.replaceAll('\n','\r\n') : before;
}

export function authenticateAudioPresentation(path,source,read,{current=false}={}){
  if(!owns(path))return source;
  const prior = beforeAudioPresentation(path,source);
  if(current)assert(prior!==source,'fresh current production owner: '+path);
  if(prior===source)return source;
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+error.message);}
  assert(matches(live,files[path].after),'combined linked owner identity: '+path+' during Act 2 audio validation');
  return prior;
}

export function beforeAudioPresentationReader(read,{current=false}={}){
  return (path,...args)=>{
    const raw=read(path,...args);
    if(!owns(path))return raw;
    const binary=Buffer.isBuffer(raw), source=binary?raw.toString('utf8'):raw;
    const prior=beforeAudioPresentation(path,source);
    if(current)assert(prior!==source,'combined linked owner identity: '+path+' during Act 2 audio validation');
    return binary && prior!==source ? Buffer.from(prior) : binary ? raw : prior;
  };
}
