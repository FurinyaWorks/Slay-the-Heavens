import {existsSync,readFileSync,readdirSync,mkdirSync,renameSync,rmdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readTaskHeader} from './backlog-metadata.mjs';
import {normalizeTaskId} from './task-dependencies.mjs';

// A dotted suffix belongs to the same token. A lone final period is punctuation.
const taskIdPattern = /\bTASK-\d+(?:\.\d+)*(?!\w|\.[\w.])/gi;
const visibleBody = body => (body ?? '').replace(/<!--[^]*?(?:-->|$)/g, '');
export const mentionedTasks = body => [...new Set((visibleBody(body).match(taskIdPattern) ?? []).map(normalizeTaskId))];

const taskPathId = path => normalizeTaskId((path ?? '').match(/^backlog\/(?:tasks|completed|archive\/tasks)\/(task-\d+(?:\.\d+)*) - [^/]+\.md$/)?.[1]);
const archivedTaskPath = path => path.startsWith('backlog/archive/tasks/');

function authoritativeTaskPaths(paths, id) {
  const matches = paths.filter(path => taskPathId(path) === id);
  const current = matches.filter(path => !archivedTaskPath(path));
  return current.length ? current : matches;
}

export function backlogTaskPaths(git, tree) {
  return git('ls-tree','-r','-z','--name-only',tree,'--','backlog/tasks','backlog/completed','backlog/archive/tasks')
    .split('\0').filter(Boolean);
}

export function backlogTaskMoves(git, base, candidate) {
  const rows = git('diff','--name-status','-z','--find-renames','--diff-filter=R','--no-ext-diff','--no-textconv',
    base,candidate,'--','backlog').split('\0');
  if (rows.pop() !== '' || rows.length % 3) throw Error('Invalid Git Backlog rename output');
  const moves = new Map();
  for (let index = 0; index < rows.length; index += 3) {
    const [status, from, to] = rows.slice(index, index + 3);
    if (!/^R\d+$/.test(status) || !from || !to || moves.has(to)) throw Error('Invalid Git Backlog rename row');
    moves.set(to, from);
  }
  return moves;
}

export function changedBacklogTasks(files, basePaths, treePaths, readTaskSource, moves = new Map()) {
  const changed = new Set(files.flatMap(file => [file.filename, file.previous_filename]).filter(Boolean));
  const ids = new Set([...changed].map(taskPathId).filter(Boolean));
  const requiredTaskIds = [], changedTaskIds = [], scopeErrors = [];
  for (const id of ids) {
    const prior = authoritativeTaskPaths(basePaths, id), next = authoritativeTaskPaths(treePaths, id);
    if (![...prior, ...next].some(path => changed.has(path))) continue;
    requiredTaskIds.push(id);
    const [path] = next;
    if (next.length !== 1 || !changed.has(path)) {
      scopeErrors.push(`${id}: changed native task requires one valid candidate task at the changed destination`);
      continue;
    }
    if (prior.some(source => !treePaths.includes(source))) {
      // A changed destination inherits authority only from the uniquely selected BASE record.
      const [source] = prior;
      const changedAlternate = basePaths.some(alternate => alternate !== source &&
        taskPathId(alternate) === id && changed.has(alternate));
      if (prior.length !== 1 || changedAlternate || moves.get(path) !== source) {
        scopeErrors.push(`${id}: changed native task requires a Git rename from its unique BASE path`);
        continue;
      }
    }
    const task = readTaskHeader(readTaskSource(path));
    if (normalizeTaskId(task.id) !== id || task.metadataErrors.length) {
      scopeErrors.push(`${id}: changed native task has invalid candidate metadata or filename identity`);
      continue;
    }
    changedTaskIds.push(id);
  }
  return {requiredTaskIds,changedTaskIds,scopeErrors};
}

