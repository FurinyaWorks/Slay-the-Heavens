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

function trusted(review,permissions){
 const actor=review?.user,permission=permissions?.[actor?.id];
 const role=permission?.role_name??permission?.permission;
 return TRUSTED_REVIEW_COORDINATOR_IDS.includes(actor?.id)&&text(actor?.login)&&
  permission?.user?.id===actor.id&&permission.user.login===actor.login&&
  (role==='admin'&&permission.permission==='admin'||role==='maintain'&&['maintain','write'].includes(permission.permission));
}
const reviewOrder=(a,b)=>Date.parse(a.submitted_at)-Date.parse(b.submitted_at)||a.id-b.id;
const treeOf=commit=>commit?.tree?.sha??commit?.commit?.tree?.sha;

// Source trust is checked by both the running producer and its consumers.
// Completion/attempt/artifact checks belong to the consumer, not this helper.
export function cloudGateSourceErrors(run,{repo,head,base,ref,bootstrap,coordinator,reviewedBranch,installBaseSha,installation}={}){
 const errors=[];
 if(!projectRepositoryMatches(run?.repository,repo)||run?.path!=='.github/workflows/licenses.yml'||
  !['workflow_dispatch','workflow_run'].includes(run?.event)||!sha(head)||!sha(base)||
  typeof ref!=='string'||!ref.startsWith('refs/heads/')||run?.head_branch!==ref.slice(11)||
  run?.head_repository!==undefined&&!projectRepositoryMatches(run.head_repository,repo))
  errors.push('Cloud review gate has a foreign repository, workflow, event or source ref');
 if(bootstrap===false){
  if(ref!=='refs/heads/develop'||run?.head_sha!==base)
   errors.push('Normal cloud review gate must execute the actual develop BASE source');
 }else if(bootstrap===true){
  if(!sha(installBaseSha)||installBaseSha!==base||run?.event!=='workflow_dispatch'||!text(reviewedBranch)||
   ref!=='refs/heads/'+reviewedBranch||ref==='refs/heads/develop'||run?.head_sha!==head||
   !TRUSTED_REVIEW_COORDINATOR_IDS.includes(coordinator?.id)||run?.actor?.id!==coordinator.id||
   run?.triggering_actor?.id!==coordinator.id)
   errors.push('Bootstrap cloud review gate requires the explicitly reviewed install BASE, branch and actual coordinator dispatcher');
  errors.push(...installationErrors(base,installation));
 }else errors.push('Explicit cloud review bootstrap mode is required');
 return errors;
}

function completeTree(tree,expected){
 if(!sha(expected)||tree?.sha!==expected||tree.truncated!==false||!Array.isArray(tree.tree))return false;
 const names=new Set(),modes={'040000':'tree','100644':'blob','100755':'blob','120000':'blob','160000':'commit'};
 return tree.tree.every(row=>text(row?.path)&&!row.path.includes('/')&&!['.','..'].includes(row.path)&&
  !names.has(row.path)&&names.add(row.path)&&sha(row.sha)&&modes[row.mode]===row.type);
}
function installationErrors(base,installation){
 const {commit,root,scripts}=installation??{},errors=[];
 const entry=Array.isArray(root?.tree)?root.tree.filter(row=>row?.path==='scripts'):[];
 if(commit?.sha!==base||!completeTree(root,commit?.tree?.sha)||entry.length!==1||
  entry[0].mode!=='040000'||entry[0].type!=='tree'||!completeTree(scripts,entry[0].sha))
  errors.push('Complete immutable install BASE commit/root/scripts Git trees are required');
 if(Array.isArray(scripts?.tree)&&scripts.tree.some(row=>row?.path==='independent-ai-review.mjs'))
  errors.push('Reviewed install BASE already contains the independent AI review module');
 return errors;
}
// Read complete authenticated immutable metadata; API errors never mean absence.
export function collectReviewModule({api,repo,commitSha}){
 if(typeof api!=='function'||!sha(commitSha))throw Error('Synchronous Git API and exact module commit are required');
 const read=path=>{const value=api(path);if(value&&typeof value.then==='function')throw Error('Synchronous Git API required');return value;};
 const prefix='repos/'+repo,commit=read(prefix+'/git/commits/'+commitSha);
 if(commit?.sha!==commitSha||!sha(commit?.tree?.sha))throw Error('Immutable module commit metadata is missing');
 const root=read(prefix+'/git/trees/'+commit.tree.sha);
 const entries=Array.isArray(root?.tree)?root.tree.filter(row=>row?.path==='scripts'):[];
 if(!completeTree(root,commit.tree.sha)||entries.length!==1||entries[0].mode!=='040000'||entries[0].type!=='tree')
  throw Error('Complete module root with a unique scripts Git tree is required');
 const scripts=read(prefix+'/git/trees/'+entries[0].sha);
 if(!completeTree(scripts,entries[0].sha))throw Error('Complete immutable scripts Git tree metadata is required');
 return {installed:scripts.tree.some(row=>row.path==='independent-ai-review.mjs'),installation:{commit,root,scripts}};
}
// Bootstrap consumers always re-read immutable objects, not artifact claims.
export function collectCloudGateSource({api,run,...context}){
 const observations={};
 try{
  if(context.bootstrap===true)
   observations.installation=collectReviewModule({api,repo:context.repo,commitSha:context.base}).installation;
  return {errors:cloudGateSourceErrors(run,{...context,installation:observations.installation}),observations};
 }catch(error){return {errors:[error.message],observations};}
}

