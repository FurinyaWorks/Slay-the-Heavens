import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {approvedBattleNative} from '../official-portraits.mjs';
import {refinedReleaseOfficialAssetsProfile} from '../official-assets-profile.mjs';
import {prepareRefinedReleaseMonsterArt, refinedReleaseMonsterRegistry} from '../refined-release-monsters.mjs';

export function productionActorAlphaInventory(root = process.cwd()) {
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  const hero = approvedBattleNative(root);
  const monsters = prepareRefinedReleaseMonsterArt(JSON.parse(readFileSync(join(root, refinedReleaseMonsterRegistry))));
  return {
    profile: refinedReleaseOfficialAssetsProfile,
    scope: 'production Lua actor painters on an isolated Simulator runtime scene',
    sourceCommit,
    actors: [
      {id: 'traveler-geo', geometry: hero.jsonSha256, width: hero.width, shapes: hero.count,
        approvedSourceSha256: hero.sourceSha256},
      ...Object.values(monsters.assets).map(({enemyId, geometrySha256, slots}) => ({
        id: enemyId, geometry: geometrySha256, width: monsters.canvas[0], shapes: slots.length,
      })),
    ],
  };
}

function main(args) {
  if (args.length !== 3) {
    throw Error('Usage: npm run verify:actor-alpha -- <capture.json> <approved-masks.json> <new-report.json>');
  }
  const [capture, masks, report] = args.map(path => resolve(path));
  const measure = fileURLToPath(new URL('./actor_alpha_measure.py', import.meta.url));
  const result = spawnSync(process.env.ABYSS_PYTHON || 'python', [
    measure, capture, '--masks', masks, '--output', report, '--production-inventory', '--require-pass',
  ], {input: JSON.stringify(productionActorAlphaInventory()), stdio: ['pipe', 'inherit', 'inherit']});
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
