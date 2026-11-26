import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import {releaseUiRestoreArchive} from './release-ui-restore-source.mjs';

const replayBase='02dcb2466b2c90308f9a9e42896c2c5af3ed288c';
const renamedOwners=Object.freeze({
 'src/lua/abyss_blue_slaver_ai.lua':'src/lua/abyss_blue_guard_ai.lua',
 'src/lua/abyss_drug_dealer_event.lua':'src/lua/abyss_augmenter_event.lua',
 'src/lua/abyss_red_slaver_ai.lua':'src/lua/abyss_red_guard_ai.lua',
});
let owners;
function reviewedSelectionOwners(){
 if(owners)return owners;
 const reward=releaseUiRestoreArchive(
  readFileSync(new URL('./reward-current-source.json.gz',import.meta.url)),
  'a68d10abe6e6f3bd33a69f85326d34dce1250b34b6892543cb5c1314c01f3b9f',replayBase);
 const selection=releaseUiRestoreArchive(
  readFileSync(new URL('./reviewed-selection-current-source.json.gz',import.meta.url)),
  'ae2612caad5be7b4589812d9f0580b17bf99e775e53db38c093f79ff46c4cebb',replayBase);
 assert.equal(Object.keys(reward.files).length,51,'shared reward sources in reviewed Selection replay');
 assert.equal(Object.keys(selection.files).length,58,'additional reviewed Selection replay sources');
 const registered=new Map([...Object.entries(reward.files),...Object.entries(selection.files)]);
 assert.equal(registered.size,109,'distinct reviewed Selection replay owners');
 for(const path of Object.keys(renamedOwners))assert(registered.has(path),'registered renamed Selection owner: '+path);
 owners=registered;
 return owners;
}

// The original replay still walks and checks its whole closure. Bind only
// known current owners here and reread each one whenever that closure asks.
export function reviewedSelectionRead(read=readFileSync){
 const registered=reviewedSelectionOwners();
 return (path,encoding='utf8')=>{
  const row=registered.get(path);
  if(!row)return read(path,encoding);
  const active=Object.hasOwn(renamedOwners,path)?renamedOwners[path]:path;
  if(active!==path)assert.throws(()=>read(path,'utf8'),{code:'ENOENT'},'legacy Selection owner must stay absent: '+path);
  const source=read(active,'utf8');
  assert(exactSourceMatches(source,row.after),'fresh reviewed Selection production owner: '+active);
  return encoding==='utf8'?row.before.source:Buffer.from(row.before.source);
 };
}
