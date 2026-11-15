import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
const scenarios=[
 {name:'default choices',fixture:'tests/lua/choice_ui.lua',official:false},
 {name:'default session navigation',fixture:'tests/lua/session_menu_navigation.lua',official:false},
 {name:'official choices, pile and pause',fixture:'tests/lua/support/mobile_card_interactions.lua',official:true},
];
for(const {name,fixture,official}of scenarios)test(`${name} preserve native commands`,t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const dir=mkdtempSync(join(root,'card-interactions-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,official?{officialAssets:true}:{});
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const body=`local generated=${luaString(dir.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
dofile(${luaString(fixture)});print('MOBILE_CARD_INTERACTIONS_PASS')`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{
  cwd:process.cwd(),encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''},windowsHide:true});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/MOBILE_CARD_INTERACTIONS_PASS/);
});
