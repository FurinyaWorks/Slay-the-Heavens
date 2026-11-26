import { managedVersion, planPath, readVersionPlan } from './version-governance.mjs';
import { projectRepositoryMatches } from './repository-identity.mjs';
import { TRUSTED_REVIEW_COORDINATOR_IDS } from './independent-ai-review.mjs';

const sha = /^[a-f0-9]{40}$/;
const digest = /^[a-f0-9]{64}$/;
const manualChecks = ['Simulator', 'PC', '实体手机', '官方平台', '美术质量', '稳定性'];

export async function requireReleaseCoordinator(repo, actor, request) {
  if (!TRUSTED_REVIEW_COORDINATOR_IDS.includes(actor?.id) || !/^[a-z\d-]+$/i.test(actor?.login ?? '')) {
    throw new Error('Release review lacks a trusted coordinator identity');
  }
  const permission = await request(`/repos/${repo}/collaborators/${actor.login}/permission`);
  const role = permission?.role_name ?? permission?.permission;
  if (permission?.user?.id !== actor.id || permission?.user?.login !== actor.login ||
      !(role === 'admin' && permission.permission === 'admin' || role === 'maintain' && ['maintain', 'write'].includes(permission.permission))) {
    throw new Error('Release reviewer lacks approval permission');
  }
}

export async function protectedRef(repo, branch, request) {
  const ref = await request(`/repos/${repo}/git/ref/heads/${branch}`);
  if (ref?.ref !== `refs/heads/${branch}` || ref.object?.type !== 'commit' || !sha.test(ref.object.sha)) {
    throw new Error(`Exact protected ${branch} identity required`);
  }
  return ref.object.sha;
}

export function acceptanceRecord(source, head, gilSha256) {
  const lines = source.split(/\r?\n/);
  const pins = lines.flatMap(line => [...line.matchAll(/^<!-- release-acceptance: ([a-f0-9]{40}) ([a-f0-9]{64}) #([1-9]\d*) -->$/g)]);
  if (pins.length !== 1 || pins[0][1] !== head || pins[0][2] !== gilSha256 || !Number.isSafeInteger(Number(pins[0][3]))) {
    throw new Error('Protected develop is missing acceptance for this exact source and GIL SHA-256');
  }
  const heading = lines.indexOf('## 同候选人工验收证据');
  if (heading < 0 || heading !== lines.lastIndexOf('## 同候选人工验收证据')) throw new Error('One manual acceptance section is required');
  const section = lines.slice(heading + 1).join('\n').split(/^## /m)[0];
  const entries = [...section.matchAll(/^\| ([^|]+) \| \[[^\]]+\]\((https:\/\/[^\s)]+)\) \| @([\w-]+) \|$/gm)];
  if (entries.length !== manualChecks.length || !manualChecks.every(name => entries.filter(row => row[1] === name).length === 1)) {
    throw new Error('Simulator, PC, physical phone, official platform, art and stability require six original evidence links and reviewers');
  }
  return { pr: Number(pins[0][3]), evidence: Object.fromEntries(entries.map(([, key, url, reviewer]) => [key, { url, reviewer }])) };
}

async function readReviews(request, path) {
  const reviews = [];
  for (let page = 1; page <= 100; page++) {
    const rows = await request(`${path}?per_page=100&page=${page}`);
    if (!Array.isArray(rows)) break;
    reviews.push(...rows);
    if (rows.length < 100) return reviews;
  }
  throw new Error('Acceptance review list unavailable or incomplete');
}

export async function verifyReleaseAcceptance(fullProof, performance, request) {
  const { repo, branch, head } = fullProof;
  const version = branch.split('/')[1];
  if (!managedVersion(version)) return null;
  const gilSha256 = performance?.gil?.gilSha256;
  if (!sha.test(head) || !digest.test(gilSha256) || performance.head !== head || performance.branch !== branch) {
    throw new Error('Verified production GIL for the frozen source is required');
  }
  const api = `/repos/${repo}`, path = planPath(version);
  const develop = await protectedRef(repo, 'develop', request);
  const readPlan = ref => request(`${api}/contents/${path}?ref=${ref}`);
  const file = await readPlan(develop);
  if (file?.path !== path || file.encoding !== 'base64' || file.type !== 'file' || typeof file.content !== 'string' || !sha.test(file.sha)) {
    throw new Error('Protected release acceptance plan unavailable');
  }
  const source = Buffer.from(file.content, 'base64').toString('utf8');
  if (readVersionPlan(source)?.version !== version) throw new Error('Acceptance must be in the official version plan');
  const record = acceptanceRecord(source, head, gilSha256);
  const pr = await request(`${api}/pulls/${record.pr}`);
  if (pr?.number !== record.pr || pr.merged !== true || pr.base?.ref !== 'develop' || !projectRepositoryMatches(pr.base.repo, repo) ||
      !sha.test(pr.merge_commit_sha) || !sha.test(pr.head?.sha) || pr.head.sha === head) {
    throw new Error('Acceptance record requires a separate merged develop review PR');
  }
  const [reviewed, ancestry, reviews] = await Promise.all([
    readPlan(pr.head.sha), request(`${api}/compare/${pr.merge_commit_sha}...${develop}?per_page=1`),
    readReviews(request, `${api}/pulls/${record.pr}/reviews`),
  ]);
  if (file.sha !== reviewed?.sha || ancestry?.merge_base_commit?.sha !== pr.merge_commit_sha ||
      !['ahead', 'identical'].includes(ancestry.status)) throw new Error('Acceptance plan differs from the protected reviewed version');
  for (const reviewer of new Set(Object.values(record.evidence).map(row => row.reviewer))) {
    const review = reviews.filter(row => row.user?.login === reviewer).sort((a, b) => b.id - a.id)[0];
    if (review?.commit_id !== pr.head.sha || !['APPROVED', 'COMMENTED'].includes(review.state) ||
        !review.body?.split(/\r?\n/).includes(`Release acceptance approved: ${head} ${gilSha256}`)) {
      throw new Error(`Missing exact independent native release acceptance review by @${reviewer}`);
    }
    await requireReleaseCoordinator(repo, review.user, request);
  }
  if (await protectedRef(repo, 'develop', request) !== develop || await protectedRef(repo, branch, request) !== head) {
    throw new Error('Release or acceptance branch changed during verification');
  }
  return { source: head, gilSha256, verificationCommit: develop, ...record };
}
