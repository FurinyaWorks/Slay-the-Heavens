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
test('live energy writer darkens decorative chrome at zero and restores it on recharge',()=>{
 buildLuaData();mkdirSync('build/lua',{recursive:true});
 writeFileSync('build/visual-theme.json',JSON.stringify(officialAssetsTheme(nativeTheme)));
 buildUiTheme('build/visual-theme.json','data','build/lua/abyss_theme.lua');
 mkdirSync('build/visual-test',{recursive:true});
 writeFileSync('build/visual-test/energy.lua',`package.path='build/lua/?.lua;src/lua/?.lua;'..package.path
local nodes={}
local function node(name)
 local c={name=name,visible=true,children={}}
 function c:GetChild(n)if not self.children[n]then self.children[n]=node(n)end;return self.children[n]end
 function c:SetVisible(v)self.visible=v end
 return c
end
local function get(n)if not nodes[n]then nodes[n]=node(n)end;return nodes[n]end
local owner={data={rules={player={energyPerTurn=3}}}}
local writers=require('abyss_battle_render_hud').install(owner,nil,{options={}},{child=get,label=function(n,v)get(n).text=v end,show=function(n,v)get(n):SetVisible(v)end,tint=function(c,v)c.tint=v end,ink=function(c,v)c.ink=v end})
local frame={battle={energy=3,exhaust={}},fighting=true}
writers.renderEnergy(frame)
local chrome=get('energyIcon'):GetChild('v25Chrome')
assert(chrome.visible)
frame.battle.energy=0;writers.renderEnergy(frame)
assert(not chrome.visible,'zero energy retains bright gold chrome')
assert(not get('energyIcon'):GetChild('light').visible)
assert(get('energy').text=='0/3')
frame.battle.energy=5;writers.renderEnergy(frame)
assert(chrome.visible and get('energyIcon'):GetChild('light').visible)
assert(get('energy').text=='5/3' and frame.battle.energy==5)
print('ENERGY_VISUAL_READONLY_PASS')`);
 const r=runLua('build/visual-test/energy.lua');assert.equal(r.status,0,r.stdout+r.stderr);
});

import {beforeCombatVisualSource} from './combat-visual-source.mjs';
test('historical adapter only recognises exact current bytes and rejects changed live reads',()=>{
 const path='src/lua/abyss_card_skin.lua',source=readFileSync(path,'utf8');
 assert.notEqual(beforeCombatVisualSource(path,source),source);
 assert.equal(beforeCombatVisualSource(path,source+'-- unknown'),source+'-- unknown');
 assert.throws(()=>beforeCombatVisualSource(path,source,()=>source+'-- changed'),/linked owner identity/);
});
