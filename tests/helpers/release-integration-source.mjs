// Exact predecessor bytes for historical tests. Live builds and runtime tests keep the integrated code.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const hash = (value, algorithm='sha256') => createHash(algorithm).update(value).digest('hex');
const blob = value => hash('blob ' + Buffer.byteLength(value) + '\0' + value, 'sha1');
const archive = readFileSync(new URL('../fixtures/release-integration-source.json.gz', import.meta.url));
assert.equal(hash(archive), '0ba3c551c50c35dfb4e27a0601063451693fba48d3ad9942dd34f6c2aec7d087', 'exact Release integration source archive');
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

export function assertCurrentReleaseOwner(path,source,read) {
  if (!Object.hasOwn(layers.currentOwners,path)) return false;
  const {after}=layers.currentOwners[path];
  const exact=value=>{
    if(typeof value!=='string'||value.includes('\r\r\n'))return false;
    const text=value.replaceAll('\r\n','\n');
    return hash(text)===after.sha256&&blob(text)===after.gitBlob;
  };
  assert(exact(source),'fresh current production owner: '+path);
  assert(exact(read(path)),'combined linked owner identity: '+path);
  return true;
}

export function assertReleaseCapacityCohort(read) {
  const sources=Object.keys(layers.capacity).map(path=>[path,read(path,'utf8')]);
  const current=(path,source)=>beforeReleaseCapacitySource(path,source)!==source;
  if(!sources.some(([path,source])=>current(path,source)))return;
  for(const [path,source] of sources)assert(current(path,source),'fresh complete integration source: '+path);
}
