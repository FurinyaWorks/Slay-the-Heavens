import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
test('fade retains old page until opaque, waits for ready and blocks duplicate departures',()=>{
 const body=`package.path='src/lua/?.lua;'..package.path
local Gate=require('abyss_page_reveal')
local shown;local veil={};local cancel={SetVisible=function()end}
local cover={GetChild=function(_,n)if n=='veil'then return veil elseif n=='cancel'then return cancel end end,SetVisible=function(_,v)shown=v end,SetAsLastSibling=function()end}
local ready=true;local g=Gate.new(cover,function()return ready end,nil,nil,{duration=.2,color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end})
local a={page='menuPanel'};local b={page='characterPanel'}
g:begin(a);g:step(a,0);g:step(a,0);g:step(a,.2);assert(not g:covered())
assert(not g:begin(b),'new page rendered before fade out');assert(g:covered()and veil.imageColor.a==0)
assert(not g:step(b,.1));assert(veil.imageColor.a>0 and veil.imageColor.a<255)
assert(g:step(b,.1)and veil.imageColor.a==255,'opaque frame must request destination paint')
ready=false;g:begin(b);g:finish(b)
for i=1,10 do g:step(b,.1);assert(veil.imageColor.a==255 and g:covered())end
ready=true;g:step(b,0);g:step(b,0);assert(g:covered());g:step(b,.1);assert(veil.imageColor.a>0 and veil.imageColor.a<255);g:step(b,.1);assert(not g:covered())
local calls=0;assert(g:depart(function()calls=calls+1;g:begin(a);return true end));assert(not g:depart(function()calls=calls+1 end))
g:step(b,.1);assert(calls==0);g:step(b,.1);assert(calls==1 and veil.imageColor.a==255)
print('FADE_PASS')`;
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/FADE_PASS/);
});

test('production Host exposes an empty selection and confirms exactly one run after opaque fade', async t=>{
 const {mkdtempSync,mkdirSync,readdirSync,rmSync}=await import('node:fs');
 const {join,resolve}=await import('node:path');
 const {buildUI}=await import('../scripts/build-ui.mjs');
 const {buildLuaData,luaString}=await import('../scripts/build-lua-data.mjs');
 mkdirSync('build/test-tmp',{recursive:true});const out=mkdtempSync(resolve('build/test-tmp/sts-fade-'));t.after(()=>rmSync(out,{recursive:true,force:true}));
 buildLuaData('data',join(out,'abyss_data.lua'));buildUI(out,undefined,{officialAssets:true});
 const preloads=readdirSync(out).filter(f=>f.endsWith('.lua')).map(f=>`package.preload[${luaString(f.slice(0,-4))}]=assert(loadfile(${luaString(join(out,f))}))`).join('\n');
 const body=`package.path='src/lua/?.lua;tests/lua/?.lua;'..package.path
${preloads}
local G=require('abyss_game_ui');local make=G.new;local ready=true
G.new=function(root,data,presentation,event,p)
 p.prologue=true;p.campaign=true;p.campaignProfile='competition-two-act';p.presentationReady=function()return ready end
 return make(root,data,presentation,event,p)
end
local F=dofile('tests/lua/support/game_ui_fixture.lua');local host,root=F.fixture(nil,function()return true end)
local Gate=require('abyss_page_reveal');local panel=root:GetChild('characterPanel');local veil=root:GetChild('pageReveal'):GetChild('veil')
local function tick()host:update(.05);if host.pageReveal:step(Gate.intent(host),.05)then host:refresh()end;host.pageReveal:paint(true)end
local function settle()for i=1,20 do tick()end;assert(not host.pageReveal:covered())end
settle();assert(host:start());assert(not panel.visible,'destination was painted before fade');settle()
assert(host.characterSelection.info==nil and panel:GetChild('title').visible)
assert(not panel:GetChild('officialBackdropVeil').visible,'approved #785 selection veil removal was lost')
assert(not panel:GetChild('details').visible and not panel:GetChild('confirm').visible)
assert(panel:GetChild('traveler').visible and not host:confirmCharacter())
assert(host:selectCharacter('traveler'));assert(not host.pageReveal:covered(),'selection triggered fullscreen fade')
assert(not panel:GetChild('title').visible and panel:GetChild('details').visible and panel:GetChild('confirm').visible)
assert(panel:GetChild('v25Roster'):GetChild('selected'):GetChild('selection').visible)
ready=false
assert(host:closeCharacters());ready=true;settle();assert(host:start());settle();ready=false
assert(host:selectCharacter('traveler'));assert(host.pageReveal:covered()and veil.imageColor.a==0,'local selection darkened full screen')
assert(not panel:GetChild('details').visible and not panel:GetChild('confirm').visible,'partial selection published before artwork ready')
ready=true;settle();assert(panel:GetChild('details').visible and panel:GetChild('confirm').visible)
ready=false;assert(host:confirmCharacter());assert(not host:confirmCharacter());assert(not host.run)
tick();assert(not host.run and veil.imageColor.a>0 and veil.imageColor.a<255)
for i=1,10 do tick()end;assert(host.run and veil.imageColor.a==255 and host.pageReveal:covered())
local run=host.run;ready=true;settle();assert(host.run==run and not host:confirmCharacter())
print('HOST_FADE_PASS')`;
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8',timeout:60000,maxBuffer:2e6});
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/HOST_FADE_PASS/);
});

