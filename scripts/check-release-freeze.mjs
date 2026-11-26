import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { normalizeTaskId } from './task-dependencies.mjs';
import { managedVersion, planPath, readVersionPlan } from './version-governance.mjs';
import { projectRepositoryMatches } from './repository-identity.mjs';
import { readBacklogRecords } from './backlog-closeout.mjs';
import { readTaskHeader } from './backlog-metadata.mjs';
import { requireReleaseCoordinator } from './verify-release-acceptance.mjs';

const sha = /^[a-f0-9]{40}$/;
const git = (...args) => execFileSync('git', ['--no-replace-objects', ...args], { encoding: 'utf8' });
const scope = plan => plan.scope.map(row => row.slice(0, 3));
const evidencePath = path => /^docs\/(?:evidence|reviews)\//.test(path);
const backlogPath = /^backlog\/(?:tasks|completed)\/task-[\d.]+ - .+\.md$/;
const readIfPresent = (ref, path) => git('ls-tree', '-z', ref, '--', path) ? git('show', `${ref}:${path}`) : '';

function assignments(paths, ref, version, readTask) {
  const records = new Map();
  for (const path of paths.filter(file => backlogPath.test(file))) {
    const task = readTaskHeader(readTask(ref, path));
    if (task.labels.includes(version)) records.set(normalizeTaskId(task.id), {
      parent: normalizeTaskId(task.parentTaskId), dependencies: (task.dependencies ?? []).map(normalizeTaskId).sort(),
      roles: task.labels.filter(label => ['release-scope', 'release-gate', 'version-main'].includes(label)).sort(),
    });
  }
  return records;
}

function declaration(body, key, expression) {
  const lines = body.replace(/<!--[\s\S]*?(?:-->|$)/g, '').split(/\r?\n/).filter(line => line.startsWith(`${key}:`));
  return lines.length === 1 ? lines[0].match(expression) : null;
}

export async function auditReleaseFreeze(pr, repository, request, {
  checkout = () => git('rev-parse', 'HEAD', 'HEAD^1', 'HEAD^2').trimEnd().split('\n'),
  read = (ref, path) => git('show', `${ref}:${path}`),
  readTask = readIfPresent,
  files = (base, target) => git('diff', '--name-only', '--no-renames', '-z', base, target, '--').split('\0').filter(Boolean),
  tasks = () => readBacklogRecords('.').filter(task => task.location !== 'archive'),
  refresh = pull => request(`/repos/${repository}/pulls/${pull.number}`),
} = {}) {
  const version = pr?.base?.ref?.match(/^release\/(v[\d.]+)$/)?.[1];
  if (!managedVersion(version)) return { status: 'release-policy', base: pr?.base?.ref };
  const path = planPath(version), base = pr.base.sha, head = pr.head?.sha;
  if (!projectRepositoryMatches(pr.base.repo, repository) || ![base, head].every(value => sha.test(value ?? '')) ||
      !Number.isSafeInteger(pr.number) || pr.number < 1) throw new Error('Invalid frozen Release PR identity');
  const [candidate, checkoutBase, checkoutHead] = checkout();
  if (!sha.test(candidate ?? '') || base !== checkoutBase || head !== checkoutHead) throw new Error('Frozen Release PR checkout differs from HEAD/BASE');
  const live = await refresh(pr);
  if (live?.number !== pr.number || live.state !== 'open' || live.base?.ref !== pr.base.ref ||
      live.base.sha !== base || live.head?.sha !== head || !projectRepositoryMatches(live.base.repo, repository)) {
    throw new Error('Frozen Release PR HEAD/BASE changed; validate the current checkout');
  }
  const original = readVersionPlan(read(base, path));
  const candidateText = read(candidate, path), proposed = readVersionPlan(candidateText);
  if (!original || !proposed || original.version !== version || proposed.version !== version || original.main !== proposed.main) {
    throw new Error('Frozen Release requires an unchanged official plan identity');
  }
  const body = live.body ?? '';
  const fix = declaration(body, 'Release-Fix', /^Release-Fix: (TASK-\d+(?:\.\d+)*) \| ([^|\r\n]+) \| ([^|\r\n]+)$/);
  const changed = files(base, candidate);
  const oldAssignments = assignments(changed, base, version, readTask);
  const newAssignments = assignments(changed, candidate, version, readTask);
  // A necessary defect may get its own task under an existing deliverable.
  // Existing assignments and their hard dependencies remain frozen.
  if (fix && !oldAssignments.has(normalizeTaskId(fix[1]))) newAssignments.delete(normalizeTaskId(fix[1]));
  const unchanged = isDeepStrictEqual(scope(original), scope(proposed)) &&
    isDeepStrictEqual(original.integrations, proposed.integrations) && isDeepStrictEqual(oldAssignments, newAssignments) &&
    original.deferrals.every(row => proposed.deferrals.some(next => isDeepStrictEqual(row, next)));
  const manager = tasks();
  const validFixTask = fix && manager.filter(task => normalizeTaskId(task.id) === normalizeTaskId(fix[1]) &&
    !task.metadataErrors.length && task.labels.includes(version) && task.labels.includes('release-scope')).length === 1;
  if (unchanged && validFixTask && /^fix(?:\([^\n)]+\))?: .+/.test(live.title ?? '')) {
    return { status: 'necessary-fix', version, task: fix[1] };
  }
  if (unchanged && changed.length && changed.every(file => file === path || evidencePath(file) || backlogPath.test(file)) &&
      /^(?:docs|test)\(release\): .+/.test(live.title ?? '')) {
    return { status: 'evidence-only', version };
  }
  const exception = declaration(body, 'Release-Exception', /^Release-Exception: ([1-9]\d*) \| ([^|\r\n]+)$/);
  const id = Number(exception?.[1]);
  const decision = exception && `<!-- scope-exception: #${pr.number} | ${exception[2]} -->`;
  if (!Number.isSafeInteger(id) || !candidateText.split(/\r?\n/).includes(decision)) {
    throw new Error('Release scope is frozen; register a necessary fix or a reviewed scope decision');
  }
  const prefix = `/repos/${repository}`;
  const review = await request(`${prefix}/pulls/${pr.number}/reviews/${id}`);
  const login = review?.user?.login;
  if (review?.id !== id || review.commit_id !== head || !['APPROVED', 'COMMENTED'].includes(review.state) ||
      !review.body?.split(/\r?\n/).includes(`Release scope approved: ${exception[2]}`)) {
    throw new Error('Release scope decision requires an independent native review of this exact HEAD');
  }
  await requireReleaseCoordinator(repository, review.user, request);
  return { status: 'reviewed-exception', version, reviewId: id, reviewer: login };
}
