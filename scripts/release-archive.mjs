import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { githubRequest, verifyReleaseFull } from './release-ci.mjs';
import { readMetadata } from './release-metadata.mjs';
import { requireReleasePerformance } from './runtime-baseline/require-release-performance.mjs';
import { sha256, verifyGilArtifact } from './runtime-baseline/release-performance-artifacts.mjs';

const repository = 'FurinyaWorks/Slay-the-Heavens';
const repo = `/repos/${repository}`;
const sha = /^[a-f0-9]{40}$/;
const gilName = /^[A-Za-z0-9][A-Za-z0-9._-]{0,100}\.gil$/;
const validId = id => Number.isSafeInteger(id) && id > 0;
const bindingFields = ['id', 'runId', 'attempt', 'digest', 'controllerSha', 'gilSha256',
  'buildId', 'payloadDigest', 'receiptSha256', 'manifestSha256'];

async function readTarget(request, releaseId) {
  const release = await request(`${repo}/releases/${releaseId}`);
  assert(release?.id === releaseId && release.prerelease === false && Array.isArray(release.assets),
    'Expected the exact non-prerelease GitHub Release');
  const metadata = readMetadata(release.body);
  assert(metadata && metadata.platform_version !== null && validId(metadata.artifact.actions_id) &&
    gilName.test(metadata.artifact.name ?? ''), 'Release must record the confirmed platform result and exact approved GIL artifact');
  const tag = `engine-v${metadata.version}`;
  assert.equal(release.tag_name, tag, 'GitHub Release must use its engineering tag');
  const ref = await request(`${repo}/git/ref/tags/${tag}`);
  assert(ref.ref === `refs/tags/${tag}` && ref.object?.type === 'tag' && sha.test(ref.object.sha),
    'Expected an existing annotated engineering tag');
  const tagSha = ref.object.sha;
  const annotated = await request(`${repo}/git/tags/${tagSha}`);
  assert(annotated.sha === tagSha && annotated.tag === tag && annotated.object?.type === 'commit' &&
    annotated.object.sha === metadata.commit, 'Engineering tag must resolve to the approved GIL build commit');
  return { release, target: { metadata, tag, tagSha } };
}

async function resolveFrozenBranch(request, { commit, version }) {
  const branches = [`release/v${version}`, `hotfix/v${version}`];
  const matches = await Promise.all(branches.map(async branch => {
    const refs = await request(`${repo}/git/matching-refs/heads/${branch}`);
    assert(Array.isArray(refs), 'Missing frozen source branch information');
    return refs.some(ref => ref.ref === `refs/heads/${branch}` && ref.object?.type === 'commit' &&
      ref.object.sha === commit) ? branch : null;
  }));
  const frozen = matches.filter(Boolean);
  assert.equal(frozen.length, 1, 'Expected one frozen Release or Hotfix branch at the approved GIL commit');
  return frozen[0];
}

function ensureSource(head) {
  execFileSync('git', ['fetch', '--no-tags', '--depth=1', '--filter=blob:none', 'origin', head],
    { encoding: 'utf8', timeout: 120_000 });
}

function existingAsset(assets, name, digest, bytes) {
  const gilAssets = assets.filter(asset => /\.gil$/i.test(asset.name));
  if (!gilAssets.length) return null;
  const asset = gilAssets[0];
  assert(gilAssets.length === 1 && asset.name === name && asset.state === 'uploaded' && validId(asset.id) &&
    asset.digest === `sha256:${digest}` && asset.size === bytes,
    'Release already contains a different or incomplete GIL asset');
  return asset;
}

async function uploadGil(releaseId, name, bytes) {
  const url = new URL(`https://uploads.github.com${repo}/releases/${releaseId}/assets`);
  url.searchParams.set('name', name);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GH_TOKEN || process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: bytes,
    signal: AbortSignal.timeout(120_000),
  });
  if (response.status !== 201) throw Error(`Release asset upload failed: HTTP ${response.status}`);
  return response.json();
}

export async function archiveRelease(releaseId, {
  request = githubRequest, prepareSource = ensureSource, verifyFull = verifyReleaseFull,
  verifyPerformance = requireReleasePerformance, readGil = verifyGilArtifact, upload = uploadGil,
} = {}) {
  assert(validId(releaseId), 'GitHub Release numeric ID required');
  const { target } = await readTarget(request, releaseId);
  const { metadata } = target;
  const { actions_id: artifactId, name, sha256: digest } = metadata.artifact;
  const head = metadata.commit;
  const branch = await resolveFrozenBranch(request, metadata);
  const { binding, gilBytes } = await readGil(request, artifactId, { head, branch, version: metadata.version });
  assert(Buffer.isBuffer(gilBytes) && gilBytes.length > 0 && sha256(gilBytes) === digest &&
    binding.id === artifactId && binding.gilSha256 === digest, 'Downloaded artifact differs from the platform-approved GIL');

  await prepareSource(head);
  const full = await verifyFull(repository, branch, head, request);
  const performance = await verifyPerformance(full, request);
  assert.equal(binding.custody, performance.gil?.custody, 'Formal performance approved a different GIL custody path');
  for (const key of bindingFields) {
    assert(binding[key] !== undefined && binding[key] === performance.gil?.[key],
      `Formal performance approved a different GIL archive identity: ${key}`);
  }

  const readCurrent = async () => {
    const current = await readTarget(request, releaseId);
    assert.deepEqual(current.target, target, 'Release approval or engineering tag changed during archival');
    return current.release;
  };
  const assetFrom = release => existingAsset(release.assets, name, digest, gilBytes.length);
  const receipt = (asset, existing) => ({
    releaseId, sourceCommit: head, branch, artifactId, sha256: digest, assetId: asset.id, assetName: asset.name, existing,
  });
  const current = await readCurrent();
  const prior = assetFrom(current);
  if (prior) return receipt(prior, true);
  assert.equal(current.draft, true, 'Archive the approved GIL before publishing the GitHub Release');

  let uploaded;
  try {
    uploaded = await upload(releaseId, name, gilBytes);
  } catch (error) {
    const recovered = assetFrom(await readCurrent());
    if (recovered) return receipt(recovered, true);
    throw error;
  }
  const stored = assetFrom(await readCurrent());
  assert(stored && stored.id === uploaded?.id, 'GitHub Release asset readback does not match the uploaded GIL');
  return receipt(stored, false);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [id, ...extra] = process.argv.slice(2);
    if (!/^[1-9][0-9]*$/.test(id ?? '') || extra.length) throw Error('Usage: release-archive.mjs <release-id>');
    const receipt = await archiveRelease(Number(id));
    const line = JSON.stringify(receipt);
    console.log(line);
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\`\`\`json\n${line}\n\`\`\`\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
