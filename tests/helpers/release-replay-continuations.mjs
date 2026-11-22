import assert from 'node:assert/strict';
import {hash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeMapRoomSource} from './release-map-deck-source.mjs';

const archive = readFileSync(new URL('../fixtures/release-replay-continuations.json.gz', import.meta.url));
assert.equal(hash('sha256', archive), 'a2abaa3feb21f2f1a2e8f9c9fef3da2af3525073110eebaa394d82b71a095b95', 'exact Release replay continuation archive');
const {battleQuality, eventArt} = JSON.parse(gunzipSync(archive));
assert.equal(battleQuality.base, '9a4fa39c5d8d2f928b399eb5680030249a9ca40c');
assert.equal(battleQuality.successor, '43f0f359cd271cee6cfe8fc2b12d646b33617456');
assert.equal(eventArt.base, '25d389968670c0812f8b9565157cf32642fb58e2');
assert.equal(eventArt.successor, 'a67385f3158b6bae26e74ecc5aa155b20bfa3f33');

function normalize(source) {
  if (typeof source !== 'string') return null;
  if (!source.includes('\r')) return source;
  const rest = source.replaceAll('\r\n', '');
  return /[\r\n]/.test(rest) ? null : source.replaceAll('\r\n', '\n');
}

// Only pure source identities are memoized. Fresh reads and cohort checks
// still run on every call.
const identities = new Map();
function matches(text, binding) {
  if (text === null) return false;
  let identity = identities.get(text);
  if (!identity) {
    identity = {sha256: hash('sha256', text), gitBlob: hash('sha1', `blob ${Buffer.byteLength(text)}\0${text}`)};
    if (text.length <= 64 * 1024) {
      if (identities.size === 32) identities.delete(identities.keys().next().value);
      identities.set(text, identity);
    }
  }
  return identity.sha256 === binding.sha256 && identity.gitBlob === binding.gitBlob;
}

function readOwner(read, path) {
  try { return normalize(read(path, 'utf8')); }
  catch { assert.fail('combined linked owner missing: ' + path); }
}

function replaceFragments(path, text, fragments, from, to) {
  for (const fragment of fragments) {
    const offset = text.indexOf(fragment[from]);
    assert(fragment[from].length && offset >= 0 && offset === text.lastIndexOf(fragment[from]),
      'unique Release replay fragment: ' + path);
    text = text.replace(fragment[from], () => fragment[to]);
  }
  return text;
}

const checkedTransitions = new WeakMap();
function predecessor(path, source, text, row) {
  let checked = checkedTransitions.get(row);
  if (checked?.text !== text) {
    const prior = replaceFragments(path, text, row.fragments.toReversed(), 1, 0);
    assert(matches(prior, row.before), 'exact Release replay predecessor: ' + path);
    assert.equal(replaceFragments(path, prior, row.fragments, 0, 1), text, 'exact Release replay successor: ' + path);
    checked = {text, prior};
    checkedTransitions.set(row, checked);
  }
  return source.includes('\r\n') ? checked.prior.replaceAll('\n', '\r\n') : checked.prior;
}

export function beforeEventArtSource(path, source, read) {
  if (!Object.hasOwn(eventArt.files, path)) return source;
  const text = normalize(source), row = eventArt.files[path];
  if (!matches(text, row.after)) return source;
  for (const [owner, {after}] of Object.entries(eventArt.files)) {
    assert(matches(readOwner(read, owner), after), 'combined linked owner identity: ' + owner + ' during event art validation');
  }
  return predecessor(path, source, text, row);
}

export function eventArtPriorRead(read) {
  return (path, encoding) => {
    const raw = read(path, encoding);
    if (!Object.hasOwn(eventArt.files, path)) return raw;
    if (typeof raw === 'string') return beforeEventArtSource(path, raw, read);
    if (!Buffer.isBuffer(raw)) return raw;
    const source = raw.toString('utf8'), prior = beforeEventArtSource(path, source, read);
    return source === prior ? raw : Buffer.from(prior);
  };
}

export function beforeBattleUiQualitySource(path, source, travelerInput, read) {
  if (!Object.hasOwn(battleQuality.files, path)) return source;
  const text = normalize(source), row = battleQuality.files[path];
  if (!matches(text, row.after)) return source;
  const input = normalize(travelerInput);
  assert(input !== null && readOwner(read, path) === input,
    'combined linked owner identity: ' + path + ' during battle UI quality validation');
  return predecessor(path, source, text, row);
}

const deckArchive = readFileSync(new URL('../fixtures/release-deck-lineage-source.json.gz', import.meta.url));
assert.equal(hash('sha256', deckArchive), 'a32c93925e562ee1c617bd647e18f131a0c066659eb653ba67afe3beb75454d0', 'exact Release historical deck archive');
const {path: deckPath, layers: deckLayers} = JSON.parse(gunzipSync(deckArchive));
assert.equal(deckPath, 'src/lua/abyss_deck_ui.lua');
assert.deepEqual(deckLayers.map(({base, successor}) => [base, successor]), [
  ['2bcd0fbd35f7e0462ef4a473fd64e7287b8a30d1', 'd26c4dc59e639741471580a242718a284a67f758'],
  ['7381cf7152ba7a726506f9a5b525e13cfbd2c87a', '56a8cb56730fb08824734135aac80176067b6d9c'],
]);
assert.deepEqual(deckLayers[0].before, deckLayers[1].after, 'exact deck lineage between #794 parent and #790');

