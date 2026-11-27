import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync, realpathSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {toLua} from '../build-lua-data.mjs';
import {encoderSha256, toolCommit} from '../gil-candidate-preflight.mjs';
import {embeddedScripts} from '../native-script-inventory.mjs';
import {loadNativeUiEncoder} from '../native-ui-encoder.mjs';

const sha256 = value => createHash('sha256').update(value).digest('hex');
export const gilRuntimeKind = 'gil-native-readback';
export const gilModuleInventoryHash = digests => sha256(JSON.stringify(Object.keys(digests).sort().map(name => [name, digests[name]])));
const fixtureNames = ['abyss_ui_layout', 'abyss_ui_templates', 'performance_templates'];
const coreBgmCues = ['map', 'battle', 'elite', 'boss', 'victory', 'defeat'];

export function verifyGilBgmSource(sourceRoot, embeddedBgm, inspection, gilSha256) {
  const root = realpathSync.native(sourceRoot);
  const git = (...args) => execFileSync('git', ['--no-replace-objects', ...args],
    {cwd:root, encoding:'utf8', timeout:10_000}).trim();
  assert.equal(realpathSync.native(git('rev-parse', '--show-toplevel')), root, 'BGM source must be the measured arm worktree root');
  const commit = git('rev-parse', '--verify', 'HEAD^{commit}');
  assert(/^[a-f0-9]{40}$/.test(commit), 'BGM source commit is unavailable');
  const {cues} = JSON.parse(git('show', `${commit}:data/presentation/native_bgm.json`));
  const names = Object.keys(cues ?? {});
  assert(coreBgmCues.every(cue => names.includes(cue)) && !names.includes('stop') &&
    names.every(cue => /^[a-z][a-z0-9_]*$/.test(cue) && Number.isSafeInteger(cues[cue]?.id) && cues[cue].id > 0),
  'Invalid BGM cue inventory in measured source commit');
  const expected = [...names, 'stop'].map(cue => `ABYSS_BGM_${cue.toUpperCase()}`).sort();
  // Pack compaction changes whitespace but retains the literal signal names.
  const embedded = [...new Set(embeddedBgm.match(/"ABYSS_BGM_[A-Z][A-Z0-9_]*"/g))]
    .map(signal => signal.slice(1, -1)).sort();
  assert.deepEqual(embedded, expected, 'Embedded BGM cue inventory differs from the measured source commit');
  assert(inspection.sha256 === gilSha256 && inspection.graphs.some(graph => graph.name === '_GSTS_ABYSS_BGM' && graph.nodeCount > 0) &&
    expected.every(signal => inspection.signals.some(ref => ref.name === signal)),
  'Measured GIL lacks the full audio graph and cue signals');
  return commit;
}

