import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';

// Match Backlog identities without Number conversion (large IDs must stay exact).
export function normalizeTaskId(value) {
  if(typeof value!=='string'||!/^task-\d+(?:\.\d+)*$/i.test(value))return null;
  return 'TASK-'+value.slice(5).split('.').map(part=>part.replace(/^0+/,'')||'0').join('.');
}

// The whole-backlog audit also retains historical/custom native identities.
// Intake and new dependency entries keep this project's TASK-numeric contract.
function graphIdentity(value) {
  if(typeof value!=='string'||!/^(?:[a-z]+-)?[a-z\d]+(?:\.[a-z\d]+)*$/i.test(value))return null;
  const prefix=value.match(/^([a-z]+)-/i)?.[1]??'TASK';
  const suffix=value.replace(new RegExp('^'+prefix+'-','i'),'');
  return (prefix+'-'+(/^\d+(?:\.\d+)*$/.test(suffix)
    ?suffix.split('.').map(part=>part.replace(/^0+/,'')||'0').join('.'):suffix)).toUpperCase();
}

function headerLines(source) {
  const lines=source.replace(/^\uFEFF/,'').split(/\r?\n/);
  if(!/^---[ \t]*$/.test(lines[0]))return null;
  const end=lines.findIndex((line,index)=>index>0&&/^---[ \t]*$/.test(line));
  return end<0?null:lines.slice(1,end);
}

