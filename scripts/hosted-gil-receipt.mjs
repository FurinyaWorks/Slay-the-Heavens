import { dirname, isAbsolute, join, posix, relative, resolve } from 'node:path';
import { fileRecord, inside } from './evidence-files.mjs';

const schema = 'github-actions-gil-v1';
const paths = { source: 'src/scene-save.mjs', helper: 'scripts/native-client-check.mjs' };
const normalize = path => path.replaceAll('\\', '/');

function relativeFile(root, row) {
  return row && { ...row, path: normalize(relative(root, inside(root, row.path))) };
}

function assetReceipt(root, value, pickFile) {
  return value && { ...value, inputs: value.inputs.map(row => pickFile(root, row)) };
}

export function hostedGilReceipt(root, fullRoot, full, audio, candidate, sourceBranch, {
  pickFile = relativeFile, pathOf = path => fileRecord(path).path,
} = {}) {
  const { sourcePath, helperPath, ...toolchain } = audio.toolchainIdentity;
  const encoderInputs = full.inputs.slice(-2);
  const buildPaths = [sourcePath, helperPath].map(pathOf);
  if (encoderInputs.length !== 2 || !encoderInputs.every((row, index) => row.path === buildPaths[index])) {
    throw Error('Hosted receipt encoder input provenance differs from the native build');
  }
  const { modules, layout, templates } = audio.productionManifest;
  return {
    receiptSchema: schema, sourceCommit: audio.sourceCommit, sourceBranch, sourceDirty: false,
    buildId: audio.buildId, startedAt: audio.startedAt, payloadDigest: audio.payloadDigest, release: audio.release,
    candidate, mapPath: candidate.path, sha256: candidate.sha256, liveWriteEnabled: false,
    artFeatures: audio.artFeatures, officialAssetsProfile: audio.officialAssetsProfile,
    refinedReleaseMonsterArt: audio.refinedReleaseMonsterArt, uiProfile: audio.uiProfile,
    nativeMonsterArt: audio.nativeMonsterArt, monsterActors: audio.monsterActors, deckBrowser: audio.deckBrowser,
    officialPortraits: assetReceipt(root, audio.officialPortraits, pickFile),
    officialBackground: assetReceipt(root, audio.officialBackground, pickFile), readyCardArt: assetReceipt(root, audio.readyCardArt, pickFile),
    toolchainIdentity: { ...toolchain, sourcePath: paths.source, helperPath: paths.helper },
    // The legacy startup payload hash includes these two local build-time
    // path strings. Only their labels are shipped. Checks open local files.
    encoderPayloadPaths: encoderInputs.map(row => row.path),
    nativeScriptStorage: audio.nativeScriptStorage, moduleDigests: audio.moduleDigests,
    productionManifest: {
      modules: modules.map(row => pickFile(fullRoot, row)),
      layout: pickFile(fullRoot, layout), templates: pickFile(fullRoot, templates),
    },
    staticCheck: 'pass', moduleReadback: 'pass',
    bgmGraphReadback: { id: audio.compiled.written[0].graphId, status: 'pass' },
  };
}

// Archived paths are labels from the local receipt. Never open them on the runner.
export function importedGilReceipt(full, audio, candidate, sourceBranch) {
  const helper = normalize(audio.toolchainIdentity.helperPath);
  if (!helper.endsWith('/' + paths.helper)) throw Error('Invalid local source checkout label');
  const root = helper.slice(0, -paths.helper.length - 1);
  const fullRoot = posix.dirname(normalize(full.receiptPath));
  const pickFile = (directory, row) => {
    if (!row) return row;
    const path = normalize(row.path);
    if (path.includes('\0') || path.split('/').some(part => part === '.' || part === '..') ||
      !path.startsWith(directory + '/') || path === directory + '/') throw Error('Invalid local receipt path label');
    return { ...row, path: path.slice(directory.length + 1) };
  };
  return hostedGilReceipt(root, fullRoot, full, audio, candidate, sourceBranch, { pickFile, pathOf: path => path });
}

// The private transport binds the original labels. The public receipt uses
// fixed labels so an archived payload can be rechecked without workstation paths.
export function localArchiveReceipt(receipt, verifiedInputs, digestInputs) {
  const encoderPayloadPaths = ['/release/encoder/' + paths.source, '/release/source/' + paths.helper];
  const encoderInputs = verifiedInputs.slice(-2);
  if (encoderInputs.length !== 2 || !encoderInputs.every((row, index) => row.path === receipt.encoderPayloadPaths[index])) {
    throw Error('Local payload encoder labels differ from the verified inventory');
  }
  const portableInputs = [...verifiedInputs.slice(0, -2),
    ...encoderInputs.map((row, index) => ({ ...row, path: encoderPayloadPaths[index] }))];
  return { ...receipt, encoderPayloadPaths, payloadDigest: digestInputs(portableInputs) };
}

export function hostedCandidatePath(receiptFile, receipt) {
  if (receipt.receiptSchema !== schema) return receipt.candidate.path;
  if (receipt.candidate.path !== 'candidate.gil') throw Error('Unexpected candidate filename in the hosted receipt');
  const folder = dirname(resolve(receiptFile));
  return inside(folder, join(folder, receipt.candidate.path));
}

export function verifiedPayloadInputs(root, receipt, options, collect, toolRoot = process.env.MILIASTRA_MCP_ROOT) {
  if (receipt.receiptSchema !== schema) return collect(root, options);
  const toolchain = options.toolchainIdentity;
  const labels = receipt.encoderPayloadPaths;
  if (!toolRoot || toolchain?.sourcePath !== paths.source || toolchain?.helperPath !== paths.helper
    || !Array.isArray(labels) || labels.length !== 2 || !labels.every((path, index) =>
      typeof path === 'string' && path.length <= 1024 && (isAbsolute(path) || /^[A-Za-z]:[\\/]/.test(path))
      && normalize(path).endsWith('/' + Object.values(paths)[index]))) {
    throw Error('Hosted GIL requires the pinned MCP toolchain at MILIASTRA_MCP_ROOT');
  }
  const rebased = { ...toolchain, sourcePath: resolve(toolRoot, paths.source), helperPath: resolve(root, paths.helper) };
  const inputs = collect(root, { ...options, toolchainIdentity: rebased });
  const encoder = inputs.slice(-2);
  if (encoder[0]?.path !== fileRecord(rebased.sourcePath).path || encoder[1]?.path !== fileRecord(rebased.helperPath).path) {
    throw Error('Hosted GIL encoder input identity differs from the source checkout');
  }
  return [...inputs.slice(0, -2), ...encoder.map((row, index) => ({ ...row, path: labels[index] }))];
}
