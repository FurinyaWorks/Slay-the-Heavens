// The independent develop branches had exact source receipts before Release backflow.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const archive = readFileSync(new URL('../fixtures/develop-release-backflow-predecessors.json.gz', import.meta.url));
assert.equal(createHash('sha256').update(archive).digest('hex'), '906aeb176f0f6040be01936b98380dbec946067b17e0f001fb8b7c86fc3e145a', 'exact develop source receipts');
const views = Object.freeze(JSON.parse(gunzipSync(archive)));

export function developReleaseBackflowRead(commit, path) {
  assert(Object.hasOwn(views, commit) && Object.hasOwn(views[commit], path), 'recorded source: ' + path);
  return views[commit][path];
}
