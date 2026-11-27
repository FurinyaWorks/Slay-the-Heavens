import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {gameLayout} from '../../scripts/game-ui-layout.mjs';
import {nativeTheme} from '../../scripts/native-ui-theme.mjs';
import {officialAssetsTheme,applyOfficialAssets} from '../../scripts/official-assets-layout.mjs';
import {buildUiTheme} from '../../scripts/build-ui-theme.mjs';
import {buildLuaData} from '../../scripts/build-lua-data.mjs';
import {runLua} from '../../scripts/test-lua.mjs';
const child=(n,name)=>(n.children??n.controls??[]).find(c=>c.name===name);
const all=n=>[n,...(n.children??n.controls??[]).flatMap(all)];
test('distinct shipped powers have distinct native icon identities',()=>{
 const theme=JSON.parse(readFileSync('data/presentation/ui_theme.json'));
 const statuses=JSON.parse(readFileSync('data/statuses.json')).statuses;
 const seen=new Map();
 for(const id of ['shackled','panache','no_block','intangible','magnetism','mayhem','sadistic_nature','colorless_bomb'])statuses.push({id});
 for(const s of statuses){const icon=theme.icon.status[s.id],id=icon.id??icon;
  assert.ok(!seen.has(id),s.id+' shares icon with '+seen.get(id));seen.set(id,s.id);}
});
test('official blocked card dims its face while cost material and numeral paint above the veil',()=>{
 const tree=gameLayout();applyOfficialAssets([tree],officialAssetsTheme(nativeTheme));
 for(const face of all(tree).filter(n=>/^card\d+$/.test(n.name)&&child(n,'blockedVeil'))){
  const names=face.children.map(n=>n.name),veil=names.indexOf('blockedVeil');
  assert.ok(names.indexOf('stsReferenceCost')>veil,'cost material must paint above disabled veil');
  assert.ok(names.indexOf('cost')>veil,'cost numeral must paint above disabled veil');
  assert.ok(names.indexOf('stsReferenceChrome')<veil,'face must be dimmed');
 }
});
test('STS1 reference keeps the complete orb material dimmed at zero and restores it on recharge',()=>{
 buildLuaData();mkdirSync('build/lua',{recursive:true});
 writeFileSync('build/visual-theme.json',JSON.stringify(officialAssetsTheme(nativeTheme)));
 mkdirSync('build/visual-test',{recursive:true});
 buildUiTheme('build/visual-theme.json','data','build/visual-test/abyss_theme.lua');
 mkdirSync('build/visual-test',{recursive:true});
 writeFileSync('build/visual-test/energy.lua',`package.path='build/visual-test/?.lua;build/lua/?.lua;src/lua/?.lua;'..package.path
local nodes={}
local function node(name)
 local c={name=name,visible=true,children={}}
 function c:GetChild(n)if not self.children[n]then self.children[n]=node(n)end;return self.children[n]end
 function c:SetVisible(v)self.visible=v end
 return c
end
local function get(n)if not nodes[n]then nodes[n]=node(n)end;return nodes[n]end
local owner={data={rules={player={energyPerTurn=3}}}}
local host={options={},platform={mobileRunHud=false}}
local writers=require('abyss_battle_render_hud').install(owner,nil,host,{child=get,label=function(n,v)get(n).text=v end,show=function(n,v)get(n):SetVisible(v)end,tint=function(c,v)c.tint=v end,ink=function(c,v)c.ink=v end})
local frame={battle={energy=3,exhaust={}},fighting=true}
writers.renderEnergy(frame)
local chrome=get('energyIcon'):GetChild('v25Chrome')
assert(chrome.visible)
frame.battle.energy=0;writers.renderEnergy(frame)
assert(chrome.visible,'STS1 empty orb keeps its complete material, rather than dropping its decoration')
local Theme=require('abyss_theme')
for name,active in pairs(Theme.officialAssets.energyOrb.charged)do
 local part=chrome:GetChild(name);assert(part.visible)
 local empty=part.tint;assert(empty and empty.r+empty.g+empty.b<active.r+active.g+active.b,'empty material must be visibly dimmer: '..name)
end
assert(not get('energyIcon'):GetChild('light').visible)
assert(get('energy').text=='0/3')
frame.battle.energy=5;writers.renderEnergy(frame)
assert(chrome.visible and get('energyIcon'):GetChild('light').visible)
assert(get('energy').text=='5/3' and frame.battle.energy==5)
for name,active in pairs(Theme.officialAssets.energyOrb.charged)do
 local tint=chrome:GetChild(name).tint
 assert(tint.r==active.r and tint.g==active.g and tint.b==active.b,'charged material must restore: '..name)
end
print('ENERGY_VISUAL_READONLY_PASS')`);
 const r=runLua('build/visual-test/energy.lua');assert.equal(r.status,0,r.stdout+r.stderr);
});

