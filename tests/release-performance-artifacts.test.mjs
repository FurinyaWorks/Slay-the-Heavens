import assert from 'node:assert/strict';
import test from 'node:test';
import {finalActorAlphaBinding} from '../scripts/art/actor-alpha-release-custody.mjs';
import {artFeatureReceipt} from '../scripts/art-features.mjs';
import {uiProfileReceipt} from '../scripts/ui-profile.mjs';
import {refinedReleaseOfficialAssetsProfile, refinedReleaseOfficialAssetFlags} from '../scripts/official-assets-profile.mjs';
import {sha256, verifyGilArtifact} from '../scripts/runtime-baseline/release-performance-artifacts.mjs';

const id = 1429751262;
const head = 'a'.repeat(40);
const target = {branch:'release/v2.2.0', head, version:'2.2.0'};
const controllerSha = 'b'.repeat(40);
const requestId = 'c'.repeat(64);
const apiPrefix = '/repos/FurinyaWorks/Slay-the-Heavens';

function fixture() {
  const files = {'candidate.gil': Buffer.from('artifact fixture')};
  const candidate = {path:'candidate.gil', bytes:files['candidate.gil'].length, sha256:sha256(files['candidate.gil'])};
  const buildId = '29f48ea1-fa9d-4f76-b124-2bffc83f7594';
  const payloadDigest = 'd'.repeat(64);
  const workKey = 'release_220';
  const version = 'v' + target.version;
  const receipt = {receiptSchema:'github-actions-gil-v1', sourceCommit:head, sourceBranch:target.branch, sourceDirty:false,
    candidate, buildId, payloadDigest, liveWriteEnabled:false, release:{version, workKey, notesSha256:'1'.repeat(64)},
    sha256:candidate.sha256, bgmGraphReadback:{id:123, status:'pass'}, staticCheck:'pass', moduleReadback:'pass', artFeatures:{flags:{}}};
  const manifest = {sourceCommit:head, sourceBranch:target.branch, version, controllerSha, buildId, payloadDigest, candidate,
    nativeAudit:'pass', platformVersion:null, requestId, baseSha256:'3'.repeat(64), toolCommit:'4'.repeat(40), encoderSha256:'5'.repeat(64),
    receipts:{nativeSha256:'6'.repeat(64), audioSha256:'7'.repeat(64)},
    parameters:{releaseCandidate:true, liveWrite:false, nativePageLifecycle:true, profile:'official-assets-battle-v3', workKey},
    sourceChecks:{qualityRun:10, qualityAttempt:2, qualityCheckoutArtifact:90, licensesRun:11}};
  files['candidate.json'] = Buffer.from(JSON.stringify(receipt));
  files['manifest.json'] = Buffer.from(JSON.stringify(manifest));
  files.SHA256SUMS = Buffer.from(Object.entries(files).map(([name, bytes]) => sha256(bytes) + '  ' + name + '\n').join(''));
  const artifact = {id:1, name:'gil-candidate-' + version + '-' + head + '-' + requestId, expired:false,
    expires_at:'2099-11-25T00:00:00Z', created_at:'2026-11-25T12:01:00Z', digest:'sha256:' + '2'.repeat(64),
    workflow_run:{id:2, repository_id:id, head_repository_id:id, head_branch:'develop', head_sha:controllerSha}};
  const run = {id:2, run_attempt:3, repository:{id}, head_repository:{id}, path:'.github/workflows/gil-candidate.yml',
    event:'workflow_dispatch', head_branch:'develop', head_sha:controllerSha, status:'completed', conclusion:'success',
    display_title:'GIL candidate / ' + target.branch + ' / ' + head};
  const attempt = {...run, run_started_at:'2026-11-25T12:00:00Z'};
  const jobs = [{head_sha:controllerSha, run_attempt:3, conclusion:'success',
    steps:[{name:'Verify the archived download', conclusion:'success'}]}];
  const responses = new Map([
    ['/actions/artifacts/1', artifact],
    ['/actions/runs/2', run],
    ['/actions/runs/2/attempts/3', attempt],
    ['/actions/runs/2/attempts/3/jobs?per_page=100', {jobs}],
  ]);
  const request = async path => responses.get(path.slice(apiPrefix.length));
  return {request, load:async () => files, files, artifact, run, attempt, jobs};
}

