import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {dependencyReadiness,loadDependencyRecords,normalizeTaskId} from './task-dependencies.mjs';

function validPolicy(policy) {
  return policy?.schemaVersion===1&&Array.isArray(policy.blockedUntilOwnerApproval)
    &&policy.blockedUntilOwnerApproval.every(id=>normalizeTaskId(id));
}
export function evaluateIntake({id,task,policy,tasks=task?[task]:[],completed=[]}) {
  const errors=[];
  const identity=normalizeTaskId(id);
  if(!identity)errors.push('invalid task identity');
  if(!task||!identity||normalizeTaskId(task.id)!==identity)errors.push('task not found or identity mismatch');
  if(!validPolicy(policy))return {decision:'HOLD',reasons:[...errors,'task intake policy invalid']};
  if(policy.blockedUntilOwnerApproval.some(blocked=>normalizeTaskId(blocked)===identity))errors.push('explicit Owner approval required');
  if(task?.status!=='To Do')errors.push('already active, blocked or completed; inspect existing PR instead of duplicating');
  if(task?.verificationOnly)errors.push('implementation already delivered; resume verification instead of implementing again');
  if(task?.allCriteriaChecked)errors.push('all AC checked; reconcile delivery and task status before claiming');
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
export function checkTaskIntake(id,root='.') {
  const policy=JSON.parse(readFileSync(resolve(root,'config/task-intake.json'),'utf8'));
  const records=loadDependencyRecords(root);
  return evaluateIntake({id,task:loadTask(id,root,records),policy,...records});
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const id=process.argv[2]||'';
  const result=checkTaskIntake(id);
  console.log(result.decision+' '+id);
  if(result.reasons.length){console.error(result.reasons.join('\n'));process.exitCode=1}
  else console.log('Still check approvals, open PRs, task claims and file ownership; this command does not claim the task.');
}
