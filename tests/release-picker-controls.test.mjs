import test from 'node:test';
import assert from 'node:assert/strict';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
const child=(node,name)=>(node.children??node.controls??[]).find(n=>n.name===name);
const find=(node,name)=>node.name===name?node:(node.children??node.controls??[]).map(n=>find(n,name)).find(Boolean);
function fixture(){const theme=officialAssetsTheme(nativeTheme),tree=gameLayout(theme);applyOfficialAssets([tree],theme);return {theme,tree};}
const overlap=(a,b)=>a.position.every((v,i)=>Math.abs(v-b.position[i])<(a.size[i]+b.size[i])/2);
function decorationOnly(node){assert.ok(!['cursorArea','presetButton','grid'].includes(node.kind));for(const n of node.children??[])decorationOnly(n);}
function assertBrowserButton(button,source){
 const chrome=child(button,'sharedButtonChrome');assert.ok(chrome,`${button.name}: missing shared browser chrome`);
 assert.deepEqual(button.size,source.size,'browser visual size');
 assert.deepEqual(child(button,'hit').size,child(source,'hit').size,'browser hit size');
 assert.deepEqual(chrome.children.map(n=>n.children),child(source,'hit').children.map(n=>n.children.filter(p=>p.name!=='label')),
  'exact adopted browser material');
}
test('default profile retains its original side-arrow geometry and direct native receivers',()=>{
 const picker=find(gameLayout(),'pickerView');
 for(const name of ['previous','next'])assert.deepEqual(child(child(picker,name),'hit').size,[44,208]);
 for(const name of ['forgePrevious','forgeNext'])assert.deepEqual(child(child(picker,name),'hit').size,[56,44]);
});
test('official forge and removal use the permanent browser paging material and shared footer geometry',()=>{
 const {tree,theme}=fixture(),picker=find(tree,'pickerView'),deck=find(tree,'deckPanel');
 for(const [ordinary,forge] of [['previous','forgePrevious'],['next','forgeNext']]){
  for(const name of [ordinary,forge]){
   const button=child(picker,name),chrome=child(button,'sharedButtonChrome');
   assertBrowserButton(button,child(deck,ordinary));
   assert.deepEqual(button.position,[theme.layout.deckView[ordinary][0],nativeTheme.layout.nativeNode.forge.previous[1]]);
   assert.deepEqual(button.size,theme.layout.deckView[ordinary].slice(2));
   assert.equal(child(button,'hit').kind,'cursorArea');
   assert.equal(child(button,'label').text.content,ordinary==='previous'?'上一页':'下一页');
   decorationOnly(chrome);
   for(const device of [[1280,720],[1920,1080],[2340,1080],[720,1280]]){
    const scale=Math.min(device[0]/1280,device[1]/720);
    for(let axis=0;axis<2;axis++)assert.ok((Math.abs(button.position[axis])+button.size[axis]/2+theme.canvas.safe[axis===0?'x':'y'])*scale<=device[axis]/2,
     `${name}: native hit outside ${device}`);
   }
   for(const action of ['back','confirm'])assert.ok(!overlap(button,find(tree,'nodePanel').children.find(n=>n.name===action)),`${name} overlaps ${action}`);
  }
 }
 assert.deepEqual(theme.layout.nativeNode.picker.page,nativeTheme.layout.nativeNode.picker.page,
  'the removal preview keeps its page label above the selected card');
 assert.ok(!overlap(child(picker,'page'),child(picker,'target')),'page label must not cover the selected card');
 for(const card of child(picker,'forgeGrid').children){
  for(const name of ['forgePrevious','forgeNext'])assert.ok(!overlap(card,child(picker,name)),`${name} overlaps ${card.name}`);
 }
});
test('shared browser contract rejects the old side-bar hit and an unrelated button material',()=>{
 const {tree}=fixture(),button=child(find(tree,'pickerView'),'previous'),reference=child(find(tree,'deckPanel'),'previous');
 const hit=child(button,'hit'),size=[...hit.size];hit.size=[44,208];
 assert.throws(()=>assertBrowserButton(button,reference),/browser hit size/);hit.size=size;
 child(child(button,'sharedButtonChrome').children[0],'border').colour='#FF00FF';
 assert.throws(()=>assertBrowserButton(button,reference),/exact adopted browser material/);
});
test('room return and confirm reuse the existing character/reward flag artwork while retaining direct input paths',()=>{
 const {tree}=fixture(),node=find(tree,'nodePanel'),character=find(tree,'characterPanel');
 for(const [name,role] of [['back','cancel'],['confirm','confirm']]){
  const button=child(node,name),shared=child(button,'sharedButtonChrome');
  assert.ok(shared,`${name}: missing shared flag chrome`);
  const reference=child(child(child(character,role),'hit'),'normal');
  assert.deepEqual(find(shared,'v25Flag'),child(reference,'v25Flag'));
  assert.equal(child(button,'hit').kind,'cursorArea');
  assert.equal(child(button,'label').text.content,name==='back'?'返回':'确认');
  assert.equal(child(button,'label').text.minFontSize,nativeTheme.font.minimum,'dynamic prices and longer captions may fit');
 }
});
test('current official Lua Host keeps shared states, readonly deck, paging, stale touches and C-tier transactions',t=>{
 const directory=mkdtempSync(join(tmpdir(),'release-picker-'));t.after(()=>rmSync(directory,{recursive:true,force:true}));
 buildLuaData('data',join(directory,'abyss_data.lua'));
 buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
 const modules=readdirSync(directory).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const code=`local root=${luaString(directory.replaceAll('\\','/'))};package.path='src/lua/?.lua;'..package.path
 for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(root..'/'..name..'.lua'))end
 dofile('tests/lua/support/release_picker_controls.lua')`;
 const cli=createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js');
 const result=spawnSync(process.execPath,[cli,'-e',code],{encoding:'utf8',timeout:30000,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/RELEASE_PICKER_CONTROLS_PASS/);
});
