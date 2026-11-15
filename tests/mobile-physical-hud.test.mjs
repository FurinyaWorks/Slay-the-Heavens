import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
for(const [profile,touch] of [['official',true],['official',false],['official',null],['default',true]])test(`${profile} ${touch===null?'missing platform':touch?'touch':'PC'} physical HUD uses real generated controls`,t=>{
 const dir=mkdtempSync(join(tmpdir(),'mobile-hud-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets:profile==='official'});
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',`MOBILE_HUD_TEST=${touch===null?'nil':touch};dofile('tests/lua/mobile_physical_hud.lua')`],{
   encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,
   env:{...process.env,LUA_PATH:dir.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;',LUA_PATH_5_3:dir.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;',LUA_INIT:'',LUA_INIT_5_3:''}
  });
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/MOBILE_PHYSICAL_HUD_PASS/);
  if(profile==='official'&&touch)t.diagnostic(result.stdout.trim());
 }finally{rmSync(dir,{recursive:true,force:true});}
});
