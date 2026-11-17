import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';

test('queued requestDiscard and Tools supply the live draw host for automatic Reflex discards',()=>{
 const result=runLua('tests/lua/discard_host_boundaries.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/DISCARD_HOST_BOUNDARIES 4 groups passed/);
});
