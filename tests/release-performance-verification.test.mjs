import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {formalPublishBranch, publicationTarget} from '../scripts/release-ci.mjs';
import {requireReleasePerformance} from '../scripts/runtime-baseline/require-release-performance.mjs';
import {finalActorAlphaBinding} from '../scripts/art/actor-alpha-release-custody.mjs';
import {artFeatureReceipt} from '../scripts/art-features.mjs';
import {uiProfileReceipt} from '../scripts/ui-profile.mjs';
import {refinedReleaseOfficialAssetsProfile, refinedReleaseOfficialAssetFlags} from '../scripts/official-assets-profile.mjs';
import {sha256} from '../scripts/runtime-baseline/release-performance-artifacts.mjs';
import {head, tree, published, sha256 as workloadSha256, reportFixture, receipt, moduleDigestsSha256} from './helpers/release-performance-fixture.mjs';
import {beforeHotfixPublicationGate, hotfixPublicationGate} from './helpers/release-ci-workflow.mjs';

const repo = 'FurinyaWorks/Slay-the-Heavens';
const repository = {id:1429751262,full_name:repo};
const branch = 'release/v2.2.0';
const full = {repo, branch, head, runId:10, attempt:3, checkoutArtifactId:60};

function fixture(source = full, formalAttempt = 2, gilArtifactId = 30, gilAttempt = 1) {
  const {branch} = source;
  const version = branch.split('/v').at(-1);
  const refPath = '/git/ref/heads/' + branch;
  const workflowPath = '/actions/workflows/performance-regression.yml/runs?event=workflow_dispatch&branch=' +
    encodeURIComponent(branch) + '&head_sha=' + head + '&per_page=100&page=1';
  const fullPath = '/actions/workflows/quality.yml/runs?event=workflow_dispatch&branch=' +
    encodeURIComponent(branch) + '&per_page=100&page=1';
  const controller = '1'.repeat(40);
  const gil = {name:'gil-candidate-v' + version + '-' + head + '-' + '2'.repeat(64), id:gilArtifactId, runId:20, attempt:gilAttempt, controllerSha:controller,
    digest:'sha256:' + '3'.repeat(64), gilSha256:'4'.repeat(64), payloadDigest:'5'.repeat(64), buildId:'f960b8ee-5310-47d9-b21b-3bea1ef578c1',
    receiptSha256:'6'.repeat(64), manifestSha256:'7'.repeat(64), qualityRun:source.runId, qualityAttempt:source.attempt,
    qualityCheckoutArtifact:source.checkoutArtifactId};
  const formal = {name:'release-performance-40-' + formalAttempt, id:50, runId:40, attempt:formalAttempt, controllerSha:head, digest:'sha256:' + '8'.repeat(64)};
  const responses = new Map();
  const addPublished = (target, ref, path, display_title, step) => {
    const run = {id:target.runId, run_attempt:target.attempt, path:'.github/workflows/' + path, head_sha:target.controllerSha,
      head_branch:ref, repository, head_repository:repository, event:'workflow_dispatch', status:'completed', conclusion:'success', display_title};
    const artifact = {name:target.name, id:target.id, digest:target.digest, expired:false, expires_at:'2099-11-25T00:00:00Z',
      created_at:'2026-11-25T12:02:00Z', workflow_run:{id:target.runId, repository_id:repository.id, head_repository_id:repository.id,
        head_branch:ref, head_sha:target.controllerSha}};
    const pathPrefix = '/actions/runs/' + target.runId;
    const attemptPrefix = pathPrefix + '/attempts/' + target.attempt;
    responses.set('/actions/artifacts/' + target.id, artifact);
    responses.set(pathPrefix, run);
    responses.set(attemptPrefix, {...run, run_started_at:'2026-11-25T12:00:00Z'});
    responses.set(attemptPrefix + '/jobs?per_page=100', {jobs:[{run_attempt:target.attempt, head_sha:target.controllerSha,
      conclusion:'success', steps:[{name:step, conclusion:'success'}]}]});
    return {artifact, run};
  };
  const {run, artifact} = addPublished(formal, branch, 'performance-regression.yml', 'Formal resource release / ' + branch + ' / ' + head,
    'Bind formal resource report to audited GIL');
  addPublished(gil, 'develop', 'gil-candidate.yml', 'GIL candidate / ' + branch + ' / ' + head, 'Verify the archived download');
  responses.set(refPath, {ref:'refs/heads/' + branch, object:{type:'commit', sha:head}});
  responses.set(workflowPath, {workflow_runs:[run]});
  responses.set(fullPath, {workflow_runs:[{id:source.runId, run_attempt:source.attempt, head_sha:head, status:'completed', conclusion:'success'}]});
  responses.set('/actions/runs/40/artifacts?per_page=100&page=1', {artifacts:[artifact]});
  const report = Buffer.from(JSON.stringify(reportFixture()));
  const evidence = {schemaVersion:1, kind:'release-performance', source:{head, branch, version, tree}, runId:40, attempt:formalAttempt,
    gil, published, workloadSha256, reportSha256:sha256(report), artFeatures:receipt.artFeatures, moduleDigestsSha256};
  const options = {
    readSource:() => ({version, tree, workloadSha256}), readBaseline:async () => published,
    readArtifact:async locator => {
      assert.equal(locator.id, 50);
      return {'report.json':report, 'evidence.json':Buffer.from(JSON.stringify(evidence))};
    },
  };
  const request = async path => responses.get(path.slice(('/repos/' + repo).length));
  return {options, request, check:() => requireReleasePerformance(source, request, options), responses, evidence, run,
    refPath, workflowPath, fullPath};
}

