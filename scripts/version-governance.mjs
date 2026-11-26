import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { normalizeTaskId } from './task-dependencies.mjs';

export const versionPattern = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
export const planPath = version => `docs/versions/${version.toUpperCase()}-RELEASE.md`;
export function managedVersion(version) {
  if (!versionPattern.test(version)) return false;
  const [major, minor] = version.slice(1).split('.').map(BigInt);
  return major > 2n || major === 2n && minor >= 2n;
}
const dimensions = new Map([['Scope', 'release-scope'], ['Release Gate', 'release-gate']]);
const trackLabels = [...dimensions.values(), 'engineering', 'release-deferral', 'version-main'];
const taskIds = text => (text.match(/\bTASK-\d+(?:\.\d+)*\b/gi) ?? []).map(normalizeTaskId);
const markdownLinks = text => [...text.matchAll(/\]\(([^\s)]+)\)/g)].map(match => match[1]);
const commit = /\b[0-9a-f]{40}\b/;

function section(source, heading) {
  const sections = source.split(/^##[ \t]+/m).slice(1);
  const selected = sections.filter(text => text.split('\n')[0].trim() === heading);
  if (selected.length !== 1) return '';
  return selected[0];
}

function table(source, signature) {
  const lines = source.split('\n');
  const indices = lines.flatMap((line, index) => line.trim() === signature ? [index] : []);
  if (indices.length !== 1 || !/^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[indices[0] + 1] ?? '')) return [];
  const rows = lines.slice(indices[0] + 2);
  const end = rows.findIndex(line => !line.startsWith('|'));
  return (end === -1 ? rows : rows.slice(0, end)).map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
}

export function readVersionPlan(source) {
  const body = source.replace(/\r\n/g, '\n');
  const markers = [...body.matchAll(/^<!-- release-plan: (v[\d.]+) (TASK-\d+(?:\.\d+)*) -->$/gm)];
  if (markers.length !== 1 || !versionPattern.test(markers[0][1])) return null;
  const [, version, main] = markers[0];
  const closeout = [...body.matchAll(/^<!-- release-closeout: ([a-f0-9]{40}) ([a-f0-9]{40}) ([^\s]+) ([^\s]+) -->$/gm)];
  return {
    version, main: normalizeTaskId(main),
    scope: table(section(body, '正式范围'), '| 核心交付 | 维度 | Backlog | 交付证据入口 |'),
    engineering: table(section(body, '独立工程轨道'), '| Backlog | 接续成果 | 本版直接验收的成果 |'),
    deferrals: table(section(body, 'PR 对账与延期'), '| 延期项 | 固定来源 | 接续 Task | 目标版本 |'),
    integrations: table(section(body, 'PR 对账与延期'), '| 本版 PR | 处置要求 | 准入处置 |'),
    reviewed: [...body.matchAll(/^<!-- scope-review: \d{4}-\d{2}-\d{2} \| [^|\r\n]+ \| [^|\r\n]+ -->$/gm)].length === 1,
    closed: closeout.length === 1 && closeout[0][3] === `https://github.com/FurinyaWorks/Slay-the-Heavens/releases/tag/engine-${version}` &&
      /^https:\/\/github\.com\/FurinyaWorks\/Slay-the-Heavens\/actions\/runs\/[1-9]\d*(?:\/attempts\/[1-9]\d*)?$/.test(closeout[0][4]),
  };
}

export function loadVersionPlans(root) {
  const dir = join(root, 'docs/versions');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(name => name.endsWith('.md')).sort().flatMap(name => {
    const path = `docs/versions/${name}`, text = readFileSync(join(root, path), 'utf8');
    return /<!--\s*release-plan\s*:/i.test(text) ? [{ path, plan: readVersionPlan(text) }] : [];
  });
}

