// Exact Release reward continuation; all complete predecessor views stay immutable.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const bytes=readFileSync(new URL('./blue-candle-source.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'d8be56143b70efd9c73f91716f77163f877604b75d6bfe93d71ee014f954fed0','complete blue candle production packet');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export const blueCandleSourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendBlueCandleSource(original,packet=blueCandleSourcePacket){
 assert.deepEqual(packet,blueCandleSourcePacket,'exact complete blue candle production bindings');
 const prior=original.proof,paths=Object.keys(packet.current);
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
 assert.equal(packet.producerCommit,'23bed75c642f8f4af5c2783526a5afc4a57f471f');
 assert.deepEqual(paths,['src/lua/abyss_battle_reward_layout.lua']);
 assert.deepEqual(Object.keys(packet.before),paths);
 for(const path of paths)assert.deepEqual(packet.before[path],prior.current[path],'exact reward source predecessor: '+path);
 const current={...prior.current,...packet.current};
 const targets={...prior.targets,blueCandlePrior:{commit:packet.baseCommit,files:prior.current}};
 assert(!Object.hasOwn(prior.targets,'blueCandlePrior'));
 const owners=Object.keys(current).filter(path=>Object.values(targets).some(t=>t.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentCommit:packet.currentCommit,
  currentTreeCommitted:false,currentCommitRole:'committed reward/profile checkpoint; auxiliary source continuation captured separately'}),
 {allowConfigLayout:true,reuseFrozenInput:true});
}
