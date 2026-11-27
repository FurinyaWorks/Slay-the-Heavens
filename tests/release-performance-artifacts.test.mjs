import assert from 'node:assert/strict';
import test from 'node:test';
import {finalActorAlphaBinding} from '../scripts/art/actor-alpha-release-custody.mjs';
import {artFeatureReceipt} from '../scripts/art-features.mjs';
import {uiProfileReceipt} from '../scripts/ui-profile.mjs';
import {refinedReleaseOfficialAssetsProfile, refinedReleaseOfficialAssetFlags} from '../scripts/official-assets-profile.mjs';
import {loadArtifact, sha256, verifyGilArtifact} from '../scripts/runtime-baseline/release-performance-artifacts.mjs';
import {legacyGilArchive} from '../scripts/runtime-baseline/published-baseline.mjs';
import {findReleaseArtifact} from '../scripts/gil-candidate.mjs';

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

function unifiedFixture(event, manifestChanges={}, workKey='confirmed-release') {
  const f = fixture();
  const branch = event === 'workflow_run' ? 'develop' : target.branch;
  const controller = event === 'workflow_run' ? controllerSha : head;
  Object.assign(f.run, {path:'.github/workflows/gil-build.yml', event, head_branch:branch, head_sha:controller,
    display_title:'GIL build / ' + target.branch + ' / ' + head});
  Object.assign(f.attempt, f.run);
  Object.assign(f.artifact.workflow_run, {head_branch:branch, head_sha:controller});
  f.jobs[0].head_sha = controller;
  const receipt = JSON.parse(f.files['candidate.json']);
  receipt.release.workKey = workKey;
  const manifest = JSON.parse(f.files['manifest.json']);
  Object.assign(manifest, {controllerSha:controller, baseSha256:legacyGilArchive.sha256, archiveApproved:true,
    custody:'gil-build-v1', parameters:{...manifest.parameters, workKey:receipt.release.workKey}, ...manifestChanges});
  f.files['candidate.json'] = Buffer.from(JSON.stringify(receipt));
  f.files['manifest.json'] = Buffer.from(JSON.stringify(manifest));
  f.files.SHA256SUMS = Buffer.from(['candidate.gil', 'candidate.json', 'manifest.json']
    .map(name => sha256(f.files[name]) + '  ' + name + '\n').join(''));
  return f;
}

function storedZip(entries) {
  const locals = [], directory = [];
  let offset = 0;
  for (const [name, data, mode = 0x80000000] of entries) {
    const nameBytes = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(mode, 38);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBytes, data);
    directory.push(central, nameBytes);
    offset += local.length + nameBytes.length + data.length;
  }
  const central = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, central, end]);
}

test('uses the exact artifact ID and checks archive bytes against fresh GitHub metadata', () => {
  const data = Buffer.from('candidate artifact');
  const other = Buffer.from('candidate receipt');
  const archive = storedZip([['candidate.gil', data], ['candidate.json', other]]);
  const endpoint = apiPrefix + '/actions/artifacts/37';
  const locator = {id:37, runId:56, name:'proven-candidate', digest:'sha256:' + sha256(archive)};
  const artifact = {...locator, workflow_run:{id:56}, expired:false, expires_at:'2099-11-25T00:00:00Z', size_in_bytes:archive.length};
  const names = ['candidate.gil', 'candidate.json'];
  const called = [];
  const download = (bytes, metadata = {}) => path => {
    called.push(path);
    assert([endpoint, endpoint + '/zip'].includes(path), 'Artifact fetch must use the exact ID');
    return path === endpoint ? Buffer.from(JSON.stringify({...artifact, ...metadata})) : bytes;
  };
  assert.deepEqual(loadArtifact(locator, names, download(archive)), {'candidate.gil':data, 'candidate.json':other});
  assert.deepEqual(called.splice(0), [endpoint, endpoint + '/zip']);
  assert.throws(() => loadArtifact(locator, names, download(archive, {id:38})), /API Artifact record changed/);
  assert.deepEqual(called.splice(0), [endpoint]);
  assert.throws(() => loadArtifact(locator, names, download(archive, {size_in_bytes:archive.length + 1})), /ZIP length differs/);
  const changed = Buffer.from(archive);
  changed[31] ^= 1;
  assert.throws(() => loadArtifact(locator, names, download(changed)), /ZIP digest differs/);

  for (const entries of [
    [['../candidate.gil', data], ['candidate.json', other]],
    [['candidate.gil', data], ['candidate.gil', data]],
    [['candidate.gil', data, 0xa0000000], ['candidate.json', other]],
  ]) {
    const invalid = storedZip(entries);
    const digest = 'sha256:' + sha256(invalid);
    assert.throws(() => loadArtifact({...locator, digest}, names,
      download(invalid, {digest, size_in_bytes:invalid.length})), /Unexpected Artifact ZIP entry/);
  }
});

