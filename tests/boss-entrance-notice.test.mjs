import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('Guardian battle HUD retains ordinary notices without replaying narrative',()=>{
 const r=runLua('tests/lua/boss_entrance_notice.lua');assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/BOSS_ENTRANCE_NOTICE_PASS/);
});
