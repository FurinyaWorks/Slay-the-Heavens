import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./portrait-idle-source-epoch.json.gz',import.meta.url));
assert.equal(hash(bytes),'d55832cf0d0dc21ab209765ed77217e2c7405b9511c5982eef35e8db6773db46','complete portrait atomic-publication source witness');
export const portraitIdlePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendPortraitIdleEpoch(original,packet=portraitIdlePacket){
 const prior=original.proof,path='src/lua/abyss_traveler_portraits.lua';
 assert.equal(packet.schemaVersion,1);assert.equal(packet.normalization,'LF');
 assert.equal(packet.baseCommit,'df2efb4225de667fa3daf4c71296198b0a579866');
 assert.equal(packet.currentCommit,'7b2b178b1d3bb045d0c74a7fcf86513723f334ae','one real portrait producer');
 assert.equal(packet.priorMobileUiPacketSha256,'3af193f44e4194756a1ca1b60c3319d5d26f3a5bacce0534d5f9eb02dbd7c4b5');
 assert.equal(hash(readFileSync(new URL('./mobile-ui-source-epoch.json.gz',import.meta.url))),packet.priorMobileUiPacketSha256);
 assert.deepEqual(Object.keys(packet.before),[path]);assert.deepEqual(Object.keys(packet.current),[path]);
 assert.deepEqual(packet.before[path],prior.current[path],'complete original seven-owner tree portrait predecessor');
 assert.notEqual(packet.current[path].sha256,prior.current[path].sha256);
 const current={...prior.current,...packet.current},targets={...prior.targets};
 assert.deepEqual(Object.keys(current),Object.keys(prior.current),'same complete352-source inventory');
 assert(!Object.hasOwn(targets,'portraitIdlePrior'));
 targets.portraitIdlePrior={commit:packet.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,currentTreeCommitted:false,
  currentCommit:packet.currentCommit,
  currentCommitRole:'exact one-owner approved-idle publication producer only; seven prior owners retain separate original producers and parents; no whole-tree producer claim',
  portraitIdleProducer:{path,commit:packet.currentCommit,parent:packet.baseCommit},targets,owners}),{allowConfigLayout:true,reuseFrozenInput:true});
}
