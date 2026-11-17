// Read-only, on-demand metrics. Never dispatches, cancels or changes protection.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {gunzipSync} from 'node:zlib';

const ms = value => Date.parse(value);
const key = r => JSON.stringify([r.repository?.id??r.repository_id??null,r.workflow_id,r.head_sha,r.event,r.head_branch]);
const percentile = (values,p) => values.length ? [...values].sort((a,b)=>a-b)[Math.ceil(values.length*p)-1] : null;
export function summarize({runs,jobs={},prs=[],evidence={}}) {
  // Latest API snapshots may occur on several pages after a concurrent rerun.
  const unique=[...new Map(runs.map(r=>[r.id,r])).values()].sort((a,b)=>ms(a.created_at)-ms(b.created_at)||a.id-b.id);
  const seen=new Set(), first=new Map(), reusable=new Map(), across=new Map(), conclusions={};
  let sameIdentityExtraRuns=0,provenReusableExtraRuns=0,crossRepositoryReusableExtraRuns=0,reuseIdentityMissing=0,runnerSeconds=0,jobCoverageRuns=0,jobsWithoutCompletedTiming=0;
  const countedJobs=new Set();
  for(const r of unique) {
    conclusions[r.conclusion??r.status??'unknown']=(conclusions[r.conclusion??r.status??'unknown']??0)+1;
    const identity=key(r);
    if(seen.has(identity))sameIdentityExtraRuns++;
    seen.add(identity);
    const firstKey=JSON.stringify([r.repository?.id??null,r.workflow_id,r.head_sha,r.event]);
    if(!first.has(firstKey))first.set(firstKey,r);
    const e=evidence[r.id];
    // Missing comparison/config/scope is unknown, never a claimed saving.
    if(e?.tested && e.base && e.configDigest && e.scope && e.platforms?.length) {
      const reuseKey=JSON.stringify([identity,e.tested,e.base,e.configDigest,e.scope,[...e.platforms].sort()]);
      if(r.conclusion==='success'&&reusable.has(reuseKey)&&reusable.get(reuseKey)<=ms(r.created_at))provenReusableExtraRuns++;
      if(r.conclusion==='success'&&r.status!=='in_progress'&&Number.isFinite(ms(r.updated_at)))reusable.set(reuseKey,ms(r.updated_at));
      else reusable.delete(reuseKey);
      if(r.event==='workflow_dispatch') { // diagnostic overlap only; integration remains mandatory
        const crossKey=JSON.stringify([e.tested,e.base,e.configDigest,e.scope,[...e.platforms].sort()]), repo=r.repository?.id??r.repository_id;
        const previous=across.get(crossKey);
        if(repo&&r.conclusion==='success'&&previous?.repo!==repo&&previous?.finished<=ms(r.created_at))crossRepositoryReusableExtraRuns++;
        if(repo&&r.conclusion==='success')across.set(crossKey,{repo,finished:ms(r.updated_at)});
        else across.delete(crossKey);
      }
    } else reuseIdentityMissing++;
    if(Object.hasOwn(jobs,r.id)) {
      jobCoverageRuns++;
      for(const j of jobs[r.id]) {
        if(countedJobs.has(j.id)||j.conclusion==='skipped')continue;
        countedJobs.add(j.id);
        if(Object.hasOwn(j,'runner_id')&&!j.runner_id)continue; // queued/cancelled before allocation
        if(!Object.hasOwn(j,'runner_id')){jobsWithoutCompletedTiming++;continue;}
        const seconds=(ms(j.completed_at)-ms(j.started_at))/1000;
        if(Number.isFinite(seconds)&&seconds>=0)runnerSeconds+=seconds;
        else jobsWithoutCompletedTiming++;
      }
    }
  }
  const eligible=[...first.values()].filter(r=>['success','failure','timed_out','action_required'].includes(r.conclusion)&&r.run_attempt===1);
  const successful=eligible.filter(r=>r.conclusion==='success').length;
  const lead=prs.filter(p=>p.merged_at).map(p=>(ms(p.merged_at)-ms(p.created_at))/60000).filter(n=>Number.isFinite(n)&&n>=0);
  return {runs:unique.length,conclusions,sameIdentityExtraRuns,sameIdentityExtraRate:unique.length?sameIdentityExtraRuns/unique.length:null,
    provenReusableExtraRuns,crossRepositoryReusableExtraRuns,provenReusableExtraRate:unique.length>reuseIdentityMissing?provenReusableExtraRuns/(unique.length-reuseIdentityMissing):null,reuseIdentityMissing,
    runnerMinutes:jobCoverageRuns?runnerSeconds/60:null,jobCoverageRuns,jobsWithoutCompletedTiming,runnerMinutesComplete:jobCoverageRuns===unique.length&&jobsWithoutCompletedTiming===0,
    firstPass:{eligibleCommits:eligible.length,successfulCommits:successful,rate:eligible.length?successful/eligible.length:null,
      excludedFirstRuns:first.size-eligible.length},
    mergeLeadMinutes:{count:lead.length,median:percentile(lead,0.5),p90:percentile(lead,0.9)}};
}

