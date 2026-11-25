import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {approvedBattleNative} from '../official-portraits.mjs';
import {officialAssetsFromReceipt, refinedReleaseOfficialAssetsProfile} from '../official-assets-profile.mjs';
import {verifyArtFeatureReceipt} from '../art-features.mjs';
import {uiProfileFromReceipt} from '../ui-profile.mjs';
import {fileRecord, sha256} from '../evidence-files.mjs';
import {hostedCandidatePath} from '../hosted-gil-receipt.mjs';
import {prepareRefinedReleaseMonsterArt, refinedReleaseMonsterRegistry} from '../refined-release-monsters.mjs';

export function productionActorAlphaInventory(root = process.cwd()) {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  const approvedFile = path => execFileSync('git', ['show', `${sourceCommit}:${path}`],
    {cwd: root, maxBuffer: 8 * 1024 * 1024});
  const hero = approvedBattleNative(root);
  const monsters = prepareRefinedReleaseMonsterArt(JSON.parse(approvedFile(refinedReleaseMonsterRegistry)));
  const approvals = approvedFile('data/release/actor-alpha-approvals.json');
  return {
    profile: refinedReleaseOfficialAssetsProfile,
    scope: 'production Lua actor painters on an isolated Simulator runtime scene',
    sourceCommit,
    approvals: JSON.parse(approvals), approvalsSha256: sha256(approvals),
    actors: [
      {id: 'traveler-geo', geometry: hero.jsonSha256, width: hero.width, shapes: hero.count,
        productionSourceSha256: hero.sourceSha256, approvedOriginalSha256: hero.sourceSha256},
      ...monsters.provenance.orderedAssets.map(({enemyId, geometrySha256, slotCount, sourceSha256}) => ({
        id: enemyId, geometry: geometrySha256, width: monsters.canvas[0], shapes: slotCount,
        productionSourceSha256: sourceSha256,
      })),
    ],
  };
}

const validDigest = value => /^[a-f0-9]{64}$/.test(value ?? '');

export function finalActorAlphaBinding(inventory, candidatePath, adapterPath) {
  const candidateBytes = readFileSync(candidatePath);
  const candidate = JSON.parse(candidateBytes);
  if (candidate.sourceCommit !== inventory.sourceCommit || candidate.sourceDirty !== false
    || candidate.officialAssetsProfile !== inventory.profile || !officialAssetsFromReceipt(candidate)
    || !validDigest(candidate.release?.notesSha256) || !validDigest(candidate.payloadDigest)
    || !/^[a-f0-9-]{36}$/.test(candidate.buildId ?? '')) {
    throw Error('Expected the clean frozen official GIL build of this checkout');
  }
  verifyArtFeatureReceipt(candidate.artFeatures);
  if (!uiProfileFromReceipt(candidate)) throw Error('Expected the native page lifecycle candidate configuration');
  const gil = fileRecord(hostedCandidatePath(candidatePath, candidate));
  if (gil.sha256 !== candidate.candidate.sha256 || gil.bytes !== candidate.candidate.bytes) {
    throw Error('Final GIL bytes differ from the candidate receipt');
  }

  const adapterBytes = readFileSync(adapterPath);
  const adapter = JSON.parse(adapterBytes);
  if (adapter.sourceCommit !== inventory.sourceCommit || adapter.sourceDirty !== false
    || adapter.candidateSha256 !== gil.sha256 || adapter.buildId !== candidate.buildId
    || adapter.luaSourceExact !== true || adapter.allActualLuaGuidsReadFromGil !== true
    || !Array.isArray(adapter.inverseReadback?.faults) || adapter.inverseReadback.faults.length
    || !adapter.unknownProperties || Object.keys(adapter.unknownProperties).length
    || adapter.modifiedGil !== false) {
    throw Error('Native readback is missing or belongs to a different final GIL');
  }
  const save = fileRecord(resolve(dirname(adapterPath), adapter.save));
  if (save.sha256 !== adapter.saveSha256 || save.bytes !== adapter.bytes) {
    throw Error('Simulator projection differs from the native readback');
  }
  return {
    candidateSha256: gil.sha256, buildId: candidate.buildId, payloadDigest: candidate.payloadDigest,
    officialAssetsProfile: candidate.officialAssetsProfile,
    artConfigSha256: candidate.artFeatures.configSha256, uiConfigSha256: candidate.uiProfile.configSha256,
    candidateReceiptSha256: sha256(candidateBytes), nativeReadbackSha256: sha256(adapterBytes),
    simulatorSaveSha256: save.sha256,
  };
}

function main(args) {
  const release = args[3] === '--release' && args.length === 6;
  if (args.length !== 3 && !release) {
    throw Error('Usage: npm run verify:actor-alpha -- <capture.json> <mask-locators.json> <new-report.json> [--release <final-candidate.json> <adapter-receipt.json>]');
  }
  const [capture, masks, report] = args.slice(0, 3).map(path => resolve(path));
  const inventory = productionActorAlphaInventory();
  if (release) {
    inventory.releaseEvidence = finalActorAlphaBinding(inventory, resolve(args[4]), resolve(args[5]));
    inventory.scope = 'production Lua actor painters from final native GIL readback';
  }
  const measure = fileURLToPath(new URL('./actor_alpha_measure.py', import.meta.url));
  const result = spawnSync(process.env.ABYSS_PYTHON || 'python', [measure, capture, masks, report],
    {input: JSON.stringify(inventory), stdio: ['pipe', 'inherit', 'inherit']});
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