export function beforeHistoricalDeckSource(path, source, recordingInput, read, {stopAtForge = false} = {}) {
  if (path !== deckPath) return source;
  const text = normalize(source);
  const index = deckLayers.findIndex(row => matches(text, row.after));
  if (index === -1) return source;
  const input = normalize(recordingInput);
  assert(input !== null && readOwner(read, path) === input,
    'combined linked owner identity: ' + path + ' during historical deck validation');

  for (const row of deckLayers.slice(index, stopAtForge ? 1 : deckLayers.length)) {
    source = predecessor(path, source, normalize(source), row);
  }
  return source;
}

const finalArchive = readFileSync(new URL('../fixtures/release-replay-final-source.json.gz', import.meta.url));
assert.equal(hash('sha256', finalArchive), '2b3737cb405ce06c42d6dfe5f099a234f452f4b174f97dc481d0e149cb1b23fd', 'exact final Release replay archive');
const {detail, potion, shop, nodeQuality, forge, eventInventory, relicInventory, ci} = JSON.parse(gunzipSync(finalArchive));
for (const [stage, base, successor] of [
  [detail, '2bcd0fbd35f7e0462ef4a473fd64e7287b8a30d1', 'd26c4dc59e639741471580a242718a284a67f758'],
  [potion, '5991585aabde667eef9852b8c340c194c42a5c62', '2bcd0fbd35f7e0462ef4a473fd64e7287b8a30d1'],
  [shop, 'b652ab25f83161f4a806c89d90c5eceea9198717', '74d17e5d06ff7954d12deb49cf33762e74ef3293'],
  [nodeQuality, '9a4fa39c5d8d2f928b399eb5680030249a9ca40c', '43f0f359cd271cee6cfe8fc2b12d646b33617456'],
  [eventInventory, eventArt.base, eventArt.successor],
  [relicInventory, '068e1acbc6f98b591f84bf5cdb35a7620bb4cf17', 'ca09aca54b8db956f114607ac0daf89a764b0d14'],
  [forge, '82cd198314581accdd6729316a7ae24e795ebb07', '8af3866714f12abe8d1322f0c2e3cffc623a808b'],
]) {
  assert.equal(stage.base, base);
  assert.equal(stage.successor, successor);
}
for (const [path, row] of Object.entries(nodeQuality.files)) {
  assert.deepEqual(shop.files[path].before, row.after, 'exact shop to node quality predecessor: ' + path);
}

function matchedRow(stage, path, source) {
  if (!Object.hasOwn(stage.files, path)) return undefined;
  const row = stage.files[path];
  return matches(normalize(source), row.after) ? row : undefined;
}

export function beforeShopProductionSource(path, source, read) {
  if (!Object.hasOwn(shop.files, path)) return source;
  const input = source;
  const shopRow = matchedRow(shop, path, source);
  if (shopRow) {
    for (const [owner, {after}] of Object.entries(shop.files)) {
      assert(matches(readOwner(read, owner), after), 'combined linked owner identity: ' + owner + ' during shop validation');
    }
    source = predecessor(path, source, normalize(source), shopRow);
  }
  const qualityRow = matchedRow(nodeQuality, path, source);
  if (qualityRow) source = predecessor(path, source, normalize(source), qualityRow);
  source = beforeMapRoomSource(path, source);
  const forgeRow = matchedRow(forge, path, source);
  if (forgeRow) source = predecessor(path, source, normalize(source), forgeRow);
  if (!shopRow && (qualityRow || forgeRow)) {
    assert(readOwner(read, path) === normalize(input),
      'combined linked owner identity: ' + path + ' during shop predecessor validation');
  }
  return source;
}

export function beforeReleaseUiCompanionSource(path, source, input, read) {
  const row = matchedRow(detail, path, source) ?? matchedRow(potion, path, source);
  if (!row) return source;
  const text = normalize(input);
  assert(text !== null && readOwner(read, path) === text,
    'combined linked owner identity: ' + path + ' during Release UI companion validation');
  return predecessor(path, source, normalize(source), row);
}

export function beforeIllustrationTestSource(path, source) {
  for (const stage of [eventInventory, relicInventory]) {
    const row = matchedRow(stage, path, source);
    if (row) source = predecessor(path, source, normalize(source), row);
  }
  return source;
}

export function beforeReleaseReplayCiSource(path, source, stage) {
  if (!Object.hasOwn(ci[stage], path)) return source;
  for (const row of ci[stage][path]) {
    if (matches(normalize(source), row.after)) source = predecessor(path, source, normalize(source), row);
  }
  return source;
}
