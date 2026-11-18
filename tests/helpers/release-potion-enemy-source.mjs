// Exact CI source views for the preserved potion preparation and actual Release.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const archive = 'tests/helpers/release-potion-enemy-source.json.gz';
const digest = '098a7668d6ce0070d6e8644707fd0d303b324b1f187f9f29743d97b9e713bee4';
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

// Advance the actual Release CI view without rewriting any potion or enemy receipt.
const handArchive = 'tests/helpers/release-hand-layout-ci.json.gz';
const handDigest = '6f26884c238ab815532f8480d710d4e069ccb60ff84ca0e79afa00b38a758beb';
const handBytes = readFileSync(new URL('./release-hand-layout-ci.json.gz', import.meta.url));
assert.equal(hash(handBytes), handDigest, 'fixed hand-layout CI continuation');
const handCi = JSON.parse(gunzipSync(handBytes));
assert.equal(handCi.base, 'b63719b117e83676e20787e752d14bc66b63a6ed');
for (const row of Object.values(handCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

function priorCiSource(files, path, source) {
  const row = Object.hasOwn(files, path) ? files[path] : null;
  const text = normalized(source);
  if (!row?.before || text === null || hash(text) !== row.afterSha256) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n', '\r\n') : row.before;
}

export function beforeHandLayoutCiSource(path, source) {
  return priorCiSource(handCi.files, path, beforeEnemyMetricsCiSource(path, source));
}

export function assertHandLayoutCiCurrent(read = readFileSync) {
  assert.equal(hash(read(handArchive)), handDigest, 'fresh hand-layout CI continuation');
  assert.equal(hash(read('tests/helpers/mobile-hand-source.json.gz')),
    handCi.productionArchive, 'fresh immutable hand-layout production archive');
  for (const [path, row] of Object.entries(handCi.files)) {
    const source = normalized(beforeEnemyMetricsCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: hand-layout ' + path);
  }
}

// Bind the live shelf layout and expose its exact historical fixture only in CI tests.
const shelfArchive = 'tests/helpers/release-shop-shelf-ci.json.gz';
const shelfDigest = '1e0b58d30d74b643197557cb63e50119bc93d2641997efc1a58f496b6f358ec8';
const shelfBytes = readFileSync(new URL('./release-shop-shelf-ci.json.gz', import.meta.url));
assert.equal(hash(shelfBytes), shelfDigest, 'fixed shop shelf CI continuation');
const shelfCi = JSON.parse(gunzipSync(shelfBytes));
assert.equal(shelfCi.base, 'b63719b117e83676e20787e752d14bc66b63a6ed');
for (const row of Object.values(shelfCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

export function beforeShopShelfCiSource(path, source) {
  return priorCiSource(shelfCi.files, path, source);
}

export function assertShopShelfCiCurrent(read = readFileSync) {
  assert.equal(hash(read(shelfArchive)), shelfDigest, 'fresh shop shelf CI continuation');
  for (const [path, row] of Object.entries(shelfCi.files)) {
    const source = normalized(read(path, 'utf8'));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: shop shelf ' + path);
  }
}

// Preserve the original Release fixtures while authorizing this exact next #688 slice.
const enemyArchive = 'tests/helpers/release-enemy-metrics-ci.json.gz';
const enemyDigest = 'eb317490fcec41483ef7c1e666a7a344bc924733043c48a8990da4ddde179810';
const enemyBytes = readFileSync(new URL('./release-enemy-metrics-ci.json.gz', import.meta.url));
assert.equal(hash(enemyBytes), enemyDigest, 'fixed enemy metrics CI continuation');
const enemyCi = JSON.parse(gunzipSync(enemyBytes));
assert.equal(enemyCi.base, '6aaed54a56c3d2769a71feea3580798ae421a0e8');
for (const row of Object.values(enemyCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

export function beforeEnemyMetricsCiSource(path, source) {
  return priorCiSource(enemyCi.files, path, source);
}

export function assertEnemyMetricsCiCurrent(read = readFileSync) {
  assert.equal(hash(read(enemyArchive)), enemyDigest, 'fresh enemy metrics CI continuation');
  assert.equal(hash(read('tests/helpers/enemy-geometry-source.json.gz')), enemyCi.productionArchive,
    'fresh immutable enemy metrics production archive');
  for (const [path, row] of Object.entries(enemyCi.files)) {
    const source = normalized(read(path, 'utf8'));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: enemy metrics ' + path);
  }
}

export function releasePotionEnemySource(path, source, side) {
  if (!Object.hasOwn(packet.parents, side)) return source;
  source = beforeHandLayoutCiSource(path, beforeShopShelfCiSource(path, source));
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
      const handRow = Object.hasOwn(handCi.files, path) ? handCi.files[path] : null;
      const shelfRow = Object.hasOwn(shelfCi.files, path) ? shelfCi.files[path] : null;
      const enemyRow = Object.hasOwn(enemyCi.files, path) ? enemyCi.files[path] : null;
      if (!handRow?.before && !shelfRow?.before && !enemyRow?.before && (!row || !Object.hasOwn(row.parents, side))) return source;
    } else if (typeof source !== 'string') {
      return source;
    }
    const text = typeof source === 'string' ? source : source.toString('utf8');
    const parent = releasePotionEnemySource(path, text, side);
    return typeof source === 'string' ? parent : text === parent ? source : Buffer.from(parent);
  };
}

export function assertReleasePotionEnemyCurrent(read = readFileSync) {
  assertEnemyMetricsCiCurrent(read);
  assertHandLayoutCiCurrent(read);
  assertShopShelfCiCurrent(read);
  assert.equal(hash(read(archive)), digest, 'fresh complete potion Release CI archive');
  for (const [path, row] of Object.entries(packet.files)) {
    const text = normalized(beforeHandLayoutCiSource(path, beforeShopShelfCiSource(path, read(path, 'utf8'))));
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
    const text = normalized(beforeHandLayoutCiSource(path, beforeShopShelfCiSource(path, read(path, 'utf8'))));
    assert(text !== null && hash(text) === packet.files[path].currentSha256,
      'fresh potion Release added inventory source: ' + path);
  }
  return [...inventory];
}
