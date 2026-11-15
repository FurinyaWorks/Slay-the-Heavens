import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,cpSync,symlinkSync,realpathSync,readdirSync} from 'node:fs';
import {join,dirname,resolve,relative,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {sourceEpoch,preMobileUiSourceEpoch} from './closeout-source-epoch.mjs';
import {integratedCiProof,assertIntegratedCurrent,originalMobileUiCiArchive,renderIntegratedCiBinding} from './integrated-ci-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const scripts=new Set(['tests/official-choice-pagination.test.mjs','tests/official-assets.test.mjs',
 'tests/official-assets-legibility.test.mjs','tests/game-ui.test.mjs']);
export function replayMobileUiPrior(input){
 const requested=typeof input==='string'?[input]:input;
 assert(Array.isArray(requested)&&requested.length>0&&new Set(requested).size===requested.length);
 requested.forEach(script=>assert(scripts.has(script),'exact complete prior contract'));
 const authenticate=()=>{
  assertIntegratedCurrent();
  for(const [path,row]of Object.entries(sourceEpoch.proof.current))assert.equal(hash(norm(readFileSync(path,'utf8'))),row.sha256,'fresh full mobile product owner: '+path);
 };
 authenticate();
 assert.deepEqual(sourceEpoch.proof.targets.mobileUiPrior.files,preMobileUiSourceEpoch.proof.current,'mandatory complete 352-owner predecessor');
 const directory=mkdtempSync(join(tmpdir(),'abyss-mobile-prior-'));
 try{
  // Copy only local current files, then materialize all immutable predecessor
  // views. Neither materialization nor test execution fetches historical Git.
  for(const path of ['scripts','data','config','tools','tests','src/lua','.github'])
   cpSync(path,join(directory,path),{recursive:true});
  for(const path of ['package.json','package-lock.json','.release-please-manifest.json','CHANGELOG.md','docs/legal/assets.json']){
   const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,readFileSync(path));
  }
  for(const [path,row]of Object.entries(integratedCiProof.files))if(row.views.mobileUiPrior){
   const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,row.views.mobileUiPrior.source);
  }
  for(const [path,row]of Object.entries(sourceEpoch.proof.targets.mobileUiPrior.files))if(row){
   const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,row.source);
  }
  const prior=integratedCiProof.priorArchive;
  assert.equal(prior.binding.source,renderIntegratedCiBinding(prior.sha256),'complete original trust leaf');
  writeFileSync(join(directory,'tests/helpers/integrated-ci-source.json.gz'),originalMobileUiCiArchive());
  writeFileSync(join(directory,'tests/helpers/integrated-ci-binding.mjs'),prior.binding.source);
  for(const [kind,folder,suffix]of [['js','tests','.test.mjs'],['lua','tests/lua','.lua']]){
   const inventory=kind==='js'?prior.body.inventory:prior.body.luaInventory;
   for(const name of readdirSync(join(directory,folder)))if(name.endsWith(suffix)&&!inventory.includes(folder+'/'+name))rmSync(join(directory,folder,name));
  }
  for(const path of ['art','experiments','node_modules'])symlinkSync(resolve(path),join(directory,path),process.platform==='win32'?'junction':'dir');
  // The original nested release replayer enumerates local tracked paths. Give
  // this isolated source tree its own real index, without any commit, remote
  // or old Git object; its source authority remains the fixed archive above.
  execFileSync('git',['init','--quiet'],{cwd:directory,windowsHide:true});
  for(const [path,row]of Object.entries(prior.indexFiles)){
   const bytes=readFileSync(join(directory,path));
   assert.equal(hash(row.normalization==='raw'?bytes:norm(bytes.toString())),row.sha256,'exact frozen local index bytes: '+path);
  }
  const indexPaths=Object.keys(prior.indexFiles);
  execFileSync('git',['-c','core.autocrlf=false','add','--intent-to-add','--pathspec-from-file=-','--pathspec-file-nul'],
   {cwd:directory,windowsHide:true,stdio:'pipe',input:indexPaths.join('\0')+'\0'});
  const tracked=execFileSync('git',['ls-files','-z'],{cwd:directory}).toString().split('\0').filter(Boolean);
  assert.deepEqual(tracked,indexPaths,'isolated index contains exactly the frozen physical paths');
  assert(!tracked.some(p=>p.startsWith('node_modules/')));
  const outputs={};
  for(const script of requested){
   authenticate(); // Fresh authorization per child, never a cached result.
   for(const [path,row]of Object.entries(prior.indexFiles)){
    const raw=readFileSync(join(directory,path));
    assert.equal(hash(row.normalization==='raw'?raw:norm(raw.toString())),row.sha256,'unchanged frozen snapshot per child: '+path);
   }
   const original=integratedCiProof.files[script].views.mobileUiPrior;assert(original,'complete original P0 contract');
   assert.equal(hash(readFileSync(join(directory,script))),original.sha256,'unaltered whole original test');
   const expected=[...original.source.matchAll(/^test\(/gm)].length;assert(expected>0);
   if(script==='tests/game-ui.test.mjs'){
    const prepared=spawnSync(process.execPath,['scripts/build-lua-data.mjs'],{cwd:directory,encoding:'utf8',timeout:30000,windowsHide:true});
    assert.ifError(prepared.error);assert.equal(prepared.status,0,prepared.stdout+prepared.stderr);
   }
   const cli=['--test','--test-reporter=tap',script],env={...process.env};delete env.NODE_TEST_CONTEXT;
   const result=spawnSync(process.execPath,cli,{cwd:directory,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024,windowsHide:true,env});
   assert.ifError(result.error);assert.equal(result.status,0,result.stdout+result.stderr);
   assert.match(result.stdout,new RegExp('^# tests '+expected+'$','m'),'all original JS cases execute');
   assert.match(result.stdout,new RegExp('^# pass '+expected+'$','m'));assert.match(result.stdout,/^# fail 0$/m);assert.match(result.stdout,/^# skipped 0$/m);
   outputs[script]=result.stdout;
  }
  return outputs;
 }finally{
  const actual=realpathSync(directory),within=relative(resolve(tmpdir()),actual);
  assert(within&&!isAbsolute(within)&&!within.startsWith('..')&&within.startsWith('abyss-mobile-prior-'));
  rmSync(actual,{recursive:true,force:true});
 }
}
