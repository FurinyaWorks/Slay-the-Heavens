import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './helpers/isolated-battle-regression.mjs';
test('cancelling a selected card clears its previous rejection notice',()=>{
 const result=runIsolatedBattleRegression('tests/lua/card_cancel_notice.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.ok(result.stdout.includes('CARD_CANCEL_NOTICE_PASS'));
});
