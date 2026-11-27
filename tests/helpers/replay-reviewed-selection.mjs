import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,copyFileSync,cpSync,symlinkSync,realpathSync} from 'node:fs';
import {join,dirname,resolve,relative,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sourceEpoch} from './closeout-source-epoch.mjs';
import {integratedCiProof,assertIntegratedCurrent} from './integrated-ci-source.mjs';
import {beforeCurrentProductionSource,beforeCharacterPreparationSource} from './character-preparation-source.mjs';
import {exactReviewedBuildInput} from './rebased-release-source.mjs';
import {beforeReviewedBuildInput,chapterEvidenceCurrentRead} from './fork-preflight-source.mjs';
import {reviewedSelectionRead} from './reviewed-selection-current-source.mjs';
import {uiEntranceOwns} from './ui-entrance-source.mjs';
import {checkedSelectionEntranceRead,selectionNodeNoticePath} from './ui-selection-current-source.mjs';
import {releaseEntranceOwns} from './release-entrance-owner-source.mjs';
import {stsStylePriorRuntime} from './sts-style-prior-runtime.mjs';
import {beforeDeckPagesSuiteSource,readRetiredController,retiredControllerPath} from './input-retirement-source.mjs';
import {beforeMasterBackflowSource,readBeforeMasterBackflowSource,productionReadingBackflowOwns} from './master-backflow-source.mjs';
import {beforeOfficialCharacterBackflow} from './current-replay-fix-sources.mjs';
import {readReviewedOfficialAssetInput,reviewedOfficialAssetInputPaths} from './reviewed-official-asset-inputs.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const archivedOfficialAssets='tests/official-assets.test.mjs';
const reviewedContracts=Object.freeze({
 'tests/sts-character-reference.test.mjs':5,
 'tests/official-assets-legibility.test.mjs':10,
 'tests/sts-card-reference.test.mjs':13,
 [archivedOfficialAssets]:6,
});
const readingOwner=path=>productionReadingBackflowOwns(path)||path==='src/lua/abyss_battle_card_layout.lua'||path==='src/lua/abyss_viewport.lua';
export function readSelectionProductionOwners(read,readOwner){
 const readEntrance=chapterEvidenceCurrentRead(checkedSelectionEntranceRead((path,encoding)=>{
  const raw=read(path,encoding);
  const source=Buffer.isBuffer(raw)?raw.toString('utf8'):raw;
  // The Selection reader authenticates the entire release entrance cohort from raw checkout bytes.
  if(releaseEntranceOwns(path)||productionReadingBackflowOwns(path)||path===selectionNodeNoticePath||beforeOfficialCharacterBackflow(path,source)!==source)return raw;
  return beforeMasterBackflowSource(path,raw);
 }));
 return (path,encoding='utf8')=>readingOwner(path)||uiEntranceOwns(path)?readEntrance(path,encoding):readOwner(path,encoding);
}
// Selection's archived intent owner predates #875. Its original reviewed
// reader must reauthenticate those exact bytes at the current-only seam.
export function beforeCurrentSelectionProductionSource(path,readCurrent,readReviewed){
 const read=readingOwner(path)||path==='src/lua/abyss_battle_intent_view.lua'?readReviewed:readCurrent;
 return beforeCurrentProductionSource(path,read(path),read);
}
const readLiveOwner=path=>readFileSync(path,'utf8');
export function readReviewedSelectionSource(path,read=readLiveOwner){
 assert(Object.hasOwn(sourceEpoch.proof.current,path),'registered historical selection owner: '+path);
 const row=sourceEpoch.proof.current[path];
 if(row===null)return null;
 const readOwner=reviewedSelectionRead(read);
 const retired=path===retiredControllerPath;
 const live=retired?readRetiredController(readOwner).source:read(path);
 assert(typeof live==='string'&&!live.includes('\r\r\n')&&
  (read===readLiveOwner||(!retired&&norm(live)===norm(readLiveOwner(path)))),
  'fresh current production owner: '+path);
 const readCurrent=readSelectionProductionOwners(read,readOwner);
 const source=retired?beforeCharacterPreparationSource(path,live,readCurrent)
  :beforeCurrentSelectionProductionSource(path,readCurrent,readOwner);
 assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);
 return source;
}
export function replayReviewedSelection(script='tests/sts-character-reference.test.mjs'){
 assert(Object.hasOwn(reviewedContracts,script),'exact reviewed selection contract');
 const expected=reviewedContracts[script],root=process.cwd();
 assertIntegratedCurrent();
 const readCurrent=readBeforeMasterBackflowSource(readFileSync);
 const readOwner=reviewedSelectionRead();
 const readProductionOwner=readSelectionProductionOwners(readFileSync,readOwner);
 const retiredInput=readRetiredController(readOwner);
 assert(retiredInput.restored,'only the exact pointer successor can restore the retired input owner');
 for(const [path,row]of Object.entries(sourceEpoch.proof.current)){
  const source=path===retiredControllerPath?beforeCharacterPreparationSource(path,retiredInput.source,readProductionOwner)
   :beforeCurrentSelectionProductionSource(path,readProductionOwner,readOwner);
  assert.equal(hash(norm(source)),row.sha256,'fresh current production owner: '+path);
 }
 assert.equal(integratedCiProof.sources.release,'900527d931df941eed642a9667ccde92f76b73db');
 const original=integratedCiProof.files[script].views.release;assert(original,'complete original selection contract');
 const directory=mkdtempSync(join(tmpdir(),'abyss-reviewed-selection-'));
 const started=Date.now(),remaining=()=>{const ms=60000-(Date.now()-started);assert(ms>0,'original selection replay deadline');return ms;};
 const useArchivedOfficialInputs=script===archivedOfficialAssets;
 try{
  const paths=execFileSync('git',['ls-files','scripts','data','config','tools','tests/helpers'],{encoding:'utf8'}).trim().split('\n');
  for(const path of paths){
   assert(!isAbsolute(path)&&!path.split('/').includes('..'));const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});
   const input=useArchivedOfficialInputs?readReviewedOfficialAssetInput(path,readCurrent):undefined;
   const predecessor=input??exactReviewedBuildInput(path,readProductionOwner,{beforeReviewedInput:beforeReviewedBuildInput});
   if(predecessor===undefined)copyFileSync(path,target);
   else writeFileSync(target,predecessor);
  }
  cpSync(join(root,'tests/fixtures'),join(directory,'tests/fixtures'),{recursive:true});
  for(const [path,row]of Object.entries(integratedCiProof.files)){
   if(!row.views.release||path.startsWith('src/'))continue;
   const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,row.views.release.source);
  }
  // The old exit layout needs its retired guide, and its native candidate
  // imports the script and cache modules from before the paged deck templates.
  const controls='scripts/controls-guide-layout.mjs';
  const dependencies={
   [controls]:'0dd26ffbe94d487478a961c1fd90c8ff348a3615347102a1478f3f7fa56a444f',
   'scripts/native-candidate-scripts.mjs':'d75104fc6ab3e3b0c5196678bbd96e5ba4cacbb6938631743b752dd3ecd9f939',
   'scripts/native-candidate-ui-cache.mjs':'b1cddca52e1f8340efdc9666ff9aecbfe905abb1235edae9e95c4c2064fec977',
  };
  for(const [path,sha]of Object.entries(dependencies)){
   if(path!==controls)beforeDeckPagesSuiteSource(path,readOwner(path),{requireCurrent:true});
   const saved=stsStylePriorRuntime.files[path];
   assert.equal(hash(saved.source),sha,'exact reviewed runtime dependency: '+path);
   writeFileSync(join(directory,path),saved.source);
  }
  for(const [path,row]of Object.entries(sourceEpoch.proof.targets.releaseReviewed.files)){
   if(!row)continue;const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,row.source);
  }
  // The full official-assets view authenticates all releaseBuild input files.
  // Materialize exact committed predecessors, never today's release inputs.
  for(const path of ['package.json','package-lock.json','.release-please-manifest.json','CHANGELOG.md','data/release/publications.json']){
   const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});
   const original=integratedCiProof.files[path]?.views.release;
   assert(original,'complete frozen release build input: '+path);
   writeFileSync(target,original.source);
  }
  for(const path of ['art','node_modules']){
   mkdirSync(dirname(join(directory,path)),{recursive:true});symlinkSync(join(root,path),join(directory,path),process.platform==='win32'?'junction':'dir');
  }
  const target=join(directory,script);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,original.source);
  assert.equal(hash(readFileSync(target)),original.sha256,'unaltered complete historical assertions');
  if(script==='tests/sts-character-reference.test.mjs'){
   // The reviewed fixture counts virtual frames, so use a fixed clock for its
   // readiness scenario. The original assertions and frame limit still run.
   const vm=join(directory,'tests/helpers/portrait-runtime-vm.mjs');
   const source=norm(readFileSync(vm,'utf8'));
   assert.equal(hash(source),'f1b3d4c5168a77c95300ac09b327399563ddd03d1c24e118ecb4d00e3828988f','exact archived portrait VM');
   const hook='  if(before)run(before);';
   const clock="  if(code.includes(\"'hidden selection held battle readiness'\"))run('local elapsed=0;os.clock=function()elapsed=elapsed+.001;return elapsed end');";
   assert.equal(source.split(hook).length,2,'one archived portrait VM setup hook');
   writeFileSync(vm,source.replace(hook,hook+'\n'+clock));
  }
  if(useArchivedOfficialInputs){
   for(const path of reviewedOfficialAssetInputPaths){
    const expected=readReviewedOfficialAssetInput(path,readCurrent);
    assert.equal(norm(readFileSync(join(directory,path),'utf8')),norm(expected),'exact staged official-assets input: '+path);
   }
  }
  const env={...process.env};delete env.NODE_TEST_CONTEXT;
  const result=spawnSync(process.execPath,['--test','--test-reporter=tap',script],{cwd:directory,encoding:'utf8',timeout:remaining(),maxBuffer:4*1024*1024,windowsHide:true,env});
  assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,new RegExp('^# tests '+expected+'$','m'),'complete original selection contracts execute');
  assert.match(result.stdout,new RegExp('^# pass '+expected+'$','m'));assert.match(result.stdout,/^# fail 0$/m);assert.match(result.stdout,/^# skipped 0$/m);
  return result.stdout;
 }finally{
  const actual=realpathSync(directory),within=relative(resolve(tmpdir()),actual);
  assert(within&&!isAbsolute(within)&&!within.startsWith('..')&&within.startsWith('abyss-reviewed-selection-'));
  rmSync(actual,{recursive:true,force:true});
 }
}
