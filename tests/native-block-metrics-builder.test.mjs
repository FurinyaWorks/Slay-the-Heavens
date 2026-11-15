import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,rmSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {buildUI} from '../scripts/build-ui.mjs';
import {monsterActorTemplate} from '../scripts/monster-art.mjs';
import {assertCandidateMonsterActorTemplate} from '../scripts/build-native-candidate.mjs';
test('actual official generated actor uses the exact approved LowCostArt transform; ordinary profile stays exact',()=>{
 const folder='build/metrics-builder-'+randomUUID();mkdirSync(folder,{recursive:true});
 try{
  buildUI(folder+'/official',undefined,{officialAssets:true});
  const templates=JSON.parse(readFileSync(folder+'/official/game-ui-templates.json'));
  const actor=templates.find(t=>t.name==='AbyssMonsterActor');assert(actor.children.some(c=>c.name==='portraitArt'));
  assertCandidateMonsterActorTemplate(templates,null,{officialAssets:true});
  assert.throws(()=>assertCandidateMonsterActorTemplate(templates,null),/Monster actor template/);
  const mutate=change=>{const list=structuredClone(templates);change(list,list.find(t=>t.name==='AbyssMonsterActor'));return list;};
  for(const changed of [
   templates.filter(t=>t.name!=='AbyssMonsterActor'),
   mutate((_,a)=>a.children.push({name:'foreign',kind:'container',children:[]})),
   mutate((_,a)=>{a.children=a.children.filter(c=>c.name!=='portraitArt');}),
   mutate((_,a)=>{a.children.find(c=>c.name==='portraitArt').children[0].colour='#FF0000';}),
   mutate((_,a)=>{a.children.find(c=>c.name==='portraitArt').children[0].size[0]=12;}),
   mutate((list,a)=>list.push(structuredClone(a))),
  ])assert.throws(()=>assertCandidateMonsterActorTemplate(changed,null,{officialAssets:true}),/Monster actor template/);
  buildUI(folder+'/ordinary',undefined,{artFeatures:{cards:false,menuBackground:false,selectionAvatar:false,battlePortrait:false,monsters:false}});
  const ordinary=JSON.parse(readFileSync(folder+'/ordinary/game-ui-templates.json'));
  assert.deepEqual(ordinary.find(t=>t.name==='AbyssMonsterActor'),monsterActorTemplate(null));
  assertCandidateMonsterActorTemplate(ordinary,null);
 }finally{rmSync(folder,{recursive:true,force:true});}
});