export async function prepareGilProductionInputs(directory, mapPath, toolRoot) {
  const git = (...args) => execFileSync('git', args, {cwd:toolRoot, encoding:'utf8', timeout:10_000}).trim();
  assert.equal(git('rev-parse', 'HEAD'), toolCommit, 'Unreviewed native reader commit');
  assert.equal(git('status', '--porcelain', '--untracked-files=no'), '', 'Native reader checkout changed');
  const {native, identity} = await loadNativeUiEncoder(toolRoot);
  assert.equal(identity.sourceSha256, encoderSha256, 'Unreviewed native reader bytes');
  const load = path => import(pathToFileURL(join(toolRoot, path)));
  const [wire, {inspectFile}] = await Promise.all([load('src/scene/wire.mjs'), load('src/adapter.mjs')]);
  const {container, fields, one} = wire;
  const nativeBytes = readFileSync(mapPath);
  const gilSha256 = sha256(nativeBytes);
  const scripts = embeddedScripts({mapPath, includeSource:true}, wire).scripts;
  const fileByModule = new Map();
  const moduleDigests = Object.create(null);
  for (const {name, source} of scripts) {
    assert(/^[a-z][a-z0-9_]+$/.test(name) && typeof source === 'string' && !fileByModule.has(name) &&
      !fixtureNames.includes(name), 'Invalid or duplicate native Lua module: ' + name);
    const file = name + '.lua';
    fileByModule.set(name, file);
    moduleDigests[name] = sha256(source);
    writeFileSync(join(directory, file), source, {flag:'wx'});
  }
  assert(fileByModule.has('abyss_ui') && fileByModule.has('abyss_bgm'), 'Exact native Lua entry and audio modules required');
  const ui = native.getClientUi({mapPath, ui:'SlayTheAbyss'});
  assert(ui.interface.scripts?.includes('abyss_ui') && !ui.sameNames?.length && ui.interface.controls.length,
    'Native game interface does not bind the measured entry or has ambiguous controls');

  // The pinned reader lists names on TEMPLATE_NOT_FOUND. Every template is then
  // decoded by its real native index, including templates used only from Lua.
  let names;
  try {
    native.getClientUi({mapPath, template:'STH audit template inventory probe'});
  } catch (error) {
    if (error.code !== 'TEMPLATE_NOT_FOUND') throw error;
    names = error.details?.templates;
  }
  assert(Array.isArray(names) && names.length && new Set(names).size === names.length, 'Missing or ambiguous native template inventory');
  const templates = Object.create(null);
  const ids = new Map();
  for (const name of names.sort()) {
    const {templateIndex, template} = native.getClientUi({mapPath, template:name});
    assert(template.name === name && Number.isSafeInteger(templateIndex) && templateIndex > 0 && !ids.has(templateIndex),
      'Native template identity differs: ' + name);
    templates[name] = template;
    ids.set(templateIndex, name);
  }
  const fixtures = [toLua(ui.interface.controls), toLua(templates),
    '{' + [...ids].map(([id, name]) => `[${id}]=${toLua(name)}`).join(',') + '}'];
  const fixtureDigests = Object.fromEntries(fixtureNames.map((name, index) => {
    const source = 'return ' + fixtures[index] + '\n';
    writeFileSync(join(directory, name + '.lua'), source, {flag:'wx'});
    return [name, sha256(source)];
  }));

  const uiRecord = fields(one(container(nativeBytes), 50)).find(field => field.id === 1 && field.wire === 2 &&
    one(field.data, 2).toString('utf8') === 'abyss_ui');
  const parameters = fields(uiRecord.data).filter(field => [7, 8].includes(field.id) && field.wire === 2 &&
    one(field.data, 2).toString('utf8') === 'nativeBgmEnabled');
  assert.deepEqual(parameters.map(field => field.id).sort(), [7, 8], 'Native BGM parameter is missing or ambiguous');
  assert(parameters.every(field => one(field.data, 3, 0) === 4n && one(field.data, 10, 0) === 5n &&
    fields(one(one(field.data, 4), 106)).some(value => value.id === 1 && value.value === 1n)),
  'Native entry does not enable BGM');
  const inspection = inspectFile(mapPath);
  // The shared reader runs from each measured worktree in turn.
  const bgmSourceCommit = verifyGilBgmSource(process.cwd(), scripts.find(script => script.name === 'abyss_bgm').source, inspection, gilSha256);
  assert.equal(sha256(readFileSync(mapPath)), gilSha256, 'GIL changed during native readback');
  const runtime = {
    kind:gilRuntimeKind, gilSha256, readerCommit:toolCommit, encoderSha256, moduleCount:scripts.length,
    moduleDigestsSha256:gilModuleInventoryHash(moduleDigests), fixtureDigests, templateCount:ids.size, nativeBgmEnabled:true, bgmSourceCommit,
  };
  writeFileSync(join(directory, 'performance-readback.json'), JSON.stringify(runtime) + '\n', {flag:'wx'});
  return runtime;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [directory, gil, reader] = process.argv.slice(2).map(value => resolve(value));
  assert(process.argv.length === 5, 'Provide an existing output directory, exact GIL and pinned native reader checkout');
  console.log(JSON.stringify(await prepareGilProductionInputs(directory, gil, reader)));
}
