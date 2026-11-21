import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('detail routes reuse controls while preserving fresh data and input isolation',()=>{
 const r=runLua('tests/lua/detail_latency.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/DETAIL_LATENCY_PASS/);
});
