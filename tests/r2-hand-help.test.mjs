import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('held cards read on their own face with only genuine keywords and owned release',()=>{
 const r=runLua('tests/lua/r2_hand_help.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/R2_HAND_HELP_PASS/);
});
