import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { exactSourceContinuation } from './exact-source-continuation.mjs';

const bytes = readFileSync(new URL('../fixtures/v2-ui-hud-source.json.gz', import.meta.url));
const digest = source => createHash('sha256').update(source).digest('hex');
assert.equal(digest(bytes), '649a52b20d2b9b2ad338a77b24daf29998014522e0dc0d5888bccce1529faa58', 'historical floor HUD owner identities');
const nodeHudPath = 'src/lua/abyss_node_ui.lua';
const nodeHudSuccessor = Object.freeze({
  sha256: 'bf17830c24796ab66b94d562bd1903ee2fe98b76db384d92fe25a5008a1b99da',
  gitBlob: 'f87936a42adf5dd71621a36375763cd3d7711447',
});
const continuations = new Map(Object.entries(JSON.parse(gunzipSync(bytes))).map(([path, row]) => {
  assert.equal(row.path,path);
  assert.equal(digest(row.before.source),row.before.sha256);
  const original = exactSourceContinuation(row);
  const successor = path === nodeHudPath ? exactSourceContinuation({...row, after:nodeHudSuccessor}) : original;
  const select = source => path === nodeHudPath && typeof source === 'string'
    && digest(source.replaceAll('\r\n','\n')) === nodeHudSuccessor.sha256 ? successor : original;
  return [path,select];
}));

export const v2UiHudSourcePaths = Object.freeze([...continuations.keys()]);

export function projectV2UiHudSource(path, source, binding) {
  return continuations.get(path)?.(source).project(path,source,binding) ?? source;
}

export function authorizeV2UiHudSource(path, source, binding, samples, read) {
  for (const [owner, select] of continuations) {
    const input = owner === path ? source : samples.find(([file]) => file === owner)?.[1];
    select(input).authorize(path,source,binding,samples,read);
  }
}

export function beforeV2UiHudSource(path, source, read) {
  return continuations.get(path)?.(source).predecessor(path,source,read) ?? source;
}
