import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {currentFullQualityJobs,checkoutReceipt,receiptErrors} from './verify-delivery.mjs';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {projectRepositoryMatches} from './repository-identity.mjs';

const validSha=value=>/^[a-f0-9]{40}$/.test(value??'');
export const releaseBranch=value=>/^release\/[\w][\w.-]*$/.test(value??'');
export const formalPublishBranch=value=>/^(?:release|hotfix)\/v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(value??'');
const hotfixBranch=value=>typeof value==='string'&&value.startsWith('hotfix/')&&formalPublishBranch(value);
const frozenBranch=value=>releaseBranch(value)||hotfixBranch(value);

export function publicationTarget(event,repo,hotfix=false) {
 const pr=event?.pull_request,head=pr?.head;
 const matches=hotfix?hotfixBranch(head?.ref)&&projectRepositoryMatches(head.repo,repo)&&projectRepositoryMatches(pr.base?.repo,repo)
  :releaseBranch(head?.ref)&&head.repo?.full_name===repo;
 if(pr?.base?.ref!=='master'||!matches||!validSha(head.sha))
  throw Error(hotfix?'Expected same-repository Hotfix publication PR':'Expected same-repository Release publication PR');
 return {branch:head.ref,head:head.sha};
}
export async function pages(request,path,key) {
 const rows=[];
 for(let page=1;page<=100;page++) {
  const result=await request(`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`);
  if(!Array.isArray(result?.[key]))throw Error('Missing Release CI '+key);
  rows.push(...result[key]);
  if(result[key].length<100)return rows;
 }
 throw Error('Release CI pagination incomplete');
}
export async function latestFullRun(repo,branch,request) {
 const path=`/repos/${repo}/actions/workflows/quality.yml/runs?event=workflow_dispatch&branch=${encodeURIComponent(branch)}`;
 return (await pages(request,path,'workflow_runs')).sort((a,b)=>b.id-a.id)[0];
}
// Reuse the real hosted Full matrix. Fast, PR merge tests and local diagnostics
// cannot attest a frozen Release HEAD. Never select an older successful run.
function loadCheckout(repo,run,jobs) {
 const dir=mkdtempSync(join(tmpdir(),'release-full-'));
 try{return checkoutReceipt(repo,run,jobs,dir);}finally{rmSync(dir,{recursive:true,force:true});}
}
export async function verifyReleaseFull(repo,branch,head,request,readCheckout=loadCheckout) {
 if(!frozenBranch(branch)||!validSha(head))throw Error('Expected release/<name> or hotfix/vX.Y.Z and frozen 40-character HEAD');
 const prefix=`/repos/${repo}`,refPath=`${prefix}/git/ref/heads/${branch}`;
 const checkRef=async()=>{
  const ref=await request(refPath);
  if(ref?.ref!==`refs/heads/${branch}`||ref.object?.type!=='commit'||ref.object.sha!==head)
   throw Error('Release HEAD changed; freeze and run Full again');
 };
 await checkRef();
 const latest=()=>latestFullRun(repo,branch,request);
 const run=await latest();
 if(!Number.isSafeInteger(run?.id)||run.id<1||run.head_sha!==head||run.head_branch!==branch||
  run.event!=='workflow_dispatch'||run.path!=='.github/workflows/quality.yml'||
  !projectRepositoryMatches(run.repository,repo)||run.status!=='completed'||run.conclusion!=='success')
  throw Error('Frozen Release HEAD requires its latest successful hosted Full run');
 const jobs=await pages(request,`${prefix}/actions/runs/${run.id}/jobs?filter=all`,'jobs');
 const ids=new Set(),executions=new Set();
 for(const job of jobs) {
  const key=`${job.name}:${job.run_attempt}`;
  if(!currentFullQualityJobs.includes(job.name)||!Number.isSafeInteger(job.id)||job.id<1||ids.has(job.id)||
   executions.has(key)||job.run_id!==run.id||job.head_sha!==head||!Number.isSafeInteger(job.run_attempt)||
   job.run_attempt<1||job.run_attempt>run.run_attempt)throw Error('Unexpected or mismatched Full job');
  ids.add(job.id);executions.add(key);
 }
 if(!Number.isSafeInteger(run.run_attempt)||run.run_attempt<1||!jobs.some(j=>j.run_attempt===run.run_attempt))throw Error('Missing latest Full attempt');
 for(const name of currentFullQualityJobs) {
  const job=jobs.filter(j=>j.name===name).sort((a,b)=>b.run_attempt-a.run_attempt)[0];
  if(job?.status!=='completed'||job.conclusion!==(name==='fast'?'skipped':'success'))throw Error('Incomplete or unsuccessful Full job: '+name);
 }
 const proof=await readCheckout(repo,run,jobs),checkout=proof?.checkout;
 if(receiptErrors(checkout,proof?.checkoutArtifact,jobs,run,3).length||
  checkout?.tested!==head||checkout.head!==head||checkout.runId!==run.id||
  checkout.event!=='workflow_dispatch'||checkout.prNumber!=null)
  throw Error('Frozen Release Full requires its immutable exact checkout receipt');
 const current=await request(`${prefix}/actions/runs/${run.id}`),last=await latest();
 if(current?.id!==run.id||current.run_attempt!==run.run_attempt||current.status!=='completed'||
  current.conclusion!=='success'||current.head_sha!==head||last?.id!==run.id||last.run_attempt!==run.run_attempt)
  throw Error('Release Full run/attempt changed during verification');
 await checkRef();
 return {schemaVersion:1,kind:'release-full',repo,branch,head,runId:run.id,attempt:run.run_attempt,
  checkoutArtifactId:proof.checkoutArtifact.id,url:run.html_url};
}

