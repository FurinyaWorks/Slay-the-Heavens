import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-ui-admission-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'fdcf83d5308ead77d7fb8ccccc318711bae748a8f18b7752cd4d92c71a072ab7','historical UI admission source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) {
  assert.equal(sha256(row.before),row.beforeSha256);
  if (row.successor?.before) assert.equal(sha256(row.successor.before),row.successor.beforeSha256);
}

function project(path, source, rowFor) {
  if (!Object.hasOwn(archive,path) || typeof source!=='string' || source.includes('\r\r\n')) return source;
  const row=rowFor(archive[path]);
  if (!row || sha256(source.replaceAll('\r\n','\n'))!==row.sha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}

export function beforeV2UiFlagEvidence(path, source) {
  return project(path,source,row=>row.successor);
}

export function beforeV2UiAdmission(path, source) {
  return project(path,source,row=>({sha256:row.afterSha256,before:row.before}));
}
