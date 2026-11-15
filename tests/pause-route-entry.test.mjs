import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
for(const officialAssets of [false,true])test(`${officialAssets?'official':'default'} route entry retains one usable path without a duplicate pause action`,()=>{
 mkdirSync('build',{recursive:true});const dir=mkdtempSync(join(process.cwd(),'build','pause-route-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets});
  const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
  const code=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}..package.path
for _,n in ipairs({${modules.map(luaString).join(',')}})do require(n)end
local F=dofile('tests/lua/support/game_ui_fixture.lua')
for _,touch in ipairs({false,true})do for _,mode in ipairs({'battle','node'})do
 local ui,root=F.fixture(nil,nil,nil,nil,false,nil,{touchScreen=function()return touch end})
 assert(F.start(ui))
 if mode=='battle'then assert(ui.mapUI:choose(F.Nodes.available(ui.run,ui.map)[1].id))
 else
  local routes=dofile('tests/lua/support/map_routes.lua');local Map=require('abyss_map')
  local path=assert(routes.to(ui.map,function(n)return n.type=='camp'end))
  for i=1,#path-1 do assert(Map.choose(ui.map,path[i]))end
  ui.run.floor=ui.map.floor;assert(ui.mapUI:choose(routes.at(ui.map,path[#path]).id))
 end
 assert(ui.mode==mode)
 local run,mapState,battle,flow=ui.run,ui.map,ui.run.combat,ui.run.nodeFlow
 local menu=root:GetChild('runMenu');local map=menu:GetChild('map');local hit=map:GetChild('hit')
 assert(ui:openMenu())
 if ${officialAssets} then
  assert(not map.visible and not hit.interactable and not hit.raycastTarget,'duplicate map action is active')
  assert(not hit.click,'duplicate pause action retains a native listener')
  if ui.controller then for _,r in ipairs(ui.controller.records)do assert(r.control~=hit,'duplicate controller route')end end
  assert(menu:GetChild('resume'):GetChild('hit').click());assert(not ui.exitOpen)
  local shortcut=mode=='battle' and root:GetChild('battlePanel'):GetChild('topBar'):GetChild('battleRoute')
   or root:GetChild('nodePanel'):GetChild('runRoute')
  local target=shortcut:GetChild('hit')or shortcut
  assert(target.click() and ui.routeOpen,'shared top bar route no longer works')
 else
  assert(map.visible and hit.interactable and hit.raycastTarget,'default profile lost its only route action')
  assert(hit.click() and ui.routeOpen)
 end
 local back=root:GetChild('mapPanel'):GetChild('previewBack');assert((back:GetChild('hit')or back).click())
 assert(not ui.routeOpen and not ui.exitOpen and not ui.menuOpen and ui.mode==mode,'route does not return directly to its caller')
 assert(ui.run==run and ui.map==mapState and ui.run.combat==battle and ui.run.nodeFlow==flow,'route replaced the current session')
 ui:disable()
end end
print('PAUSE_ROUTE_ENTRY_PASS 4')`;
  const script=join(dir,'route.lua');writeFileSync(script,code);
  const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),script],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024,windowsHide:true});
  assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/PAUSE_ROUTE_ENTRY_PASS 4/,r.stdout+r.stderr);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
