// Offline experiment only. No candidate, gameplay registration or official MB estimate.
import {readFileSync as read,writeFileSync as write,mkdirSync,existsSync,statSync,readdirSync,renameSync} from 'node:fs';
import {relative,join} from 'node:path';
import {sourceInputs,payloadDigest} from '../../scripts/build-native-candidate.mjs';
import {officialAssetFlags} from '../../scripts/official-assets-profile.mjs';
import {reserveOutput,assertStableInputs,verifyRows,assertMappedModules,hash} from './replay-contract.mjs';
import {execFileSync} from 'node:child_process';
import {gzipSync,gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {buildLuaData} from '../../scripts/build-lua-data.mjs';
import {loadOriginalV4,originalV4ToLua} from '../../scripts/build-original-v4.mjs';
import {buildUI} from '../../scripts/build-ui.mjs';
import {packageInventory,verifyPlatformRelease} from '../../scripts/platform-load.mjs';
import {parse} from 'luaparse';
import {candidateScriptFiles} from '../../scripts/native-candidate-scripts.mjs';

function main(){
const args=process.argv.slice(2);
if(![2,4].includes(args.length)||args[0]!=='--out'||args.length===4&&args[2]!=='--delivery-copy')
 throw Error('Usage: node experiments/capacity-105/run.mjs --out build/capacity-105/<new-run> [--delivery-copy <historical.gil>]');
mkdirSync('build',{recursive:true});
const out=reserveOutput(args[1]);
const generatedRoot=join(out,'generated');
const portable=p=>relative(process.cwd(),p).replaceAll('\\','/');
const started=performance.now();
const json=(p,x)=>write(p,JSON.stringify(x,null,2)+'\n');
const record=p=>({path:p,bytes:statSync(p).size,sha256:hash(read(p))});
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const profiles={
  current:{officialAssets:true,nativePageLifecycle:true},
  cliDefaults:{artFeatures:{menuBackground:true,selectionAvatar:true,battlePortrait:true}},
  fallback:{artFeatures:{cards:false,menuBackground:false,selectionAvatar:false,battlePortrait:false,monsters:false}},
};
const historyPaths=['docs/evidence/menu-native-2d-20261112/candidate.json.gz','docs/evidence/official-ui-repair-20261112/candidate.json'];
// Reuse the production builder's input contract for each explicit profile.
// Add this experiment and its readback guard, which are outside production inputs.
function snapshot(){
 const rows=new Map();
 for(const options of [ {artFeatures:officialAssetFlags},profiles.cliDefaults,profiles.fallback ])
  for(const row of sourceInputs(process.cwd(),options))rows.set(row.path,row);
 for(const path of historyPaths)if(existsSync(path))rows.set(path,record(path));
 for(const name of readdirSync('experiments/capacity-105').sort()){
  const path=`experiments/capacity-105/${name}`;
  if(statSync(path).isFile())rows.set(path,record(path));
 }
 return {sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  inputs:[...rows.values()].sort((a,b)=>a.path.localeCompare(b.path))};
}
const before=snapshot();
const original=loadOriginalV4();
const roleIds=['HT','AR','FR','RD'];
const serial=x=>`-- TASK-105 offline synthetic data, NOT playable.\nreturn ${originalV4ToLua(x)}\n`;
const roleSamples=roleIds.map(role=>({role,cards:original.cards.filter(c=>c.role===role),rules:original.rules.roles[role]}));
assert(roleSamples.every(r=>r.cards.length===75));
const samples=roleSamples.map(r=>({role:r.role,cards:75,luaBytes:Buffer.byteLength(serial(r))}));

const inventories={};
for(const [name,options]of Object.entries(profiles)){
  const dir=join(generatedRoot,name);mkdirSync(dir,{recursive:true});
  buildLuaData('data',`${dir}/abyss_data.lua`);buildUI(dir,undefined,options);
  inventories[name]=packageInventory(dir);
  json(`${out}/${name}.json`,inventories[name]);
}
const dir=join(generatedRoot,'current');
const pack=read(`${dir}/abyss_traveler_portrait_assets.lua`,'utf8');
const fields=parse(pack,{ranges:true,luaVersion:'5.3'}).body[0].arguments[0].fields;
const artFields=fields.map(f=>({key:f.key.name,bytes:Buffer.byteLength(pack.slice(...f.range))}));
const unused=fields.find(f=>f.key.name==='selection133');
assert.equal(pack.slice(unused.range[1],unused.range[1]+1),',');
const trimmed=pack.slice(0,unused.range[0])+pack.slice(unused.range[1]+1);
parse(trimmed,{luaVersion:'5.3'});
const baseCards=read(`${dir}/abyss_original_v4_data.lua`,'utf8');
// Reuse four real 75-card designs in rotation. New IDs prevent collision; mechanics
// and text remain repetitions. This exercises serialization, not new game behavior.
function extended(n){
 const data=structuredClone(original);
 for(let i=0;i<n;i++){
  const sample=roleSamples[i%4],id=`X${String(i+1).padStart(3,'0')}`;
  const rewrite=x=>typeof x==='string'?x.replaceAll(sample.role+'2-',id+'2-'):
    Array.isArray(x)?x.map(rewrite):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,rewrite(v)])):x;
  data.cards.push(...sample.cards.map(c=>({...rewrite(c),role:id})));
  data.rules.roles[id]=rewrite(sample.rules);
 }
 assert.equal(new Set(data.cards.map(c=>c.id)).size,300+75*n);
 return serial(data);
}
const rows=[];
for(const n of [0,1,2,10,20,30,100]){
 const cards=n?extended(n):baseCards;
 parse(cards,{luaVersion:'5.3'});
 for(const scheme of ['independent','trimmed','shared','fallback']){
  // Deliberately repeat a complete REAL generated pack: conservative assembly
  // stress. Its digest remains identical; it is NOT N distinct new artworks.
  const variant=scheme==='trimmed'?trimmed:pack;
  const base=scheme==='fallback'?read(join(generatedRoot,'fallback/abyss_traveler_portrait_assets.lua'),'utf8'):variant;
  const copies=['independent','trimmed'].includes(scheme)?n:0;
  const art=copies?`local base=(function()\n${base}\nend)()\nbase.__offlineStress={${Array.from({length:copies},()=>`(function()\n${variant}\nend)()`).join(',')}}\nreturn base\n`:base;
  // Parse one copied pack, not a giant repeated AST; exact output is hash recorded.
  if(n<=2)parse(art,{luaVersion:'5.3'});
  const inv=scheme==='fallback'?inventories.fallback:inventories.current;
  const originalBytes=inv.modules.find(m=>m.name==='abyss_original_v4_data').bytes;
  const portraitBytes=inv.modules.find(m=>m.name==='abyss_traveler_portrait_assets').bytes;
  const luaBytes=inv.luaBytes-originalBytes-portraitBytes+Buffer.byteLength(cards)+Buffer.byteLength(art);
  const generated=scheme==='fallback'?join(generatedRoot,'fallback'):dir;
  const paths=[`${generated}/abyss_original_v4_data.lua`,`${generated}/abyss_traveler_portrait_assets.lua`];
  const saved=paths.map(p=>read(p));
  let mapped;
  try{
   write(paths[0],cards);write(paths[1],art);
   mapped=candidateScriptFiles('src/lua',generated).map(({name,sourceFile})=>({name,...record(sourceFile)}));
   assertMappedModules(mapped,inv);
   assert.equal(mapped.reduce((s,m)=>s+m.bytes,0),luaBytes);
  }finally{paths.forEach((p,i)=>write(p,saved[i]));}
  const payload=Buffer.from(JSON.stringify({cardsLua:cards,portraitLua:art}));
  const file=`${out}/${scheme}-${n}.json.gz`;
  write(file,gzipSync(payload,{level:9,mtime:0}));
  assert.deepEqual(gunzipSync(read(file)),payload);
  rows.push({scheme,additionalRoles:n,totalV4Roles:4+n,cards:300+75*n,
   dataLuaBytes:Buffer.byteLength(cards),portraitLuaBytes:Buffer.byteLength(art),
   luaBytes,deltaLuaBytes:luaBytes-inventories.current.luaBytes,
   layoutJsonBytes:inv.layoutJsonBytes,templateJsonBytes:inv.templateJsonBytes,controls:inv.controls,
   packedArtCopies:scheme==='fallback'?0:1+copies,uniqueArtPacks:scheme==='fallback'?0:1,
   fixedRuntimeHostContract:inv.runtimePortraits,syntheticRuntimeExecuted:false,
   artifact:{...record(file),path:relative(out,file).replaceAll('\\','/')},payloadSha256:hash(payload),
   mappedModuleCount:mapped.length,changedModules:mapped.filter(m=>['abyss_original_v4_data','abyss_traveler_portrait_assets'].includes(m.name)),
   compressionMeaning:'gzip archive for evidence only; repetition is highly compressible; not platform encoding'});
 }
}
// Source-level cost attribution is mutually exclusive and sums to actual manifest.
const categories={gameplayData:[],characterArt:[],sharedPresentation:[],runtimeLogic:[]};
for(const m of inventories.current.modules){
 const category=['abyss_data','abyss_original_v4_data','abyss_narrative','abyss_map_layout'].includes(m.name)?'gameplayData':
 m.name==='abyss_traveler_portrait_assets'?'characterArt':
 /^(abyss_theme|abyss_presentation|abyss_ready_card_assets|abyss_ready_card_binding|abyss_menu_background_asset|abyss_v25_card_assets|abyss_monster_art_data|abyss_monster_actor_binding|abyss_art_features|abyss_ui_profile|abyss_component_binding)$/.test(m.name)?'sharedPresentation':'runtimeLogic';
 categories[category].push(m);
}
const categoryTotals=Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,{bytes:v.reduce((a,m)=>a+m.bytes,0),modules:v.length}]));
assert.equal(Object.values(categoryTotals).reduce((a,c)=>a+c.bytes,0),inventories.current.luaBytes);
const history=[];
for(const path of historyPaths){
 if(!existsSync(path)){history.push({receiptPath:path,status:'unavailable'});continue;}
 const r=JSON.parse(path.endsWith('.gz')?gunzipSync(read(path)):read(path));
 const local=args[3];
 history.push({receipt:record(path),sourceCommit:r.sourceCommit,buildId:r.buildId,payloadDigest:r.payloadDigest,
  candidate:r.candidate,statuses:r.statuses,officialAssetsProfile:r.officialAssetsProfile,
  declaredPathExists:existsSync(r.candidate.path),deliveryCopy:local&&existsSync(local)?record(local):null,
  deliveryHashMatches:local&&existsSync(local)?hash(read(local))===r.candidate.sha256:null,
  modules:r.productionManifest.modules.length,mappedBytes:r.productionManifest.modules.reduce((a,m)=>a+m.bytes,0),
  currentInputMatches:r.inputs.filter(i=>existsSync(i.path)&&hash(read(i.path))===i.sha256).length,inputCount:r.inputs.length,
  noOfficialEvidence:verifyPlatformRelease(r,undefined,()=>{throw Error('must not read absent evidence');})});
}
verifyRows(rows,inventories,out);
assertStableInputs(before,snapshot());
json(`${out}/pending-results.json`,{schemaVersion:2,sourceCommit,recordedAt:new Date().toISOString(),node:process.version,
 measurement:'offline-input-serialization-NOT-official-storage',officialMB:null,officialStatus:'UNVERIFIED',playableCandidatesBuilt:0,
 profiles,inputIdentity:{...before,digest:payloadDigest(before.inputs)},
 replay:{output:portable(out),elapsedMs:performance.now()-started,sourceDirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()!==''},
 samples,categoryTotals,categories,artFields,trimmedPackBytes:Buffer.byteLength(trimmed),portraitPackBytes:Buffer.byteLength(pack),
 rows,history,assertions:'75 cards/role; unique synthetic IDs; Lua syntax data + small art; gzip+mapped byte readback all; full production+experiment input pre/post identity; manifest category sum; absent official evidence refuses PASS'});
// Verify what was actually persisted, not just the objects prepared in memory.
const persisted=JSON.parse(read(`${out}/pending-results.json`));
verifyRows(persisted.rows,inventories,out);
assertStableInputs(before,snapshot());
renameSync(`${out}/pending-results.json`,`${out}/results.json`);
console.log(JSON.stringify({sourceCommit,samples,categoryTotals,profiles:Object.fromEntries(Object.entries(inventories).map(([k,v])=>[k,{luaBytes:v.luaBytes,layout:v.layoutJsonBytes,templates:v.templateJsonBytes,controls:v.controls}])),rows:rows.map(({scheme,additionalRoles,luaBytes,deltaLuaBytes})=>({scheme,additionalRoles,luaBytes,deltaLuaBytes}))},null,2));

}
try{main();}catch(error){console.error(error.stack);process.exitCode=1;}
