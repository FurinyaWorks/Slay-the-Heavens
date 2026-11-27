import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { verifyDownloadedArtifact, verifyPublishedRebase, verifyReceipts } from '../scripts/gil-candidate.mjs';
import * as preflight from '../scripts/gil-candidate-preflight.mjs';
import { api, approvedRequest, buildOnlyRequest, candidateTarget, encoderSha256, findArtifact, releaseBuildRequest, releaseBuildTarget, validationTarget, verifySource } from '../scripts/gil-candidate-preflight.mjs';
import { fileRecord } from '../scripts/evidence-files.mjs';
import { hostedCandidatePath, verifiedPayloadInputs } from '../scripts/hosted-gil-receipt.mjs';
import { downloadLegacyGilArchive, legacyGilArchive, supportsPublishedGilSeed } from '../scripts/runtime-baseline/published-baseline.mjs';

const sourceSha = '1'.repeat(40);
const baseSha256 = '2'.repeat(64);
const workKey = 'production-work';
const repo = { id: 1429751262 };
const policy = { controllerSha: '9'.repeat(40), checkedFiles: [baseSha256] };
const approval = { sourceSha, sourceBranch: 'develop', baseSha256, workKey, reference: 'owner/42', baseProcessingApproved: true, publicArtifactApproved: true };
const request = changes => approvedRequest(JSON.stringify({ ...approval, ...changes }), sourceSha, policy);
const branch = 'hotfix/v2.1.1';
const version = 'v2.1.1';
const hotfix = candidateTarget(branch, sourceSha);

test('only the unified workflow builds, audits and publishes a gated release download', () => {
  const path = new URL('../.github/workflows/gil-build.yml', import.meta.url);
  const workflow = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
  assert.equal(existsSync(new URL('../.github/workflows/gil-candidate.yml', import.meta.url)), false);
  assert.match(workflow, /workflows: \[Quality, Licenses\]/);
  assert.match(workflow, /github\.event\.workflow_run\.event == 'workflow_dispatch'/);
  assert.match(workflow, /GIL_PRODUCTION_WORK_KEY: \$\{\{ vars\.GIL_PRODUCTION_WORK_KEY \}\}/);
  assert.match(workflow, /ref: \$\{\{ env\.SOURCE_SHA \}\}/);
  assert.doesNotMatch(workflow, /release:\n|secrets\.|environment:|contents: write|attach-release:/);
  const sourceCheckout = workflow.slice(workflow.indexOf('          path: source\n'), workflow.indexOf('          path: miliastra-mcp\n'));
  const sparse = sourceCheckout.match(/^          sparse-checkout: \|\n((?: {12}\S+\n)+)/m)?.[1];
  assert.deepEqual(sparse?.trim().split('\n').map(path => path.trim()), [
    '.github/workflows', 'scripts', 'src/lua', 'data', 'config', 'tools', 'art/characters/traveler-geo/portraits',
    'art/lowpoly-select', 'art/performance', 'experiments/lumine-native-fit/fit-hybrid-final',
  ]);
  const audit = workflow.slice(workflow.indexOf('- name: Audit the final GIL'), workflow.indexOf('- uses: actions/upload-artifact'));
  for (const [name, expression] of Object.entries({
    WORK_KEY: 'steps.candidate.outputs.work_key', BASE_SHA256: 'steps.candidate.outputs.base_sha256',
    REQUEST_ID: 'steps.candidate.outputs.request_id', RELEASE_VERSION: 'steps.candidate.outputs.release_version',
    GIL_RELEASE_ARTIFACT: 'steps.candidate.outputs.archive', GIL_EARLY_TEST_ARTIFACT: 'steps.candidate.outputs.early_test',
    QUALITY_RUN: 'steps.candidate.outputs.quality_run',
    QUALITY_ATTEMPT: 'steps.candidate.outputs.quality_attempt', QUALITY_CHECKOUT_ARTIFACT: 'steps.candidate.outputs.quality_checkout_artifact',
    LICENSES_RUN: 'steps.candidate.outputs.licenses_run',
  })) assert(audit.includes(`          ${name}: ${'${{'} ${expression} }}\n`), `audit requires ${name}`);
  assert.match(workflow, /upload-artifact@[a-f0-9]{40}[\s\S]+download-artifact@[a-f0-9]{40}[\s\S]+gil-candidate\.mjs readback/);
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
  for (const invalid of ['rc/v2.1.1', 'release/v2.01.1', 'hotfix/v2.01.1', 'hotfix/next']) {
    assert.throws(() => candidateTarget(invalid, sourceSha), /Select develop/);
  }
  assert.deepEqual(candidateTarget('release/v2.1.1', sourceSha), { branch: 'release/v2.1.1', version });
  const verifyFull = async (ref, head) => {
    assert.equal(ref, branch);
    assert.equal(head, sourceSha);
    return { runId: 9, attempt: 2, checkoutArtifactId: 13 };
  };
  const actions = { target: branch, event: 'workflow_dispatch' };
  assert.deepEqual(await verifySource(sourceSha, async path => {
    assert(!path.startsWith('compare/'));
    assert(!path.includes('/quality.yml/'));
    if (path.includes('/licenses.yml/')) assert.match(path, /branch=hotfix%2Fv2\.1\.1&event=workflow_dispatch/);
    return formalApi(actions)(path);
  }, hotfix, verifyFull), { quality: 9, qualityAttempt: 2, qualityCheckoutArtifact: 13, licenses: 2 });
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
  const release = approvedRequest(JSON.stringify(hotfixApproval), sourceSha, policy, hotfix);
  assert.equal(release.configuration.releaseCandidate, true);
  assert.notEqual(release.id, candidate.id);
  for (const changes of [{ sourceBranch: 'develop' }, { version: 'v2.1.2' }]) {
    assert.throws(() => approvedRequest(JSON.stringify({ ...hotfixApproval, ...changes }), sourceSha, policy, hotfix), /Approval must cover/);
  }
});

