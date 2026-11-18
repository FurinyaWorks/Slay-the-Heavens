// One release-only continuation; the complete predecessor and targets are retained.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./release-pc22-basic-feedback-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'1cb0fddfea365de7be5331dc169bd438f2cde36b372c4c15bf9c8ac8a2eed157','complete release PC22 basic feedback production packet');
export const releasePc22BasicFeedbackSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendReleasePc22BasicFeedbackSource(original,packet=releasePc22BasicFeedbackSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.deepEqual(paths,["src/lua/abyss_card_flow.lua"],'only the approved PC22 basic feedback owners advance');
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,releasePc22BasicFeedbackSourcePacket.currentCommit,'exact committed release PC22 basic feedback producer');
 assert.deepEqual(packet.current,releasePc22BasicFeedbackSourcePacket.current,'complete approved release PC22 basic feedback after bindings');
 assert.deepEqual(packet.producers,releasePc22BasicFeedbackSourcePacket.producers,'exact release PC22 basic feedback source producers');
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete release PC22 basic feedback before/after slice');
 assert.deepEqual(Object.keys(packet.producers).sort(),paths,'source producer for every changed owner');
 const current={...prior.current};
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact complete release PC22 basic feedback predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256,'only changed release PC22 basic feedback owners');
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'releasePc22BasicFeedbackPrior'));
 targets.releasePc22BasicFeedbackPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed release PC22 basic feedback repair; official candidate and device acceptance remain independent',
  releasePc22BasicFeedbackProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
