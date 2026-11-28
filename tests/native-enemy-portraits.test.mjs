import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildLuaData } from '../scripts/build-lua-data.mjs';
import { buildUI } from '../scripts/build-ui.mjs';
import { runLua } from '../scripts/test-lua.mjs';

const require = createRequire(import.meta.url);

test('all 42 two-act enemies use native numeric images through battle SetImage, including bosses and summons', () => {
  const result = runLua('tests/lua/native_enemy_portraits.lua');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /LUA_NATIVE_ENEMY_PORTRAITS_PASS 42 \+ summons \+ unknown fallbacks/);
});

test('refined release grounds the 42-monster roster and follows Byrd Flight through native battle controls', (t) => {
  const out = mkdtempSync(join(tmpdir(), 'abyss-release-enemy-ground-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  buildLuaData('data', join(out, 'abyss_data.lua'));
  buildUI(out, undefined, { officialAssets: true, refinedReleaseMonsterArt: true, nativePageLifecycle: true });
  const lua = require.resolve('fengari-node-cli/src/lua-cli.js');
  const searchPath = out.replaceAll('\\', '/') + '/?.lua;./src/lua/?.lua;;';
  const env = { ...process.env, LUA_PATH: searchPath, LUA_PATH_5_3: searchPath, LUA_INIT: '', LUA_INIT_5_3: '' };
  for (const [fixture, marker] of [
    ['tests/lua/native_enemy_portraits.lua', 'LUA_RELEASE_ENEMY_CONTACT_PASS 42'],
    ['tests/lua/support/byrd_ground_trial.lua', 'BYRD_GROUND_TRIAL_PASS true Strike'],
  ]) {
    const result = spawnSync(process.execPath, [lua, '-e', `dofile('${fixture}')`], { env, encoding: 'utf8', timeout: 60_000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.ok(result.stdout.includes(marker), result.stdout);
  }
});
