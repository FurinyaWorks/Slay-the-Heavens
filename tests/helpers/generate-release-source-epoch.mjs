import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode));
const baseCommit='0cf2008fa4f5086ac3b2b84b71753b84e7a37962',currentCommit='e02ed4abce6a694fcf63cbd91ccde00e5e1e44e9';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const binding=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const sourceViews={selectionReviewed:'f0581b708a62378fa838233139d2efef1db7ed8b',transitionReviewed:'6d77e92035d3ada6629fd2bf723399650dab94d2',releaseReviewed:'900527d931df941eed642a9667ccde92f76b73db'};
const cache=new Map();
const git=(revision,path)=>{const source=cache.get(revision+':'+path);assert.notEqual(source,undefined,'missing frozen source: '+revision+':'+path);return source;};
const inventoryBefore=execFileSync('git',['ls-tree','-r','--name-only',baseCommit,'--','config/architecture.json','src/lua'],{encoding:'utf8'})
 .trim().split('\n').filter(path=>path==='config/architecture.json'||path.endsWith('.lua')).sort();
const menu=JSON.parse(gunzipSync(readFileSync('tests/helpers/session-menu-source-epoch.json.gz')));
const inventoryAfter=menu.inventoryBefore;
const requests=[...new Set([baseCommit,currentCommit,...Object.values(sourceViews)])].flatMap(revision=>[...new Set([...inventoryBefore,...inventoryAfter])].map(path=>revision+':'+path));
const payload=execFileSync('git',['cat-file','--batch'],{input:requests.join('\n')+'\n',maxBuffer:64*1024*1024});
let offset=0;
for(const ref of requests){
 const end=payload.indexOf(10,offset),header=payload.subarray(offset,end).toString();offset=end+1;
 if(header.endsWith(' missing'))continue;
 const size=Number(header.split(' ')[2]);cache.set(ref,norm(payload.subarray(offset,offset+size).toString()));offset+=size+1;
}
const prior=Object.fromEntries(inventoryBefore.map(path=>[path,binding(git(baseCommit,path))]));
const current={},before={};
for(const path of inventoryAfter){
 // Reproduce the frozen release projection independently of later reviewed layers.
 const runtime=git(currentCommit,path);
 const source=Object.hasOwn(menu.before,path)?menu.before[path].source:runtime;
 if(hash(source)!==prior[path]?.sha256){current[path]=binding(source);before[path]=prior[path]??null;}
}
for(const path of inventoryBefore)assert(inventoryAfter.includes(path),'no unregistered source removal');
const views={};
for(const [name,commit]of Object.entries(sourceViews)){
 const files=Object.fromEntries(inventoryAfter.map(path=>{try{return [path,binding(git(commit,path))];}catch{return [path,null];}}));
 views[name]={commit,files};
}
const bytes=gzipSync(JSON.stringify({schemaVersion:1,baseCommit,currentCommit,inventoryBefore,inventoryAfter,current,before,views}));
const path='tests/helpers/release-source-epoch.json.gz';
if(mode==='--write')writeFileSync(path,bytes);else assert.deepEqual(readFileSync(path),bytes);
console.log(JSON.stringify({owners:Object.keys(current).length,paths:inventoryAfter.length,sha256:hash(bytes)}));
