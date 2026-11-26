import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { execFileSync } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync, appendFileSync, mkdirSync, copyFileSync, renameSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { api, approvedRequest, artifactName, candidateTarget, digest, encoderSha256, findArtifact,
  GateError, nativeBuildVersions, profile, repository, repositoryId, requireGate, sha, toolCommit, verifyFrozenQuality, verifySource } from './gil-candidate-preflight.mjs';
import { hostedGilReceipt, importedGilReceipt, localArchiveReceipt, verifiedPayloadInputs } from './hosted-gil-receipt.mjs';
import { downloadLocalGilBundle, localGilRecord, readLocalGilBundle, writeLocalGilBundle } from './local-gil-bundle.mjs';

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const artifactFiles = ['candidate.gil', 'candidate.json', 'manifest.json'];
const basePath = () => join(process.env.RUNNER_TEMP, 'gil-base.gil');
const privateBundlePath = () => join(process.env.RUNNER_TEMP, 'gil-private-build.json');
const hash = data => createHash('sha256').update(data).digest('hex');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const moduleAt = (root, path) => import(pathToFileURL(resolve(root, path)).href);

async function preflight() {
  const source = process.env.SOURCE_SHA;
  requireGate(process.env.GITHUB_REF === 'refs/heads/develop' && process.env.GITHUB_REPOSITORY_ID === String(repositoryId),
    'Run the GIL candidate workflow from the trusted default develop branch.');
  const target = candidateTarget(process.env.SOURCE_REF, source);
  const controllerSha = process.env.GITHUB_SHA;
  const controlRoot = fileURLToPath(new URL('..', import.meta.url));
  cleanHead(controlRoot, controllerSha, 'Controller');
  const checks = await verifySource(source, api, target);
  const policy = {
    controllerSha,
    checkedFiles: [import.meta.url, new URL('../.github/workflows/gil-candidate.yml', import.meta.url)]
      .map(url => hash(readFileSync(new URL(url)))),
    ...(target.version && { sourceChecks: checks }),
  };
  const request = approvedRequest(process.env.GIL_CANDIDATE_APPROVAL, source, policy, target,
    process.env.GIL_CANDIDATE_BUILD_ORIGIN || 'hosted');
  const existing = await findArtifact(api, request, process.env.GITHUB_RUN_ID);
  const ciSummary = ['quality', 'licenses'].map(name => `[${name}](https://github.com/${repository}/actions/runs/${checks[name]})`);
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Source \`${target.branch}@${source}\` · ${ciSummary.join(' · ')}\n`);
  if (existing) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n[Download existing GIL candidate](${existing})\n`);
    return;
  }
  appendFileSync(process.env.GITHUB_OUTPUT, [
    'build=true', `base_sha256=${request.baseSha256}`, `work_key=${request.configuration.workKey}`,
    `tool_commit=${toolCommit}`, `request_id=${request.id}`, `release_version=${target.version ?? ''}`,
    `artifact_name=${artifactName(request)}`, `quality_run=${checks.quality}`, `licenses_run=${checks.licenses}`,
    ...(request.localBuild ? [
      'origin=local', `local_bundle_sha256=${request.localBuild.bundleSha256}`,
      `local_candidate_sha256=${request.localBuild.candidateSha256}`, `approval_reference=${request.localBuild.approvalReference}`,
    ] : ['origin=hosted']),
    ...(target.version ? [`quality_attempt=${checks.qualityAttempt}`, `quality_checkout_artifact=${checks.qualityCheckoutArtifact}`] : []),
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

function buildPaths(out) {
  const audioReceiptPath = join(out, 'audio/candidate.json');
  const audio = json(audioReceiptPath);
  requireGate(uuid.test(audio.buildId), 'Invalid audio build ID.');
  const fullRoot = join(out, 'full', audio.buildId);
  return { fullRoot, audio, audioReceiptPath, fullReceiptPath: join(fullRoot, 'candidate.json'),
    mapPath: resolve(out, 'audio/candidate.gil') };
}

function localBuildRecipe(workKey) {
  return { ...nativeBuildVersions,
    command: `npm run build:native -- <approved-base.gil> build/local-gil --release-candidate --work-key=${workKey}` };
}

export function verifyLocalProductionPreset(defaults, receiptOptions, nativePageLifecycle) {
  const { workKey, releaseCandidate, ...expected } = defaults;
  const { toolchainIdentity, ...actual } = receiptOptions;
  requireGate(isDeepStrictEqual({ ...actual, nativePageLifecycle }, expected),
    'Local GIL build options differ from the frozen default production preset.');
}

function exportLocal(branch, workKey, base, out, destination) {
  requireGate(destination, 'Use export-local <release branch> <work-key> <base.gil> <native-output> <private-bundle.json>.');
  const sourceSha = git('.', ['rev-parse', 'HEAD']);
  const { version } = candidateTarget(branch, sourceSha);
  requireGate(version && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(workKey) && workKey !== 'alpha-test',
    'Local GIL requires a frozen version and the actual production work-key.');
  cleanHead('.', sourceSha, 'Source');
  toolchain(process.env.MILIASTRA_MCP_ROOT);
  const recipe = localBuildRecipe(workKey);
  const python = execFileSync(process.env.MILIASTRA_PYTHON || 'python', ['--version'], {
    encoding: 'utf8', timeout: 10000,
  }).trim();
  requireGate(process.versions.node === recipe.node && python === 'Python ' + recipe.python,
    'Use the pinned Node and Python versions in the local GIL build recipe.');
  const { fullRoot, fullReceiptPath, audioReceiptPath, mapPath } = buildPaths(out);
  const identity = writeLocalGilBundle(destination, { base, intermediate: join(fullRoot, 'candidate.gil'),
    candidate: mapPath, fullReceipt: fullReceiptPath, audioReceipt: audioReceiptPath },
  (files, digests) => verifyLocalBuild(files, { sourceSha, workKey, version, ...digests }));
  console.log(JSON.stringify({ branch, version, sourceSha, workKey, ...identity, recipe }, null, 2));
}

export function verifyLocalBuild({ base, intermediate, candidate, fullReceipt, audioReceipt }, expected) {
  const full = JSON.parse(fullReceipt), audio = JSON.parse(audioReceipt);
  const finalGil = localGilRecord(candidate);
  requireGate(localGilRecord(base).sha256 === expected.baseSha256 && finalGil.sha256 === expected.candidateSha256,
    'Local base or final GIL differs from the approved SHA-256.');
  verifyReceipts({ ...expected, full, audio, fullReceipt, fullGil: localGilRecord(intermediate), finalGil });
  return { full, audio, fullReceipt, audioReceipt, finalGil, candidate };
}

function downloadLocal() {
  return downloadLocalGilBundle(process.env.GIL_LOCAL_BUILD_URL, privateBundlePath(), process.env.LOCAL_BUNDLE_SHA256);
}

async function candidateInputs(out, expected, fileRecord) {
  const { branch, bundleSha256, baseSha256 } = expected;
  if (bundleSha256) {
    const bundle = readLocalGilBundle(privateBundlePath(), bundleSha256);
    const { full, audio, fullReceipt, audioReceipt, finalGil, candidate } = verifyLocalBuild(bundle, expected);
    mkdirSync(out);
    const mapPath = resolve(out, 'candidate.gil');
    writeFileSync(mapPath, candidate, { flag: 'wx' });
    const receipt = importedGilReceipt(full, audio, { path: 'candidate.gil', ...finalGil }, branch);
    const { payloadDigest, sourceInputs } = await moduleAt('.', 'scripts/build-native-candidate.mjs');
    const { artBuildOptionsFromReceipt } = await moduleAt('.', 'scripts/art-features.mjs');
    const { nativeAudioBuildArgs } = await moduleAt('.', 'scripts/build-native-audio-game.mjs');
    const { uiProfileFromReceipt } = await moduleAt('.', 'scripts/ui-profile.mjs');
    const { options } = nativeAudioBuildArgs([]);
    for (const raw of [full, audio]) {
      verifyLocalProductionPreset(options, artBuildOptionsFromReceipt(raw), uiProfileFromReceipt(raw));
    }
    const { loadReleaseNotes, notesSha256 } = await moduleAt('.', 'scripts/release-notes.mjs');
    const payload = verifiedPayloadInputs('.', receipt, artBuildOptionsFromReceipt(receipt), sourceInputs);
    const release = loadReleaseNotes({ releaseCandidate: true, workKey: expected.workKey });
    requireGate(payloadDigest(payload) === receipt.payloadDigest && payloadDigest(full.inputs) === receipt.payloadDigest &&
      release.build.version === expected.version && notesSha256(release.currentNotice) === receipt.release.notesSha256,
    'Local GIL inputs or release notes do not match the reviewed source checkout.');
    return { audio, fullReceipt, audioReceipt, finalGil, mapPath, buildPayloadDigest: receipt.payloadDigest,
      receipt: localArchiveReceipt(receipt, payload, payloadDigest) };
  }
  requireGate(hash(readFileSync(basePath())) === baseSha256, 'Approved base GIL changed during the build.');
  const { fullRoot, audio, fullReceiptPath, audioReceiptPath, mapPath } = buildPaths(out);
  const fullReceipt = readFileSync(fullReceiptPath);
  const full = JSON.parse(fullReceipt);
  const finalGil = fileRecord(mapPath, out);
  const fullGil = fileRecord(join(fullRoot, basename(full.mapPath)), fullRoot);
  verifyReceipts({ ...expected, full, audio, fullReceipt, fullGil, finalGil });
  const candidate = { path: 'candidate.gil', bytes: finalGil.bytes, sha256: finalGil.sha256 };
  return { audio, fullReceipt, audioReceipt: readFileSync(audioReceiptPath), finalGil, mapPath,
    receipt: hostedGilReceipt('.', fullRoot, full, audio, candidate, branch) };
}

async function deliver() {
  const { SOURCE_SHA: sourceSha, BASE_SHA256: baseSha256, WORK_KEY: workKey, REQUEST_ID: requestId,
    MILIASTRA_MCP_ROOT: toolRoot, GIL_BUILD_SECONDS, GIL_RECEIVED_BYTES, SOURCE_REF: branch,
    RELEASE_VERSION: version, LOCAL_BUNDLE_SHA256: bundleSha256, LOCAL_CANDIDATE_SHA256: candidateSha256,
    GIL_APPROVAL_REFERENCE: approvalReference } = process.env;
  cleanHead('.', sourceSha, 'Source');
  toolchain(toolRoot);
  const out = bundleSha256 ? 'build/local-gil-intake' : 'build/hosted-gil';
  const { fileRecord } = await moduleAt('.', 'scripts/evidence-files.mjs');
  const { audio, fullReceipt, audioReceipt, finalGil, mapPath, receipt, buildPayloadDigest } = await candidateInputs(out,
    { branch, sourceSha, baseSha256, workKey, version, bundleSha256, candidateSha256 }, fileRecord);
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
  const candidate = receipt.candidate;
  copyFileSync(mapPath, join(artifact, candidate.path));
  requireGate(fileRecord(join(artifact, candidate.path)).sha256 === candidate.sha256, 'Artifact copy hash mismatch.');
  const receiptPath = join(artifact, 'candidate.json');
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n');
  const { auditNativeCandidate } = await moduleAt('.', 'scripts/audit-native-candidate.mjs');
  const audit = await auditNativeCandidate({ source: sourceSha, candidate: join(artifact, candidate.path), receipt: receiptPath,
    output: join(out, 'audit'), bgm: true });
  requireGate(audit.ok && audit.candidate.sha256Before === candidate.sha256 && audit.candidate.sha256After === candidate.sha256,
    'Final GIL failed the independent native scripts, UI, templates or graph audit.');
  const qualityRun = Number(process.env.QUALITY_RUN);
  const sourceChecks = { qualityRun, licensesRun: Number(process.env.LICENSES_RUN) };
  if (version) {
    const expected = { quality: qualityRun, qualityAttempt: Number(process.env.QUALITY_ATTEMPT),
      qualityCheckoutArtifact: Number(process.env.QUALITY_CHECKOUT_ARTIFACT) };
    const current = await verifyFrozenQuality(branch, sourceSha);
    requireGate(Object.keys(expected).every(key => expected[key] === current[key]),
      'Frozen Quality Full changed during the GIL build. Start again with the current attempt.');
    Object.assign(sourceChecks, { qualityAttempt: current.qualityAttempt, qualityCheckoutArtifact: current.qualityCheckoutArtifact });
  }
  writeFileSync(join(artifact, 'manifest.json'), JSON.stringify({
    sourceCommit: sourceSha, sourceBranch: branch, version: receipt.release.version, buildId: receipt.buildId,
    payloadDigest: receipt.payloadDigest, candidate, requestId, baseSha256, toolCommit, encoderSha256,
    controllerSha: process.env.GITHUB_SHA,
    sourceChecks,
    receipts: { nativeSha256: hash(fullReceipt), audioSha256: hash(audioReceipt) },
    buildOrigin: bundleSha256 ? 'local' : 'hosted',
    ...(bundleSha256 && { localBuild: { bundleSha256, candidateSha256, approvalReference, buildPayloadDigest, recipe: localBuildRecipe(workKey) } }),
    nativeAudit: 'pass',
    platformVersion: null,
    parameters: { workKey, profile, nativePageLifecycle: true, releaseCandidate: Boolean(version), liveWrite: false },
    ...(!bundleSha256 && { buildSeconds: Number(GIL_BUILD_SECONDS), runnerReceivedBytesBeforeUpload: Number(GIL_RECEIVED_BYTES) }) }, null, 2) + '\n');
  writeFileSync(join(artifact, 'SHA256SUMS'), artifactSums(artifact));
  const origin = bundleSha256 ? 'approved local build' : `hosted build ${GIL_BUILD_SECONDS} s · runner received ${GIL_RECEIVED_BYTES} bytes before upload`;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\nGIL: \`${finalGil.sha256}\` · ${finalGil.bytes} bytes · ${origin}\n`);
}

