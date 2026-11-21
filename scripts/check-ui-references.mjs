import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { posix, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inside, sha256 } from './evidence-files.mjs';
import { indexPath, tablePath, renderTable } from './render-ui-reference-table.mjs';

const statuses = new Set(['APPROVED', 'CURRENT_IMPLEMENTATION', 'NEEDS_REF', 'SUPERSEDED', 'REJECTED']);
const retired = row => ['SUPERSEDED', 'REJECTED'].includes(row.status);
const eligible = row => Boolean(row.reference && !retired(row));
const scope = ({targetVersion, codePath, state}) => [targetVersion, codePath, state].join(' ');
const identity = row => scope(row) + ' ' + row.revision;
const id = /^[\w.-]+$/;
const repoPath = value => typeof value === 'string' && /^[\w./-]+$/.test(value) &&
  value.split('/').every(part => part && part !== '..' && part !== '.');
const requireValue = (value, message) => { if (!value) throw new Error(message); };
const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
const git = (...args) => execFileSync('git', args, {encoding:'utf8', maxBuffer:64 * 1024 * 1024});

function referenceHash(root, path) {
  const file = inside(root, resolve(root, path));
  requireValue(statSync(file).isFile(), 'not a regular file');
  const bytes = readFileSync(file);
  const text = bytes.toString('utf8');
  const pointer = /^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize ([1-9]\d*)\n$/.exec(text);
  if (pointer) {
    const record = readJson(resolve(root, 'docs/legal/assets.json')).files[path];
    requireValue(record?.sha256 === pointer[1] && (record.bytes ?? record.lfsBytes) === Number(pointer[2]),
      'unreviewed LFS pointer');
    return pointer[1];
  }
  return sha256(/\.(?:md|html|css|js|mjs|json|svg|txt)$/i.test(path) ? text.replaceAll('\r\n', '\n') : bytes);
}

