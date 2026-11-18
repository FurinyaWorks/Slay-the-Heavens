// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./potion-regression-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'fff211fab47d021bb4d6cd936a719bba03afcec03f7078aa49d3b165de5b8b2d','complete potion regression production packet');
export const potionRegressionSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPotionRegressionSource(original,packet=potionRegressionSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'f564aea6a3c517b71a85534a81be5e2e36278baf');
 assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.deepEqual(packet.prerequisites,['f564aea6a3c517b71a85534a81be5e2e36278baf']);
 assert.deepEqual(packet.originalSources,potionRegressionSourcePacket.originalSources,'exact original potion regression source producers');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,potionRegressionSourcePacket.currentCommit,'exact committed potion regression producer');
 assert.deepEqual(packet.current,potionRegressionSourcePacket.current,'complete approved potion regression after bindings');
 assert.deepEqual(packet.producers,potionRegressionSourcePacket.producers,'exact potion regression source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete potion regression before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 assert.deepEqual(packet.inheritedSources,potionRegressionSourcePacket.inheritedSources,'exact inherited potion corpus');
 assert.deepEqual(packet.combinedProducers,potionRegressionSourcePacket.combinedProducers,'real three-owner producer lineage');
 for(const [path,row]of Object.entries(packet.inheritedSources))assert.deepEqual(row,prior.current[path],'unchanged inherited potion owner: '+path);
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete potion regression predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed potion regression owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'potionRegressionPrior'));
 targets.potionRegressionPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed potion regression repair; official candidate and device acceptance remain independent',
  potionRegressionProducers:packet.producers,mobileCombinedProducers:packet.combinedProducers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
