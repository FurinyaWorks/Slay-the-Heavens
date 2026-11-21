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
  '9255ef86ccf318fbdfdecab72a04a3c58eac729c612d691d2b35604cc737b546');
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

export function beforeV2UiEvidence(path, source) {
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
