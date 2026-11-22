import {beforeCombatVisualSource,combatVisualPriorRead,assertCombatVisualCurrent} from './combat-visual-source.mjs';
import {beforeMapDeckSource,mapDeckPriorRead} from './release-map-deck-source.mjs';
import {beforeTravelerStatusSource,travelerStatusPriorRead} from './traveler-status-source.mjs';
import {authorizeReleaseUiRestore,beforeCurrentCompoundIntentSource,beforeReleaseShopEntry,compoundIntentPriorRead,shopEntryPriorRead,shopEntrySourcePaths} from './release-ui-restore-source.mjs';
import {beforeRefinedReleaseProduction,refinedReleaseProductionPaths} from './refined-release-source.mjs';
import {beforeAuthenticatedReleaseUiRestore,beforeReleaseControlsGuideRemoval,beforeReleaseForgeGridUi,beforeReleaseRightClick,beforeReleaseSharedRelicUi,beforeReleaseUiRestore,releaseControlsGuideRemovalSourcePaths,releaseForgeSourcePaths,releaseRightClickSourcePaths,releaseSharedRelicSourcePaths,releaseUiRestoreSourcePaths} from './release-ui-restore-source.mjs';
import {beforeAuthenticatedPc13RewardCover,beforePc13RewardCover,pc13RewardCoverSourcePaths} from './pc13-reward-cover-source.mjs';
import {beforeTinyHouseUiSource,tinyHouseUiSourcePaths} from './tiny-house-ui-source.mjs';
import {beforePotionPointerSource,potionPointerSourcePaths} from './potion-pointer-source.mjs';
import {beforeV2UiHudSource,v2UiHudSourcePaths} from './v2-ui-hud-source.mjs';
import {beforeLumineSource,luminePortraitSourcePath} from './lumine-portrait-source.mjs';
import {beforeSelectorSource,selectorSourcePair} from './character-selector-source.mjs';
import {beforePotionTextSource,potionTextSourcePair} from './potion-text-source.mjs';
import {beforeFatalBgmSource,fatalBgmPair} from './fatal-bgm-source-continuation.mjs';
import {beforeEndingTerminalSource,endingTerminalSourcePath} from './ending-terminal-source.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const normalize = text => text.replaceAll('\r\n', '\n');
const digest = value => createHash('sha256').update(value).digest('hex');
const archive = readFileSync(new URL('./character-preparation-source.json.gz', import.meta.url));
assert.equal(digest(archive), 'a3d61ed1e47036e5288cc4bc673388065ee0ace71497cba74da5b669a0a16790', 'complete character preparation source continuation');
const packet = JSON.parse(gunzipSync(archive));
assert.equal(packet.characterSourceCommit, '22cb2d47cdd3a1a06eef4b10afd69fc538398fdf');
for (const row of Object.values({...packet.production, ...packet.suite})) {
  assert.match(row.after, /^[a-f0-9]{64}$/);
  assert.equal(digest(row.before), row.beforeSha);
}
export const characterPreparationOwners = Object.freeze(Object.keys(packet.production));
const readRaw = path => readFileSync(path, 'utf8');

export function assertCharacterPreparationSources(read = readRaw) {
  for (const path of characterPreparationOwners) {
    const source = read(path);
    assert(typeof source === 'string' && !source.includes('\r\r\n') &&
      digest(normalize(source)) === packet.production[path].after, 'fresh character preparation source: '+path);
  }
}

// Restore the exact pre-split Lua sources for historical receipts.
const slimeSplitSources = {
  'src/lua/abyss_combat.lua': {
    beforeHash: '609e75ba6e83da7b2311629adfdc2fd101c8167d3d17dbb1cdc0748baa9b1d1c',
    currentHash: 'e2722605fad6ba7c56526d878cd6e0d571ef61156a5c5c5e28ad0d6bbc034355',
    current: '        children[i].sourcePosition = EnemySetup.splitPosition(parent, i)\n',
    before: '        if ai.splitPositions then children[i].sourcePosition=copy(ai.splitPositions[i]) end\n',
  },
  'src/lua/abyss_combat_enemy_setup.lua': {
    beforeHash: '76c8aa93a85a272b80ff4ae74645bc26fe33b7f6d18eb733d8c54d904b9331da',
    currentHash: 'bd4875cf008fd05fa65f90eea11a29165b4b98733c5d30e2210e3f7545dcc725',
    current: [
      'function M.splitPosition(parent,childIndex)',
      ' if parent.ai.splitPositions then return Copy(parent.ai.splitPositions[childIndex])end',
      ' -- Large slime takeTurn places medium children +/-134 source pixels from the parent.',
      ' local origin=parent.sourcePosition or {x=0,y=0}',
      ' return {x=origin.x+(childIndex==1 and -134 or 134),y=origin.y}',
      'end',
      '',
    ].join('\n'),
    before: '',
  },
};