test('requires the same frozen source, latest successful attempt and audited GIL before publication', async () => {
  const run = fixture();
  const proof = await run.check();
  assert.equal(proof.reportSha256, run.evidence.reportSha256);
  assert.equal(proof.gil.gilSha256, run.evidence.gil.gilSha256);
  assert.equal(proof.artifactId, 50);
  assert.equal(proof.attempt, 2);
});

test('no evidence or a newer failing formal run blocks a prior green result', async () => {
  const missing = fixture();
  missing.responses.set(missing.workflowPath, {workflow_runs:[]});
  await assert.rejects(missing.check(), /Latest formal release performance run must pass/);
  const failing = fixture();
  failing.responses.get(failing.workflowPath).workflow_runs.push({...failing.run, id:41, conclusion:'failure'});
  await assert.rejects(failing.check(), /Latest formal release performance run must pass/);
  const old = fixture();
  old.run.run_attempt = 3;
  await assert.rejects(old.check(), /one sealed artifact/);
});

test('rejects report tampering, a different original GIL, or a moving freeze', async () => {
  const tampered = fixture();
  tampered.evidence.reportSha256 = '9'.repeat(64);
  await assert.rejects(tampered.check(), /downloaded report differ/);
  const changed = fixture();
  changed.responses.get('/actions/artifacts/30').digest = 'sha256:' + '9'.repeat(64);
  await assert.rejects(changed.check(), /Audited GIL archive changed/);
  const moving = fixture();
  const original = moving.options.readArtifact;
  moving.options.readArtifact = async locator => {
    moving.responses.get(moving.refPath).object.sha = 'f'.repeat(40);
    return original(locator);
  };
  await assert.rejects(moving.check(), /Release HEAD changed/);
});

test('a new Full attempt or checkout receipt on the same run and source invalidates the GIL and formal result', async () => {
  const current = fixture();
  await assert.rejects(requireReleasePerformance({...full, attempt:4}, current.request, current.options), /current frozen Full run, attempt/);
  await assert.rejects(requireReleasePerformance({...full, checkoutArtifactId:61}, current.request, current.options), /checkout artifact differ/);
  current.responses.get(current.fullPath).workflow_runs[0].run_attempt = 4;
  await assert.rejects(current.check(), /Frozen Full changed during performance verification/);
});

test('Hotfix-to-master uses the hosted formal performance and GIL custody check', async () => {
  const branch = 'hotfix/v2.2.1';
  const event = {pull_request:{base:{ref:'master',repo:repository},head:{ref:branch,sha:head,repo:repository}}};
  const target = publicationTarget(event, repo, true);
  assert.deepEqual(target, {branch,head});
  const hotfix = fixture({...full,...target});
  assert.equal((await hotfix.check()).branch, branch);
  hotfix.responses.get(hotfix.fullPath).workflow_runs[0].run_attempt = 4;
  await assert.rejects(hotfix.check(), /Frozen Full changed during performance verification/);
  hotfix.responses.get(hotfix.fullPath).workflow_runs[0].run_attempt = 3;
  hotfix.run.run_attempt = 3;
  await assert.rejects(hotfix.check(), /one sealed artifact/);
  const quality = readFileSync(new URL('../.github/workflows/quality.yml',import.meta.url),'utf8').replaceAll('\r\n','\n');
  assert.equal(quality.split(hotfixPublicationGate).length, 2);
  assert(!beforeHotfixPublicationGate(quality).includes('verify-hotfix-pr'));
  assert.equal(beforeHotfixPublicationGate(quality + hotfixPublicationGate), quality + hotfixPublicationGate);
});

