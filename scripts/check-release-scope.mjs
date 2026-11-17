import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

// Explicit declarations, never inferred from descriptions or changed code.
export function checkReleaseScope(pr){
 const branch=pr?.base?.ref;
 if(!branch?.startsWith('release/'))return {status:'not-release'};
 const version=/^release\/v(\d+\.\d+\.\d+)$/.exec(branch)?.[1];
 if(!version)throw Error('Unrecognized Release version; scope review required.');
 const field=name=>{
  const rows=[...(pr.body??'').matchAll(new RegExp('^'+name+':[ \\t]*([^\\r\\n]*)$','gm'))];
  if(rows.length!==1||!rows[0][1].trim())throw Error('Release requires one '+name+' declaration.');
  return rows[0][1].trim();
 };
 const types=field('Change-Type').split(',').map(x=>x.trim());
 if(types.includes('feature')||/^feat(?:\([^)]+\))?!?:/.test(pr.title??''))throw Error('Feature Freeze: new features belong on develop; PR text cannot grant an exception.');
 if(new Set(types).size!==types.length||types.some(x=>!['bugfix','performance','regression','release-engineering'].includes(x)))throw Error('Invalid Release Change-Type.');
 if(field('Target-Version')!==version)throw Error('Target-Version must match the Release branch.');
 if(/^(?:TODO|TBD|N\/A|none|待填|\.\.\.|<.*>)$/i.test(field('Release-Necessity')))throw Error('Release-Necessity must name the release blocker or required correction.');
 return {status:'allowed',version,types};
}

export async function auditReleaseScope(event,repository,request){
 const pr=event?.pull_request;
 if(!pr?.base?.ref?.startsWith('release/'))return {status:'not-release'};
 const number=pr.number??event.number;
 if(!/^[\w.-]+\/[\w.-]+$/.test(repository)||pr.base.repo?.full_name!==repository||!Number.isSafeInteger(number)||number<1||!/^([a-f0-9]{40})$/.test(pr.head?.sha??''))throw Error('Invalid Release PR identity.');
 const current=await request(`/repos/${repository}/pulls/${number}`);
 if(current?.number!==number||current.base?.repo?.full_name!==repository||current.base.ref!==pr.base.ref||current.head?.sha!==pr.head.sha)throw Error('Release PR identity changed; rerun on the current PR.');
 return {...checkReleaseScope(current),head:current.head.sha};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
  const request=async path=>{
   const response=await fetch(`${process.env.GITHUB_API_URL||'https://api.github.com'}${path}`,{headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${process.env.GITHUB_TOKEN}`},signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw Error(`Release scope lookup failed: HTTP ${response.status}`);
   return response.json();
  };
  console.log(JSON.stringify(await auditReleaseScope(event,process.env.GITHUB_REPOSITORY,request)));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
