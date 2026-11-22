// Older replay targets use the exact layout, theme and controller they shipped with.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const normalize = source => source.replaceAll('\r\n', '\n');
const archive = readFileSync(new URL('../fixtures/relic-detail-source.json.gz', import.meta.url));
assert.equal(hash(archive), '981b97459ad1d75b79d03e197534dbab883d1f79055c7e2776d9ec32f09a9327');
const { base, files } = JSON.parse(gunzipSync(archive));
assert.equal(base, '469e80240c5b7c60f75ff434bebac62d73c0bd0c');
for (const row of Object.values(files)) assert.equal(hash(row.before), row.beforeSha);

export const relicDetailOwns = path => Object.hasOwn(files, path);

function matches(path, source) {
  return relicDetailOwns(path) && typeof source === 'string' && !source.includes('\r\r\n')
    && hash(normalize(source)) === files[path].afterSha;
}

export function beforeRelicDetail(path, source) {
  if (!matches(path, source)) return source;
  const prior = files[path].before;
  return source.includes('\r\n') ? prior.replaceAll('\n', '\r\n') : prior;
}

export function authenticateRelicDetail(path, source, read) {
  const prior = beforeRelicDetail(path, source);
  if (prior !== source) {
    assert(matches(path, read(path)), 'combined linked owner identity: ' + path + ' changed during relic detail validation');
  }
  return prior;
}
