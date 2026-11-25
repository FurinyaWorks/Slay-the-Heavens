import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { api, approvedRequest, candidateTarget, findArtifact, verifyReceipts, verifySource } from '../scripts/gil-candidate.mjs';
import { fileRecord } from '../scripts/evidence-files.mjs';
import { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';

const sourceSha = '1'.repeat(40);
const baseSha256 = '2'.repeat(64);
const workKey = 'production-work';
const repo = { id: 1429751262 };
const approval = { sourceSha, baseSha256, workKey, reference: 'owner/42', baseProcessingApproved: true, publicArtifactApproved: true };
const request = changes => approvedRequest(JSON.stringify({ ...approval, ...changes }), sourceSha, 'policy');
const branch = 'hotfix/v2.1.1';
const version = 'v2.1.1';
const hotfix = candidateTarget(branch, sourceSha);

test('trusted develop owns protection, while audit receives the bound build context', () => {
  const workflow = readFileSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  assert.match(workflow, /^    if: github\.event_name == 'workflow_dispatch' && github\.repository_id == '1429751262' && github\.ref == 'refs\/heads\/develop'$/m);
  assert.match(workflow, /^          GIL_BASE_URL: \$\{\{ secrets\.GIL_BASE_URL \}\}$/m);
  assert.equal(workflow.match(/secrets\./g).length, 1);
  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));
  for (const [name, expression] of Object.entries({
    SOURCE_REF: 'inputs.source_ref', SOURCE_SHA: 'inputs.source_sha', WORK_KEY: 'steps.candidate.outputs.work_key',
    BASE_SHA256: 'steps.candidate.outputs.base_sha256', REQUEST_ID: 'steps.candidate.outputs.request_id',
    RELEASE_VERSION: 'steps.candidate.outputs.release_version',
  })) assert(audit.includes(`          ${name}: ${'${{'} ${expression} }}\n`), `audit requires ${name}`);
});

function formalApi({ comparison = { status: 'ahead', merge_base_commit: { sha: sourceSha } },
  conclusion = 'success', absentJob = '', runAttempt = 1, target = 'develop', event = 'push', refHead = sourceSha } = {}) {
  return async path => {
    if (path.startsWith('compare/')) return comparison;
    if (path.startsWith('git/ref/')) return { ref: `refs/heads/${target}`, object: { type: 'commit', sha: refHead } };
    const name = path.includes('/quality.yml/') ? 'quality' : 'licenses';
    const id = name === 'quality' ? 1 : 2;
    if (path.startsWith('actions/workflows/')) return { workflow_runs: [{
      id, status: 'completed', conclusion, repository: repo, head_repository: repo, run_attempt: 1,
      head_branch: target, head_sha: sourceSha, event, path: `.github/workflows/${name}.yml`,
    }] };
    if (path.includes('/jobs?')) {
      const runId = Number(path.split('/')[2]);
      const names = runId === 1 ? ['impact', 'check', 'presentation', 'engineering-posix'] : ['inventory'];
      const jobs = names.filter(job => job !== absentJob).map(name => ({
        name, status: 'completed', conclusion: 'success', run_id: runId, head_sha: sourceSha,
      }));
      return { jobs, total_count: jobs.length };
    }
    return { id: Number(path.split('/').at(-1)), run_attempt: runAttempt, conclusion: 'success' };
  };
}

test('admit only exact merged source with successful current Quality and inventory jobs', async () => {
  assert.deepEqual(await verifySource(sourceSha, formalApi()), { quality: 1, licenses: 2 });
  await assert.rejects(verifySource('develop; bad', () => assert.fail('queried invalid SHA')), /40-character/);
  await assert.rejects(verifySource(sourceSha, formalApi({ comparison: { status: 'diverged' } })), /not an ancestor/);
  await assert.rejects(verifySource(sourceSha, formalApi({ conclusion: 'failure' })), /must be successful/);
  await assert.rejects(verifySource(sourceSha, formalApi({ absentJob: 'inventory' })), /jobs must succeed/);
  await assert.rejects(verifySource(sourceSha, formalApi({ runAttempt: 2 })), /changed during verification/);
});

