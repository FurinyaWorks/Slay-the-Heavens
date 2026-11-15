import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
for(const row of [1,2])test(`reward relic pool retirement preserves fallback, replacements and foreign owners in row ${row} and all states`,()=>{
 const dir=mkdtempSync(join(tmpdir(),'abyss-reward-retirement-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true});
  const luaPath=dir.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;';
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',"dofile('tests/helpers/reward-pool-retirement-runtime.lua')"],{
   encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024,windowsHide:true,
   env:{...process.env,REWARD_POOL_ROW:String(row),LUA_PATH:luaPath,LUA_PATH_5_3:luaPath,LUA_INIT:'',LUA_INIT_5_3:''},
  });
  assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
  assert.match(result.stdout,new RegExp(`REWARD_POOL_RETIREMENT_CASES row${row} 36 0`));
  assert.match(result.stdout,new RegExp(`REWARD_POOL_RETIREMENT_PASS row${row} 36 FULL_RUN_RNG_UNCHANGED`));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
