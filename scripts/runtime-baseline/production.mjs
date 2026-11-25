import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {join, resolve} from 'node:path';
import {buildLuaData, luaString, toLua} from '../build-lua-data.mjs';
import {buildUI} from '../build-ui.mjs';
import {nativeAudioBuildArgs} from '../build-native-audio-game.mjs';
import {bindPortraitTemplates} from '../official-portraits.mjs';
import {bindMonsterActorTemplates, monsterActorTiers} from '../monster-art.mjs';
import {prepareRefinedReleaseMonsterArt, refinedReleaseMonsterRegistry} from '../refined-release-monsters.mjs';
import {deckBrowserBindingSource, deckBrowserParts, deckBrowserTemplateName} from '../deck-ui-layout.mjs';
import {validateSample, percentile} from '../benchmark-runtime-path.mjs';
import {gitSourceIdentity} from '../release-notes.mjs';

const phases = ['begin', 'cold-start', 'start-map', 'first-fight', 'ten-card-hand', 'consecutive-play',
  'deck-cold-open', 'deck-close', 'deck-warm-open', 'pause-resume', 'exit', 'reenter'];

const directory = resolve('build/performance-regression/production');
const reportPath = resolve(directory, '../production.json');
rmSync(reportPath, {force: true});
mkdirSync(directory, {recursive: true});
const {options} = nativeAudioBuildArgs(['offline.gil', '--work-key=offline-performance']);
assert(options.officialAssets && options.refinedReleaseMonsterArt && options.nativePageLifecycle,
  'Production performance requires the refined native audio build preset');
buildLuaData('data', join(directory, 'abyss_data.lua'));
buildUI(directory, undefined, options);

// The generator leaves template IDs unbound until import. Use the same binding
// writers with local IDs, backed by the actual generated template definitions.
const names = JSON.parse(readFileSync(join(directory, 'game-ui-templates.json'), 'utf8')).map(({name}) => name);
const indices = new Map(names.map((name, i) => [name, i + 1]));
const binding = name => ({templateIndex: assertIndex(name)});
function assertIndex(name) {
  const index = indices.get(name);
  assert(index, 'Generated template missing: ' + name);
  return index;
}
const registry = JSON.parse(readFileSync(refinedReleaseMonsterRegistry, 'utf8'));
const {templateByDefinition} = monsterActorTiers(prepareRefinedReleaseMonsterArt(registry));
bindMonsterActorTemplates(directory, {
  actor: binding('AbyssMonsterActor'), group: binding('AbyssReadyCardGroup'), power: binding('AbyssMonsterPower'),
  templateIndexByDefinition: Object.fromEntries(Object.entries(templateByDefinition)
    .map(([definition, name]) => [definition, assertIndex(name)])),
});
bindPortraitTemplates(directory, {
  image: binding('AbyssReadyCardImage'), container: binding('AbyssReadyCardGroup'),
  half: binding('AbyssSelectionHalfTriangle'),
}, {...options.artFeatures, officialAssets: options.officialAssets});
writeFileSync(join(directory, 'abyss_deck_browser_binding.lua'), deckBrowserBindingSource(
  assertIndex(deckBrowserTemplateName), deckBrowserParts.map(part => ({...part, templateIndex: assertIndex(part.name)}))));
writeFileSync(join(directory, 'performance_templates.lua'), 'return ' + toLua(names) + '\n');

const samples = [];
for (let i = 0; i < 3; i++) {
  const result = spawnSync(process.execPath, ['scripts/runtime-baseline/worker.mjs', directory], {
    encoding: 'utf8', timeout: 90_000, maxBuffer: 4 * 1024 * 1024,
  });
  assert(result.status === 0 && !result.error, [result.error, result.stderr, result.stdout].filter(Boolean).join('\n'));
  const lines = result.stdout.split('\n');
  const prefix = 'RUNTIME_BASELINE_JSON ';
  const records = lines.filter(line => line.startsWith(prefix));
  assert.equal(records.length, 1);
  assert(lines.includes('PRODUCTION_HOST_PASS seed=42'));
  const sample = validateSample(JSON.parse(records[0].slice(prefix.length)), phases);
  const cold = sample.rows.find(row => row.phase === 'cold-start');
  assert(cold.nativeMethods.GetChild > 0 && cold.nativeMethods.GetChildren > 0, 'missing startup native query counts');
  samples.push(sample);
  console.log(lines.filter(line => line.startsWith('PRODUCTION ')).join('\n'));
}
// Run the existing product assertions directly against current generated
// controls even when the historical menu-layout digest reports drift.
const require = createRequire(import.meta.url);
const path = luaString(directory.replaceAll('\\', '/') + '/?.lua;src/lua/?.lua');
const ui = spawnSync(process.execPath, [require.resolve('fengari-node-cli/src/lua-cli.js'), '-e',
  `package.path=${path};dofile('tests/lua/support/sts_ui_closeout.lua')`],
  {encoding: 'utf8', timeout: 60_000, maxBuffer: 4 * 1024 * 1024});
assert(ui.status === 0 && !ui.error && ui.stdout.includes('STS_UI_CLOSEOUT_PASS'),
  [ui.error, ui.stderr, ui.stdout].filter(Boolean).join('\n'));
console.log('STS_UI_CLOSEOUT_PASS');

const generated = createHash('sha256');
for (const name of readdirSync(directory).filter(name => name.endsWith('.lua')).sort()) {
  const digest = createHash('sha256').update(readFileSync(join(directory, name))).digest('hex');
  generated.update(JSON.stringify([name, digest]));
}
const report = {
  status: 'OFFLINE_HOST_PASS',
  ...gitSourceIdentity(), seed: 42, officialClient: 'UNVERIFIED',
  configuration: options, generatedLuaSha256: generated.digest('hex'),
  samples, phases: Object.fromEntries(phases.map((name, i) => {
    const values = samples.map(sample => sample.rows[i].elapsedMs);
    return [name, {p50Ms: percentile(values, .5), maxMs: Math.max(...values)}];
  })),
};
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.phases));
