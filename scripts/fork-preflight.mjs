// Advisory admission only. Never publishes or substitutes a Required Check.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const forks=[1460097312,1460133275];
export function preflightTitle(kind,head,base){return `${kind} / ${head} / ${base}`;}
export function validPreflight(run,{head,base}){
 const kind=run.path==='.github/workflows/quick-feedback.yml'?'Preflight':run.path==='.github/workflows/quality.yml'?'Full':null;
 return Boolean(kind && run.event==='workflow_dispatch' && run.head_sha===head &&
  run.display_title===preflightTitle(kind,head,base) && run.status==='completed' && run.conclusion==='success');
}
export function newestPreflight(runs,identity){
 const matches=runs.filter(run=>run.head_sha===identity.head &&
  ['Preflight','Full'].some(kind=>run.display_title===preflightTitle(kind,identity.head,identity.base)));
 matches.sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||b.id-a.id);
 return matches.length && validPreflight(matches[0],identity) ? matches[0] : null;
}
async function api(path){
 const response=await fetch(`https://api.github.com${path}`,{headers:{Authorization:`Bearer ${process.env.GH_TOKEN}`,
  Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error(`Preflight API ${response.status}: ${path}`);
 return response.json();
}
export async function main(){
 const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH,'utf8')),pr=event.pull_request;
 if(!pr)throw Error('PR identity required');
 const head=pr.head.sha,base=pr.base.sha;
 if(![head,base].every(x=>/^[a-f0-9]{40}$/.test(x)))throw Error('Exact SHA required');
 if(process.env.GITHUB_REPOSITORY_ID!=='1429751262')throw Error('Formal admission belongs to the organization repository');
 const runs=[];
 for(const id of forks){
  const fork=await api(`/repositories/${id}`);
  if(!fork.fork || fork.parent?.id!==1429751262)throw Error('Fork identity mismatch');
  // A completed success observed here necessarily precedes dependent test jobs.
  const data=await api(`/repos/${fork.full_name}/actions/runs?head_sha=${head}&event=workflow_dispatch&per_page=100`);
  runs.push(...data.workflow_runs);
 }
 const match=newestPreflight(runs,{head,base});
 if(match){console.log(`Fork preflight accepted: ${match.html_url}; head=${head}; base=${base}. Formal checks still required.`);return;}
 throw Error(`Fork preflight missing for head=${head}, base=${base}. Complete Fork Quick (or risk-required Full) before retrying this Quality run; no automatic dispatch.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
 main().catch(error=>{console.error(error.message);process.exitCode=1;});
