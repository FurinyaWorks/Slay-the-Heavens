import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildLuaData, luaString, toLua} from '../scripts/build-lua-data.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {nativeAudioBuildArgs} from '../scripts/build-native-audio-game.mjs';
import {bindPortraitTemplates} from '../scripts/official-portraits.mjs';
import {refinedReleaseMonsterIds} from '../scripts/refined-release-monsters.mjs';
import {runLua} from '../scripts/test-lua.mjs';

const fixture = 'tests/lua/support/formal_startup_budget.lua';

test('formal cold startup publishes an operable menu within its lifecycle and defers offscreen allocation', t => {
  const directory = mkdtempSync(join(tmpdir(), 'abyss-formal-startup-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  const {options} = nativeAudioBuildArgs(['source.gil']);
  assert.equal(options.officialAssets && options.nativePageLifecycle && options.refinedReleaseMonsterArt, true);
  buildLuaData('data', join(directory, 'abyss_data.lua'));
  buildUI(directory, undefined, options);
  bindPortraitTemplates(directory, {
    image: {templateIndex: 101}, container: {templateIndex: 102}, half: {templateIndex: 103},
  }, {...options.artFeatures, officialAssets: options.officialAssets});
  const modules = readdirSync(directory).filter(name => name.endsWith('.lua')).map(name => name.slice(0, -4));
  const entry = join(directory, 'entry.lua');
  function start(device, width, source) {
    writeFileSync(entry, `
local generated = ${luaString(directory.replaceAll('\\', '/'))}
for _, name in ipairs(${toLua(modules)}) do
    package.preload[name] = assert(loadfile(generated .. '/' .. name .. '.lua'))
end
ABYSS_STARTUP_DEVICE = ${luaString(device)}
ABYSS_STARTUP_WIDTH = ${width}
ABYSS_STARTUP_SOURCE = ${luaString(source.replaceAll('\\', '/'))}
ABYSS_EXPECTED_MONSTER_ART_IDS = ${toLua(refinedReleaseMonsterIds)}
dofile(${luaString(fixture)})
`);
    return runLua(entry);
  }

  const boot = 'src/lua/abyss_ui.lua';
  for (const [device, width] of [['desktop', 1280], ['mobile', 1560]]) {
    const result = start(device, width, boot);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.ok(result.stdout.includes(`FORMAL_STARTUP_PASS ${device}`), result.stdout);
    t.diagnostic(result.stdout.split(/\r?\n/).find(line => line.startsWith('FORMAL_STARTUP_PASS')));
  }

  const marker = 'print("ABYSS_UI ready")';
  const original = readFileSync(boot, 'utf8');
  assert.equal(original.split(marker).length, 2);
  const mutant = join(directory, 'startup-mutant.lua');
  for (const [source, failure] of [
    ["game.InstantiateClientUIControl(require('abyss_monster_actor_binding').containerTemplateIndex, script.object:GetChild('stage'):GetChild('battlePanel'))", 'FORMAL_BOOT_OFFSCREEN: battlePanel'],
    ["local _, drawing = next(require('abyss_monster_art_data').assets); local slots = drawing.slots", 'FORMAL_BOOT_EAGER_DECODE: 1/'],
    ['script:EnableUpdate(false)', 'FORMAL_BOOT_NO_SCHEDULER'],
  ]) {
    writeFileSync(mutant, original.replace(marker, `${source}\n        ${marker}`));
    const result = start('mobile', 1560, mutant);
    assert.notEqual(result.status, 0, result.stdout);
    assert.ok(result.stdout.includes('ABYSS_UI ready'), result.stdout + result.stderr);
    assert.ok(result.stderr.includes(failure), result.stdout + result.stderr);
  }
});
