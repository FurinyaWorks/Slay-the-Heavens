import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { mediaByPath } from './ci-media-lfs.mjs';
import { frozenObjects, reviewedPngPaths, runtimePreviewObjects, runtimePreviewPaths } from './ci-reviewed-lfs.mjs';

const RAW_SAVE = /\.save(?:\.[^.\/]+)*$|(?:^|[./])runtime-snapshot(?:[./]|$)/i;
const REVIEWED_SEED = 'experiments/art-tech-lab/seed.save.json';
const MAX_GIT_BYTES = 5 * 1024 * 1024;
const blockedType = /^(?:\.env(?:\.(?!(?:example|sample|template)$).*)?|\.envrc|\.lfsconfig|id_(?:rsa|ed25519))$|\.(?:log(?:\..*)?|gil|gip|gia|key|pem|p12|pfx)$/i;
const archive = /\.(?:zip|7z|rar|tar|t[bgx]z|gz|bz2|xz|zst)$/i;
const generated = /(?:^|\/)(?:node_modules|__pycache__|\.artifacts|\.dream-loop)\/|(?:^|\/)(?:build|playtest|test-results|playwright-report)\//;
const official = new Set(['FurinyaDev/Slay-the-Heavens-Fork-A', 'v5g95m7t8m-max/Slay-the-Heavens-Fork-B']);
const knownPointers = new Map([
  ...reviewedPngPaths.map((path, i) => [path, frozenObjects[i]]),
  ...runtimePreviewPaths.map((path, i) => [path, runtimePreviewObjects[i]]),
]);

function git(args, input) {
  const result = spawnSync('git', args, { input, maxBuffer: 32 * 1024 * 1024, timeout: 45000 });
  if (result.error || result.status !== 0) throw new Error(`git ${args[0]} failed`);
  return result.stdout;
}
const utf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
const nul = value => utf8.decode(value).split('\0').filter(Boolean);
const tree = ref => new Map(nul(git(['ls-tree', '-rlz', ref])).map(record => {
  const tab = record.indexOf('\t');
  const [mode, type, oid, size] = record.slice(0, tab).trim().split(/\s+/);
  return [record.slice(tab + 1), { mode, type, oid, size: Number(size) }];
}));
const pathsMatchingLfs = paths => {
  const result = nul(git(['check-attr', '--cached', '-z', '--stdin', 'filter'], paths.map(path => path + '\0').join('')));
  return new Set(result.filter((_, i) => i % 3 === 0 && result[i + 2] === 'lfs'));
};

function readPointers(head, lfs) {
  const ids = [...new Set([...lfs].map(path => head.get(path))
    .filter(entry => entry.type === 'blob' && entry.size < 1024).map(entry => entry.oid))];
  if (!ids.length) return new Map();
  const output = git(['cat-file', '--batch'], ids.join('\n') + '\n');
  const pointers = new Map();
  let position = 0;
  for (const oid of ids) {
    const end = output.indexOf(10, position);
    const header = output.toString('ascii', position, end).split(' ');
    if (header[0] !== oid || header[1] !== 'blob' || !/^\d+$/.test(header[2])) {
      throw new Error('Invalid Git batch response');
    }
    position = end + 1 + Number(header[2]);
    if (output[position] !== 10) throw new Error('Invalid Git batch boundary');
    pointers.set(oid, output.subarray(end + 1, position++));
  }
  if (position !== output.length) throw new Error('Invalid Git batch length');
  return pointers;
}

function approvedObject(path) {
  const item = mediaByPath.get(path);
  return item ? [item.sha256, item.bytes] : knownPointers.get(path) ?? [];
}

function validPointer(path, raw) {
  const [oid, size] = approvedObject(path);
  return Boolean(oid) && raw.equals(Buffer.from(`version https://git-lfs.github.com/spec/v1\noid sha256:${oid}\nsize ${size}\n`));
}

async function checkForkSource(event) {
  const pr = event?.pull_request;
  if (!pr) return;
  const markers = (pr.body ?? '').split(/\r?\n/).filter(line => /^Fork-Source:/i.test(line));
  const external = pr.head.repo?.full_name !== pr.base.repo?.full_name;
  if (!external && !markers.length) return;
  const match = /^Fork-Source: (\S+) (refs\/heads\/\S+) ([0-9a-f]{40})$/.exec(markers[0] ?? '');
  if (markers.length !== 1 || !match || !official.has(match[1]) || match[3] !== pr.head.sha ||
      (external && match[1] !== pr.head.repo?.full_name)) {
    throw new Error('Fork promotion needs one exact Fork-Source matching the candidate HEAD and an approved fork');
  }
  const [, repo, ref, sha] = match;
  git(['check-ref-format', ref]);
  const result = git(['ls-remote', '--exit-code', `https://github.com/${repo}.git`, ref]).toString().trim();
  if (result !== `${sha}\t${ref}`) throw new Error('Fork source branch does not match the reviewed SHA');
}