export async function freezeReleaseFull(repo,branch,head,request,readCheckout=loadCheckout) {
 if(!frozenBranch(branch)||!validSha(head))throw Error('Expected release/<name> or hotfix/vX.Y.Z and frozen 40-character HEAD');
 const prefix=`/repos/${repo}`,refPath=`${prefix}/git/ref/heads/${branch}`;
 if(!projectRepositoryMatches(await request(prefix),repo))throw Error('Unexpected Release repository identity');
 const checkRef=async()=>{
  const ref=await request(refPath);
  if(ref?.ref!==`refs/heads/${branch}`||ref.object?.type!=='commit'||ref.object.sha!==head)
   throw Error('Freeze HEAD differs from current Release');
 };
 const matching=async()=>{
  const runs=await pages(request,`${prefix}/actions/workflows/quality.yml/runs?event=workflow_dispatch&branch=${encodeURIComponent(branch)}`,'workflow_runs');
  if(runs.some(run=>!Number.isSafeInteger(run?.id)||run.id<1||!validSha(run.head_sha)))
   throw Error('Missing or invalid Release run identity');
  return runs.filter(run=>run.head_sha===head).sort((a,b)=>b.id-a.id)[0];
 };
 const validRun=run=>{
  if(!Number.isSafeInteger(run?.id)||run.id<1||!Number.isSafeInteger(run.run_attempt)||run.run_attempt<1||
   run.head_sha!==head||run.head_branch!==branch||run.event!=='workflow_dispatch'||
   run.path!=='.github/workflows/quality.yml'||!projectRepositoryMatches(run.repository,repo))
   throw Error('Existing frozen Release run identity is invalid');
 };
 const reuse=async selected=>{
  validRun(selected);await checkRef();
  const run=await request(`${prefix}/actions/runs/${selected.id}`);
  validRun(run);
  const latest=await matching();
  if(run.id!==selected.id||run.run_attempt!==selected.run_attempt||latest?.id!==run.id||latest.run_attempt!==run.run_attempt)
   throw Error('Release Full run/attempt changed; inspect the latest run before retrying');
  if(run.status!=='completed') {
   if(!['queued','pending','waiting','requested','in_progress'].includes(run.status)||run.conclusion!=null)
    throw Error('Existing frozen Release run is not a pending Full candidate');
   await checkRef();
   return {state:'waiting',branch,head,runId:run.id,attempt:run.run_attempt,url:`https://github.com/${repo}/actions/runs/${run.id}`};
  }
  if(run.conclusion!=='success')throw Error('Existing frozen Release Full failed or was cancelled; inspect it before requesting another run');
  const proof=await verifyReleaseFull(repo,branch,head,request,readCheckout);
  if(proof.runId!==run.id||proof.attempt!==run.run_attempt)throw Error('Verified Release Full differs from the selected run');
  return {state:'verified',...proof};
 };
 await checkRef();
 const existing=await matching();if(existing)return reuse(existing);
 // A second read catches a dispatch registered by another caller. GitHub's
 // existing workflow/ref concurrency handles the remaining cross-client race.
 await checkRef();
 const registered=await matching();if(registered)return reuse(registered);
 await checkRef();
 await request(`${prefix}/actions/workflows/quality.yml/dispatches`,{ref:branch,inputs:{runner_pool:'hosted'}});
 await checkRef();
 return {state:'requested',branch,head};
}

export async function githubRequest(path,body) {
 const response=await fetch(`https://api.github.com${path}`,{
  method:body?'POST':'GET',headers:{Accept:'application/vnd.github+json',
   Authorization:`Bearer ${process.env.GH_TOKEN||process.env.GITHUB_TOKEN}`},
  ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`Release CI API failed: HTTP ${response.status}`);
 return response.status===204?null:response.json();
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 try {
  let [command,branch,head]=process.argv.slice(2);
  const repo='FurinyaWorks/Slay-the-Heavens';
  const publication=['verify-publish','verify-pr','verify-hotfix-pr'].includes(command);
  if(command==='verify-pr'||command==='verify-hotfix-pr') {
   const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
   ({branch,head}=publicationTarget(event,repo,command==='verify-hotfix-pr'));
   command='verify';
  }
  if(!['freeze','verify','verify-publish'].includes(command)||!frozenBranch(branch)||!validSha(head))
   throw Error('Usage: node scripts/release-ci.mjs freeze|verify|verify-publish <release/name|hotfix/vX.Y.Z> <frozen-HEAD>');
  if(command==='freeze') {
   console.log(JSON.stringify(await freezeReleaseFull(repo,branch,head,githubRequest)));
  } else {
   const full=await verifyReleaseFull(repo,branch,head,githubRequest);
   const performance=await (await import('./runtime-baseline/require-release-performance.mjs')).requireReleasePerformance(full,githubRequest);
   const acceptance=publication&&await (await import('./verify-release-acceptance.mjs')).verifyReleaseAcceptance(full,performance,githubRequest);
   console.log(JSON.stringify({...full,performance,...(acceptance?{acceptance}:{})},null,2));
  }
 } catch(error) {console.error(error.message);process.exitCode=1;}
}
