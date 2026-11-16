// Committed orthogonal shop dismissal and actual landed selection/map composition.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./shop-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'6eac8fe5ad19c6506df977795c4a9bc9dbec276474d3bc85365871bf32976c37','complete shop post697 production packet');
export const shopPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendShopPost697Source(original,packet=shopPost697SourcePacket){
 const prior=original.proof;
 assert.deepEqual(packet,shopPost697SourcePacket,'exact committed shop and actual Release identities');
 assert.equal(packet.currentTreeCommitted,true);
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'actual landed Release predecessor: '+path);current[path]=row;
 }
 const shop={...current,...packet.shopBeforeMap};
 const targets={...prior.targets,shopPost697Release:{commit:packet.baseCommit,files:prior.current},shopBeforeMap:{commit:packet.shopCommit,files:shop}};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'real committed shop and landed selection/map union; device acceptance separate'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
