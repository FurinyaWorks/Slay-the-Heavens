// GitHub proves who submitted a Review; the trusted coordinator verifies the
// actual, separate AI sessions. A report is not itself proof of AI independence.
import {isDeepStrictEqual} from 'node:util';
import {projectRepositoryId,projectRepositoryMatches} from './repository-identity.mjs';

export const INDEPENDENT_AI_REVIEW_MARKER='<!-- independent-ai-review:v1 -->';
export const TRUSTED_REVIEW_COORDINATOR_IDS=Object.freeze([111138384,337201427]);
const sha=value=>typeof value==='string'&&/^[a-f0-9]{40}$/.test(value);
const text=value=>typeof value==='string'&&value.trim()===value&&value.length>0;
const agent=value=>typeof value==='string'&&/^\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/.test(value);
const positive=value=>Number.isSafeInteger(value)&&value>0;
const marked=body=>typeof body==='string'&&body.trimStart().startsWith(INDEPENDENT_AI_REVIEW_MARKER);

export function parseIndependentAiReview(body){
 if(!marked(body))return null;
 const report=JSON.parse(body.trim().slice(INDEPENDENT_AI_REVIEW_MARKER.length).trim());
 if(!report||Array.isArray(report)||report.schemaVersion!==1||report.kind!=='independent-ai-review')
  throw Error('Unsupported independent AI review report');
 return report;
}

