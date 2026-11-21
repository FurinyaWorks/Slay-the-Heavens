import test from 'node:test';
import assert from 'node:assert/strict';
import { gameLayout } from '../scripts/game-ui-layout.mjs';
import { runLua } from '../scripts/test-lua.mjs';

test('the generated game UI contains no controls guide or entry buttons', () => {
  const { controls } = gameLayout();
  for (const name of ['exitPanel', 'runMenu']) {
    const panel = controls.find(control => control.name === name);
    assert.ok(panel, name);
    assert.ok(!panel.children.some(child => child.name === 'guide' || child.name === 'help'), name);
  }
  assert.doesNotMatch(JSON.stringify(controls), /操作说明/);
});

test('real host isolates confirmation input, returns controller focus, and retains map navigation after input switching', () => {
  const result=runLua('tests/lua/native_ui_parity.lua');
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/NATIVE_UI_PARITY_PASS/);
});
