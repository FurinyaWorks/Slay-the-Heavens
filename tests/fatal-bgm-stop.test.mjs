import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';

test('fatal native bootstrap failure stops enabled BGM without weakening cleanup or engine teardown',()=>{
  const result=runLua('tests/lua/fatal_bgm_stop.lua');
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/FATAL_BGM_STOP_PASS 8/);
});
