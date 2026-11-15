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
for(const [official,touch,height]of[[true,true,393],[true,true,360],[true,false,393],[false,true,393]])test(`event native reading official=${official} touch=${touch} h=${height}`,t=>{
 const dir=mkdtempSync(join(tmpdir(),'event-reading-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets:official});
  const luaPath=dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;;';
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',`EVENT_TOUCH=${touch};EVENT_HEIGHT=${height};dofile('tests/lua/mobile_event_reading.lua')`],{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024,env:{...process.env,LUA_PATH:luaPath,LUA_PATH_5_3:luaPath,LUA_INIT:'',LUA_INIT_5_3:''}});
  assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/MOBILE_EVENT_READING_PASS/);t.diagnostic(result.stdout.trim());
 }finally{rmSync(dir,{recursive:true,force:true});}
});
