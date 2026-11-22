import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);

for(const official of [false,true])test(`${official?'official':'default'} Host preserves the source shield and shows its pending buff`,t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const dir=mkdtempSync(join(root,'composite-intent-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,official?{officialAssets:true}:{});
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const code=`local generated=${luaString(dir.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
dofile('tests/lua/support/mobile_composite_intent.lua')`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',code],{
  cwd:process.cwd(),encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''},windowsHide:true,
 });
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/MOBILE_COMPOSITE_INTENT_PASS/);
});

test('generated official Host preserves pending compound intent after read-only Map return',t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const directory=mkdtempSync(join(root,'composite-intent-map-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 buildLuaData('data',join(directory,'abyss_data.lua'));
 buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
 const preloads=readdirSync(directory).filter(n=>n.endsWith('.lua')).map(n=>
  `package.preload[${luaString(n.slice(0,-4))}]=assert(loadfile(${luaString(join(directory,n).replaceAll('\\','/'))}))`).join('\n');
 const source=`package.path='./src/lua/?.lua;./build/lua/?.lua'\n${preloads}
local GameUI=require('abyss_game_ui');local create=GameUI.new;local F
GameUI.new=function(root,data,presentation,event,platform)
 for _,name in ipairs({'nodePanel','choicePanel'})do
  local page=root:GetChild(name);local prior=getmetatable(page);local active=true
  setmetatable(page,{__index=function(c,key)if key=='active'then return active end;return prior.__index(c,key)end,
   __newindex=function(c,key,value)assert(key~='active','active is readonly');return prior.__newindex(c,key,value)end})
  page.SetActive=function(c,value)active=value;F.setEngineActive(c,value)end
 end
 platform.nativePageLifecycle=true
 return create(root,data,presentation,event,platform)
end
F=dofile('tests/lua/support/game_ui_fixture.lua')
dofile('tests/lua/support/composite_intent_map.lua')`;
 const result=spawnSync(process.execPath,[createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js'),'-e',source],{
  encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/GAMEUI_MAP_INTENT_PASS 1/);
});
