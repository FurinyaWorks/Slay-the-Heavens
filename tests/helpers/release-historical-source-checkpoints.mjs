import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {sourceEpoch} from './combined-epoch/source-epoch.mjs';

const digest=source=>createHash('sha256').update(source).digest('hex');
const commits={
 traveler:'25d389968670c0812f8b9565157cf32642fb58e2',
 controls:'068e1acbc6f98b591f84bf5cdb35a7620bb4cf17',
 compound:'8cfd4dfaf72291de0bd91de8a4ce829266da072f',
};
const packed=readFileSync(new URL('../fixtures/release-historical-source-checkpoints.json.gz',import.meta.url));
assert.equal(digest(packed),'93be568f3fdab2eb21ad624a5573304dad3fda800a1eef6fb7469496a7890a45','exact historical Release checkpoints');
const checkpoints=JSON.parse(gunzipSync(packed));

export function readHistoricalReleaseCheckpoint(name){
 assert(Object.hasOwn(commits,name),'registered historical checkpoint: '+name);
 const {commit,files,rereads}=checkpoints[name];
 assert.equal(commit,commits[name]);
 return {rereads,read(path){
  assert(Object.hasOwn(files,path),'registered historical checkpoint owner: '+path);
  const binding=files[path],source=binding.source??sourceEpoch.proof.current[path]?.source;
  assert.equal(typeof source,'string','historical checkpoint owner available: '+path);
  assert.equal(digest(source),binding.sha256,'exact historical checkpoint owner: '+path);
  return source;
 }};
}
