// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./mobile-hand-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'f09812ac4f7c422d8a4530a8efa9ca0e35048eb1a2f4a7940495d76495f5ee4c','complete mobile hand production packet');
export const mobileHandSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendMobileHandSource(original,packet=mobileHandSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'b67226945c2be47c8fff31f1362412b973f68875');
 assert.equal(packet.releaseBase,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.deepEqual(packet.prerequisites,['b67226945c2be47c8fff31f1362412b973f68875']);
 assert.deepEqual(packet.originalSources,mobileHandSourcePacket.originalSources,'exact original hand source producers');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,mobileHandSourcePacket.currentCommit,'exact committed mobile hand producer');
 assert.deepEqual(packet.current,mobileHandSourcePacket.current,'complete approved mobile hand after bindings');
 assert.deepEqual(packet.producers,mobileHandSourcePacket.producers,'exact mobile hand source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete mobile hand before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete mobile hand predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed mobile hand owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'mobileHandPrior'));
 targets.mobileHandPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed mobile hand repair; official candidate and device acceptance remain independent',
  mobileHandProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