export function backlogDeclaration(body, {changedTaskIds=[],requiredTaskIds=changedTaskIds,scopeErrors=[]}={}, title = '') {
  const visible = visibleBody(body);
  const lines = visible.split(/\r?\n/).filter(line => /^Backlog:/.test(line));
  const errors = [...scopeErrors], actions = new Map();
  if (lines.length !== 1) errors.push('Declare exactly one Backlog: line in the PR');
  const value = lines[0]?.slice(8).trim();
  if (value === 'none') {
    const reasons = [...visible.matchAll(/^Backlog-none-reason:[ \t]*(\S[^\r\n]*)$/gm)];
    if (reasons.length !== 1 || /^(?:none|n\/a|todo|无|\[)/i.test(reasons[0][1])) {
      errors.push('Backlog: none requires one specific Backlog-none-reason');
    }
  } else if (value) {
    for (const entry of value.split(',')) {
      const match = entry.trim().match(/^(TASK-\d+(?:\.\d+)*)=(done|verify|continue|recorded|superseded:(TASK-\d+(?:\.\d+)*))$/);
      if (!match || actions.has(match[1])) {
        errors.push('Invalid or duplicate Backlog disposition: ' + entry);
        continue;
      }
      actions.set(match[1], match[2]);
    }
  } else {
    errors.push('Empty Backlog disposition');
  }
  const scope = value === 'none' ? visible : visible.split(/\r?\n/).filter(line => /^Tracks:/.test(line)).join(' ');
  const changed = new Set(changedTaskIds);
  const scoped = new Set([...changed, ...mentionedTasks(title), ...mentionedTasks(scope)]);
  for (const id of new Set([...requiredTaskIds, ...scoped])) {
    if (!actions.has(id)) errors.push(`${id}: missing Backlog disposition`);
  }
  for (const [id, action] of actions) {
    if (action === 'recorded') {
      if (!changed.has(id)) errors.push(`${id}: recorded requires a changed native task file`);
    } else if (!scoped.has(id)) errors.push(`${id}: Backlog disposition is outside declared delivery scope`);
  }
  return { actions, errors };
}

// Explicit instructions in the merged PR, never inference from age or green CI.
export function planBacklogCloseout({body,title,records,mergeSha,prNumber,...changeScope}) {
  const {actions,errors}=backlogDeclaration(body,changeScope,title);
  const commands=[];
  if(!/^[a-f0-9]{40}$/.test(mergeSha??'')||!Number.isSafeInteger(prNumber)||prNumber<1)errors.push('Invalid merged delivery identity');
  const byId=new Map();
  for(const record of records) {
    if(byId.has(record.id))errors.push(`${record.id}: ambiguous Backlog identity`);
    byId.set(record.id,record);
  }
  for(const [id,action] of actions) {
    const task=byId.get(id),marker=`[delivery:${mergeSha}] ${action}`;
    if(!task){errors.push(`${id}: task missing from this checkout; refresh the working tree`);continue;}
    if(task.metadataErrors?.length){errors.push(`${id}: invalid native metadata`);continue;}
    const note=`${marker} PR #${prNumber}; remaining AC: ${task.acCount-task.acCompleted}.`;
    if(action==='recorded') {
      if(!['tasks','completed','archive'].includes(task.location)||!['To Do','In Progress','Blocked','Done'].includes(task.status)||
        task.location==='completed'&&task.status!=='Done'||task.status==='Done'&&(!task.acCount||task.acCompleted!==task.acCount))
        errors.push(`${id}: recorded cleanup has inconsistent status or AC`);
    } else if(action==='done') {
      if(!task.acCount||task.acCompleted!==task.acCount){errors.push(`${id}: done requires every existing AC checked with evidence`);continue;}
      if(task.location==='completed'&&task.status==='Done')continue;
      if(task.location!=='tasks'){errors.push(`${id}: archived work cannot be silently completed`);continue;}
      const noted=task.source.includes(marker);
      if(task.status!=='Done'||!noted)commands.push(['task','edit',id,'-s','Done','--remove-label','待验,delivery-verify',...(!noted?['--append-notes',note]:[])]);
      commands.push(['task','complete',id]);
    } else if(action.startsWith('superseded:')) {
      const successor=action.slice(11),target=byId.get(successor),seen=new Set([id]);
      let next=successor;
      while(actions.get(next)?.startsWith('superseded:')&&!seen.has(next)){seen.add(next);next=actions.get(next).slice(11);}
      if(!target||target.metadataErrors?.length||!['To Do','In Progress','Blocked','Done'].includes(target.status)||target.location==='archive'||seen.has(next)||successor===id){errors.push(`${id}: missing, invalid, archived or cyclic successor ${successor}`);continue;}
      const identity=normalizeTaskId(id);
      if(records.some(record=>record.location==='tasks'&&record.status!=='Done'&&
        record.dependencies?.some(dependency=>normalizeTaskId(dependency)===identity))) {
        errors.push(`${id}: migrate active dependencies before superseding`);continue;
      }
      if(task.location==='archive'&&task.source.includes(marker)&&task.references?.includes(successor))continue;
      if(task.location!=='tasks'||task.status==='Done'){errors.push(`${id}: only unfinished active work may be superseded`);continue;}
      if(!task.source.includes(marker)||!task.references?.includes(successor))commands.push(['task','edit',id,'--add-ref',successor,...(!task.source.includes(marker)?['--append-notes',note]:[])]);
      commands.push(['task','archive',id]);
    } else {
      if(task.location!=='tasks'||task.status==='Done'){errors.push(`${id}: not unfinished active work`);continue;}
      if(action==='verify'&&task.acCompleted===task.acCount){errors.push(`${id}: no open AC left to verify; reconcile as done`);continue;}
      if(action==='verify'&&task.status==='Blocked'){errors.push(`${id}: resolve the explicit Blocked reason before resuming verification`);continue;}
      const waiting=task.status==='In Progress'&&task.labels?.includes('待验');
      const noted=task.source.includes(marker);
      if(noted&&(action==='continue'||waiting))continue;
      commands.push(['task','edit',id,...(action==='verify'?['-s','In Progress','--add-label','待验,delivery-verify']:[]),...(!noted?['--append-notes',note]:[])]);
    }
  }
  return {errors,commands:errors.length?[]:commands};
}

export function readBacklogRecords(root,ids=null,{bindIdentity=false}={}) {
  const records=[];
  // Archived legacy duplicate IDs must not shadow current/completed records.
  for(const [directory,location] of [['backlog/tasks','tasks'],['backlog/completed','completed'],['backlog/archive/tasks','archive']]) {
    if(!existsSync(join(root,directory)))continue;
    for(const name of readdirSync(join(root,directory)).filter(name=>name.endsWith('.md'))) {
      const filePath=join(directory,name),source=readFileSync(join(root,filePath),'utf8'),task=readTaskHeader(source);
      const identity=bindIdentity && taskPathId(filePath.replaceAll('\\','/'));
      if(identity){
        if(normalizeTaskId(task.id)!==identity)task.metadataErrors.push('Native task filename and header identify different tasks');
        task.id=identity;
      }
      if(location==='archive'&&(ids&&!ids.has(task.id)||records.some(record=>record.id===task.id)))continue;
      records.push({...task,source,location,filePath});
    }
  }
  return records;
}

export function runBacklog(args,{root=process.cwd()}={}) {
  const windows=process.platform==='win32';
  const command='$cliArgs=@('+args.map(arg=>"'"+arg.replaceAll("'","''")+"'").join(',')+'); & backlog @cliArgs; exit $LASTEXITCODE';
  const result=spawnSync(windows?'pwsh':'backlog',windows?['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(command,'utf16le').toString('base64')]:args,
    {cwd:root,encoding:'utf8',timeout:30000,windowsHide:true,maxBuffer:8*1024*1024});
  if(result.error||result.status!==0)throw Error('Backlog CLI failed: '+(result.error?.message||result.stderr||result.stdout));
  return result.stdout;
}

export function syncBacklogCloseout({pr,files,targetSha,readTargetSha,root=process.cwd()},run=runBacklog) {
  if(pr?.merged!==true||pr?.base?.ref!=='develop')throw Error('Backlog synchronization requires a verified merged develop PR');
  // Do not let an old PR/worktree overwrite a task that evolved on develop.
  const git=(...args)=>{
    const result=spawnSync('git',args,{cwd:root,encoding:'utf8',timeout:10000,maxBuffer:8*1024*1024});
    if(result.error||result.status!==0)throw Error('Backlog pending: cannot bind task snapshot to Git');
    return result.stdout;
  };
  if(!/^[a-f0-9]{40}$/.test(targetSha??'')||git('rev-parse','HEAD').trim()!==targetSha)
    throw Error('Backlog pending: refresh checkout to the actual current develop SHA');
  const mergeSha=pr.merge_commit_sha;
  if(!/^[a-f0-9]{40}$/.test(mergeSha??''))throw Error('Invalid merged delivery identity');
  git('merge-base','--is-ancestor',mergeSha,targetSha);
  const base=`${mergeSha}^1`,basePaths=backlogTaskPaths(git,base),paths=backlogTaskPaths(git,mergeSha);
  const readMergedTask=path=>git('show',`${mergeSha}:${path}`);
  const changeScope=changedBacklogTasks(files,basePaths,paths,readMergedTask,backlogTaskMoves(git,base,mergeSha));
  const declaration=visibleBody(pr.body).split(/\r?\n/).filter(line=>/^Backlog:/.test(line)).join('\n');
  const ids=new Set(mentionedTasks(declaration));
  const input={body:pr.body,title:pr.title,mergeSha,prNumber:pr.number,...changeScope};
  const readCurrent=()=>readBacklogRecords(root,ids,{bindIdentity:true});
  const records=readCurrent(),plan=planBacklogCloseout({...input,records});
  if(plan.errors.length)throw Error('Backlog pending: '+plan.errors.join('; '));
  if(plan.commands.length&&typeof readTargetSha!=='function')
    throw Error('Backlog pending: current remote develop reader is required before CLI writes');
  const digest=list=>createHash('sha256').update(JSON.stringify(list.filter(record=>ids.has(record.id))
    .map(record=>[record.id,record.filePath,record.source]).sort((a,b)=>a[0].localeCompare(b[0])))).digest('hex');
  const directory=join(root,'build/delivery'),receiptPath=join(directory,`backlog-${pr.number}-${pr.merge_commit_sha}.json`);
  const receipt=existsSync(receiptPath)?JSON.parse(readFileSync(receiptPath,'utf8')):null;
  // Only our exact last readback can resume a partial CLI sequence. A marker
  // retained in later user edits is not a mutation capability.
  const retry=receipt?.schemaVersion===1&&receipt.targetSha===targetSha&&receipt.prNumber===pr.number&&
    receipt.mergeSha===pr.merge_commit_sha&&receipt.declaration===declaration&&receipt.snapshot===digest(records);
  for(const id of ids) {
    const task=records.find(record=>record.id===id),authoritative=authoritativeTaskPaths(paths,id);
    if(!task||authoritative.length!==1)throw Error(`${id}: merged task snapshot missing or ambiguous`);
    const [path]=authoritative;
    const committed=readMergedTask(path).replaceAll('\r\n','\n'),current=task.source.replaceAll('\r\n','\n');
    if((task.filePath.replaceAll('\\','/')!==path||current!==committed)&&!retry)
      throw Error(`${id}: task changed since this PR; reconcile the newer task instead of overwriting it`);
  }
  mkdirSync(directory,{recursive:true});
  const lock=join(directory,'backlog-write.lock');
  mkdirSync(lock);
  try {
    let expected=digest(records);
    const save=()=>{
      const temporary=receiptPath+'.tmp';
      writeFileSync(temporary,JSON.stringify({schemaVersion:1,targetSha,prNumber:pr.number,
        mergeSha:pr.merge_commit_sha,declaration,snapshot:expected},null,2)+'\n');
      renameSync(temporary,receiptPath);
    };
    const checkCurrent=()=>{
      const current=readCurrent();
      if(git('rev-parse','HEAD').trim()!==targetSha||digest(current)!==expected)
        throw Error('Backlog pending: task snapshot or HEAD changed before CLI write');
      return current;
    };
    const checkTarget=()=>{
      if(readTargetSha&&readTargetSha()!==targetSha)
        throw Error('Backlog pending: remote develop advanced during closeout');
    };
    checkTarget();
    checkCurrent();
    save();
    for(const args of plan.commands) {
      checkTarget();
      const before=checkCurrent();
      const pending=planBacklogCloseout({...input,records:before});
      if(pending.errors.length)throw Error('Backlog pending: '+pending.errors.join('; '));
      if(JSON.stringify(pending.commands[0])!==JSON.stringify(args))
        throw Error('Backlog pending: next CLI operation changed; preserve the last checkpoint');
      run(args,{root});
      const after=readCurrent();
      const otherTasks=list=>digest(list.filter(task=>task.id!==args[2]));
      if(otherTasks(before)!==otherTasks(after))
        throw Error('Backlog pending: another task changed during CLI write; preserve the last checkpoint');
      expected=digest(after);
      save();
    }
    checkTarget();
    const after=planBacklogCloseout({...input,records:checkCurrent()});
    if(after.errors.length||after.commands.length)throw Error('Backlog CLI readback differs from declared disposition; preserve this checkout and reconcile');
    return {state:'backlog_synced',prNumber:pr.number,mergeSha:pr.merge_commit_sha,targetSha,
      taskIds:[...ids],commands:plan.commands.length};
  } finally {
    rmdirSync(lock);
  }
}
