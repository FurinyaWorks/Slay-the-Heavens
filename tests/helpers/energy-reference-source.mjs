// Append-only exact continuation of the STS1 screenshot correction.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {exactSourceContinuation} from './exact-source-continuation.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const bytes=readFileSync(new URL('../fixtures/energy-reference-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'2b0f8c497c73a8afca47b01a41c7c8800f92c2879202c827df663269329ef19e');
const packet=JSON.parse(gunzipSync(bytes));
assert.equal(packet.base,'9aa835609bf351c7999c6ed9b3c86051b27c7203');
const continuations=new Map();
for(const [path,row]of Object.entries(packet.files)){
 assert.equal(path,row.path);assert.equal(hash(row.before.source),row.before.sha256);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before.source)}\0${row.before.source}`).digest('hex'),row.before.gitBlob);
 continuations.set(path,exactSourceContinuation(row));
}
const rewardBytes=readFileSync(new URL('../fixtures/release-reward-transition-source.json.gz',import.meta.url));
assert.equal(hash(rewardBytes),'a25a1fd1ad58ef7d504ec2743fd32fa6aa2a54c5e4b41734c1f3a9bb092478d2');
const reward=JSON.parse(gunzipSync(rewardBytes));
assert.equal(reward.base,'4ac434d02f0479d92d96da75367f4cab98809a17');
const rewardContinuations=new Map();
for(const [path,row]of Object.entries(reward.files)){
 assert.equal(path,row.path);assert.equal(hash(row.before.source),row.before.sha256);
 assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before.source)}\0`).update(row.before.source).digest('hex'),row.before.gitBlob);
 assert.match(row.after.sha256,/^[a-f0-9]{64}$/);assert.match(row.after.gitBlob,/^[a-f0-9]{40}$/);
 rewardContinuations.set(path,exactSourceContinuation(row));
}
const rewardEntryBytes=readFileSync(new URL('../fixtures/release-reward-entry-source.json.gz',import.meta.url));
assert.equal(hash(rewardEntryBytes),'1ebaf2212130772f299fc9dca4a0664dbdf768a75bd3c5899a52d2efd38b7b1b');
const rewardEntry=JSON.parse(gunzipSync(rewardEntryBytes));
assert.equal(rewardEntry.base,'b0475c90b1ed304375b465e88e8590ec97c957b2');
assert.equal(rewardEntry.path,'src/lua/abyss_feedback.lua');
const priorFeedback=reward.files[rewardEntry.path].after;
assert.equal(hash(rewardEntry.before.source),priorFeedback.sha256);
assert.equal(rewardEntry.before.sha256,priorFeedback.sha256);
assert.equal(rewardEntry.before.gitBlob,priorFeedback.gitBlob);
assert.match(rewardEntry.after.sha256,/^[a-f0-9]{64}$/);
assert.match(rewardEntry.after.gitBlob,/^[a-f0-9]{40}$/);
const rewardEntryContinuation=exactSourceContinuation(rewardEntry);
const rewardFrameBytes=readFileSync(new URL('../fixtures/release-reward-frame-source.json.gz',import.meta.url));
assert.equal(hash(rewardFrameBytes),'09f99aff296875fa9787a94bfd6be19c1a4d76dcb9a33fd6b1f31213d10cd8a5');
const rewardFrame=JSON.parse(gunzipSync(rewardFrameBytes));
assert.equal(rewardFrame.base,'ce5b7434520ab628a7e7eea342dd99a9e19c1b3c');
assert.equal(rewardFrame.path,rewardEntry.path);
const {source:framePriorSource,...framePriorBinding}=rewardFrame.before;
assert.deepEqual(framePriorBinding,rewardEntry.after);
assert.equal(hash(framePriorSource),framePriorBinding.sha256);
assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(framePriorSource)}\0`).update(framePriorSource).digest('hex'),framePriorBinding.gitBlob);
assert.match(rewardFrame.after.sha256,/^[a-f0-9]{64}$/);
assert.match(rewardFrame.after.gitBlob,/^[a-f0-9]{40}$/);
const rewardFrameContinuation=exactSourceContinuation(rewardFrame);
// #827 also changed these two linked owners outside the reward transition archive.
const companionBytes=readFileSync(new URL('../fixtures/release-reward-companion-source.json.gz',import.meta.url));
assert.equal(hash(companionBytes),'f793e5dfb1d4c8b9a6f90d06e59a4aa777a820372ac13a70628e24dd5919ba88','exact #827 companion source archive');
const companions=JSON.parse(gunzipSync(companionBytes));
assert.equal(companions.base,'1896157475ad06417016cdac7b203aa63f3a6d37');
assert.equal(companions.merged,rewardFrame.base);

function matchesCompanion(source,binding){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const text=source.replaceAll('\r\n','\n');
 return hash(text)===binding.sha256 &&
  createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex')===binding.gitBlob;
}

for(const [path,{before,after}] of Object.entries(companions.files)){
 assert(matchesCompanion(before.source,before),'exact #827 companion predecessor: '+path);
 assert.match(after.sha256,/^[a-f0-9]{64}$/);
 assert.match(after.gitBlob,/^[a-f0-9]{40}$/);
}

function beforeRewardCompanion(path,source,read){
 if(!Object.hasOwn(companions.files,path))return source;
 const {before,after}=companions.files[path];
 if(!matchesCompanion(source,after))return source;
 let live;
 try{live=read(path);}catch{assert.fail('combined linked owner missing: '+path);}
 assert(matchesCompanion(live,after),'combined linked owner identity: '+path+' changed during owner validation');
 return source.includes('\r\n')?before.source.replaceAll('\n','\r\n'):before.source;
}

function beforeReward(path,source,read=p=>readFileSync(p,'utf8')){
 if(Object.hasOwn(companions.files,path))return beforeRewardCompanion(path,source,read);
 const earlierFrame=rewardFrameContinuation.predecessor(path,source,read);
 const beforeFrameRead=owner=>{
  const live=read(owner),prior=rewardFrameContinuation.predecessor(owner,live,read);
  if(owner===path&&earlierFrame!==source)
   assert.notEqual(prior,live,'combined linked owner identity: '+path+' changed during owner validation');
  return prior;
 };
 const prior=rewardEntryContinuation.predecessor(path,earlierFrame,beforeFrameRead);
 const priorRead=owner=>rewardEntryContinuation.predecessor(owner,beforeFrameRead(owner),beforeFrameRead);
 return rewardContinuations.get(path)?.predecessor(path,prior,priorRead)??prior;
}
export function beforeEnergyReferenceSource(path,source,read=p=>readFileSync(p,'utf8')){
 const prior=beforeReward(path,source,read);
 return continuations.get(path)?.predecessor(path,prior,owner=>beforeReward(owner,read(owner),read))??prior;
}
export function assertEnergyReferenceCurrent(path,source,read=p=>readFileSync(p,'utf8')){
 if(Object.hasOwn(companions.files,path))
  assert.notEqual(beforeRewardCompanion(path,source,read),source,'fresh energy reference source: '+path);
 if(path===rewardFrame.path){
  const prior=rewardFrameContinuation.predecessor(path,source,read);
  assert.notEqual(prior,source,'fresh energy reference source: '+path);
 }
 if(continuations.has(path)||rewardContinuations.has(path)){
  const prior=rewardContinuations.has(path)?beforeReward(path,source,read):beforeEnergyReferenceSource(path,source,read);
  assert.notEqual(prior,source,'fresh energy reference source: '+path);
 }
}
export function energyReferencePriorRead(read=readFileSync){return(path,encoding)=>{
 const raw=read(path,encoding);if(typeof raw!=='string'&&!Buffer.isBuffer(raw))return raw;
 const text=typeof raw==='string'?raw:raw.toString('utf8');
 const prior=beforeEnergyReferenceSource(path,text,owner=>read(owner,'utf8'));
 return typeof raw==='string'?prior:prior===text?raw:Buffer.from(prior);
};}