test('rejects a foreign, unversioned, protected or non-Hotfix publication ref', () => {
  const source = {ref:'hotfix/v2.2.1',sha:head,repo:repository};
  const base = {ref:'master',repo:repository};
  for (const ref of ['master','develop','hotfix/v02.2.1','hotfix/v2.2','hotfix/v2.2.1-rc','refs/heads/hotfix/v2.2.1']) {
    assert(!formalPublishBranch(ref));
    assert.throws(() => publicationTarget({pull_request:{base,head:{...source,ref}}}, repo, true), /same-repository Hotfix/);
  }
  for (const head of [{...source,ref:'release/v2.2.1'}, {...source,repo:{...repository,id:999}}, {...source,sha:'develop'}]) {
    assert.throws(() => publicationTarget({pull_request:{base,head}}, repo, true), /same-repository Hotfix/);
  }
  for (const other of [{...base,ref:'develop'}, {...base,repo:{...repository,id:999}}]) {
    assert.throws(() => publicationTarget({pull_request:{base:other,head:source}}, repo, true), /same-repository Hotfix/);
  }
});

async function alphaWithLivePerformance(advance) {
  const source = {...full, attempt:1};
  const latest = fixture(source, 1, 30);
  const originalGil = structuredClone(latest.evidence.gil);
  const profile = refinedReleaseOfficialAssetsProfile;
  const candidate = {
    officialAssetsProfile:profile, refinedReleaseMonsterArt:true,
    artFeatures:artFeatureReceipt(refinedReleaseOfficialAssetFlags), uiProfile:uiProfileReceipt(true),
  };
  const authority = 'e'.repeat(40), develop = 'f'.repeat(40), captureSha256 = '2'.repeat(64);
  const approvalPath = '/repos/' + repo + '/contents/data/release/actor-alpha-release-captures.json?ref=' + authority;
  const capture = {
    sourceCommit:head, branch:source.branch, captureSha256, gilArtifactId:originalGil.id,
    candidateSha256:originalGil.gilSha256, candidateReceiptSha256:originalGil.receiptSha256,
    nativeReadbackSha256:'a'.repeat(64), simulatorSaveSha256:'b'.repeat(64),
    artConfigSha256:candidate.artFeatures.configSha256, uiConfigSha256:candidate.uiProfile.configSha256,
    approvalReference:'independent synthetic fixture',
  };
  const request = async path => {
    if (path === '/repos/' + repo + '/git/ref/heads/develop') {
      return {ref:'refs/heads/develop', object:{type:'commit', sha:develop}};
    }
    if (path === '/repos/' + repo + '/compare/' + authority + '...' + develop) {
      return {base_commit:{sha:authority}, merge_base_commit:{sha:authority}, status:'ahead'};
    }
    if (path === approvalPath) {
      return {type:'file', encoding:'base64', path:'data/release/actor-alpha-release-captures.json',
        content:Buffer.from(JSON.stringify({schemaVersion:1, captures:[capture]})).toString('base64')};
    }
    return latest.request(path);
  };
  let reads = 0;
  const check = finalActorAlphaBinding({sourceCommit:head, version:'2.2.0', profile}, authority, captureSha256, {
    request, readFull:async () => source,
    readPerformance:(proof, get, options) => requireReleasePerformance(proof, get, {...latest.options, ...options}),
    loadPerformanceArtifact:async (...args) => {
      reads++;
      return latest.options.readArtifact(...args);
    },
    readGil:async (_, requestedId) => {
      assert.equal(requestedId, 30);
      advance?.(latest, source);
      return {receipt:candidate, binding:originalGil};
    },
  });
  return {check, reads:() => reads};
}

test('alpha rechecks live release authorization after the GIL read without downloading the formal report twice', async () => {
  const stable = await alphaWithLivePerformance();
  assert.equal((await stable.check).authority.gilArtifactId, 30);
  assert.equal(stable.reads(), 1);

  const racing = await alphaWithLivePerformance((live, source) => {
    const newer = fixture({...source, attempt:2}, 2, 31, 2);
    for (const [path, response] of newer.responses) live.responses.set(path, response);
    assert.equal(newer.run.run_attempt, 2);
    assert.equal(newer.evidence.gil.id, 31);
    assert.equal(newer.responses.get(newer.fullPath).workflow_runs[0].run_attempt, 2);
    assert.equal(newer.responses.get(newer.refPath).object.sha, head);
  });
  await assert.rejects(racing.check, /Formal archive changed while reading the GIL/);
  assert.equal(racing.reads(), 1);
});

test('alpha rejects a new Full attempt during the GIL read even when the formal archive is unchanged', async () => {
  const racing = await alphaWithLivePerformance(live => {
    live.responses.get(live.fullPath).workflow_runs[0].run_attempt = 2;
  });
  await assert.rejects(racing.check, /Frozen Full changed during performance verification/);
  assert.equal(racing.reads(), 1);
});


test('alpha rejects an audited GIL archive identity change after reading its bytes', async () => {
  const racing = await alphaWithLivePerformance(live => {
    live.responses.get('/actions/artifacts/30').digest = 'sha256:' + '0'.repeat(64);
  });
  await assert.rejects(racing.check, /Audited GIL archive changed/);
  assert.equal(racing.reads(), 1);
});
