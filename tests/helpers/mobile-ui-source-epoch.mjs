import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
import {mobileUiBase,mobileUiProducers} from './mobile-ui-source-plan.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./mobile-ui-source-epoch.json.gz',import.meta.url));
assert.equal(hash(bytes),'3af193f44e4194756a1ca1b60c3319d5d26f3a5bacce0534d5f9eb02dbd7c4b5','complete seven-owner mobile continuation');
export const mobileUiPacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendMobileUiEpoch(original,packet=mobileUiPacket){
 const prior=original.proof;
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');assert.equal(packet.baseCommit,mobileUiBase);
 assert.equal(packet.priorSessionPacketSha256,'bba0ec427b8c036d15149cfff4800f3559f6dbf2f282e22368e30afdc3805665');
 assert.equal(hash(readFileSync(new URL('./session-menu-source-epoch.json.gz',import.meta.url))),packet.priorSessionPacketSha256);
 assert.equal(packet.groups.length,mobileUiProducers.length);
 const current={...prior.current},producers={};
 packet.groups.forEach((group,i)=>{
  const plan=mobileUiProducers[i];
  assert.equal(group.name,plan.name);assert.equal(group.producerCommit,plan.commit);assert.equal(group.parentCommit,plan.parent);
  assert.deepEqual(Object.keys(group.before),plan.paths);assert.deepEqual(Object.keys(group.current),plan.paths);
  for(const path of plan.paths){
   assert.deepEqual(group.before[path],prior.current[path],'exact complete P0 predecessor: '+path);
   assert.notEqual(group.current[path].sha256,prior.current[path].sha256,'changed independent owner');
   assert(!Object.hasOwn(producers,path),'one explicit producer per changed owner');
   current[path]=group.current[path];producers[path]={commit:plan.commit,parent:plan.parent};
  }
 });
 assert.equal(Object.keys(producers).length,7);
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'mobileUiPrior'));
 targets.mobileUiPrior={commit:mobileUiBase,files:prior.current};
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,currentTreeCommitted:false,
  currentCommit:mobileUiProducers.at(-1).commit,
  currentCommitRole:'last one-owner transition producer only; seven owners bind separate independent producer and parent commits; private composition tree is not a producer',
  mobileUiProducers:producers,targets,owners}),{allowConfigLayout:true,reuseFrozenInput:true});
}
