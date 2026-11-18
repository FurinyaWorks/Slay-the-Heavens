// Exact CI source views for the preserved potion preparation and actual Release.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const archive = 'tests/helpers/release-potion-enemy-source.json.gz';
const digest = '7d62e7b4441ee42925f7171bc8b43599ca9396c607fdf28f4a081c9dfd1fa94c';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const normalized = text => typeof text === 'string' && !text.includes('\r\r\n')
  ? text.replaceAll('\r\n', '\n')
  : null;
const bytes = readFileSync(new URL('./release-potion-enemy-source.json.gz', import.meta.url));

assert.equal(hash(bytes), digest, 'complete potion Release CI join');
const packet = JSON.parse(gunzipSync(bytes));
assert.equal(packet.schemaVersion, 1);
assert.deepEqual(packet.parents, {
  potion: 'f839a036b2bd27db469b27cdc9eb87a47e08a5ec',
  release: 'ead341112170308b5c80582ef016253af5944e81',
});

for (const [path, row] of Object.entries(packet.files)) {
  assert(!/^(?:src|data|config)\//.test(path), 'historical CI sources may not replace live production');
  assert.match(row.currentSha256, /^[a-f0-9]{64}$/);
  for (const [side, parent] of Object.entries(row.parents)) {
    assert(Object.hasOwn(packet.parents, side));
    assert.equal(normalized(parent.source), parent.source);
    assert.equal(hash(parent.source), parent.sha256);
    assert.equal(createHash('sha1')
      .update(`blob ${Buffer.byteLength(parent.source)}\0`)
      .update(parent.source)
      .digest('hex'), parent.gitBlob);
  }
}

export function releasePotionEnemySource(path, source, side) {
  const row = Object.hasOwn(packet.files, path) ? packet.files[path] : null;
  if (!row || !Object.hasOwn(row.parents, side)) return source;
  const text = normalized(source);
  if (text === null || hash(text) !== row.currentSha256) return source;

  const parent = row.parents[side].source;
  return source.includes('\r\n') ? parent.replaceAll('\n', '\r\n') : parent;
}

export function releasePotionEnemyRead(side, read = readFileSync) {
  assert(Object.hasOwn(packet.parents, side), 'known exact potion Release CI parent');
  return (path, encoding) => {
    const source = read(path, encoding);
    if (Buffer.isBuffer(source)) {
      const row = Object.hasOwn(packet.files, path) ? packet.files[path] : null;
      // Unbound binary archives remain byte-identical, without UTF-8 decoding.
      if (!row || !Object.hasOwn(row.parents, side)) return source;
    } else if (typeof source !== 'string') {
      return source;
    }
    const text = typeof source === 'string' ? source : source.toString('utf8');
    const parent = releasePotionEnemySource(path, text, side);
    return typeof source === 'string' ? parent : text === parent ? source : Buffer.from(parent);
  };
}

export function assertReleasePotionEnemyCurrent(read = readFileSync) {
  assert.equal(hash(read(archive)), digest, 'fresh complete potion Release CI archive');
  for (const [path, row] of Object.entries(packet.files)) {
    const text = normalized(read(path, 'utf8'));
    assert(text !== null && hash(text) === row.currentSha256,
      'fresh complete integration source: potion Release ' + path);
  }
}

export function releasePotionEnemyInventory(paths, inventory, kind, read = readFileSync, side = 'potion') {
  assert(Object.hasOwn(packet.inventoryExtra, side), 'known potion Release parent');
  assert(Object.hasOwn(packet.inventoryExtra[side], kind), 'known potion Release inventory');
  const extra = packet.inventoryExtra[side][kind];
  const current = [...new Set([...inventory, ...extra])].sort();
  const supplied = [...paths].sort();
  if (!extra.some(path => supplied.includes(path))) return [...paths];
  assert.deepEqual(supplied, current, 'complete potion Release raw ' + kind + ' inventory');
  for (const path of extra) {
    const text = normalized(read(path, 'utf8'));
    assert(text !== null && hash(text) === packet.files[path].currentSha256,
      'fresh potion Release added inventory source: ' + path);
  }
  return [...inventory];
}
