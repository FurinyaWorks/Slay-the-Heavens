// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./release-picker-controls-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'8846606fcc1f08c98923d51c6a23f58820f9ee74b95c64d018584dd02a808ba4','complete release picker controls production packet');
export const releasePickerControlsSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendReleasePickerControlsSource(original,packet=releasePickerControlsSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.deepEqual(paths,["src/lua/abyss_node_ui_feedback.lua"],'only the approved picker controls owner advances');
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,releasePickerControlsSourcePacket.currentCommit,'exact committed release picker controls producer');
 assert.deepEqual(packet.current,releasePickerControlsSourcePacket.current,'complete approved release picker controls after bindings');
 assert.deepEqual(packet.producers,releasePickerControlsSourcePacket.producers,'exact release picker controls source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete release picker controls before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete release picker controls predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed release picker controls owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'releasePickerControlsPrior'));
 targets.releasePickerControlsPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed release picker controls repair; official candidate and device acceptance remain independent',
  releasePickerControlsProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
