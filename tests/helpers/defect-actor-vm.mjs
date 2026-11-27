import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {installLuaGraphObserver} from './lua-graph-observer.mjs';
import {luaString} from '../../scripts/build-lua-data.mjs';
import {beforeCurrentProductionSource} from './character-preparation-source.mjs';
import {beforePreflightSource} from './fork-preflight-source.mjs';
import {beforeInputRetirementReader,retiredControllerPath} from './input-retirement-source.mjs';
import {reviewedRenamedStsStyleRead,reviewedStsStyleRead} from './reviewed-selection-current-source.mjs';

const preStyleRawOwners=new Set(['config/architecture.json',...[
 'actor','battle_enemy_view','card_display','character_select_view','choice_ui','game_ui_lifecycle','game_ui_navigation',
 'game_ui_overlays','game_ui_run','node_ui','node_ui_faces','node_ui_feedback','node_ui_input','node_ui_lifecycle',
 'node_ui_shop','page_reveal','shop_ui','traveler_portraits','ui',
].map(name=>'src/lua/abyss_'+name+'.lua')]);
const guideInputs=new Set(['game_ui','game_ui_input','game_ui_view'].map(name=>'src/lua/abyss_'+name+'.lua'));
const guideOwners=new Set(['game_ui_navigation','game_ui_navigation_view','game_ui_overlays'].map(name=>'src/lua/abyss_'+name+'.lua'));
const reviewedReaders=new Set(['battle_intent_view','character_profiles'].map(name=>'src/lua/abyss_'+name+'.lua'));
// Retain the pre-style bytes via the owning Release receipts. The entrance and
// Guide checks still get the precise raw or restored view each one authenticates.
export function actorFocusPreStyleReader(readLive){
 const readRenamed=reviewedRenamedStsStyleRead(readLive);
 const readReviewed=reviewedStsStyleRead(readLive);
 const readRetired=beforeInputRetirementReader(readReviewed);
 return (path,expected)=>{
  const reviewed=path===retiredControllerPath?readRetired(path):readReviewed(path);
  if(reviewed===expected)return reviewed;
  if(path==='src/lua/abyss_game_ui_navigation_view.lua'){
   return beforePreflightSource(path,readLive(path),'prior',readLive).replaceAll('\r\n','\n');
  }
  if(guideInputs.has(path)){
   const readGuide=owner=>guideOwners.has(owner)?readReviewed(owner):readRenamed(owner);
   return beforeCurrentProductionSource(path,readLive(path),readGuide).replaceAll('\r\n','\n');
  }
  if(preStyleRawOwners.has(path))return beforeCurrentProductionSource(path,readLive(path),readRenamed).replaceAll('\r\n','\n');
  const readOwner=reviewedReaders.has(path)?readReviewed:owner=>owner===path?readReviewed(owner):readRenamed(owner);
  return beforeCurrentProductionSource(path,reviewed,readOwner).replaceAll('\r\n','\n');
 };
}

const require=createRequire(import.meta.url);
const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
export function baseline(){return JSON.parse(gunzipSync(readFileSync('tests/fixtures/defect-actor-before.json.gz')));}
// Only the two complete owners are substituted in the before VM. The original
// fixture is executed verbatim, not projected through the new host interface.
export function defectVm({before=false,fixture,body='',replace={}}={}){
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
 const graphs=[],output=[];let instructions=0;
 lua.lua_sethook(L,()=>{instructions+=10000;if(instructions>150000000)lauxlib.luaL_error(L,to_luastring('Defect fixture instruction limit'));},lua.LUA_MASKCOUNT,10000);
 installLuaGraphObserver(L,'DEFECT_GRAPH',(label,graph)=>graphs.push({label,bytes:Buffer.byteLength(graph),sha256:createHash('sha256').update(graph).digest('hex')}));
 lua.lua_pushcfunction(L,L=>{const words=[],count=lua.lua_gettop(L);for(let i=1;i<=count;i++)words.push(to_jsstring(lauxlib.luaL_tolstring(L,i)));output.push(words.join('\t'));return 0;});
 lua.lua_setglobal(L,to_luastring('print'));
 const original=before?baseline().sources:{};
 const owners=['src/lua/abyss_defect_utility_cards.lua','src/lua/abyss_combat_queued_play.lua'];
 const sources={...Object.fromEntries(owners.filter(p=>Object.hasOwn(original,p)).map(p=>[p,original[p]])),...replace};
 let script="package.path='src/lua/?.lua;build/lua/?.lua;'..package.path\n";
 for(const [file,source]of Object.entries(sources)){
  if(!owners.includes(file))throw Error(`Unreviewed Defect VM override: ${file}`);
  const module=file.split('/').at(-1).slice(0,-4);
  script+=`package.preload[${luaString(module)}]=assert(load(${luaString(source)},${luaString('@'+file)}))\n`;
 }
 if(fixture){
  if(fixture!=='tests/lua/defect_utility_build.lua')throw Error('Unreviewed Defect fixture');
  script+=`
 local Combat=require('abyss_combat')
 for _,name in ipairs({'new','play','endTurn','autoplayTop'})do
  local original=Combat[name]
  Combat[name]=function(...)
   local args=table.pack(...)
   local returned=table.pack(pcall(original,...))
   local owner=name=='new' and returned[2] or args[1]
   if type(owner)=='table'then DEFECT_GRAPH_WRITE({owner=owner,returned=returned},name,true)end
   if not returned[1]then error(returned[2],0)end
   return table.unpack(returned,2,returned.n)
  end
 end
 assert(load(${luaString(before?original[fixture]:readFileSync(fixture,'utf8'))},${luaString('@'+fixture)}))()
 `;
 }
 script+=body;
 try{
  const status=lauxlib.luaL_dostring(L,to_luastring(script));
  const error=status===lua.LUA_OK?null:(lua.lua_isstring(L,-1)?to_jsstring(lua.lua_tostring(L,-1)):'non-string Lua error');
  return {status,error,graphs,output,instructions};
 }finally{lua.lua_close(L);}
}
