import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { exactSourceContinuation } from './exact-source-continuation.mjs';

const bytes = readFileSync(new URL('../fixtures/v2-ui-hud-source.json.gz', import.meta.url));
const digest = source => createHash('sha256').update(source).digest('hex');
assert.equal(digest(bytes), '07fad808963c81ef4bbc0b02748c35ba14308701a5d6869df57df294ad3eaf46', 'historical v2 UI owner identities');
const continuations = new Map(Object.entries(JSON.parse(gunzipSync(bytes))).map(([path, row]) => {
  assert.equal(row.path,path);
  assert.equal(digest(row.before.source),row.before.sha256);
  const original = exactSourceContinuation(row);
  const successor = row.successor && exactSourceContinuation({...row, after:row.successor});
  return [path, {original, successor, successorSha:row.successor?.sha256}];
}));

export const v2UiHudSourcePaths = Object.freeze([...continuations.keys()]);

function forSource(entry, source) {
  if (entry?.successor && typeof source === 'string' &&
      digest(source.replaceAll('\r\n','\n')) === entry.successorSha) return entry.successor;
  return entry?.original;
}

// The exact v2 run-menu receipt predates the explicit blob field.
function v2RunMenuBinding(path, binding) {
  if (path !== 'src/lua/abyss_game_ui_input.lua' || !binding || Object.hasOwn(binding,'gitBlob')
      || typeof binding.source !== 'string') return binding;
  const gitBlob = createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex');
  return {...binding,gitBlob};
}

export function projectV2UiHudSource(path, source, binding) {
  return forSource(continuations.get(path),source)?.project(path,source,v2RunMenuBinding(path,binding)) ?? source;
}

export function authorizeV2UiHudSource(path, source, binding, samples, read) {
  const linked = samples.map(([owner,input,expected]) => [owner,input,v2RunMenuBinding(owner,expected)]);
  for (const [owner,entry] of continuations) {
    const input = owner === path ? source : linked.find(sample => sample[0] === owner)?.[1];
    forSource(entry,input).authorize(path,source,v2RunMenuBinding(path,binding),linked,read);
  }
}

export function beforeV2UiHudSource(path, source, read) {
  return forSource(continuations.get(path),source)?.predecessor(path,source,read) ?? source;
}
