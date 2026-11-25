import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync, appendFileSync, mkdirSync, copyFileSync, renameSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { githubRequest, verifyReleaseFull } from './release-ci.mjs';
import { hostedGilReceipt } from './hosted-gil-receipt.mjs';

const repository = 'FurinyaWorks/Slay-the-Heavens';
const repositoryId = 1429751262;
const toolCommit = '70470757d6fcb319c5afec13b178c87f2d8d54b3';
const encoderSha256 = 'eed054eea9285d1945ec826299e1e9546e36475d708007b2df1952ebca52f805';
const profile = 'official-assets-battle-v3';
const sha = /^[a-f0-9]{40}$/;
const digest = /^[a-f0-9]{64}$/;
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const basePath = () => join(process.env.RUNNER_TEMP, 'gil-base.gil');
const hash = data => createHash('sha256').update(data).digest('hex');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const moduleAt = (root, path) => import(pathToFileURL(resolve(root, path)).href);

class GateError extends Error {}
function requireGate(condition, message) {
  if (!condition) throw new GateError(message);
}

export function candidateTarget(branch, source) {
  requireGate(sha.test(source), 'source_sha must be a 40-character lowercase Git SHA.');
  if (branch === 'develop') return { branch };
  const version = /^hotfix\/(v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/.exec(branch)?.[1];
  requireGate(version, 'Select develop or a hotfix/vX.Y.Z branch.');
  return { branch, version };
}

async function verifyFrozenHead(api, branch, source) {
  const ref = await api(`git/ref/heads/${branch}`);
  requireGate(ref.ref === `refs/heads/${branch}` && ref.object?.type === 'commit' && ref.object.sha === source,
    'Hotfix HEAD changed. Freeze and validate the new SHA.');
}

export async function verifySource(source, api, { branch = 'develop', version } = { branch: 'develop' },
    verifyFull = (ref, head) => verifyReleaseFull(repository, ref, head, githubRequest)) {
  requireGate(sha.test(source), 'source_sha must be a 40-character lowercase Git SHA.');
  const checks = [['licenses', ['inventory']]];
  let quality;
  if (version) {
    try { quality = (await verifyFull(branch, source)).runId; } catch {
      throw new GateError('Frozen hotfix HEAD requires a successful hosted Quality Full and exact checkout receipt.');
    }
  } else {
    const comparison = await api(`compare/${source}...develop?per_page=1`);
    requireGate(['ahead', 'identical'].includes(comparison.status) && comparison.merge_base_commit?.sha === source,
      'source_sha is not an ancestor of main-repository develop.');
    checks.unshift(['quality', ['impact', 'check', 'presentation', 'engineering-posix']]);
  }
  const event = version ? 'workflow_dispatch' : 'push';
  const results = await Promise.all(checks.map(async ([name, required]) => {
    const { workflow_runs: [run] } = await api(`actions/workflows/${name}.yml/runs?branch=${encodeURIComponent(branch)}&event=${event}&head_sha=${source}&per_page=1`);
    requireGate(run?.repository?.id === repositoryId && run.head_repository?.id === repositoryId &&
      run.path === `.github/workflows/${name}.yml` && run.head_sha === source && run.head_branch === branch &&
      run.event === event && run.status === 'completed' && run.conclusion === 'success',
    `Latest ${name}.yml ${event} run on ${branch} for source_sha must be successful.`);
    const { jobs, total_count: count } = await api(`actions/runs/${run.id}/jobs?per_page=100`);
    requireGate(count === jobs.length && required.every(jobName => {
      const matching = jobs.filter(job => job.name === jobName);
      return matching.length === 1 && matching[0].head_sha === source && matching[0].run_id === run.id &&
        matching[0].status === 'completed' && matching[0].conclusion === 'success';
    }), `Required ${name}.yml jobs must succeed on source_sha.`);
    const current = await api(`actions/runs/${run.id}`);
    requireGate(current.id === run.id && current.run_attempt === run.run_attempt && current.conclusion === 'success',
      `${name}.yml run changed during verification.`);
    return [name, run.id];
  }));
  if (version) {
    await verifyFrozenHead(api, branch, source);
    results.unshift(['quality', quality]);
  }
  return Object.fromEntries(results);
}

export function approvedRequest(raw, sourceSha, policy, { branch = 'develop', version } = { branch: 'develop' }) {
  let approval;
  try { approval = JSON.parse(raw); } catch {
    throw new GateError('Set GIL_CANDIDATE_APPROVAL with the authorized base, work-key and public Artifact decision.');
  }
  const { baseSha256, workKey } = approval ?? {};
  requireGate(approval?.sourceSha === sourceSha && approval.baseProcessingApproved === true &&
    approval.publicArtifactApproved === true && /^[A-Za-z0-9._/-]{1,120}$/.test(approval.reference ?? '') &&
    (!version || approval.sourceBranch === branch && approval.version === version) &&
    digest.test(baseSha256) && workKey !== 'alpha-test' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workKey ?? ''),
  'Approval must cover this source SHA, release branch and version if applicable, base SHA-256, processing, public distribution and the confirmed production work-key.');
  const configuration = { profile, nativePageLifecycle: true, releaseCandidate: Boolean(version), workKey, node: '24.18.0', python: '3.12.10' };
  const identity = { sourceSha, baseSha256, toolCommit, encoderSha256, branch, version, configuration, policy };
  return { ...identity, id: hash(JSON.stringify(identity)) };
}

