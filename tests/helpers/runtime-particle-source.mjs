// One actual Release runtime producer; retain all old corpus views and assertions.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const bytes=readFileSync(new URL('./runtime-particle-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'2cef28e3bd47c3638c421c9f152453b7e446501f69e32bdaac39417a3731ad6a','complete runtime particle production packet');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const runtimeParticleSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendRuntimeParticleSource(original,packet=runtimeParticleSourcePacket){
 assert.deepEqual(packet,runtimeParticleSourcePacket,'exact reviewed particle source producer');
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.equal(packet.currentCommit,'befd480817b0f7c875de189863d37e803704ad3a');
 assert.equal(verifyParticleGitProof(packet.gitProofs.before,packet.before['src/lua/abyss_monster_intent_particle_view.lua']),packet.baseCommit);
 assert.equal(verifyParticleGitProof(packet.gitProofs.current,packet.current['src/lua/abyss_monster_intent_particle_view.lua']),packet.currentCommit);
 const prior=original.proof,path='src/lua/abyss_monster_intent_particle_view.lua';
 assert.deepEqual(Object.keys(packet.current),[path]);assert.deepEqual(Object.keys(packet.before),[path]);
 assert.deepEqual(packet.before[path],prior.current[path],'exact current particle predecessor');
 const current={...prior.current,...packet.current},targets={...prior.targets};
 assert(!Object.hasOwn(targets,'runtimeParticlePrior'));
 targets.runtimeParticlePrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'actual one-owner Release intent particle static publication producer; phone and SDK acceptance remain independent'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
// Exact offline Git objects: shallow CI needs no extra fetch or installed Git.
export function verifyParticleGitProof(proof,binding){
 const objectHash=(type,b)=>createHash('sha1').update(`${type} ${b.length}\0`).update(b).digest('hex');
 const commit=Buffer.from(proof.rawCommit,'base64');assert.equal(objectHash('commit',commit),proof.commit,'actual Git commit object');
 let next=/^tree ([a-f0-9]{40})\n/.exec(commit.toString('utf8'))?.[1];assert(next);
 const names=['src','lua','abyss_monster_intent_particle_view.lua'];assert.equal(proof.trees.length,names.length);
 for(const [i,encoded]of proof.trees.entries()){
  const bytes=Buffer.from(encoded,'base64');assert.equal(objectHash('tree',bytes),next,'actual Git tree object');
  let found=null;
  for(let at=0;at<bytes.length;){const end=bytes.indexOf(0,at);assert(end>at&&end+21<=bytes.length);
   const header=bytes.subarray(at,end).toString('utf8'),name=header.slice(header.indexOf(' ')+1),id=bytes.subarray(end+1,end+21).toString('hex');
   if(name===names[i]){assert.equal(found,null);found=id;}at=end+21;
  }
  assert(found,'complete Git path');next=found;
 }
 assert.equal(next,binding.gitBlob);assert.equal(objectHash('blob',Buffer.from(binding.source)),next,'actual Git source blob');
 return proof.commit;
}
