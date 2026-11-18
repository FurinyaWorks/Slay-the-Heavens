#!/usr/bin/env node
// Read-only branch lifecycle audit. Never deletes branches or changes PRs.
import { mkdir, writeFile, appendFile } from 'node:fs/promises';
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
async function paged(path) {
  const all = [];
  for (let page = 1; page <= 30; page++) {
    const data = await api(path + (path.includes('?') ? '&' : '?') +
      'per_page=100&page=' + page);
    if (!Array.isArray(data)) throw new Error('Expected paginated array');
    all.push(...data);
    if (data.length < 100) return all;
  }
  throw new Error('GitHub API pagination exceeded 30 pages');
}
const [branches, prs] = await Promise.all([
  paged('/branches'), paged('/pulls?state=all&sort=updated&direction=desc')
]);
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
const summary = {
  generated_at: new Date().toISOString(), repository: repo, total: rows.length,
  prs_open: prs.filter(pr => pr.state === 'open').length, counts,
  warning: 'AUDIT ONLY: no-PR, age, and different SHA do not prove safe deletion'
};
await mkdir('build', { recursive: true });
await writeFile('build/branch-hygiene.json',
  JSON.stringify({ summary, branches: rows }, null, 2) + '\n');
const esc = value => String(value ?? '-').replaceAll('|', '\\|').replaceAll('\n', ' ');
const review = rows.filter(row => ['no-pr', 'closed-unmerged-pr',
  'merged-pr-head-remains'].includes(row.category));
const lines = [
  '# Branch lifecycle inventory', '',
  'Generated: ' + summary.generated_at,
  'Total: **' + rows.length + '**; open PRs: **' + summary.prs_open + '**.',
  '', '## Category counts', '',
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
  '', 'Squash merges invalidate SHA-only ancestry as delivery proof.',
  'Reconcile Backlog, successor PRs, integration SHA manifests and actual diff.'
];
const markdown = lines.join('\n') + '\n';
await writeFile('build/branch-hygiene.md', markdown);
if (process.env.GITHUB_STEP_SUMMARY)
  await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(JSON.stringify(summary, null, 2));
if ((counts['no-pr'] || 0) > 10) console.warn(
  'WARNING: over 10 untracked work branches; ownership triage required.');