const mode = process.argv[2];
const baseRef = mode === '--baseline' ? 'HEAD' : mode;
if (!baseRef || !/^[a-f0-9]{40}$|^HEAD$/.test(baseRef)) throw new Error('Pass the exact comparison SHA');
const head = tree('HEAD');
const base = tree(baseRef);
const ignored = new Set(nul(git(['ls-files', '-ci', '--exclude-per-directory=.gitignore', '-z'])));
const lfs = pathsMatchingLfs([...head.keys()]);
const pointers = readPointers(head, lfs);
const baseline = mode === '--baseline';
const exceptions = baseline ? new Map() : new Map(JSON.parse(readFileSync(new URL('../config/repository-hygiene-baseline.json', import.meta.url))).map(([oid, path]) => [path, oid]));
const violations = [];
const temporary = mkdtempSync(join(tmpdir(), 'sth-hygiene-'));
const scan = join(temporary, 'candidate');
mkdirSync(scan);
const emptyIgnore = join(temporary, 'gitleaks-ignore');
writeFileSync(emptyIgnore, '');
let changed = 0;
try {
  for (const [path, entry] of head) {
    const prior = base.get(path);
    const unchanged = prior?.oid === entry.oid && prior?.mode === entry.mode;
    const reason = [];
    if (ignored.has(path)) reason.push('tracked ignored file');
    if (blockedType.test(path.split('/').at(-1))) reason.push('prohibited file type');
    if (path !== REVIEWED_SEED && RAW_SAVE.test(path)) reason.push('raw runtime save');
    if (generated.test(path)) reason.push('generated output');
    if (archive.test(path) && !(mediaByPath.has(path) && lfs.has(path))) reason.push('unapproved archive');
    if (entry.size > MAX_GIT_BYTES) reason.push('oversize Git blob');
    if (entry.mode !== '100644' && entry.mode !== '100755') reason.push('non-regular Git entry');
    let bytes = lfs.has(path) ? pointers.get(entry.oid) : undefined;
    if (!unchanged && !bytes && entry.type === 'blob' && entry.size <= MAX_GIT_BYTES && !reason.length) {
      bytes = git(['cat-file', 'blob', entry.oid]);
    }
    const pointer = bytes?.subarray(0, 80).includes('https://git-lfs.github.com/spec/');
    if ((pointer || lfs.has(path)) && !(lfs.has(path) && bytes && validPointer(path, bytes))) {
      reason.push('unapproved or malformed LFS object');
    }
    if (reason.length) {
      if (baseline) exceptions.set(path, entry.oid);
      else if (!unchanged || exceptions.get(path) !== entry.oid) {
        violations.push(`${JSON.stringify(path)}: ${reason.join(', ')}`);
      }
    }
    if (!baseline && !unchanged && bytes && !reason.length) {
      const destination = join(scan, path);
      mkdirSync(dirname(destination), { recursive: true });
      if (lfs.has(path)) {
        // Never mistake a Git pointer for the materialized asset during secret scanning.
        const [oid, size] = approvedObject(path);
        if (/[\s,?*\[\]]/.test(path)) throw new Error('Unsafe exact LFS fetch path');
        const repository = process.env.GITHUB_REPOSITORY;
        const remote = repository && /^[\w.-]+\/[\w.-]+$/.test(repository)
          ? `https://github.com/${repository}.git/info/lfs`
          : git(['remote', 'get-url', 'origin']).toString().trim().replace(/\/?$/, '/info/lfs');
        git(['-c', 'credential.helper=', '-c', `lfs.url=${remote}`, '-c', 'lfs.transfer.maxretries=0',
          '-c', `lfs.storage=${join(temporary, 'lfs')}`, 'lfs', 'fetch', 'origin', 'HEAD', '--include', path, '--exclude', '']);
        const materialized = readFileSync(join(temporary, 'lfs', 'objects', oid.slice(0, 2), oid.slice(2, 4), oid));
        if (materialized.length !== size || createHash('sha256').update(materialized).digest('hex') !== oid) {
          throw new Error('LFS materialization did not match the exact reviewed identity');
        }
        bytes = materialized;
      }
      writeFileSync(destination, bytes);
      changed++;
    }
  }
  if (baseline) {
    const rows = [...exceptions].map(([path, oid]) => '  ' + JSON.stringify([oid, path]));
    process.stdout.write('[\n' + rows.join(',\n') + '\n]\n');
  } else {
    if (violations.length) throw new Error(violations.join('\n'));
    const event = process.env.GITHUB_EVENT_PATH && JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH));
    await checkForkSource(event);
    if (changed) {
      const leak = spawnSync(process.env.GITLEAKS_BIN ?? 'gitleaks', [
        'dir', '--no-banner', '--redact=100', '--log-level=error', '--max-decode-depth=2', '--max-archive-depth=2',
        '--ignore-gitleaks-allow', '--gitleaks-ignore-path', emptyIgnore, '--config', join(import.meta.dirname, 'repository-hygiene-gitleaks.toml'), scan,
      ], { stdio: 'ignore', timeout: 60000 });
      if (leak.error || leak.status !== 0) throw new Error('Gitleaks found a credential candidate or could not complete the scan');
    }
    console.log(`Repository hygiene passed; scanned ${changed} changed files`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
