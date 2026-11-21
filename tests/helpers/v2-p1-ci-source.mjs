import assert from 'node:assert/strict';
import {beforePc13RewardCover} from './pc13-reward-cover-source.mjs';
import {releaseUiRestoreArchive} from './release-ui-restore-source.mjs';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {beforeTinyHouseCiSource,beforeV2UiEvidence as beforePriorEvidence} from './v2-ui-admission-ci-source.mjs';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const {project:beforeReleaseUiRestoreCi}=releaseUiRestoreArchive(
  readFileSync(new URL('./release-ui-restore-ci-source.json.gz',import.meta.url)),
  '8ac60ac2399c9ded610b9c472caefc8e22f7d2db83faec8bd72caf84482700fd');
const bytes = readFileSync(new URL('../fixtures/v2-p1-ci-source.json.gz', import.meta.url));
assert.equal(sha256(bytes),'126bc5faaa880285c3e28b96fa3781ed6d188e9b5ee2889a5a41c0a7c2c30cd4','historical P1 evidence source identities');
const archive = JSON.parse(gunzipSync(bytes));
for (const row of Object.values(archive)) assert.equal(sha256(row.before),row.beforeSha256);

// The exact P1/potion merge changes the closure in both directions. Restore
// its potion side first; the prior evidence reader then validates each older hop.
const potionMergeBytes = readFileSync(new URL('../fixtures/v2-p1-potion-merge-source.json.gz', import.meta.url));
assert.equal(sha256(potionMergeBytes),'f4b155c3720a1ca771e6af31bd31c2e1aa503de1dd9f12dab3aeb453e3af4a79','exact P1/potion merge evidence source identity');
const potionMerge = JSON.parse(gunzipSync(potionMergeBytes));
assert.equal(sha256(potionMerge.before),potionMerge.beforeSha256);
assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(potionMerge.before)}\0`).update(potionMerge.before).digest('hex'),potionMerge.beforeGitBlob);

// Keep the card confirmation fix and its live regression out of older UI replays.
const fieldConfirmation = {
  'scripts/official-assets-layout.mjs': {
    current: ['1d7fa0e8abb2dd246676de028e98b952f12a2c0d24b86ea487acdf89e6bbb7e5',
      '922af096af2868f1bfc6c480640e4705eaafd63dbb662433c9307030f4913cfc'],
    prior: '976f3ac618d10f73ae256f267966e4185c05c9b0c1ce6c6bfab0d90662292ada',
    added: /^ \/\/ The play area is a (?:battlefield-wide hit surface with a line and caption|transparent battlefield-wide hit surface)\.\n if\(node\.name==='playArea'\)return;\n/m,
  },
  'tests/official-assets-runtime.test.mjs': {
    current: ['f214dff087837db37ad9719826930b67af5e6a705d5871d5c386aa57256a9d8e',
      '1ccbfa1c23bce59d0a2755b5e57058039a14d549df231e049524aac87d8ca30f',
      'db065e0b4a84f09d6c898863ca8e46e9959eab049e96c95506a81a8de73b9f0b'],
    prior: '2fb2148a78b0dd238ec66a51981b02fafe32bf54aecc72505f060c7459f7beb0',
    added: /^test\('official card confirmation keeps the battlefield visible[\s\S]+?^\}\);\n\n/m,
  },
};
function beforeFieldConfirmation(path, source) {
  if (!Object.hasOwn(fieldConfirmation,path) || typeof source!=='string' || source.includes('\r\r\n')) return source;
  const row=fieldConfirmation[path], text=source.replaceAll('\r\n','\n');
  if (!row.current.includes(sha256(text))) return source;
  const prior=text.replace(row.added,'');
  assert.equal(sha256(prior),row.prior,'complete pre-fix card confirmation source: '+path);
  return source.includes('\r\n') ? prior.replaceAll('\n','\r\n') : prior;
}

export function beforeV2UiEvidence(path, source) {
  source = beforeFieldConfirmation(path,source);
  source = beforeReleaseUiRestoreCi(path,source);
  source = beforePc13RewardCover(path,source);
  // The P1 merge recognizes the immediate pre-Tiny-House bytes only.
  source = beforeTinyHouseCiSource(path,source);
  if (path === potionMerge.path && typeof source === 'string' && !source.includes('\r\r\n')
      && [potionMerge.afterSha256,...potionMerge.successorSha256s].includes(sha256(source.replaceAll('\r\n','\n')))) {
    return beforePriorEvidence(path,source.includes('\r\n') ? potionMerge.before.replaceAll('\n','\r\n') : potionMerge.before);
  }
  if (Object.hasOwn(archive,path) && typeof source === 'string' && !source.includes('\r\r\n')) {
    const row = archive[path];
    const digest = sha256(source.replaceAll('\r\n','\n'));
    if (digest === row.sha256 || row.mergedSha256?.includes(digest)) {
      source = source.includes('\r\n') ? row.before.replaceAll('\n','\r\n') : row.before;
    }
  }
  return beforePriorEvidence(path,source);
}
