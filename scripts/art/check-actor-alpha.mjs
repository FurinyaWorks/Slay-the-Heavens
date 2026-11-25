import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {approvedBattleNative} from '../official-portraits.mjs';
import {refinedReleaseOfficialAssetsProfile} from '../official-assets-profile.mjs';
import {sha256} from '../evidence-files.mjs';
import {prepareRefinedReleaseMonsterArt, refinedReleaseMonsterRegistry} from '../refined-release-monsters.mjs';
import {finalActorAlphaBinding} from './actor-alpha-release-custody.mjs';

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
    sourceCommit, version: JSON.parse(approvedFile('package.json')).version,
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

async function main(args) {
  const release = args[3] === '--release' && args.length === 5;
  if (args.length !== 3 && !release) {
    throw Error('Usage: npm run verify:actor-alpha -- <capture.json> <mask-locators.json> <new-report.json> [--release <reviewed-capture-approval-commit>]');
  }
  const [capture, masks, report] = args.slice(0, 3).map(path => resolve(path));
  const inventory = productionActorAlphaInventory();
  if (release) {
    const binding = await finalActorAlphaBinding(inventory, args[4], sha256(readFileSync(capture)));
    inventory.releaseEvidence = binding.capture;
    inventory.expectedCaptureSha256 = binding.expectedCaptureSha256;
    inventory.releaseAuthority = binding.authority;
    inventory.scope = 'production Lua actor painters from final native GIL readback';
  }
  const measure = fileURLToPath(new URL('./actor_alpha_measure.py', import.meta.url));
  const result = spawnSync(process.env.ABYSS_PYTHON || 'python', [measure, capture, masks, report],
    {input: JSON.stringify(inventory), stdio: ['pipe', 'inherit', 'inherit']});
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main(process.argv.slice(2));
}
