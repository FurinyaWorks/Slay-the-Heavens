import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstatSync, mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const repository = 'FurinyaWorks/Slay-the-Heavens';
const repo = '/repos/' + repository;
const repositoryId = 1429751262;
const digest = /^[a-f0-9]{64}$/;
const commit = /^[a-f0-9]{40}$/;
const validId = value => Number.isSafeInteger(value) && value > 0;
export const sha256 = value => createHash('sha256').update(value).digest('hex');
const gilFiles = ['candidate.gil', 'candidate.json', 'manifest.json', 'SHA256SUMS'];

export function assertFullMatches(gil, full) {
  assert(gil.qualityRun === full.runId && gil.qualityAttempt === full.attempt && gil.qualityCheckoutArtifact === full.checkoutArtifactId,
    'Audited GIL and current frozen Full run, attempt or checkout artifact differ');
}

export function loadArtifact(locator, names) {
  const directory = mkdtempSync(join(tmpdir(), 'sth-release-performance-'));
  try {
    execFileSync('gh', ['run', 'download', String(locator.runId), '--repo', repository, '--name', locator.name, '--dir', directory],
      {encoding:'utf8', timeout:60_000, maxBuffer:1024 * 1024});
    assert.deepEqual(readdirSync(directory).sort(), [...names].sort(), 'Trusted artifact file set changed');
    return Object.fromEntries(names.map(name => {
      const file = join(directory, name);
      const stat = lstatSync(file);
      assert(stat.isFile() && stat.size > 0 && stat.size <= 64 * 1024 ** 2, 'Unexpected file in trusted artifact');
      return [name, readFileSync(file)];
    }));
  } finally {
    rmSync(directory, {recursive:true, force:true});
  }
}

export async function readRunArtifact(request, id, expected) {
  assert(validId(id), 'GitHub artifact ID required');
  const artifact = await request(repo + '/actions/artifacts/' + id);
  const runId = artifact?.workflow_run?.id;
  assert(artifact?.id === id && expected.name.test(artifact.name) && artifact.expired === false &&
    Date.parse(artifact.expires_at) > Date.now() && /^sha256:[a-f0-9]{64}$/.test(artifact.digest) &&
    artifact.workflow_run.repository_id === repositoryId && artifact.workflow_run.head_repository_id === repositoryId &&
    artifact.workflow_run.head_branch === expected.branch && validId(runId), 'Active immutable same-project artifact required');
  const run = await request(repo + '/actions/runs/' + runId);
  assert(run?.id === runId && validId(run.run_attempt) && run.repository?.id === repositoryId &&
    run.head_repository?.id === repositoryId && run.path === expected.path && run.event === 'workflow_dispatch' &&
    run.head_branch === expected.branch && commit.test(run.head_sha) && run.head_sha === artifact.workflow_run.head_sha && run.status === 'completed' &&
    run.conclusion === 'success', 'Trusted successful workflow run required');
  if (expected.head) assert.equal(run.head_sha, expected.head, 'Workflow ran outside the frozen source');
  if (expected.title) assert.equal(run.display_title, expected.title, 'Workflow run request does not match the frozen source');
  const prefix = repo + '/actions/runs/' + runId + '/attempts/' + run.run_attempt;
  const attempt = await request(prefix);
  assert(attempt?.id === runId && attempt.run_attempt === run.run_attempt && attempt.head_sha === run.head_sha &&
    attempt.conclusion === 'success' && Date.parse(artifact.created_at) >= Date.parse(attempt.run_started_at),
    'Artifact was not produced in the same successful workflow attempt');
  const {jobs} = await request(prefix + '/jobs?per_page=100');
  assert(Array.isArray(jobs) && jobs.length === 1 && jobs[0].run_attempt === run.run_attempt &&
    jobs[0].head_sha === run.head_sha && jobs[0].conclusion === 'success' &&
    jobs[0].steps?.some(step => step.name === expected.step && step.conclusion === 'success'),
    'Required verified publication step is absent from the trusted workflow attempt');
  return {id, name:artifact.name, digest:artifact.digest, runId, attempt:run.run_attempt, controllerSha:run.head_sha};
}

