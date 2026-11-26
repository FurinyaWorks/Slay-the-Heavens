import assert from 'node:assert/strict';
import test from 'node:test';
import { auditReleaseFreeze } from '../scripts/check-release-freeze.mjs';
import { auditVersionGovernance, planPath, readVersionPlan } from '../scripts/version-governance.mjs';
import { auditRoadmap } from '../scripts/verify-backlog-roadmap.mjs';
import { verifyReleaseAdmission } from '../scripts/verify-release-admission.mjs';
import { acceptanceRecord, verifyReleaseAcceptance } from '../scripts/verify-release-acceptance.mjs';

const version = 'v2.2.0';
const path = planPath(version);
const original = `# Release

<!-- release-plan: ${version} TASK-10 -->

## 正式范围

| 核心交付 | 维度 | Backlog | 交付证据入口 |
| --- | --- | --- | --- |
| 修复 | Scope | TASK-10.1 | Regression |
| 展示 | Scope | TASK-10.2 | Simulator |
| 验收 | Release Gate | TASK-10.3 | CI |

## 独立工程轨道

| Backlog | 接续成果 | 本版直接验收的成果 |
| --- | --- | --- |
| TASK-10.4 | Hosted CD | 正式同源构建回执 |

## PR 对账与延期

| 本版 PR | 处置要求 | 准入处置 |
| --- | --- | --- |
| #138 | 独审与 CI | 必须合入 |

| 延期项 | 固定来源 | 接续 Task | 目标版本 |
| --- | --- | --- | --- |
| 插画 | [#55](https://github.com/FurinyaWorks/Slay-the-Heavens/pull/55) \`abcdef0123456789abcdef0123456789abcdef01\` | TASK-11 | v2.3.0 |
`;

const task = (id, labels = [], extra = {}) => ({ id, labels, metadataErrors: [], ...extra });
const child = (id, track) => task(id, [version, track], { parentTaskId: 'TASK-10' });
const backlog = () => [
  task('TASK-10', [version, 'version-main'], { documentation: [path] }),
  child('TASK-10.1', 'release-scope'), child('TASK-10.2', 'release-scope'),
  child('TASK-10.3', 'release-gate'), task('TASK-10.4', ['engineering'], { parentTaskId: 'TASK-10' }),
  task('TASK-10.5', ['release-deferral'], { parentTaskId: 'TASK-10' }), task('TASK-11'),
];
const audit = (tasks, source = original, planFile = path) =>
  auditVersionGovernance(tasks, '.', [{ path: planFile, plan: readVersionPlan(source) }]);

test('one version main and single plan use Backlog assignments without making the engineering task a gate', () => {
  assert.deepEqual(audit(backlog()), []);
  assert.deepEqual(audit(backlog(), original.replaceAll('\n', '\r\n')), []);
  const tasks = backlog();
  tasks[3].dependencies = ['TASK-10.1'];
  tasks[1].dependencies = ['TASK-10.4'];
  assert.match(audit(tasks).join('\n'), /TASK-10\.3.*engineering outcome/);
});

test('duplicate and missing authoritative release records fail', () => {
  const tasks = backlog();
  tasks.push(task('TASK-12', [version, 'version-main'], { documentation: [path] }));
  assert.match(audit(tasks).join('\n'), /unique root/);
  assert.match(audit(backlog(), original, 'docs/versions/COPY.md').join('\n'), /invalid or duplicate/);
  assert.match(audit(backlog(), original.replace('release-plan:', 'other:')).join('\n'), /invalid or duplicate/);
});

test('wrong version, engineering dimension and omitted direct task fail', () => {
  const tasks = backlog();
  tasks[2].labels = ['v2.3.0', 'release-scope'];
  tasks[4].labels.push(version);
  tasks.push(child('TASK-10.6', 'release-scope'));
  const errors = audit(tasks).join('\n');
  assert.match(errors, /TASK-10\.2.*official plan/);
  assert.match(errors, /TASK-10\.4.*must not carry/);
  assert.match(errors, /TASK-10\.6 missing/);
  assert.match(audit([task('TASK-15', ['v2.3.0'])]).join('\n'), /TASK-15.*governance role/);
});

