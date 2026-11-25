import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = 'repos/FurinyaWorks/Slay-the-Heavens';
const marker = '<!-- release-metadata:v1 -->';
const block = /^<!-- release-metadata:v1 -->\n```json\n([\s\S]+?)\n```[ \t]*$/m;
const sha = /^[a-f0-9]{40}$/;
const digest = /^[a-f0-9]{64}$/;
const stable = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const releaseTypes = ['major', 'minor', 'patch'];

function parts(version) {
  if (typeof version !== 'string' || !stable.test(version)) throw Error('Invalid engineering version (expected MAJOR.MINOR.PATCH)');
  return version.split('.').map(BigInt);
}

function validate(metadata) {
  const version = parts(metadata?.version);
  if (metadata.release_type !== releaseTypes[version.findLastIndex(part => part !== 0n)]) {
    throw Error('Invalid release_type for engineering version');
  }
  if (metadata.platform_version !== null &&
      (typeof metadata.platform_version !== 'string' || !metadata.platform_version.trim() ||
       metadata.platform_version !== metadata.platform_version.trim() || /[\x00-\x1f\x7f]/.test(metadata.platform_version))) {
    throw Error('Invalid platform_version (use null until confirmed)');
  }
  if (metadata.platform_version !== null && (typeof metadata.platform_evidence !== 'string' || !/^https:\/\/[^\s]+$/.test(metadata.platform_evidence))) {
    throw Error('A confirmed platform_version requires a platform_evidence URL');
  }
  if (typeof metadata.commit !== 'string' || !sha.test(metadata.commit)) throw Error('Invalid build commit SHA');
  if (typeof metadata.artifact?.sha256 !== 'string' || !digest.test(metadata.artifact.sha256) ||
      (metadata.artifact.name !== null && (typeof metadata.artifact.name !== 'string' || !metadata.artifact.name.trim()))) {
    throw Error('Invalid build artifact metadata');
  }
  return metadata;
}

export function formatMetadata(metadata) {
  return [marker, '```json', JSON.stringify(validate(metadata), null, 2), '```'].join('\n');
}

function readMetadata(body = '') {
  const source = (body ?? '').replace(/\r\n/g, '\n');
  if (!source.includes(marker)) return null;
  const match = block.exec(source);
  if (source.split(marker).length !== 2 || !match) throw Error('Expected one release metadata block');
  return validate(JSON.parse(match[1]));
}

function verifyBuild(release, metadata, commit, version) {
  if (release.prerelease || release.tag_name !== `engine-v${version}` || metadata.version !== version) {
    throw Error('GitHub Release must use the engineering tag for its build version');
  }
  if (metadata.commit !== commit) throw Error('Build commit does not match the engineering tag');
  const asset = release.assets.find(row => row.state === 'uploaded' && row.name === metadata.artifact.name);
  if (asset?.digest !== `sha256:${metadata.artifact.sha256}`) {
    throw Error('Uploaded asset digest does not match the candidate SHA-256');
  }
  return metadata;
}

export function prepareMetadata(tag, build, previous, name, candidateCommit, sha256) {
  const { version, commit } = build;
  if (tag !== `engine-v${version}` || commit !== candidateCommit) {
    throw Error('Engineering tag must match the accepted build version and commit');
  }
  const before = parts(previous), after = parts(version);
  const index = before.findIndex((part, i) => part !== after[i]);
  if (index < 0 || after[index] !== before[index] + 1n || after.slice(index + 1).some(part => part !== 0n)) {
    throw Error('Expected one SemVer increment from the previous engineering version');
  }
  if (typeof name !== 'string' || !name.trim()) throw Error('Expected an asset name for the accepted build');
  return validate({ version, platform_version: null, release_type: releaseTypes[index], commit, artifact: { name, sha256 } });
}

export function verifyMetadata(release, commit, version) {
  const metadata = readMetadata(release.body);
  if (!metadata) throw Error('Missing release metadata block');
  return verifyBuild(release, metadata, commit, version);
}

export function readMappings(releases, includeDrafts = false) {
  const mappings = new Map();
  for (const release of releases) {
    if (release.prerelease || (release.draft && !includeDrafts)) continue;
    const metadata = readMetadata(release.body);
    if (!metadata) continue;
    if (mappings.has(metadata.version)) throw Error(`Duplicate release version: ${metadata.version}`);
    mappings.set(metadata.version, { ...metadata, tag: release.tag_name, draft: release.draft, url: release.html_url });
  }
  return [...mappings.values()];
}

function github(path, ...options) {
  return execFileSync('gh', ['api', path, ...options], {
    encoding: 'utf8', timeout: 60_000, maxBuffer: 32 * 1024 * 1024,
  });
}

const githubObject = path => JSON.parse(github(path));

function readEngineeringTag(tag) {
  if (!tag.startsWith('engine-v')) throw Error('Expected an engineering tag (engine-vX.Y.Z)');
  parts(tag.slice('engine-v'.length));
  const ref = githubObject(`${repo}/git/ref/tags/${tag}`);
  if (ref.object.type !== 'tag') throw Error('Engineering tag must be annotated');
  const { object } = githubObject(`${repo}/git/tags/${ref.object.sha}`);
  if (object.type !== 'commit' || !sha.test(object.sha)) throw Error('Engineering tag must point to a build commit');
  const { content } = githubObject(`${repo}/contents/package.json?ref=${object.sha}`);
  const { version } = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  return { version, commit: object.sha };
}

function main([command, ...args]) {
  if (command === 'list' && (!args.length || (args.length === 1 && args[0] === '--include-drafts'))) {
    const rows = github(`${repo}/releases?per_page=100`, '--paginate', '--jq', '.[] | @json');
    const releases = rows.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
    return JSON.stringify(readMappings(releases, args.length === 1), null, 2);
  }
  if (command === 'prepare' && args.length === 5) {
    const [tag, previous, name, commit, sha256] = args;
    return formatMetadata(prepareMetadata(tag, readEngineeringTag(tag), previous, name, commit, sha256));
  }
  if (command === 'verify' && args.length === 1 && /^[1-9]\d*$/.test(args[0])) {
    const release = githubObject(`${repo}/releases/${args[0]}`);
    const { commit, version } = readEngineeringTag(release.tag_name);
    return formatMetadata(verifyMetadata(release, commit, version));
  }
  throw Error('Usage: release-metadata.mjs list [--include-drafts] | prepare <tag> <previous-version> <asset-name> <candidate-commit> <candidate-sha256> | verify <release-id>');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { console.log(main(process.argv.slice(2))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