function api(path) {
  return execFileSync('gh',['api','--paginate',path,'--jq','@json'],{encoding:'utf8',maxBuffer:128*1024*1024}).trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));
}
export function collect({repo,since,until,includeJobs=false,includePrs=false}) {
  if(!/^[\w.-]+\/[\w.-]+$/.test(repo)||!/^\d{4}-\d{2}-\d{2}$/.test(since)||!/^\d{4}-\d{2}-\d{2}$/.test(until))throw Error('Expected --repo owner/name --since YYYY-MM-DD --until YYYY-MM-DD');
  const workflows=api(`repos/${repo}/actions/workflows?per_page=100`).flatMap(p=>p.workflows);
  const runs=[];
  for(const w of workflows.filter(w=>['Quality','Quick feedback'].includes(w.name))) {
    const pages=api(`repos/${repo}/actions/workflows/${w.id}/runs?created=${since}T00:00:00Z..${until}T23:59:59Z&per_page=100`);
    const items=pages.flatMap(p=>p.workflow_runs);
    if(pages[0]?.total_count>items.length)throw Error(`GitHub run search truncated ${w.name}; use a shorter date interval`);
    runs.push(...items);
  }
  const jobs={};
  if(includeJobs)for(const r of runs)jobs[r.id]=api(`repos/${repo}/actions/runs/${r.id}/jobs?filter=all&per_page=100`).flatMap(p=>p.jobs);
  // Closed endpoint includes unmerged PRs; filter by merged date, not update date.
  const prs=includePrs?api(`repos/${repo}/pulls?state=closed&per_page=100`).flat().filter(p=>p.merged_at&&p.merged_at>=`${since}T00:00:00Z`&&p.merged_at<=`${until}T23:59:59Z`):[];
  return {repo,since,until,collectedAt:new Date().toISOString(),runs,jobs,prs};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const args=process.argv.slice(2),value=flag=>args[args.indexOf(flag)+1];
  const input=args.includes('--input')?JSON.parse(value('--input').endsWith('.gz')?gunzipSync(readFileSync(value('--input'))).toString('utf8'):readFileSync(value('--input'),'utf8')):collect({repo:value('--repo'),since:value('--since'),until:value('--until'),includeJobs:args.includes('--jobs'),includePrs:args.includes('--prs')});
  const report={schemaVersion:1,repo:input.repo,since:input.since,until:input.until,collectedAt:input.collectedAt,metrics:summarize(input),
    byWorkflow:Object.fromEntries([...new Set(input.runs.map(r=>r.name))].map(name=>[name,summarize({...input,runs:input.runs.filter(r=>r.name===name)})])),
    byWorkflowEvent:Object.fromEntries([...new Set(input.runs.map(r=>`${r.name}/${r.event}`))].map(name=>[name,summarize({...input,runs:input.runs.filter(r=>`${r.name}/${r.event}`===name)})]))};
  if(args.includes('--raw-output'))writeFileSync(value('--raw-output'),JSON.stringify(input,null,2)+'\n');
  if(args.includes('--output'))writeFileSync(value('--output'),JSON.stringify(report,null,2)+'\n');
  else console.log(JSON.stringify(report,null,2));
}
