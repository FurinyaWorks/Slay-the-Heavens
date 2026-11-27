import {preBattleLifeSource} from './battle-life-source-inverse.mjs';
import {preEventProductionSource} from './event-production-source-inverse.mjs';
import {preHeroVisualSource} from './hero-visual-source-inverse.mjs';
import {preRelicViewUiSource} from './relic-view-ui-inverse.mjs';
import {preAcceptedPr323Source} from './pr323-accepted-source-inverse.mjs';
import {preBattleRefactorLayer} from './battle-refactor-projection.mjs';
import {preIntegratedNodeUiSource} from './approved-node-ui-refactor.mjs';
import {beforeReleaseClosureFixture} from './release-closure-fixture-source.mjs';
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {exactSourceMatches} from './source-fingerprint.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const hash=value=>value===null?null:createHash('sha256').update(value).digest('hex');
const bytes=readFileSync(new URL('../fixtures/approved-ui-latest-to-53fa.json',import.meta.url));
assert.equal(hash(bytes),'39f651e8ec7a3037947d1a76123c2d03a521dd4a05168565f80f7222590ec89a','complete reviewed current UI source binding');
export const approvedUi=JSON.parse(bytes);
// Invert only PR319's exact test registrar, before the immutable UI witness.
function preBoundedPotionFailuresSource(path,source){
 if(path!=='tests/lua/battle_ui_potion_target_failures.lua'||source===null)return source;
 source=source.replaceAll('\r\n','\n');
 const prefix='local sliceFirst,sliceLast=...\nsliceFirst,sliceLast=sliceFirst or 1,sliceLast or 3\nlocal sliceRegistered,sliceExecuted=0,0\n';
 if(!source.startsWith(prefix))return source;
 assert.equal(hash(source),'49dcd4b8dfeb5c8fcac998e57c1a8fdc01f8f087959fa723470fcc36136cbf75','unreviewed integrated bounded potion failure source drift: '+path);
 const footer='\nassert(sliceRegistered==7,"all 7 original cases must register")\nassert(sliceExecuted==sliceLast-sliceFirst+1,"every selected original case must execute")\nprint("BATTLE_UI_POTION_TARGET_FAILURES_SLICE "..sliceFirst.." "..sliceLast.." "..sliceExecuted)\n';
 assert.ok(source.endsWith(footer),'exact bounded potion failure footer');
 const before='local test,finish = H.suite("LUA_POTION_TARGET_FAILURES")\n';
 const after='local originalTest,finish = H.suite("LUA_POTION_TARGET_FAILURES")\nlocal function test(name,fn)\n    sliceRegistered=sliceRegistered+1\n    if sliceRegistered>=sliceFirst and sliceRegistered<=sliceLast then\n        originalTest(name,fn);sliceExecuted=sliceExecuted+1\n        print("BATTLE_UI_POTION_TARGET_FAILURES_CASE "..sliceRegistered)\n    end\nend\n';
 let original=source.slice(prefix.length,-footer.length);
 assert.equal(original.split(after).length,2,'one exact bounded potion registration inverse');
 original=original.replace(after,before);
 assert.equal(hash(original),'47565faaad06cbf34edf208a30d922ab4975b19a5025dc751c379ff6ed2d83a9','complete accepted potion failure source recovered before the frozen UI guard');
 return original;
}
// #391 adds native monster control selectors after the exact #313 fixture.
// Compose its successor solely for this earlier approved-UI witness.
const nemesisControlFixture=Object.freeze({
 "path": "tests/lua/nemesis_ui.lua",
 "beforeSha256": "736a67ba3158850ad67d716b7ec62fe8ac6629d0b24ff673b1b7e975ddd340d9",
 "beforeBlob": "b615f3f06cc8fad9a78c7aa88360bea1c1df08b0",
 "afterSha256": "4c3655ba6d08705d742e307aa56d6d2fadfb67c5379df2462e0a04792ebee4d7",
 "afterBlob": "02fc4d2e206fe7447fc8e8a186494603faa25b66",
 "hunks": [
  {
   "at": 0,
   "before": "local testStart=dofile('tests/lua/support/game_ui_fixture.lua').start",
   "after": "local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')\nlocal testStart=dofile('tests/lua/support/game_ui_fixture.lua').start"
  },
  {
   "at": 13,
   "before": "assert(N.Run.startRoomCombat(r,'elite'));N.force(r.combat,'burn');host:refresh()\nlocal panel=root:GetChild('battlePanel');local box=panel:GetChild('enemy1');local _,tap=H.controls(panel)\neq(box:GetChild('name').text,'天罚');eq(box:GetChild('hp').text,'185/185')",
   "after": "assert(N.Run.startRoomCombat(r,'elite'));N.force(r.combat,'burn');host:refresh()\nlocal panel=root:GetChild('battlePanel');local box=monsterControl(panel,'enemy1');local _,tap=H.controls(panel)\neq(box:GetChild('name').text,'天罚');eq(box:GetChild('hp').text,'185/185')"
  },
  {
   "at": 20,
   "before": "assert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()\neq(box:GetChild('intent').text,'6×3')\nbox:GetChild('statusRow'):GetChild('hit').click({touchId=92})\nlocal info=panel:GetChild('statusInfo');assert(info.visible)",
   "after": "assert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()\neq(box:GetChild('intent').text,'6x3')\ndofile('tests/lua/support/monster_power_control_fixture.lua')(box,'nemesis_intangible'):GetChild('hit').click({touchId=92})\nlocal info=panel:GetChild('statusInfo');assert(info.visible)"
  }
 ]
});
function preNemesisControlFixture(path,source){
 if(path!==nemesisControlFixture.path||typeof source!=='string')return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const current=beforeReleaseClosureFixture(path,source);
 if(!exactSourceMatches(current,{sha256:nemesisControlFixture.afterSha256,gitBlob:nemesisControlFixture.afterBlob}))return current;
 assert.equal(approvedUi.files[path].afterSha256,nemesisControlFixture.beforeSha256,'exact approved Nemesis control predecessor binding');
 const prior=restoreExactFixtureHunks(nemesisControlFixture,path,current);
 assert(exactSourceMatches(prior,{sha256:nemesisControlFixture.beforeSha256,gitBlob:nemesisControlFixture.beforeBlob}),
  'exact approved Nemesis control predecessor');
 return source===lf?prior:prior.replaceAll('\n','\r\n');
}
// One additional test-only layer, never a replacement for PR302's frozen 26
// sources or the original 79543/79757/81392 write proofs and runner budgets.
export function preApprovedUiOuterSource(path,source){
 source=preNemesisControlFixture(path,preBattleLifeSource(path,source));
 if(path==='tests/lua/spike_slime_l_ui.lua')source=beforeReleaseClosureFixture(path,source);
 return approvedUi.files[path]?preEventProductionSource(path,preRelicViewUiSource(path,preHeroVisualSource(path,source))):source;
}
export function preApprovedUiSource(path,source){
 source=preApprovedUiOuterSource(path,source);
 source=preAcceptedPr323Source(path,source);
 source=preBattleRefactorLayer(path,source);
 source=preBoundedPotionFailuresSource(path,source);
 source=preIntegratedNodeUiSource(path,source);
 const binding=approvedUi.files[path];
 if(!binding)return source;
 source=source===null?null:source.replaceAll('\r\n','\n');
 if(hash(source)===binding.beforeSha256)return source;
 assert.equal(hash(source),binding.afterSha256,
  'unreviewed integrated presentation source drift; unreviewed integrated retirement source drift: '+path);
 const lines=source.split('\n');
 for(const hunk of [...binding.hunks].reverse()){
  assert.deepEqual(lines.slice(hunk.at,hunk.at+hunk.after.length),hunk.after,'exact approved UI source hunk and position: '+path);
  lines.splice(hunk.at,hunk.after.length,...hunk.before);
 }
 const previous=binding.beforeSha256===null?null:lines.join('\n');
 if(previous===null)assert.equal(lines.length,0,'only a fully bound added source may disappear from a temporary historical tree');
 assert.equal(hash(previous),binding.beforeSha256,'complete PR302 source recovered: '+path);
 return previous;
}