// Pure payload validation for a coordinator before submitting a Review. This
// does not prove server authorship, repository role or actual session provenance;
// authorization still requires collectIndependentAiReview's real server records.
export function independentAiReportErrors(report,{repository,pr,baseSha,sourceCommit,coordinator}={}){
 const errors=[],repo=repository?.full_name,head=pr?.head?.sha,tree=treeOf(sourceCommit);
 if(!report||Array.isArray(report)||report.schemaVersion!==1||report.kind!=='independent-ai-review')
  return ['Unsupported independent AI review report'];
 if(!projectRepositoryMatches(repository,repo)||!positive(pr?.number)||pr?.state!=='open'||pr?.merged!==false||
  pr?.draft!==false||pr?.mergeable!==true||pr?.base?.ref!=='develop'||
  !projectRepositoryMatches(pr?.base?.repo,repo)||!projectRepositoryMatches(pr?.head?.repo,repo))
  errors.push('Report requires the fixed repository and a ready same-repository develop PR');
 if(!sha(head)||!sha(baseSha)||pr?.base?.sha!==baseSha||!sha(pr?.merge_commit_sha)||
  sourceCommit?.sha!==pr?.merge_commit_sha||!sha(tree)||!Array.isArray(sourceCommit?.parents)||
  !isDeepStrictEqual(sourceCommit.parents.map(parent=>parent?.sha),[baseSha,head])||
  sourceCommit?.tree&&sourceCommit?.commit?.tree&&sourceCommit.tree.sha!==sourceCommit.commit.tree.sha)
  errors.push('Report requires the actual HEAD/BASE merge commit and tree');
 if(report.installBaseSha!==undefined&&(!sha(report.installBaseSha)||report.installBaseSha!==baseSha))
  errors.push('Explicit install BASE differs from the actual reviewed BASE');
 if(!TRUSTED_REVIEW_COORDINATOR_IDS.includes(coordinator?.id)||!text(coordinator?.login))
  errors.push('Report requires the fixed coordinator identity');
 if(report.repositoryId!==projectRepositoryId||report.repositoryFullName!==repo||report.prNumber!==pr?.number||
  report.reviewedHeadSha!==head||report.reviewedBaseSha!==baseSha||report.reviewedTreeSha!==tree)
  errors.push('AI report belongs to a different repository/PR/HEAD/BASE/merge tree');
 if(report.conclusion!=='pass'||!Array.isArray(report.unresolved)||report.unresolved.length)
  errors.push('Latest signed AI report is not an unresolved-free pass');
 const owner=report.coordinator,origin=report.provenance;
 if(owner?.id!==coordinator?.id||owner?.login!==coordinator?.login||
  !(owner?.verifiedActualSessions===true||origin?.coordinatorVerified===true)||
  origin?.kind!=='coordinator-verified-agent-session'||!text(origin.reviewId)||!text(origin.sessionId))
  errors.push('Trusted coordinator has not attested the actual AI session source');
 if(!agent(report.reviewerAgent)||!Array.isArray(report.implementationAgents)||!report.implementationAgents.length||
  report.implementationAgents.some(value=>!agent(value)||value===report.reviewerAgent)||
  new Set(report.implementationAgents).size!==report.implementationAgents.length)
  errors.push('AI reviewer must be a distinct agent from every recorded implementation agent');
 return errors;
}

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
 // COMMENTED is the coordinator's signed attestation of actual independent
 // cloud AI sessions. GitHub account separation or human approval is not needed.
 if(!selected)errors.push('No report signed by an authorized maintain/admin coordinator');
 else{
  try{report=parseIndependentAiReview(selected.body);}catch(error){errors.push(error.message);}
  if(!['COMMENTED','APPROVED'].includes(selected.state)||selected.commit_id!==head)
   errors.push('Signed Review is dismissed, rejected, unpublished or belongs to another HEAD');
  const decisions=new Map();
  for(const review of [...signed].sort(reviewOrder))if(['APPROVED','CHANGES_REQUESTED'].includes(review.state))decisions.set(review.user.id,review);
  if([...decisions.values()].some(review=>review.state==='CHANGES_REQUESTED'))
   errors.push('A trusted reviewer still requests changes');
  if(report)errors.push(...independentAiReportErrors(report,{repository,pr,baseSha,sourceCommit,coordinator:selected.user}));
 }
 return {conclusion:errors.length?'fail':'pass',errors,report,reviewId:report?.provenance?.reviewId,
  githubReviewId:selected?.id,githubReviewUrl:selected?.html_url,coordinator:selected?.user,
  repositoryId:repository?.id,repo,prNumber:pr?.number,head,base:baseSha,tree,mergeCommitSha:merge};
}

