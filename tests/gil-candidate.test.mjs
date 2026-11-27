import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';
import { approvedRequest, buildOnlyRequest, encoderSha256, validationTarget } from '../scripts/gil-candidate-preflight.mjs';
import { downloadLegacyGilArchive, legacyGilArchive, supportsPublishedGilSeed } from '../scripts/runtime-baseline/published-baseline.mjs';

const sourceSha = '1'.repeat(40);
const baseSha256 = '2'.repeat(64);
const workKey = 'production-work';
const version = 'v2.1.1';

test('trusted develop owns protection, while audit receives the bound build context', () => {
  const workflow = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  assert.match(workflow, /^    if: github\.event_name == 'workflow_dispatch' && github\.repository_id == '1429751262' && github\.ref == 'refs\/heads\/develop'$/m);
  assert.match(workflow, /^          GIL_BASE_URL: \$\{\{ secrets\.GIL_BASE_URL \}\}$/m);
  assert.equal(workflow.match(/secrets\./g).length, 1);
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

test('automatic build pushes are scoped to primary develop and the diagnostic branch in the known fork', () => {
  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  const fork = '1460133275';
  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';
  assert.deepEqual(validationTarget('1429751262', 'refs/heads/develop', sourceSha), { branch: 'develop' });
  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });
  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);
  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);
  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);
  assert.match(workflow, /push:\n    branches: \[develop, 'ci\/full\/gil-build\/\*\*'\]/);
  assert.match(workflow, /PUBLISH_ARTIFACT: 'false'/);
  assert.match(workflow, /path: source\/build\/gil-artifact\/manifest\.json\n/);
  assert.doesNotMatch(workflow, /secrets\.|environment:/);
  const buildSteps = workflow.slice(workflow.indexOf('      - name: Fetch and verify the published project GIL'));
  assert.equal(buildSteps.match(/^      - (?:name|uses):/gm)?.length, 9);
  assert.equal(buildSteps.match(/^        if: steps\.candidate\.outputs\.build == 'true'$/gm)?.length, 9);
  const archive = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8');
  const usedActions = [...workflow.matchAll(/^\s*- uses: (actions\/[a-z-]+@[0-9a-f]+)\b/gm)];
  assert.equal(usedActions.length, 6);
  for (const [, action] of usedActions) assert(archive.includes(`uses: ${action} `), `Build action must use the archive pin: ${action}`);
});

test('unattended build selects the pinned public source and a local metadata key', () => {
  const target = validationTarget('1429751262', 'refs/heads/develop', sourceSha);
  const policy = { controllerSha: sourceSha };
  const approval = { sourceSha, sourceBranch: 'develop', baseSha256: legacyGilArchive.sha256, workKey,
    reference: 'owner/42', baseProcessingApproved: true, publicArtifactApproved: true };
  const build = buildOnlyRequest(sourceSha, policy, target);
  assert.equal(build.archive, false);
  assert.equal(build.baseSha256, legacyGilArchive.sha256);
  assert.equal(build.configuration.releaseCandidate, false);
  assert.equal(build.configuration.workKey, 'offline-candidate');
  assert.throws(() => approvedRequest(JSON.stringify({ ...approval, workKey: build.configuration.workKey }), sourceSha, policy), /Approval must cover/);
  assert.notEqual(build.id, approvedRequest(JSON.stringify(approval), sourceSha, policy).id);
});

test('the published GIL seed permits only strictly newer source versions', () => {
  for (const version of ['2.0.0', '2.1.0', '2.1.1']) assert.equal(supportsPublishedGilSeed(version), false);
  for (const version of ['2.1.2', '2.2.0', '3.0.0']) assert.equal(supportsPublishedGilSeed(version), true);
  assert.throws(() => supportsPublishedGilSeed('2.2.0-preview'), /Engineering SemVer/);
});

test('the published archive download validates the exact pointer and bounds transfer retries', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'gil-published-download-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const output = join(dir, 'base.gil');
  const { path, archiveCommit, bytes, sha256 } = legacyGilArchive;
  const pointer = `version https://git-lfs.github.com/spec/v1\noid sha256:${sha256}\nsize ${bytes}\n`;
  const request = (content = pointer) => async uri => {
    assert.equal(uri, `/repos/FurinyaWorks/Slay-the-Heavens/contents/${path}?ref=${archiveCommit}`);
    return { type: 'file', path, size: bytes, encoding: 'base64', content: Buffer.from(content).toString('base64') };
  };
  await assert.rejects(downloadLegacyGilArchive(output, request(pointer.replace(sha256, '0'.repeat(64))),
    () => assert.fail('downloaded from an unverified pointer')), /pointer differs/);
  let calls = 0;
  await assert.rejects(downloadLegacyGilArchive(output, request(), async (url, options) => {
    assert.equal(url, `https://media.githubusercontent.com/media/FurinyaWorks/Slay-the-Heavens/${archiveCommit}/${path}`);
    assert.equal(options.redirect, 'error');
    calls++;
    throw Error('fixture network failure');
  }), /after two attempts/);
  assert.equal(calls, 2);
  await assert.rejects(downloadLegacyGilArchive(output, request(), async () => new Response('truncated')),
    /differs from the pinned size/);
  assert.equal(existsSync(output), false);
});

test('a published seed rebuild can only change UI and signals, graph, and Lua sections', () => {
  const raw = (id, value) => ({ id, wire: 0, raw: Buffer.from([value]) });
  const base = Buffer.alloc(24);
  const final = Buffer.alloc(24, 0);
  const input = [raw(4, 1), raw(9, 2), raw(10, 3), raw(50, 4)];
  let output = [raw(4, 1), raw(9, 5), raw(10, 6), raw(50, 7)];
  const wire = { container: bytes => bytes === base ? input : output, fields: rows => rows };
  assert.deepEqual(verifyPublishedRebase(base, final, wire), [9, 10, 50]);
  output[0] = raw(4, 8);
  assert.throws(() => verifyPublishedRebase(base, final, wire), /scene data changed in section 4/);
  output = [raw(9, 5), raw(4, 1), raw(10, 6), raw(50, 7)];
  assert.throws(() => verifyPublishedRebase(base, final, wire), /section layout changed/);
  final[4] = 1;
  assert.throws(() => verifyPublishedRebase(base, final, wire), /container structure changed/);
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
