// Append-only production continuation after the immutable 572 checkpoint.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./pc-after-fix-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'548900839627458b6ff40378143c7d69f208d95ff55482a52fce253b5fb291e4','complete appended production source packet');
export const pcAfterFixPacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPcAfterFixSource(original,packet=pcAfterFixPacket){
 const prior=original.proof;
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'57201aa97d2498c8c3c4deea8af1c23044c0adaf');
 assert.equal(hash(readFileSync(new URL('./pc-final-source-epoch.json.gz',import.meta.url))),'fc811b3d3f93e0f7dc9a01189349a1d94c6a241231d290031b55de7bab2af5df','immutable original PC production packet');
 assert.equal(packet.currentTreeCommitted,true);
 const changed=Object.keys(packet.current).sort();
 assert.deepEqual(changed,Object.keys(pcAfterFixPacket.current).sort(),'complete approved appended path set');
 assert.deepEqual(packet.current,pcAfterFixPacket.current,'exact approved appended after bindings');
 assert.equal(packet.currentCommit,pcAfterFixPacket.currentCommit,'exact appended production identity');
 assert(changed.length>0);assert.deepEqual(Object.keys(packet.before).sort(),changed);
 assert.deepEqual(Object.keys(packet.producers).sort(),changed);
 const current={...prior.current},added=changed.filter(path=>!Object.hasOwn(prior.current,path));
 for(const path of changed){
  assert.deepEqual(packet.before[path],prior.current[path]??null,'exact complete checkpoint predecessor: '+path);
  assert.notEqual(packet.current[path]?.sha256,packet.before[path]?.sha256,'only changed production bindings');
  current[path]=packet.current[path];
  assert.match(packet.producers[path].commit,/^[a-f0-9]{40}$/);
  for(const parent of packet.producers[path].parents)assert.match(parent,/^[a-f0-9]{40}$/);
 }
 const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,target])=>[name,{...target,
  files:{...target.files,...Object.fromEntries(added.map(path=>[path,null]))}}]));
 assert(!Object.hasOwn(targets,'pcBeforeFix'));
 targets.pcBeforeFix={commit:packet.baseCommit,files:{...prior.current,...Object.fromEntries(added.map(path=>[path,null]))}};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed final production integration; current candidate/device acceptance remains independent',
  pcAfterFixProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