function verifyGilFiles(files, locator, target) {
  const manifest = JSON.parse(files['manifest.json']);
  const receipt = JSON.parse(files['candidate.json']);
  const gilSha256 = sha256(files['candidate.gil']);
  const version = 'v' + target.version;
  const sums = gilFiles.slice(0, -1).map(name => sha256(files[name]) + '  ' + name + '\n').join('');
  assert.equal(files.SHA256SUMS.toString('utf8'), sums, 'Downloaded GIL checksums differ');
  assert(manifest.sourceCommit === target.head && manifest.sourceBranch === target.branch &&
    manifest.controllerSha === locator.controllerSha && manifest.version === version &&
    manifest.nativeAudit === 'pass' && manifest.parameters?.releaseCandidate === true && manifest.parameters.liveWrite === false &&
    manifest.parameters.nativePageLifecycle === true && manifest.platformVersion === null &&
    manifest.parameters.profile === 'official-assets-battle-v3' && digest.test(manifest.baseSha256) &&
    commit.test(manifest.toolCommit) && digest.test(manifest.encoderSha256) &&
    digest.test(manifest.receipts?.nativeSha256) && digest.test(manifest.receipts?.audioSha256) &&
    /^[a-f0-9]{64}$/.test(manifest.requestId) && locator.name === 'gil-candidate-' + version + '-' + target.head + '-' + manifest.requestId,
    'Production GIL manifest does not certify this frozen source');
  assert.deepEqual(manifest.candidate, {path:'candidate.gil', bytes:files['candidate.gil'].length, sha256:gilSha256});
  const { buildOrigin = 'hosted', localBuild } = manifest;
  assert(buildOrigin === 'local' ? digest.test(localBuild?.bundleSha256) && localBuild?.candidateSha256 === gilSha256 &&
    digest.test(localBuild.buildPayloadDigest) && /^\d+\.\d+\.\d+$/.test(localBuild.recipe?.node ?? '') &&
    /^\d+\.\d+\.\d+$/.test(localBuild.recipe?.python ?? '') &&
    localBuild.recipe.command === 'npm run build:native -- <approved-base.gil> build/local-gil --release-candidate --work-key=' + manifest.parameters.workKey &&
    /^[A-Za-z0-9._/-]{1,120}$/.test(localBuild.approvalReference ?? '') : buildOrigin === 'hosted' && localBuild === undefined,
  'Production GIL build origin or local approval identity differs');
  assert.deepEqual(receipt.candidate, manifest.candidate, 'Audited candidate files disagree');
  assert(receipt.receiptSchema === 'github-actions-gil-v1' && receipt.sourceCommit === target.head &&
    receipt.sourceBranch === target.branch && receipt.sourceDirty === false && receipt.liveWriteEnabled === false &&
    receipt.release?.version === version && receipt.release.workKey && receipt.release.workKey === manifest.parameters.workKey &&
    digest.test(receipt.release.notesSha256 ?? '') &&
    /^[a-f0-9-]{36}$/.test(receipt.buildId ?? '') && receipt.buildId === manifest.buildId &&
    digest.test(receipt.payloadDigest ?? '') && receipt.payloadDigest === manifest.payloadDigest &&
    receipt.sha256 === gilSha256 && receipt.bgmGraphReadback?.status === 'pass' && validId(receipt.bgmGraphReadback.id) &&
    receipt.staticCheck === 'pass' && receipt.moduleReadback === 'pass' &&
    validId(manifest.sourceChecks?.qualityRun) && validId(manifest.sourceChecks?.qualityAttempt) &&
    validId(manifest.sourceChecks?.qualityCheckoutArtifact) && validId(manifest.sourceChecks?.licensesRun),
    'Production GIL receipt is missing approved build, audio or CI identity');
  return {receipt, gilBytes:files['candidate.gil'], binding:{...locator, gilSha256, buildId:receipt.buildId, payloadDigest:receipt.payloadDigest,
    receiptSha256:sha256(files['candidate.json']), manifestSha256:sha256(files['manifest.json']),
    qualityRun:manifest.sourceChecks.qualityRun, qualityAttempt:manifest.sourceChecks.qualityAttempt,
    qualityCheckoutArtifact:manifest.sourceChecks.qualityCheckoutArtifact, ...(localBuild && {buildOrigin, localBuild})}};
}

export function gilArtifactExpectation(target) {
  return {name:/^gil-candidate-v[0-9.]+-[a-f0-9]{40}-[a-f0-9]{64}$/,
    path:'.github/workflows/gil-candidate.yml', branch:'develop',
    title:'GIL candidate / ' + target.branch + ' / ' + target.head, step:'Verify the archived download'};
}

export async function verifyGilArtifact(request, id, target, load = loadArtifact) {
  const expected = gilArtifactExpectation(target);
  const locator = await readRunArtifact(request, id, expected);
  const proof = verifyGilFiles(await load(locator, gilFiles), locator, target);
  assert.deepEqual(await readRunArtifact(request, id, expected), locator, 'GIL archive changed during verification');
  return proof;
}
