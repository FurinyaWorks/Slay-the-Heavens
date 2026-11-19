import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyCustody } from './check-custody.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const record = bytes => ({bytes:bytes.length,sha256:sha(bytes)});
const json = value => Buffer.from(JSON.stringify(value));
function fixture(mutFull=()=>{}, mutAudio=()=>{}) {
  const gil = Buffer.from('synthetic final bytes');
  const expectedSource = 'a'.repeat(40), expectedVersion='2.0.0';
  const profile = {schemaVersion:1,nativePageLifecycle:false};
  const features = {schemaVersion:2,flags:{cards:false,menuBackground:true,selectionAvatar:true,battlePortrait:true,monsters:false}};
  const full = {schemaVersion:1,statuses:{staticCheck:'pass'},sourceCommit:expectedSource,sourceDirty:false,
    buildId:'73d0a117-b904-4af9-8bad-621502152f01', inputs:[{path:'recorded.json',...record(Buffer.from('{}'))}],
    candidate:record(Buffer.from('synthetic full-stage bytes')),release:{version:expectedVersion,workKey:'default',notesSha256:'b'.repeat(64)},
    toolchainIdentity:{version:'test'},artFeatures:{...features,configSha256:sha(json(features))},uiProfile:{...profile,configSha256:sha(json(profile))},
    productionManifest:{modules:[{name:'abyss_ui',path:'abyss_ui.lua',...record(Buffer.from('script'))}],
      layout:{path:'game-ui.json',...record(Buffer.from('{}'))},templates:{path:'game-ui-templates.json',...record(Buffer.from('{}'))}},moduleDigests:{abyss_ui:sha(Buffer.from('script'))},liveWriteEnabled:false};
  full.payloadDigest=sha(JSON.stringify(full.inputs));
  const audio = {...structuredClone(full),candidate:record(gil),sha256:sha(gil),baseSha256:full.candidate.sha256,baseAfter:full.candidate.sha256,
    compiled:{written:[{id:17}]},checked:{ok:true,errors:0}};
  mutFull(full);
  const fullBytes=json(full);
  audio.sourceReceipt=record(fullBytes);
  mutAudio(audio);
  return {gil,expectedSource,expectedVersion,fullBytes,audioBytes:json(audio)};
}
test('accept production-shaped synthetic chain, including full-stage to audio input link',()=> {
  assert.equal(verifyCustody(fixture()).recordedInputs,1);
});
test('reject final GIL drift, wrong size and inconsistent top-level hash',()=> {
  const f=fixture(); f.gil[0]^=1;
  assert.throws(()=>verifyCustody(f),/final GIL SHA/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.candidate.bytes++)),/length/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.sha256='0'.repeat(64))),/top-level/);
});
test('reject altered full-stage receipt bytes including same length, or missing receipt',()=> {
  const f=fixture();f.fullBytes[0]^=1;
  assert.throws(()=>verifyCustody(f),/full-stage receipt SHA/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>delete a.sourceReceipt)),/full-stage receipt length/);
});
test('reject a rehashed receipt whose payload manifest, version, or stage hashes disagree',()=> {
  assert.throws(()=>verifyCustody(fixture(f=>f.inputs[0].bytes++)),/payload manifest/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.release.version='1.0.0')),/release mismatch/);
  const f=fixture();f.expectedVersion='1.0.0';assert.throws(()=>verifyCustody(f),/version or player changelog/);
  assert.throws(()=>verifyCustody(fixture(f=>f.candidate.sha256='0'.repeat(64))),/audio input/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.baseAfter='0'.repeat(64))),/audio input/);
});
test('reject dirty/wrong source, other build and tool/runtime receipt mismatches',()=> {
  assert.throws(()=>verifyCustody(fixture(f=>f.sourceDirty=true)),/source identity/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.sourceCommit='f'.repeat(40))),/source identity/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.buildId='different')),/buildId/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>delete a.toolchainIdentity)),/toolchainIdentity/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>delete a.uiProfile)),/uiProfile/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.liveWriteEnabled=true)),/live write/);
});
test('reject missing or failed static BGM graph and client receipts',()=> {
  assert.throws(()=>verifyCustody(fixture(undefined,a=>delete a.compiled)),/compile\/write/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.compiled.failed=1)),/compile\/write/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.compiled.written=[])),/compile\/write/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>delete a.checked)),/client check/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.checked.errors=1)),/client check/);
});

test('reject rehashed invalid input rows, profile drift and missing production modules',()=> {
  assert.throws(()=>verifyCustody(fixture((f)=>{f.inputs=[null];f.payloadDigest=sha(JSON.stringify(f.inputs))})),/payload manifest/);
  assert.throws(()=>verifyCustody(fixture(undefined,a=>a.officialAssetsProfile={id:'experiment'})),/officialAssetsProfile mismatch/);
  const f=fixture(); const full=JSON.parse(f.fullBytes);const audio=JSON.parse(f.audioBytes);
  full.productionManifest.modules=[];audio.productionManifest.modules=[];
  f.fullBytes=json(full);audio.sourceReceipt=record(f.fullBytes);f.audioBytes=json(audio);
  assert.throws(()=>verifyCustody(f),/production module/);
});

test('reject module ledger and recorded source digest disagreement',()=> {
  const f=fixture(); const full=JSON.parse(f.fullBytes);const audio=JSON.parse(f.audioBytes);
  full.productionManifest.modules[0].sha256='0'.repeat(64);audio.productionManifest=full.productionManifest;
  f.fullBytes=json(full);audio.sourceReceipt=record(f.fullBytes);f.audioBytes=json(audio);
  assert.throws(()=>verifyCustody(f),/production module/);
});
