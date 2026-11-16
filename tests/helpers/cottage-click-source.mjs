// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./cottage-click-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'edb0c369e9230c768123999e2509402e0c508ce872b4aff87e17a94e95df9284','complete mobile cottage production packet');
export const cottageClickSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendCottageClickSource(original,packet=cottageClickSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'3e96a1589435f8b06645db095775a789f24b1350');
 assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.deepEqual(packet.prerequisites,['3e96a1589435f8b06645db095775a789f24b1350']);
 assert.deepEqual(packet.originalSources,cottageClickSourcePacket.originalSources,'exact original cottage source producers');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,cottageClickSourcePacket.currentCommit,'exact committed mobile cottage producer');
 assert.deepEqual(packet.current,cottageClickSourcePacket.current,'complete approved mobile cottage after bindings');
 assert.deepEqual(packet.producers,cottageClickSourcePacket.producers,'exact mobile cottage source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete mobile cottage before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 assert.deepEqual(packet.inheritedSources,cottageClickSourcePacket.inheritedSources,'exact inherited potion corpus');
 assert.deepEqual(packet.combinedProducers,cottageClickSourcePacket.combinedProducers,'real five-owner producer lineage');
 for(const [path,row]of Object.entries(packet.inheritedSources))assert.deepEqual(row,prior.current[path],'unchanged inherited potion owner: '+path);
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete mobile cottage predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed mobile cottage owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 assert.equal(packet.legacyCommit,'89f3d88c47b72d843db113be5a2e91896cf1f869');
 assert.deepEqual(packet.legacyCurrent,cottageClickSourcePacket.legacyCurrent,'complete real historical cottage production');
 const targets={...prior.targets,cottageRegressionLegacy:{commit:packet.legacyCommit,files:packet.legacyCurrent}};assert(!Object.hasOwn(targets,'cottageClickPrior'));
 targets.cottageClickPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed mobile cottage repair; official candidate and device acceptance remain independent',
  cottageClickProducers:packet.producers,mobileCombinedProducers:packet.combinedProducers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
