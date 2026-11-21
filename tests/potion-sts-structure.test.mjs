import test from 'node:test';
import assert from 'node:assert/strict';
import {potionDiscardControls} from '../scripts/potion-discard-layout.mjs';
import {potionSlotVisual} from '../scripts/potion-slot-visual.mjs';
import {finishOfficialPotionFace} from '../scripts/official-run-hud-components.mjs';
import {nativeTheme as theme} from '../scripts/native-ui-theme.mjs';
const child=(n,name)=>n.children.find(c=>c.name===name);
test('management presents five bottle buttons in a single separated row without a large outer plate',()=>{
 const panel=potionDiscardControls().find(n=>n.name==='potionPanel');
 assert.equal(child(panel,'face').visible,false);
 const slots=panel.children.filter(n=>/^slot\d$/.test(n.name));
 assert.equal(new Set(slots.map(n=>n.position[1])).size,1);
 for(const [i,slot]of slots.entries()){
  assert.ok(slot.size.every(n=>n>=44));
  if(i)assert.ok(slot.position[0]-slots[i-1].position[0]>slot.size[0]);
  for(const state of child(slot,'hit').children){
   assert.ok(child(state,'bottle'));assert.equal(child(state,'label').visible,false);
  }
 }
});
test('official empty slot has bottle silhouette and occupied bottles have no circular medallion',()=>{
 const face={children:potionSlotVisual(theme,{border:{name:'border',size:[44,44]},plate:{name:'plate'},bottleSize:32,ink:'#FFFFFF'})};
 finishOfficialPotionFace(face);
 const outline=child(child(face,'emptyShell'),'dashes').children;
 assert.ok(outline.some(n=>n.position[1]>10 && n.size[0]<=16),'narrow bottle neck');
 assert.ok(outline.some(n=>n.position[1]<-10 && n.size[0]>=22),'wide bottle base');
 for(const name of ['filledShell','fireShell'])assert.ok(child(face,name).children.every(n=>n.visible===false));
});

test('live management repaint follows 3/5 capacity, physical holes, selection, discard and reopen',async()=>{
 const {runLua}=await import('../scripts/test-lua.mjs');
 const result=runLua('tests/lua/potion_management_visual.lua');
 assert.equal(result.status,0,result.stderr||result.stdout);
 assert.match(result.stdout,/LUA_POTION_MANAGEMENT_VISUAL_PASS/);
});
