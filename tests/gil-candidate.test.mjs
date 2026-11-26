import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { verifyDownloadedArtifact, verifyLocalBuild, verifyLocalProductionPreset, verifyReceipts } from '../scripts/gil-candidate.mjs';
import { downloadLocalGilBundle, localGilRecord, readLocalGilBundle, writeLocalGilBundle } from '../scripts/local-gil-bundle.mjs';
import { importedGilReceipt, localArchiveReceipt } from '../scripts/hosted-gil-receipt.mjs';
import { nativeAudioBuildArgs } from '../scripts/build-native-audio-game.mjs';
import { encoderSha256 } from '../scripts/gil-candidate-preflight.mjs';

const sourceSha = '1'.repeat(40);
const baseSha256 = '2'.repeat(64);
const workKey = 'production-work';
const version = 'v2.1.1';

test('trusted develop owns protection, while audit receives the bound build context', () => {
  const workflow = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  assert.match(workflow, /^    if: github\.event_name == 'workflow_dispatch' && github\.repository_id == '1429751262' && github\.ref == 'refs\/heads\/develop'$/m);
  assert.match(workflow, /^          GIL_BASE_URL: \$\{\{ secrets\.GIL_BASE_URL \}\}$/m);
  assert.match(workflow, /^          GIL_LOCAL_BUILD_URL: \$\{\{ secrets\.GIL_LOCAL_BUILD_URL \}\}$/m);
  assert.equal(workflow.match(/secrets\./g).length, 2);
  for (const [name, origin] of [['Download and verify approved base GIL', 'hosted'],
    ['Build the complete game with native audio', 'hosted'], ['Download the approved private local GIL bundle', 'local']]) {
    assert(workflow.includes(`- name: ${name}\n        if: steps.candidate.outputs.build == 'true' && steps.candidate.outputs.origin == '${origin}'`));
  }
  assert(workflow.includes("- name: Audit the final GIL and prepare the download\n        if: steps.candidate.outputs.build == 'true'"));
  assert(!workflow.slice(workflow.indexOf('- uses: actions/upload-artifact')).includes('LOCAL_BUNDLE'));
  const sourceCheckout = workflow.slice(workflow.indexOf('          path: source\n'), workflow.indexOf('          path: miliastra-mcp\n'));
  const sparse = sourceCheckout.match(/^          sparse-checkout: \|\n((?: {12}\S+\n)+)/m)?.[1];
  assert.deepEqual(sparse?.trim().split('\n').map(path => path.trim()), [
    'scripts', 'src/lua', 'data', 'config', 'tools', 'art/characters/traveler-geo/portraits',
    'art/lowpoly-select', 'art/performance', 'experiments/lumine-native-fit/fit-hybrid-final',
  ]);
  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));
  for (const [name, expression] of Object.entries({
    SOURCE_REF: 'inputs.source_ref', SOURCE_SHA: 'inputs.source_sha', WORK_KEY: 'steps.candidate.outputs.work_key',
    BASE_SHA256: 'steps.candidate.outputs.base_sha256', REQUEST_ID: 'steps.candidate.outputs.request_id',
    RELEASE_VERSION: 'steps.candidate.outputs.release_version', QUALITY_RUN: 'steps.candidate.outputs.quality_run',
    QUALITY_ATTEMPT: 'steps.candidate.outputs.quality_attempt', QUALITY_CHECKOUT_ARTIFACT: 'steps.candidate.outputs.quality_checkout_artifact',
    LICENSES_RUN: 'steps.candidate.outputs.licenses_run',
  })) assert(audit.includes(`          ${name}: ${'${{'} ${expression} }}\n`), `audit requires ${name}`);
  assert.match(workflow, /upload-artifact@[a-f0-9]{40}[\s\S]+download-artifact@[a-f0-9]{40}[\s\S]+gil-candidate\.mjs readback/);
});

