// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./release-selection-map-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'0c056c020ad655d5a2a901a6f196350582eaf0709afa736f363a0d68509daf62','complete release selection map production packet');
export const releaseSelectionMapSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendReleaseSelectionMapSource(original,packet=releaseSelectionMapSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.deepEqual(paths,["src/lua/abyss_game_ui_input.lua", "src/lua/abyss_game_ui_view.lua"],'only the approved selection map owners advance');
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,releaseSelectionMapSourcePacket.currentCommit,'exact committed release selection map producer');
 assert.deepEqual(packet.current,releaseSelectionMapSourcePacket.current,'complete approved release selection map after bindings');
 assert.deepEqual(packet.producers,releaseSelectionMapSourcePacket.producers,'exact release selection map source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete release selection map before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete release selection map predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed release selection map owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'releaseSelectionMapPrior'));
 targets.releaseSelectionMapPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed release selection map repair; official candidate and device acceptance remain independent',
  releaseSelectionMapProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
