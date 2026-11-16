import test from 'node:test';
import assert from 'node:assert/strict';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString} from '../scripts/build-lua-data.mjs';
import {mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
const parts=n=>n?.children??n?.controls??[];
const child=(n,name)=>parts(n).find(c=>c.name===name);
const all=n=>[n,...parts(n).flatMap(all)];
test('official map return reuses final character cancel material in every state, retaining its input and caption',()=>{
 const theme=officialAssetsTheme(nativeTheme),tree=gameLayout(),back=child(child(tree,'mapPanel'),'previewBack');
 const hit=child(back,'hit'),label=child(back,'label'),caption='返回战斗';label.text.content=caption;
 applyOfficialAssets([tree],theme);
 assert.equal(child(child(tree,'mapPanel'),'previewBack'),back);assert.equal(child(back,'hit'),hit);assert.equal(child(back,'label'),label);
 assert.deepEqual(all(back).filter(n=>['cursorArea','presetButton'].includes(n.kind)),[hit]);
 const source=child(child(tree,'characterPanel'),'cancel');
 const face=child(back,'v25Face');assert(face,'PC08: map return has no shared four-state face');
 assert.deepEqual(back.size,source.size);assert.deepEqual(hit.size,source.size);
 for(const name of ['normal','hover','pressed','disabled']){
  const reference=child(child(source,'hit'),name),state=child(face,name);
  assert.deepEqual(child(state,'v25Flag'),child(reference,'v25Flag'),name);
  assert.equal(state.visible,name==='normal');
 }
 assert.equal(label.text.content,caption);assert.equal(label.text.fontSize,24);assert.equal(label.text.minFontSize,24);
 assert(Math.abs(label.position[0])+label.size[0]/2<=back.size[0]/2);
 assert(Math.abs(label.position[1])+label.size[1]/2<=back.size[1]/2);
 assert(label.size[0]>=4*label.text.fontSize,'four-character live return caption must fit without reducing the adopted font');
 assert.equal(child(back,'v25ReturnFlag').visible,false);
 const [w,h]=theme.canvas.base,{x:safeX,y:safeY}=theme.canvas.safe;
 assert(back.position[0]-back.size[0]/2>=-w/2+safeX);
 assert(back.position[0]+back.size[0]/2<=w/2-safeX);
 assert(back.position[1]-back.size[1]/2>=-h/2+safeY);
 assert.deepEqual(back.position.slice(1),[-235]);
});
test('generated official Host preserves pointer, controller and read-only return behavior',t=>{
 const directory=mkdtempSync(join(tmpdir(),'pc08-host-'));
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
dofile('tests/lua/support/official_map_return.lua')`;
 const result=spawnSync(process.execPath,[createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js'),'-e',source],{
  encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/OFFICIAL_MAP_RETURN_PASS/);
 console.log(result.stdout);
});