test('reuse only a matching unexpired Artifact on a successful main develop dispatch', async () => {
  const candidate = request();
  const now = Date.parse('2026-11-23T00:00:00Z');
  const run = { id: 10, repository: repo, head_repository: repo, event: 'workflow_dispatch', conclusion: 'success',
    head_branch: 'develop', head_sha: policy.controllerSha, status: 'completed', display_title: `GIL candidate / develop / ${sourceSha}`, path: '.github/workflows/gil-candidate.yml' };
  const artifact = { id: 11, name: `gil-candidate-${candidate.id}`, expired: false,
    expires_at: '2026-11-24T00:00:00Z', size_in_bytes: 42, digest: 'sha256:' + baseSha256, workflow_run: { id: run.id } };
  const api = (runChanges = {}, artifactChanges = {}, downloadable = true) => async (path, checkDownload) => {
    if (checkDownload) return downloadable;
    return path.includes('/artifacts?') ? { artifacts: [{ ...artifact, ...artifactChanges }] } : { workflow_runs: [{ ...run, ...runChanges }] };
  };
  assert.match(await findArtifact(api(), candidate, '20', now), /runs\/10\/artifacts\/11$/);
  assert.equal(await findArtifact(api(), candidate, '10', now), undefined);
  assert.equal(await findArtifact(api({ head_repository: { id: 3 } }), candidate, '20', now), undefined);
  assert.equal(await findArtifact(api({ head_sha: '8'.repeat(40) }), candidate, '20', now), undefined);
  assert.equal(await findArtifact(api({}, {}, false), candidate, '20', now), undefined);
  for (const changes of [{ expired: true }, { expires_at: '2026-11-22T00:00:00Z' }, { digest: null }, { name: 'other' }]) {
    assert.equal(await findArtifact(api({}, changes), candidate, '20', now), undefined);
  }
});

