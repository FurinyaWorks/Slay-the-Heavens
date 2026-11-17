import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {currentFullQualityJobs,checkoutReceipt,receiptErrors} from './verify-delivery.mjs';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {projectRepositoryMatches} from './repository-identity.mjs';

const validSha=value=>/^[a-f0-9]{40}$/.test(value??'');
export const releaseBranch=value=>/^release\/[\w][\w.-]*$/.test(value??'');
async function pages(request,path,key) {
 const rows=[];
 for(let page=1;page<=100;page++) {
  const result=await request(`${path}${path.includes('?')?'&':'?'}per_page=100&page=${page}`);
  if(!Array.isArray(result?.[key]))throw Error('Missing Release CI '+key);
  rows.push(...result[key]);
  if(result[key].length<100)return rows;
 }
 throw Error('Release CI pagination incomplete');
}
// Reuse the real hosted Full matrix. Fast, PR merge tests and local diagnostics
// cannot attest a frozen Release HEAD. Never select an older successful run.
function loadCheckout(repo,run,jobs) {
 const dir=mkdtempSync(join(tmpdir(),'release-full-'));
 try{return checkoutReceipt(repo,run,jobs,dir);}finally{rmSync(dir,{recursive:true,force:true});}
}
export async function verifyReleaseFull(repo,branch,head,request,readCheckout=loadCheckout) {
 if(!releaseBranch(branch)||!validSha(head))throw Error('Expected release/<name> and frozen 40-character HEAD');
 const prefix=`/repos/${repo}`,refPath=`${prefix}/git/ref/heads/${branch}`;
 const checkRef=async()=>{
  const ref=await request(refPath);
  if(ref?.ref!==`refs/heads/${branch}`||ref.object?.type!=='commit'||ref.object.sha!==head)
   throw Error('Release HEAD changed; freeze and run Full again');
 };
 await checkRef();
 const latest=async()=> (await pages(request,`${prefix}/actions/workflows/quality.yml/runs?event=workflow_dispatch&branch=${encodeURIComponent(branch)}`,'workflow_runs'))
  .sort((a,b)=>b.id-a.id)[0];
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
 return {schemaVersion:1,kind:'release-full',repo,branch,head,runId:run.id,attempt:run.run_attempt,url:run.html_url};
}

export async function freezeReleaseFull(repo,branch,head,request,readCheckout=loadCheckout) {
 if(!releaseBranch(branch)||!validSha(head))throw Error('Expected release/<name> and frozen 40-character HEAD');
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
  if(command==='verify-pr') {
   const pr=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')).pull_request;
   if(pr?.base?.ref!=='master'||!releaseBranch(pr.head?.ref)||pr.head?.repo?.full_name!==repo)throw Error('Expected same-repository Release publication PR');
   command='verify';branch=pr.head.ref;head=pr.head.sha;
  }
  if(!['freeze','verify'].includes(command)||!releaseBranch(branch)||!validSha(head))
   throw Error('Usage: node scripts/release-ci.mjs freeze|verify release/<name> <frozen-HEAD>');
  if(command==='freeze') {
   console.log(JSON.stringify(await freezeReleaseFull(repo,branch,head,githubRequest)));
  } else console.log(JSON.stringify(await verifyReleaseFull(repo,branch,head,githubRequest),null,2));
 } catch(error) {console.error(error.message);process.exitCode=1;}
}
