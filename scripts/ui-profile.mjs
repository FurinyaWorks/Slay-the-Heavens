import {validateOfficialAssets,officialAssetsFromReceipt,officialAssetsProfile} from './official-assets-profile.mjs';
import {createHash} from 'node:crypto';
import {lightweightProfile} from './lightweight-2d-profile.mjs';
import {v25ChromeProfile,validateV25Chrome} from './v25-profile.mjs';

export const uiProfileModule = 'abyss_ui_profile';

// Temporary, candidate-local switches. Their stable keys are also the
// generated Lua fields and receipt fields.
export const candidateFeatureFlags = Object.freeze({
  nativePageLifecycle: Object.freeze({
    name: 'native-page-lifecycle',
    legacyOption: '--native-page-lifecycle',
    legacyField: true,
    owner: 'Furinya',
    removeWhen: 'TASK-103: after same-candidate PC and phone page/choice lifecycle acceptance, remove the legacy branch; if rejected, remove the experimental branch. Remove the switch in either case.',
    allowedInBuild: ({lightweight2d, v25BattleChrome, officialAssets}) =>
      lightweight2d === true || v25BattleChrome === true || officialAssets === true,
    allowedInReceipt: receipt => receipt.experimentalProfile === lightweightProfile ||
      receipt.experimentalBattleChrome === v25ChromeProfile || officialAssetsFromReceipt(receipt),
  }),
});
const flags = Object.entries(candidateFeatureFlags);
const byName = new Map();
const legacyOptions = new Map();
for (const [key, flag] of flags) {
  if (!/^[A-Za-z][A-Za-z\d]*$/.test(key) || ['schemaVersion', 'configSha256'].includes(key) ||
      !/^[a-z][a-z\d]*(?:-[a-z\d]+)*$/.test(flag.name) || byName.has(flag.name) ||
      !flag.owner?.trim() || !flag.removeWhen?.trim() ||
      typeof flag.allowedInBuild !== 'function' || typeof flag.allowedInReceipt !== 'function') {
    throw new Error(`Invalid candidate feature flag registration: ${key}`);
  }
  byName.set(flag.name, key);
  if (flag.legacyOption) legacyOptions.set(flag.legacyOption, key);
}

function configFor(values) {
  const config = {schemaVersion: 1};
  for (const [key, flag] of flags) {
    const value = Object.hasOwn(values, key) && values[key] !== undefined ? values[key] : false;
    if (typeof value !== 'boolean') throw new Error(`Invalid ${flag.name.replaceAll('-', ' ')} boolean`);
    if (flag.legacyField || value) config[key] = value;
  }
  return config;
}

export function validateUiProfileOptions(options = {}) {
  const {lightweight2d = false, releaseCandidate = false, v25BattleChrome = false, officialAssets = false} = options;
  validateOfficialAssets({officialAssets, releaseCandidate, lightweight2d, v25BattleChrome});
  validateV25Chrome({v25BattleChrome, lightweight2d, releaseCandidate});
  const config = configFor(options);
  for (const [key, flag] of flags) {
    if (config[key] && (!flag.allowedInBuild(options) || (releaseCandidate !== false && officialAssets !== true))) {
      throw new Error(`${flag.name.replaceAll('-', ' ')} requires an explicit bounded non-release experiment`);
    }
  }
  return config.nativePageLifecycle;
}

export function uiProfileArgs(argv) {
  const args = [];
  const overrides = new Map();
  for (const arg of argv) {
    let key, value;
    if (arg === '--feature' || arg.startsWith('--feature=')) {
      const match = /^--feature=([a-z\d-]+)=(true|false)$/.exec(arg);
      key = match && byName.get(match[1]);
      if (!key) throw new Error('Use --feature=<registered-name>=true|false');
      value = match[2] === 'true';
    } else {
      const legacyOption = [...legacyOptions.keys()].find(option => arg.startsWith(option));
      if (!legacyOption) {
        args.push(arg);
        continue;
      }
      key = legacyOptions.get(legacyOption);
      if (arg !== legacyOption) throw new Error(`Invalid ${candidateFeatureFlags[key].name.replaceAll('-', ' ')} option`);
      value = true;
    }
    if (overrides.has(key)) throw new Error(`Duplicate ${candidateFeatureFlags[key].name.replaceAll('-', ' ')} option`);
    overrides.set(key, value);
  }
  return {
    args,
    ...Object.fromEntries(flags.map(([key]) => [key, overrides.get(key) ?? false])),
  };
}

export function uiProfileSource(nativePageLifecycle = false) {
  const config = configFor({nativePageLifecycle});
  const fields = Object.entries(config).map(([key, value]) => `${key}=${value}`).join(',');
  return `-- Generated candidate-local UI policy; rebuild to change.\nreturn {${fields}}\n`;
}

function profileDigest(config) {
  return createHash('sha256').update(JSON.stringify(config)).digest('hex');
}

export function uiProfileReceipt(nativePageLifecycle = false) {
  const config = configFor({nativePageLifecycle});
  return {...config, configSha256: profileDigest(config)};
}

function validReleaseMetadata(release, official) {
  if (release === undefined) return true;
  if (release === null || typeof release !== 'object') return false;
  const fields = Reflect.ownKeys(release);
  const validNotes = fields.length === 3 && official && Object.hasOwn(release, 'notesSha256') &&
    typeof release.notesSha256 === 'string' && /^[a-f0-9]{64}$/.test(release.notesSha256);
  return (fields.length === 2 || validNotes) &&
    Object.hasOwn(release, 'version') && typeof release.version === 'string' && release.version.length <= 33 &&
    /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(release.version) &&
    Object.hasOwn(release, 'workKey') && typeof release.workKey === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(release.workKey);
}

export function uiProfileFromReceipt(receipt) {
  const profile = receipt?.uiProfile;
  if (profile === undefined) return false; // Older frozen source epochs have no policy module.
  if (!profile || profile.schemaVersion !== 1 ||
      Reflect.ownKeys(profile).some(key => !['schemaVersion', 'configSha256'].includes(key) && !Object.hasOwn(candidateFeatureFlags, key)) ||
      flags.some(([key, flag]) => Object.hasOwn(profile, key) ?
        typeof profile[key] !== 'boolean' || (!flag.legacyField && profile[key] !== true) : flag.legacyField)) {
    throw new Error('Invalid candidate UI profile receipt');
  }
  const config = configFor(profile);
  if (profile.configSha256 !== profileDigest(config)) throw new Error('UI profile config digest mismatch');
  for (const [key, flag] of flags) {
    if (config[key] && (!validReleaseMetadata(receipt.release, receipt.officialAssetsProfile === officialAssetsProfile &&
      officialAssetsFromReceipt(receipt)) || !flag.allowedInReceipt(receipt))) {
      throw new Error(`${flag.name.replaceAll('-', ' ')} receipt requires the approved official profile or a bounded non-release experiment`);
    }
  }
  return config.nativePageLifecycle;
}
