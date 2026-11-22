import assert from 'node:assert/strict';
import {hash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const archive = readFileSync(new URL('../fixtures/traveler-status-source.json.gz', import.meta.url));
assert.equal(hash('sha256', archive), '94e24cb97d3af9dafe79e15ecf05c1f9fefb917738d7b09fd1c6fd7d23e60c00');
const {base, successor, files} = JSON.parse(gunzipSync(archive));
assert.equal(base, '4ac434d02f0479d92d96da75367f4cab98809a17');
assert.equal(successor, 'd111244d322140bbd22d83857430e4283e32da9c');

function matches(source, binding) {
  if (typeof source !== 'string' || source.includes('\r\r\n')) return false;
  const text = source.replaceAll('\r\n', '\n');
  return hash('sha256', text) === binding.sha256 && hash('sha1', `blob ${Buffer.byteLength(text)}\0${text}`) === binding.gitBlob;
}

for (const [path, {before, after}] of Object.entries(files)) {
  assert(matches(before.source, before), 'exact Traveler status predecessor: ' + path);
  assert.notEqual(before.sha256, after.sha256, path);
  assert.match(after.sha256, /^[a-f0-9]{64}$/);
  assert.match(after.gitBlob, /^[a-f0-9]{40}$/);
}
export const travelerStatusSourcePaths = Object.freeze(Object.keys(files));

// Replay existing historical receipts using only the exact preceding Release bytes.
export function beforeTravelerStatusSource(path, source, read, currentOnly = false) {
  if (!Object.hasOwn(files, path)) return source;
  const {before, after} = files[path];
  if (!matches(source, after)) {
    assert(!currentOnly, 'fresh current production owner: ' + path);
    return source;
  }
  let live;
  try { live = read(path, 'utf8'); }
  catch { assert.fail('combined linked owner missing: ' + path); }
  assert(matches(live, after), 'combined linked owner identity: ' + path);
  return source.includes('\r\n') ? before.source.replaceAll('\n', '\r\n') : before.source;
}

export function travelerStatusPriorRead(read) {
  return (path, ...args) => {
    const value = read(path, ...args);
    if (!Object.hasOwn(files, path)) return value;
    if (typeof value === 'string') return beforeTravelerStatusSource(path, value, read);
    if (!Buffer.isBuffer(value)) return value;
    const source = value.toString('utf8');
    const prior = beforeTravelerStatusSource(path, source, read);
    return source === prior ? value : Buffer.from(prior);
  };
}
