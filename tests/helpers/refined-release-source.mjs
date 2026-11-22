import {beforeCombatVisualSource,combatVisualPriorRead,assertCombatVisualCurrent} from './combat-visual-source.mjs';
// Historical-only continuation. Production builds and test discovery use live inputs.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const hash=(source,algorithm='sha256')=>createHash(algorithm).update(source).digest('hex');
const blob=source=>hash(`blob ${Buffer.byteLength(source)}\0${source}`,'sha1');
const normalize=source=>source.replaceAll('\r\n','\n');
const gzip=readFileSync(new URL('./refined-release-source.json.gz',import.meta.url));
assert.equal(hash(gzip),'6b9e66890ecfeac7f0b581ece462edaf41095f6d2937896cf6032e9e8ee9a9a3','exact refined Release source archive');
const {schemaVersion,base,normalization,files,addedJs}=JSON.parse(gunzipSync(gzip));
assert.equal(schemaVersion,1);assert.equal(normalization,'LF');
assert.equal(base,'7381cf7152ba7a726506f9a5b525e13cfbd2c87a');
const paths=Object.keys(files),owners=paths.filter(path=>path.startsWith('src/lua/'));
export const refinedReleaseProductionPaths=Object.freeze(owners);
assert.deepEqual(owners,['src/lua/abyss_monster_art.lua','src/lua/abyss_monster_surfaces.lua']);
for(const [path,{before,after}]of Object.entries(files)){
 assert.equal(normalize(before.source),before.source,path);
 assert.equal(hash(before.source),before.sha256,path);
 assert.equal(blob(before.source),before.gitBlob,path);
 assert.notEqual(before.sha256,after.sha256,path);
}
for(const {sha256,gitBlob} of [...Object.values(files).map(row=>row.after),...Object.values(addedJs)]){
 assert.match(sha256,/^[a-f0-9]{64}$/);assert.match(gitBlob,/^[a-f0-9]{40}$/);
}
function matches(source,binding){
 if(!binding||typeof source!=='string'||source.includes('\r\r\n'))return false;
 const lf=normalize(source);
 return hash(lf)===binding.sha256&&blob(lf)===binding.gitBlob;
}
const successorBytes=readFileSync(new URL('./refined-release-successor-source.json.gz',import.meta.url));
assert.equal(hash(successorBytes),'79e11bf3d78cecb730751c553f3411db0b3c1a0311966c6a00e882dc8c8812b9','exact refined Release successor archive');
const successors=JSON.parse(gunzipSync(successorBytes));
assert.equal(successors.base,'5d34dc3327a0ad1a4597e9e4f8e246a694334106');
for(const {before} of Object.values(successors.files))assert(matches(before.source,before));
export function beforeSelectionReplaySuccessor(path,source){
 if(path!=='tests/helpers/replay-reviewed-selection.mjs'||typeof source!=='string'||source.includes('\r\r\n')||
  hash(normalize(source))!=='626c19f3a4c62b6e371026443da4c4d48f5e68ef6fc29986a3a2fb9ce8688b69')return source;
 const prior=normalize(source).replace(/^const releaseOwners=[^\n]*\n[\s\S]*?(?=^export function replayReviewedSelection)/m,'')
  .replace("import {stageReleaseReplayDependencies} from './release-selection-replay-dependencies.mjs';\n",'')
  .replace('  stageReleaseReplayDependencies(directory);\n','')
  .replace("historicalSelectionOwner(path,readFileSync(path,'utf8'),row)","beforeCurrentProductionSource(path,readFileSync(path,'utf8'))");
 assert.equal(hash(prior),'a6226f3a066101a8059198d167e1504d8dfa0f9ff22d90242eaec793423d3393','exact selection replay helper predecessor');
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
function beforeSuccessor(path,source){
 source=beforeSelectionReplaySuccessor(path,source);
 const row=Object.hasOwn(successors.files,path)?successors.files[path]:null;
 if(!row||!matches(source,row.after))return source;
 return source.includes('\r\n')?row.before.source.replaceAll('\n','\r\n'):row.before.source;
}
function project(path,source){
 if(!Object.hasOwn(files,path)||!matches(source,files[path].after))return source;
 const prior=files[path].before.source;
 return source.includes('\r\n')?prior.replaceAll('\n','\r\n'):prior;
}
export function beforeRefinedReleaseCiSource(path,source){
 return owners.includes(path)?source:project(path,beforeCombatVisualSource(path,beforeSuccessor(path,source),
  owner=>beforeSuccessor(owner,readFileSync(owner,'utf8'))));
}
export function beforeRefinedReleaseProduction(path,source){
 source=beforeCombatVisualSource(path,source);
 return owners.includes(path)?project(path,source):source;
}
export function authorizeRefinedReleaseProduction(samples,read){
 if(!samples.some(([path,source])=>owners.includes(path)&&matches(source,files[path].after)))return;
 for(const [path,source]of samples){
  if(owners.includes(path))assert(matches(source,files[path].after),'mixed linked refined Release source: '+path);
 }
 for(const path of owners){
  let source;try{source=read(path);}catch(error){assert.fail('combined linked owner missing: '+path+': '+String(error?.message??error));}
  assert(matches(source,files[path].after),'combined linked owner identity: '+path+' changed during refined Release source validation');
 }
}
export function assertRefinedReleaseSourcesCurrent(read=readFileSync){
 const prior=(path,encoding)=>beforeSuccessor(path,read(path,encoding));
 for(const path of paths){
  const source=prior(path,'utf8');
  assertCombatVisualCurrent(path,source,owner=>prior(owner,'utf8'));
  assert(matches(beforeCombatVisualSource(path,source,owner=>prior(owner,'utf8')),files[path].after),'fresh complete integration source: refined Release '+path);
 }
}
export function refinedReleaseHistoricalInput(path,read){
 const current=read;
 read=combatVisualPriorRead((owner,encoding)=>beforeSuccessor(owner,current(owner,encoding)));
 if(!Object.hasOwn(files,path)||owners.includes(path))return undefined;
 const source=read(path,'utf8');
 assert(matches(source,files[path].after),'fresh refined Release historical input: '+path);
 return project(path,source);
}
export function beforeRefinedReleaseJsInventory(paths,preceding,read,required=false){
 const added=Object.keys(addedJs);
 if(!required&&!added.some(path=>paths.includes(path)))return paths;
 assert.deepEqual([...paths].sort(),[...preceding,...added].sort(),'complete current raw discovery inventory');
 for(const path of added)assert(matches(read(path,'utf8'),addedJs[path]),'fresh added inventory source: '+path);
 return paths.filter(path=>!Object.hasOwn(addedJs,path));
}
