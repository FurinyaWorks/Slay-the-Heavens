#!/usr/bin/env node
// Read-only branch lifecycle audit. Never deletes branches or changes PRs.
import { mkdir, writeFile, appendFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { readBacklogRecords } from './backlog-closeout.mjs';
import { auditBacklogDelivery, auditHistory } from './branch-hygiene-history.mjs';
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY || 'FurinyaWorks/Slay-the-Heavens';
if (!token) throw new Error('GITHUB_TOKEN is required');
const root = 'https://api.github.com/repos/' + repo;
const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: 'Bearer ' + token,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'branch-hygiene-audit'
};
async function api(path) {
  const res = await fetch(root + path, { headers });
  if (!res.ok) throw new Error('GitHub ' + res.status + ': ' + path);
  return res.json();
}
async function paged(path, updatedSince) {
  const all = [];
  for (let page = 1; page <= 30; page++) {
    const data = await api(path + (path.includes('?') ? '&' : '?') +
      'per_page=100&page=' + page);
    if (!Array.isArray(data)) throw new Error('Expected paginated array');
    const recent = updatedSince ? data.filter(row => row.updated_at >= updatedSince) : data;
    all.push(...recent);
    if (data.length < 100 || recent.length < data.length) return all;
  }
  throw new Error('GitHub API pagination exceeded 30 pages: ' + path);
}
// Keep file-page requests bounded and share each result across source PRs.
let inFlight = 0;
const waiting = [];
async function loadFiles(number) {
  if (inFlight < 6) inFlight++;
  else await new Promise(resolve => waiting.push(resolve));
  try {
    return await paged('/pulls/' + number + '/files');
  } finally {
    const next = waiting.shift();
    if (next) next();
    else inFlight--;
  }
}

async function releaseBackflow() {
  let prs;
  if (process.env.GITHUB_EVENT_NAME === 'pull_request_target') {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const source = event.pull_request;
    if (event.action !== 'closed' || source?.merged !== true ||
        !Number.isSafeInteger(source.number) || source.number < 1 ||
        !source.base?.ref?.startsWith('release/') || !/^[a-f0-9]{40}$/.test(source.merge_commit_sha ?? '')) {
      throw new Error('Expected a merged Release pull request');
    }
    const pr = await api('/pulls/' + source.number);
    if (pr.number !== source.number || !pr.merged_at || pr.merge_commit_sha !== source.merge_commit_sha ||
        pr.base.ref !== source.base.ref || pr.base.repo.full_name !== repo) throw new Error('Release merge identity changed');
    prs = [pr];
  } else {
    // Scheduled runs come from the default branch, including when a frozen
    // Release branch still has the older workflow with no close-event trigger.
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const closed = await paged('/pulls?state=closed&sort=updated&direction=desc', since);
    prs = closed.filter(pr => pr.merged_at >= since && pr.base.ref.startsWith('release/'));
  }

  const develop = await api('/branches/develop');
  const developSha = develop.commit.sha;
  const backlogWindow = process.env.GITHUB_EVENT_NAME === 'schedule';
  if (backlogWindow && execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim() !== developSha)
    throw Error('Backlog audit checkout differs from current develop; retry the read-only snapshot');
  const recentlyMerged = backlogWindow ? (await paged('/pulls?state=closed&base=develop&sort=updated&direction=desc',
    new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())).filter(pr =>
      Date.now() - Date.parse(pr.merged_at) <= 48 * 60 * 60 * 1000 && pr.merged_at) : [];
  const deliveryDrift = await auditBacklogDelivery({prs:recentlyMerged, tasks:readBacklogRecords(process.cwd()), loadFiles});
  const [open, { tree, truncated }] = prs.length ? await Promise.all([
    paged('/pulls?state=open&base=develop'), api('/git/trees/' + developSha + '?recursive=1')
  ]) : [[], {tree: []}];
  const developTree = truncated ? null : new Map(tree.filter(row => row.type !== 'tree').map(row => [row.path, row.sha]));
  const results = await auditHistory({ repo, branches: [], prs: [...prs, ...open], comments: [],
    tasks: [], developTree, loadFiles });
  const releases = results.map(({pr, base, release_merge, production_paths, different_develop_paths,
    linked_develop_prs, review, errors}) => ({pr, base, release_merge, production_paths, different_develop_paths,
    linked_develop_prs, review, errors}));
  const report = { develop_sha: developSha, releases, backlog_delivery_drift: deliveryDrift };
  const link = number => '[#' + number + '](https://github.com/' + repo + '/pull/' + number + ')';
  const markdown = ['# Release 回流核对', '', 'Develop 比较 SHA `' + developSha + '`', '',
    ...results.flatMap(result => {
      const pending = result.review.includes('release-backflow-review') || result.review.includes('file-comparison-unavailable');
      if (pending) console.warn('::warning title=Release backflow needs review::Merged Release PR #' + result.pr);
      return ['## Release ' + link(result.pr) + ' · 合入 SHA `' + result.release_merge + '`', '',
        '已关联开放的 develop PR：' + (result.linked_develop_prs.map(row => link(row.pr)).join('、') || '无'),
        '待核对生产路径：' + (result.different_develop_paths?.length ?? '未知'),
        pending ? '请本轮接续小修复，并在 develop PR 正文注明 Release 来源。其余路径登记未接续原因。'
          : '本次 Release 生产路径与 develop 当前内容相同。', ''];
    }), ...(results.length ? [] : ['过去 48 小时没有 Release PR 合入。', '']),
    ...deliveryLines(deliveryDrift)].join('\n');

  await mkdir('build', { recursive: true });
  await writeFile('build/branch-hygiene.json', JSON.stringify(report, null, 2) + '\n');
  await writeFile('build/branch-hygiene.md', markdown);
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
}

