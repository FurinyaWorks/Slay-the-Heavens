import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { exactSourceContinuation } from './exact-source-continuation.mjs';

const bytes = readFileSync(new URL('../fixtures/v2-ui-hud-source.json.gz', import.meta.url));
const digest = source => createHash('sha256').update(source).digest('hex');
assert.equal(digest(bytes), 'b32ad72e63f520598fd414e2b789dbfa7634be069656ec3f287d3d94ab9431c4', 'historical v2 UI owner identities');
const continuations = new Map(Object.entries(JSON.parse(gunzipSync(bytes))).map(([path, row]) => {
  assert.equal(row.path,path);
  assert.equal(digest(row.before.source),row.before.sha256);
  return [path,exactSourceContinuation(row)];
}));

export const v2UiHudSourcePaths = Object.freeze([...continuations.keys()]);

// The exact v2 run-menu receipt predates the explicit blob field.
function v2RunMenuBinding(path, binding) {
  if (path !== 'src/lua/abyss_game_ui_input.lua' || !binding || Object.hasOwn(binding,'gitBlob')
      || typeof binding.source !== 'string') return binding;
  const gitBlob = createHash('sha1').update(`blob ${Buffer.byteLength(binding.source)}\0`).update(binding.source).digest('hex');
  return {...binding,gitBlob};
}

export function projectV2UiHudSource(path, source, binding) {
  return continuations.get(path)?.project(path,source,v2RunMenuBinding(path,binding)) ?? source;
}

export function authorizeV2UiHudSource(path, source, binding, samples, read) {
  const linked = samples.map(([owner,input,expected]) => [owner,input,v2RunMenuBinding(owner,expected)]);
  for (const continuation of continuations.values()) {
    continuation.authorize(path,source,v2RunMenuBinding(path,binding),linked,read);
  }
}

export function beforeV2UiHudSource(path, source, read) {
  return continuations.get(path)?.predecessor(path,source,read) ?? source;
}
