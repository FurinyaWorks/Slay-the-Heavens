// Exact historical views of the joint develop/Release composition.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const hash=(s,algorithm='sha256')=>createHash(algorithm).update(s).digest('hex');
const archive=readFileSync(new URL('./rebased-release-source.json.gz',import.meta.url));
assert.equal(hash(archive),'9ae910d679bdc8386063c58043a43e496ee34b7c6f22fc1a27cbaeca7b27222d','exact reconciled source archive');
const {develop,release,ci,production,releaseCopier,reviewedBuild,stsUi}=JSON.parse(gunzipSync(archive));
assert.equal(develop,'aae948788d93012d11fe5b6da3281150bb9957c6');
assert.equal(release,'930097995be43e5612e949a3b5fa0c1d5d305f49');
function matches(source,binding){
 if(typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=source.replaceAll('\r\n','\n');
 return hash(lf)===binding.sha256&&hash(`blob ${Buffer.byteLength(lf)}\0${lf}`,'sha1')===binding.gitBlob;
}
for(const rows of [ci,production,reviewedBuild.files,stsUi.files])for(const {before} of Object.values(rows))assert(matches(before.source,before));
assert.equal(stsUi.source,'d667ad4dd4b7dc4ad5419aee8eba8a1548ea5769');
assert.equal(reviewedBuild.source,'900527d931df941eed642a9667ccde92f76b73db');
assert(matches(releaseCopier.source,releaseCopier),'immutable Release copy closure');
export const historicalReleaseCopier=source=>source.includes('\r\n')?releaseCopier.source.replaceAll('\n','\r\n'):releaseCopier.source;
function historical(rows,path,source){
 const row=Object.hasOwn(rows,path)?rows[path]:null;
 if(!row||!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}
export function exactReviewedBuildInput(path,read){
 if(!Object.hasOwn(reviewedBuild.files,path))return undefined;
 const source=read(path,'utf8');
 const {after,before}=reviewedBuild.files[path];
 assert(matches(source,after),'fresh reviewed build input: '+path);
 return before.source;
}
export const beforeRebasedCi=(path,source)=>historical(ci,path,source);
export const beforeRebasedRelease=(path,source)=>historical(production,path,source);
export const rebasedReleaseOwns=path=>Object.hasOwn(production,path);
export const rebasedDevelopOwns=path=>path.startsWith('src/lua/')&&Object.hasOwn(ci,path);
export function authorizeRebasedRelease(samples,read,sources=production){
 const seen=new Set();
 for(const [path,source] of samples){
  if(!Object.hasOwn(sources,path)||seen.has(path)||!matches(source,sources[path].after))continue;
  seen.add(path);
  const {after}=sources[path];
  assert(samples.every(([owner,bytes])=>owner!==path||matches(bytes,after)),'combined linked owner identity: '+path+' mixed live and predecessor sources');
  let live;
  try{live=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(live,after),'combined linked owner identity: '+path+' changed during owner validation');
 }
}

export function authorizeRebasedDevelop(samples,read){return authorizeRebasedRelease(samples,read,ci);}

export const beforeRebasedStsUi=(path,source)=>historical(stsUi.files,path,source);
export function authorizeRebasedStsUi(samples,read){return authorizeRebasedRelease(samples,read,stsUi.files);}
