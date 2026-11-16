import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('competition copy keeps effects concise and exit consequences explicit after help retirement',()=>{
 const r=runLua('tests/lua/m3_chinese_copy.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/M3_CHINESE_COPY_PASS/);
});
