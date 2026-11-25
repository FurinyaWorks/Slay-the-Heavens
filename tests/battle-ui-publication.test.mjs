import test from 'node:test';
import assert from 'node:assert/strict';
import { runLua } from '../scripts/test-lua.mjs';

test('battle UI publishes changed particle appearance and retires hidden ownership', () => {
  const result = runLua('tests/lua/battle_ui_publication.lua');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /BATTLE_UI_PUBLICATION_PASS/);
});
