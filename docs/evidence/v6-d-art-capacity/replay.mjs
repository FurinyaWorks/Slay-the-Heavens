import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const load = file => import(pathToFileURL(resolve(root, file)));
const json = file => JSON.parse(readFileSync(join(root, file), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const shaFile = path => sha256(readFileSync(path));
const fromRoot = path => relative(root, path).replaceAll('\\', '/');
const normalizePaths = (_, value) => typeof value === 'string' && value.startsWith(`${root}/`) ? fromRoot(value) : value;
const out = process.argv[2];
assert.match(out ?? '', /^build\/v6-d-[a-z0-9-]+$/);

const [data, ui, native, platform, ready, converted, release, art, audio] = await Promise.all([
  load('scripts/build-lua-data.mjs'), load('scripts/build-ui.mjs'), load('scripts/build-native-candidate.mjs'),
  load('scripts/platform-load.mjs'), load('scripts/art/ready-card-registry.mjs'),
  load('scripts/art/converted-card-data.mjs'), load('scripts/release-notes.mjs'),
  load('scripts/card-art-samples.mjs'), load('scripts/build-native-audio-game.mjs'),
]);
const identity = release.gitSourceIdentity();
assert.equal(identity.sourceDirty, false, 'Use a clean source worktree');
const base = 'art/cards/traveler-geo';
const catalog = json(`${base}/catalog.json`);
const registry = ready.buildReadyCardRegistry({ root });
const rectanglePack = converted.loadConvertedCardPack(root).cards;
const sourceReview = new Map(json(`${base}/source-design-review.json`).records.map(row => [row.cardId, row]));
const references = json('data/reference/warrior75.json').cards.map(card => card.id);
const current = json('data/cards.json').cards.filter(card => !['status', 'curse'].includes(card.type));
const names = json('data/presentation/traveler.zh-CN.json').cards;
assert.equal(references.length, 75);
assert.deepEqual(new Set(current.map(card => card.id)), new Set(references));
assert.deepEqual(new Set([...Object.keys(catalog.cards), ...Object.keys(catalog.candidates)]), new Set(references));
const b0Options = audio.nativeAudioBuildArgs(['unused.gil', '--release-candidate', '--work-key=d-capacity-baseline']).options;
assert.equal(b0Options.artFeatures.cards, false);
const matrix = references.map(cardId => {
  const manifest = catalog.cards[cardId] ?? catalog.candidates[cardId];
  const asset = json(`${base}/${manifest}`);
  assert.equal(asset.card_id, cardId);
  const { path, bytes, sha256: sourceSha256 } = asset.files['source.png'];
  const source = readFileSync(join(root, base, path));
  assert.equal(source.length, bytes, path);
  assert.equal(sha256(source), sourceSha256, path);
  assert.equal(source.toString('hex', 0, 8), '89504e470d0a1a0a', path);
  const redraw = registry.assets[cardId];
  const historical = rectanglePack[cardId];
  assert.notEqual(Boolean(redraw), Boolean(historical));
  if (historical) {
    const review = sourceReview.get(cardId);
    assert.equal(review?.verdict, 'PASS', cardId);
    assert.equal(review.sourceSha256, sourceSha256, cardId);
    assert.equal(review.previewSha256, historical.sourcePreviewSha256, cardId);
  }
  return {
    cardId, name: names[cardId].name, manifest: `${base}/${manifest}`, sourceSha256,
    sourceReview: redraw ? 'owner-reviewed-offline-visual' : 'independent-source-design-only',
    nativeRedraw: redraw ? { images: redraw.slots.length, luaSha256: redraw.luaSha256, jsonSha256: redraw.jsonSha256 } : null,
    historicalConversion: historical ? { rectangles: historical.rectangleCount, std: historical.std,
      mae: historical.mae, maxError: historical.maxError, previewSha256: historical.sourcePreviewSha256 } : null,
    production: 'disabled', officialAndDevice: 'UNVERIFIED',
  };
});
assert.equal(new Set(matrix.map(row => row.sourceSha256)).size, 75);
assert.equal(new Set(Object.values(rectanglePack).map(row => sha256(row.rectangles))).size, 72);

mkdirSync(out);
const baseline = join(out, 'B0-profile');
mkdirSync(baseline);
const builtData = join(baseline, 'abyss_data.lua');
data.buildLuaData('data', builtData);
const mappedLua = new Map();
function inventory(directory, options) {
  ui.buildUI(directory, undefined, options);
  const record = platform.packageInventory(directory);
  const { modules, ...counts } = record;
  mappedLua.set(directory, modules);
  return {
    options, ...counts, mappedModules: modules.length, mappedManifestSha256: sha256(JSON.stringify(modules)),
    layoutSha256: shaFile(join(directory, 'game-ui.json')),
    templatesSha256: shaFile(join(directory, 'game-ui-templates.json')),
    ...(options.nativeCardArt ? { nativeCardArt: art.nativeCardArtBuildReceipt(
      art.prepareNativeCardArt(options.nativeCardArt, { root }), { root, directory }) } : {}),
  };
}
const b0 = inventory(baseline, b0Options);
const { artFeatures, refinedReleaseMonsterArt } = b0Options;
const b0Inputs = native.sourceInputs(root, { artFeatures, refinedReleaseMonsterArt });
const b0Summary = { ...b0, sourcePayloadDigestWithoutEncoder: native.payloadDigest(b0Inputs),
  bgmSource: { sha256: shaFile('data/presentation/native_bgm.json'), status: 'not-packaged' } };
assert.equal(b0.artPools, 0);
const ids = Object.keys(registry.assets);
const cases = [['a-control', [], 0], ...ids.map(id => [`a1-${id}`, [id], 1]), ['a2-three-ids', ids, 1], ['a2-three-pools', ids, 3], ['historical-75-ready', [], 0]];
const experiments = cases.map(([label, cardIds, hostCount]) => {
  const directory = join(out, label);
  mkdirSync(directory);
  for (const file of ['abyss_data.lua', 'abyss_original_v4_data.lua']) copyFileSync(join(baseline, file), join(directory, file));
  if (label === 'historical-75-ready') return { label, ...inventory(directory, { artFeatures: { cards: true } }) };
  if (hostCount === 0) return { label, ...inventory(directory, {}) };
  const assets = Object.fromEntries(cardIds.map(id => [id, registry.assets[id]]));
  const sourceInputs = registry.sourceInputs.filter(item => cardIds.includes(item.cardId))
    .map(item => ({...item, path: fromRoot(item.path)}));
  const file = join(directory, 'registry.json');
  writeFileSync(file, JSON.stringify({ ...registry, assets, sourceInputs }));
  const hosts = Array.from({ length: hostCount }, (_, index) => `battlePanel/card${index + 1}`);
  return { label, ...inventory(directory, { nativeCardArt: { registry: resolve(file), hosts } }) };
});
const [aControl, , a1High, , a2Data, a2Pools] = experiments;
assert.equal(a2Data.layoutSha256, a1High.layoutSha256);
assert.equal(a2Data.templatesSha256, a1High.templatesSha256);
assert.equal(a2Data.mappedManifestSha256, a2Pools.mappedManifestSha256);
assert.equal(a2Pools.controls - a2Data.controls, a2Data.nativeCardArt.controlsPerPool * 2);
const controlModules = new Map(mappedLua.get(join(out, aControl.label)).map(row => [row.name, row]));
for (const experiment of experiments) {
  experiment.changedLua = mappedLua.get(join(out, experiment.label))
    .filter(row => row.sha256 !== controlModules.get(row.name)?.sha256)
    .map(row => ({ ...row, bytesDelta: row.bytes - (controlModules.get(row.name)?.bytes ?? 0) }));
}
assert.deepEqual(release.gitSourceIdentity(), identity);
assert.equal(native.payloadDigest(native.sourceInputs(root, { artFeatures, refinedReleaseMonsterArt })), b0Summary.sourcePayloadDigestWithoutEncoder);
writeFileSync(join(out, 'matrix.json'), JSON.stringify({ ...identity, cards: matrix }, null, 2) + '\n');
writeFileSync(join(out, 'inventory.json'), JSON.stringify({ ...identity, b0: b0Summary, experiments }, normalizePaths, 2) + '\n');
writeFileSync(join(out, 'b0-mapped-lua.json'), JSON.stringify(mappedLua.get(baseline), null, 2) + '\n');
