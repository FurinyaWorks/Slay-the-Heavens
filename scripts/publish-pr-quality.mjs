import {readFileSync,mkdtempSync,rmSync,mkdirSync,writeFileSync,appendFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {collectIndependentAiReview,collectCloudGateSource} from './independent-ai-review.mjs';
import {collectPrDelivery,verifyDelivery} from './verify-delivery.mjs';
import {autoMergeErrors} from './arm-auto-merge.mjs';
import {projectRepositoryId,projectRepositoryMatches} from './repository-identity.mjs';
import {main as fullMain,beginFullQuality} from './publish-full-quality.mjs';
import {prFastErrors,collectFastCheckout} from './pr-quality-evidence.mjs';

export const prQualityContext='pr-quality';
function gh(...args){
 const p=spawnSync('gh',args,{encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});
 if(p.error||p.status!==0)throw Error('PR quality query failed: '+(p.error?.message??p.stderr));
 return p.stdout;
}

function hostedMergeSettings(repo,settings,query){
 // The Actions installation may omit repository settings from REST.
 const fields=['allow_auto_merge','allow_squash_merge'];
 const visible=fields.filter(field=>Object.hasOwn(settings,field));
 if(visible.length===fields.length||visible.some(field=>settings[field]!==true))return settings;
 const [owner,name]=repo.split('/');
 const response=JSON.parse(query('api','graphql','-f',
  'query=query($owner:String!,$name:String!){repository(owner:$owner,name:$name){databaseId nameWithOwner autoMergeAllowed squashMergeAllowed}}',
  '-f','owner='+owner,'-f','name='+name));
 const repository=response?.data?.repository;
 if((Object.hasOwn(response??{},'errors')&&(!Array.isArray(response.errors)||response.errors.length))||
  !projectRepositoryMatches({id:repository?.databaseId,full_name:repository?.nameWithOwner},repo))
  throw Error('Native merge settings repository identity could not be confirmed');
 return {...settings,allow_auto_merge:repository.autoMergeAllowed,allow_squash_merge:repository.squashMergeAllowed};
}

export function main(env=process.env,query=gh,{pending=false,loadCheckout}={}){
 const event=JSON.parse(readFileSync(env.GITHUB_EVENT_PATH,'utf8')),pr=event.pull_request;
 if(env.GITHUB_EVENT_NAME!=='pull_request'||pr?.base?.ref!=='develop'||pr.head?.repo?.full_name!==env.GITHUB_REPOSITORY)return;
 if(!pending&&env.FULL_MODE==='full')return fullMain(env,query,{context:prQualityContext,loadCheckout});
 const repo=env.GITHUB_REPOSITORY,head=pr.head.sha,number=pr.number,runId=Number(env.GITHUB_RUN_ID),attempt=Number(env.GITHUB_RUN_ATTEMPT);
 const get=p=>JSON.parse(query('api',`repos/${repo}/${p}`));
 const pages=(p,key)=>JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/${p}`)).flatMap(page=>page[key]);
 const latest=()=>pages(`actions/workflows/quality.yml/runs?event=pull_request&head_sha=${head}&per_page=100`,'workflow_runs')
  .filter(r=>r.head_sha===head&&r.pull_requests?.some(p=>p.number===number)).sort((a,b)=>b.id-a.id)[0];
 const run=get('actions/runs/'+runId),latestRun=latest();
 if(pending)return beginFullQuality({repo,head,number,runId,attempt,run,latestRun,pr:get('pulls/'+number)},query,prQualityContext);
 const current=()=>{
  const active=get('actions/runs/'+runId),newest=latest();
  return newest?.id===runId&&newest.run_attempt===attempt&&active.run_attempt===attempt&&
   active.status==='in_progress'&&active.conclusion==null;
 };
 if(!current())return {state:'superseded'};
 const evidence={repo,head,number,base:pr.base.sha,tested:env.GITHUB_SHA,runId,attempt,run,latestRun,
  mode:env.FULL_MODE,needs:JSON.parse(env.FULL_NEEDS),jobs:pages(`actions/runs/${runId}/jobs?filter=all&per_page=100`,'jobs'),
  pr:get('pulls/'+number),target:get('git/ref/heads/develop').object?.sha,commit:get('commits/'+env.GITHUB_SHA)};
 let errors=env.FULL_MODE==='fast'?[]:['Unknown PR Quality mode'];
 errors.push(...prFastErrors(evidence,{allowRunningAggregate:true,metadataOnly:true}));
 if(!errors.length){
  const dir=mkdtempSync(join(tmpdir(),'abyss-fast-gate-'));
  try{Object.assign(evidence,(loadCheckout??((r,j)=>collectFastCheckout(repo,r,j,dir,query,{allowRunningAggregate:true})))(run,evidence.jobs));}
  catch(error){errors.push(error.message);}
  finally{rmSync(dir,{recursive:true,force:true});}
 }
 if(!current())return {state:'superseded'};
 evidence.run=get('actions/runs/'+runId);evidence.latestRun=latest();evidence.pr=get('pulls/'+number);evidence.target=get('git/ref/heads/develop').object?.sha;
 errors.push(...prFastErrors(evidence,{allowRunningAggregate:true}));
 const state=errors.length?'failure':'success';
 const written=JSON.parse(query('api','--method','POST',`repos/${repo}/statuses/${head}`,
  '-f','state='+state,'-f','context='+prQualityContext,
  '-f','description='+(errors.length?'PR quality unavailable: '+errors[0].slice(0,110):`Exact dual-platform Fast run ${runId}, attempt ${attempt}`),
  '-f',`target_url=https://github.com/${repo}/actions/runs/${runId}`));
 if(written.state!==state||written.context!==prQualityContext)throw Error('PR quality status write readback differs');
 if(errors.length)throw Error(errors.join('\n'));
 return {state,runId,head};
}
// Runs in the existing Licenses workflow. The connector is never a status
// signer. Shadow runs save evidence but cannot release the required status.
export function independentReviewGate(env=process.env,query=gh,{release=false,loadCheckout,proofFile='build/native-ai-review-proof.json'}={}){
 const event=JSON.parse(readFileSync(env.GITHUB_EVENT_PATH,'utf8'));
 const repo=env.GITHUB_REPOSITORY,number=Number(env.AI_REVIEW_PR??event.workflow_run?.pull_requests?.[0]?.number);
 const expectedHead=env.AI_REVIEW_HEAD||event.workflow_run?.head_sha;
 if(!Number.isSafeInteger(number)||number<=0)return {state:'not-requested'};
 const mode=env.AI_REVIEW_MODE||'publish',bootstrap=env.AI_REVIEW_BOOTSTRAP==='true';
 if(!['shadow','publish'].includes(mode))throw Error('Unknown independent review gate mode');
 const get=path=>JSON.parse(query('api',path));
 const api=path=>get(path),prefix='repos/'+repo;
 const settings=get('repositories/'+projectRepositoryId);
 if(!projectRepositoryMatches(settings,repo)||String(env.GITHUB_REPOSITORY_ID)!==String(projectRepositoryId))throw Error('Independent gate only runs in the fixed main repository');
 if(!['workflow_dispatch','workflow_run'].includes(env.GITHUB_EVENT_NAME))throw Error('Gate only accepts native workflow dispatch/completion events');
 if(env.GITHUB_EVENT_NAME==='workflow_run'&&(event.workflow_run?.event!=='pull_request'||event.workflow_run?.path!=='.github/workflows/quality.yml'||event.workflow_run?.repository?.id!==projectRepositoryId))return {state:'not-requested'};
 const pr=get(prefix+'/pulls/'+number);
 if(pr.state!=='open'||pr.merged||pr.base?.ref!=='develop'||pr.head?.sha!==expectedHead)return {state:'superseded'};
 const review=collectIndependentAiReview({api,prNumber:number,expectedHeadSha:expectedHead});
 if(review.conclusion!=='pass')throw Error(review.errors.join('\n'));
 const ruleset=get(prefix+'/rulesets/25870651');
 const policyErrors=autoMergeErrors({repo,settings:hostedMergeSettings(repo,settings,query),pr,ruleset,nativeReview:review});
 if(mode==='publish'&&policyErrors.length)throw Error(policyErrors.join('\n'));
 // The coordinator verified the separate cloud AI session. Source identity is
 // enforced here and again by queue/post-merge consumers of the immutable proof.
 const sourceRun=get(prefix+'/actions/runs/'+Number(env.GITHUB_RUN_ID));
 const source=collectCloudGateSource({api,run:sourceRun,repo,head:review.head,base:review.base,ref:env.GITHUB_REF,bootstrap,coordinator:review.coordinator,reviewedBranch:pr.head.ref,installBaseSha:review.report.installBaseSha});
 const sourceErrors=source.errors;
 if(sourceRun.id!==Number(env.GITHUB_RUN_ID)||sourceRun.run_attempt!==Number(env.GITHUB_RUN_ATTEMPT)||sourceRun.event!==env.GITHUB_EVENT_NAME||sourceRun.head_sha!==env.GITHUB_SHA)sourceErrors.push('Cloud gate source or attempt differs from its actual execution');
 if(bootstrap&&String(env.GITHUB_ACTOR_ID)!==String(review.coordinator.id))sourceErrors.push('Bootstrap execution actor differs from the signing coordinator');
 if(!bootstrap&&env.GITHUB_REF!=='refs/heads/'+settings.default_branch)sourceErrors.push('Cloud gate is not executing the trusted default branch');
 if(sourceErrors.length)throw Error(sourceErrors.join('\n'));
 const legacyReview={repo,prNumber:number,reviewId:review.reviewId,reviewedHeadSha:review.head,reviewedBaseSha:review.base,conclusion:'pass',unresolved:[]};
 const collected=collectPrDelivery(repo,number,legacyReview,query,loadCheckout);
 const errors=verifyDelivery(collected.evidence);
 if(errors.length||collected.evidence.head!==review.head||collected.evidence.base!==review.base||collected.evidence.sourceTree!==review.tree)throw Error('Exact formal test evidence failed: '+errors.join('; '));
 if(env.GITHUB_EVENT_NAME==='workflow_run'&&(event.workflow_run.id!==collected.evidence.runId||event.workflow_run.run_attempt!==collected.evidence.attempt))return {state:'superseded'};
 const current=collectIndependentAiReview({api,prNumber:number,expectedHeadSha:review.head,expectedBaseSha:review.base,expectedTreeSha:review.tree});
 const policyNow=get(prefix+'/rulesets/25870651');
 const freshPr=get(prefix+'/pulls/'+number);
 const settingsNow=get('repositories/'+projectRepositoryId);
 const admissionErrors=autoMergeErrors({repo,settings:hostedMergeSettings(repo,settingsNow,query),pr:freshPr,ruleset:policyNow,nativeReview:current});
 if(!isDeepStrictEqual(pr.labels,freshPr.labels)||pr.changed_files!==freshPr.changed_files||mode==='publish'&&admissionErrors.length)throw Error('PR labels, files or native admission changed during evidence collection');
 if(!isDeepStrictEqual(current,review)||!isDeepStrictEqual(policyNow,ruleset)||settings.default_branch!==settingsNow.default_branch)throw Error('Review or native policy changed during evidence collection');
 const envelope={schemaVersion:1,kind:'native-ai-review-proof',mode,state:mode==='publish'?'pr_passed':'shadow_verified',repo,prNumber:number,head:review.head,base:review.base,nativeReview:review,nativePolicy:ruleset,sourceObservations:source.observations,preflight:collected.evidence,gate:{runId:Number(env.GITHUB_RUN_ID),attempt:Number(env.GITHUB_RUN_ATTEMPT),ref:env.GITHUB_REF,bootstrap},policyErrors};
 if(!release){mkdirSync(resolve(proofFile,'..'),{recursive:true});writeFileSync(proofFile,JSON.stringify(envelope,null,2)+'\n');return {state:envelope.state,policyErrors};}
 if(mode!=='publish')return {state:'shadow-no-status'};
 const saved=JSON.parse(readFileSync(proofFile,'utf8'));
 if(!isDeepStrictEqual(saved,envelope))throw Error('Uploaded proof differs from the fresh current gate evidence');
 const artifactId=Number(env.AI_REVIEW_ARTIFACT_ID),runId=Number(env.GITHUB_RUN_ID),attempt=Number(env.GITHUB_RUN_ATTEMPT);
 const artifact=get(prefix+'/actions/artifacts/'+artifactId),run=get(prefix+'/actions/runs/'+runId);
 if(!Number.isSafeInteger(artifactId)||artifact.id!==artifactId||artifact.expired!==false||artifact.name!==`independent-review-${number}-${review.head.slice(0,12)}-${runId}-${attempt}`||artifact.workflow_run?.id!==runId||!/^sha256:[a-f0-9]{64}$/.test(artifact.digest??'')||artifact.workflow_run?.head_sha!==env.GITHUB_SHA||run.id!==runId||run.run_attempt!==attempt||run.event!==env.GITHUB_EVENT_NAME||run.head_sha!==env.GITHUB_SHA||run.status!=='in_progress'||run.path!=='.github/workflows/licenses.yml'||run.repository?.id!==projectRepositoryId)throw Error('Immutable proof artifact or current gate run identity differs');
 const description=`AI review ${review.githubReviewId} [base:${review.base}] [proof:${artifactId}]`;
 const status=getStatusWrite(query,repo,review.head,description,runId);
 if(status.context!=='independent-review'||status.state!=='success'||status.creator?.id!==41898282)throw Error('Required independent-review status source/readback differs');
 return {state:'published',head:review.head,artifactId,reviewId:review.githubReviewId};
}
function getStatusWrite(query,repo,head,description,runId){return JSON.parse(query('api','--method','POST',`repos/${repo}/statuses/${head}`,'-f','state=success','-f','context=independent-review','-f','description='+description,'-f',`target_url=https://github.com/${repo}/actions/runs/${runId}`));}
export function independentReviewProofReady(result){
 if(['pr_passed','shadow_verified'].includes(result?.state))return true;
 if(['not-requested','superseded'].includes(result?.state))return false;
 throw Error('Unexpected independent review preparation result');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const result=process.argv[2]==='--independent-review'||process.argv[2]==='--release-independent-review'?
   independentReviewGate(process.env,gh,{release:process.argv[2]==='--release-independent-review'}):main(process.env,gh,{pending:process.argv[2]==='--pending'});
  if(process.argv[2]==='--independent-review'){
   const ready=independentReviewProofReady(result);
   if(process.env.GITHUB_OUTPUT)appendFileSync(process.env.GITHUB_OUTPUT,`proof_ready=${ready}\n`);
  }
  console.log(JSON.stringify(result));
 }
 catch(error){console.error(error.message);process.exitCode=1;}
}
