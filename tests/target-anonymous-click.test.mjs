import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';

for(const [name,fixture,marker] of [
  ['anonymous target Click submits only its confirmed card and actor','target_anonymous_click','TARGET_ANONYMOUS_CLICK_PASS 6'],
  ['anonymous target ownership rejects uncertain pointers and permits fresh recovery','target_anonymous_ownership','TARGET_ANONYMOUS_OWNERSHIP_PASS 4'],
  ['anonymous targets retain context guards and one command across native reentry','target_anonymous_context','TARGET_ANONYMOUS_CONTEXT_PASS 6'],
])test(name,()=>{
  const result=runLua(`tests/lua/${fixture}.lua`);
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.ok(result.stdout.includes(marker),result.stdout);
});
