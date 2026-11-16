// Real committed union; the independent enemy and landed-selection domains remain explicit.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const bytes=readFileSync(new URL('./enemy-post697-source.json.gz',import.meta.url));
assert.equal(hash(bytes),'fdae2d3627b986b59c9a3a87470e36b7e46a59df99cf22ea45a3cab3467e6da7','complete enemy post697 production packet');
export const enemyPost697SourcePacket=freeze(JSON.parse(gunzipSync(bytes)));
export function extendEnemyPost697Source(original,legacy,packet=enemyPost697SourcePacket){
 const prior=original.proof,historical=legacy.proof;
 for(const key of ['schemaVersion','normalization','baseCommit','selectionCommit','currentCommit','currentTreeCommitted','inputs','selectionProductCommit','before','current','producers','inheritedEnemy'])assert.deepEqual(packet[key],enemyPost697SourcePacket[key],'exact committed enemy/selection '+key);
 assert.equal(packet.schemaVersion,1);assert.equal(packet.currentTreeCommitted,true);
 assert.equal(historical.currentCommit,packet.selectionProductCommit,'real immutable selection producer');
 const current={...prior.current};
 for(const [path,row]of Object.entries(packet.inheritedEnemy))assert.deepEqual(prior.current[path],row,'unchanged enemy source: '+path);
 for(const [path,row]of Object.entries(packet.current)){
  assert.deepEqual(prior.current[path],packet.before[path],'real enemy predecessor: '+path);
  assert.deepEqual(historical.current[path],row,'real landed selection production: '+path);current[path]=row;
 }
 const targets={...prior.targets};
 for(const [name,target]of Object.entries(historical.targets)){
  if(Object.hasOwn(targets,name))assert.deepEqual(targets[name],target,'shared immutable historical target '+name);else targets[name]=target;
 }
 assert(!Object.hasOwn(targets,'enemyBeforeSelection'));assert(!Object.hasOwn(targets,'selectionMapLanded'));
 targets.enemyBeforeSelection={commit:packet.baseCommit,files:prior.current};
 targets.selectionMapLanded={commit:packet.selectionCommit,files:historical.current};
 const owners=Object.keys(current).sort().filter(path=>Object.values(targets).some(target=>target.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,current,targets,owners,currentCommit:packet.currentCommit,currentTreeCommitted:true,currentCommitRole:'real committed enemy and actual landed selection-map union; source and device acceptance independent',enemyPost697Producers:packet.producers}),{allowConfigLayout:true,reuseFrozenInput:true});
}
