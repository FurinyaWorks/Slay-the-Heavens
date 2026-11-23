import test from 'node:test';
import assert from 'node:assert/strict';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';

const child=(node,name)=>(node?.children??node?.controls??[]).find(n=>n.name===name);
function layout(){
 const tree=gameLayout(),theme=officialAssetsTheme(nativeTheme);
 applyOfficialAssets([tree],theme);return tree;
}
const material=node=>{
 const copy=structuredClone(node);delete copy.name;
 if(copy.text)delete copy.text.content;
 return copy;
};

test('every run page mounts the complete battle resource component, preserving writer handles',()=>{
 const tree=layout(),battle=child(tree,'battlePanel');
 for(const pageName of ['mapPanel','nodePanel']){
  const page=child(tree,pageName),resources=child(page,'resources')??page;
  for(const [name,source]of [['hpIcon','hpIcon'],['hp','player'],['goldIcon','goldIcon'],['gold','piles']]){
   assert.deepEqual(material(child(resources,name)),material(child(battle,source)),pageName+'/'+name);
  }
 }
});

test('selection, run balance, battle rewards and treasure share the money bag',()=>{
 const tree=layout(),battle=child(tree,'battlePanel');
 const selection=child(child(child(tree,'characterPanel'),'details'),'v25GoldIcon');
 const hud=child(battle,'goldIcon'),bag=child(hud,'bag');
 assert.equal(hud.kind,'container');
 assert.equal(hud.image,undefined);
 assert.deepEqual(child(bag,'mark'),child(selection,'mark'));
 assert.deepEqual(child(bag,'tie'),child(selection,'tie'));
 const compactMaterial=icon=>{
  const copy=material(icon);
  delete copy.position;delete copy.scale;delete copy.visible;
  return copy;
 };
 for(const name of ['goldReward','stolenGold'])for(const state of child(battle,name).children){
  assert.deepEqual(compactMaterial(child(state,'rewardIcon')),compactMaterial(bag),name+'/'+state.name);
 }
 const treasure=child(child(tree,'nodePanel'),'treasureView');
 const rows=treasure.children.filter(node=>/^reward(?:Item\d+)?$/.test(node.name));
 assert(rows.length>1);
 for(const row of rows){
  const icon=child(row,'goldBag');
  assert.equal(icon.visible,false);
  assert.deepEqual(compactMaterial(icon),compactMaterial(bag),row.name);
 }
});

test('blessing, map and reward potion slots mount the same final battle faces in all states',()=>{
 const tree=layout(),battle=child(tree,'battlePanel');
 const management=child(child(child(tree,'potionEntry'),'open'),'hit');
 for(const state of ['normal','hover','pressed','disabled']){
  const host=child(management,state);
  assert.deepEqual(host.scale,[1,1],'management state cannot scale slots a second time');
  for(let i=1;i<=5;i++){
   const button=child(battle,'potion'+i)??child(child(battle,'potionHelp'),'potion'+i);
   const reference=child(button,state),slot=child(host,'slot'+i);
   assert.deepEqual(slot.scale,reference.scale,state+'/'+i+' final scale');
   for(const name of ['emptyShell','filledShell','fireShell','selectedShell','bottle']){
    assert.deepEqual(child(slot,name),child(reference,name),state+'/'+i+'/'+name);
   }
  }
 }
});

test('battle and noncombat potion popups share compact panel and action tokens',()=>{
 const tree=layout(),battle=child(tree,'battlePanel'),theme=officialAssetsTheme(nativeTheme);
 const popup=child(child(battle,'potionHelp'),'potionPopup');
 assert.deepEqual(child(tree,'potionPanel'),{...popup,name:'potionPanel'});
 assert.equal(child(popup,'plate').image,theme.image.rect);
 assert.equal(child(popup,'plate').colour,theme.color.panel);
 assert.equal(child(popup,'border').colour,theme.color.goldDim);
 const use=child(popup,'use'),discard=child(popup,'discard');
 assert.deepEqual(use.size,discard.size);
 assert.ok(discard.position[0]-use.position[0]>use.size[0]);
 for(const [button,tone] of [[use,'neutral'],[discard,'cancel']])for(const state of button.children){
  const material=child(state,'roundedButton');
  const colours=tone==='neutral'&&state.name==='disabled'?[theme.color.line,theme.color.panel]
   :theme.officialAssets.roundedButtonPalettes[tone][state.name];
  assert.deepEqual(material.children.map(layer=>child(layer,'horizontal').colour),colours);
 }
});
