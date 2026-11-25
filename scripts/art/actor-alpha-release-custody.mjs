import assert from 'node:assert/strict';
import {verifyReleaseFull, githubRequest} from '../release-ci.mjs';
import {requireReleasePerformance} from '../runtime-baseline/require-release-performance.mjs';
import {assertFullMatches, verifyGilArtifact} from '../runtime-baseline/release-performance-artifacts.mjs';
import {officialAssetsFromReceipt} from '../official-assets-profile.mjs';
import {verifyArtFeatureReceipt} from '../art-features.mjs';
import {uiProfileFromReceipt} from '../ui-profile.mjs';

const repository = 'FurinyaWorks/Slay-the-Heavens';
const api = '/repos/' + repository;
const captureRegistry = 'data/release/actor-alpha-release-captures.json';
const commit = /^[a-f0-9]{40}$/;
const digest = /^[a-f0-9]{64}$/;

async function ref(request, branch) {
  const remote = await request(api + '/git/ref/heads/' + branch);
  assert(remote?.ref === 'refs/heads/' + branch && remote.object?.type === 'commit' &&
    commit.test(remote.object.sha), 'Exact same-project branch proof required');
  return remote.object.sha;
}

export async function captureApprovalPins(target, approvalCommit, request) {
  assert(commit.test(approvalCommit ?? '') && approvalCommit !== target.head,
    'Provide the separate reviewed capture approval commit');
  const develop = await ref(request, 'develop');
  const ancestry = await request(api + '/compare/' + approvalCommit + '...' + develop);
  assert(ancestry?.base_commit?.sha === approvalCommit && ancestry.merge_base_commit?.sha === approvalCommit &&
    ['ahead', 'identical'].includes(ancestry.status), 'Capture approval commit is outside protected develop ancestry');
  const file = await request(api + '/contents/' + captureRegistry + '?ref=' + approvalCommit);
  assert(file?.type === 'file' && file.path === captureRegistry && file.encoding === 'base64' &&
    typeof file.content === 'string' && file.content.length <= 1024 * 1024, 'Reviewed capture approval registry is unavailable');
  const registry = JSON.parse(Buffer.from(file.content, 'base64'));
  assert(registry.schemaVersion === 1 && Array.isArray(registry.captures), 'Unknown capture approval registry');
  assert.equal(await ref(request, 'develop'), develop, 'Protected develop moved during capture approval verification');
  return registry.captures;
}

export async function finalActorAlphaBinding(inventory, approvalCommit, captureSha256, {
  request = githubRequest, readFull = verifyReleaseFull, readPerformance = requireReleasePerformance,
  readGil = verifyGilArtifact,
} = {}) {
  const {sourceCommit:head, version, profile} = inventory;
  assert(commit.test(head) && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version ?? '') &&
    digest.test(captureSha256 ?? ''), 'Exact frozen checkout and capture digest required');
  const target = {head, version, branch:'release/v' + version};
  const approvals = await captureApprovalPins(target, approvalCommit, request);
  const pins = approvals.filter(row => row.sourceCommit === head && row.branch === target.branch);
  assert(pins.length === 1 && pins[0].captureSha256 === captureSha256,
    'Exact final Simulator capture lacks independent approval');
  const pin = pins[0];
  assert(digest.test(pin.nativeReadbackSha256) && digest.test(pin.simulatorSaveSha256) &&
    typeof pin.approvalReference === 'string' && pin.approvalReference.trim(), 'Incomplete pinned native Simulator readback');

  const full = await readFull(repository, target.branch, head, request);
  const performance = await readPerformance(full, request);
  const {receipt, binding:gil} = await readGil(request, performance.gil.id, target);
  const keys = ['id', 'name', 'digest', 'runId', 'attempt', 'controllerSha', 'gilSha256', 'buildId',
    'payloadDigest', 'receiptSha256', 'manifestSha256'];
  assert(keys.every(key => gil[key] === performance.gil[key]), 'Audited GIL archive differs from verified release performance');
  assertFullMatches(gil, full);
  assert(receipt.officialAssetsProfile === profile && officialAssetsFromReceipt(receipt),
    'Trusted archive has a different production art profile');
  verifyArtFeatureReceipt(receipt.artFeatures);
  assert(uiProfileFromReceipt(receipt), 'Trusted archive lacks the native page lifecycle configuration');
  const capture = {
    candidateSha256: gil.gilSha256, buildId: gil.buildId, payloadDigest: gil.payloadDigest,
    officialAssetsProfile: profile, artConfigSha256: receipt.artFeatures.configSha256,
    uiConfigSha256: receipt.uiProfile.configSha256, candidateReceiptSha256: gil.receiptSha256,
    nativeReadbackSha256: pin.nativeReadbackSha256, simulatorSaveSha256: pin.simulatorSaveSha256,
  };
  assert(pin.gilArtifactId === gil.id && pin.candidateSha256 === capture.candidateSha256 &&
    pin.candidateReceiptSha256 === capture.candidateReceiptSha256 && pin.artConfigSha256 === capture.artConfigSha256 &&
    pin.uiConfigSha256 === capture.uiConfigSha256, 'Capture approval belongs to a different archived GIL or configuration');
  assert.equal(await ref(request, target.branch), head, 'Frozen release changed during capture verification');
  return {
    capture, expectedCaptureSha256: captureSha256,
    authority: {approvalCommit, approvalReference: pin.approvalReference, gilArtifactId: gil.id},
  };
}
