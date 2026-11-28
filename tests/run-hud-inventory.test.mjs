import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readdirSync,rmSync,writeFileSync,readFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
let dir;
test.before(()=>{dir=mkdtempSync(join(tmpdir(),'run-hud-'));buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true,refinedReleaseMonsterArt:true});});
test.after(()=>rmSync(dir,{recursive:true,force:true}));
for(const mode of ['numbers-pc','numbers-phone','relics','pages','potions','geometry','lifecycle','mobile','events','mutations','special-potions','route','route-menu','opening-layout','topbar-layout','relic-layout','reward-picker-layout','reward-list-layout','treasure-layout'])test('PD Run HUD '+mode+' through official generated Lua Host',()=>{
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const suite=mode.startsWith('numbers-')?'run_hud_numbers':mode.endsWith('-layout')?'release_run_layout':mode==='mobile'||mode==='events'?'mobile_run_hud_geometry':'run_hud_inventory';
 const prelude=`package.path=${luaString(dir+'/?.lua;src/lua/?.lua')}\nfor _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(dir+'/')}..n..'.lua'))end\nlocal Game=require('abyss_game_ui');local create=Game.new;local F\nGame.new=function(root,data,presentation,event,platform)\n platform.nativePageLifecycle=true;platform.campaign=${mode==='lifecycle'};if platform.campaign then platform.campaignProfile='full-source';platform.readNeowHistory=function()return {bossCount=0}end end\n for _,n in ipairs({'nodePanel','choicePanel'})do local p=root:GetChild(n);local prior=getmetatable(p);local active=true;setmetatable(p,{__index=function(c,k)if k=='active'then return active end;return prior.__index(c,k)end,__newindex=function(c,k,v)assert(k~='active');return prior.__newindex(c,k,v)end});p.SetActive=function(c,v)active=v;F.setEngineActive(c,v)end end\n return create(root,data,presentation,event,platform)end\nF=dofile('tests/lua/support/game_ui_fixture.lua')\nassert(loadfile(${luaString('tests/lua/support/'+suite+'.lua')}))(${luaString(mode)})`;
 const executable=process.env.ABYSS_HUD_LUA;
 const result=spawnSync(executable||process.execPath,executable?['-e',prelude]:[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',prelude],{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 mkdirSync('.artifacts/hud-evidence',{recursive:true});writeFileSync('.artifacts/hud-evidence/case-'+mode+'.log',result.stdout+result.stderr);
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));assert.match(result.stdout,/RUN_HUD_PASS|HUD_GEOMETRY|MOBILE_EVENT_INVENTORY_PASS/);
});
test('generated run chrome paints after all room content',()=>{
 const j=JSON.parse(readFileSync(join(dir,'game-ui.json')));const stage=j.controls.find(c=>c.name==='stage'),p=stage.children.find(c=>c.name==='nodePanel');
 const at=n=>p.children.findIndex(c=>c.name===n);
 for(const content of ['eventView','pickerView','campView','treasureView','shopView','roomEffect'])for(const hud of ['officialRunBar','hpIcon','hp','goldIcon','gold','title'])assert(at(hud)>at(content),hud+' may be occluded by '+content);
});

test('generated map bar precedes resource values and floor groups',()=>{
 const j=JSON.parse(readFileSync(join(dir,'game-ui.json'))),stage=j.controls.find(c=>c.name==='stage'),p=stage.children.find(c=>c.name==='mapPanel');
 const bar=p.children.findIndex(c=>c.name==='officialRunBar');
 for(const [index,part]of p.children.entries())if(part.name==='resources'||/^mapGroup/.test(part.name))assert(bar<index,'map bar covers '+part.name);
});

test('generated reward banners use opaque STS1 title ink with readable native outlines',()=>{
 const data=JSON.parse(readFileSync(join(dir,'game-ui.json')));
 const stage=data.controls.find(c=>c.name==='stage');
 const child=(node,name)=>node.children.find(part=>part.name===name);
 const battle=child(stage,'battlePanel'),node=child(stage,'nodePanel');
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 const luminance=channels=>channels.reduce((sum,value,i)=>{
  const srgb=value/255;
  return sum+[0.2126,0.7152,0.0722][i]*(srgb<=.04045?srgb/12.92:((srgb+.055)/1.055)**2.4);
 },0);
 const contrast=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
 for(const [parent,name,heading] of [[battle,'rewardStage','title'],[battle,'rewardList','title'],[node,'treasureView','page']]){
  const screen=child(parent,name);
  const paper=child(child(screen,'v25RewardPaper'),'paperCore');
  const text=child(screen,heading).text;
  assert.equal(text.colour,'#E6E6E6',name+' title fill');
  assert.equal(text.opacity??1,1,name+' title opacity');
  assert.notEqual(text.outline,false,name+' native title outline disabled');
  const background=rgb(paper.colour);
  const alpha=text.outlineOpacity??.2;
  const edge=rgb(text.outlineColour??'#333333').map((value,i)=>value*alpha+background[i]*(1-alpha));
  for(const [surface,colour] of [['fill',rgb(text.colour)],['paper',background]]){
   const ratio=contrast(luminance(colour),luminance(edge));
   assert(ratio>=4.5,name+' '+surface+' against its composited outline: '+ratio.toFixed(2)+':1');
  }
 }
});
