import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { restoreExactFixtureHunks } from './exact-fixture-hunks.mjs';

const content = readFileSync(new URL('../fixtures/version-governance-source.json', import.meta.url), 'utf8').replaceAll('\r\n', '\n');
if (createHash('sha256').update(content).digest('hex') !== '1ce991df0a0336edcec033c69e7192407708cf9d74d3e1b7c76145af48bff252') {
  throw new Error('Exact pre-governance tool evidence differs');
}
const proofs = JSON.parse(content);

export function beforeVersionGovernanceSource(path, source) {
  return Object.hasOwn(proofs, path) ? restoreExactFixtureHunks(proofs[path], path, source) : source;
}
