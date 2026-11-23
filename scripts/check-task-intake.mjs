import {execFileSync} from 'node:child_process';
import {backlogDeclaration,mentionedTasks} from './backlog-closeout.mjs';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {dependencyReadiness,loadDependencyRecords,normalizeTaskId} from './task-dependencies.mjs';

export const developmentRemotes = {
  origin: 'FurinyaWorks/Slay-the-Heavens',
  'fork-a': 'FurinyaDev/Slay-the-Heavens-Fork-A',
  'fork-b': 'v5g95m7t8m-max/Slay-the-Heavens-Fork-B',
};

function currentOpenPullRequests(root) {
  return [...new Set(Object.values(developmentRemotes))].flatMap(repo => {
    const pages = JSON.parse(execFileSync('gh', ['api', '--paginate', '--slurp',
      `repos/${repo}/pulls?state=open&per_page=100`], { cwd:root, encoding:'utf8', timeout:20000, stdio:['ignore','pipe','pipe'] }));
    if (!Array.isArray(pages)||pages.some(page=>!Array.isArray(page))) throw Error('invalid open PR list');
    return pages.flat().map(pr=>({url:pr.html_url,body:pr.body,title:pr.title,branch:pr.head?.ref}));
  });
}

function validPolicy(policy) {
  return policy?.schemaVersion===1&&Array.isArray(policy.blockedUntilOwnerApproval)
    &&policy.blockedUntilOwnerApproval.every(id=>normalizeTaskId(id))
    &&Object.entries(policy.ownerDecisions??{}).every(([id,decision])=>
      Boolean(normalizeTaskId(id))&&['paused','develop-approved'].includes(decision)
      &&policy.blockedUntilOwnerApproval.some(blocked=>normalizeTaskId(blocked)===normalizeTaskId(id))===(decision==='paused'));
}
export function evaluateIntake({id,task,policy,tasks=task?[task]:[],completed=[],openPullRequests=[]}) {
  const errors=[];
  const identity=normalizeTaskId(id);
  if(!identity)errors.push('invalid task identity');
  if(!task||!identity||normalizeTaskId(task.id)!==identity)errors.push('task not found or identity mismatch');
  if(!validPolicy(policy))return {decision:'HOLD',reasons:[...errors,'task intake policy invalid']};
  if(policy.blockedUntilOwnerApproval.some(blocked=>normalizeTaskId(blocked)===identity))errors.push('explicit Owner approval required');
  if(task?.status!=='To Do')errors.push('already active, blocked or completed; inspect existing PR instead of duplicating');
  if(task?.verificationOnly)errors.push('implementation already delivered; resume verification instead of implementing again');
  if(task?.allCriteriaChecked)errors.push('all AC checked; reconcile delivery and task status before claiming');
  for(const pr of openPullRequests) {
    const {actions,errors:declarationErrors}=backlogDeclaration(pr.body);
    if(!declarationErrors.length&&[...actions].some(([id,action])=>normalizeTaskId(id)===identity&&action==='recorded'))continue;
    if(mentionedTasks([pr.title,pr.body,pr.branch].join('\n')).some(id=>normalizeTaskId(id)===identity))
      errors.push(`Open PR already references this scope: ${pr.url}`);
  }
  if(identity)errors.push(...dependencyReadiness(identity,tasks,completed));
  return {decision:errors.length?'HOLD':'ALLOW',reasons:errors};
}
export function loadTask(id,root='.',records=loadDependencyRecords(root)) {
  const identity=normalizeTaskId(id);
  if(!identity)return null;
  const matches=[...records.tasks,...records.completed].filter(task=>[task.id,task.fileId,...task.identityClaims].some(claim=>normalizeTaskId(claim)===identity));
  if(matches.length!==1||matches[0].location!=='tasks'||matches[0].metadataErrors.length)return null;
  const {fileId,identityClaims,filePath,location,metadataErrors,...task}=matches[0];
  return task;
}
export function checkTaskIntake(id,root='.',{live=false}={}) {
  const policy=JSON.parse(readFileSync(resolve(root,'config/task-intake.json'),'utf8'));
  const records=loadDependencyRecords(root);
  const input={id,task:loadTask(id,root,records),policy,...records};
  const local=evaluateIntake(input);
  if(!live||local.decision==='HOLD')return local;
  try {
    return evaluateIntake({...input,openPullRequests:currentOpenPullRequests(root)});
  } catch {
    return {decision:'HOLD',reasons:['Cannot verify open PRs in the main repository and both Forks; restore GitHub CLI access']};
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const id=process.argv[2]||'';
  const result=checkTaskIntake(id,'.',{live:process.argv.includes('--live')});
  console.log(result.decision+' '+id);
  if(result.reasons.length){console.error(result.reasons.join('\n'));process.exitCode=1}
  else console.log('Still check approvals, open PRs, task claims and file ownership; this command does not claim the task.');
}
