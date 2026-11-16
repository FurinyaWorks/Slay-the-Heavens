// Sparse continuation of the existing production projector; old packets stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./potion-click-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'823ccaff8ee4d2d6e48fb94c758f9ae11a001c73872fef2a890109de0c8e0dbf','complete potion click production packet');
export const potionClickSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPotionClickSource(original,packet=potionClickSourcePacket){
 const prior=original.proof,paths=Object.keys(packet.current).sort();
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'89dfc774b1c6bb146b91e6064039f4d648db0d33');
 assert.equal(packet.releaseBase,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.deepEqual(packet.prerequisites,[packet.baseCommit]);assert.equal(packet.currentTreeCommitted,true);
 assert.equal(packet.currentCommit,'c126877c31b37396b6148e1101a8dba555d03feb');
 for(const key of ['current','before','producers','inheritedSources','combinedProducers'])
  assert.deepEqual(packet[key],potionClickSourcePacket[key],'exact potion click '+key);
 assert.deepEqual(paths,['src/lua/abyss_battle_ui.lua']);
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.inheritedSources))assert.deepEqual(row,prior.current[path],'unchanged inherited potion click owner: '+path);
 for(const path of paths){
  assert.deepEqual(packet.before[path],prior.current[path],'exact potion click predecessor: '+path);
  assert.notEqual(packet.current[path].sha256,packet.before[path].sha256);
  current[path]=packet.current[path];
 }
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'potionClickPrior'));
 targets.potionClickPrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentTreeCommitted:true,
  currentCommit:packet.currentCommit,currentCommitRole:'committed click-only capability repair; official and device acceptance independent',
  potionClickProducers:packet.producers,mobileCombinedProducers:packet.combinedProducers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