test('closing the version main requires release and actual backflow evidence', () => {
  const tasks = backlog();
  tasks[0].status = 'Done';
  assert.match(audit(tasks).join('\n'), /completion requires publication and production backflow/);
  const proof = '\n<!-- release-closeout: ' + 'b'.repeat(40) + ' ' + 'a'.repeat(40) +
    ' https://github.com/FurinyaWorks/Slay-the-Heavens/releases/tag/engine-v2.2.0 ' +
    'https://github.com/FurinyaWorks/Slay-the-Heavens/actions/runs/40 -->\n';
  assert.deepEqual(audit(tasks, original + proof), []);
});

test('actual direct child count prompts review without a mechanical upper limit', () => {
  const tasks = backlog();
  for (let id = 20; id < 25; id++) tasks.push(task(`TASK-${id}`, ['release-deferral'], { parentTaskId: 'TASK-10' }));
  assert.match(audit(tasks).join('\n'), /scope review required for 3 goals and 10 direct tasks/);
  assert.deepEqual(audit(tasks, original + '\n<!-- scope-review: 2026-11-26 | Owner | preserve reviewed tasks -->\n'), []);
});

test('deferral requires fixed ancestry, an existing successor outside this release and a target', () => {
  for (const text of [original.replace('abcdef01', 'HEAD'), original.replace('TASK-11 |', 'TASK-99 |'),
    original.replace('TASK-11 |', 'TASK-10.1 |'), original.replace('v2.3.0 |', 'v2.2.0 |')]) {
    assert.match(audit(backlog(), text).join('\n'), /requires fixed source, Backlog successor and target version/);
  }
});

test('version engineering task may leave M8 without affecting legacy or ordinary product tasks', () => {
  const main = task('TASK-10', ['version-main'], { status: 'In Progress', milestone: 'm-8', assignees: ['@Furinya'] });
  const makeChild = labels => task('TASK-10.1', labels, { status: 'In Progress', parentTaskId: main.id, assignees: ['@Furinya'] });
  const roadmap = '### M8\n- TASK-10: version';
  assert.deepEqual(auditRoadmap([main, makeChild(['engineering'])], roadmap, { 'm-8': 'M8' }), []);
  assert.match(auditRoadmap([main, makeChild(['release-scope'])], roadmap, { 'm-8': 'M8' }).join('\n'), /缺少有效首发里程碑/);
  assert.match(auditRoadmap([{ ...main, labels: [] }, makeChild(['engineering'])], roadmap, { 'm-8': 'M8' }).join('\n'), /缺少有效首发里程碑/);
});

const repo = 'FurinyaWorks/Slay-the-Heavens';
const [base, head, candidate] = ['a', 'b', 'c'].map(x => x.repeat(40));
const pr = { number: 40, state: 'open', base: { ref: 'release/v2.2.0', sha: base, repo: { id: 1429751262, full_name: repo } },
  head: { sha: head }, user: { login: 'developer' }, title: 'fix(ui): 修复暂停',
  body: 'Release-Fix: TASK-10.1 | failure after pause | link to replay' };
const inputs = (after = original, changed = ['src/lua/game.lua']) => ({
  checkout: () => [candidate, base, head], read: ref => ref === base ? original : after,
  tasks: backlog, files: () => changed, refresh: async pull => pull,
});
const unexpectedRequest = async () => { throw new Error('Unexpected API request'); };

