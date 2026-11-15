import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

test('node modal suspension retains pending and warm page work while retiring node input',()=>{
 const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
 const source=`
 local Pages=(function() ${readFileSync('src/lua/abyss_component_pages.lua','utf8')} end)()
 local cleared,created,destroyed=0,0,0
 local pending={owner=function()return false end}
 local function require(name)
  if name=='abyss_relic_pending'then return pending end
  if name=='abyss_numbers'then return {integer=tostring}end
  if name=='abyss_card_display'then return {clearNativeArt=function()cleared=cleared+1 end}end
  return {}
 end
 local Lifecycle=(function() ${readFileSync('src/lua/abyss_node_ui_lifecycle.lua','utf8')} end)()
 local View=(function() ${readFileSync('src/lua/abyss_game_ui_view.lua','utf8')} end)()
 local pages=Pages.new(1,2)
 local native={SetVisible=function(self,v)self.visible=v end}
 local page=pages:add('nodePanel',native,function(r)destroyed=destroyed+1;r.alive=false end,function()end)
 for i=1,3 do page.jobs[i]=function()created=created+1;page.resources[#page.resources+1]={alive=true}end end
 local root={SetVisible=function(_,v)return pages:request(page,v)end}
 local node={run={},visible=false}
 local ctx={self=node,root=root,artFaces={{}},options={},resetButtons=function()end,
  shopSelection={clear=function()end},roomMotion={cancel=function()end},updateMatch=function()end}
 Lifecycle.install(ctx)
 local noop={SetVisible=function()end}
 local owner={mode='node',nodeUI=node,battleUI={setActive=function()end},mapUI={setVisible=function()end}}
 local refresh=View.refreshPageVisibility(noop,owner,function()end,function(name)return name=='nodePanel' and root or noop end,function()end,false)
 refresh(node.run,false,false,false,false);pages:step()
 assert(created==1 and page.state=='preparing')
 -- Open a deck before the underlying page finishes. Its current work must
 -- continue under the same one-job budget; the covered controller is inert.
 refresh(node.run,false,true,false,false)
 assert(not node.visible,'modal must suspend the controller')
 local allowed,reason=ctx.current()
 assert(not allowed and reason=='panel_hidden','covered node must reject its real command gate')
 assert(destroyed==0,'modal suspension destroyed in-flight page resources')
 assert(page.cursor==2,'modal suspension reset the preparation cursor')
 pages:step();pages:step()
 assert(page.state=='visible' and created==3 and destroyed==0)
 local priorCleared=cleared
 for i=1,8 do refresh(node.run,false,true,false,false);pages:step()end
 assert(created==3 and destroyed==0,'stable modal refresh remounted the base page')
 assert(cleared==priorCleared,'stable modal refresh discarded card art')
 refresh(node.run,false,false,false,false)
 assert(node.visible and page.state=='visible' and not pages:preparing(),'closing modal must immediately reuse ready page')
 owner.mode='battle';refresh(node.run,false,false,false,false)
 assert(not node.visible and page.state=='cached','leaving node must hide and cache it normally')
 assert(cleared>priorCleared,'real page departure must release card art')
 `;
 try{const status=lauxlib.luaL_dostring(L,to_luastring(source));assert.equal(status,lua.LUA_OK,status===lua.LUA_OK?'':to_jsstring(lua.lua_tostring(L,-1)));}
 finally{lua.lua_close(L);}
});