import {beforeCombatVisualSource,combatVisualPriorRead} from './combat-visual-source.mjs';
test('historical adapter only recognises exact current bytes and rejects changed live reads',()=>{
 const path='src/lua/abyss_card_skin.lua',source=readFileSync(path,'utf8');
 assert.notEqual(beforeCombatVisualSource(path,source),source);
 assert.equal(beforeCombatVisualSource(path,source+'-- unknown'),source+'-- unknown');
 assert.throws(()=>beforeCombatVisualSource(path,source,()=>source+'-- changed'),/linked owner identity/);
});

import {assertIntegrationSuccessorsCurrent} from './fork-preflight-source.mjs';
import {beforeCurrentProductionSource} from './character-preparation-source.mjs';
import {beforeDeckPagesSuiteSource} from './input-retirement-source.mjs';
import {beforeKnownMasterBackflowSource} from './master-backflow-source.mjs';
import {beforeDevelopBackflow} from './develop-release-backflow-source.mjs';
test('fresh guards reject mixed old/new sources and integrated readback drift',()=>{
 const path='src/lua/abyss_card_skin.lua',source=readFileSync(path,'utf8');
 let reads=0;
 const reader=()=>++reads===1?source:source+'-- changed';
 assert.throws(()=>combatVisualPriorRead(reader)(path,'utf8'),/linked owner identity/);
 const before=beforeCombatVisualSource(path,source);
 assert.throws(()=>beforeCurrentProductionSource(path,before,p=>readFileSync(p,'utf8')),/fresh (?:current production owner|combat visual source)/);
 const layout='scripts/official-run-layout.mjs',current=readFileSync(layout,'utf8');
 const readBackflow=p=>beforeKnownMasterBackflowSource(p,readFileSync(p,'utf8'));
 const backflow=readBackflow(layout);
 assert.notEqual(backflow,current,'exact current master backflow layout');
 const readSuite=p=>beforeDeckPagesSuiteSource(p,readBackflow(p));
 const preDeck=readSuite(layout),old=beforeCombatVisualSource(layout,preDeck,readSuite);
 assert.notEqual(preDeck,backflow,'exact current input-retirement layout');
 assert.notEqual(old,preDeck,'exact earlier combat-visual layout');
 assert.throws(()=>assertIntegrationSuccessorsCurrent(p=>p===layout?old:readFileSync(p,'utf8')),
  /fresh (?:complete integration source|current production owner|combat visual source): scripts\/official-run-layout\.mjs/);
});

import {beforeEnergyReferenceSource,energyReferencePriorRead,assertEnergyReferenceCurrent} from './energy-reference-source.mjs';
test('reference correction keeps exact history while rejecting stale source and changed readers',()=>{
 const path='src/lua/abyss_battle_render_hud.lua',current=readFileSync(path,'utf8');
 const readBackflow=p=>beforeDevelopBackflow(p,readFileSync(p,'utf8'));
 const source=readBackflow(path);
 assert.notEqual(source,current,'exact current develop backflow renderer');
 const previous=beforeEnergyReferenceSource(path,source,readBackflow);assert.notEqual(previous,source);
 assert.equal(beforeEnergyReferenceSource(path,previous,readBackflow),previous);
 assert.equal(beforeEnergyReferenceSource(path,source+'-- unknown',readBackflow),source+'-- unknown');
 assert.throws(()=>assertEnergyReferenceCurrent(path,previous,readBackflow),/fresh energy reference source/);
 let reads=0;
 const changingRead=p=>beforeDevelopBackflow(p,++reads===1?current:current+'-- changed');
 assert.throws(()=>energyReferencePriorRead(changingRead)(path,'utf8'),/linked owner identity/);
 assertIntegrationSuccessorsCurrent();
});
