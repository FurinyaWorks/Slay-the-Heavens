import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
const base='e65d9b98fbec69442047650254238cd9244df805';
test('late CI remains byte-reproducible after a real HEAD move with unchanged working files',()=>{
 const root=process.cwd(),tempRoot=resolve(tmpdir()),directory=mkdtempSync(join(tempRoot,'late-ci-head-move-'));
 assert.equal(dirname(resolve(directory)),tempRoot,'recursive cleanup remains within the explicit temporary root');
 const git=(args,cwd=directory)=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:16*1024*1024,windowsHide:true});
 const run=(script,mode)=>execFileSync(process.execPath,[script,mode],{cwd:directory,encoding:'utf8',windowsHide:true,stdio:['ignore','pipe','pipe']});
 try{
  git(['init','--initial-branch=probe']);
  const common=git(['rev-parse','--path-format=absolute','--git-common-dir'],root).trim();
  writeFileSync(join(directory,'.git/objects/info/alternates'),join(common,'objects').replaceAll('\\','/')+'\n');
  git(['update-ref','refs/heads/probe',base]);
  git(['read-tree',base]);
  const paths=['src/lua/abyss_ui.lua','src/lua/abyss_battle_details.lua','src/lua/abyss_battle_ui.lua',
   'tests/helpers/generate-late-ci-source.mjs','tests/helpers/closeout-source-closure.json',
   'tests/helpers/integrated-ci-source.json.gz','tests/helpers/sts-feedback-ci.json.gz',
   'tests/helpers/late-source-continuation.mjs','tests/helpers/late-source-epoch.mjs',
   'tests/helpers/fatal-bgm-stop-source-inverse.mjs','tests/helpers/battle-return-historical-source.mjs',
   'tests/helpers/combined-epoch/source-epoch-runtime.mjs','tests/helpers/closeout-source-epoch.mjs',
   'tests/fixtures/fatal-bgm-stop-before.lua','tests/fixtures/fatal-bgm-stop-after.lua','tests/fixtures/fatal-bgm-e65-source.json.gz',
   'tests/fixtures/battle-details-before.lua','tests/fixtures/battle-details-after.lua',
   'tests/fixtures/battle-pile-before.lua','tests/fixtures/battle-pile-after.lua','tests/late-ci-generator.test.mjs','tests/lua/fatal_bgm_stop.lua'];
  for(const path of paths){const target=join(directory,path);mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(root,path),target);}
  const workingBefore=new Map(paths.map(path=>[path,readFileSync(join(directory,path))]));
  const producer='tests/helpers/generate-late-ci-source.mjs';run(producer,'--write');
  const archive=readFileSync(join(directory,'tests/helpers/late-ci-source.json.gz'));
  const leaf=readFileSync(join(directory,'tests/helpers/late-ci-binding.mjs'));
  const proof=JSON.parse(gunzipSync(archive));
  for(const path of ['src/lua/abyss_ui.lua','src/lua/abyss_battle_details.lua','src/lua/abyss_battle_ui.lua'])
   assert.equal(proof.files[path].before.source,git(['show',base+':'+path]).replaceAll('\r\n','\n'),'exact original before retained: '+path);
  git(['-c','core.autocrlf=false','add','--','src','tests']);
  const tree=git(['write-tree']).trim();
  const moved=git(['-c','user.name=Late CI Probe','-c','user.email=late-ci-probe@example.invalid','commit-tree',tree,'-p',base,'-m','Temporary HEAD movement probe']).trim();
  git(['update-ref','refs/heads/probe',moved,base]);assert.notEqual(git(['rev-parse','HEAD']).trim(),base);
  run(producer,'--check');
  for(const [path,bytes]of workingBefore)assert.deepEqual(readFileSync(join(directory,path)),bytes,'HEAD move leaves working bytes intact: '+path);
  assert.deepEqual(readFileSync(join(directory,'tests/helpers/late-ci-source.json.gz')),archive);
  assert.deepEqual(readFileSync(join(directory,'tests/helpers/late-ci-binding.mjs')),leaf);
  const fixed=readFileSync(join(directory,producer),'utf8');
  const dynamic=fixed.replace(`const baseCommit='${base}';`,"const baseCommit=git(['rev-parse','HEAD']).trim();");
  assert.notEqual(dynamic,fixed,'negative control actually restores a dynamic HEAD predecessor');
  writeFileSync(join(directory,'dynamic-head-producer.mjs'),dynamic);
  assert.throws(()=>run('dynamic-head-producer.mjs','--check'),/reproducible exact late CI/,'the same HEAD move exposes the original dynamic-base defect');
 }finally{rmSync(directory,{recursive:true,force:true});}
});
