import {sourceEpoch} from './closeout-source-epoch.mjs';
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
  return priorCiSource(shelfCi.files, path, beforeShopDismissalCiSource(path, source));
}

export function assertShopShelfCiCurrent(read = readFileSync) {
  assert.equal(hash(read(shelfArchive)), shelfDigest, 'fresh shop shelf CI continuation');
  for (const [path, row] of Object.entries(shelfCi.files)) {
    const source = normalized(beforeShopDismissalCiSource(path, read(path, 'utf8')));
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

const historyArchive = 'tests/helpers/release-history-authorization-ci.json.gz';
const historyDigest = 'a52241fb9b05cdcf97441bf2a00649902b8eb5cea8a4d670b9e3a15840e685f7';
const historyBytes = readFileSync(new URL('./release-history-authorization-ci.json.gz', import.meta.url));
assert.equal(hash(historyBytes), historyDigest, 'fixed historical replay authorization continuation');
const historyCi = JSON.parse(gunzipSync(historyBytes));
assert.equal(historyCi.base, '6f655ca8f741a0f060cafcb6958118d77c595dfe');
for (const row of Object.values(historyCi.files)) assert.equal(hash(row.before), row.beforeSha256);

// Bind this independently landed sparse pointer slice before replaying older CI input.
const sparseArchive = 'tests/helpers/release-sparse-pointer-ci.json.gz';
const sparseDigest = '00d8fbe8451680c01b5bbed88b0cf5220b3bde835aaf395b503b880b806e3f1c';
const sparseBytes = readFileSync(new URL('./release-sparse-pointer-ci.json.gz', import.meta.url));
assert.equal(hash(sparseBytes), sparseDigest, 'fixed sparse pointer CI continuation');
const sparseCi = JSON.parse(gunzipSync(sparseBytes));
assert.equal(sparseCi.base, 'c5e98d55250636cf2c3d4bbb395b30304c3a5807');
for (const row of Object.values(sparseCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

const intentArchive = 'tests/helpers/release-composite-intent-ci.json.gz';
const intentDigest = '598cdbb2f2b285424af0b945ac23ef87cbf7851e583e1c5e99b8cb5c0889b5d4';
const intentBytes = readFileSync(new URL('./release-composite-intent-ci.json.gz', import.meta.url));
assert.equal(hash(intentBytes), intentDigest, 'fixed composite intent CI continuation');
const intentCi = JSON.parse(gunzipSync(intentBytes));
assert.equal(intentCi.base, '174fecfe4561b58f402c4c140ee5520d96e18b3c');
for (const row of Object.values(intentCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

// Authenticate the existing #706 particle slice before using older CI inputs.
const particlesArchive = 'tests/helpers/release-intent-particles-ci.json.gz';
const particlesDigest = '5f7874d67978c07d3794acf563e197a49511cc49b22ab7bdfd8da8eba35b35eb';
const particlesBytes = readFileSync(new URL('./release-intent-particles-ci.json.gz', import.meta.url));
assert.equal(hash(particlesBytes), particlesDigest, 'fixed intent particle CI continuation');
const particlesCi = JSON.parse(gunzipSync(particlesBytes));
assert.equal(particlesCi.base, 'cdf5fe42fa7962f004966842e05d8ab35781df31');
for (const row of Object.values(particlesCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

const cornerArchive = 'tests/helpers/release-target-corners-ci.json.gz';
const cornerDigest = '9f3f104ed1ab46bcc648d66c7d8c3667947a440861197d82b542c2d9e7e7d6af';
const cornerBytes = readFileSync(new URL('./release-target-corners-ci.json.gz', import.meta.url));
assert.equal(hash(cornerBytes), cornerDigest, 'fixed Release target corner CI continuation');
const cornerCi = JSON.parse(gunzipSync(cornerBytes));
assert.equal(cornerCi.base, '72870245228a2a9fbf036a516aa69332baa35973');
for (const row of Object.values(cornerCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

function beforeCornerCiSource(path, source) {
  return priorCiSource(cornerCi.files, path, beforeShopDismissalCiSource(path, source));
}

function assertCornerCiCurrent(read) {
  assert.equal(hash(read(cornerArchive)), cornerDigest, 'fresh target corner CI continuation');
  assert.equal(hash(read('tests/helpers/release-target-corners-source.json.gz')), cornerCi.productionArchive,
    'fresh immutable target corner production archive');
  for (const [path, row] of Object.entries(cornerCi.files)) {
    const source = normalized(beforeShopDismissalCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: target corners ' + path);
  }
}

const shopDismissalArchive = 'tests/helpers/release-shop-dismissal-ci.json.gz';
const shopDismissalDigest = '71d70f6661d4b5431c05ce334636be561e915b66e46654fea8e80bccdec0f9fc';
const shopDismissalBytes = readFileSync(new URL('./release-shop-dismissal-ci.json.gz', import.meta.url));
assert.equal(hash(shopDismissalBytes), shopDismissalDigest, 'fixed shop dismissal CI continuation');
const shopDismissalCi = JSON.parse(gunzipSync(shopDismissalBytes));
assert.equal(shopDismissalCi.base, '91d6f955e16dcf91d24971450abaa72d12a4efa3');
for (const row of Object.values(shopDismissalCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

const cancelArchive = 'tests/helpers/release-card-cancel-notice-ci.json.gz';
const cancelDigest = '04335a161f9f01a49b26cf4db166bb00e588295197bc8862e928c1403bbd965c';
const cancelBytes = readFileSync(new URL('./release-card-cancel-notice-ci.json.gz', import.meta.url));
assert.equal(hash(cancelBytes), cancelDigest, 'fixed card cancel notice CI continuation');
const cancelCi = JSON.parse(gunzipSync(cancelBytes));
assert.equal(cancelCi.base, '4628caadac5f419a4253c85ddbcc3870192a1fa7');
for (const row of Object.values(cancelCi.files)) {
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}

// One new outer view for the exact Release backport; no earlier packet is rewritten.
const fatalBgmArchive = 'tests/helpers/release-fatal-bgm-ci.json.gz';
const fatalBgmDigest = 'a35eceb882be23849035539e26a33cab0f415f3da475af21079b5c90ac1c182a';
const fatalBgmBytes = readFileSync(new URL('./release-fatal-bgm-ci.json.gz', import.meta.url));
assert.equal(hash(fatalBgmBytes), fatalBgmDigest, 'complete fatal BGM CI continuation');
const fatalBgmCi = JSON.parse(gunzipSync(fatalBgmBytes));
assert.equal(fatalBgmCi.schemaVersion, 1);
assert.equal(fatalBgmCi.base, '1ceb7c1a0c8575497c29acfd5a407ae399a9aaa2');
assert.deepEqual(Object.keys(fatalBgmCi.files), ["tests/helpers/closeout-source-epoch.mjs", "tests/helpers/copy-integration-source-closure.mjs", "tests/integrated-ci-source.cases.mjs", "tests/native-startup-contract.test.mjs", "tests/lua/support/fatal_bgm_stop.lua"]);
for (const [path, row] of Object.entries(fatalBgmCi.files)) {
  assert(!/^(?:src|data|config)\//.test(path), 'CI continuation cannot replace production');
  if (row.before !== null) assert.equal(hash(row.before), row.beforeSha256);
}
function beforeFatalBgmCiSource(path, source) {
  return priorCiSource(fatalBgmCi.files, path, source);
}
function assertFatalBgmCiCurrent(read) {
  assert.equal(hash(read(fatalBgmArchive)), fatalBgmDigest, 'fresh fatal BGM CI continuation');
  assert.equal(hash(read('tests/helpers/release-fatal-bgm-source.json.gz')), fatalBgmCi.productionArchive,
    'fresh immutable fatal BGM production archive');
  for (const [path, row] of Object.entries(fatalBgmCi.files)) {
    const source = normalized(read(path, 'utf8'));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: fatal BGM ' + path);
  }
}
function beforeCancelCiSource(path, source) {
  return priorCiSource(cancelCi.files, path, beforeFatalBgmCiSource(path, source));
}

function assertCancelCiCurrent(read) {
  assert.equal(hash(read(cancelArchive)), cancelDigest, 'fresh card cancel notice CI continuation');
  assert.equal(hash(read('tests/helpers/release-card-cancel-notice-source.json.gz')), cancelCi.productionArchive,
    'fresh immutable card cancel notice production archive');
  for (const [path, row] of Object.entries(cancelCi.files)) {
    const source = normalized(beforeFatalBgmCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: card cancel notice ' + path);
  }
}

function beforeShopDismissalCiSource(path, source) {
  return priorCiSource(shopDismissalCi.files, path, beforeCancelCiSource(path, source));
}
function assertShopDismissalCiCurrent(read) {
  assert.equal(hash(read(shopDismissalArchive)), shopDismissalDigest, 'fresh shop dismissal CI continuation');
  assert.equal(hash(read('tests/helpers/release-shop-dismissal-source.json.gz')), shopDismissalCi.productionArchive, 'fresh immutable shop dismissal production archive');
  for (const [path, row] of Object.entries(shopDismissalCi.files)) {
    const source = normalized(beforeCancelCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: shop dismissal ' + path);
  }
}

function beforeParticlesCiSource(path, source) {
  return priorCiSource(particlesCi.files, path, beforeCornerCiSource(path, source));
}

function assertParticlesCiCurrent(read) {
  assert.equal(hash(read(particlesArchive)), particlesDigest, 'fresh intent particle CI continuation');
  assert.equal(hash(read('tests/helpers/runtime-particle-source.json.gz')), particlesCi.productionArchive,
    'fresh immutable intent particle production archive');
  for (const [path, row] of Object.entries(particlesCi.files)) {
    const source = normalized(beforeCornerCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: intent particles ' + path);
  }
}

function beforeIntentCiSource(path, source) {
  return priorCiSource(intentCi.files, path, beforeParticlesCiSource(path, source));
}
export function isCurrentIntentCiReplay(path, source) {
  return beforeIntentCiSource(path, source) !== source;
}
function assertIntentCiCurrent(read) {
  assert.equal(hash(read(intentArchive)), intentDigest, 'fresh composite intent CI continuation');
  assert.equal(hash(read('tests/helpers/release-composite-intent-source.json.gz')), intentCi.productionArchive, 'fresh immutable composite intent source archive');
  for (const [path, row] of Object.entries(intentCi.files)) {
    const source = normalized(beforeParticlesCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: composite intent ' + path);
  }
}

const settingsArchive = 'tests/helpers/release-settings-icon-ci.json.gz';
const settingsDigest = '761217b7167cc43aa12d0402dbaa820b34cd2c6b2395c85743230d73f8c63b51';
const settingsBytes = readFileSync(new URL('./release-settings-icon-ci.json.gz', import.meta.url));
assert.equal(hash(settingsBytes), settingsDigest, 'fixed settings icon CI continuation');
const settingsCi = JSON.parse(gunzipSync(settingsBytes));
const settingsHud = 'scripts/official-battle-hud.mjs';
const settingsTest = 'tests/official-run-chrome.test.mjs';
assert.equal(settingsCi.base, '174fecfe4561b58f402c4c140ee5520d96e18b3c');
assert.deepEqual(Object.keys(settingsCi.files), [settingsHud, settingsTest]);
for (const row of Object.values(settingsCi.files)) assert.equal(hash(row.before), row.beforeSha256);

function assertSettingsCiCurrent(read) {
  assert.equal(hash(read(settingsArchive)), settingsDigest, 'fresh settings icon CI continuation');
  for (const [path, row] of Object.entries(settingsCi.files)) {
    const source = normalized(read(path, 'utf8'));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: settings icon ' + path);
  }
}

function beforeSparseCiSource(path, source) {
  if (path === settingsTest) source = priorCiSource(settingsCi.files, path, source);
  return priorCiSource(sparseCi.files, path, beforeIntentCiSource(path, source));
}

function assertSparseCiCurrent(read) {
  assert.equal(hash(read(sparseArchive)), sparseDigest, 'fresh sparse pointer CI continuation');
  assert.equal(hash(read('tests/helpers/release-sparse-pointer-source.json.gz')), sparseCi.productionArchive,
    'fresh immutable sparse pointer production archive');
  for (const [path, row] of Object.entries(sparseCi.files)) {
    const source = normalized(beforeIntentCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256, 'fresh complete integration source: sparse pointer ' + path);
  }
}

function beforeHistoryCiSource(path, source) {
  return priorCiSource(historyCi.files, path, beforeSparseCiSource(path, source));
}

function assertHistoryCiCurrent(read) {
  assert.equal(hash(read(historyArchive)), historyDigest, 'fresh historical replay authorization packet');
  for (const [path, row] of Object.entries(historyCi.files)) {
    const source = normalized(beforeSparseCiSource(path, read(path, 'utf8')));
    assert(source !== null && hash(source) === row.afterSha256,'fresh complete integration source: replay authorization ' + path);
  }
}

export function beforeEnemyMetricsCiSource(path, source) {
  return priorCiSource(enemyCi.files, path, beforeHistoryCiSource(path, source));
}

export function assertEnemyMetricsCiCurrent(read = readFileSync) {
  assert.equal(hash(read(enemyArchive)), enemyDigest, 'fresh enemy metrics CI continuation');
  assert.equal(hash(read('tests/helpers/enemy-geometry-source.json.gz')), enemyCi.productionArchive,
    'fresh immutable enemy metrics production archive');
  for (const [path, row] of Object.entries(enemyCi.files)) {
    const source = normalized(beforeHistoryCiSource(path, read(path, 'utf8')));
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
    // Frozen calibration views precede the settings icon shipped in #695.
    if (side === 'potion' && path === settingsHud && (typeof source === 'string' || Buffer.isBuffer(source))) {
      const text = typeof source === 'string' ? source : source.toString('utf8');
      const prior = priorCiSource(settingsCi.files, path, text);
      if (prior === text) return source;
      assertSettingsCiCurrent(read);
      return typeof source === 'string' ? prior : Buffer.from(prior);
    }
    // Earlier potion fixtures retain the exact UI before the fatal-only stop port.
    if (side === 'potion' && path === 'src/lua/abyss_ui.lua' &&
        (typeof source === 'string' || Buffer.isBuffer(source))) {
      const text = typeof source === 'string' ? source : source.toString('utf8');
      const prior = sourceEpoch.preCombinedSource(path, text, {
        target: 'releaseFatalBgmPrior',
        readSource: owner => read(owner, 'utf8'),
      });
      return typeof source === 'string' ? prior : prior === text ? source : Buffer.from(prior);
    }
    // The authenticated older potion view keeps the exact gesture owner from before PC35.
    if (side === 'potion' && path === 'src/lua/abyss_battle_card_gestures.lua' &&
        (typeof source === 'string' || Buffer.isBuffer(source))) {
      const text = typeof source === 'string' ? source : source.toString('utf8');
      const prior = sourceEpoch.preCombinedSource(path, text, {
        target: 'releaseCardCancelNoticePrior',
        readSource: owner => read(owner, 'utf8'),
      });
      return typeof source === 'string' ? prior : prior === text ? source : Buffer.from(prior);
    }
    if (Buffer.isBuffer(source)) {
      const row = Object.hasOwn(packet.files, path) ? packet.files[path] : null;
      // Unbound binary archives remain byte-identical, without UTF-8 decoding.
      const handRow = Object.hasOwn(handCi.files, path) ? handCi.files[path] : null;
      const shelfRow = Object.hasOwn(shelfCi.files, path) ? shelfCi.files[path] : null;
      const enemyRow = Object.hasOwn(enemyCi.files, path) ? enemyCi.files[path] : null;
      const historyRow = Object.hasOwn(historyCi.files, path) ? historyCi.files[path] : null;
      const sparseRow = Object.hasOwn(sparseCi.files, path) ? sparseCi.files[path] : null;
      const intentRow = Object.hasOwn(intentCi.files, path) ? intentCi.files[path] : null;
      const particlesRow = Object.hasOwn(particlesCi.files, path) ? particlesCi.files[path] : null;
      const cornerRow = Object.hasOwn(cornerCi.files, path) ? cornerCi.files[path] : null;
      const fatalBgmRow = Object.hasOwn(fatalBgmCi.files, path) ? fatalBgmCi.files[path] : null;
      const cancelRow = Object.hasOwn(cancelCi.files, path) ? cancelCi.files[path] : null;
      const shopDismissalRow = Object.hasOwn(shopDismissalCi.files, path) ? shopDismissalCi.files[path] : null;
      if (!fatalBgmRow?.before && !shopDismissalRow?.before && path !== settingsTest && !handRow?.before && !shelfRow?.before && !enemyRow?.before && !historyRow?.before && !sparseRow?.before && !intentRow?.before && !particlesRow?.before && !cornerRow?.before && !cancelRow?.before &&
        (!row || !Object.hasOwn(row.parents, side))) return source;
    } else if (typeof source !== 'string') {
      return source;
    }
    const text = typeof source === 'string' ? source : source.toString('utf8');
    const parent = releasePotionEnemySource(path, text, side);
    return typeof source === 'string' ? parent : text === parent ? source : Buffer.from(parent);
  };
}

export function assertReleasePotionEnemyCurrent(read = readFileSync) {
  assertFatalBgmCiCurrent(read);
  assertCancelCiCurrent(read);
  assertShopDismissalCiCurrent(read);
  assertCornerCiCurrent(read);
  assertSettingsCiCurrent(read);
  assertParticlesCiCurrent(read);
  assertIntentCiCurrent(read);
  assertSparseCiCurrent(read);
  assertHistoryCiCurrent(read);
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
