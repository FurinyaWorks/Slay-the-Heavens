import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceEpoch,sourceSlice} from './helpers/closeout-source-epoch.mjs';
const witness=JSON.parse(readFileSync('tests/fixtures/compendium-ui-registration-continuation.json','utf8'));
const ui='src/lua/abyss_ui.lua',architecture=witness.path;
const target=Object.keys(sourceEpoch.proof.targets).find(name=>sourceEpoch.proof.targets[name].files[ui]?.sha256===sourceEpoch.proof.current[ui].sha256);
assert(target,'a historical target retains the unchanged UI entry');
function setup(){
 const live=Object.fromEntries(Object.entries(sourceEpoch.proof.current).map(([path,row])=>[path,row?.source??null]));
 live[architecture]=witness.after.source;live[ui]=witness.linkedOwners[ui].after.source;
 return {live,read:path=>live[path]};
}
test('sourceSlice admits the exact new UI even when the historical entry is unchanged',()=>{
 const {read}=setup();
 assert.equal(sourceSlice(ui,witness.linkedOwners[ui].after.source,target,read),sourceEpoch.proof.targets[target].files[ui].source);
});
test('sourceSlice preserves unknown UI and architecture layout without reading owners',()=>{
 for(const [path,source]of [[ui,witness.linkedOwners[ui].after.source+'\n-- foreign\n'],
  [architecture,JSON.stringify(JSON.parse(witness.after.source))]]){
  let calls=0;assert.equal(sourceSlice(path,source,target,()=>{calls++;throw Error('must not read');}),source);assert.equal(calls,0);
 }
});
test('sourceSlice rejects an old raw UI, mixed continuation and a changed core owner',()=>{
 for(const [path,source]of [[ui,witness.linkedOwners[ui].before.source],[architecture,witness.before.source],
  ['src/lua/abyss_actor.lua',sourceEpoch.proof.current['src/lua/abyss_actor.lua'].source+'\n-- changed\n']]){
  const {live,read}=setup();live[path]=source;
  assert.throws(()=>sourceSlice(ui,witness.linkedOwners[ui].after.source,target,read),/raw owner identity|continuation owner pair|combined linked owner identity/);
 }
});
