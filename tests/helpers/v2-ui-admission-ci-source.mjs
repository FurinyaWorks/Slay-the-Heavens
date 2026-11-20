import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-ui-admission-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'1f890261ce7ea3d2256f6c17b9ded8df8082b6d24d83f7492f32599c07c521ad','historical UI admission source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) {
  if (row.before) assert.equal(sha256(row.before),row.beforeSha256);
  if (row.successor?.before) assert.equal(sha256(row.successor.before),row.successor.beforeSha256);
}

const recoveryBytes = readFileSync(new URL('../fixtures/v2-ui-source-recovery.json.gz', import.meta.url));
assert.equal(sha256(recoveryBytes),'f2cf2fa19f205f66cfef861692b9d6574aab970682ba8ba9e2f501d70cf8b769','v2 UI recovery source identities');
const recovery = JSON.parse(gunzipSync(recoveryBytes));
assert.equal(recovery.base,'eaf4a4a50640697f4c497fe116db94c1ed69a10d');
for (const row of Object.values(recovery.files)) assert.equal(sha256(row.before),row.beforeSha256);

function project(source, row) {
  if (!row || typeof source!=='string' || source.includes('\r\r\n') ||
      sha256(source.replaceAll('\r\n','\n'))!==row.sha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}

export function beforeV2UiEvidence(path, source) {
  if (Object.hasOwn(recovery.files,path)) source = project(source,recovery.files[path]);
  return Object.hasOwn(archive,path) ? project(source,archive[path].successor) : source;
}

export function beforeV2UiAdmission(path, source) {
  if (!Object.hasOwn(archive,path)) return source;
  const row = archive[path];
  return project(source,{sha256:row.afterSha256,before:row.before});
}