function hasSource(root, path, text) {
  return markdownLinks(text).some(link => {
    if (/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/.test(link)) return commit.test(text);
    if (/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(?:commit|blob|tree)\/[0-9a-f]{40}(?:\/[^\s]*)?$/.test(link)) return true;
    if (/^(?:\.|[\w-])[\w./%-]*?(?:#[^\s]+)?$/.test(link)) {
      const target = resolve(root, dirname(path), link.split('#')[0]);
      const fromRoot = relative(resolve(root), target);
      return fromRoot && fromRoot !== '..' && !fromRoot.startsWith('..' + sep) && !isAbsolute(fromRoot) && existsSync(target);
    }
    return false;
  });
}

export function auditVersionGovernance(tasks, root, records = loadVersionPlans(root)) {
  const errors = [], byId = new Map(tasks.map(task => [normalizeTaskId(task.id), task]));
  const mainByVersion = new Map();
  const planByVersion = new Map();
  for (const { path, plan } of records) {
    if (!plan || planPath(plan.version) !== path || planByVersion.has(plan.version)) errors.push(`${path}: invalid or duplicate official release plan`);
    if (plan) planByVersion.set(plan.version, { path, plan });
  }
  for (const task of tasks) {
    const labels = task.labels ?? [], tracks = labels.filter(label => trackLabels.includes(label));
    const versions = labels.filter(label => versionPattern.test(label));
    // The existing untagged v2.2.0 planning checkout predates this checker.
    // Once it registers a main/plan, every task carrying that version is audited.
    if (!tracks.length && !versions.some(version => planByVersion.has(version) || managedVersion(version) && version !== 'v2.2.0')) continue;
    if (tracks.length !== 1) errors.push(`${task.id}: requires exactly one governance role`);
    const [track] = tracks;
    if (track === 'engineering' || track === 'release-deferral') {
      if (versions.length) errors.push(`${task.id}: engineering or deferral must not carry a release assignment`);
      continue;
    }
    const [version] = versions;
    if (versions.length !== 1 || !planByVersion.has(version)) errors.push(`${task.id}: requires one version with an official plan`);
    if (track !== 'version-main') continue;
    if (task.parentTaskId || mainByVersion.has(version)) errors.push(`${task.id}: version main must be a unique root`);
    mainByVersion.set(version, normalizeTaskId(task.id));
  }
  for (const { path, plan } of planByVersion.values()) {
    const { version, main, scope, engineering, deferrals, reviewed } = plan;
    const mainTask = byId.get(main);
    if (mainByVersion.get(version) !== main || !mainTask?.documentation?.includes(path)) {
      errors.push(`${version}: plan and unique Backlog main must link to each other`);
    }
    if (mainTask?.status === 'Done' && !plan.closed) errors.push(`${version}: version completion requires publication and production backflow evidence`);
    const direct = tasks.filter(task => normalizeTaskId(task.parentTaskId) === main);
    if (!scope.length) errors.push(`${version}: missing core deliverables`);
    if ((scope.length < 3 || scope.length > 5 || direct.length > 8) && !reviewed) {
      errors.push(`${version}: scope review required for ${scope.length} goals and ${direct.length} direct tasks`);
    }
    auditPlanTasks({ version, scope, engineering, main, direct, tasks, byId, errors });
    for (const [name, source = '', successor = '', target = '', ...extra] of deferrals) {
      const next = target.replace(/^`|`$/g, '');
      if (!name || extra.length || !hasSource(root, path, source) || !versionPattern.test(next) || next === version ||
          !taskIds(successor).some(id => byId.has(id) && !byId.get(id).labels?.includes(version))) {
        errors.push(`${version}: deferral ${name || '?'} requires fixed source, Backlog successor and target version`);
      }
    }
    if (direct.some(task => task.labels?.includes('release-deferral')) && !deferrals.length) errors.push(`${version}: missing deferral register`);
  }
  return errors;
}

function auditPlanTasks({ version, scope, engineering, main, direct, tasks, byId, errors }) {
  const rows = new Map();
  function register(field, track, details) {
    const ids = taskIds(field ?? '');
    if (!track || !ids.length || !details) errors.push(`${version}: incomplete deliverable or engineering row`);
    for (const id of ids) {
      if (rows.has(id)) errors.push(`${version}: ${id} appears in multiple plan rows`);
      rows.set(id, track);
      const task = byId.get(id);
      if (!task?.labels?.includes(track) || (track === 'engineering' ? task.labels.includes(version) : !task.labels.includes(version))) {
        errors.push(`${version}: ${id} plan dimension disagrees with Backlog`);
      }
    }
  }
  for (const [name, dimension, field, evidence, ...extra] of scope) register(field, dimensions.get(dimension), name && evidence && !extra.length);
  for (const [field, work, gate, ...extra] of engineering) register(field, 'engineering', work && gate && !extra.length);
  for (const task of direct) {
    if (!rows.has(normalizeTaskId(task.id)) && !task.labels?.includes('release-deferral')) errors.push(`${version}: direct task ${task.id} missing from plan`);
  }
  for (const task of tasks.filter(task => task.labels?.includes(version))) {
    const id = normalizeTaskId(task.id);
    if (dependsOnEngineering(task, byId)) {
      errors.push(`${version}: ${task.id} requires a named engineering outcome instead of closing a work track`);
    }
    if (id === main) continue;
    let parent = normalizeTaskId(task.parentTaskId);
    const seen = new Set([id]);
    while (parent && parent !== main && !rows.has(parent) && !seen.has(parent)) {
      seen.add(parent);
      parent = normalizeTaskId(byId.get(parent)?.parentTaskId);
    }
    if (!task.labels.some(label => dimensionsHas(label)) || (!rows.has(id) && !dimensionsHas(rows.get(parent)))) {
      errors.push(`${version}: ${task.id} requires a scope or gate trace in the plan`);
    }
  }
}

const dimensionsHas = label => [...dimensions.values()].includes(label);

function dependsOnEngineering(task, byId, seen = new Set()) {
  if (seen.has(task?.id)) return false;
  seen.add(task?.id);
  return (task?.dependencies ?? []).some(id => {
    const required = byId.get(normalizeTaskId(id));
    return required?.labels?.some(label => ['engineering', 'release-deferral'].includes(label)) || dependsOnEngineering(required, byId, seen);
  });
}
