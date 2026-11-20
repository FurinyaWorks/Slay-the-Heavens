import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('mobile drag release clears invalid selections and preserves desktop target carry',()=>{
 const result=runLua('tests/lua/mobile_card_release.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/MOBILE_CARD_RELEASE 7 passed; 0 failed/);
});

test('a sparse flick plays exactly once through native mouse and touch controls',()=>{
 const result=runLua('tests/lua/support/sparse_card_flick.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/^SPARSE_CARD_FLICK_PASS 12$/m);
});

test('a sparse flick rejects slow, lateral, cancelled and foreign releases',()=>{
 const result=runLua('tests/lua/support/sparse_card_flick_safety.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/^SPARSE_CARD_FLICK_SAFETY_PASS 8$/m);
});
