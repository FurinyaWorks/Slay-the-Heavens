import {buildUI} from '../../scripts/build-ui.mjs';
import {buildLuaData,luaString} from '../../scripts/build-lua-data.mjs';
import {mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../../scripts/test-lua.mjs';
import {nodeLayout} from '../../scripts/node-ui-layout.mjs';
import {nativeTheme} from '../../scripts/native-ui-theme.mjs';

test('only the precise shop dismissal background is a nonfocusable bottom input layer',()=>{
  const panel=nodeLayout().controls[0];
  const index=panel.children.findIndex(c=>c.name==='shopDismiss');
  const dismiss=panel.children[index];
  assert.equal(dismiss.kind,'cursorArea');
  assert.equal(dismiss.focusable,false);
  assert.deepEqual(dismiss.position,[0,0]);
  assert.deepEqual(dismiss.size,nativeTheme.canvas.base);
  for(const name of ['backdrop','shopRoom']) {
    assert.ok(panel.children.findIndex(c=>c.name===name)<index,name);
  }
  for(const name of ['shopView','merchant','back','confirm']) {
    assert.ok(panel.children.findIndex(c=>c.name===name)>index,name);
  }
});

test('shop outside dismissal preserves current selection and purchase ownership',()=>{
  const result=runLua('tests/lua/support/shop_dismiss.lua');
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.match(result.stdout,/SHOP_DISMISS_PASS 12/);
});

test('official shop return rejects stale dismissal, then dismisses only the current item',t=>{
 const directory=mkdtempSync(join(tmpdir(),'shop-dismiss-map-'));
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
dofile('tests/lua/support/shop_dismiss_map.lua')`;
 const result=spawnSync(process.execPath,[createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js'),'-e',source],{
  encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/POST697_GAMEUI_MAP_SHOP_PASS 1/);
});
