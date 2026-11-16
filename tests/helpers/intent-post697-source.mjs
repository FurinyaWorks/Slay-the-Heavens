// Committed orthogonal intent dismissal and actual landed selection/map composition.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./intent-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'d16dcb304accfbf8e00a5035c450849afcf3256ce53a4a1802ab8f766f342a59','complete intent post697 production packet');
export const intentPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendIntentPost697Source(original,packet=intentPost697SourcePacket){
 const prior=original.proof;
 assert.deepEqual(packet,intentPost697SourcePacket,'exact committed intent and actual Release identities');
 assert.equal(packet.currentTreeCommitted,true);
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'actual landed Release predecessor: '+path);current[path]=row;
 }
 const intent={...current,...packet.intentBeforeMap};
 const targets={...prior.targets,intentPost697Release:{commit:packet.baseCommit,files:prior.current},intentBeforeMap:{commit:packet.intentCommit,files:intent}};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'real committed intent and landed selection/map union; device acceptance separate'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
