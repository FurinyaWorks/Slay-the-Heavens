import assert from 'node:assert/strict';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import test from 'node:test';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';

test('the production card browser retains ten independent faces and retires input with each page', t => {
  const generated = mkdtempSync(join(tmpdir(), 'deck-pages-'));
  t.after(() => rmSync(generated, {recursive: true, force: true}));
  buildLuaData('data', join(generated, 'abyss_data.lua'));
  buildUI(generated, undefined, {officialAssets: true, nativePageLifecycle: true});
  const require = createRequire(import.meta.url);
  const run = spawnSync(process.execPath, [require.resolve('fengari-node-cli/src/lua-cli.js'), '-e',
    "dofile('tests/lua/support/deck_browser_cases.lua')"], {
      encoding: 'utf8', timeout: 60_000,
      env: {...process.env, LUA_PATH: `${generated.replaceAll('\\','/')}/?.lua;src/lua/?.lua;;`},
    });
  assert.ifError(run.error);
  assert.equal(run.status, 0, run.stdout + run.stderr);
  assert.match(run.stdout, /DECK_PAGES_PASS/);
});
