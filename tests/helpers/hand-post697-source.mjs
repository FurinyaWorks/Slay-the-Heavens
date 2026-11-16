// Real committed hand-values and landed selection/map source union.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./hand-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'7d531647cb94d560e821f63032ac123772a647c3f604578e2470412304cd8509','complete hand post697 production packet');
export const handPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendHandPost697Source(original,handEpoch,packet=handPost697SourcePacket){
 const prior=original.proof,hand=handEpoch.proof;
 assert.deepEqual(packet,handPost697SourcePacket,'exact committed hand and actual Release identities');
 assert.equal(packet.currentTreeCommitted,true);assert.equal(hand.currentCommit,packet.handProductCheckpoint);
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'actual landed Release predecessor: '+path);current[path]=row;
 }
 assert.deepEqual({...current,...packet.handBeforeMap},hand.current,'complete original hand source domain');
 const targets={...prior.targets};
 for(const [name,target]of Object.entries(hand.targets)){
  if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'shared history remains exact: '+name);
  else targets[name]=target;
 }
 targets.handPost697Release={commit:packet.baseCommit,files:prior.current};
 targets.handBeforeMap={commit:packet.handCommit,files:hand.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,mobileHandProducers:hand.mobileHandProducers,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'actual hand values and landed Map union; device acceptance separate'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