test('uses the actual bytes from the trusted hosted native-audio artifact', async () => {
  const f = fixture();
  const proof = await verifyGilArtifact(f.request, 1, target, f.load);
  assert.equal(proof.binding.attempt, 3);
  assert.equal(proof.binding.qualityRun, 10);
  assert.equal(proof.binding.qualityAttempt, 2);
  assert.equal(proof.binding.qualityCheckoutArtifact, 90);
  assert.equal(proof.binding.gilSha256, sha256(f.files['candidate.gil']));
  assert.deepEqual(proof.gilBytes, f.files['candidate.gil']);
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

test('unified GIL uses the fixed production base from exact release runners or a trusted default branch continuation', async () => {
  for (const event of ['push', 'workflow_dispatch', 'workflow_run']) {
    const f = unifiedFixture(event);
    const proven = await verifyGilArtifact(f.request, 1, target, f.load);
    assert.equal(proven.binding.custody, 'gil-build-v1');
    assert.equal(proven.binding.qualityCheckoutArtifact, 90);
    assert.deepEqual(proven.gilBytes, f.files['candidate.gil']);
  }
  const defaultLabel = unifiedFixture('workflow_dispatch', {}, 'offline-candidate');
  assert.equal((await verifyGilArtifact(defaultLabel.request, 1, target, defaultLabel.load)).receipt.release.workKey, 'offline-candidate');
  const alpha = unifiedFixture('workflow_dispatch', {}, 'alpha-test');
  await assert.rejects(verifyGilArtifact(alpha.request, 1, target, alpha.load), /published-base production custody/);
  for (const changes of [{archiveApproved:false}, {custody:undefined}, {baseSha256:'a'.repeat(64)}]) {
    const f = unifiedFixture('workflow_dispatch', changes);
    await assert.rejects(verifyGilArtifact(f.request, 1, target, f.load), /published-base production custody/);
  }
});

test('unified GIL rejects release rebuilds, untrusted branch continuation, expired artifacts and absent audit steps', async () => {
  const unexpectedEvent = unifiedFixture('release');
  await assert.rejects(verifyGilArtifact(unexpectedEvent.request, 1, target, unexpectedEvent.load), /Trusted successful workflow/);
  const foreign = unifiedFixture('workflow_run');
  foreign.run.head_branch = 'test/gil-build/release';
  await assert.rejects(verifyGilArtifact(foreign.request, 1, target, foreign.load), /Trusted successful workflow/);
  const expired = unifiedFixture('workflow_dispatch');
  expired.artifact.expired = true;
  await assert.rejects(verifyGilArtifact(expired.request, 1, target, expired.load), /Active immutable same-project artifact/);
  const skipped = unifiedFixture('workflow_dispatch');
  skipped.jobs[0].steps[0].conclusion = 'skipped';
  await assert.rejects(verifyGilArtifact(skipped.request, 1, target, skipped.load), /verified publication step/);
});

test('equivalent builds reuse the exact verified artifact; stale, expired and partial requests cannot replace it', async () => {
  const request = {id:requestId, branch:target.branch, sourceSha:head, version:'v' + target.version, custody:'gil-build-v1'};
  const checks = {quality:10, qualityAttempt:2, qualityCheckoutArtifact:90, licenses:11};
  const f = unifiedFixture('workflow_dispatch');
  const lookup = artifacts => async path => path.startsWith('actions/artifacts?name=')
    ? {artifacts, total_count:artifacts.length} : f.run;
  const verify = async (artifactId, actual) => {
    assert.deepEqual(actual, target);
    return verifyGilArtifact(f.request, artifactId, target, f.load);
  };
  const binding = await findReleaseArtifact(request, checks, '4', lookup([f.artifact]), verify);
  assert.equal(binding.id, f.artifact.id);
  assert.equal(binding.gilSha256, sha256(f.files['candidate.gil']));
  await assert.rejects(findReleaseArtifact(request, {...checks, qualityAttempt:3}, '4', lookup([f.artifact]), verify), /current frozen Full/);
  await assert.rejects(findReleaseArtifact(request, checks, '4', lookup([{...f.artifact, expired:true}]), verify), /expired/);
  await assert.rejects(findReleaseArtifact(request, checks, String(f.run.id), lookup([f.artifact]), verify), /fresh dispatch/);
  assert.equal(await findReleaseArtifact({...request, id:'0'.repeat(64)}, checks, '4', lookup([f.artifact]), verify), undefined);
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
  assert.deepEqual(Object.keys(verified).sort(), ['authority', 'capture', 'expectedCaptureSha256']);
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
