// Real committed item/title/shadow and landed selection/map source union.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./item-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'d8c95e170d3c4f70b1b8067c8e596fc4079742abc07adf6bb9ad0708389066e7','complete item post697 production packet');
export const itemPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendItemPost697Source(original,itemEpoch,packet=itemPost697SourcePacket){
 const prior=original.proof,item=itemEpoch.proof;
 assert.deepEqual(packet,itemPost697SourcePacket,'exact committed hand and actual Release identities');
 assert.equal(packet.currentTreeCommitted,true);assert.equal(item.currentCommit,packet.itemProductCheckpoint);
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'actual landed Release predecessor: '+path);current[path]=row;
 }
 assert.deepEqual({...current,...packet.itemBeforeMap},item.current,'complete original item source domain');
 const targets={...prior.targets};
 for(const [name,target]of Object.entries(item.targets)){
  if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'shared history remains exact: '+name);
  else targets[name]=target;
 }
 targets.itemPost697Release={commit:packet.baseCommit,files:prior.current};
 targets.itemBeforeMap={commit:packet.itemCommit,files:item.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,releaseItemTitleShadowProducers:item.releaseItemTitleShadowProducers,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'actual item/title/shadow and landed Map union; device acceptance separate'}),{allowConfigLayout:true,reuseFrozenInput:true});
}
