import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { evaluateIntake, loadTask } from './check-task-intake.mjs';

const production = /^(?:src|scripts|tools|experiments|config|data|schemas|\.github\/workflows)\/|^package(?:-lock)?\.json$/;
const evidence = /^(?:\.artifacts|docs\/(?:evidence|reviews))\//;
const limit = { lines: 400, files: 10 };

export function assessSlice(numstat, body = '') {
  const counts = { lines: 0, files: 0, productionLines: 0, productionFiles: 0, productionBinaries: 0, evidenceLines: 0, evidenceFiles: 0 };
  for (const row of numstat.split('\0').filter(Boolean)) {
    const match = /^(\d+|-)\t(\d+|-)\t([\s\S]+)$/.exec(row);
    if (!match || (match[1] === '-') !== (match[2] === '-')) throw new Error('Invalid Git numstat row');
    const [, added, deleted, path] = match;
    const binary = added === '-';
    const lines = binary ? 0 : Number(added) + Number(deleted);
    counts.lines += lines;
    counts.files++;
    if (production.test(path)) {
      counts.productionLines += lines;
      counts.productionFiles++;
      if (binary) counts.productionBinaries++;
    } else if (evidence.test(path)) {
      counts.evidenceLines += lines;
      counts.evidenceFiles++;
    }
  }
  const large = counts.productionLines > limit.lines || counts.productionFiles > limit.files ||
    counts.evidenceLines > limit.lines || counts.evidenceFiles > limit.files || counts.productionBinaries > 0;
  const visibleBody = body.replace(/<!--[^]*?(?:-->|$)/g, '');
  const exceptions = visibleBody.split(/\r?\n/).filter(line => line.startsWith('Slice-exception:'));
  const exception = exceptions.length === 1 &&
    /^Slice-exception: (?:atomic|mechanical|generated|tests) \| [^\s|][^|]* \| [^\s|][^|]*$/.test(exceptions[0]);
  return { ...counts, decision: large ? (exception ? 'REVIEW_EXCEPTION' : 'SPLIT_REQUIRED') : 'WITHIN_BUDGET' };
}

export function checkSlice(base, candidate = 'HEAD', body = '') {
  if (!/^[0-9a-f]{40}$/.test(base ?? '') || !/^(?:HEAD|[0-9a-f]{40})$/.test(candidate)) {
    throw new Error('Usage: node scripts/check-pr-slice.mjs <exact base SHA> [candidate SHA or HEAD] [PR body file]');
  }
  const stat = execFileSync('git', ['diff', '--numstat', '-z', '--no-renames', '--no-ext-diff', '--no-textconv', base, candidate, '--'], { encoding: 'utf8' });
  const result = assessSlice(stat, body);
  console.log(JSON.stringify(result));
  if (result.decision === 'SPLIT_REQUIRED') {
    throw new Error('Split the production change, move bulky evidence out, or record a reviewable Slice-exception in the PR body.');
  }
}

export function checkHostedSlice(env = process.env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.GITHUB_EVENT_NAME !== 'pull_request') return;
  const pr = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8')).pull_request;
  if (!pr) throw new Error('Missing pull request event payload');
  if (pr.base.ref !== 'develop') return;
  const [candidate, base, head] = execFileSync('git', ['rev-parse', 'HEAD', 'HEAD^1', 'HEAD^2'], { encoding: 'utf8' }).trim().split('\n');
  if (candidate !== env.GITHUB_SHA || base !== pr.base.sha || head !== pr.head.sha) {
    throw new Error('PR slice checkout differs from the event HEAD/BASE');
  }
  checkSlice(base, candidate, pr.body ?? '');
}

function startSlice([id = '', sliceOption, slice, verifyOption, verify, ...extra]) {
  const policy = JSON.parse(readFileSync('config/task-intake.json', 'utf8'));
  const result = evaluateIntake({ id, task: loadTask(id), policy });
  if (result.decision === 'ALLOW' && (sliceOption !== '--slice' || !slice?.trim() || verifyOption !== '--verify' || !verify?.trim() || extra.length)) {
    result.decision = 'HOLD';
    result.reasons.push('Supply the first independently mergeable slice: --slice "<scope>" --verify "<command>"');
  }
  console.log(result.decision + ' ' + id);
  if (result.reasons.length) throw new Error(result.reasons.join('\n'));
  console.log('Before claiming, record this slice and verification in the task. Check dependencies, approvals, open PRs, claims and file ownership. Finish or hand off your current slice before claiming another.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [base, candidate, bodyFile] = process.argv.slice(2);
    if (base === '--start') startSlice(process.argv.slice(3));
    else checkSlice(base, candidate, bodyFile ? readFileSync(bodyFile, 'utf8') : '');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
