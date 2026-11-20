import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-ui-admission-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'f68bb9c5d353afd9b05cac08179d049dd42518680bb4469e4dcf202b58b39af4','historical UI admission source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) {
  if (row.before) assert.equal(sha256(row.before),row.beforeSha256);
  if (row.openingStatue) assert.equal(sha256(row.openingStatue.before),row.openingStatue.beforeSha256);
  if (row.successor?.before) assert.equal(sha256(row.successor.before),row.successor.beforeSha256);
}

const recoveryBytes = readFileSync(new URL('../fixtures/v2-ui-source-recovery.json.gz', import.meta.url));
assert.equal(sha256(recoveryBytes),'f2cf2fa19f205f66cfef861692b9d6574aab970682ba8ba9e2f501d70cf8b769','v2 UI recovery source identities');
const recovery = JSON.parse(gunzipSync(recoveryBytes));
assert.equal(recovery.base,'eaf4a4a50640697f4c497fe116db94c1ed69a10d');
for (const row of Object.values(recovery.files)) assert.equal(sha256(row.before),row.beforeSha256);

const potionNeutralBytes = readFileSync(new URL('../fixtures/potion-neutral-ci-source.json.gz', import.meta.url));
assert.equal(sha256(potionNeutralBytes),'5d426a0f966cb3bcff547e78d498cf41608e56cea0aa99530f28924cb72c0b66','potion neutral CI predecessor identity');
const potionNeutral = JSON.parse(gunzipSync(potionNeutralBytes));
for (const row of Object.values(potionNeutral)) {
  assert.equal(sha256(row.before),row.beforeSha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before)}\0`).update(row.before).digest('hex'),row.beforeGitBlob);
}

const potionPointerBytes = readFileSync(new URL('../fixtures/potion-pointer-ci-source.json.gz', import.meta.url));
assert.equal(sha256(potionPointerBytes),'922c811b2441673341f87b813d5acd3f17ac669bf59190926e4b9bd2c96d7c04','potion pointer CI predecessor identities');
const potionPointer = JSON.parse(gunzipSync(potionPointerBytes));
for (const row of Object.values(potionPointer)) {
  assert.equal(sha256(row.before),row.beforeSha256);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before)}\0`).update(row.before).digest('hex'),row.beforeGitBlob);
}

function project(source, row) {
  if (!row || typeof source!=='string' || source.includes('\r\r\n') ||
      sha256(source.replaceAll('\r\n','\n'))!==row.sha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}

export function beforeV2UiEvidence(path, source) {
  if (Object.hasOwn(potionNeutral,path)) source = project(source,{sha256:potionNeutral[path].afterSha256,before:potionNeutral[path].before});
  if (Object.hasOwn(potionPointer,path)) source = project(source,{sha256:potionPointer[path].afterSha256,before:potionPointer[path].before});
  if (Object.hasOwn(recovery.files,path)) source = project(source,recovery.files[path]);
  if (!Object.hasOwn(archive,path)) return source;
  const row = archive[path];
  return project(project(source,row.openingStatue),row.successor);
}

export function beforeV2UiAdmission(path, source) {
  if (!Object.hasOwn(archive,path)) return source;
  const row = archive[path];
  return project(source,{sha256:row.afterSha256,before:row.before});
}
