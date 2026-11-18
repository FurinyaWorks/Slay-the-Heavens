import {readFileSync,mkdirSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {projectRepositoryId,currentProjectRepository,projectRepositoryMatches} from './repository-identity.mjs';
import {collectIndependentAiReview,parseIndependentAiReview,independentAiReportErrors,INDEPENDENT_AI_REVIEW_MARKER,TRUSTED_REVIEW_COORDINATOR_IDS} from './independent-ai-review.mjs';
export {parseDependencies} from './independent-ai-review.mjs';
export const reviewContext='independent-review';
export const requiredContexts=['check','presentation','engineering-posix','inventory',reviewContext,'pr-quality'];
const validSha=s=>typeof s==='string'&&/^[a-f0-9]{40}$/.test(s);
function gh(...args){
 const p=spawnSync('gh',args,{encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});
 if(p.error||p.status!==0)throw Error('GitHub CLI failed: '+(p.error?.message??p.stderr));
 return p.stdout;
}
const json=(query,...args)=>JSON.parse(query(...args));

export function queueBypassActorsAllowed(ruleset,{allowAdministratorPullRequest=false}={}) {
 if(!Object.hasOwn(ruleset??{},'bypass_actors'))return true; // Redacted metadata.
 const actors=ruleset.bypass_actors;
 return Array.isArray(actors)&&(actors.length===0||allowAdministratorPullRequest&&
  isDeepStrictEqual(actors,[{actor_id:5,actor_type:'RepositoryRole',bypass_mode:'pull_request'}]));
}

// GitHub owns merge authorization. This adapter validates the real independent
// cloud AI report signed by the existing trusted coordinator and dispatches the existing CI gate; it never posts commit statuses.
export function mergePolicyErrors({repo,settings,pr,ruleset}){
 const errors=[];
 if(!projectRepositoryMatches(settings,repo)||!projectRepositoryMatches(pr?.head?.repo,repo)||!projectRepositoryMatches(pr?.base?.repo,repo))errors.push('Unexpected project repository identity');
 if(settings?.allow_auto_merge!==true||settings?.allow_squash_merge!==true)errors.push('Native auto-merge and squash must be enabled');
 if(pr?.state!=='open'||pr.merged||pr.draft||pr.mergeable!==true||pr.base?.ref!=='develop')errors.push('PR must be ready, mergeable and target develop');
 if((pr?.labels??[]).some(l=>['hold','blocked','do-not-merge','manual-merge','merge:manual','risk:critical'].includes((typeof l==='string'?l:l.name)?.toLowerCase())))errors.push('PR has a manual/blocked merge label');
 const rules=ruleset?.rules??[],checks=rules.find(r=>r.type==='required_status_checks')?.parameters;
 if(ruleset?.id!==25870651||ruleset.target!=='branch'||ruleset.enforcement!=='active'||!isDeepStrictEqual(ruleset.conditions?.ref_name,{include:['refs/heads/develop'],exclude:[]}))errors.push('Active develop ruleset is missing');
 if(checks?.strict_required_status_checks_policy!==true)errors.push('Strict required checks must remain enabled');
 for(const context of requiredContexts)if(!checks?.required_status_checks?.some(c=>c.context===context&&(context===reviewContext||c.integration_id===15368)))errors.push('Required check/source missing: '+context);
 const q=rules.filter(r=>r.type==='merge_queue'),pull=rules.find(r=>r.type==='pull_request')?.parameters;
 if(q.length!==1||q[0].parameters?.merge_method!=='SQUASH'||q[0].parameters?.grouping_strategy!=='ALLGREEN')errors.push('Native SQUASH ALLGREEN queue must remain enabled');
 if(!isDeepStrictEqual(pull?.allowed_merge_methods,['squash'])||pull.required_review_thread_resolution!==true||!rules.some(r=>r.type==='required_linear_history'))errors.push('Squash, resolved threads and linear history must remain enabled');
 if(!queueBypassActorsAllowed(ruleset,{allowAdministratorPullRequest:true}))errors.push('Unexpected explicit bypass actors');
 return errors;
}
export function autoMergeErrors(options){
 const errors=mergePolicyErrors(options),review=options.nativeReview;
 if(review?.conclusion!=='pass')errors.push(...(review?.errors??['A trusted signed cloud AI review record is required']));
 return errors;
}
// A complete report is an explicit attestation by the current trusted cloud
// coordinator, who verified the actual independent session. The payload check
// alone is not authorization: eligibility is collected again from real server
// records after signing. Repeated commands reuse the same report identity and
// cannot silently repost an old pass over a later rejection.
export function signCloudReview(repo,number,report,query=gh,{dryRun=false}={}){
 const api=path=>json(query,'api',path),repository=api('repositories/'+projectRepositoryId),actor=api('user');
 if(!TRUSTED_REVIEW_COORDINATOR_IDS.includes(actor?.id)||typeof actor.login!=='string'||!/^[-a-z0-9]+$/i.test(actor.login))throw Error('Only the existing trusted cloud coordinator can attest an actual review');
 const permission=api(`repos/${repo}/collaborators/${actor.login}/permission`),role=permission.role_name??permission.permission;
 if(permission.user?.id!==actor.id||permission.user.login!==actor.login||!(role==='admin'&&permission.permission==='admin'||role==='maintain'&&['write','maintain'].includes(permission.permission)))throw Error('Current coordinator must retain maintain/admin authority');
 const pr=api(`repos/${repo}/pulls/${number}`),target=api(`repos/${repo}/git/ref/heads/develop`),ruleset=api(`repos/${repo}/rulesets/25870651`);
 const policyErrors=mergePolicyErrors({repo,settings:repository,pr,ruleset});
 if(target.ref!=='refs/heads/develop'||target.object?.type!=='commit'||target.object.sha!==pr.base?.sha)policyErrors.push('Actual BASE changed before cloud attestation');
 if(policyErrors.length)throw Error(policyErrors.join('\n'));
 const sourceCommit=api(`repos/${repo}/git/commits/${pr.merge_commit_sha}`);
 const payloadErrors=independentAiReportErrors(report,{repository,pr,baseSha:target.object.sha,sourceCommit,coordinator:actor});
 if(payloadErrors.length)throw Error(payloadErrors.join('\n'));
 const prior=[];
 for(let page=1;;page++){
  const rows=api(`repos/${repo}/pulls/${number}/reviews?per_page=100&page=${page}`);if(!Array.isArray(rows))throw Error('Complete server-side review records required');
  prior.push(...rows);if(prior.some(row=>!Number.isSafeInteger(row?.id)||row.id<=0)||new Set(prior.map(row=>row.id)).size!==prior.length)throw Error('Malformed or duplicate server-side review page');
  if(rows.length<100)break;
 }
 const sameId=prior.filter(row=>{
  if(row.user?.id!==actor.id)return false;
  try{return parseIndependentAiReview(row.body)?.provenance?.reviewId===report.provenance.reviewId;}catch{return false;}
 });
 if(sameId.length){
  if(sameId.some(row=>row.commit_id!==pr.head.sha||!isDeepStrictEqual(parseIndependentAiReview(row.body),report)))throw Error('Review identity already belongs to different evidence; obtain a fresh actual independent review');
  return {githubReviewId:sameId.sort((a,b)=>b.id-a.id)[0].id,reused:true};
 }
 if(dryRun)throw Error('Report is not yet signed on GitHub; dry-run cannot authorize an unsigned local JSON');
 const dir=mkdtempSync(join(tmpdir(),'cloud-review-attestation-'));
 try{
  const file=join(dir,'review.json');writeFileSync(file,JSON.stringify({commit_id:pr.head.sha,event:'COMMENT',body:INDEPENDENT_AI_REVIEW_MARKER+'\n'+JSON.stringify(report,null,2)}));
  const written=json(query,'api','--method','POST',`repos/${repo}/pulls/${number}/reviews`,'--input',file);
  if(!Number.isSafeInteger(written.id)||written.id<=0||written.state!=='COMMENTED'||written.user?.id!==actor.id||written.commit_id!==pr.head.sha)throw Error('GitHub cloud attestation identity was not confirmed');
  return {githubReviewId:written.id,reused:false};
 }finally{rmSync(dir,{recursive:true,force:true});}
}
export function collectEligibility(repo,number,review,query=gh){
 const api=path=>json(query,'api',path),settings=api('repositories/'+projectRepositoryId);
 const nativeReview=collectIndependentAiReview({api,prNumber:number});
 const pr=api('repos/'+repo+'/pulls/'+number),ruleset=api('repos/'+repo+'/rulesets/25870651');
 const errors=autoMergeErrors({repo,settings,pr,ruleset,nativeReview});
 const id=typeof review==='number'?review:review?.githubReviewId;
 if(!Number.isSafeInteger(id)||id!==nativeReview.githubReviewId)errors.push('Requested server-side Review ID differs from the verified native approval');
 if(pr.head?.sha!==nativeReview.head||pr.base?.sha!==nativeReview.base||pr.merge_commit_sha!==nativeReview.mergeCommitSha)errors.push('PR changed during native review collection');
 return {pr,ruleset,nativeReview,errors,headSha:nativeReview.head,baseSha:nativeReview.base,sourceTree:nativeReview.tree,tested:nativeReview.mergeCommitSha,defaultBranch:settings.default_branch};
}
function dispatchGate(repo,number,current,query,{shadow=false,bootstrapRef}={}){
 const ref=bootstrapRef??current.defaultBranch;
 if(!ref||ref.startsWith('refs/')||bootstrapRef&&bootstrapRef!==current.pr.head.ref)throw Error('Gate must use the trusted default branch or the exact explicitly approved bootstrap branch');
 const dir=mkdtempSync(join(tmpdir(),'native-review-dispatch-'));
 try{
  const file=join(dir,'request.json');writeFileSync(file,JSON.stringify({ref,inputs:{ai_review_pr:String(number),ai_review_head:current.headSha,ai_review_mode:shadow?'shadow':'publish',ai_review_bootstrap:!!bootstrapRef}}));
  query('api','--method','POST',`repos/${repo}/actions/workflows/licenses.yml/dispatches`,'--input',file);
 }finally{rmSync(dir,{recursive:true,force:true});}
 return 'refs/heads/'+ref;
}
export function armAutoMerge(repo,number,review,query=gh,{dryRun=false,shadow=false,bootstrapRef,persist=()=>{}}={}){
 const before=collectEligibility(repo,number,review,query);
 const blocking=record=>record.errors;
 if(blocking(before).length)throw Error(blocking(before).join('\n'));
 const current=collectEligibility(repo,number,review,query);
 if(blocking(current).length||!isDeepStrictEqual(before,current))throw Error('PR, native Review or policy changed before activation');
 const runs=json(query,'api','--paginate','--slurp',`repos/${repo}/actions/workflows/quality.yml/runs?event=pull_request&head_sha=${current.headSha}&per_page=100`).flatMap(p=>p.workflow_runs)
  .filter(r=>r.head_sha===current.headSha&&r.path==='.github/workflows/quality.yml'&&r.pull_requests?.some(p=>p.number===number)).sort((a,b)=>b.id-a.id);
 const run=runs[0];
 if(!run||run.status==='completed'&&run.conclusion!=='success')throw Error('Current formal Quality CI is missing, failed or cancelled');
 const jobs=json(query,'api','--paginate','--slurp',`repos/${repo}/actions/runs/${run.id}/jobs?filter=latest&per_page=100`).flatMap(p=>p.jobs);
 if(jobs.some(j=>['failure','cancelled','timed_out','action_required'].includes(j.conclusion)))throw Error('Current formal Quality job failed');
 if(dryRun)return {state:'eligible',head:current.headSha,base:current.baseSha};
 if(run.status!=='completed'&&(shadow||bootstrapRef))throw Error('Exact formal CI must finish before shadow or first-installation proof dispatch');
 // Once installed, the existing workflow_run callback releases proof after CI.
 // Avoid dispatching a guaranteed-to-fail gate while formal tests are pending.
 const gateRef=run.status==='completed'?dispatchGate(repo,number,current,query,{shadow,bootstrapRef}):'refs/heads/'+current.defaultBranch;
 if(shadow)return {state:'shadow-requested',head:current.headSha,base:current.baseSha,gateRef};
 const proof={schemaVersion:9,kind:'native-auto-merge-intent',repo,repositoryId:projectRepositoryId,prNumber:number,baseRef:'develop',head:current.headSha,base:current.baseSha,sourceTree:current.sourceTree,githubReviewId:current.nativeReview.githubReviewId,gateRef,nativeAuto:{confirmed:false,state:'prepared'},createdAt:new Date().toISOString()};
 persist({state:'prepared',proof});
 try{
 // expectedHeadOid prevents a new push from being armed. Required Checks and
 // the real independent-review Required Check remain responsible for the actual merge.
 let enableError;
 try{const enabled=json(query,'api','graphql','-f','query=mutation($id:ID!,$head:GitObjectID!){enablePullRequestAutoMerge(input:{pullRequestId:$id,expectedHeadOid:$head,mergeMethod:SQUASH}){pullRequest{number}}}', '-f','id='+current.pr.node_id,'-f','head='+current.headSha);
 if(enabled.errors?.length)throw Error('Native auto-merge enable failed: '+JSON.stringify(enabled.errors));
 }catch(error){enableError=error;}
 // An error may arrive after GitHub committed the mutation. Read actual state
 // once; only the exact native intent can convert an uncertain reply to success.
 const after=json(query,'api',`repos/${repo}/pulls/${number}`);
 if(after.head?.sha!==current.headSha||after.base?.ref!=='develop'||after.node_id!==current.pr.node_id)throw Error('PR identity changed after native enable');
 let native;
 if(after.merged){
  const commit=json(query,'api',`repos/${repo}/commits/${after.merge_commit_sha}`);
  if(!isDeepStrictEqual(commit.parents?.map(p=>p.sha),[current.baseSha])||commit.commit?.tree?.sha!==current.sourceTree)throw Error('Native merge differs from reviewed squash');
  native={confirmed:true,state:'merged',sha:after.merge_commit_sha};
 }else{
  if(after.base.sha!==current.baseSha||after.merge_commit_sha!==current.tested)throw Error('PR proposal changed after native enable');
  const node=readNativeQueueState(repo,number,after,query,true);
  if(!node.isInMergeQueue&&!node.autoMergeRequest)throw enableError??Error('Native auto-merge/queue request was not confirmed');
  native={confirmed:true,state:node.isInMergeQueue?'queued':'waiting',queueId:node.mergeQueue.id,entryId:node.mergeQueueEntry?.id??null};
 }

 proof.nativeAuto=native;
 const result={state:native.state==='merged'?'merged':'auto-merge-requested',head:proof.head,base:proof.base,proof};persist(result);return result;
 }catch(error){
  const cleanup=[];
  try{
   const active=json(query,'api',`repos/${repo}/pulls/${number}`);
   if(active.node_id!==current.pr.node_id||active.number!==number||active.state!=='open'||active.merged||active.base?.ref!=='develop'||!projectRepositoryMatches(active.head?.repo,repo)||!projectRepositoryMatches(active.base?.repo,repo))throw Error('Cannot safely identify an open native request for cleanup');
   cancelNativeMerge(repo,number,active,query);
  }catch(failure){cleanup.push('native cancellation uncertain: '+failure.message);}
  persist({state:'activation-failed',proof,error:error.message,cleanup});
  throw Error(error.message+(cleanup.length?'\n'+cleanup.join('\n'):''));
 }
}
function readNativeQueueState(repo,number,pr,query,requirePolicy=false){
    const result=json(query,'api','graphql','-f','query=query($id:ID!){node(id:$id){... on PullRequest{id number state baseRefName headRefOid repository{databaseId nameWithOwner} isInMergeQueue '+
      (requirePolicy?'isMergeQueueEnabled autoMergeRequest{mergeMethod} mergeQueue{id configuration{mergeMethod mergingStrategy}} mergeQueueEntry{id state mergeQueue{id} pullRequest{id number headRefOid baseRefName}}':'mergeQueueEntry{id}')+'}}}',
      '-f','id='+pr.node_id),node=result?.data?.node;
    if(result?.errors?.length||!node||node.id!==pr.node_id||node.number!==number||node.state!=='OPEN'||
      node.baseRefName!=='develop'||node.headRefOid!==pr.head.sha||
      node.repository?.databaseId!==projectRepositoryId||node.repository?.nameWithOwner!==repo||
      typeof node.isInMergeQueue!=='boolean'||
      (node.isInMergeQueue?typeof node.mergeQueueEntry?.id!=='string'||!node.mergeQueueEntry.id:
        node.mergeQueueEntry!==null))
      throw Error('Native queue identity/capability could not be confirmed');
    if(requirePolicy){
      const queue=node.mergeQueue,entry=node.mergeQueueEntry,p=entry?.pullRequest;
      if(node.isMergeQueueEnabled!==true||typeof queue?.id!=='string'||!queue.id||
        queue.configuration?.mergeMethod!=='SQUASH'||queue.configuration?.mergingStrategy!=='ALLGREEN'||
        node.isInMergeQueue&&(!['QUEUED','AWAITING_CHECKS','MERGEABLE','LOCKED'].includes(entry.state)||
          entry.mergeQueue?.id!==queue.id||p?.id!==pr.node_id||p.number!==number||p.headRefOid!==pr.head.sha||p.baseRefName!=='develop'))
        throw Error('Native queue policy or entry identity could not be confirmed');
    }
    return node;
}

// --disable-auto only cancels the waiting request. An existing native entry
// needs its own dequeue and both surfaces must be read back before success.
function cancelNativeMerge(repo,number,before,query){
  const state=readNativeQueueState(repo,number,before,query);
  if(state.isInMergeQueue){
    const removed=json(query,'api','graphql','-f','query=mutation($id:ID!){dequeuePullRequest(input:{id:$id}){mergeQueueEntry{id}}}',
      '-f','id='+before.node_id);
    if(removed?.errors?.length||removed?.data?.dequeuePullRequest?.mergeQueueEntry?.id!==state.mergeQueueEntry.id)
      throw Error('Native queue dequeue failed or was not confirmed');
    if(readNativeQueueState(repo,number,before,query).isInMergeQueue)throw Error('Native queue removal was not confirmed');
  }
  query('pr','merge',String(number),'--repo',repo,'--disable-auto');
  const after=json(query,'api',`repos/${repo}/pulls/${number}`);
  if(after.number!==number||after.state!=='open'||after.merged||after.auto_merge!==null||after.base?.ref!=='develop'||!validSha(after.head?.sha)||
    !projectRepositoryMatches(after.head?.repo,repo)||!projectRepositoryMatches(after.base?.repo,repo))
    throw Error('Native auto-merge cancellation was not confirmed; PR may already be merged');
  if(after.node_id!==before.node_id||readNativeQueueState(repo,number,after,query).isInMergeQueue)throw Error('Native queue removal was not confirmed');
  return after;
}

export function pauseAutoMerge(repo,number,query=gh){
 const before=json(query,'api',`repos/${repo}/pulls/${number}`);
 if(before.number!==number||before.state!=='open'||before.merged||before.base?.ref!=='develop'||!validSha(before.head?.sha)||!projectRepositoryMatches(before.head?.repo,repo)||!projectRepositoryMatches(before.base?.repo,repo))throw Error('Pause requires the open same-repository develop PR');
 const after=cancelNativeMerge(repo,number,before,query);
 return {state:'paused',prNumber:number,head:after.head.sha};
}
export function main(args=process.argv.slice(2),query=gh){
 const [numberArg,reviewArg,...flags]=args,number=Number(numberArg),repo=currentProjectRepository(query).full_name;
 if(!/^[1-9][0-9]*$/.test(numberArg??''))throw Error('Usage: merge:auto <PR> <GitHub-Review-record-ID|review.json> [--dry-run|--shadow] [--bootstrap-ref=branch]');
 if(reviewArg==='--pause'&&!flags.length){const r=pauseAutoMerge(repo,number,query);console.log(JSON.stringify(r));return r;}
 if(!reviewArg||flags.some(f=>!['--dry-run','--shadow'].includes(f)&&!f.startsWith('--bootstrap-ref='))||flags.filter(f=>f.startsWith('--bootstrap-ref=')).length>1||flags.includes('--dry-run')&&flags.includes('--shadow'))throw Error('Invalid native merge options');
 let review=/^[1-9][0-9]*$/.test(reviewArg)?Number(reviewArg):JSON.parse(readFileSync(reviewArg,'utf8'));
 if(review?.schemaVersion===1&&review.kind==='independent-ai-review'&&!review.githubReviewId)review=signCloudReview(repo,number,review,query,{dryRun:flags.includes('--dry-run')});
 if(!flags.includes('--dry-run'))mkdirSync('build/delivery',{recursive:true});
 const journal=`build/delivery/native-auto-${number}-${Date.now()}-attempt.json`;
 const result=armAutoMerge(repo,number,review,query,{persist:record=>writeFileSync(journal,JSON.stringify(record,null,2)+'\n'),dryRun:flags.includes('--dry-run'),shadow:flags.includes('--shadow'),bootstrapRef:flags.find(f=>f.startsWith('--bootstrap-ref='))?.slice(16)});
 if(result.proof){mkdirSync('build/delivery',{recursive:true});const file=`build/delivery/auto-merge-${number}-${result.head.slice(0,12)}.json`;writeFileSync(file,JSON.stringify(result.proof,null,2)+'\n');result.proofFile=file;}
 console.log(JSON.stringify(result,null,2));return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{main();}catch(error){console.error(error.message);process.exitCode=1;}}
