import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {capacityProblems, powerTipSnapshots, textConflicts} from './helpers/ui-readability.mjs';
test('approved unit details retain complete information and command priority',()=>{
 const result=runLua('tests/lua/approved_enemy_details.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/APPROVED_ENEMY_DETAILS_PASS 11/);
 const snapshots = powerTipSnapshots(result.stdout);
 assert.deepEqual(Object.keys(snapshots), ['jaw-worm-attack', 'raven_adept-buff', 'narrow-power-list', 'long-power-list', 'multi-hit-with-power']);
 for (const [name, rows] of Object.entries(snapshots)) {
   assert.ok(rows.length > 0, name);
   assert.deepEqual(capacityProblems(rows, nativeTheme.layout.nativeText.lineHeight), [], name);
   assert.deepEqual(textConflicts(rows, () => 'tip'), [], name);
   assert.ok(rows.every(row => row.font === 18 && row.minimum === 18 && row.align === 'left' && row.valign === 'middle'), name);
 }
});

test('the shared capacity guard measures visible glyphs and preserves explicit empty lines', () => {
 const row = {path:'copy', kind:'text', visible:true, text:'<color=#ABCDE0>攻势</color>\n\n攻击', font:18, size:[36,120]};
 assert.deepEqual(capacityProblems([row]), []);
 assert.equal(capacityProblems([{...row, size:[36,119]}]).length, 1);
 assert.equal(capacityProblems([{...row, size:[35,120]}]).length, 1);
});