test('require hotfix dispatch, frozen Full and inventory audit on the same current HEAD', async () => {
  assert.deepEqual(hotfix, { branch, version });
  assert.throws(() => candidateTarget(branch, 'bad'), /40-character lowercase Git SHA/);
  for (const invalid of ['rc/v2.1.1', 'release/v2.1.1', 'hotfix/v2.01.1', 'hotfix/next']) {
    assert.throws(() => candidateTarget(invalid, sourceSha), /Select develop/);
  }
  const verifyFull = async (ref, head) => {
    assert.equal(ref, branch);
    assert.equal(head, sourceSha);
    return { runId: 9 };
  };
  const actions = { target: branch, event: 'workflow_dispatch' };
  assert.deepEqual(await verifySource(sourceSha, async path => {
    assert(!path.startsWith('compare/'));
    assert(!path.includes('/quality.yml/'));
    if (path.includes('/licenses.yml/')) assert.match(path, /branch=hotfix%2Fv2\.1\.1&event=workflow_dispatch/);
    return formalApi(actions)(path);
  }, hotfix, verifyFull), { quality: 9, licenses: 2 });
  await assert.rejects(verifySource(sourceSha, formalApi(actions), hotfix, async () => {
    throw new Error('stale');
  }), /successful hosted Quality Full/);
  await assert.rejects(verifySource(sourceSha, formalApi({ ...actions, event: 'push' }), hotfix, verifyFull), /must be successful/);
  await assert.rejects(verifySource(sourceSha, formalApi({ ...actions, refHead: '0'.repeat(40) }), hotfix, verifyFull), /HEAD changed/);
});

test('require bound base, work-key and public distribution authorization', () => {
  const candidate = request();
  assert.equal(candidate.configuration.releaseCandidate, false);
  assert.throws(() => approvedRequest('', sourceSha), /Set GIL_CANDIDATE_APPROVAL/);
  for (const changes of [{ sourceSha: '9'.repeat(40) }, { publicArtifactApproved: false }, { baseProcessingApproved: false },
    { workKey: 'alpha-test' }, { baseSha256: 'unknown' }]) {
    assert.throws(() => request(changes), /Approval must cover/);
  }
  assert.notEqual(candidate.id, request({ baseSha256: '3'.repeat(64) }).id);
  assert.notEqual(candidate.id, request({ workKey: 'other-work' }).id);
  assert.notEqual(candidate.id, approvedRequest(JSON.stringify(approval), sourceSha, 'new policy').id);
  const policy = { controllerSha: 'a'.repeat(40), checkedFiles: [baseSha256] };
  assert.notEqual(
    approvedRequest(JSON.stringify(approval), sourceSha, policy).id,
    approvedRequest(JSON.stringify(approval), sourceSha, { ...policy, controllerSha: 'b'.repeat(40) }).id,
  );
  const hotfixApproval = { ...approval, sourceBranch: branch, version };
  const release = approvedRequest(JSON.stringify(hotfixApproval), sourceSha, 'policy', hotfix);
  assert.equal(release.configuration.releaseCandidate, true);
  assert.notEqual(release.id, candidate.id);
  for (const changes of [{ sourceBranch: 'develop' }, { version: 'v2.1.2' }]) {
    assert.throws(() => approvedRequest(JSON.stringify({ ...hotfixApproval, ...changes }), sourceSha, 'policy', hotfix), /Approval must cover/);
  }
});

test('reuse only a matching unexpired Artifact on a successful main develop dispatch', async () => {
  const candidate = request();
  const now = Date.parse('2026-11-23T00:00:00Z');
  const run = { id: 10, repository: repo, head_repository: repo, event: 'workflow_dispatch', conclusion: 'success',
    head_branch: 'develop', display_title: `GIL candidate / develop / ${sourceSha}`, path: '.github/workflows/gil-candidate.yml' };
  const artifact = { id: 11, name: `gil-candidate-${candidate.id}`, expired: false,
    expires_at: '2026-11-24T00:00:00Z', size_in_bytes: 42, digest: 'sha256:' + baseSha256, workflow_run: { id: run.id } };
  const api = (runChanges = {}, artifactChanges = {}, downloadable = true) => async (path, checkDownload) => {
    if (checkDownload) return downloadable;
    return path.includes('/artifacts?') ? { artifacts: [{ ...artifact, ...artifactChanges }] } : { workflow_runs: [{ ...run, ...runChanges }] };
  };
  assert.match(await findArtifact(api(), candidate, '20', now), /runs\/10\/artifacts\/11$/);
  assert.equal(await findArtifact(api(), candidate, '10', now), undefined);
  assert.equal(await findArtifact(api({ head_repository: { id: 3 } }), candidate, '20', now), undefined);
  assert.equal(await findArtifact(api({}, {}, false), candidate, '20', now), undefined);
  for (const changes of [{ expired: true }, { expires_at: '2026-11-22T00:00:00Z' }, { digest: null }, { name: 'other' }]) {
    assert.equal(await findArtifact(api({}, changes), candidate, '20', now), undefined);
  }
});