function artifactSums(directory) {
  return artifactFiles.map(name => `${hash(readFileSync(join(directory, name)))}  ${name}\n`).join('');
}

export function verifyDownloadedArtifact(upload, download) {
  const entries = readdirSync(download);
  const expected = readFileSync(join(upload, 'SHA256SUMS'), 'utf8');
  requireGate(entries.length === artifactFiles.length + 1 && [...artifactFiles, 'SHA256SUMS'].every(name => entries.includes(name)) &&
    readFileSync(join(download, 'SHA256SUMS'), 'utf8') === expected && artifactSums(download) === expected,
  'Downloaded GIL artifact contents or SHA-256 differ from the audited upload.');
}

function readback() {
  verifyDownloadedArtifact('source/build/gil-artifact', 'source/build/gil-readback');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, 'Downloaded the archived artifact on the runner and verified SHA-256 for the GIL, receipt and manifest.\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const phase = process.argv[2];
  try {
    await ({ preflight, base: downloadBase, toolchain, assets, diagnose, deliver, readback,
      'export-local': exportLocal, 'download-local': downloadLocal })[phase](...process.argv.slice(3));
  } catch (error) {
    console.error(error instanceof GateError ? error.message : `GIL candidate ${phase} failed. Raw tool output may contain private input data.`);
    process.exitCode = 1;
  }
}