function deliveryLines(drift) {
  return ['## Develop Backlog delivery drift', '',
    ...drift.map(row => `- #${row.pr} \`${row.merge_sha}\` · ${row.drift.join('; ')}`), ''];
}

if (['pull_request_target', 'schedule'].includes(process.env.GITHUB_EVENT_NAME)) {
  await releaseBackflow();
  process.exit(0);
}

const [branches, prs, comments] = await Promise.all([
  paged('/branches'), paged('/pulls?state=all&sort=updated&direction=desc'), paged('/issues/comments')
]);
const developSha = branches.find(branch => branch.name === 'develop')?.commit.sha;
if (!developSha) throw new Error('Missing develop inventory snapshot');
const { tree, truncated } = await api('/git/trees/' + developSha + '?recursive=1');
const developTree = truncated ? null : new Map(tree.filter(row => row.type !== 'tree').map(row => [row.path, row.sha]));

const tasks = readBacklogRecords(process.cwd());
const history = auditHistory({ repo, branches, prs, comments, tasks, developTree, loadFiles });
const deliveryDrift = await auditBacklogDelivery({
  prs:prs.filter(pr => pr.merged_at && Date.now() - Date.parse(pr.merged_at) <= 48 * 60 * 60 * 1000), tasks, loadFiles
});
const byHead = new Map();
for (const pr of prs) {
  if (pr.head?.repo?.full_name !== repo || !pr.head?.ref) continue;
  const list = byHead.get(pr.head.ref) || [];
  list.push(pr);
  byHead.set(pr.head.ref, list);
}
function category(branch, pr) {
  const name = branch.name;
  if (branch.protected || ['master', 'develop'].includes(name) ||
      name.startsWith('release/') || name.startsWith('hotfix/')) return 'protected';
  if (pr?.state === 'open') {
    if (pr.base?.ref?.startsWith('release/')) return 'open-release-pr';
    if (pr.base?.ref === 'develop') return 'open-develop-pr';
    return 'open-other-pr';
  }
  if (name.startsWith('archive/')) return 'archive';
  if (name.startsWith('gh-readonly-queue/')) return 'queue-reference';
  if (name.startsWith('handoff/')) return 'handoff';
  if (name.includes('design-lab') || name.includes('review-decisions') ||
      name.includes('review-economy') || name.includes('review-presentation')) return 'frozen-experiment';
  if (pr?.state === 'closed' && !pr.merged_at) return 'closed-unmerged-pr';
  if (pr?.merged_at) return 'merged-pr-head-remains';
  return 'no-pr';
}
const rows = branches.map(branch => {
  const list = byHead.get(branch.name) || [];
  const pr = list.find(x => x.state === 'open') || list[0] || null;
  return {
    branch: branch.name, sha: branch.commit.sha, protected: branch.protected,
    category: category(branch, pr), pr: pr?.number ?? null,
    pr_state: pr?.state ?? null, pr_base: pr?.base?.ref ?? null,
    merged: Boolean(pr?.merged_at), last_commit: null, age_days: null
  };
});
const ageCandidates = rows.filter(row =>
  ['no-pr', 'closed-unmerged-pr', 'merged-pr-head-remains'].includes(row.category));
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < ageCandidates.length) {
    const row = ageCandidates[cursor++];
    const commit = await api('/commits/' + row.sha);
    const date = commit.commit?.committer?.date || commit.commit?.author?.date;
    row.last_commit = date || null;
    if (date) row.age_days = Math.max(0, Math.floor(
      (Date.now() - new Date(date).getTime()) / 86400000));
  }
}));
rows.sort((a, b) => a.category.localeCompare(b.category) ||
  (b.age_days ?? -1) - (a.age_days ?? -1) || a.branch.localeCompare(b.branch));
