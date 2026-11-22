import test from 'node:test';import assert from 'node:assert/strict';
import {battleLayout,theme} from '../scripts/ui-layout.mjs';
import {assertNativeUiCapacity} from '../scripts/build-ui.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {beforePotionPointerSource,potionPointerSourcePaths} from './helpers/potion-pointer-source.mjs';
const stage=()=>battleLayout().controls.find(x=>x.name==='stage');
const potion=(s,i)=>i<4?s.children.find(c=>c.name==='potion'+i):s.children.find(c=>c.name==='potionHelp').children.find(c=>c.name==='potion'+i);
test('Readable potion row preserves all five physical circular potion slots with official bottles and no old text row',()=>{
 const s=stage();for(let i=1;i<=5;i++){
  const p=potion(s,i);const expected=[-100+(i-1)*48,264];p.position.forEach((n,a)=>assert(Math.abs(n-expected[a])<1e-9));
  assert.deepEqual(p.size,[44,44]);
  assert.ok(Math.abs(p.position[0])+p.size[0]/2<=640&&Math.abs(p.position[1])+p.size[1]/2<=360,'bottle stays inside base canvas');
  if(i>1)assert.ok(p.position[0]-p.size[0]/2-(potion(s,i-1).position[0]+potion(s,i-1).size[0]/2)>=4,'physical bottle targets keep their gap');
  for(const state of p.children){assert.equal(state.children.find(c=>c.name==='plate').image,theme.image.disc);assert.equal(state.children.find(c=>c.name==='border').image,theme.image.disc);assert(state.children.find(c=>c.name==='bottle'));assert.equal(state.children.find(c=>c.name==='label').visible,false);}
 }
 assertNativeUiCapacity(battleLayout());
});
test('Main potion popup is a compact anchored effect card with explicit use and discard actions',()=>{
 const s=stage(),group=s.children.find(c=>c.name==='potionHelp'),p=group.children.find(c=>c.name==='potionPopup');assert(p,'reuse existing parent capacity');
 assert.equal(p.visible,false);for(const name of ['title','target','effect','use','discard','hit'])assert(p.children.find(c=>c.name===name),name);
 assert.deepEqual(p.size,[400,180]);assert.deepEqual(p.position,[-100,108]);
 assert.equal(p.position[1]+p.size[1]/2,198);
 assert.ok(potion(s,1).position[1]-potion(s,1).size[1]/2-(p.position[1]+p.size[1]/2)>=2,'popup remains below the bottle row');
 assert.ok(Math.abs(p.position[0])+p.size[0]/2<=640&&Math.abs(p.position[1])+p.size[1]/2<=360,'initial popup stays inside base canvas');
});

test('Main potion runtime preserves explicit actions, stale ownership, and the real Potion Belt fifth slot',()=>{
 const r=runLua('tests/lua/approved_main_potions.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/APPROVED_MAIN_POTIONS_PASS/);
});
test('Main host isolates the small potion card pointer input and keeps global inventory off battle',()=>{
 const r=runLua('tests/lua/approved_main_host_potions.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/APPROVED_MAIN_HOST_POTIONS_PASS/);
});

test('Main popup initial dismiss remains centered on the entire canvas before first render',()=>{
 const p=stage().children.find(c=>c.name==='potionHelp').children.find(c=>c.name==='potionPopup');
 const d=p.children.find(c=>c.name==='dismiss');
 assert.deepEqual(d.size,theme.canvas.base);
 d.position.forEach((n,i)=>assert(Math.abs(n+p.position[i])<1e-8));
});
test('Main popup action labels retain a native text line inside the source small visual buttons',()=>{
 const p=stage().children.find(c=>c.name==='potionHelp').children.find(c=>c.name==='potionPopup');
 for(const name of ['use','discard'])for(const state of p.children.find(c=>c.name===name).children)
  assert(state.children.find(c=>c.name==='label').size[1]>=theme.layout.nativeText.lineHeight);
});

test('Recovered potion ownership rejects competing, stale, and anonymous pointer tails',()=>{
 const result=runLua('tests/lua/support/recovered_potion_pointer_ownership.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/APPROVED_MAIN_POTIONS_PASS/);
});

test('A completed neutral potion panel touch releases its pointer without dismissing or suppressing later Use',()=>{
 const result=runLua('tests/lua/support/potion_neutral_pointer.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/POTION_NEUTRAL_POINTER_PASS/);
});

test('Recovered potion pointer sources restore only the three exact predecessors with fresh authorization',()=>{
 const priorWitnesses=[
  ['src/lua/abyss_battle_card_gestures.lua','de9e504ed35a936825925169fd031f9144645c95f3d15fbbbb8d73a92d009153'],
  ['src/lua/abyss_battle_ui.lua','c703bb46e116735b9c3805bacc814cee8ade3ea07bb39f79c75151b6fa728481'],
  ['src/lua/abyss_battle_potion_popup.lua','705397ad7afc3246e7c533932cef7cd63436535676087b0e4fdd51dd1e7c24cd'],
 ];
 assert.deepEqual(potionPointerSourcePaths,priorWitnesses.map(([path])=>path));
 for(const [path,sha256] of priorWitnesses){
  const source=readFileSync(path,'utf8');
  const prior=beforePotionPointerSource(path,source,()=>source);
  assert.equal(createHash('sha256').update(prior).digest('hex'),sha256);
  const crlf=source.replaceAll('\r\n','\n').replaceAll('\n','\r\n');
  assert.equal(beforePotionPointerSource(path,crlf,()=>crlf),prior);
  for(const replacement of [prior,source+'\n',null]){
   assert.throws(()=>beforePotionPointerSource(path,source,()=>replacement),/combined linked owner identity/);
  }
  assert.equal(beforePotionPointerSource(path,source,()=>source),prior);
 }
});
