import {collectIndependentAiReview} from './independent-ai-review.mjs';
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
 const base=event.merge_group.base_sha;
 if(response.errors?.length||repository?.databaseId!==projectRepositoryId||repository.nameWithOwner!==repo||
  repository.ref?.target?.oid!==base||entries?.pageInfo?.hasNextPage!==false||!Array.isArray(entries.nodes))
  throw Error('Current native queue repository, BASE or complete membership cannot be verified');
 const liveRef=JSON.parse(query('api',`repos/${repo}/git/ref/heads/${env.GITHUB_REF.slice('refs/heads/'.length)}`));
 if(liveRef?.ref!==env.GITHUB_REF||liveRef.object?.type!=='commit'||liveRef.object.sha!==env.GITHUB_SHA)
  throw Error('Current native group ref no longer matches this event');
 const ordered=[...entries.nodes].sort((a,b)=>a.position-b.position);
 const matches=ordered.filter(entry=>entry.headCommit?.oid===env.GITHUB_SHA);
 if(matches.length!==1)throw Error('Current native group has missing or ambiguous queue membership');
 const members=ordered.filter(entry=>entry.position<=matches[0].position);
 const ids=new Set(),numbers=new Set(),snapshot=[];
 if(!members.length||members.length!==matches[0].position||members[0].baseCommit?.oid!==base)
  throw Error('Native group prefix is incomplete or has changed BASE');
 for(const [index,entry] of members.entries()){
  const p=entry.pullRequest;
  if(typeof entry.id!=='string'||!entry.id||ids.has(entry.id)||entry.position!==index+1||
   !['AWAITING_CHECKS','MERGEABLE'].includes(entry.state)||
   !validSha(entry.baseCommit?.oid)||!validSha(entry.headCommit?.oid)||
   index>0&&entry.baseCommit.oid!==base&&entry.baseCommit.oid!==members[index-1].headCommit.oid||
   !positive(p?.number)||numbers.has(p.number)||!validSha(p.headRefOid)||p.state!=='OPEN'||p.isDraft!==false||
   p.baseRefName!=='develop'||p.mergeQueueEntry?.id!==entry.id)
   throw Error('Current native group prefix identity or state is invalid');
  ids.add(entry.id);numbers.add(p.number);
  const pr=JSON.parse(query('api',`repos/${repo}/pulls/${p.number}`));
  const labels=pr.labels;
  if(pr.number!==p.number||pr.state!=='open'||pr.merged!==false||pr.draft!==false||
   pr.head?.sha!==p.headRefOid||!projectRepositoryMatches(pr.head?.repo,repo)||
   pr.base?.ref!=='develop'||pr.base.sha!==base||!projectRepositoryMatches(pr.base?.repo,repo)||
   !Array.isArray(labels)||labels.some(label=>!label||typeof label.name!=='string'||
    ['hold','blocked','do-not-merge','manual-merge','merge:manual','risk:critical'].includes(label.name.toLowerCase())))
   throw Error('Queue PR is held, changed or no longer eligible: '+p.number);
  const review=collectIndependentAiReview({api:path=>JSON.parse(query('api',path)),prNumber:p.number,
   expectedHeadSha:p.headRefOid,expectedBaseSha:base});
  if(review.conclusion!=='pass')throw Error('Queue PR independent AI coordinator attestation is invalid: '+p.number+'; '+review.errors.join('; '));
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
   quality={status:status.id,run:run.id,attempt:run.run_attempt};
  }
  const dependencyEvidence=review.observations.dependencies.map(row=>({number:row.number,merge:row.pr.merge_commit_sha}));
  snapshot.push({id:entry.id,position:entry.position,base:entry.baseCommit.oid,head:entry.headCommit.oid,
   number:p.number,prHead:p.headRefOid,githubReviewId:review.githubReviewId,
   coordinator:review.coordinator,
   reviewedHead:review.head,reviewedBase:review.base,reviewedTree:review.tree,reviewedMergeCommit:review.mergeCommitSha,
   aiReviewId:review.reviewId,report:review.report,
   coordinatorPermission:review.observations.permissions[review.coordinator.id].permission,
   coordinatorRole:review.observations.permissions[review.coordinator.id].role_name??null,
   enqueuer:entry.enqueuer?.databaseId??null,dependencies:dependencyEvidence,...(quality?{quality}:{})});
 }
 return JSON.stringify(snapshot);
}