const counts = {};
for (const row of rows) counts[row.category] = (counts[row.category] || 0) + 1;
const handoffs = await history;
const attention = {};
for (const row of handoffs) for (const reason of row.review) attention[reason] = (attention[reason] ?? 0) + 1;
const summary = {
  generated_at: new Date().toISOString(), repository: repo, total: rows.length,
  prs_open: prs.filter(pr => pr.state === 'open').length, counts,
  develop_sha: developSha, develop_tree_truncated: Boolean(truncated),
  closed_unmerged_prs: handoffs.filter(row => !row.release_merge).length,
  merged_release_prs: handoffs.filter(row => row.release_merge).length, attention,
  warning: 'AUDIT ONLY: no-PR, age, and different SHA do not prove safe deletion'
};
await mkdir('build', { recursive: true });
await writeFile('build/branch-hygiene.json',
  JSON.stringify({ summary, branches: rows, handoffs, backlog_delivery_drift: deliveryDrift }, null, 2) + '\n');
const esc = value => String(value ?? '-').replaceAll('|', '\\|').replaceAll('\n', ' ');
const review = rows.filter(row => ['no-pr', 'closed-unmerged-pr',
  'merged-pr-head-remains'].includes(row.category));
const lines = [
  '# Branch lifecycle inventory', '',
  'Generated: ' + summary.generated_at,
  'Total: **' + rows.length + '**; open PRs: **' + summary.prs_open + '**.',
  '', ...deliveryLines(deliveryDrift), '## Category counts', '',
  '| Category | Count |', '| --- | ---: |',
  ...Object.entries(counts).sort((a, b) => b[1] - a[1])
    .map(([key, val]) => '| ' + key + ' | ' + val + ' |'),
  '', '## Ownership and closeout review queue', '',
  'Do not delete based on this list alone. Preserve experiments and unique evidence.', '',
  '| Branch | HEAD | PR | Last commit | Age (days) | Reason |',
  '| --- | --- | --- | --- | ---: | --- |',
  ...review.map(row => '| ' + esc(row.branch) + ' | ' + row.sha.slice(0, 12) +
    ' | ' + (row.pr ? '#' + row.pr : '-') + ' | ' + esc(row.last_commit?.slice(0, 10)) +
    ' | ' + esc(row.age_days) + ' | ' + row.category + ' |'),
  '', '## PR handoff review', '',
  'Develop SHA: `' + developSha + '`. Closed without merge: **' + summary.closed_unmerged_prs +
    '**. Merged into Release: **' + summary.merged_release_prs + '**.', '',
  'Related PRs and file snapshots are review leads. Verify remaining behavior and record the actual disposition in the existing PR or Backlog task.', '',
  '| Source PR | Base | Head branch | Backlog | Related develop PRs | Findings |',
  '| --- | --- | --- | --- | --- | --- |',
  ...handoffs.filter(row => row.review.length).map(row => '| [#' + row.pr + '](https://github.com/' + repo + '/pull/' + row.pr + ') | ' +
    esc(row.base) + ' | ' + esc(row.head_state) + ' | ' + esc(row.backlog.map(task => task.id).join(', ') || '-') +
    ' | ' + esc(row.linked_develop_prs.map(pr => '#' + pr.pr).join(', ') || '-') + ' | ' + esc(row.review.join(', ')) + ' |'),
  '', 'The JSON inventory includes fixed source SHAs, closeout receipts and compared paths.',
  'Reconcile Backlog, successor scope, integration SHA manifests and actual diff before closing or deleting a source.'
];
const markdown = lines.join('\n') + '\n';
await writeFile('build/branch-hygiene.md', markdown);
if (process.env.GITHUB_STEP_SUMMARY)
  await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(JSON.stringify(summary, null, 2));
if ((counts['no-pr'] || 0) > 10) console.warn(
  'WARNING: over 10 untracked work branches; ownership triage required.');
