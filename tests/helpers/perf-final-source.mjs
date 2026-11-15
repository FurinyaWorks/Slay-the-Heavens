// Append-only production continuation after immutable 1f; builders belong to the CI layer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./perf-final-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'8508b6cae05983cb2465a5ea6c91a382f199a72db3dd7270773c0a7b476f2f44','complete appended production source packet');
export const perfFinalPacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPerfFinalSource(original,packet=perfFinalPacket){
 const prior=original.proof;
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'1f7ce04c53189db8c39b59c797a45d57a2c7bac1');
 assert.equal(hash(readFileSync(new URL('./pc-final-source-epoch.json.gz',import.meta.url))),'fc811b3d3f93e0f7dc9a01189349a1d94c6a241231d290031b55de7bab2af5df','immutable original PC production packet');
 assert.equal(packet.currentTreeCommitted,true);
 const changed=Object.keys(packet.current).sort();
 assert.deepEqual(changed,Object.keys(perfFinalPacket.current).sort(),'complete approved appended path set');
 assert.deepEqual(packet.current,perfFinalPacket.current,'exact approved appended after bindings');
 assert.equal(packet.currentCommit,perfFinalPacket.currentCommit,'exact appended production identity');
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
 assert(!Object.hasOwn(targets,'perfBefore'));
 targets.perfBefore={commit:packet.baseCommit,files:{...prior.current,...Object.fromEntries(added.map(path=>[path,null]))}};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'exact committed final production integration; current candidate/device acceptance remains independent',
  perfFinalProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