// Same declaration and dependency semantics as the existing merge coordinator.
export function parseDependencies(body){
 const declarations=[...(body??'').matchAll(/^\s*Depends-on:\s*(.*?)\s*$/gim)];
 if(declarations.length!==1)throw Error('PR body must declare exactly one Depends-on line');
 const value=declarations[0][1].trim();
 if(/^none$/i.test(value))return [];
 const entries=value.split(/[\s,]+/).filter(Boolean);
 if(!entries.length||entries.some(item=>!/^#[1-9][0-9]*$/.test(item)))throw Error('Invalid Depends-on declaration');
 return [...new Set(entries.map(item=>Number(item.slice(1))))];
}

// These native policy fields are necessary, not proof that CODEOWNERS already
// exists on BASE. The publisher separately verifies that source/bootstrap anchor.
export function nativeReviewPolicyErrors(ruleset){
 const pull=ruleset?.rules?.find(rule=>rule.type==='pull_request')?.parameters,errors=[];
 if(!Number.isSafeInteger(pull?.required_approving_review_count)||pull.required_approving_review_count<1)
  errors.push('Native policy requires at least one approving review');
 if(pull?.dismiss_stale_reviews_on_push!==true)errors.push('Native policy must dismiss stale reviews on push');
 if(pull?.require_code_owner_review!==true)errors.push('Native policy requires CODEOWNERS review');
 return errors;
}

function trusted(review,permissions){
 const actor=review?.user,permission=permissions?.[actor?.id];
 const role=permission?.role_name??permission?.permission;
 return TRUSTED_REVIEW_COORDINATOR_IDS.includes(actor?.id)&&text(actor?.login)&&
  permission?.user?.id===actor.id&&permission.user.login===actor.login&&
  (role==='admin'&&permission.permission==='admin'||role==='maintain'&&['maintain','write'].includes(permission.permission));
}
const reviewOrder=(a,b)=>Date.parse(a.submitted_at)-Date.parse(b.submitted_at)||a.id-b.id;
const treeOf=commit=>commit?.tree?.sha??commit?.commit?.tree?.sha;

export function validateIndependentAiReview({repository,pr,baseSha,sourceCommit,reviews,permissions={},dependencies=[]}){
 const errors=[],repo=repository?.full_name;
 if(!projectRepositoryMatches(repository,repo))errors.push('Unexpected fixed repository identity');
 if(!positive(pr?.number)||pr?.state!=='open'||pr?.merged!==false||pr?.draft!==false||pr?.mergeable!==true||
  pr?.base?.ref!=='develop'||!projectRepositoryMatches(pr?.base?.repo,repo)||!projectRepositoryMatches(pr?.head?.repo,repo))
  errors.push('PR must be a ready, mergeable, same-repository develop PR');
 const head=pr?.head?.sha,merge=pr?.merge_commit_sha,tree=treeOf(sourceCommit);
 if(!sha(head)||!sha(baseSha)||pr?.base?.sha!==baseSha||!sha(merge)||sourceCommit?.sha!==merge||!sha(tree)||
  !Array.isArray(sourceCommit?.parents)||!isDeepStrictEqual(sourceCommit.parents.map(parent=>parent?.sha),[baseSha,head]))
  errors.push('Actual develop, HEAD and complete PR merge commit/tree are not the same combination');
 if(sourceCommit?.tree&&sourceCommit?.commit?.tree&&sourceCommit.tree.sha!==sourceCommit.commit.tree.sha)
  errors.push('Conflicting merge tree identities');
 let declared=[];
 try{declared=parseDependencies(pr?.body);}catch(error){errors.push(error.message);}
 if(declared.includes(pr?.number))errors.push('PR cannot depend on itself');
 if(!Array.isArray(dependencies)||!isDeepStrictEqual(dependencies.map(row=>row.number).sort((a,b)=>a-b),[...declared].sort((a,b)=>a-b)))
  errors.push('Complete declared dependency evidence is missing');
 else for(const row of dependencies){
  const dep=row.pr,comparison=row.comparison;
  if(dep?.number!==row.number||dep?.merged!==true||dep?.base?.ref!=='develop'||
   !projectRepositoryMatches(dep?.base?.repo,repo)||!sha(dep?.merge_commit_sha)||row.comparedBaseSha!==baseSha||
   !['ahead','identical'].includes(comparison?.status)||comparison?.merge_base_commit?.sha!==dep.merge_commit_sha)
   errors.push('Declared dependency is not merged and contained in the current develop: #'+row.number);
 }
 if(!Array.isArray(reviews)){errors.push('Complete server-side PR Review records are required');reviews=[];}
 const ids=new Set();
 for(const review of reviews){
  if(!positive(review?.id)||ids.has(review.id))errors.push('Missing or duplicate server Review identity');
  ids.add(review?.id);
 }
 const signed=reviews.filter(review=>trusted(review,permissions));
 for(const review of signed)if(!Number.isFinite(Date.parse(review.submitted_at))||!sha(review.commit_id))
  errors.push('Malformed trusted server Review timestamp or commit identity');
 const candidates=signed.filter(review=>marked(review.body)).sort(reviewOrder);
 const selected=candidates.at(-1);let report=null;
 // The complete AI report and the native approval must be the same server
 // Review. COMMENTED reports can reject/revoke, but cannot authorize a merge.
 const nativeApproval=selected?.state==='APPROVED'&&selected.commit_id===head&&
  positive(pr?.user?.id)&&selected.user.id!==pr.user.id?selected:null;
 if(!nativeApproval)errors.push('The complete AI report must itself be a trusted non-author native APPROVED Review for the current HEAD');
 if(!selected)errors.push('No report signed by an authorized maintain/admin coordinator');
 else{
  try{report=parseIndependentAiReview(selected.body);}catch(error){errors.push(error.message);}
  if(selected.state!=='APPROVED'||selected.commit_id!==head)
   errors.push('Signed Review is dismissed, rejected, unpublished or belongs to another HEAD');
  const decisions=new Map();
  for(const review of [...signed].sort(reviewOrder))if(['APPROVED','CHANGES_REQUESTED'].includes(review.state))decisions.set(review.user.id,review);
  if([...decisions.values()].some(review=>review.state==='CHANGES_REQUESTED'))
   errors.push('A trusted reviewer still requests changes');
  if(report){
   if(report.repositoryId!==projectRepositoryId||report.repositoryFullName!==repo||report.prNumber!==pr.number||
    report.reviewedHeadSha!==head||report.reviewedBaseSha!==baseSha||report.reviewedTreeSha!==tree)
    errors.push('AI report belongs to a different repository/PR/HEAD/BASE/merge tree');
   if(report.conclusion!=='pass'||!Array.isArray(report.unresolved)||report.unresolved.length)
    errors.push('Latest signed AI report is not an unresolved-free pass');
   const owner=report.coordinator,origin=report.provenance;
   if(owner?.id!==selected.user.id||owner?.login!==selected.user.login||
    !(owner?.verifiedActualSessions===true||origin?.coordinatorVerified===true)||
    origin?.kind!=='coordinator-verified-agent-session'||!text(origin.reviewId)||!text(origin.sessionId))
    errors.push('Trusted coordinator has not attested the actual AI session source');
   if(!agent(report.reviewerAgent)||!Array.isArray(report.implementationAgents)||!report.implementationAgents.length||
    report.implementationAgents.some(value=>!agent(value)||value===report.reviewerAgent)||
    new Set(report.implementationAgents).size!==report.implementationAgents.length)
    errors.push('AI reviewer must be a distinct agent from every recorded implementation agent');
  }
 }
 return {conclusion:errors.length?'fail':'pass',errors,report,reviewId:report?.provenance?.reviewId,
  githubReviewId:selected?.id,githubReviewUrl:selected?.html_url,coordinator:selected?.user,
  nativeApprovalReviewId:nativeApproval?.id,nativeApprovalUser:nativeApproval?.user,
  repositoryId:repository?.id,repo,prNumber:pr?.number,head,base:baseSha,tree,mergeCommitSha:merge};
}

function snapshot(pr){
 return {number:pr?.number,state:pr?.state,merged:pr?.merged,draft:pr?.draft,mergeable:pr?.mergeable,
  authorId:pr?.user?.id,head:pr?.head,base:pr?.base,merge_commit_sha:pr?.merge_commit_sha,body:pr?.body};
}

// api(path) is synchronous parsed JSON, e.g. the existing coordinator's gh API
// adapter. This collector never writes statuses, enables merge or reads Admin.
export function collectIndependentAiReview({api,prNumber,expectedHeadSha,expectedBaseSha,expectedTreeSha}){
 const observations={};
 try{
  if(typeof api!=='function'||!positive(prNumber))throw Error('Synchronous API and exact PR number are required');
  const read=path=>{
   const value=api(path);
   if(value&&typeof value.then==='function')throw Error('API adapter must return synchronous parsed JSON');
   return value;
  };
  const repository=read('repositories/'+projectRepositoryId),repo=repository?.full_name;
  if(!projectRepositoryMatches(repository,repo))throw Error('Unexpected fixed repository identity');
  const prefix='repos/'+repo,targetPath=prefix+'/git/ref/heads/develop',prPath=prefix+'/pulls/'+prNumber;
  const targetBefore=read(targetPath),prBefore=read(prPath);
  observations.targetBefore=targetBefore;observations.prBefore=snapshot(prBefore);
  if(targetBefore?.ref!=='refs/heads/develop'||targetBefore.object?.type!=='commit'||!sha(targetBefore.object.sha)||
   prBefore?.number!==prNumber||!sha(prBefore.merge_commit_sha))throw Error('Exact PR and actual develop commit are required');
  const baseSha=targetBefore.object.sha,sourceCommit=read(prefix+'/git/commits/'+prBefore.merge_commit_sha);
  const reviews=[];
  for(let page=1;;page++){
   const rows=read(prPath+'/reviews?per_page=100&page='+page);
   if(!Array.isArray(rows)||rows.length>100)throw Error('Malformed paginated PR Review response');
   reviews.push(...rows);if(rows.length<100)break;
   if(new Set(reviews.map(row=>row.id)).size!==reviews.length)throw Error('Duplicate paginated Review records');
  }
  const permissions={};
  for(const review of reviews)if(TRUSTED_REVIEW_COORDINATOR_IDS.includes(review?.user?.id)&&!Object.hasOwn(permissions,review.user.id)){
   if(!text(review.user.login)||!/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(review.user.login))throw Error('Invalid server Review actor login');
   permissions[review.user.id]=read(prefix+'/collaborators/'+encodeURIComponent(review.user.login)+'/permission');
  }
  const dependencies=parseDependencies(prBefore.body).map(number=>{
   const pr=read(prefix+'/pulls/'+number);
   const comparison=sha(pr?.merge_commit_sha)?read(prefix+'/compare/'+pr.merge_commit_sha+'...'+baseSha):null;
   return {number,pr,comparison,comparedBaseSha:baseSha};
  });
  const prAfter=read(prPath),targetAfter=read(targetPath);
  Object.assign(observations,{sourceCommit,reviews,permissions,dependencies,prAfter:snapshot(prAfter),targetAfter});
  const result=validateIndependentAiReview({repository,pr:prBefore,baseSha,sourceCommit,reviews,permissions,dependencies});
  if(!isDeepStrictEqual(snapshot(prBefore),snapshot(prAfter))||!isDeepStrictEqual(targetBefore,targetAfter))
   result.errors.push('PR HEAD/BASE/merge identity or actual develop changed during collection');
  for(const [expected,actual,label]of [[expectedHeadSha,result.head,'HEAD'],[expectedBaseSha,result.base,'BASE'],[expectedTreeSha,result.tree,'tree']])
   if(expected!==undefined&&(!sha(expected)||expected!==actual))result.errors.push('Expected '+label+' differs from the collected review combination');
  result.conclusion=result.errors.length?'fail':'pass';return {...result,observations};
 }catch(error){return {conclusion:'fail',errors:[error.message],observations};}
}
