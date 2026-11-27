import assert from 'node:assert/strict';
import test from 'node:test';
import { archiveRelease } from '../scripts/release-archive.mjs';
import { formatMetadata, prepareMetadata } from '../scripts/release-metadata.mjs';
import { sha256 } from '../scripts/runtime-baseline/release-performance-artifacts.mjs';

const repo = '/repos/FurinyaWorks/Slay-the-Heavens';
const releaseId = 10;
const id = 20;
const name = 'Slay-the-Heavens-v2.2.0.gil';
const version = '2.2.0';
const tag = 'engine-v2.2.0';
const tagSha = 'a'.repeat(40);
const head = 'b'.repeat(40);
const branch = 'release/v2.2.0';
const bytes = Buffer.from('audited and accepted GIL fixture');
const digest = sha256(bytes);

function fixture() {
  const metadata = { ...prepareMetadata(tag, { version, commit: head }, '2.1.1', name, head, digest, id),
    platform_version: '2.03', platform_evidence: 'https://example.com/published-candidate' };
  const release = { id: releaseId, draft: true, prerelease: false, tag_name: tag, assets: [] };
  const tagRef = { ref: `refs/tags/${tag}`, object: { type: 'tag', sha: tagSha } };
  const annotated = { sha: tagSha, tag, object: { type: 'commit', sha: head } };
  const asset = { id: 30, name, state: 'uploaded', size: bytes.length, digest: `sha256:${digest}` };
  const binding = { id, runId: 40, attempt: 1, digest: `sha256:${'c'.repeat(64)}`, controllerSha: 'd'.repeat(40),
    gilSha256: digest, buildId: 'e', payloadDigest: 'f'.repeat(64), receiptSha256: '1'.repeat(64), manifestSha256: '2'.repeat(64) };
  const performance = { gil: { ...binding } };
  const artifact = { binding, gilBytes: bytes };
  const full = {};
  const uploads = [];
  const api = {
    [`/releases/${releaseId}`]: () => ({ ...release, body: formatMetadata(metadata) }),
    [`/git/ref/tags/${tag}`]: () => tagRef,
    [`/git/tags/${tagSha}`]: () => annotated,
    [`/git/matching-refs/heads/${branch}`]: () => [{ ref: `refs/heads/${branch}`, object: { type: 'commit', sha: head } }],
    [`/git/matching-refs/heads/hotfix/v${version}`]: () => [],
  };
  const request = async path => {
    assert(path.startsWith(repo));
    assert(api[path.slice(repo.length)], `Unexpected API path ${path}`);
    return api[path.slice(repo.length)]();
  };
  const dependencies = {
    request,
    prepareSource: source => assert.equal(source, head),
    verifyFull: async (...args) => {
      assert.deepEqual(args, [repo.slice('/repos/'.length), branch, head, request]);
      return full;
    },
    verifyPerformance: async (...args) => {
      assert.deepEqual(args, [full, request]);
      return performance;
    },
    readGil: async (...args) => {
      assert.deepEqual(args, [request, id, { head, branch, version }]);
      return artifact;
    },
    upload: async (...args) => {
      assert.deepEqual(args, [releaseId, name, bytes]);
      uploads.push(args);
      release.assets.push(asset);
      return asset;
    },
  };
  return { metadata, release, tagRef, annotated, asset, artifact, performance, uploads, dependencies };
}

test('archive copies the exact approved GIL once and verifies the same attached asset on retry', async () => {
  const f = fixture();
  const result = await archiveRelease(releaseId, f.dependencies);
  assert.deepEqual(result, { releaseId, sourceCommit: head, branch, artifactId: id, sha256: digest,
    assetId: f.asset.id, assetName: name, existing: false });
  assert.deepEqual(await archiveRelease(releaseId, f.dependencies), { ...result, existing: true });
  assert.equal(f.uploads.length, 1);
  assert.equal(f.release.draft, true);
});

test('archive rejects missing human platform confirmation or an Actions artifact ID', async () => {
  for (const change of [metadata => { metadata.platform_version = null; }, metadata => { delete metadata.artifact.actions_id; }]) {
    const f = fixture();
    change(f.metadata);
    await assert.rejects(archiveRelease(releaseId, f.dependencies), /confirmed platform result and exact approved GIL/);
    assert.equal(f.uploads.length, 0);
  }
});

test('archive rejects substituted bytes and another artifact with the same GIL digest', async () => {
  const f = fixture();
  f.artifact.gilBytes = Buffer.from('another GIL');
  await assert.rejects(archiveRelease(releaseId, f.dependencies), /Downloaded artifact differs/);
  f.artifact.gilBytes = bytes;
  f.performance.gil.id++;
  await assert.rejects(archiveRelease(releaseId, f.dependencies), /different GIL archive identity: id/);
  assert.equal(f.uploads.length, 0);
});

test('archive binds release metadata and annotated tag across source and performance verification', async () => {
  const f = fixture();
  const verify = f.dependencies.verifyPerformance;
  f.dependencies.verifyPerformance = async (...args) => {
    f.metadata.platform_evidence = 'https://example.com/another-approval';
    return verify(...args);
  };
  await assert.rejects(archiveRelease(releaseId, f.dependencies), /approval or engineering tag changed/);
  f.annotated.object.sha = '3'.repeat(40);
  await assert.rejects(archiveRelease(releaseId, f.dependencies), /approved GIL build commit/);
  assert.equal(f.uploads.length, 0);
});

test('archive preserves conflicting assets and refuses writes to a published Release', async () => {
  const f = fixture();
  f.release.assets.push({ ...f.asset, digest: 'sha256:' + '3'.repeat(64) });
  await assert.rejects(archiveRelease(releaseId, f.dependencies), /different or incomplete GIL asset/);
  f.release.assets.length = 0;
  f.release.draft = false;
  await assert.rejects(archiveRelease(releaseId, f.dependencies), /before publishing/);
  assert.equal(f.uploads.length, 0);
});

test('archive reconciles a lost upload response only with exact remote bytes', async () => {
  const f = fixture();
  const upload = f.dependencies.upload;
  f.dependencies.upload = async (...args) => {
    await upload(...args);
    throw Error('connection lost');
  };
  assert.equal((await archiveRelease(releaseId, f.dependencies)).existing, true);
  assert.equal(f.uploads.length, 1);

  const wrong = fixture();
  wrong.dependencies.upload = async () => wrong.asset;
  await assert.rejects(archiveRelease(releaseId, wrong.dependencies), /asset readback/);
});
