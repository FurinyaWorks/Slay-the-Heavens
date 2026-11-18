import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {currentFullQualityJobs,qualityWorkflowPath} from '../../scripts/verify-delivery.mjs';
import {INDEPENDENT_AI_REVIEW_MARKER,validateIndependentAiReview} from '../../scripts/independent-ai-review.mjs';
const sha=c=>c.repeat(40),repo='FurinyaWorks/Slay-the-Abyss';
// Complete immutable Git object metadata returned by the actual tree endpoints.
export function uninstalledReviewBase(base){
 return {commit:{sha:base,tree:{sha:sha('6')}},
  root:{sha:sha('6'),truncated:false,tree:[{path:'scripts',mode:'040000',type:'tree',sha:sha('7')}]},
  scripts:{sha:sha('7'),truncated:false,tree:[{path:'arm-auto-merge.mjs',mode:'100644',type:'blob',sha:sha('8')}]}};
}
export function admissionFixture(repoName=repo,base=sha('b')){
 const head=sha('a'),prHead=sha('c');
 const env={GITHUB_EVENT_NAME:'merge_group',GITHUB_REPOSITORY:repoName,
  GITHUB_SHA:head,GITHUB_REF:'refs/heads/gh-readonly-queue/develop/pr-510-a',
  GITHUB_RUN_ID:'7',GITHUB_RUN_ATTEMPT:'1',FULL_MODE:'full'};
 const event={action:'checks_requested',repository:{id:1429751262,full_name:repoName},
  merge_group:{head_sha:head,head_ref:env.GITHUB_REF,base_sha:base,base_ref:'refs/heads/develop'}};
 const run={id:7,run_attempt:1,event:'merge_group',head_sha:head,status:'in_progress',path:qualityWorkflowPath,repository:{full_name:repoName}};
 const needs={impact:{result:'success'},rules:{result:'success'},fast:{result:'skipped'},presentation:{result:'success'},'engineering-posix':{result:'success'}};
 env.FULL_NEEDS=JSON.stringify(needs);
 const jobs=currentFullQualityJobs.map((name,i)=>({name,id:100+i,run_id:7,run_attempt:1,head_sha:head,
  status:name==='check'?'in_progress':'completed',conclusion:name==='check'?null:name==='fast'?'skipped':'success'}));
 const ruleset={id:25870651,updated_at:'2026-11-04T17:51:23.025+08:00',target:'branch',enforcement:'active',bypass_actors:[],conditions:{ref_name:{include:['refs/heads/develop'],exclude:[]}},
  rules:[{type:'merge_queue',parameters:{merge_method:'SQUASH',grouping_strategy:'ALLGREEN'}},
   {type:'required_status_checks',parameters:{strict_required_status_checks_policy:true,required_status_checks:
    ['check','presentation','engineering-posix','inventory','full-quality','independent-review'].map(context=>({context,integration_id:context==='independent-review'?null:15368}))}},
   {type:'pull_request',parameters:{allowed_merge_methods:['squash'],required_review_thread_resolution:true,required_approving_review_count:0,dismiss_stale_reviews_on_push:false,require_code_owner_review:false}},
   {type:'required_linear_history'}]};
 const artifact={id:42,name:'quality-7-1-check',expired:false,workflow_run:{id:7,head_sha:head}};
 const checkout={schemaVersion:1,event:'merge_group',runId:7,attempt:1,tested:head,head,base,parents:[base]};
 const pr={number:510,node_id:'PR_510',user:{id:337201427,login:'v5g95m7t8m-max'},state:'open',merged:false,draft:false,mergeable:true,merge_commit_sha:sha('d'),head:{sha:prHead,ref:'feat/queue-proof',repo:{id:1429751262,full_name:repoName}},
  base:{sha:base,ref:'develop',repo:{id:1429751262,full_name:repoName}},labels:[],body:'Depends-on: none'};
 const reviewer={id:337201427,login:'v5g95m7t8m-max'};
 const report={schemaVersion:1,kind:'independent-ai-review',repositoryId:1429751262,repositoryFullName:repoName,
  prNumber:510,reviewedHeadSha:prHead,reviewedBaseSha:base,reviewedTreeSha:sha('e'),conclusion:'pass',unresolved:[],
  reviewerAgent:'/root/queue_review',implementationAgents:['/root/implementer'],
  coordinator:{...reviewer,verifiedActualSessions:true},
  provenance:{kind:'coordinator-verified-agent-session',reviewId:'/root/queue_review/fixture',sessionId:'fixture-queue-session'}};
 const review={id:90,state:'COMMENTED',commit_id:prHead,submitted_at:'2026-11-17T10:00:00Z',user:reviewer};
 const sourceCommit={sha:sha('d'),tree:{sha:sha('e')},parents:[{sha:base},{sha:prHead}]};
 const entry={id:'ENTRY_510',position:1,state:'AWAITING_CHECKS',enqueuer:{databaseId:51,login:'native-enqueuer'},baseCommit:{oid:base},headCommit:{oid:head},
  pullRequest:{number:510,headRefOid:prHead,baseRefName:'develop',isDraft:false,state:'OPEN',mergeQueueEntry:{id:'ENTRY_510'}}};
 const repository={databaseId:1429751262,nameWithOwner:repoName,ref:{target:{oid:base}},
  mergeQueue:{entries:{nodes:[entry],pageInfo:{hasNextPage:false}}}};
 const permission={permission:'write',role_name:'maintain',user:reviewer};
 const proofRepo={id:1429751262,full_name:repoName},target={ref:'refs/heads/develop',object:{type:'commit',sha:base}};
 const snapshot={...structuredClone(pr),authorId:pr.user.id};delete snapshot.user;
 const proofReviews=[{...review,body:INDEPENDENT_AI_REVIEW_MARKER+'\n'+JSON.stringify(report)}];
 const nativeReview={...validateIndependentAiReview({repository:proofRepo,pr,baseSha:base,sourceCommit,
  reviews:proofReviews,permissions:{[reviewer.id]:permission},dependencies:[]}),
  observations:{prBefore:snapshot,prAfter:structuredClone(snapshot),targetBefore:target,targetAfter:structuredClone(target),
   sourceCommit:structuredClone(sourceCommit),reviews:proofReviews,permissions:{[reviewer.id]:structuredClone(permission)},dependencies:[]}};
 const proofRun={id:60,run_attempt:1,path:'.github/workflows/licenses.yml',event:'workflow_dispatch',status:'completed',
  conclusion:'success',repository:proofRepo,head_branch:'develop',head_sha:base};
 const prRun={id:61,run_attempt:1,event:'pull_request',head_sha:prHead,path:qualityWorkflowPath,repository:proofRepo,
  status:'completed',conclusion:'success',pull_requests:[{number:510}]};
 const preflight={schemaVersion:3,repo:repoName,head:prHead,base,tested:pr.merge_commit_sha,sourceTree:report.reviewedTreeSha,
  baseRef:'develop',runId:61,attempt:1,event:'pull_request',prNumber:510,parents:[base,prHead],targetBeforeSha:base,targetAfterSha:base,
  checkout:{schemaVersion:1,head:prHead,base,tested:pr.merge_commit_sha,runId:61,attempt:1,event:'pull_request',prNumber:510,parents:[base,prHead]},
  testedCommit:{sha:pr.merge_commit_sha,parents:[{sha:base},{sha:prHead}],commit:{tree:{sha:report.reviewedTreeSha}}},
  run:prRun,currentRun:structuredClone(prRun),jobs:currentFullQualityJobs.map((name,i)=>({id:800+i,name,status:'completed',
   conclusion:name==='fast'?'skipped':'success',run_attempt:1,run_id:61,head_sha:prHead})),
  checkoutArtifact:{id:81,name:'quality-61-1-check',expired:false,workflow_run:{id:61,head_sha:prHead}},
  review:{reviewedHeadSha:prHead,reviewedBaseSha:base,reviewId:report.provenance.reviewId,conclusion:'pass',unresolved:[]}};
 const proof={schemaVersion:1,kind:'native-ai-review-proof',mode:'publish',state:'pr_passed',repo:repoName,prNumber:510,
  head:prHead,base,nativeReview,preflight,gate:{runId:60,attempt:1,ref:'refs/heads/develop',bootstrap:false},policyErrors:[]};
 const proofArtifact={id:80,name:`independent-review-510-${prHead.slice(0,12)}-60-1`,expired:false,
  digest:'sha256:'+'0'.repeat(64),workflow_run:{id:60,head_sha:base,repository_id:1429751262,head_repository_id:1429751262}};
 const proofStatus={id:92,context:'independent-review',state:'success',creator:{id:41898282,login:'github-actions[bot]'},
  created_at:'2026-11-17T10:01:00Z',description:`AI review 90 [base:${base}] [proof:80]`,target_url:`https://github.com/${repoName}/actions/runs/60`};
 const groupCommit={sha:head,parents:[{sha:base}],commit:{tree:{sha:sha('9')}}};
 const ancestry={[base+'...'+base]:{status:'identical',base_commit:{sha:base},merge_base_commit:{sha:base}}};
 const headInstallation=uninstalledReviewBase(prHead);headInstallation.commit.tree.sha=headInstallation.root.sha=sha('1');
 headInstallation.root.tree[0].sha=headInstallation.scripts.sha=sha('2');
 headInstallation.scripts.tree.push({path:'independent-ai-review.mjs',mode:'100644',type:'blob',sha:sha('9')});
 const mergeBaseInstallation=uninstalledReviewBase(base),comparison={status:'ahead',base_commit:{sha:base},merge_base_commit:{sha:base}};
 return {env,event,run,needs,jobs,ruleset,artifact,checkout,pr,review,report,sourceCommit,entry,repository,permission,
  proof,proofRun,proofArtifact,proofStatus,headInstallation,mergeBaseInstallation,comparison,groupCommit,ancestry};
}
export function admissionQuery(f,writes=[]){
 return (...args)=>{
  const url=args.find(a=>typeof a==='string'&&a.startsWith('repos/'))??'';
  if(args[0]==='api'&&args[1]==='graphql')return JSON.stringify({data:{repository:f.repository}});
  if(args.includes('repositories/1429751262'))return JSON.stringify(f.event.repository);
  if(args.includes('POST')){
   const state=args.find(a=>a.startsWith('state=')).slice(6),context=args.find(a=>a.startsWith('context=')).slice(8);
   writes.push({state,context});return JSON.stringify({state,context});
  }
  if(args[0]==='run'&&args[1]==='download'){
   const name=args.includes(f.proofArtifact.name)?'native-ai-review-proof.json':'ci-checkout.json';
   writeFileSync(join(args[args.indexOf('--dir')+1],name),JSON.stringify(name==='ci-checkout.json'?f.checkout:f.proof));return '';
  }
  if(url.endsWith('/rulesets/25870651'))return JSON.stringify(f.ruleset);
  if(url.endsWith('/actions/runs/60'))return JSON.stringify(f.proofRun);
  if(url.endsWith('/actions/artifacts/'+f.proofArtifact.id))return JSON.stringify(f.proofArtifact);
  if(url.includes('/actions/runs/60/artifacts?'))return JSON.stringify([{artifacts:[f.proofArtifact]}]);
  if(url.endsWith('/actions/runs/7'))return JSON.stringify(f.run);
  if(url.includes('/actions/workflows/')&&url.includes('event=pull_request')&&f.prRun)return JSON.stringify([{workflow_runs:[f.prRun]}]);
  if(url.includes('/actions/workflows/'))return JSON.stringify([{workflow_runs:[f.run]}]);
  if(url.includes('/actions/runs/7/jobs?'))return JSON.stringify([{jobs:f.jobs}]);
  if(url.includes('/artifacts?'))return JSON.stringify([{artifacts:[f.artifact]}]);
  if(url.endsWith('/actions/artifacts/42'))return JSON.stringify(f.artifact);
  if(url.endsWith('/pulls/510'))return JSON.stringify(f.pr);
  if(url.includes('/pulls/510/reviews?')){
   const page=Number(new URL('https://api.github.com/'+url).searchParams.get('page'));
   const reviews=f.reviews??[{...f.review,body:f.review.body??INDEPENDENT_AI_REVIEW_MARKER+'\n'+JSON.stringify(f.report)}];
   return JSON.stringify(reviews.slice((page-1)*100,page*100));
  }
  const compared=url.split('/compare/')[1];
  if(compared&&Object.hasOwn(f.ancestry,compared))return JSON.stringify(f.ancestry[compared]);
  if(url.endsWith(`/compare/${f.repository.ref.target.oid}...${f.pr.head.sha}`))return JSON.stringify(f.comparison);
  for(const installation of [f.installation,f.headInstallation,f.mergeBaseInstallation].filter(Boolean)){
   if(url.endsWith('/git/commits/'+installation.commit.sha))return JSON.stringify(installation.commit);
   if(url.endsWith('/git/trees/'+installation.commit.tree.sha))return JSON.stringify(installation.root);
   if(url.endsWith('/git/trees/'+installation.root.tree.find(row=>row.path==='scripts')?.sha))return JSON.stringify(installation.scripts);
  }
  if(url.endsWith('/git/commits/'+f.pr.merge_commit_sha))return JSON.stringify(f.sourceCommit);
  if(url.endsWith('/git/ref/heads/develop'))return JSON.stringify({ref:'refs/heads/develop',object:{type:'commit',sha:f.event.merge_group.base_sha}});
  if(url.includes('/collaborators/')){
   const operator=f.enqueuerPermission;
   if(operator&&url.includes('/collaborators/'+encodeURIComponent(f.entry.enqueuer.login)+'/'))return JSON.stringify(operator);
   return JSON.stringify(f.permission);
  }
  if(url.endsWith('/commits/'+f.env.GITHUB_SHA))return JSON.stringify(f.groupCommit);
  if(url.includes(`/commits/${f.pr.head.sha}/statuses?`))return JSON.stringify([[...(f.proofStatus?[f.proofStatus]:[]),...(f.qualityStatus?[f.qualityStatus]:[])]]);
  if(url.endsWith('/git/ref/heads/'+f.env.GITHUB_REF.slice('refs/heads/'.length)))
   return JSON.stringify({ref:f.env.GITHUB_REF,object:{type:'commit',sha:f.env.GITHUB_SHA}});
  if(url.endsWith('/pulls/999'))return JSON.stringify({number:999,merged:false});
  throw Error('Unexpected query: '+args.join(' '));
 };
}