// Deliberately accept native lists, not arbitrary YAML. Unsupported syntax must
// remain visible to both intake and the whole-backlog structural audit.
export function readDependencies(source) {
  const header=headerLines(source),dependencies=[],dependencyErrors=[];
  const fail=reason=>dependencyErrors.push('malformed dependencies: '+reason);
  if(!header)fail('incomplete frontmatter');
  if(header?.some(line=>line.trim()&&!/^[ \t#]/.test(line)&&!/^\w[\w-]*[ \t]*:/.test(line)))
    fail('unsupported metadata key syntax');
  const fields=(header??[]).flatMap((line,index)=>{
    const match=line.match(/^dependencies[ \t]*:[ \t]*(.*)$/);
    return match?[{index,value:match[1].trim()}]:[];
  });
  if(fields.length>1)fail('duplicate field');
  if(fields.length===1) {
    const {index,value}=fields[0],continuation=[];
    for(const line of header.slice(index+1)) {
      if(!line.trim()||/^\s*#/.test(line))continue;
      if(!/^[ \t]/.test(line))break;
      continuation.push(line);
    }
    const add=value=>{
      const token=value.match(/^(?:'(task-\d+(?:\.\d+)*)'|"(task-\d+(?:\.\d+)*)"|(task-\d+(?:\.\d+)*))(?:[ \t]+#.*)?$/i);
      if(!token)fail('invalid task ID entry');
      else dependencies.push(token[1]??token[2]??token[3]);
    };
    if(!value||value.startsWith('#')) {
      if(!continuation.length)fail('expected a list, got an empty scalar');
      let indent;
      for(const line of continuation) {
        const entry=line.match(/^( +)-[ \t]+(.+)$/);
        if(!entry||indent!==undefined&&entry[1].length!==indent)fail('invalid block list');
        else {indent=entry[1].length;add(entry[2].trim());}
      }
    } else {
      const inline=value.match(/^\[(.*?)\](?:[ \t]+#.*)?$/);
      if(!inline||continuation.length||inline[1].includes('#'))fail('expected a single-line list');
      else if(inline[1].trim()) {
        const entries=inline[1].split(',').map(entry=>entry.trim());
        if(entries.at(-1)==='')entries.pop(); // YAML permits a trailing comma.
        for(const entry of entries)add(entry);
      }
    }
  }
  return {dependencies,dependencyErrors,present:fields.length>0};
}

// The existing intake scalar checks also apply to dependency records: a Done
// hidden by duplicate, multiline or unsupported metadata is not authoritative.
export function readNativeTask(source) {
  const header=headerLines(source);
  if(!header)return null;
  const keys=header.filter(line=>/^\w[\w-]*[ \t]*:/.test(line)).map(line=>line.match(/^([\w-]+)[ \t]*:/)[1]);
  if(new Set(keys).size!==keys.length)return null;
  if(header.some(line=>line.trim()&&!/^[ \t#]/.test(line)&&!/^\w[\w-]*[ \t]*:/.test(line)))return null;
  const scalar=key=>{
    const index=header.findIndex(line=>new RegExp('^'+key+'[ \\t]*:').test(line));
    if(index<0)return null;
    for(const line of header.slice(index+1)) {
      if(!line.trim()||/^\s*#/.test(line))continue;
      if(/^[ \t]/.test(line))return null;
      break;
    }
    const value=header[index].replace(new RegExp('^'+key+'[ \\t]*:[ \\t]*'),'').trim();
    if(!value)return null;
    if(value[0]==="'"||value[0]==='"') {
      if(value.length<2||value.at(-1)!==value[0])return null;
      return value.slice(1,-1)||null;
    }
    return /['"]/.test(value)?null:value;
  };
  const task={id:scalar('id'),status:scalar('status'),milestone:scalar('milestone')};
  if(!task.id||!task.status)return null;
  if(header.some(line=>/^milestone[ \t]*:/.test(line))&&!task.milestone)return null;
  const labels=header.join('\n').match(/^labels:[ \t]*(\[[^\n]*\]|\n(?:[ \t]+-[^\n]*\n?)*)/m)?.[1]??'';
  if(/(?:^|[\s\[,'"])(?:待验|delivery-verify)(?=$|[\s\],'"])/u.test(labels))task.verificationOnly=true;
  const criteria=[...(source.match(/<!-- AC:BEGIN -->([\s\S]*?)<!-- AC:END -->/)?.[1]??'').matchAll(/^- \[([ xX])\] /gm)];
  if(criteria.length) {
    task.acCount=criteria.length;
    task.acCompleted=criteria.filter(match=>match[1].toLowerCase()==='x').length;
    if(task.acCompleted===task.acCount)task.allCriteriaChecked=true;
  }
  const {dependencies,dependencyErrors,present}=readDependencies(source);
  if(present)task.dependencies=dependencies;
  if(dependencyErrors.length)task.dependencyErrors=dependencyErrors;
  return task;
}

// Archive is intentionally excluded: it neither proves Done nor supplies a
// claimable task. Keep malformed records indexed by filename so they fail closed.
export function loadDependencyRecords(root='.') {
  const read=location=>{
    const directory=join(root,'backlog',location);
    let names;
    try {names=readdirSync(directory);} catch(error) {if(error.code==='ENOENT')return [];throw error;}
    return names.filter(name=>name.endsWith('.md')).sort().map(name=>{
      const fileId=name.match(/^(task-\d+(?:\.\d+)*) - .+\.md$/i)?.[1]??null;
      const source=readFileSync(join(directory,name),'utf8'),task=readNativeTask(source);
      // A malformed status must not erase an explicit ID and hide a duplicate
      // behind a different filename. Claims only invalidate; they never prove Done.
      const identityClaims=(headerLines(source)??[]).flatMap(line=>{
        const match=line.match(/^(?:id|'id'|"id")[ \t]*:[ \t]*(?:'(task-\d+(?:\.\d+)*)'|"(task-\d+(?:\.\d+)*)"|(task-\d+(?:\.\d+)*))[ \t]*(?:#.*)?$/i);
        return match?[match[1]??match[2]??match[3]]:[];
      });
      const metadataErrors=[];
      if(!task)metadataErrors.push('invalid task metadata');
      else if(!fileId||normalizeTaskId(fileId)!==normalizeTaskId(task.id))metadataErrors.push('filename/metadata identity mismatch');
      return {...task,id:task?.id??identityClaims[0]??fileId,fileId,identityClaims,filePath:join('backlog',location,name),location,metadataErrors};
    });
  };
  return {tasks:read('tasks'),completed:read('completed')};
}

function dependencyIndex(tasks,completed) {
  const index=new Map();
  for(const task of [...tasks,...completed]) {
    const ids=new Set([task.id,task.fileId,...(task.identityClaims??[])].map(graphIdentity).filter(Boolean));
    for(const id of ids) {
      if(!index.has(id))index.set(id,[]);
      index.get(id).push(task);
    }
  }
  return index;
}

function inspectDependencies(roots,tasks,completed,readiness) {
  const index=dependencyIndex(tasks,completed),errors=[],visited=new Set(),active=new Set();
  const report=(chain,reason)=>errors.push(chain.join(' -> ')+': '+reason);
  function visit(id,chain) {
    if(active.has(id)){report(chain,'dependency cycle');return;}
    const matches=index.get(id)??[];
    if(!matches.length){report(chain,'missing dependency task');return;}
    if(matches.length!==1){report(chain,'ambiguous task identity: '+matches.map(task=>task.filePath??task.id).join('; '));return;}
    if(visited.has(id))return;
    visited.add(id);
    const task=matches[0];
    const metadataErrors=[...new Set([...(task.metadataErrors??[]),...(task.dependencyErrors??[])])];
    for(const error of metadataErrors)report(chain,'untrusted metadata: '+error);
    if(readiness&&chain.length>1) {
      if(task.status!=='Done')report(chain,`dependency not Done (${task.status??'unknown status'})`);
      else if(task.acCount>0&&task.acCompleted!==task.acCount)report(chain,'Done dependency has unchecked AC');
    }
    if(task.dependencies!==undefined&&(!Array.isArray(task.dependencies)||task.dependencies.some(dep=>!normalizeTaskId(dep)))) {
      report(chain,'malformed dependencies: expected a task-ID list');return;
    }
    active.add(id);
    for(const dep of new Set((task.dependencies??[]).map(normalizeTaskId)))visit(dep,[...chain,dep]);
    active.delete(id);
  }
  for(const root of roots) {
    const id=graphIdentity(root.id);
    if(!id)errors.push(`${root.filePath??String(root.id)}: invalid task identity`);
    else visit(id,[id]);
  }
  return [...new Set(errors)];
}

// Structural audit only: a valid To Do/Blocked dependency is not a database error.
// Accepts readTaskHeader records, optionally carrying filePath for diagnostics.
export function auditDependencies(tasks,completed=[]) {
  return inspectDependencies([...tasks,...completed],tasks,completed,false);
}

// Readiness is scoped to the target's transitive closure, never unrelated work.
export function dependencyReadiness(id,tasks,completed=[]) {
  return inspectDependencies([{id}],tasks,completed,true);
}