// Queue consumption revalidates the original immutable reviewed combination
// against fresh server Reviews and roles. The live PR is a separate observation;
// its cached BASE is never rewritten to manufacture historical evidence.
export function validateHistoricalIndependentAiReview({repository,preflight,livePr,reviews,permissions}){
 const original=preflight?.nativeReview,recorded=original?.observations?.prBefore;
 const historicalPr={...recorded,user:{id:recorded?.authorId}};
 const result=validateIndependentAiReview({repository,pr:historicalPr,baseSha:preflight?.base,
  sourceCommit:original?.observations?.sourceCommit,reviews,permissions,
  dependencies:original?.observations?.dependencies});
 if(livePr?.number!==preflight?.prNumber||livePr?.head?.sha!==preflight?.head||livePr?.user?.id!==recorded?.authorId||
  livePr?.state!=='open'||livePr?.merged!==false||livePr?.draft!==false||livePr?.base?.ref!=='develop'||
  !projectRepositoryMatches(livePr?.base?.repo,preflight?.repo)||!projectRepositoryMatches(livePr?.head?.repo,preflight?.repo))
  result.errors.push('Live PR identity differs from the originally reviewed candidate');
 if(result.githubReviewId!==original?.githubReviewId||!isDeepStrictEqual(result.report,original?.report)||
  !isDeepStrictEqual(result.coordinator,original?.coordinator))
  result.errors.push('Latest server Review differs from the immutable original review proof');
 result.conclusion=result.errors.length?'fail':'pass';
 return {...result,observations:{historicalPr:recorded,historicalSourceCommit:original?.observations?.sourceCommit,
  livePr,reviews,permissions}};
}

// Complete server Review records also select the staged migration path. Any
// marker from a fixed trusted actor opts into the new contract, even if invalid.
export function collectIndependentAiReviewRecords({api,repo,prNumber}){
 if(typeof api!=='function'||!positive(prNumber))throw Error('Synchronous API and exact PR number are required');
 const reviews=[];
 for(let page=1;;page++){
  const rows=api(`repos/${repo}/pulls/${prNumber}/reviews?per_page=100&page=${page}`);
  if(rows&&typeof rows.then==='function')throw Error('API adapter must return synchronous parsed JSON');
  if(!Array.isArray(rows)||rows.length>100)throw Error('Malformed paginated PR Review response');
  reviews.push(...rows);
  if(reviews.some(row=>!positive(row?.id))||new Set(reviews.map(row=>row.id)).size!==reviews.length)
   throw Error('Missing or duplicate paginated Review records');
  if(rows.length<100)break;
 }
 return reviews;
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
  const reviews=collectIndependentAiReviewRecords({api:read,repo,prNumber});
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
