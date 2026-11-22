import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildLuaData, luaString } from '../scripts/build-lua-data.mjs';
import { buildUI } from '../scripts/build-ui.mjs';

const require = createRequire(import.meta.url);
for (const officialAssets of [false, true]) {
  test(`${officialAssets ? 'official' : 'default'} Forethought stays open on selection and confirms once`, t => {
    const out = mkdtempSync(join(tmpdir(), 'forethought-host-'));
    t.after(() => rmSync(out, { recursive: true, force: true }));
    buildLuaData('data', join(out, 'abyss_data.lua'));
    buildUI(out, undefined, { officialAssets });
    const layout = JSON.parse(readFileSync(join(out, 'game-ui.json'), 'utf8'));
    const child = (node, name) => (node.children ?? node.controls).find(value => value.name === name);
    const close = child(child(child(child(layout, 'stage'), 'deckPanel'), 'close'), 'hit');
    for (const state of close.children) {
      const label = child(state, 'label');
      assert.ok(label.size[0] >= 4 * label.text.minFontSize, `${state.name} must fit 确认选择`);
    }
    const preloads = readdirSync(out).filter(name => name.endsWith('.lua')).map(name =>
      `package.preload[${luaString(name.slice(0, -4))}]=assert(loadfile(${luaString(join(out,name).replaceAll('\\','/'))}))`);
    const script = ["package.path='src/lua/?.lua;'..package.path", ...preloads,
      "dofile('tests/lua/support/forethought_selection.lua')"].join('\n');
    const result = spawnSync(process.execPath, [require.resolve('fengari-node-cli/src/lua-cli.js'), '-e', script], {
      encoding: 'utf8', timeout: 90000, maxBuffer: 2 * 1024 * 1024,
      env: { ...process.env, LUA_INIT: '', LUA_INIT_5_3: '' },
    });
    assert.equal(result.status, 0, result.stdout + result.stderr + String(result.error ?? ''));
    assert.match(result.stdout, /FORETHOUGHT_SELECTION_HOST_PASS/);
  });
}

test('Forethought source projection keeps exact predecessors and rejects mixed owners', async () => {
  const { createHash } = await import('node:crypto');
  const { beforeMapDeckSource } = await import('./helpers/release-map-deck-source.mjs');
  const lua = 'src/lua/abyss_deck_ui.lua';
  const layout = 'scripts/deck-ui-layout.mjs';
  const read = path => readFileSync(path, 'utf8');
  const hash = value => createHash('sha256').update(value).digest('hex');
  const priorLua = beforeMapDeckSource(lua, read(lua), read);
  const priorLayout = beforeMapDeckSource(layout, read(layout), read);
  assert.equal(hash(priorLua), '7aa3356eb8cd43a4acd956391a2442202f0e83abed49e8487c14befe21739a3e');
  assert.equal(hash(priorLayout), 'f43c5472a1afacf23e8b2a908fa7eb5082e561314c90abbb65d7ccd7ca799d85');
  const crlf = source => source.replaceAll('\n', '\r\n');
  assert.equal(beforeMapDeckSource(lua, crlf(read(lua)), path => crlf(read(path))), crlf(priorLua));
  assert.throws(() => beforeMapDeckSource(lua, read(lua), path => path === layout ? priorLayout : read(path)),
    /Forethought linked owner identity/);
  const foreign = read(lua) + '\n';
  assert.equal(beforeMapDeckSource(lua, foreign, () => assert.fail('foreign input read')), foreign);
});
