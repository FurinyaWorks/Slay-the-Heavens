import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const source = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const same = (a,b) => isDeepStrictEqual(a,b);
const validRecord = row => typeof row?.path === 'string' && row.path.length > 0
  && hash(row.sha256) && Number.isSafeInteger(row.bytes) && row.bytes >= 0;
function verifyRecord(record, bytes, label) {
  assert(record?.bytes === bytes.byteLength, label+' length mismatch');
  assert(hash(record.sha256) && record.sha256 === sha(bytes), label+' SHA-256 mismatch');
}

export function verifyCustody({gil, audioBytes, fullBytes, expectedSource, expectedVersion}) {
  assert(source(expectedSource), 'explicit source SHA required');
  assert(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(expectedVersion), 'explicit version required');
  const audio = JSON.parse(audioBytes.toString('utf8'));
  verifyRecord(audio.candidate, gil, 'final GIL');
  assert(audio.sha256 === audio.candidate.sha256, 'final top-level SHA-256 mismatch');
  verifyRecord(audio.sourceReceipt, fullBytes, 'full-stage receipt');
  const full = JSON.parse(fullBytes.toString('utf8'));
  assert(full.schemaVersion === 1 && full.statuses?.staticCheck === 'pass', 'full static check missing');
  assert(full.sourceCommit === expectedSource && audio.sourceCommit === expectedSource
    && full.sourceDirty === false && audio.sourceDirty === false, 'source identity mismatch');
  assert(typeof full.buildId === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(full.buildId)
    && full.buildId === audio.buildId, 'buildId mismatch');
  assert(Array.isArray(full.inputs) && full.inputs.length > 0 && hash(full.payloadDigest)
    && full.inputs.every(validRecord) && full.payloadDigest === sha(JSON.stringify(full.inputs)) && full.payloadDigest === audio.payloadDigest,
    'payload manifest digest mismatch');
  assert(hash(full.candidate?.sha256) && full.candidate.sha256 === audio.baseSha256
    && audio.baseAfter === audio.baseSha256, 'audio input GIL SHA-256 mismatch');
  const {compiled, checked} = audio;
  assert(compiled?.written?.length === 1 && !compiled.failed && !compiled.error && !compiled.errors?.length,
    'audio graph compile/write receipt failed or missing');
  assert(checked?.ok === true && !checked.errors, 'audio client check receipt failed or missing');
  assert(full.liveWriteEnabled === false && audio.liveWriteEnabled === false, 'live write marked enabled or unknown');
  for (const key of ['release','toolchainIdentity','artFeatures','uiProfile','productionManifest','moduleDigests']) {
    assert(full[key] && same(full[key],audio[key]), key+' mismatch or missing');
  }
  for (const key of ['officialAssetsProfile','officialPortraits','officialBackground','readyCardArt','nativeCardArt','nativeMonsterArt','monsterActors'])
    assert(same(full[key],audio[key]), key+' mismatch');
  const {modules,layout,templates} = full.productionManifest;
  const moduleNames = Array.isArray(modules) ? modules.map(row=>row?.name) : [];
  assert(moduleNames.length > 0 && new Set(moduleNames).size === moduleNames.length
    && modules.every(row=>typeof row.name === 'string' && validRecord(row) && row.sha256 === full.moduleDigests[row.name])
    && same([...moduleNames].sort(),Object.keys(full.moduleDigests).sort())
    && Object.values(full.moduleDigests).every(hash) && validRecord(layout) && validRecord(templates),
    'production module/layout records invalid or incomplete');
  assert(full.release.version === expectedVersion && hash(full.release.notesSha256), 'version or player changelog identity mismatch');
  return {sourceCommit:expectedSource, version:expectedVersion, buildId:full.buildId,
    finalGilSha256:audio.sha256, audioReceiptSha256:sha(audioBytes),
    fullReceiptSha256:audio.sourceReceipt.sha256, fullStageGilSha256:audio.baseSha256,
    payloadDigest:full.payloadDigest, recordedInputs:full.inputs.length,
    scope:'receipt chain only; no GIL decoding, repository rehash, or official verification'};
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const [gilPath,audioPath,fullPath,expectedSource,expectedVersion,...extra] = process.argv.slice(2);
  assert(gilPath && audioPath && fullPath && expectedSource && expectedVersion && extra.length===0,
    'Usage: node check-custody.mjs <final.gil> <audio/candidate.json> <full/candidate.json> <expected-source-SHA> <expected-version>');
  const read = path => readFileSync(path);
  console.log(JSON.stringify(verifyCustody({gil:read(gilPath),audioBytes:read(audioPath),
    fullBytes:read(fullPath),expectedSource,expectedVersion}),null,2));
}
