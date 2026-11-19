import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { exactSourceContinuation } from './exact-source-continuation.mjs';

const bytes = readFileSync(new URL('../fixtures/v2-ui-hud-source.json.gz', import.meta.url));
const digest = source => createHash('sha256').update(source).digest('hex');
assert.equal(digest(bytes), '649a52b20d2b9b2ad338a77b24daf29998014522e0dc0d5888bccce1529faa58', 'historical floor HUD owner identities');
const continuations = new Map(Object.entries(JSON.parse(gunzipSync(bytes))).map(([path, row]) => {
  assert.equal(row.path,path);
  assert.equal(digest(row.before.source),row.before.sha256);
  return [path,exactSourceContinuation(row)];
}));

export const v2UiHudSourcePaths = Object.freeze([...continuations.keys()]);

export function projectV2UiHudSource(path, source, binding) {
  return continuations.get(path)?.project(path,source,binding) ?? source;
}

export function authorizeV2UiHudSource(path, source, binding, samples, read) {
  for (const continuation of continuations.values()) continuation.authorize(path,source,binding,samples,read);
}

export function beforeV2UiHudSource(path, source, read) {
  return continuations.get(path)?.predecessor(path,source,read) ?? source;
}
