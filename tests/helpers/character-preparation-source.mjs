import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const normalize = text => text.replaceAll('\r\n', '\n');
const digest = value => createHash('sha256').update(value).digest('hex');
const archive = readFileSync(new URL('./character-preparation-source.json.gz', import.meta.url));
assert.equal(digest(archive), 'a3d61ed1e47036e5288cc4bc673388065ee0ace71497cba74da5b669a0a16790', 'complete character preparation source continuation');
const packet = JSON.parse(gunzipSync(archive));
assert.equal(packet.characterSourceCommit, '22cb2d47cdd3a1a06eef4b10afd69fc538398fdf');
for (const row of Object.values({...packet.production, ...packet.suite})) {
  assert.match(row.after, /^[a-f0-9]{64}$/);
  assert.equal(digest(row.before), row.beforeSha);
}
export const characterPreparationOwners = Object.freeze(Object.keys(packet.production));
const readRaw = path => readFileSync(path, 'utf8');

export function assertCharacterPreparationSources(read = readRaw) {
  for (const path of characterPreparationOwners) {
    const source = read(path);
    assert(typeof source === 'string' && !source.includes('\r\r\n') &&
      digest(normalize(source)) === packet.production[path].after, 'fresh character preparation source: '+path);
  }
}

// The old timing/production receipts continue to replay their exact source view.
// Unknown bytes are left visible and both current owners are checked on every projection.
export function beforeCharacterPreparationSource(path, source, read = readRaw) {
  if (!Object.hasOwn(packet.production, path) || typeof source !== 'string' || source.includes('\r\r\n')) return source;
  const row = packet.production[path];
  if (digest(normalize(source)) !== row.after) return source;
  assertCharacterPreparationSources(read);
  return row.before;
}

export function beforeCharacterPreparationCiSource(path, source) {
  if (!Object.hasOwn(packet.suite, path) || typeof source !== 'string' || source.includes('\r\r\n')) return source;
  const row = packet.suite[path];
  if (digest(normalize(source)) !== row.after) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}
