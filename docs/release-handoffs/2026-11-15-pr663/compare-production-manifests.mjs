// Read-only release triage. Usage:
// node compare-production-manifests.mjs <older-final-candidate.json> <newer-final-candidate.json>
// Compares offline serialized representations, NOT the official 20 MB panel.
// Keep source GILs, screenshots and full receipts in restricted release storage.
import { readFileSync } from 'node:fs';

const digest = /^[a-f0-9]{64}$/;
const requireValue = (cond, label) => { if (!cond) throw new Error(label); };
const record = (value, label) => {
  requireValue(value && Number.isSafeInteger(value.bytes) && value.bytes > 0
    && digest.test(value.sha256), 'Invalid or missing ' + label);
  return { bytes: value.bytes, sha256: value.sha256 };
};

function readCandidate(path) {
  const r = JSON.parse(readFileSync(path, 'utf8'));
  requireValue(/^[a-f0-9]{40}$/.test(r.sourceCommit) && r.sourceDirty === false
    && typeof r.buildId === 'string' && r.buildId.trim()
    && digest.test(r.payloadDigest), 'Candidate must have clean-source and build identity');
  const candidate = record(r.candidate, 'candidate');
  requireValue(r.sha256 === candidate.sha256, 'Expected post-audio receipt with matching SHA');
  const m = r.productionManifest;
  requireValue(Array.isArray(m?.modules) && m.modules.length, 'Missing production module manifest');
  const modules = new Map();
  for (const row of m.modules) {
    requireValue(typeof row.name === 'string' && /^[a-zA-Z0-9_.-]+$/.test(row.name)
      && !modules.has(row.name), 'Missing/duplicate module name');
    modules.set(row.name, record(row, 'module ' + row.name));
  }
  return {
    identity: { sourceCommit: r.sourceCommit, buildId: r.buildId, candidateSha256: candidate.sha256,
      payloadDigest: r.payloadDigest },
    outputs: { finalGil: candidate, generatedLayout: record(m.layout, 'layout'),
      generatedTemplates: record(m.templates, 'templates') },
    modules,
  };
}

const size = row => row?.bytes ?? 0;
const delta = (a, b) => ({ before: size(a), after: size(b), delta: size(b) - size(a),
  changedHash: a?.sha256 !== b?.sha256 });
const sum = rows => [...rows].reduce((n, row) => n + row.bytes, 0);

try {
  const args = process.argv.slice(2);
  requireValue(args.length === 2, 'Supply two final candidate.json files');
  const [a, b] = args.map(readCandidate);
  const names = [...new Set([...a.modules.keys(), ...b.modules.keys()])].sort();
  const modules = names.filter(name => name !== 'abyss_ui')
    .map(name => ({ name, ...delta(a.modules.get(name), b.modules.get(name)) }))
    .filter(row => row.changedHash)
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
  console.log(JSON.stringify({
    measurement: 'offline-bytes-only; representations are not additive',
    before: a.identity, after: b.identity,
    mappedLuaBytes: {before: sum(a.modules.values()), after: sum(b.modules.values())},
    offBuildMarkerModules: modules,
    startupModule: delta(a.modules.get('abyss_ui'), b.modules.get('abyss_ui')),
    startupCaveat: 'abyss_ui includes ABYSS_BUILD identity; differing hash alone is not a gameplay change',
    ...Object.fromEntries(Object.keys(a.outputs).map(key => [key, delta(a.outputs[key], b.outputs[key])])),
  }, null, 2));
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
