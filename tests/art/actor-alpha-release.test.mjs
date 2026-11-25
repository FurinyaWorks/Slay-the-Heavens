import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import test from 'node:test';
import {finalActorAlphaBinding} from '../../scripts/art/check-actor-alpha.mjs';
import {artFeatureReceipt} from '../../scripts/art-features.mjs';
import {uiProfileReceipt} from '../../scripts/ui-profile.mjs';
import {refinedReleaseOfficialAssetFlags, refinedReleaseOfficialAssetsProfile} from '../../scripts/official-assets-profile.mjs';
import {sha256} from '../../scripts/evidence-files.mjs';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'actor-alpha-release-test-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  const gil = Buffer.from('synthetic final GIL fixture');
  const gilPath = join(directory, 'candidate.gil');
  const simulatorSave = Buffer.from('synthetic native readback fixture');
  writeFileSync(gilPath, gil);
  writeFileSync(join(directory, 'simulator.save.json'), simulatorSave);
  const candidatePath = join(directory, 'candidate.json');
  const adapterPath = join(directory, 'adapter-receipt.json');
  const inventory = {sourceCommit: 'a'.repeat(40), profile: refinedReleaseOfficialAssetsProfile};
  const candidate = {
    receiptSchema: 'github-actions-gil-v1',
    sourceCommit: inventory.sourceCommit, sourceDirty: false,
    buildId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    candidate: {path: 'candidate.gil', bytes: gil.length, sha256: sha256(gil)},
    release: {version: 'v2.2.0', workKey: 'alpha-test', notesSha256: 'c'.repeat(64)},
    payloadDigest: 'd'.repeat(64), officialAssetsProfile: inventory.profile, refinedReleaseMonsterArt: true,
    artFeatures: artFeatureReceipt(refinedReleaseOfficialAssetFlags), uiProfile: uiProfileReceipt(true),
  };
  const adapter = {
    sourceCommit: inventory.sourceCommit, sourceDirty: false,
    candidateSha256: candidate.candidate.sha256, buildId: candidate.buildId,
    luaSourceExact: true, allActualLuaGuidsReadFromGil: true,
    save: 'simulator.save.json', bytes: simulatorSave.length, saveSha256: sha256(simulatorSave),
    inverseReadback: {faults: []}, unknownProperties: {}, modifiedGil: false,
  };
  const bind = () => {
    writeFileSync(candidatePath, JSON.stringify(candidate));
    writeFileSync(adapterPath, JSON.stringify(adapter));
    return finalActorAlphaBinding(inventory, candidatePath, adapterPath);
  };
  return {candidate, adapter, gilPath, bind, candidatePath, adapterPath};
}

test('binds the exact final hosted GIL, checkout configuration, and native readback', t => {
  const {candidate, adapter, bind, candidatePath, adapterPath} = fixture(t);
  assert.deepEqual(bind(), {
    candidateSha256: candidate.candidate.sha256, buildId: candidate.buildId, payloadDigest: candidate.payloadDigest,
    officialAssetsProfile: candidate.officialAssetsProfile, artConfigSha256: candidate.artFeatures.configSha256,
    uiConfigSha256: candidate.uiProfile.configSha256, candidateReceiptSha256: sha256(readFileSync(candidatePath)),
    nativeReadbackSha256: sha256(readFileSync(adapterPath)), simulatorSaveSha256: adapter.saveSha256,
  });
});

test('rejects stale checkout, early CD, and inconsistent checkout configuration', t => {
  const {candidate, bind} = fixture(t);
  const sourceCommit = candidate.sourceCommit;
  candidate.sourceCommit = '0'.repeat(40);
  assert.throws(bind, /clean frozen official GIL/);
  candidate.sourceCommit = sourceCommit;
  const release = candidate.release;
  delete candidate.release;
  assert.throws(bind, /clean frozen official GIL/);
  candidate.release = release;
  candidate.uiProfile = uiProfileReceipt(false);
  assert.throws(bind, /native page lifecycle/);
  candidate.uiProfile = uiProfileReceipt(true);
  candidate.artFeatures.configSha256 = '0'.repeat(64);
  assert.throws(bind, /Art feature receipt config digest mismatch/);
});

test('rejects a foreign or changed GIL, native projection, and simulator save', t => {
  const {candidate, adapter, gilPath, bind} = fixture(t);
  adapter.candidateSha256 = '0'.repeat(64);
  assert.throws(bind, /different final GIL/);
  adapter.candidateSha256 = candidate.candidate.sha256;
  const saveSha256 = adapter.saveSha256;
  adapter.saveSha256 = '0'.repeat(64);
  assert.throws(bind, /Simulator projection differs/);
  adapter.saveSha256 = saveSha256;
  adapter.luaSourceExact = false;
  assert.throws(bind, /different final GIL/);
  adapter.luaSourceExact = true;
  writeFileSync(gilPath, 'replacement');
  assert.throws(bind, /GIL bytes differ/);
});
