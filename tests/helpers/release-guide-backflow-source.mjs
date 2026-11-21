import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash = (bytes, algorithm = 'sha256') => createHash(algorithm).update(bytes).digest('hex');
const archive = readFileSync(new URL('../fixtures/release-guide-backflow-source.json.gz', import.meta.url));
assert.equal(hash(archive), '7fe4f04ac99a35a19b6faee1b1678204b38476776729cb679886973eeff53d56');
const {files} = JSON.parse(gunzipSync(archive));

function matches(source, binding) {
  if (typeof source !== 'string' || source.includes('\r\r\n')) return false;
  const normalized = source.replaceAll('\r\n', '\n');
  return hash(normalized) === binding.sha256 &&
    hash(`blob ${Buffer.byteLength(normalized)}\0${normalized}`, 'sha1') === binding.gitBlob;
}

for (const {before} of Object.values(files)) assert(matches(before.source, before));
export const releaseGuideSourcePaths = Object.freeze(Object.keys(files));

export function beforeReleaseGuideSource(path, source) {
  if (!Object.hasOwn(files, path) || !matches(source, files[path].after)) return source;
  const {before} = files[path];
  return source.includes('\r\n') ? before.source.replaceAll('\n', '\r\n') : before.source;
}

export function authorizeReleaseGuideSources(read) {
  for (const path of releaseGuideSourcePaths) {
    assert(matches(read(path), files[path].after), 'combined linked owner identity: ' + path);
  }
}

export function beforeAuthenticatedReleaseGuideSource(path, source, read) {
  const prior = beforeReleaseGuideSource(path, source);
  if (prior !== source) authorizeReleaseGuideSources(read);
  return prior;
}
