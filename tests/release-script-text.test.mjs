import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertClientScriptText } from '../scripts/check-release-text.mjs';

test('candidate scripts reject old retirement and altar action labels', () => {
  const oldLabels = [
    "Events.emit(state, 'enemy_suicide', { enemy = target.id })",
    'function M.suicideTransient(state, enemy) end',
    "return { op = 'reptomancerSuicide' }",
    "return 'shed_blood'",
    "return '攻击后自毁'",
    "return '自爆浮械'",
  ];
  for (const source of oldLabels) {
    assert.throws(() => assertClientScriptText([{ name: 'combat_rules', source }], 'candidate.gil'),
      /Release text check failed/);
  }
  assert.doesNotThrow(() => assertClientScriptText([
    { name: 'combat_rules', source: "return { 'enemy_retired', 'reptomancerRetireMinion', 'accept_trial' }" },
  ], 'candidate.gil'));
});
