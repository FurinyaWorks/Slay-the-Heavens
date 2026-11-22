import assert from 'node:assert/strict';
import {hash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const archive = readFileSync(new URL('../fixtures/traveler-status-source.json.gz', import.meta.url));
assert.equal(hash('sha256', archive), '78ea0afbc225eb83cfd79d24cbed5c1af166e21c07f2adfec3588b488a0d0de2');
const {base, successor, files} = JSON.parse(gunzipSync(archive));
assert.equal(base, '43f0f359cd271cee6cfe8fc2b12d646b33617456');
assert.equal(successor, '5ec19f71fd7f03033482e9591e8505e068c4ebbb');

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
