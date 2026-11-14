// Same installed tool methods and normal candidate gates, in-process for offline build.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL}from 'node:url';
import {buildNativeCandidate}from '../../scripts/build-native-candidate.mjs';import {loadNativeUiEncoder}from '../../scripts/native-ui-encoder.mjs';import {writeScriptBatch}from '../../scripts/native-script-batch.mjs';import {embeddedScripts}from '../../scripts/native-script-inventory.mjs';import {runNativeClientCheck}from '../../scripts/native-client-check.mjs';
const tool=process.env.MILIASTRA_MCP_ROOT??'D:/MiliastraTools/genshin-miliastra-mcp',url=p=>pathToFileURL(tool+p);
const {Service}=await import(url('/src/core.mjs')),{toolRegistry,invokeTool}=await import(url('/src/tool-registry.mjs'));
const {native,identity}=await loadNativeUiEncoder(tool),wire=await import(url('/src/scene/wire.mjs')),{luaSyntaxError}=await import(url('/src/client-check.mjs'));
const [baseMap,output]=process.argv.slice(2);
const receipt=await buildNativeCandidate({baseMap,output,v25BattleChrome:true,nativePageLifecycle:true,artFeatures:{cards:false,menuBackground:false,selectionAvatar:false,battlePortrait:false,monsters:false},toolchainIdentity:identity,
 writeScripts:async(mapPath,updates,workspace)=>writeScriptBatch(mapPath,updates,workspace,{...wire,clientScriptRecord:native.clientScriptRecord,luaSyntaxError}),
 createClient:async workspace=>{const service=new Service({workspace,allowLive:false}),defs=new Map(toolRegistry(service).map(d=>[d.name,d]));return {
  readResource:async({uri})=>JSON.parse(fs.readFileSync('.artifacts/lumine-discovery/'+uri.split('//')[1]+'.json')),
  callTool:async({name,arguments:a})=>{
   if(!['scene_add_client_template','scene_add_client_ui','scene_check_client','scene_list_client_scripts','scene_set_player_count','inspect_map','scene_list_signals','scene_add_signal','scene_add_graph','write_graphs'].includes(name))throw Error('Unexpected offline tool '+name);
   if(name==='scene_check_client')return {structuredContent:runNativeClientCheck(a,tool)};
   if(name==='scene_list_client_scripts')return {structuredContent:embeddedScripts(a,wire)};
   if(name==='scene_add_client_ui')return {structuredContent:native.addClientUi(a,workspace)};
   if(name==='scene_add_client_template'){const {template,...args}=a;return {structuredContent:native.addClientTemplate({...args,...template},workspace)}}
   return invokeTool(defs.get(name),a);
  },close:async()=>{}};}});
console.log(receipt.receiptPath);