test('reuse only a version-named Artifact for the exact hotfix from a default branch dispatch', async () => {
  const request = approvedRequest(JSON.stringify({ ...approval, sourceBranch: branch, version }), sourceSha, 'policy', hotfix);
  const now = Date.parse('2026-11-23T00:00:00Z');
  const run = { id: 10, repository: repo, head_repository: repo, event: 'workflow_dispatch', conclusion: 'success',
    head_branch: 'develop', head_sha: '9'.repeat(40), display_title: `GIL candidate / ${branch} / ${sourceSha}`,
    path: '.github/workflows/gil-candidate.yml' };
  const artifact = { id: 11, name: `gil-candidate-${version}-${sourceSha}-${request.id}`, expired: false,
    expires_at: '2026-11-24T00:00:00Z', size_in_bytes: 42, digest: 'sha256:' + baseSha256, workflow_run: { id: run.id } };
  const api = changes => async (path, checkDownload) => {
    if (checkDownload) return true;
    if (path.includes('/artifacts?')) return { artifacts: [artifact] };
    assert.match(path, /branch=develop/);
    return { workflow_runs: [{ ...run, ...changes }] };
  };
  assert.match(await findArtifact(api(), request, '20', now), /runs\/10\/artifacts\/11$/);
  assert.equal(await findArtifact(api({ display_title: `GIL candidate / ${branch} / ${'0'.repeat(40)}` }), request, '20', now), undefined);
  assert.equal(await findArtifact(api({ head_branch: branch }), request, '20', now), undefined);
});

test('reject missing protected base URL before downloads', () => {
  const result = spawnSync(process.execPath, ['scripts/gil-candidate.mjs', 'base'], {
    encoding: 'utf8', env: { ...process.env, GIL_BASE_URL: '' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Missing protected GIL_BASE_URL/);
});

test('check the download redirect without fetching the archive', async ({ mock }) => {
  const path = 'actions/artifacts/11/zip';
  const fetch = mock.method(globalThis, 'fetch', async () => new Response('{}'));
  await assert.rejects(api(path, true), /download redirect/);
  fetch.mock.mockImplementation(async () => new Response(null, { status: 410 }));
  assert.equal(await api(path, true), false);
  fetch.mock.mockImplementation(async (_url, options) => {
    assert.equal(options.redirect, 'manual');
    return new Response(null, { status: 302, headers: { location: 'https://example.com/archive' } });
  });
  assert.equal(await api(path, true), true);
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
    toolchainIdentity: { sourceSha256: request().encoderSha256 },
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

test('verify extracted hosted artifacts without opening the original runner paths', t => {
  const root = mkdtempSync(join(tmpdir(), 'hosted-native-gil-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = join(root, 'project');
  const mcp = join(root, 'mcp');
  const artifact = join(root, 'download');
  for (const dir of [join(repo, 'scripts'), join(mcp, 'src'), artifact]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(repo, 'scripts/native-client-check.mjs'), 'checker');
  writeFileSync(join(mcp, 'src/scene-save.mjs'), 'encoder');
  const candidatePath = join(artifact, 'candidate.gil');
  writeFileSync(candidatePath, 'candidate');
  const receipt = {
    receiptSchema: 'github-actions-gil-v1', candidate: { path: 'candidate.gil' },
    encoderPayloadPaths: ['D:\\actions\\mcp\\src\\scene-save.mjs', 'D:\\actions\\source\\scripts\\native-client-check.mjs'],
  };
  const receiptPath = join(artifact, 'candidate.json');
  assert.equal(hostedCandidatePath(receiptPath, receipt), fileRecord(candidatePath).path);
  assert.throws(() => hostedCandidatePath(receiptPath, { ...receipt, candidate: { path: '../candidate.gil' } }), /Unexpected candidate filename/);
  const options = { toolchainIdentity: { sourcePath: 'src/scene-save.mjs', helperPath: 'scripts/native-client-check.mjs' } };
  const collect = (_, { toolchainIdentity: { sourcePath, helperPath } }) => [fileRecord(sourcePath), fileRecord(helperPath)];
  const rows = verifiedPayloadInputs(repo, receipt, options, collect, mcp);
  assert.deepEqual(rows.map(row => row.path), receipt.encoderPayloadPaths);
  assert.throws(() => verifiedPayloadInputs(repo, receipt, { toolchainIdentity: { ...options.toolchainIdentity, sourcePath: '../source' } }, collect, mcp),
    /pinned MCP toolchain/);
});
