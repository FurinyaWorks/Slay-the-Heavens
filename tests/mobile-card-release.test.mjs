import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('mobile drag release clears invalid selections and preserves desktop target carry',()=>{
 const result=runLua('tests/lua/mobile_card_release.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/MOBILE_CARD_RELEASE 7 passed; 0 failed/);
});

for(const [fixture,marker] of [
 ['battle_sparse_pointer_cases','BATTLE_SPARSE_POINTER 2 passed'],
 ['sparse_card_flick','SPARSE_CARD_FLICK_PASS 12'],
 ['sparse_card_flick_safety','SPARSE_CARD_FLICK_SAFETY_PASS 8'],
])test(`sparse native card Down sample: ${fixture}`,()=>{
 const result=runLua(`tests/lua/support/${fixture}.lua`);
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.ok(result.stdout.includes(marker),result.stdout);
});

test('cancelling a selected card clears its previous rejection notice',()=>{
 const result=runLua('tests/lua/support/card_cancel_notice.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/CARD_CANCEL_NOTICE_PASS failure\/cancel\/repeat/);
});
