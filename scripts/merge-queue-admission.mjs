import {isDeepStrictEqual} from 'node:util';
import {resolveNativePreflight} from './verify-delivery.mjs';
import {validateHistoricalIndependentAiReview,parseIndependentAiReview,collectIndependentAiReviewRecords,collectReviewModule,parseDependencies,TRUSTED_REVIEW_COORDINATOR_IDS,INDEPENDENT_AI_REVIEW_MARKER} from './independent-ai-review.mjs';
import {queueRulesFingerprint} from './merge-queue-policy.mjs';
import {projectRepositoryId,projectRepositoryMatches} from './repository-identity.mjs';

const validSha=value=>typeof value==='string'&&/^[a-f0-9]{40}$/.test(value);
const positive=value=>Number.isSafeInteger(value)&&value>0;
const queryText=repo=>{
 const [owner,name]=repo.split('/');
 return `query {
 repository(owner:${JSON.stringify(owner)},name:${JSON.stringify(name)}) {
  databaseId nameWithOwner ref(qualifiedName:"refs/heads/develop") { target { oid } }
  mergeQueue(branch:"develop") { entries(first:100) {
   pageInfo { hasNextPage }
   nodes { id position state enqueuer { login ... on User { databaseId } ... on Bot { databaseId } } baseCommit { oid } headCommit { oid }
    pullRequest { number headRefOid baseRefName isDraft state mergeQueueEntry { id } }
   }
  } }
 }
}`;
};