function beforeSlimeSplitSource(path, source, read, currentOnly = false) {
  if (!Object.hasOwn(slimeSplitSources, path)) return source;
  const row = slimeSplitSources[path];
  const isCurrent = value => typeof value === 'string' && !value.includes('\r\r\n')
    && digest(normalize(value)) === row.currentHash;
  if (!currentOnly && !isCurrent(source)) return source;
  assert(isCurrent(source) && isCurrent(read(path)), 'fresh slime split source: '+path);
  const prior = normalize(source).replace(row.current, () => row.before);
  assert.equal(digest(prior), row.beforeHash, 'exact slime split predecessor: '+path);
  return source.includes('\r\n') ? prior.replaceAll('\n','\r\n') : prior;
}

// The old timing/production receipts continue to replay their exact source view.
// Unknown bytes are left visible and both current owners are checked on every projection.
export function beforeCharacterPreparationSource(path, source, read = readRaw) {
  source = beforeSlimeSplitSource(path, source, read);
  source = beforeMapDeckSource(path,source,read);
  read = mapDeckPriorRead(read);
  source = beforeAuthenticatedReleaseUiRestore(path,source,read);
  const readLatest=read;
  read=owner=>beforeReleaseUiRestore(owner,readLatest(owner));
  source = beforeAuthenticatedPc13RewardCover(path,source,read);
  const readCurrent=read;
  read=owner=>beforePc13RewardCover(owner,readCurrent(owner));
  source = beforeTinyHouseUiSource(path, source, read);
  source = beforePotionPointerSource(path, source, read);
  source = beforeV2UiHudSource(path, source, read);
  if (!Object.hasOwn(packet.production, path)) {
    source = beforePotionTextSource(path, beforeSelectorSource(path, source, read), read);
    source = beforeLumineSource(path, source, read);
    return beforeEndingTerminalSource(path, beforeFatalBgmSource(path, source, read), read);
  }
  if (typeof source !== 'string' || source.includes('\r\r\n')) return source;
  const row = packet.production[path];
  if (digest(normalize(source)) !== row.after) return source;
  assertCharacterPreparationSources(read);
  return row.before;
}

const currentContinuationOwners = new Set([
  ...characterPreparationOwners, ...v2UiHudSourcePaths, selectorSourcePair.path, potionTextSourcePair.path,
  fatalBgmPair.path, endingTerminalSourcePath, luminePortraitSourcePath, ...potionPointerSourcePaths, ...tinyHouseUiSourcePaths, ...pc13RewardCoverSourcePaths,
]);

export function beforeCurrentProductionSource(path, source, read = readRaw) {
 source=beforeCurrentCompoundIntentSource(path,source,read);
 read=compoundIntentPriorRead(read);
 source=beforeTravelerStatusSource(path,source,read,true);
 read=travelerStatusPriorRead(read);
 source=beforeSlimeSplitSource(path,source,read,true);
 source=beforeMapDeckSource(path,source,read);
 read=mapDeckPriorRead(read);
 if(shopEntrySourcePaths.includes(path)){
  const prior=beforeReleaseShopEntry(path,source);
  assert.notEqual(prior,source,'fresh current production owner: '+path);
  authorizeReleaseUiRestore([[path,source]],read);
  source=prior;
 }
 read=shopEntryPriorRead(read);
 assertCombatVisualCurrent(path,source,read);
 source=beforeCombatVisualSource(path,source,read);
 read=combatVisualPriorRead(read);
  // A historic successor may still be recognised by an older projector; that
  // must not let it claim the latest PC13 identity at this current-only entry.
  if (refinedReleaseProductionPaths.includes(path)) {
    assert.notEqual(beforeRefinedReleaseProduction(path,source),source,'fresh current production owner: '+path);
  } else if (releaseForgeSourcePaths.includes(path)) {
    assert.notEqual(beforeReleaseForgeGridUi(path,source),source,'fresh current production owner: '+path);
  } else if (releaseSharedRelicSourcePaths.includes(path)) {
    assert.notEqual(beforeReleaseSharedRelicUi(path,source),source,'fresh current production owner: '+path);
  } else if (releaseControlsGuideRemovalSourcePaths.includes(path)) {
    assert.notEqual(beforeReleaseControlsGuideRemoval(path,source),source,'fresh current production owner: '+path);
  } else if (releaseRightClickSourcePaths.includes(path)) {
    assert.notEqual(beforeReleaseRightClick(path,source),source,'fresh current production owner: '+path);
  } else if (releaseUiRestoreSourcePaths.includes(path)) {
    assert.notEqual(beforeReleaseUiRestore(path,source),source, 'fresh current production owner: '+path);
  } else if (pc13RewardCoverSourcePaths.includes(path)) {
    assert.notEqual(beforePc13RewardCover(path,source),source, 'fresh current production owner: '+path);
  }
  const prior = beforeCharacterPreparationSource(path, source, read);
  if (currentContinuationOwners.has(path)) {
    assert.notEqual(prior, source, 'fresh current production owner: '+path);
  }
  return prior;
}

export function beforeCharacterPreparationCiSource(path, source) {
  if (!Object.hasOwn(packet.suite, path) || typeof source !== 'string' || source.includes('\r\r\n')) return source;
  const row = packet.suite[path];
  const sha = digest(normalize(source));
  const calibration = path === 'tests/ci-complete-calibration.test.mjs' &&
    sha === '0581fa1b5e5e7735a85337a02c7ad9a5826cc59c36b56d4233da1d34924ad268';
  if (sha !== row.after && !calibration) return source;
  return source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
}
