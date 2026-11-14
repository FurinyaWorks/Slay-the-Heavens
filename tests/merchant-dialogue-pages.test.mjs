import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';

test('merchant preserves complete fitting sentences within existing page capacities',()=>{
 const r=runLua('tests/lua/merchant_dialogue_pages.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
});
