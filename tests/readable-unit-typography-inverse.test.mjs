import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {enemyUnitTemplate,battleLayout,theme} from '../scripts/ui-layout.mjs';
import {preReadableUnitTypography} from './helpers/readable-unit-typography-inverse.mjs';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function restoreRetiredHitFocus(owner,names){
 for(const hit of names){
  const index=owner.children.findIndex(node=>node.name===hit);
  const control=owner.children[index];
  assert(control?.kind==='cursorArea'&&!Object.hasOwn(control,'focusable'),'exact pointer-only hit: '+hit);
  const {name,kind,size,...geometry}=control;
  owner.children[index]={name,kind,size,focusable:true,...geometry};
 }
}
test('readability inverse preserves frozen geometry and rejects typography or unrelated drift',()=>{
 for(const hero of [false,true]){
  const source=hero?battleLayout().controls.find(n=>n.name==='stage').children.find(n=>n.name==='hero'):enemyUnitTemplate();
  const frozen=hero?'ee457437376d90ded5fe29ce2018ed9266eda755a59779022c9571b8439a3d97':'e17a5a9bdaa32056b274d7b12d2a492eee381d4fc70f70c521a4d9b705232f5d';
  const project=value=>{
   const old=preReadableUnitTypography(value,{hero});
   restoreRetiredHitFocus(old,hero?['hit']:['intentHit','hit']);
   if(hero){
    const row=old.children.find(n=>n.name==='statusRow');
    const {statusIcon,nativeText}=theme.layout;
    // #887 widened the count boxes to the native line-height minimum.
    for(const count of row.children.filter(n=>/^count\d+$/.test(n.name))){
     assert.deepEqual(count.size,[Math.max(statusIcon.size,nativeText.lineHeight),nativeText.lineHeight]);
     count.size[0]=statusIcon.size;
    }
    restoreRetiredHitFocus(row,['hit',...Array.from({length:10},(_,i)=>'hit'+(i+1))]);
   }else{
    // #897 adds a pointer-only HP hit and makes the actor block the cursor.
    assert.equal(old.blockCursor,true,'exact enemy cursor blocking');
    delete old.blockCursor;
    const hpHitIndex=old.children.findIndex(n=>n.name==='hpHit');
    assert.deepEqual(old.children[hpHitIndex],{name:'hpHit',kind:'cursorArea',size:theme.layout.hpBar.size,visible:false},'exact enemy HP hit');
    old.children.splice(hpHitIndex,1);
    old.children=old.children.filter(n=>!['intentVfxBehind','intentVfxAfter'].includes(n.name));
    old.children.find(n=>n.name==='intent').text.valign='top';
   }
   return old;
  };
  const before=structuredClone(source);assert.equal(digest(project(source)),frozen);assert.deepEqual(source,before,'projection never mutates production layout');
  for(const key of ['fontSize','minFontSize']){const changed=structuredClone(source);changed.children.find(n=>n.name==='hp').text[key]--;assert.throws(()=>project(changed),/exact readable typography/);}
  const focused=structuredClone(source);focused.children.find(n=>n.name==='hit').focusable=true;
  assert.throws(()=>project(focused),/exact pointer-only hit/);
  for(const mutate of [n=>{n.size[0]++;},n=>{n.children.find(c=>c.name==='portrait').image++;},n=>{n.children.push({name:'unknown',kind:'container'});}]){
   const changed=structuredClone(source);mutate(changed);assert.notEqual(digest(project(changed)),frozen,'unrelated drift must reach the unchanged frozen oracle');
  }
  const missing=structuredClone(source);missing.children=missing.children.filter(n=>n.name!=='hp');assert.throws(()=>project(missing),/unique reviewed text/);
 }
});