test('readiness reentry cannot uncover an unpainted replacement during fade-in',()=>{
 const body=`package.path='src/lua/?.lua;'..package.path
local Gate=require('abyss_page_reveal');local veil={};local shown;local callback;local gate
local cover={GetChild=function(_,n)if n=='veil'then return veil end end,SetVisible=function(_,v)shown=v end,SetAsLastSibling=function()end}
gate=Gate.new(cover,function()if callback then local f=callback;callback=nil;f()end;return true end,nil,nil,{duration=.2,color=function(r,g,b,a)return {a=a}end})
local a={page='menuPanel'};local b={page='characterPanel'};local c={page='mapPanel'}
gate:begin(a);gate:step(a,0);gate:step(a,0);gate:step(a,.2)
gate:begin(b);gate:step(b,.2);gate:begin(b);gate:step(b,0);gate:step(b,0)
assert(gate.state=='fadingIn')
callback=function()gate:request(c)end;gate:step(b,.2)
assert(gate.intent==c and gate:covered()and shown and veil.imageColor.a==255,'stale readiness uncovered replacement')
print('REENTRY_PASS')`;
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/REENTRY_PASS/);
});

test('historical source replay rejects foreign bytes and a changed linked fade owner',async()=>{
 const {readFileSync}=await import('node:fs');
 const {beforeStsSelectionFade,beforeAuthenticatedStsSelectionFade}=await import('./helpers/sts-selection-fade-source.mjs');
 const {files}=JSON.parse(readFileSync('tests/fixtures/sts-selection-fade-source.json','utf8'));
 const path='src/lua/abyss_page_reveal.lua',source=readFileSync(path,'utf8');
 assert.equal(beforeStsSelectionFade(path,source),files[path].before);
 const foreign=source+'\n-- foreign drift';assert.equal(beforeStsSelectionFade(path,foreign),foreign);
 assert.throws(()=>beforeAuthenticatedStsSelectionFade(path,source,owner=>readFileSync(owner,'utf8')+(owner==='src/lua/abyss_game_ui_run.lua'?'\n-- drift':'')),/fresh linked STS fade source/);
});

test('a superseded departure releases its callback and never creates a run',()=>{
 const body=`package.path='src/lua/?.lua;'..package.path
local G=require('abyss_page_reveal');local veil={};local gate;local callback;local cancelled=0;local commits=0
local cover={GetChild=function(_,n)if n=='veil'then return veil end end,SetVisible=function()end,SetAsLastSibling=function()end}
gate=G.new(cover,function()return true end,nil,nil,{duration=.2,color=function(r,g,b,a)if callback then local f=callback;callback=nil;f()end;return {a=a}end})
local a={page='characterPanel'};local c={page='mapPanel'}
gate:begin(a);gate:step(a,0);gate:step(a,0);gate:step(a,.2)
callback=function()gate:request(c)end
assert(not gate:depart(function()commits=commits+1 end,function()cancelled=cancelled+1 end))
assert(not gate.departure and cancelled==1 and commits==0)
assert(gate:begin(c),'cancelled departure blocked replacement paint')
gate:step(c,0);gate:step(c,0);gate:step(c,.2);assert(not gate:covered()and commits==0)
print('CANCEL_REENTRY_PASS')`;
 const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8'});
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/CANCEL_REENTRY_PASS/);
});
