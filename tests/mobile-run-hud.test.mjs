import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {prepareOfficialRunHud,finishOfficialRunBar,officialRunHudComponent} from '../scripts/official-run-hud-components.mjs';
import {officialBattleUtilityFaces} from '../scripts/official-battle-hud.mjs';
import {runLua} from '../scripts/test-lua.mjs';
const child=(n,name)=>(n.children??n.controls??[]).find(c=>c.name===name);

test('shared official HP and gold keep complete values at the approved number size',()=>{
 const battle=child(gameLayout(),'battlePanel'),theme=nativeTheme;
 prepareOfficialRunHud(battle,theme);finishOfficialRunBar(battle,theme);
 const component=officialRunHudComponent(battle),hud=theme.officialAssets.battleHud;
 for(const [name,value]of [['hp','9999/9999'],['gold','999999']]){
  const node=component.resources[name];
  assert.equal(node.text.fontSize,18);assert.equal(node.text.minFontSize,18,'critical values must not shrink');
  assert(value.length*18*.6+4<=node.size[0],name+' complete value must fit');
  assert(node.size[1]>=18*1.45+4,'one full native line');
 }
 const hp=hud.hp,gold=hud.gold;
 assert(hp[0]+hp[2]/2<hud.goldIcon[0]-hud.goldIcon[2]/2,'HP must not overlap gold');
 assert(gold[0]+gold[2]/2<hud.potionX-26,'gold must not overlap the first potion');
});

test('all four settings faces use the existing native settings picture and retain their original hit',()=>{
 const layout=gameLayout(),open=child(child(layout,'exitEntry'),'open'),hit=child(open,'hit');
 const before=structuredClone(hit);officialBattleUtilityFaces(layout,nativeTheme);
 assert.deepEqual(hit.size,before.size);assert.equal(hit.focusable,before.focusable);
 const [x,y]=nativeTheme.officialAssets.battleHud.menu,[width,height]=hit.size;
 assert(x-width/2>=-640&&x+width/2<=640&&y-height/2>=-360&&y+height/2<=360,'complete settings hit stays inside the design canvas');
 for(const face of hit.children){
  const overlay=child(face,'officialBattleHud'),symbol=child(overlay,'symbol');
  assert.equal(symbol.kind,'image');assert.equal(symbol.image,nativeTheme.icon.settings);
  assert.deepEqual(symbol.size,[28,28]);assert.equal(symbol.text,undefined);
 }
});

test('route map, shared relics and settings preserve foreground order across both native profiles',()=>{
 const r=runLua('tests/lua/mobile_run_hud.lua');assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/MOBILE_RUN_HUD_PASS 2/);
});