test('reject missing protected base URL before downloads', () => {
  const result = spawnSync(process.execPath, ['scripts/gil-candidate.mjs', 'base'], {
    encoding: 'utf8', env: { ...process.env, GIL_BASE_URL: '' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing protected GIL_BASE_URL/);
});

test('verify the downloaded archive against the audited upload and the exact file inventory', t => {
  const root = mkdtempSync(join(tmpdir(), 'gil-download-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const upload = join(root, 'upload');
  const download = join(root, 'download');
  const published = { 'candidate.gil': 'audited candidate', 'candidate.json': '{}', 'manifest.json': '{}' };
  const checksums = files => Object.entries(files).map(([name, bytes]) =>
    `${createHash('sha256').update(bytes).digest('hex')}  ${name}\n`).join('');
  for (const directory of [upload, download]) {
    mkdirSync(directory);
    for (const [name, bytes] of Object.entries(published)) writeFileSync(join(directory, name), bytes);
    writeFileSync(join(directory, 'SHA256SUMS'), checksums(published));
  }
  assert.doesNotThrow(() => verifyDownloadedArtifact(upload, download));
  writeFileSync(join(download, 'base.gil'), 'unexpected input');
  assert.throws(() => verifyDownloadedArtifact(upload, download), /contents or SHA-256/);
  rmSync(join(download, 'base.gil'));
  writeFileSync(join(download, 'candidate.gil'), 'different candidate');
  assert.throws(() => verifyDownloadedArtifact(upload, download), /contents or SHA-256/);
  writeFileSync(join(download, 'SHA256SUMS'), checksums({ ...published, 'candidate.gil': 'different candidate' }));
  assert.throws(() => verifyDownloadedArtifact(upload, download), /contents or SHA-256/);
});

test('bind the exact full and final audio receipts, final bytes and production profile', () => {
  const fullGil = { bytes: 6, sha256: '4'.repeat(64) };
  const finalGil = { bytes: 9, sha256: '5'.repeat(64) };
  const full = { sourceCommit: sourceSha, sourceDirty: false, liveWriteEnabled: false,
    buildId: '11111111-1111-4111-a111-111111111111', payloadDigest: '6'.repeat(64),
    moduleDigests: { abyss_bgm: '7'.repeat(64) }, release: { workKey }, candidate: fullGil,
    baseMap: { sha256: baseSha256 }, statuses: { staticCheck: 'pass' },
    officialAssetsProfile: 'official-assets-battle-v3', uiProfile: { nativePageLifecycle: true },
    nativeMonsterArt: { assetCount: 42, bindingCount: 42 },
    toolchainIdentity: { sourceSha256: encoderSha256 },
  };
  const fullReceipt = Buffer.from(JSON.stringify(full));
  const audio = { ...full, candidate: finalGil, sha256: finalGil.sha256,
    baseSha256: fullGil.sha256, baseAfter: fullGil.sha256, checked: { ok: true, errors: 0 },
    compiled: { written: [{ graphId: 1 }] },
    sourceReceipt: { bytes: fullReceipt.length, sha256: createHash('sha256').update(fullReceipt).digest('hex') },
  };
  const claimed = { full, audio, fullReceipt, fullGil, finalGil, baseSha256, sourceSha, workKey };
  assert.doesNotThrow(() => verifyReceipts(claimed));
  for (const change of [{ sourceDirty: true }, { sourceCommit: '8'.repeat(40) }, { toolchainIdentity: { sourceSha256: '0'.repeat(64) } },
    { sha256: fullGil.sha256 }, { baseAfter: finalGil.sha256 }, { compiled: { written: [] } }, { checked: { ok: false, errors: 1 } },
    { moduleDigests: {} }, { sourceReceipt: { ...audio.sourceReceipt, bytes: 0 } }]) {
    assert.throws(() => verifyReceipts({ ...claimed, audio: { ...audio, ...change } }));
  }
  assert.throws(() => verifyReceipts({ ...claimed, finalGil: { ...finalGil, bytes: 10 } }), /size or SHA-256/);
  const release = { workKey, version, notesSha256: 'a'.repeat(64) };
  const releasedFull = { ...full, release };
  const releasedBytes = Buffer.from(JSON.stringify(releasedFull));
  const releasedAudio = { ...audio, release, sourceReceipt: {
    sha256: createHash('sha256').update(releasedBytes).digest('hex'), bytes: releasedBytes.length,
  } };
  const received = { ...claimed, full: releasedFull, fullReceipt: releasedBytes, audio: releasedAudio, version };
  assert.doesNotThrow(() => verifyReceipts(received));
  assert.throws(() => verifyReceipts({ ...received, version: 'v2.1.2' }), /release version or notes/);
  assert.throws(() => verifyReceipts({ ...received, audio }), /release version or notes/);
});

test('verify local base, intermediate, audio receipt and candidate before storing the approved private bundle', async t => {
  const root = mkdtempSync(join(tmpdir(), 'gil-local-bundle-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const file = name => join(root, name);
  const base = Buffer.from('approved base bytes'), intermediate = Buffer.from('full release bytes'), candidate = Buffer.from('full release with native audio');
  const release = { workKey, version, notesSha256: 'a'.repeat(64) };
  const builderRoot = 'D:\\candidate\\release';
  const fullRoot = builderRoot + '\\build\\local-gil\\full\\11111111-1111-4111-a111-111111111111';
  const toolchainIdentity = { sourceSha256: encoderSha256, sourcePath: 'D:\\mcp\\src\\scene-save.mjs',
    helperPath: builderRoot + '\\scripts\\native-client-check.mjs' };
  const full = { sourceCommit: sourceSha, sourceDirty: false, release, liveWriteEnabled: false,
    toolchainIdentity, inputs: [{ path: 'src/lua/test.lua' }, ...[toolchainIdentity.sourcePath, toolchainIdentity.helperPath].map(path => ({ path }))],
    buildId: '11111111-1111-4111-a111-111111111111', payloadDigest: '6'.repeat(64),
    moduleDigests: { abyss_bgm: '7'.repeat(64) }, candidate: localGilRecord(intermediate),
    baseMap: localGilRecord(base), statuses: { staticCheck: 'pass' }, receiptPath: fullRoot + '\\candidate.json',
    officialAssetsProfile: 'official-assets-battle-v3', uiProfile: { nativePageLifecycle: true },
    nativeMonsterArt: { assetCount: 42, bindingCount: 42 },
    productionManifest: { modules: [{ name: 'abyss_bgm', path: fullRoot + '\\payload\\abyss_bgm.lua' }],
      layout: { path: fullRoot + '\\generated\\game-ui.json' }, templates: { path: fullRoot + '\\generated\\game-ui-templates.json' } },
  };
  const fullReceipt = Buffer.from(JSON.stringify(full));
  const audio = { ...full, candidate: localGilRecord(candidate), sha256: localGilRecord(candidate).sha256,
    baseSha256: full.candidate.sha256, baseAfter: full.candidate.sha256, sourceReceipt: localGilRecord(fullReceipt),
    compiled: { written: [{ graphId: 1 }] }, checked: { ok: true, errors: 0 } };
  const bundleContents = { base, intermediate, candidate, fullReceipt, audioReceipt: Buffer.from(JSON.stringify(audio)) };
  const paths = Object.fromEntries(Object.entries(bundleContents).map(([name, bytes]) => {
    writeFileSync(file(name), bytes);
    return [name, file(name)];
  }));
  const expected = { sourceSha, workKey, version, baseSha256: full.baseMap.sha256, candidateSha256: audio.sha256 };
  const bundlePath = file('bundle.json');
  const written = writeLocalGilBundle(bundlePath, paths, files => verifyLocalBuild(files, expected));
  const good = readFileSync(bundlePath);
  const receivedPath = file('received.json');
  const get = async (_url, options) => {
    assert.equal(options.redirect, 'error');
    return new Response(good);
  };
  await downloadLocalGilBundle('https://secure.example/build', receivedPath, written.bundleSha256, get);
  const received = readLocalGilBundle(receivedPath, written.bundleSha256);
  assert.deepEqual(received, bundleContents);
  const verified = verifyLocalBuild(received, expected);
  const candidateRow = { path: 'candidate.gil', ...verified.finalGil };
  const receipt = importedGilReceipt(verified.full, verified.audio, candidateRow, 'hotfix/' + version);
  assert.deepEqual(receipt.candidate, candidateRow);
  assert.equal(receipt.productionManifest.modules[0].path, 'payload/abyss_bgm.lua');
  const digestInputs = rows => localGilRecord(Buffer.from(JSON.stringify(rows))).sha256;
  const archived = localArchiveReceipt(receipt, full.inputs, digestInputs);
  assert.deepEqual(archived.encoderPayloadPaths, ['/release/encoder/src/scene-save.mjs', '/release/source/scripts/native-client-check.mjs']);
  assert(!JSON.stringify(archived).includes('candidate\\release'));
  assert.equal(archived.payloadDigest, digestInputs([full.inputs[0], ...archived.encoderPayloadPaths.map(path => ({ path }))]));
  assert.throws(() => localArchiveReceipt(receipt, [{ path:'wrong/source.mjs' }, full.inputs.at(-1)], digestInputs), /labels differ/);

  assert.throws(() => importedGilReceipt(verified.full, { ...verified.audio,
    productionManifest: { ...verified.audio.productionManifest, layout: { path: fullRoot + '\\..\\unreviewed.json' } },
  }, candidateRow, 'hotfix/' + version), /Invalid local receipt path label/);

  for (const field of ['base', 'intermediate', 'candidate', 'fullReceipt', 'audioReceipt']) {
    assert.throws(() => verifyLocalBuild({ ...received, [field]: Buffer.from('{}') }, expected));
  }
  assert.throws(() => verifyLocalBuild(received, { ...expected, sourceSha: 'f'.repeat(40) }), /source/);
  assert.throws(() => readLocalGilBundle(receivedPath, '0'.repeat(64)), /approved digest/);
  await assert.rejects(downloadLocalGilBundle('https://secure.example/build', file('invalid'), '0'.repeat(64), get), /approved digest/);
  await assert.rejects(downloadLocalGilBundle('http://secure.example/build', file('untrusted'), written.bundleSha256, get), /HTTPS/);
  const invalid = JSON.parse(good);
  invalid.candidate += '===';
  const malformed = Buffer.from(JSON.stringify(invalid));
  writeFileSync(file('malformed.json'), malformed);
  assert.throws(() => readLocalGilBundle(file('malformed.json'), localGilRecord(malformed).sha256), /Malformed/);
  assert.throws(() => writeLocalGilBundle(bundlePath, paths, files => verifyLocalBuild(files, expected)), /EEXIST/);
});

test('local intake accepts the frozen default preset and rejects other valid native build recipes', () => {
  const defaultOptions = nativeAudioBuildArgs([]).options;
  const check = ({ workKey, releaseCandidate, nativePageLifecycle = false, ...options }) =>
    verifyLocalProductionPreset(defaultOptions, { ...options, toolchainIdentity: { sourceSha256: encoderSha256 } }, nativePageLifecycle);
  assert.doesNotThrow(() => check(defaultOptions));
  for (const args of [['--art-version=legacy'], ['--official-assets'], ['--native-card-art-count=0']]) {
    const alternative = nativeAudioBuildArgs(args).options;
    assert.throws(() => check(alternative), /default production preset/);
  }
  assert.throws(() => check({ ...defaultOptions, lightweight2d: true }), /default production preset/);
  assert.throws(() => check({ ...defaultOptions, nativePageLifecycle: false }), /default production preset/);
});
