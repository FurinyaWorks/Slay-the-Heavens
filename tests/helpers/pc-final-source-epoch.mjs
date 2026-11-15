// Complete current production continuation. Earlier packets and views stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const bytes=readFileSync(new URL('./pc-final-source-epoch.json.gz',import.meta.url));
assert.equal(hash(bytes),'fc811b3d3f93e0f7dc9a01189349a1d94c6a241231d290031b55de7bab2af5df','complete PC final production continuation');
export const pcFinalPacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPcFinalSourceEpoch(original,packet=pcFinalPacket){
 const prior=original.proof;
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'7cbdbddacfc9a9ef0eb1231c9f167057ea329396');
 assert.equal(packet.currentTreeCommitted,true);
 assert.equal(hash(readFileSync(new URL('./portrait-idle-source-epoch.json.gz',import.meta.url))),packet.priorPortraitPacketSha256);
 const paths=Object.keys(packet.current).sort();
 assert.deepEqual(Object.keys(packet.before).sort(),paths,'complete before/after production path union');
 for(const path of Object.keys(prior.current))assert.deepEqual(packet.before[path],prior.current[path],'exact pre-final production binding: '+path);
 const added=paths.filter(path=>!Object.hasOwn(prior.current,path));
 for(const path of added)assert.equal(packet.before[path],null,'new module has explicit historical absence: '+path);
 const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,target])=>[name,{...target,
  files:{...target.files,...Object.fromEntries(added.map(path=>[path,null]))}}]));
 assert(!Object.hasOwn(targets,'pcFinalPrior'));
 targets.pcFinalPrior={commit:prior.currentCommit,files:packet.before};
 const current=packet.current;
 const changed=paths.filter(path=>packet.before[path]?.sha256!==current[path]?.sha256);
 assert.deepEqual(Object.keys(packet.producers).sort(),changed,'one source producer for every changed/new module');
 for(const row of Object.values(packet.producers)){
  assert.match(row.commit,/^[a-f0-9]{40}$/);assert(Array.isArray(row.parents));
  for(const parent of row.parents)assert.match(parent,/^[a-f0-9]{40}$/);
 }
 const owners=paths.filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,
  currentTreeCommitted:true,currentCommit:packet.currentCommit,
  currentCommitRole:'exact committed private production integration; not an official candidate/device or release acceptance',
  pcFinalProducers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