// The native queue owns scheduling. This bounded, read-only admission check
// only releases a group whose live prefix and project-specific authorization
// can still be proven. Ambiguous/oversized queues require operator attention.
export function collectQueueAdmission(event,env,query,ruleset){
 const repo=env.GITHUB_REPOSITORY;
 if(!projectRepositoryMatches(event?.repository,repo))throw Error('Current queue repository identity is invalid');
 ruleset??=JSON.parse(query('api',`repos/${repo}/rulesets/25870651`));
 const response=JSON.parse(query('api','graphql','-f','query='+queryText(repo)));
 const repository=response?.data?.repository;
 const entries=repository?.mergeQueue?.entries;
 const groupBase=event.merge_group.base_sha,develop=repository?.ref?.target?.oid;
 if(response.errors?.length||repository?.databaseId!==projectRepositoryId||repository.nameWithOwner!==repo||
  !validSha(develop)||!validSha(groupBase)||entries?.pageInfo?.hasNextPage!==false||!Array.isArray(entries.nodes))
  throw Error('Current native queue repository, BASE or complete membership cannot be verified');
 const liveRef=JSON.parse(query('api',`repos/${repo}/git/ref/heads/${env.GITHUB_REF.slice('refs/heads/'.length)}`));
 if(liveRef?.ref!==env.GITHUB_REF||liveRef.object?.type!=='commit'||liveRef.object.sha!==env.GITHUB_SHA)
  throw Error('Current native group ref no longer matches this event');
 const groupCommit=JSON.parse(query('api',`repos/${repo}/commits/${env.GITHUB_SHA}`));
 if(groupCommit?.sha!==env.GITHUB_SHA||!validSha(groupCommit?.commit?.tree?.sha)||
  !isDeepStrictEqual(groupCommit?.parents?.map(parent=>parent?.sha),[groupBase]))
  throw Error('Actual native group commit/tree does not have the exact event parent Q');
 const ancestor=(before,after)=>{
  if(!validSha(before)||!validSha(after))throw Error('Exact queue ancestry identities are required');
  const result=JSON.parse(query('api',`repos/${repo}/compare/${before}...${after}`));
  if(result?.base_commit?.sha!==before||!['ahead','identical'].includes(result?.status)||result?.merge_base_commit?.sha!==before)
   throw Error('Queue review/protected BASE is not an ancestor of the actual native combination');
  return {before,after,comparison:result};
 };
 const protectedAncestry=ancestor(develop,groupBase);
 const ordered=[...entries.nodes].sort((a,b)=>a.position-b.position);
 const matches=ordered.filter(entry=>entry.headCommit?.oid===env.GITHUB_SHA);
 if(matches.length!==1)throw Error('Current native group has missing or ambiguous queue membership');
 const members=ordered.filter(entry=>entry.position<=matches[0].position);
 const ids=new Set(),numbers=new Set(),snapshot=[];
 if(!members.length||members.length!==matches[0].position||members[0].baseCommit?.oid!==develop||matches[0].baseCommit?.oid!==groupBase)
  throw Error('Native group prefix is incomplete or has changed BASE');
 for(const [index,entry] of members.entries()){
  const p=entry.pullRequest;
  if(typeof entry.id!=='string'||!entry.id||ids.has(entry.id)||entry.position!==index+1||
   !['AWAITING_CHECKS','MERGEABLE'].includes(entry.state)||
   !validSha(entry.baseCommit?.oid)||!validSha(entry.headCommit?.oid)||
   index>0&&entry.baseCommit.oid!==members[index-1].headCommit.oid||
   !positive(p?.number)||numbers.has(p.number)||!validSha(p.headRefOid)||p.state!=='OPEN'||p.isDraft!==false||
   p.baseRefName!=='develop'||p.mergeQueueEntry?.id!==entry.id)
   throw Error('Current native group prefix identity or state is invalid');
  ids.add(entry.id);numbers.add(p.number);
  const pr=JSON.parse(query('api',`repos/${repo}/pulls/${p.number}`));
  const labels=pr.labels;
  if(pr.number!==p.number||pr.state!=='open'||pr.merged!==false||pr.draft!==false||
   pr.head?.sha!==p.headRefOid||!projectRepositoryMatches(pr.head?.repo,repo)||
   pr.base?.ref!=='develop'||!projectRepositoryMatches(pr.base?.repo,repo)||
   !Array.isArray(labels)||labels.some(label=>!label||typeof label.name!=='string'||
    ['hold','blocked','do-not-merge','manual-merge','merge:manual','risk:critical'].includes(label.name.toLowerCase())))
   throw Error('Queue PR is held, changed or no longer eligible: '+p.number);
  const api=path=>JSON.parse(query('api',path));
  let reviews;
  try{reviews=collectIndependentAiReviewRecords({api,repo,prNumber:p.number});}
  catch(error){throw Error('Queue authorization server Review policy metadata failed: '+error.message);}
  let headModule,ancestorModule,comparison;
  try{
   headModule=collectReviewModule({api,repo,commitSha:p.headRefOid});
   comparison=api(`repos/${repo}/compare/${develop}...${p.headRefOid}`);
   if(comparison?.base_commit?.sha!==develop||!validSha(comparison?.merge_base_commit?.sha))
    throw Error('Exact current BASE/HEAD comparison metadata is missing');
   ancestorModule=collectReviewModule({api,repo,commitSha:comparison.merge_base_commit.sha});
  }catch(error){throw Error('Queue authorization module policy metadata failed: '+error.message);}
  const hasNewMarker=reviews.some(row=>TRUSTED_REVIEW_COORDINATOR_IDS.includes(row?.user?.id)&&
   typeof row.body==='string'&&row.body.includes(INDEPENDENT_AI_REVIEW_MARKER));
  const legacy=!hasNewMarker&&!headModule.installed&&!ancestorModule.installed;
  const summarize=value=>({installed:value.installed,commit:value.installation.commit.sha,
   root:value.installation.root.sha,scripts:value.installation.scripts.sha});
  const moduleEvidence={head:summarize(headModule),mergeBase:summarize(ancestorModule)};
  let review,proof,gateProof,legacyAuthorization,reviewBase;
  if(legacy){
   const statuses=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/commits/${p.headRefOid}/statuses?per_page=100`));
   if(!Array.isArray(statuses)||!statuses.length||statuses.some(page=>!Array.isArray(page)))
    throw Error('Complete current legacy review status pages are missing');
   const status=statuses.flat().filter(row=>row?.context==='independent-review').sort((a,b)=>b.id-a.id)[0];
   const fingerprint=queueRulesFingerprint(ruleset,{allowRedacted:true});
   const binding=typeof status?.description==='string'?status.description.match(/ \[rules:([a-f0-9]{64})\] \[base:([a-f0-9]{40})\]$/):null;
   if(!positive(status?.id)||status.state!=='success'||!binding||binding[1]!==fingerprint)
    throw Error('Legacy queue review is paused, missing or bound to another ruleset/BASE');
   reviewBase=binding[2];
   if(!positive(entry.enqueuer?.databaseId)||typeof entry.enqueuer.login!=='string'||!entry.enqueuer.login||
    !positive(status.creator?.id)||typeof status.creator?.login!=='string'||!status.creator.login)
    throw Error('Legacy queue signer and native enqueue operator identities are required');
   const permission=api(`repos/${repo}/collaborators/${encodeURIComponent(status.creator.login)}/permission`);
   if(permission?.permission!=='admin'||permission.user?.id!==status.creator.id||typeof permission.user?.login!=='string'||
    permission.user.login.toLowerCase()!==status.creator.login.toLowerCase())
    throw Error('Legacy queue authorization requires the current repository administrator');
   const sameActor=entry.enqueuer.databaseId===status.creator.id;
   const enqueuerPermission=sameActor?permission:
    api(`repos/${repo}/collaborators/${encodeURIComponent(entry.enqueuer.login)}/permission`);
   const enqueuerRole=enqueuerPermission?.role_name??enqueuerPermission?.permission;
   const mayEnqueue=enqueuerRole==='admin'&&enqueuerPermission?.permission==='admin'||
    enqueuerRole==='maintain'&&['maintain','write'].includes(enqueuerPermission?.permission)||
    enqueuerRole==='write'&&enqueuerPermission?.permission==='write';
   if(!mayEnqueue||enqueuerPermission.user?.id!==entry.enqueuer.databaseId||
    typeof enqueuerPermission.user?.login!=='string'||enqueuerPermission.user.login.toLowerCase()!==entry.enqueuer.login.toLowerCase())
    throw Error('Legacy native enqueue operator requires current write/maintain/admin permission and exact server identity');
   legacyAuthorization={review:status.id,rulesFingerprint:fingerprint,enqueuer:entry.enqueuer.databaseId,
    legacySigner:{id:status.creator.id,login:status.creator.login.toLowerCase()},
    enqueuerLogin:entry.enqueuer.login.toLowerCase(),enqueuerPermission:enqueuerPermission.permission,enqueuerRole};
  }else{
   const selected=[...reviews].filter(row=>TRUSTED_REVIEW_COORDINATOR_IDS.includes(row?.user?.id)&&
    typeof row.body==='string'&&row.body.includes(INDEPENDENT_AI_REVIEW_MARKER))
    .sort((a,b)=>Date.parse(a.submitted_at)-Date.parse(b.submitted_at)||a.id-b.id).at(-1);
   let report;try{report=parseIndependentAiReview(selected?.body);}catch(error){throw Error('Queue independent AI attestation is invalid: '+error.message);}
   if(!report)throw Error('Queue independent AI attestation lacks a complete signed report');
   reviewBase=report.reviewedBaseSha;
   // A signed report alone is not proof that the trusted Actions source gate
   // checked the current candidate. Resolve its real immutable CI evidence now,
   // before releasing any group status, and retain its identity in the snapshot.
   const statusPages=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/commits/${p.headRefOid}/statuses?per_page=100`));
   if(!Array.isArray(statusPages)||!statusPages.length||statusPages.some(page=>!Array.isArray(page)))
    throw Error('Queue PR cloud review proof status pages are missing');
   const proofStatus=statusPages.flat().filter(row=>row?.context==='independent-review').sort((a,b)=>b.id-a.id)[0];
   const match=proofStatus?.target_url?.match(new RegExp('^https://github\\.com/'+repo+'/actions/runs/([1-9]\\d*)$'));
   if(!match)throw Error('Queue PR cloud review proof has no actual gate run');
   const sourceRun=JSON.parse(query('api',`repos/${repo}/actions/runs/${match[1]}`));
   proof=resolveNativePreflight({schemaVersion:9,kind:'native-auto-merge-intent',repo,repositoryId:projectRepositoryId,
    prNumber:p.number,head:p.headRefOid,base:reviewBase,sourceTree:report.reviewedTreeSha,githubReviewId:selected.id,
    gateRef:'refs/heads/'+sourceRun.head_branch,createdAt:proofStatus.created_at,
    nativeAuto:{confirmed:true,queueEntryId:entry.id,state:entry.state}},query);
   const permissions={};
   for(const row of reviews)if(TRUSTED_REVIEW_COORDINATOR_IDS.includes(row?.user?.id)&&!Object.hasOwn(permissions,row.user.id)){
    if(typeof row.user.login!=='string'||!/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(row.user.login))throw Error('Invalid server review coordinator login');
    permissions[row.user.id]=api(`repos/${repo}/collaborators/${encodeURIComponent(row.user.login)}/permission`);
   }
   review=validateHistoricalIndependentAiReview({repository:event.repository,preflight:proof,livePr:pr,reviews,permissions});
   if(review.conclusion!=='pass')throw Error('Queue independent AI attestation/proof is invalid: '+review.errors.join('; '));
   gateProof={artifactId:proof.nativeProof.artifact.id,digest:proof.nativeProof.artifact.digest,
    runId:proof.nativeProof.gateRun.id,attempt:proof.nativeProof.gateRun.run_attempt,statusId:proof.nativeProof.status.id,
    ref:'refs/heads/'+proof.nativeProof.gateRun.head_branch,githubReviewId:proof.nativeReview.githubReviewId,
    reviewId:proof.nativeReview.reviewId};
  }
  const reviewAncestry={protected:ancestor(reviewBase,develop),group:ancestor(reviewBase,groupBase)};
  const dependencyEvidence=[];
  for(const number of parseDependencies(pr.body)){
   if(number===p.number)throw Error('Queue PR cannot depend on itself');
   const dep=api(`repos/${repo}/pulls/${number}`);
   if(dep.number!==number||dep.merged!==true||dep.base?.ref!=='develop'||!projectRepositoryMatches(dep.base?.repo,repo)||!validSha(dep.merge_commit_sha))
    throw Error('Queue dependency is not confirmed merged');
   const contained=ancestor(dep.merge_commit_sha,groupBase);
   dependencyEvidence.push({number,merge:dep.merge_commit_sha,contained});
  }
  let quality;
  if(ruleset?.rules?.find(rule=>rule.type==='required_status_checks')?.parameters?.required_status_checks?.some(check=>check.context==='pr-quality')){
   const statuses=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/commits/${p.headRefOid}/statuses?per_page=100`));
   if(!Array.isArray(statuses)||!statuses.length||statuses.some(page=>!Array.isArray(page)))
    throw Error('Complete current PR-quality status pages are missing');
   const status=statuses.flat().filter(s=>s?.context==='pr-quality').sort((a,b)=>b.id-a.id)[0];
   const runs=JSON.parse(query('api','--paginate','--slurp',`repos/${repo}/actions/workflows/quality.yml/runs?event=pull_request&head_sha=${p.headRefOid}&per_page=100`));
   if(!Array.isArray(runs)||!runs.length||runs.some(page=>!Array.isArray(page.workflow_runs)))
    throw Error('Queue PR latest quality inventory cannot be verified: '+p.number);
   const run=runs.flatMap(page=>page.workflow_runs).filter(r=>r.head_sha===p.headRefOid&&r.event==='pull_request'&&
    r.pull_requests?.some(pr=>pr.number===p.number)).sort((a,b)=>b.id-a.id)[0];
   if(!positive(status?.id)||status.state!=='success'||status.creator?.id!==41898282||
    status.creator?.login!=='github-actions[bot]'||!positive(run?.id)||!positive(run.run_attempt)||
    run.status!=='completed'||run.conclusion!=='success'||run.path!=='.github/workflows/quality.yml'||
    run.repository?.full_name!==repo||status.target_url!==`https://github.com/${repo}/actions/runs/${run.id}`||
    !new RegExp(`^Exact (?:dual-platform Fast|Full) run ${run.id}, attempt ${run.run_attempt}$`).test(status.description??''))
    throw Error('Queue PR latest run/attempt admission is pending, failed or stale: '+p.number);
   if(!legacy&&(proof.runId!==run.id||proof.attempt!==run.run_attempt))
    throw Error('Queue PR cloud review proof does not cover the current formal CI run/attempt: '+p.number);
   quality={status:status.id,run:run.id,attempt:run.run_attempt};
  }
  snapshot.push({id:entry.id,position:entry.position,base:entry.baseCommit.oid,head:entry.headCommit.oid,
   forceFull:labels.some(label=>label.name.toLowerCase()==='ci:full'),
   number:p.number,prHead:p.headRefOid,reviewBase,protectedDevelop:develop,groupBase,groupHead:env.GITHUB_SHA,groupTree:groupCommit.commit.tree.sha,
   protectedAncestry,reviewAncestry,livePrBase:pr.base.sha,authorizationKind:legacy?'legacy':'cloud',moduleEvidence,
   ...(legacy?legacyAuthorization:{githubReviewId:review.githubReviewId,
   coordinator:review.coordinator,gateProof,
   reviewedHead:review.head,reviewedBase:review.base,reviewedTree:review.tree,reviewedMergeCommit:review.mergeCommitSha,
   aiReviewId:review.reviewId,report:review.report,
   coordinatorPermission:review.observations.permissions[review.coordinator.id].permission,
   coordinatorRole:review.observations.permissions[review.coordinator.id].role_name??null,
   enqueuer:entry.enqueuer?.databaseId??null}),dependencies:dependencyEvidence,...(quality?{quality}:{})});
 }
 return JSON.stringify(snapshot);
}

