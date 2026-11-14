import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
const entry=readFileSync(process.env.ABYSS_FAILURE_ENTRY??'src/lua/abyss_ui.lua','utf8');
function run(mode){
 const L=lauxlib.luaL_newstate();
 try{lualib.luaL_openlibs(L);const result=lauxlib.luaL_dostring(L,to_luastring(`
local nodes,callbacks={},{}
local node
node=function(name)
 if not nodes[name] then nodes[name]={visible=true,GetChild=function(_,key)return node(name..'/'..key)end,
 SetVisible=function(self,v)self.visible=v end,SetAsLastSibling=function()end,
 AddCursorEventListener=function(_,_,f)callbacks[#callbacks+1]=f end}end
 return nodes[name]
end
local updates,sent,broken=false,0,false
local fakeView={resize=function()end,update=function()error('injected update failure')end,
 disable=function()end,onEngineDestroy=function()end}
local modules={abyss_game_ui={new=function()return fakeView end},abyss_data={},abyss_presentation={},abyss_theme={sound={}},
 abyss_viewport={apply=function()${mode==='startup'?"error('injected startup failure')":"return node('stage')"} end},
 abyss_art_features={schemaVersion=2,flags={cards=false,menuBackground=false,selectionAvatar=false,battlePortrait=false,monsters=false}},
 abyss_card_art_runtime={configure=function()end,setPresentationPage=function()end},
 abyss_card_skin={configure=function()end,clearSurface=function()end,destroySurface=function()end},
 abyss_narrative={build={}},abyss_ui_profile={schemaVersion=1,nativePageLifecycle=false},abyss_monster_actor_binding={},
 abyss_page_reveal={intent=function()return {page='battlePanel'}end}}
require=function(name)assert(modules[name],'missing '..name);return modules[name]end
game={GetUICanvasSize=function()return 1280,720 end,IsTestPlay=function()return false end,
 ServerSignal=function(name)assert(name=='ABYSS_LOSE');return {SendSignal=function()if broken then error('transport down')end;sent=sent+1 end}end}
Enum={CursorEventType={CursorClick='click'},ImageSource={},ControllerNavigationEventType={},ControllerNavigationDir={},ControllerNavigationMode={},TextHorizontalAlignment={},TextVerticalAlignment={}}
Color=function()end
script={object={GetChild=function()return node('stage')end},GetParam=function()return false end,EnableUpdate=function(_,v)updates=v end}
assert(load(${JSON.stringify(entry)}))();OnStart();${mode==='update'?'OnUpdate(0.1)':''}
assert(not updates,'faulted update loop must stop')
assert(#callbacks==1,'error screen must own an independent exit listener')
assert(nodes['stage/menuPanel'].visible and nodes['stage/menuPanel/titleQuit'].visible)
assert(not nodes['stage/menuPanel/start'].visible and not nodes['stage/menuPanel/continueRun'].visible)
assert(not nodes['stage/runMenu'].visible and not nodes['stage/relicBar'].visible and not nodes['stage/pageReveal'].visible)
assert(nodes['stage/menuPanel/summary'].text:find('${mode==='startup'?'关卡启动失败':'游戏运行异常'}',1,true))
broken=true;assert(callbacks[1]()==false and sent==0,'failed transport is not a successful exit')
broken=false;assert(callbacks[1]()==true and sent==1,'existing server exit signal must work without the view')
assert(callbacks[1]()==false and sent==1,'duplicate clicks cannot settle twice')
OnDestroy();assert(callbacks[1]()==false and sent==1,'destroy retires fallback input')
`));assert.equal(result,lua.LUA_OK,result===lua.LUA_OK?'':to_jsstring(lua.lua_tostring(L,-1)));}
 finally{lua.lua_close(L);}
}
for(const mode of ['startup','update'])test(`${mode} failure retains actionable native exit after retiring the controller`,()=>run(mode));