export function parseIndex({ references }) {
  requireValue(Array.isArray(references) && references.length, 'UI reference index is empty');
  const approved = new Set(), screens = new Set(), entries = new Map();
  for (const row of references) {
    const {codePath, codePaths = [], retiredCodePaths = [], themeKeys = [], targetVersion, state, revision, status,
      backlogTask, reference, supersedes, source, acceptanceScreen} = row;
    const key = identity(row), group = scope(row);
    requireValue(repoPath(codePath) && Array.isArray(codePaths) && codePaths.every(repoPath) &&
      Array.isArray(retiredCodePaths) && retiredCodePaths.every(path => repoPath(path) && ![codePath, ...codePaths].includes(path)) &&
      Array.isArray(themeKeys) && themeKeys.every(key => id.test(key)) &&
      /^v\d+\.\d+\.\d+$/.test(targetVersion) && id.test(state) && id.test(revision) &&
      statuses.has(status) && /^TASK-\d+(?:\.\d+)*$/.test(backlogTask) &&
      Array.isArray(supersedes) && supersedes.every(value => id.test(value)) &&
      (!source || /^https:\/\/[^\s()<>"']+$/.test(source)), 'Invalid UI reference entry: ' + key);
    requireValue(reference === null
      ? status === 'NEEDS_REF' || status === 'CURRENT_IMPLEMENTATION'
      : repoPath(reference?.path) && /^[a-f0-9]{64}$/.test(reference?.sha256) && status !== 'NEEDS_REF',
    'Invalid reference path or digest: ' + key);
    requireValue(!entries.has(key), 'Duplicate UI design revision: ' + key);
    entries.set(key, row);
    if (acceptanceScreen) {
      const screen = targetVersion + ' ' + acceptanceScreen;
      requireValue(id.test(acceptanceScreen) && status === 'APPROVED' && !screens.has(screen),
        'Invalid acceptance screen mapping: ' + screen);
      screens.add(screen);
    }
    if (status === 'APPROVED') {
      requireValue(!approved.has(group), 'Multiple APPROVED UI references: ' + group);
      approved.add(group);
    }
  }
  for (const row of references) for (const revision of row.supersedes) {
    const previous = entries.get(scope(row) + ' ' + revision);
    requireValue(previous?.status === 'SUPERSEDED' && revision !== row.revision,
      'Invalid supersedes link: ' + identity(row) + ' → ' + revision);
  }
  return references;
}

export function loadUiReferences(root = '.') {
  const rows = parseIndex(readJson(resolve(root, indexPath)));
  const inactive = rows.filter(retired);
  for (const row of rows) {
    if (row.reference) {
      let actual;
      try { actual = referenceHash(root,row.reference.path); }
      catch (error) { throw new Error('Missing or invalid UI reference ' + row.reference.path + ': ' + error.message); }
      requireValue(actual === row.reference.sha256, 'UI reference SHA-256 mismatch: ' + row.reference.path);
    }
    if (eligible(row)) {
      requireValue(!inactive.some(({reference}) => reference.path === row.reference.path || reference.sha256 === row.reference.sha256),
        'Retired UI reference reused as an effective baseline: ' + identity(row));
      for (const path of row.retiredCodePaths ?? []) {
        requireValue(!existsSync(resolve(root, path)), 'Retired UI component still exists: ' + path);
      }
      for (const path of [row.codePath, ...(row.codePaths ?? [])]) {
        requireValue(statSync(inside(root, resolve(root, path))).isFile(), 'Invalid UI component: ' + path);
      }
    }
  }
  return rows;
}

export function guardHistory(before, after) {
  const revisions = new Map(after.map(row => [identity(row), row]));
  for (const old of before.filter(row => eligible(row) || retired(row))) {
    const current = revisions.get(identity(old));
    requireValue(current && isDeepStrictEqual(current.reference, old.reference),
      'UI reference removed or replaced in place: ' + identity(old));
    if (retired(old)) requireValue(retired(current), 'Retired UI revision reactivated: ' + identity(old));
    if (eligible(old) && old.status !== current.status) {
      requireValue(current.status === 'SUPERSEDED' && after.some(row =>
        scope(row) === scope(old) && row.status === 'APPROVED' && row.supersedes.includes(old.revision) &&
        (!old.acceptanceScreen || row.acceptanceScreen === old.acceptanceScreen)),
      'An effective UI reference needs an explicit approved successor: ' + identity(old));
    } else if (old.acceptanceScreen) {
      requireValue(current.acceptanceScreen === old.acceptanceScreen, 'Approved screen mapping removed: ' + identity(old));
    }
  }
}

export function reusedReference(line, path, inactive) {
  try { line = decodeURIComponent(line); } catch { /* Keep the literal input. */ }
  const tokens = line.match(/[\w.\/:%-]+/g) ?? [];
  return inactive.find(row => tokens.some(token => token === row.reference.sha256 ||
    token === row.reference.path || token.endsWith('/' + row.reference.path) ||
    posix.normalize(posix.join(posix.dirname(path), token)) === row.reference.path));
}

const layoutFile = /^scripts\/(?:.*(?:layout|scene|hud|card-face|chrome)|potion-slot-visual)\.mjs$/;
const visualCode = /\b(?:kind\s*:|size\s*:|position\s*:|colou?r\s*:|opacity\s*:|scale\s*:|rotation\s*:|font(?:Size)?\s*:|image\s*:|plate\(|text\(|flagButton\(|SetSizeDelta\(|SetAnchoredPosition\(|imageColor\s*=|font(?:Color|Size)\s*=|menuPresentation\.|\.rectangles\.)/;
const tracksPath = (row, path) => [row.codePath, ...(row.codePaths ?? []), ...(row.retiredCodePaths ?? [])].includes(path);
const themePath = 'data/presentation/ui_theme.json';
const themeValue = (json, key) => key.split('.').reduce((object, part) => object?.[part], json);

function checkChanges(base, rows, body) {
  const relevant = path => /^(?:scripts|src|data|config|art|docs|\.github)\//.test(path) || /^(?:AGENTS|CLAUDE|README)\.md$/.test(path);
  const evidence = /^docs\/(?:evidence|legal|reviews)\//;
  const changed = git('diff', '--name-only', '-z', '--no-renames', base, 'HEAD', '--').split('\0').filter(Boolean);
  const active = rows.filter(eligible), inactive = rows.filter(retired);
  const bodyLines = (body ?? '').replace(/<!--[^]*?(?:-->|$)/g, '').split(/\r?\n/);
  const declared = bodyLines.filter(line => line.startsWith('UI-Design:')).map(line => {
    const row = active.find(entry => line === 'UI-Design: ' + identity(entry));
    requireValue(row, 'UI-Design must identify an effective reference: ' + line);
    return row;
  });
  const check = (label, matches) => {
    requireValue(active.some(matches), 'Visual change has no effective UI reference: ' + label);
    if (body !== undefined) requireValue(declared.some(matches), 'Visual change needs a matching UI-Design declaration: ' + label);
  };
  const checkLinks = (line, path) => {
    const row = reusedReference(line, path, inactive);
    requireValue(!row, 'New reference to ' + row?.status + ' UI asset in ' + path + ': ' + row?.reference.path);
  };
  for (const line of bodyLines) checkLinks(line, 'PR description');
  for (const path of changed.filter(relevant)) {
    if ([indexPath, tablePath].includes(path) || evidence.test(path)) continue;
    const patch = git('diff', '--no-ext-diff', '--no-textconv', '--unified=0', base, 'HEAD', '--', path).split('\n');
    for (const line of patch.filter(line => line.startsWith('+') && !line.startsWith('+++'))) checkLinks(line.slice(1), path);
    if ((layoutFile.test(path) || rows.some(row => tracksPath(row,path))) &&
      patch.some(line => /^[+-](?![+-]|\s*(?:\/\/|--))/.test(line) && visualCode.test(line.slice(1)))) {
      check(path, row => tracksPath(row,path));
    }
    if (path === themePath) {
      const previous = JSON.parse(git('show', base + ':' + themePath)), current = readJson(themePath);
      for (const key of new Set(rows.flatMap(row => row.themeKeys ?? []))) {
        if (!isDeepStrictEqual(themeValue(previous,key), themeValue(current,key))) {
          check(themePath + '#' + key, row => row.themeKeys?.includes(key));
        }
      }
    }
  }
}

export function checkUiReferences({base,body} = {}) {
  const rows = loadUiReferences();
  requireValue(readFileSync(tablePath, 'utf8').replaceAll('\r\n', '\n') === renderTable(rows),
    'UI reference table is stale; run node scripts/render-ui-reference-table.mjs');
  if (!base) return;
  requireValue(/^[a-f0-9]{40}$/.test(base), 'UI references require an exact comparison base SHA');
  // A missing index on the comparison commit is valid during installation.
  if (git('ls-tree', base, '--', indexPath)) {
    guardHistory(parseIndex(JSON.parse(git('show', base + ':' + indexPath))), rows);
  }
  checkChanges(base, rows, body);
}

export function checkHostedUiReferences(env = process.env) {
  if (env.GITHUB_ACTIONS !== 'true' || !['pull_request','merge_group','workflow_dispatch'].includes(env.GITHUB_EVENT_NAME)) {
    return checkUiReferences();
  }
  const event = readJson(env.GITHUB_EVENT_PATH);
  const base = event.pull_request?.base.sha ?? event.merge_group?.base_sha ?? event.inputs?.base_sha;
  requireValue(base || env.GITHUB_EVENT_NAME === 'workflow_dispatch', 'Missing UI comparison base in event');
  return checkUiReferences({base, body: event.pull_request ? event.pull_request.body ?? '' : undefined});
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [, , base, bodyFile] = process.argv;
    if (base === '--hosted') checkHostedUiReferences();
    else checkUiReferences({base,body:bodyFile ? readFileSync(bodyFile,'utf8') : undefined});
    console.log('UI reference index and comparison passed.');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
