import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';

for(const [name,fixture,marker] of [
  ['anonymous target Click submits only its confirmed card and actor','target_anonymous_click','TARGET_ANONYMOUS_CLICK_PASS 6'],
  ['anonymous target ownership rejects uncertain pointers and permits fresh recovery','target_anonymous_ownership','TARGET_ANONYMOUS_OWNERSHIP_PASS 4'],
  ['anonymous targets retain context guards and one command across native reentry','target_anonymous_context','TARGET_ANONYMOUS_CONTEXT_PASS 6'],
  ['unknown target terminals retire only attributable origins and fresh named Down reclaims its own ID','target_anonymous_terminal','TARGET_ANONYMOUS_TERMINAL_PASS 7'],
  ['named consumption receipts require post-Down evidence and cannot retire newer live origins','target_consumed_origin','TARGET_CONSUMED_ORIGIN_PASS 7'],
  ['explicit potion Use confirms a unique tap target once without changing click-only controls','potion_tap_anonymous','POTION_TAP_ANONYMOUS_PASS 4'],
  ['potion tap compatibility preserves aim slot identity and moving-target cancellation','potion_tap_anonymous_safety','POTION_TAP_ANONYMOUS_SAFETY_PASS 3'],
])test(name,()=>{
  const result=runLua(`tests/lua/${fixture}.lua`);
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.ok(result.stdout.includes(marker),result.stdout);
});