const artifactName = request => request.version
  ? `gil-candidate-${request.version}-${request.sourceSha}-${request.id}`
  : `gil-candidate-${request.id}`;

export async function findArtifact(api, request, runId, now = Date.now()) {
  for (let page = 1; page <= 10; page++) {
    const { workflow_runs: runs } = await api(`actions/workflows/gil-candidate.yml/runs?branch=develop&event=workflow_dispatch&status=success&per_page=100&page=${page}`);
    for (const run of runs) {
      if (String(run.id) === runId || run.repository?.id !== repositoryId || run.head_repository?.id !== repositoryId ||
        run.head_branch !== 'develop' || run.event !== 'workflow_dispatch' || run.conclusion !== 'success' ||
        run.path !== '.github/workflows/gil-candidate.yml' ||
        run.display_title?.toLowerCase() !== `gil candidate / ${request.branch} / ${request.sourceSha}`) continue;
      const name = artifactName(request);
      const { artifacts } = await api(`actions/runs/${run.id}/artifacts?name=${name}`);
      const artifact = artifacts.find(item => item.name === name && item.expired === false && Date.parse(item.expires_at) > now &&
        item.size_in_bytes > 0 && /^sha256:[a-f0-9]{64}$/.test(item.digest ?? '') && item.workflow_run?.id === run.id);
      if (artifact && await api(`actions/artifacts/${artifact.id}/zip`, true))
        return `https://github.com/${repository}/actions/runs/${run.id}/artifacts/${artifact.id}`;
    }
    if (runs.length < 100) return;
  }
}

export async function api(path, checkDownload = false) {
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(20000), redirect: checkDownload ? 'manual' : 'error',
  });
  if (checkDownload && [404, 410].includes(response.status)) return false;
  if (checkDownload) {
    requireGate(response.status === 302 && response.headers.get('location'), 'GitHub did not return a candidate download redirect.');
    return true;
  }
  requireGate(response.ok, path.startsWith('compare/') && response.status === 404
    ? 'source_sha is unknown in the main repository.' : `GitHub API verification failed (HTTP ${response.status}).`);
  return response.json();
}