test('frozen PR admits a traced defect fix and evidence-only documentation', async () => {
  assert.equal((await auditReleaseFreeze(pr, repo, unexpectedRequest, inputs())).status, 'necessary-fix');
  assert.equal((await auditReleaseFreeze({ ...pr, title: 'docs(release): archive replay', body: '' }, repo,
    unexpectedRequest, inputs(original, [path, 'docs/evidence/replay.md']))).status, 'evidence-only');
  assert.equal((await auditReleaseFreeze({ ...pr, base: { ref: 'release/v2.0.0' } }, repo, unexpectedRequest, inputs())).status, 'release-policy');
});

test('frozen PR rejects undocumented additions, removed scope and old checkout', async () => {
  await assert.rejects(auditReleaseFreeze({ ...pr, title: 'feat: add a level' }, repo,
    unexpectedRequest, inputs()), /scope is frozen/);
  await assert.rejects(auditReleaseFreeze(pr, repo, unexpectedRequest,
    inputs(original.replace('| 展示 |', '| 新增 |'))), /scope is frozen/);
  await assert.rejects(auditReleaseFreeze(pr, repo, unexpectedRequest,
    inputs(original.replace('| 插画 |', '| 删除原延期记录 |'))), /scope is frozen/);
  await assert.rejects(auditReleaseFreeze(pr, repo, unexpectedRequest,
    { ...inputs(), checkout: () => [candidate, head, base] }), /differs from HEAD\/BASE/);
  await assert.rejects(auditReleaseFreeze(pr, repo, unexpectedRequest,
    { ...inputs(), refresh: async () => ({ ...pr, head: { sha: base } }) }), /PR HEAD\/BASE changed/);
});

test('exception requires plan decision, exact independent GitHub review and release permissions', async () => {
  const reason = 'Owner approved the added scenario';
  const declared = { ...pr, title: 'feat: add scenario', body: `Release-Exception: 71 | ${reason}` };
  const decision = inputs(original + `\n<!-- scope-exception: #40 | ${reason} -->\n`);
  const record = { id: 71, commit_id: head, user: { login: 'owner', id: 111138384 }, state: 'COMMENTED',
    body: `Release scope approved: ${reason}` };
  const request = (review = record, permission = 'admin') => async endpoint => endpoint.endsWith('/reviews/71') ? review : { permission, user: record.user };
  assert.equal((await auditReleaseFreeze(declared, repo, request(), decision)).status, 'reviewed-exception');
  assert.equal((await auditReleaseFreeze({ ...declared, body: '' }, repo, request(),
    { ...decision, refresh: async () => declared })).status, 'reviewed-exception');
  await assert.rejects(auditReleaseFreeze(declared, repo, request({ ...record, commit_id: base }), decision), /exact HEAD/);
  await assert.rejects(auditReleaseFreeze(declared, repo, request(record, 'write'), decision), /lacks approval/);
  await assert.rejects(auditReleaseFreeze(declared, repo, request(), inputs()), /scope is frozen/);
});

const repository = { id: 1429751262, full_name: repo };
const ref = (branch, sha) => ({ ref: `refs/heads/${branch}`, object: { type: 'commit', sha } });
const comparison = sha => ({ status: 'ahead', merge_base_commit: { sha } });