test('reuse only a version-named Artifact for the exact hotfix from a default branch dispatch', async () => {
  const request = approvedRequest(JSON.stringify({ ...approval, sourceBranch: branch, version }), sourceSha, policy, hotfix);
  const now = Date.parse('2026-11-23T00:00:00Z');
  const run = { id: 10, repository: repo, head_repository: repo, event: 'workflow_dispatch', conclusion: 'success',
    head_branch: 'develop', head_sha: policy.controllerSha, status: 'completed', display_title: `GIL candidate / ${branch} / ${sourceSha}`,
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

test('diagnostic refs only upload a manifest and do not trigger tag rebuilds', () => {
  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  const fork = '1460133275';
  const testRef = 'refs/heads/ci/full/gil-build/v2.2.0-closure-20261127';
  for (const branch of ['develop', 'master', 'test/gil-build/probe']) {
    assert.deepEqual(validationTarget('1429751262', 'refs/heads/' + branch, sourceSha), { branch });
  }
  assert.deepEqual(validationTarget(fork, testRef, sourceSha), { branch: testRef.slice(11) });
  assert.throws(() => validationTarget(fork, 'refs/heads/develop', sourceSha), /assigned Fork B/);
  assert.throws(() => validationTarget('1429751262', testRef, sourceSha), /assigned Fork B/);
  assert.throws(() => validationTarget('3', testRef, sourceSha), /assigned Fork B/);
  assert.throws(() => validationTarget('1429751262', 'refs/tags/engine-v2.2.0', sourceSha), /enabled primary ref/);
  assert.match(workflow, /path: source\/build\/gil-artifact\/manifest\.json\n/);
  assert.match(workflow, /outputs\.build == 'true' && steps\.candidate\.outputs\.archive != 'true'/);
  assert.match(workflow, /outputs\.build == 'true' && \(steps\.candidate\.outputs\.archive == 'true' \|\| steps\.candidate\.outputs\.early_test == 'true'\)/);
  assert.match(workflow, /group: gil-build-.*head_branch.*head_sha/);
});

test('early GIL downloads require manual primary dispatch and the current protected source; use separate custody', async () => {
  const { earlyTestTarget, verifyEarlyTestHead, artifactName } = preflight;
  const dispatch = { repoId: String(repo.id), ref: 'refs/heads/ci/gil-test-download/v220-early-download', event: 'workflow_dispatch',
    testReleaseRef: 'release/v2.2.0', testSourceSha: sourceSha };
  assert.equal(typeof earlyTestTarget, 'function', 'manual release test target is supported');
  assert.equal(earlyTestTarget({ ...dispatch, testReleaseRef: '', testSourceSha: '' }), undefined);
  const target = earlyTestTarget(dispatch);
  assert.deepEqual(target, { branch: 'release/v2.2.0', version: 'v2.2.0', earlyTest: true });
  assert.deepEqual(earlyTestTarget({ ...dispatch, ref: 'refs/heads/develop' }), target);
  for (const changes of [{ event: 'push' }, { event: 'workflow_run' }, { repoId: '3' }, { ref: 'refs/heads/arbitrary' },
    { testReleaseRef: 'develop' }, { testReleaseRef: '' }, { testSourceSha: '' }, { testSourceSha: sourceSha.slice(1) }]) {
    assert.throws(() => earlyTestTarget({ ...dispatch, ...changes }), /manual dispatch|frozen release|40-character/);
  }
  const api = ({ protected: isProtected = true, head = sourceSha } = {}) => async path => {
    if (path === `git/ref/heads/${target.branch}`) return { ref: `refs/heads/${target.branch}`, object: { type: 'commit', sha: head } };
    assert.equal(path, 'branches/release%2Fv2.2.0');
    return { name: target.branch, protected: isProtected, commit: { sha: head } };
  };
  await verifyEarlyTestHead(api(), target.branch, sourceSha);
  await assert.rejects(verifyEarlyTestHead(api({ protected: false }), target.branch, sourceSha), /protected/);
  await assert.rejects(verifyEarlyTestHead(api({ head: '3'.repeat(40) }), target.branch, sourceSha), /HEAD changed/);
  const early = buildOnlyRequest(sourceSha, policy, target);
  assert.equal(early.configuration.releaseCandidate, true);
  assert.equal(early.archive, false);
  assert.match(artifactName(early), /^gil-test-v2\.2\.0-[a-f0-9]{40}-[a-f0-9]{64}$/);
  assert.doesNotMatch(artifactName(early), /^gil-candidate-/);
  const workflow = readFileSync(new URL('../.github/workflows/gil-build.yml', import.meta.url), 'utf8');
  assert.match(workflow, /workflow_dispatch:\n    inputs:[\s\S]*test_release_ref:[\s\S]*test_source_sha:/);
  assert.match(workflow, /retention-days: \$\{\{ steps\.candidate\.outputs\.early_test == 'true' && 14 \|\| 90 \}\}/);
  assert.doesNotMatch(workflow.match(/push:\n    branches: [^\n]*/)?.[0] ?? '', /ci\/gil-test-download/);
});

test('unified build admits exact primary release events and never a PR, foreign run or tag', () => {
  const release = { repoId: String(repo.id), ref: 'refs/heads/' + branch, controllerSha: sourceSha,
    source: sourceSha, branch, event: 'workflow_dispatch' };
  assert.deepEqual(releaseBuildTarget(release), hotfix);
  assert.deepEqual(releaseBuildTarget({...release, event:'push'}), hotfix);
  for (const changes of [{event:'release'}, {ref:'refs/tags/engine-v2.1.1'}, {repoId:'3'}, {controllerSha:'3'.repeat(40)}]) {
    assert.throws(() => releaseBuildTarget({...release, ...changes}), /formal GIL|Release GIL input/);
  }
  const upstream = {repository:repo, head_repository:repo, event:'workflow_dispatch', status:'completed', conclusion:'success',
    path:'.github/workflows/quality.yml', head_branch:branch, head_sha:sourceSha};
  const automatic = {...release, event:'workflow_run', ref:'refs/heads/develop', controllerSha:policy.controllerSha, upstream};
  assert.deepEqual(releaseBuildTarget(automatic), hotfix);
  assert.deepEqual(releaseBuildTarget({...automatic, upstream:{...upstream, path:'.github/workflows/licenses.yml'}}), hotfix);
  for (const changes of [{event:'pull_request'}, {conclusion:'failure'}, {head_repository:{id:3}}, {head_sha:'3'.repeat(40)},
    {head_branch:'develop'}, {path:'.github/workflows/arbitrary.yml'}]) {
    assert.throws(() => releaseBuildTarget({...automatic, upstream:{...upstream, ...changes}}), /successful primary/);
  }
});

test('equivalent triggers share one artifact request but changed Full, license or build policy gets a new candidate', () => {
  const checks = {quality:7, qualityAttempt:1, qualityCheckoutArtifact:8, licenses:9};
  const request = (key=workKey, evidence=checks, files=policy.checkedFiles) => releaseBuildRequest(key, sourceSha, hotfix, evidence, files);
  assert.equal(request().baseSha256, legacyGilArchive.sha256);
  assert.equal(request().custody, 'gil-build-v1');
  assert.equal(request().id, request().id);
  const defaultRequest = releaseBuildRequest(undefined, sourceSha, hotfix, checks, policy.checkedFiles);
  assert.equal(defaultRequest.configuration.workKey, 'offline-candidate');
  assert.equal(defaultRequest.id, request('').id);
  assert.equal(defaultRequest.id, request('offline-candidate').id);
  assert.notEqual(defaultRequest.id, request().id);
  for (const key of ['alpha-test', 'offline-performance', 'bad label', 99]) {
    assert.throws(() => request(key), /GIL_PRODUCTION_WORK_KEY/);
  }
  assert.throws(() => request(workKey, {...checks, licenses:0}), /exact Full/);
  assert.notEqual(request().id, request(workKey, {...checks, qualityAttempt:2}).id);
  assert.notEqual(request().id, request(workKey, {...checks, licenses:10}).id);
  assert.notEqual(request().id, request(workKey, checks, ['3'.repeat(64)]).id);
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
