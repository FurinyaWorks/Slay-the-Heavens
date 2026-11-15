import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('cancelling a selected card clears its previous rejection notice',()=>{
 const result=runLua('tests/lua/card_cancel_notice.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.ok(result.stdout.includes('CARD_CANCEL_NOTICE_PASS'));
});
