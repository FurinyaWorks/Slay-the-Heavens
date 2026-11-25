import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMetadata, prepareMetadata, readMappings, verifyMetadata } from '../scripts/release-metadata.mjs';

const commit = 'a'.repeat(40);
const sha256 = 'b'.repeat(64);
const version = '2.0.1';
const release = {
  tag_name: 'engine-v2.0.1',
  draft: true,
  prerelease: false,
  html_url: 'https://github.com/example/game/releases/tag/engine-v2.0.1',
  assets: [{ name: 'game.gil', state: 'uploaded', digest: `sha256:${sha256}` }],
};
const pending = {
  version, platform_version: null, release_type: 'patch', commit,
  artifact: { name: 'game.gil', sha256 },
};

test('a pure patch can prepare pending metadata while the platform chooses its own number', () => {
  const build = { commit, version };
  assert.deepEqual(prepareMetadata(release.tag_name, build, '2.0.0', 'game.gil', commit, sha256), pending);
  assert.throws(() => prepareMetadata(release.tag_name, build, '1.9.9', 'game.gil', commit, sha256), /SemVer increment/);
  assert.throws(() => prepareMetadata(release.tag_name, build, '2.0.0', 'game.gil', 'c'.repeat(40), sha256), /build version and commit/);

  assert.throws(() => formatMetadata({ ...pending, platform_version: '2.7.0' }), /platform_evidence/);
  for (const invalid of ['https://?', 'https://exa mple.com', 'http://example.com/receipt']) {
    assert.throws(() => formatMetadata({ ...pending, platform_version: '2.7.0', platform_evidence: invalid }), /platform_evidence/);
  }
  const confirmed = { ...pending, platform_version: '2.7.0', platform_evidence: 'https://example.com/receipt' };
  assert.deepEqual(verifyMetadata({ ...release, body: formatMetadata(confirmed) }, commit, version), confirmed);
});

test('minor and major increments reset lower components', () => {
  for (const [previous, version, type] of [['2.0.1', '2.1.0', 'minor'], ['0.10.1', '1.0.0', 'major']]) {
    const result = prepareMetadata(`engine-v${version}`, { commit, version }, previous, 'game.gil', commit, sha256);
    assert.equal(result.release_type, type);
  }
  assert.throws(() => prepareMetadata('engine-v2.1.1', { commit, version: '2.1.1' }, '2.0.1',
    'game.gil', commit, sha256), /SemVer increment/);
});

test('metadata must match the engineering tag, build version and uploaded asset', () => {
  const tagged = { ...release, body: formatMetadata(pending) };
  assert.throws(() => verifyMetadata(tagged, 'd'.repeat(40), version), /commit/);
  assert.throws(() => verifyMetadata(tagged, commit, '2.0.0'), /tag/);
  assert.throws(() => verifyMetadata({ ...tagged, assets: [] }, commit, version), /asset digest/);
  assert.throws(() => formatMetadata({ ...pending, version: '02.0.1' }), /version/);
  assert.throws(() => formatMetadata({ ...pending, release_type: 'minor' }), /release_type/);
  assert.throws(() => formatMetadata({ ...pending, platform_version: '' }), /platform_version/);
});

test('reader accepts marked published records and opt-in historical drafts', () => {
  const published = { ...release, draft: false, body: formatMetadata(pending).replaceAll('\n', '\r\n') };
  const historical = {
    ...release,
    tag_name: 'v2.1.0',
    body: formatMetadata({
      version: '2.0.0', platform_version: '2.1.0', release_type: 'major', commit,
      platform_evidence: 'https://example.com/receipt', artifact: { name: null, sha256 },
    }),
  };
  const rows = [published, historical, { ...published, prerelease: true }, { body: 'legacy notes' }];
  assert.deepEqual(readMappings(rows).map(row => row.version), ['2.0.1']);
  assert.deepEqual(readMappings(rows, true).map(row => [row.version, row.platform_version, row.tag, row.draft]),
    [['2.0.1', null, 'engine-v2.0.1', false], ['2.0.0', '2.1.0', 'v2.1.0', true]]);
  assert.throws(() => readMappings([published, published]), /Duplicate release version/);
  assert.throws(() => readMappings([{ ...published, body: published.body + published.body }]), /metadata block/);
  assert.throws(() => readMappings([{ ...published, body: '<!-- release-metadata:v1 -->' }]), /metadata block/);
});
