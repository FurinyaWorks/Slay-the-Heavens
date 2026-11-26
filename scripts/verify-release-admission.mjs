import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { githubRequest } from './release-ci.mjs';
import { loadReleaseNotes } from './release-notes.mjs';
import { verifyBacklogRoadmap, verifyMilestoneScope } from './verify-backlog-roadmap.mjs';
import { managedVersion, planPath, readVersionPlan } from './version-governance.mjs';
import { projectRepositoryMatches } from './repository-identity.mjs';
import { protectedRef } from './verify-release-acceptance.mjs';

const repo = 'FurinyaWorks/Slay-the-Heavens';
const sha = /^[a-f0-9]{40}$/;
const git = (...args) => execFileSync('git', ['--no-replace-objects', ...args], { encoding: 'utf8' }).trim();

export function requiredIntegrations(plan) {
  const required = [], seen = new Set();
  for (const [pulls, description, disposition, ...extra] of plan.integrations) {
    const numbers = pulls.split('、').map(value => /^#([1-9]\d*)$/.exec(value)?.[1]);
    if (extra.length || !description || !['必须合入', '核对', '可选'].includes(disposition) ||
        numbers.some(value => !value || !Number.isSafeInteger(Number(value)) || seen.has(value)) || new Set(numbers).size !== numbers.length) {
      throw new Error(`Invalid release PR disposition ${pulls}`);
    }
    numbers.forEach(value => seen.add(value));
    if (disposition === '必须合入') required.push(...numbers.map(Number));
  }
  if (!required.length) throw new Error('Official plan must name required integration PRs');
  return required;
}

export async function verifyReleaseAdmission(version, head, request, {
  readLocal = () => {
    const errors = [...verifyBacklogRoadmap(), ...verifyMilestoneScope()];
    if (errors.length) throw new Error(errors.join('\n'));
    const notes = loadReleaseNotes({ releaseCandidate: true });
    return { checked: notes.build.sourceCommit, version: notes.build.version, plan: readVersionPlan(readFileSync(planPath(version), 'utf8')) };
  },
  verifyCi = async () => (await import('./verify-release-backflow-closeout.mjs')).verifyBackflowPush(repo, head, request),
  verifyGraph = async master => (await import('./check-release-backflow.mjs')).auditBackflow(`https://github.com/${repo}.git`,
    { expectedMaster: master, expectedDevelop: head }),
} = {}) {
  if (!managedVersion(version) || !sha.test(head ?? '')) throw new Error('A governed version and exact develop commit are required');
  const { checked, version: localVersion, plan } = readLocal();
  if (checked !== head || localVersion !== version || plan?.version !== version) {
    throw new Error('Exact clean develop, synchronized engineering version, CHANGELOG and official plan required');
  }
  const api = `/repos/${repo}`;
  const [develop, master] = await Promise.all(['develop', 'master'].map(branch => protectedRef(repo, branch, request)));
  if (develop !== head) throw new Error('Remote develop moved; revalidate branch admission');
  const pullRequests = await Promise.all(requiredIntegrations(plan).map(async number => {
    const pr = await request(`${api}/pulls/${number}`);
    const merge = pr?.merge_commit_sha;
    if (pr?.number !== number || pr.merged !== true || pr.base?.ref !== 'develop' || !projectRepositoryMatches(pr.base.repo, repo) || !sha.test(merge)) {
      throw new Error(`#${number} is not integrated into protected develop`);
    }
    const graph = await request(`${api}/compare/${merge}...${head}?per_page=1`);
    if (graph?.merge_base_commit?.sha !== merge || !['ahead', 'identical'].includes(graph.status)) {
      throw new Error(`#${number} merge is outside the exact admission source`);
    }
    return { number, merge };
  }));
  const ci = await verifyCi();
  const graph = await verifyGraph(master);
  const manualChecks = plan.integrations.filter(row => row[2] === '核对').map(([pulls, requirement]) => ({ pulls, requirement }));
  return { version, task: plan.main, phase: 'admission-checks-passed', ...graph, pullRequests, manualChecks, ci };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 4) throw new Error('Usage: node scripts/verify-release-admission.mjs <vX.Y.Z> <develop-HEAD>');
    const [version, head] = process.argv.slice(2);
    if (git('rev-parse', 'HEAD') !== head) throw new Error('Check out the exact develop admission candidate');
    console.log(JSON.stringify(await verifyReleaseAdmission(version, head, githubRequest), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
