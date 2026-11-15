// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./mobile-cottage-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'8d1c91696d796fd8b1027c9e37c6d451420ad5be52df916356731d593c972138','complete mobile cottage production packet');
export const mobileCottageSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendMobileCottageSource(original,packet=mobileCottageSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'b67226945c2be47c8fff31f1362412b973f68875');
 assert.equal(packet.releaseBase,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.deepEqual(packet.prerequisites,['b67226945c2be47c8fff31f1362412b973f68875']);
 assert.deepEqual(packet.originalSources,mobileCottageSourcePacket.originalSources,'exact original cottage source producers');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,mobileCottageSourcePacket.currentCommit,'exact committed mobile cottage producer');
 assert.deepEqual(packet.current,mobileCottageSourcePacket.current,'complete approved mobile cottage after bindings');
 assert.deepEqual(packet.producers,mobileCottageSourcePacket.producers,'exact mobile cottage source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete mobile cottage before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete mobile cottage predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed mobile cottage owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'mobileCottagePrior'));
 targets.mobileCottagePrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed mobile cottage repair; official candidate and device acceptance remain independent',
  mobileCottageProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