async function preflight() {
  const source = process.env.SOURCE_SHA;
  requireGate(process.env.GITHUB_REF === 'refs/heads/develop' && process.env.GITHUB_REPOSITORY_ID === String(repositoryId),
    'Run the GIL candidate workflow from the trusted default develop branch.');
  const target = candidateTarget(process.env.SOURCE_REF, source);
  const controllerSha = process.env.GITHUB_SHA;
  const controlRoot = fileURLToPath(new URL('..', import.meta.url));
  cleanHead(controlRoot, controllerSha, 'Controller');
  const policy = {
    controllerSha,
    checkedFiles: [import.meta.url, new URL('../.github/workflows/gil-candidate.yml', import.meta.url)]
      .map(url => hash(readFileSync(new URL(url)))),
  };
  const request = approvedRequest(process.env.GIL_CANDIDATE_APPROVAL, source, policy, target);
  const checks = await verifySource(source, api, target);
  const existing = await findArtifact(api, request, process.env.GITHUB_RUN_ID);
  const ciSummary = Object.entries(checks).map(([name, id]) => `[${name}](https://github.com/${repository}/actions/runs/${id})`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Source \`${target.branch}@${source}\` · ${ciSummary.join(' · ')}\n`);
  if (existing) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n[Download existing GIL candidate](${existing})\n`);
    return;
  }
  appendFileSync(process.env.GITHUB_OUTPUT, [
    'build=true', `base_sha256=${request.baseSha256}`, `work_key=${request.configuration.workKey}`,
    `tool_commit=${toolCommit}`, `request_id=${request.id}`, `release_version=${target.version ?? ''}`,
    `artifact_name=${artifactName(request)}`,
  ].join('\n') + '\n');
}

async function downloadBase() {
  requireGate(process.env.GIL_BASE_URL, 'Missing protected GIL_BASE_URL for the approved base GIL.');
  const partial = basePath() + '.part';
  try {
    const url = new URL(process.env.GIL_BASE_URL);
    requireGate(url.protocol === 'https:' && !url.username && !url.password, 'Base GIL URL must use HTTPS without userinfo.');
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(300000) });
    requireGate(response.ok && response.body, `Base GIL download failed (HTTP ${response.status}).`);
    await pipeline(response.body, createWriteStream(partial, { flags: 'wx' }));
    requireGate(hash(readFileSync(partial)) === process.env.BASE_SHA256, 'Base GIL SHA-256 differs from the approved SHA-256.');
    renameSync(partial, basePath());
  } finally {
    rmSync(partial, { force: true });
  }
}

function git(root, args, env = process.env) {
  return execFileSync('git', args, { cwd: root, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function cleanHead(root, expected, label) {
  requireGate(sha.test(expected) && git(root, ['rev-parse', 'HEAD']) === expected &&
    !git(root, ['status', '--porcelain', '--untracked-files=all']), `${label} checkout is dirty or has the wrong commit.`);
}
function toolchain(root = 'miliastra-mcp') {
  requireGate(hash(readFileSync(join(root, 'src/scene-save.mjs'))) === encoderSha256, 'Pinned MCP encoder SHA-256 mismatch.');
  cleanHead(root, toolCommit, 'MCP');
}

async function assets() {
  const root = resolve('source');
  const { lfsEnvironment, lfsArguments } = await moduleAt(root, 'scripts/ci-reviewed-lfs.mjs');
  const { mediaByPath, mediaPointer } = await moduleAt(root, 'scripts/ci-media-lfs.mjs');
  const { sourceInputs } = await moduleAt(root, 'scripts/build-native-candidate.mjs');
  const { nativeAudioBuildArgs } = await moduleAt(root, 'scripts/build-native-audio-game.mjs');
  git(root, ['lfs', 'install', '--local', '--skip-smudge']);
  cleanHead(root, process.env.SOURCE_SHA, 'Source');
  const { options } = nativeAudioBuildArgs([]);
  requireGate(options.officialAssets && options.refinedReleaseMonsterArt && options.nativePageLifecycle,
    'This source does not have the approved default production preset.');
  const files = sourceInputs(root, options).map(row => relative(root, resolve(root, row.path)).replaceAll('\\', '/'))
    .map(path => mediaByPath.get(path)).filter(Boolean);
  for (const row of files) {
    const file = join(root, row.path);
    const data = readFileSync(file);
    if (data.length === row.bytes && hash(data) === row.sha256) continue;
    requireGate(data.equals(mediaPointer(row)), 'Production LFS pointer differs from the reviewed manifest.');
    let bytes;
    try {
      bytes = execFileSync('git', [...lfsArguments.slice(0, -6), 'lfs', 'smudge', '--', row.path], {
        cwd: root, env: { ...lfsEnvironment(), GIT_LFS_SKIP_SMUDGE: '0' }, input: data,
        maxBuffer: row.bytes + 4096, timeout: 90000, stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch { throw new GateError('Could not download a reviewed production LFS object.'); }
    requireGate(bytes.length === row.bytes && hash(bytes) === row.sha256, 'Production LFS asset size or SHA-256 mismatch.');
    writeFileSync(file, bytes);
    // Refresh the sparse index through the clean filter. The following clean-head check rejects any staged delta.
    git(root, ['add', '--', row.path]);
  }
  cleanHead(root, process.env.SOURCE_SHA, 'Source');
  console.log(`Verified production LFS assets: ${files.length} files, ${files.reduce((sum, row) => sum + row.bytes, 0)} bytes.`);
}

export function verifyReceipts({ full, audio, fullReceipt, fullGil, finalGil, sourceSha, baseSha256, workKey, version }) {
  requireGate(uuid.test(full.buildId) && audio.buildId === full.buildId && digest.test(full.payloadDigest) &&
    audio.payloadDigest === full.payloadDigest && [full, audio].every(row => row.sourceCommit === sourceSha &&
      row.sourceDirty === false && row.liveWriteEnabled === false && row.release?.workKey === workKey &&
      row.officialAssetsProfile === profile && row.uiProfile?.nativePageLifecycle === true &&
      row.nativeMonsterArt?.assetCount === 42 && row.nativeMonsterArt?.bindingCount === 42 &&
      row.toolchainIdentity?.sourceSha256 === encoderSha256), 'Candidate source, production preset or toolchain receipt mismatch.');
  requireGate(version ? [full, audio].every(row => row.release.version === version &&
    digest.test(row.release.notesSha256) && row.release.notesSha256 === full.release.notesSha256) :
    !full.release?.notesSha256 && !audio.release?.notesSha256, 'Candidate release version or notes provenance mismatch.');
  requireGate(full.baseMap?.sha256 === baseSha256 && full.statuses?.staticCheck === 'pass' &&
    audio.sourceReceipt?.sha256 === hash(fullReceipt) && audio.sourceReceipt?.bytes === fullReceipt.length &&
    full.candidate?.sha256 === fullGil.sha256 && full.candidate?.bytes === fullGil.bytes &&
    audio.baseSha256 === fullGil.sha256 && audio.baseAfter === fullGil.sha256 &&
    finalGil.bytes > 0 && finalGil.sha256 !== fullGil.sha256 && audio.candidate?.bytes === finalGil.bytes &&
    audio.sha256 === finalGil.sha256 && audio.candidate?.sha256 === finalGil.sha256,
  'Base, intermediate or final audio GIL size or SHA-256 mismatch.');
  requireGate(audio.checked?.ok === true && audio.checked.errors === 0 && audio.compiled?.written?.length === 1 &&
    Number.isSafeInteger(audio.compiled.written[0].graphId) && audio.moduleDigests?.abyss_bgm &&
    JSON.stringify(audio.moduleDigests) === JSON.stringify(full.moduleDigests), 'Missing successful BGM assembly, static check or module readback.');
}

function diagnose() {
  const prefix = 'build/hosted-gil';
  const workspaces = existsSync(join(prefix, 'full')) ? readdirSync(join(prefix, 'full')).filter(id => uuid.test(id)) : [];
  const files = dir => existsSync(dir) ? readdirSync(dir) : [];
  const full = workspaces.length === 1 ? files(join(prefix, 'full', workspaces[0])) : [];
  const audio = files(join(prefix, 'audio'));
  const lastFull = full.map(name => /^(\d+)-(\w+)\.json$/.exec(name)).filter(Boolean).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  console.error(`Native build failed. Full receipt present: ${full.includes('candidate.json')}. Last full step: ${lastFull?.[2] ?? 'none'}. BGM graph write attempted: ${audio.includes('write_graphs-result.json')}.`);
}

async function deliver() {
  const { SOURCE_SHA: sourceSha, BASE_SHA256: baseSha256, WORK_KEY: workKey, REQUEST_ID: requestId,
    MILIASTRA_MCP_ROOT: toolRoot, GIL_BUILD_SECONDS, GIL_RECEIVED_BYTES, SOURCE_REF: branch,
    RELEASE_VERSION: version } = process.env;
  cleanHead('.', sourceSha, 'Source');
  toolchain(toolRoot);
  requireGate(hash(readFileSync(basePath())) === baseSha256, 'Approved base GIL changed during the build.');
  const out = 'build/hosted-gil';
  const audio = json(join(out, 'audio/candidate.json'));
  requireGate(uuid.test(audio.buildId), 'Invalid audio build ID.');
  const fullRoot = join(out, 'full', audio.buildId);
  const fullReceipt = readFileSync(join(fullRoot, 'candidate.json'));
  const full = JSON.parse(fullReceipt);
  const { fileRecord } = await moduleAt('.', 'scripts/evidence-files.mjs');
  const mapPath = resolve(out, 'audio/candidate.gil');
  const finalGil = fileRecord(mapPath, out);
  const fullGil = fileRecord(join(fullRoot, basename(full.mapPath)), fullRoot);
  verifyReceipts({ full, audio, fullReceipt, fullGil, finalGil, sourceSha, baseSha256, workKey, version });
  const { inspectFile } = await moduleAt(toolRoot, 'src/adapter.mjs');
  const { nativeBgmSignals } = await moduleAt('.', 'scripts/native-bgm-graph.mjs');
  const inspection = inspectFile(mapPath);
  const graphId = audio.compiled.written[0].graphId;
  requireGate(inspection.sha256 === finalGil.sha256 && inspection.graphs.some(graph => graph.id === graphId &&
    graph.name === '_GSTS_ABYSS_BGM' && graph.nodeCount > 0) &&
    Object.values(nativeBgmSignals).every(signal => inspection.signals.some(ref => ref.name === signal)),
  'Final GIL readback has no compiled BGM graph with the expected cue signals.');
  const artifact = 'build/gil-artifact';
  mkdirSync(artifact);
  const candidate = { path: 'candidate.gil', bytes: finalGil.bytes, sha256: finalGil.sha256 };
  copyFileSync(mapPath, join(artifact, candidate.path));
  requireGate(fileRecord(join(artifact, candidate.path)).sha256 === candidate.sha256, 'Artifact copy hash mismatch.');
  const receiptPath = join(artifact, 'candidate.json');
  const receipt = hostedGilReceipt('.', fullRoot, full, audio, candidate, branch);
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  const { auditNativeCandidate } = await moduleAt('.', 'scripts/audit-native-candidate.mjs');
  const audit = await auditNativeCandidate({ source: sourceSha, candidate: join(artifact, candidate.path), receipt: receiptPath,
    output: join(out, 'audit'), bgm: true });
  requireGate(audit.ok && audit.candidate.sha256Before === candidate.sha256 && audit.candidate.sha256After === candidate.sha256,
    'Final GIL failed the independent native scripts, UI, templates or graph audit.');
  if (version) await verifyFrozenHead(api, branch, sourceSha);
  writeFileSync(join(artifact, 'manifest.json'), JSON.stringify({
    sourceCommit: sourceSha, sourceBranch: branch, version: receipt.release.version, buildId: receipt.buildId,
    payloadDigest: receipt.payloadDigest, candidate, requestId, baseSha256, toolCommit, encoderSha256,
    controllerSha: process.env.GITHUB_SHA,
    nativeAudit: 'pass',
    platformVersion: null,
    parameters: { workKey, profile, nativePageLifecycle: true, releaseCandidate: Boolean(version), liveWrite: false },
    buildSeconds: Number(GIL_BUILD_SECONDS), runnerReceivedBytesBeforeUpload: Number(GIL_RECEIVED_BYTES) }, null, 2) + '\n');
  const files = ['candidate.gil', 'candidate.json', 'manifest.json'];
  writeFileSync(join(artifact, 'SHA256SUMS'), files.map(name => `${fileRecord(join(artifact, name)).sha256}  ${name}\n`).join(''));
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\nGIL: \`${finalGil.sha256}\` · ${finalGil.bytes} bytes · native build ${GIL_BUILD_SECONDS} s · runner received ${GIL_RECEIVED_BYTES} bytes before upload\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const phase = process.argv[2];
  try {
    await ({ preflight, base: downloadBase, toolchain, assets, diagnose, deliver })[phase]();
  } catch (error) {
    console.error(error instanceof GateError ? error.message : `GIL candidate ${phase} failed. Raw tool output may contain private input data.`);
    process.exitCode = 1;
  }
}
