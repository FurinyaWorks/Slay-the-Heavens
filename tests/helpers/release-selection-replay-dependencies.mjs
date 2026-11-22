import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const hash = source => createHash('sha256').update(source).digest('hex');
const archive = readFileSync(new URL('../fixtures/release-selection-replay-dependencies.json.gz', import.meta.url));
assert.equal(hash(archive), '71de229c115e71f8e0e9fcda91cf739b3786bad030ca2f0ecfdd7539e1604682');
const { base, head, files } = JSON.parse(gunzipSync(archive));
assert.equal(base, 'e65d9b98fbec69442047650254238cd9244df805');
assert.equal(head, '5d34dc3327a0ad1a4597e9e4f8e246a694334106');

export function stageReleaseReplayDependencies(directory) {
  for (const [path, entry] of Object.entries(files)) {
    const current = readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
    assert.equal(hash(current), entry.currentSha256, 'fresh replay dependency: ' + path);
    assert.equal(hash(entry.source), entry.sha256, 'frozen replay dependency: ' + path);
    writeFileSync(join(directory, path), entry.source);
  }
}
