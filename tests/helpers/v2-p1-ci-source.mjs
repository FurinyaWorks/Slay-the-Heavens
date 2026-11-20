import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeV2UiEvidence as beforePriorEvidence} from './v2-ui-admission-ci-source.mjs';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const bytes = readFileSync(new URL('../fixtures/v2-p1-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'126bc5faaa880285c3e28b96fa3781ed6d188e9b5ee2889a5a41c0a7c2c30cd4','historical P1 evidence source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) assert.equal(sha256(row.before),row.beforeSha256);

export function beforeV2UiEvidence(path, source) {
  if (Object.hasOwn(archive,path) && typeof source === 'string' && !source.includes('\r\r\n')) {
    const row = archive[path];
    const digest = sha256(source.replaceAll('\r\n','\n'));
    if (digest === row.sha256 || row.mergedSha256?.includes(digest)) {
      source = source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
    }
  }
  return beforePriorEvidence(path,source);
}