// Both inputs must come from complete fresh collectQueueAdmission calls. The
// only allowed progress is an already validated contiguous prefix landing on
// protected develop; this is never a substitute for authorization collection.
export function queueAdmissionCompatible(beforeJson,afterJson){
 try{
  const before=JSON.parse(beforeJson),after=JSON.parse(afterJson);
  if(!Array.isArray(before)||!Array.isArray(after)||!after.length||after.length>before.length)return false;
  const removed=before.length-after.length;
  if(!isDeepStrictEqual(before.slice(removed).map(row=>row.id),after.map(row=>row.id)))return false;
  const expectedDevelop=removed?before[removed-1].head:before[0].protectedDevelop;
  if(after.some(row=>row.protectedDevelop!==expectedDevelop))return false;
  const semantic=row=>{
   // This comparison authorizes an already completed Full. A label change
   // cannot invalidate that scope. A reduced plan must also bind its labels.
   const {position,protectedDevelop,protectedAncestry,livePrBase,moduleEvidence,reviewAncestry,forceFull,...rest}=row;
   return {...rest,moduleHead:moduleEvidence?.head,reviewGroupAncestry:reviewAncestry?.group};
  };
  return before.slice(removed).every((row,index)=>isDeepStrictEqual(semantic(row),semantic(after[index])));
 }catch{return false;}
}
