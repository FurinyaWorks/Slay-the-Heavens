import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-ui-admission-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'5973f99cac8981dff4bfc3ec95bbeb72d03a1ba3670d0caaa506d260168f86e1','historical UI admission source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) assert.equal(sha256(row.before),row.beforeSha256);

export function beforeV2UiAdmission(path, source) {
  if (!Object.hasOwn(archive,path) || typeof source!=='string' || source.includes('\r\r\n')) return source;
  const row=archive[path];
  if (sha256(source.replaceAll('\r\n','\n'))!==row.afterSha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}
