import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-ui-admission-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'35ee0ce65814d11d071e7bae7c658f5935df1efb815f79f25329867348b422ae','historical UI admission source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) {
  if (row.before) assert.equal(sha256(row.before),row.beforeSha256);
  if (row.p1) assert.equal(sha256(row.p1.before),row.p1.beforeSha256);
  if (row.successor?.before) assert.equal(sha256(row.successor.before),row.successor.beforeSha256);
}

function project(path, source, rowFor) {
  if (!Object.hasOwn(archive,path) || typeof source!=='string' || source.includes('\r\r\n')) return source;
  const row=rowFor(archive[path]);
  if (!row || sha256(source.replaceAll('\r\n','\n'))!==row.sha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}

export function beforeV2UiEvidence(path, source) {
  return project(path,project(path,source,row=>row.p1),row=>row.successor);
}

export function beforeV2UiAdmission(path, source) {
  return project(path,source,row=>({sha256:row.afterSha256,before:row.before}));
}
