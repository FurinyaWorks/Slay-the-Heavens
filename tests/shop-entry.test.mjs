import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('shop scene enters by merchant, moves only parent containers and preserves transactions',()=>{
 const result=runLua('tests/lua/shop_entry.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/SHOP_ENTRY_PASS/);
});