test('uses the actual bytes from the trusted hosted native-audio artifact', async () => {
  const f = fixture();
  const proof = await verifyGilArtifact(f.request, 1, target, f.load);
  assert.equal(proof.binding.attempt, 3);
  assert.equal(proof.binding.qualityRun, 10);
  assert.equal(proof.binding.qualityAttempt, 2);
  assert.equal(proof.binding.qualityCheckoutArtifact, 90);
  assert.equal(proof.binding.gilSha256, sha256(f.files['candidate.gil']));
});

test('rejects a reused artifact from an older attempt or an untrusted controller', async () => {
  const stale = fixture();
  stale.attempt.run_started_at = '2026-11-25T12:02:00Z';
  await assert.rejects(verifyGilArtifact(stale.request, 1, target, stale.load), /same successful workflow attempt/);
  const foreign = fixture();
  foreign.run.head_repository.id = 5;
  await assert.rejects(verifyGilArtifact(foreign.request, 1, target, foreign.load), /Trusted successful workflow/);
});

test('rejects a changed GIL or an absent archive readback step', async () => {
  const changed = fixture();
  changed.files['candidate.gil'] = Buffer.from('invalid artifact bytes');
  await assert.rejects(verifyGilArtifact(changed.request, 1, target, changed.load), /GIL checksums differ/);
  const noReadback = fixture();
  noReadback.jobs[0].steps = [];
  await assert.rejects(verifyGilArtifact(noReadback.request, 1, target, noReadback.load), /verified publication step/);
});

async function alphaFixture() {
  const hosted = fixture();
  const receipt = JSON.parse(hosted.files['candidate.json']);
  const manifest = JSON.parse(hosted.files['manifest.json']);
  manifest.parameters.workKey = receipt.release.workKey = 'release-220';
  receipt.officialAssetsProfile = refinedReleaseOfficialAssetsProfile;
  receipt.refinedReleaseMonsterArt = true;
  receipt.artFeatures = artFeatureReceipt(refinedReleaseOfficialAssetFlags);
  receipt.uiProfile = uiProfileReceipt(true);
  hosted.files['candidate.json'] = Buffer.from(JSON.stringify(receipt));
  hosted.files['manifest.json'] = Buffer.from(JSON.stringify(manifest));
  hosted.files.SHA256SUMS = Buffer.from(['candidate.gil', 'candidate.json', 'manifest.json']
    .map(name => sha256(hosted.files[name]) + '  ' + name + '\n').join(''));
  const verified = await verifyGilArtifact(hosted.request, 1, target, hosted.load);
  const perf = {gil: verified.binding};
  const approvalCommit = 'e'.repeat(40), developTip = 'f'.repeat(40);
  const captureSha256 = 'b'.repeat(64);
  const pin = {
    sourceCommit: head, branch:target.branch, captureSha256, gilArtifactId:verified.binding.id,
    candidateSha256:verified.binding.gilSha256, candidateReceiptSha256:verified.binding.receiptSha256,
    artConfigSha256:receipt.artFeatures.configSha256, uiConfigSha256:receipt.uiProfile.configSha256,
    nativeReadbackSha256:'b'.repeat(64), simulatorSaveSha256:'a'.repeat(64), approvalReference:'independent fixture',
  };
  const ancestry = {base_commit:{sha:approvalCommit}, merge_base_commit:{sha:approvalCommit}, status:'ahead'};
  const registryPath = 'data/release/actor-alpha-release-captures.json';
  const paths = [];
  const request = async path => {
    paths.push(path);
    if (path === apiPrefix + '/git/ref/heads/develop') {
      return {ref:'refs/heads/develop', object:{type:'commit', sha:developTip}};
    }
    if (path === apiPrefix + '/git/ref/heads/' + target.branch) {
      return {ref:'refs/heads/' + target.branch, object:{type:'commit', sha:head}};
    }
    if (path === apiPrefix + '/compare/' + approvalCommit + '...' + developTip) return ancestry;
    if (path === apiPrefix + '/contents/' + registryPath + '?ref=' + approvalCommit) {
      return {type:'file', encoding:'base64', path:registryPath,
        content:Buffer.from(JSON.stringify({schemaVersion:1, captures:[pin]})).toString('base64')};
    }
    return hosted.request(path);
  };
  let archiveReads = 0;
  const bind = (sha = captureSha256, approval = approvalCommit) => finalActorAlphaBinding(
    {sourceCommit:head, version:target.version, profile:receipt.officialAssetsProfile}, approval, sha, {
      request, readFull:async () => ({runId:10, attempt:2, checkoutArtifactId:90}),
      readPerformance:async () => perf,
      readGil:async (get, artifactId, expected) => {
        archiveReads++;
        return verifyGilArtifact(get, artifactId, expected, hosted.load);
      },
    });
  return {bind, receipt, pin, paths, perf, hosted, approvalCommit, ancestry, archiveReads:() => archiveReads};
}