test('admission checks registered implementation PR, live refs, full push proof and backflow', async () => {
  const pull = { number: 138, merged: true, merge_commit_sha: candidate, base: { ref: 'develop', repo: repository } };
  const request = (pr = pull, develop = head) => async path => {
    if (path.endsWith('/heads/develop')) return ref('develop', develop);
    if (path.endsWith('/heads/master')) return ref('master', base);
    if (path.endsWith('/pulls/138')) return pr;
    if (path.includes(`/compare/${candidate}...${head}?`)) return comparison(candidate);
    return unexpectedRequest();
  };
  const checks = { readLocal: () => ({ checked: head, version, plan: readVersionPlan(original) }),
    verifyCi: async () => ({ qualityRunId: 50 }),
    verifyGraph: async master => { assert.equal(master, base); return { master: base, develop: head }; } };
  assert.deepEqual(await verifyReleaseAdmission(version, head, request(), checks), {
    version, task: 'TASK-10', phase: 'admission-checks-passed', master: base, develop: head,
    pullRequests: [{ number: 138, merge: candidate }], manualChecks: [], ci: { qualityRunId: 50 },
  });
  await assert.rejects(verifyReleaseAdmission(version, head, request({ ...pull, merged: false }), checks), /not integrated/);
  await assert.rejects(verifyReleaseAdmission(version, head, request(pull, candidate), checks), /develop moved/);
  await assert.rejects(verifyReleaseAdmission(version, head, request(),
    { ...checks, verifyCi: async () => { throw new Error('Full is not green'); } }), /Full is not green/);
  await assert.rejects(verifyReleaseAdmission(version, head, request(),
    { ...checks, verifyGraph: async () => { throw new Error('Backflow pending'); } }), /Backflow pending/);
});

const gilSha256 = 'f'.repeat(64), branch = `release/${version}`;
const names = ['Simulator', 'PC', '实体手机', '官方平台', '美术质量', '稳定性'];
const acceptance = original + `
<!-- release-acceptance: ${head} ${gilSha256} #138 -->

## 同候选人工验收证据

| 项目 | 原始证据 | 签署协调者 |
| --- | --- | --- |
` + names.map(name => `| ${name} | [原始证据](https://github.com/${repo}/actions/runs/11/artifacts/12) | @owner |`).join('\n');

test('acceptance requires the same exact GIL and every independent manual evidence row', () => {
  const result = acceptanceRecord(acceptance, head, gilSha256);
  assert.deepEqual(Object.keys(result.evidence), names);
  assert.throws(() => acceptanceRecord(acceptance, base, gilSha256), /missing acceptance/);
  assert.throws(() => acceptanceRecord(acceptance.replace('| 实体手机 |', '| 模拟手机 |'), head, gilSha256), /physical phone/);
});

test('publication rechecks protected plan, exact native review and frozen refs', async () => {
  const review = { id: 125, commit_id: candidate, state: 'COMMENTED', user: { login: 'owner', id: 111138384 },
    body: `Release acceptance approved: ${head} ${gilSha256}` };
  const source = { path, encoding: 'base64', type: 'file', sha: 'f'.repeat(40), content: Buffer.from(acceptance).toString('base64') };
  const request = ({ reviewRow = review, frozen = head, changed = false } = {}) => async path => {
    if (path.endsWith('/heads/develop')) return ref('develop', base);
    if (path.endsWith('/heads/' + branch)) return ref(branch, frozen);
    if (path.endsWith('?ref=' + base)) return source;
    if (path.endsWith('?ref=' + candidate)) return changed ? { ...source, sha: base } : source;
    if (path.endsWith('/pulls/138')) return { number: 138, merged: true, merge_commit_sha: candidate,
      base: { ref: 'develop', repo: repository }, head: { sha: candidate } };
    if (path.includes(`/compare/${candidate}...${base}?`)) return comparison(candidate);
    if (path.endsWith('/pulls/138/reviews?per_page=100&page=1')) return [reviewRow];
    if (path.endsWith('/collaborators/owner/permission')) return { permission: 'admin', user: review.user };
    return unexpectedRequest();
  };
  const full = { repo, head, branch }, performance = { head, branch, gil: { gilSha256 } };
  assert.equal((await verifyReleaseAcceptance(full, performance, request())).verificationCommit, base);
  await assert.rejects(verifyReleaseAcceptance(full, performance, request({ reviewRow: { ...review, state: 'DISMISSED' } })), /independent native/);
  await assert.rejects(verifyReleaseAcceptance(full, performance, request({ changed: true })), /differs from/);
  await assert.rejects(verifyReleaseAcceptance(full, performance, request({ frozen: candidate })), /changed during/);
});
