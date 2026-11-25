import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { verifyDownloadedArtifact, verifyReceipts } from '../scripts/gil-candidate.mjs';
import { encoderSha256 } from '../scripts/gil-candidate-preflight.mjs';

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
