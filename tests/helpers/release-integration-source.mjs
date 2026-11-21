// Exact predecessor bytes for historical tests. Live builds and runtime tests keep the integrated code.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const hash = (value, algorithm='sha256') => createHash(algorithm).update(value).digest('hex');
const blob = value => hash('blob ' + Buffer.byteLength(value) + '\0' + value, 'sha1');
const archive = readFileSync(new URL('../fixtures/release-integration-source.json.gz', import.meta.url));
assert.equal(hash(archive), '0bc178f6d91c587444aece1532ae47c1afd484b4ac22e2da788caeb6dc678bca', 'exact Release integration source archive');
const layers = JSON.parse(gunzipSync(archive));

for (const layer of Object.values(layers)) {
  for (const {before,after} of Object.values(layer)) {
    assert.equal(hash(before.source), before.sha256);
    assert.equal(blob(before.source), before.gitBlob);
    assert.match(after.sha256, /^[a-f0-9]{64}$/);
    assert.match(after.gitBlob, /^[a-f0-9]{40}$/);
  }
}

function project(layer, path, source) {
  if (!Object.hasOwn(layer,path) || typeof source !== 'string' || source.includes('\r\r\n')) return source;
  const text = source.replaceAll('\r\n','\n');
  const {before,after} = layer[path];
  if (hash(text) !== after.sha256 || blob(text) !== after.gitBlob) return source;
  return source.includes('\r\n') ? before.source.replaceAll('\n','\r\n') : before.source;
}

export function beforeReconciledReleaseSource(path,source) {
  return project(layers.integration,path,source);
}

export function beforeLateReleaseUiSource(path,source) {
  return project(layers.potion,path,project(layers.forge,path,beforeReconciledReleaseSource(path,source)));
}

export function beforeReleaseDetailSource(path,source) {
  return project(layers.detail,path,source);
}

export function beforeReleaseCapacitySource(path,source) {
  return project(layers.capacity,path,source);
}
