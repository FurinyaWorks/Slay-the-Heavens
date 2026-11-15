import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readdirSync,writeFileSync} from 'node:fs';import {join} from 'node:path';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';
import {buildUI} from '../scripts/build-ui.mjs';import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
for(const officialAssets of [false,true])test(`${officialAssets?'official':'default'} sleeping marker follows real sleep/wake and reused native actor state`,()=>{
 const dir=mkdtempSync(join(process.cwd(),'build','sleep-intent-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets});
  const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
  const body=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}..package.path
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..name..'.lua'))end
dofile('tests/lua/sleep_intent_label.lua')`;
  const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8',windowsHide:true,timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
  assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/SLEEP_INTENT_LABEL_PASS/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
