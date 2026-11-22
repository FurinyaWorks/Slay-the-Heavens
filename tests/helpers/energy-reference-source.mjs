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
function beforeReward(path,source,read=p=>readFileSync(p,'utf8')){
 return rewardContinuations.get(path)?.predecessor(path,source,read)??source;
}
export function beforeEnergyReferenceSource(path,source,read=p=>readFileSync(p,'utf8')){
 const prior=beforeReward(path,source,read);
 return continuations.get(path)?.predecessor(path,prior,owner=>beforeReward(owner,read(owner),read))??prior;
}
export function assertEnergyReferenceCurrent(path,source,read){
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