test('alpha custody combines actual hosted archive with exact reviewed develop ancestor and capture bytes', async () => {
  const f = await alphaFixture();
  const verified = await f.bind();
  assert.deepEqual(verified.authority, {approvalCommit:f.approvalCommit, approvalReference:f.pin.approvalReference, gilArtifactId:1});
  assert.equal(verified.expectedCaptureSha256, f.pin.captureSha256);
  assert.equal(verified.capture.candidateSha256, f.pin.candidateSha256);
  assert.equal(verified.capture.candidateReceiptSha256, f.pin.candidateReceiptSha256);
  assert.equal(verified.capture.artConfigSha256, f.receipt.artFeatures.configSha256);
  assert.equal(verified.capture.uiConfigSha256, f.receipt.uiProfile.configSha256);
  assert.equal(verified.capture.simulatorSaveSha256, f.pin.simulatorSaveSha256);
  assert(f.paths.some(path => path.endsWith('?ref=' + f.approvalCommit)));
});

test('alpha custody rejects self-authored relabelled captures and unreviewed commits before archive evaluation', async () => {
  const f = await alphaFixture();
  const relabelled = Buffer.from(JSON.stringify({
    scope:'production Lua actor painters from final native GIL readback',
    candidateSha256:f.pin.candidateSha256, fixture:'caller standalone capture',
  }));
  await assert.rejects(f.bind(sha256(relabelled)), /lacks independent approval/);
  await assert.rejects(f.bind(undefined, head), /separate reviewed capture approval/);
  f.ancestry.merge_base_commit.sha = 'd'.repeat(40);
  await assert.rejects(f.bind(), /outside protected develop ancestry/);
  assert.equal(f.archiveReads(), 0);
});

test('alpha custody rejects substituted binary, removed native audit, and mismatched performance or configuration', async () => {
  const changed = await alphaFixture();
  changed.hosted.files['candidate.gil'] = Buffer.from('ordinary local text');
  await assert.rejects(changed.bind(), /GIL checksums differ/);
  const unaudited = await alphaFixture();
  unaudited.hosted.jobs[0].steps = [];
  await assert.rejects(unaudited.bind(), /verified publication step/);
  const foreign = await alphaFixture();
  foreign.perf.gil = {...foreign.perf.gil, receiptSha256:'0'.repeat(64)};
  await assert.rejects(foreign.bind(), /differs from verified release performance/);
  const config = await alphaFixture();
  config.pin.artConfigSha256 = '0'.repeat(64);
  await assert.rejects(config.bind(), /different archived GIL or configuration/);
});
