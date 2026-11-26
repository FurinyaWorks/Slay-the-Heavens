import { lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { sha256 } from './evidence-files.mjs';
import { requireGate } from './gil-candidate-preflight.mjs';

const mib = 1024 ** 2;
const limits = { base: 64 * mib, intermediate: 64 * mib, candidate: 64 * mib, fullReceipt: 2 * mib, audioReceipt: 2 * mib };
const bundleLimit = Object.values(limits).reduce((total, size) => total + Math.ceil(size / 3) * 4, 1024);
export const localGilRecord = bytes => ({ bytes: bytes.length, sha256: sha256(bytes) });

function boundedFile(path, limit) {
  const file = lstatSync(path);
  requireGate(file.isFile() && file.size > 0 && file.size <= limit, 'Local GIL input is missing or exceeds its transport budget.');
  return readFileSync(path);
}

export function writeLocalGilBundle(destination, paths, verify) {
  const files = Object.fromEntries(Object.entries(limits).map(([name, limit]) => [name, boundedFile(paths[name], limit)]));
  const identity = { baseSha256: sha256(files.base), candidateSha256: sha256(files.candidate) };
  verify(files, identity);
  const encoded = Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, bytes.toString('base64')]));
  const bytes = Buffer.from(JSON.stringify(encoded));
  writeFileSync(destination, bytes, { flag: 'wx', mode: 0o600 });
  return { ...identity, bundleSha256: sha256(bytes) };
}

export function readLocalGilBundle(path, authorizedSha256) {
  const raw = boundedFile(path, bundleLimit);
  requireGate(sha256(raw) === authorizedSha256, 'Private local GIL bundle SHA-256 differs from the approved digest.');
  const encoded = JSON.parse(raw);
  requireGate(encoded && Object.keys(encoded).length === Object.keys(limits).length, 'Unexpected local GIL bundle inventory.');
  return Object.fromEntries(Object.entries(limits).map(([name, limit]) => {
    const value = encoded[name];
    requireGate(typeof value === 'string' && value.length > 0 && value.length <= Math.ceil(limit / 3) * 4,
      'Local GIL bundle field is missing or oversized.');
    const bytes = Buffer.from(value, 'base64');
    requireGate(bytes.length <= limit && bytes.toString('base64') === value, 'Malformed local GIL bundle field.');
    return [name, bytes];
  }));
}

export async function downloadLocalGilBundle(rawUrl, destination, digest, download = fetch) {
  requireGate(rawUrl, 'Missing protected GIL_LOCAL_BUILD_URL.');
  const url = new URL(rawUrl);
  requireGate(url.protocol === 'https:' && !url.username && !url.password, 'Local GIL bundle URL must use HTTPS without userinfo.');
  const response = await download(url, { redirect: 'error', signal: AbortSignal.timeout(300000) });
  requireGate(response.ok && response.body, 'Private local GIL bundle download failed.');
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    requireGate(total <= bundleLimit, 'Private local GIL bundle exceeds its transport budget.');
    chunks.push(chunk);
  }
  const bytes = Buffer.concat(chunks, total);
  requireGate(sha256(bytes) === digest, 'Private local GIL bundle SHA-256 differs from the approved digest.');
  writeFileSync(destination, bytes, { flag: 'wx', mode: 0o600 });
}
