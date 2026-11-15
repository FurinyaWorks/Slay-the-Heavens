import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {exitControls} from '../scripts/exit-ui-layout.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
test('pause and exit contain no operation guide text, controls, focus target or modal blocker',()=>{
 const visit=(n)=>{
  assert(!['help','guide'].includes(n.name),'obsolete operation guide control: '+n.name);
  assert(!n.text?.content?.includes('操作说明'),'obsolete operation guide label');
  for(const c of n.children??[])visit(c);
 };
 for(const root of exitControls())visit(root);
});
for(const officialAssets of [false,true])test(`${officialAssets?'official':'default'} current menu resumes, cancels and settles without guide dependencies on PC and touch`,()=>{
 const dir=mkdtempSync(join(tmpdir(),'menu-closeout-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets});
  const path=dir.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;';
  const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',"dofile('tests/lua/exit_menu_closeout.lua')"],{
   encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,
   env:{...process.env,LUA_PATH:path,LUA_PATH_5_3:path,LUA_INIT:'',LUA_INIT_5_3:''}
  });
  assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/EXIT_MENU_CLOSEOUT_PASS 2/);
 }finally{const absolute=join(tmpdir(),'');assert(dir.startsWith(absolute));rmSync(dir,{recursive:true,force:true});}
});
