import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {luaString,toLua} from '../scripts/build-lua-data.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import * as art from '../scripts/monster-art.mjs';
const descendants=t=>[t,...(t.children??[]).flatMap(descendants)];
const refined=()=>({enabled:true,canvas:[127,127],assets:Object.fromEntries(
 Object.entries({small:40,middle:85,large:115}).map(([id,n])=>[id,{enemyId:id,cardId:id,capacity:115,slots:Array(n).fill({})}])),
 bindings:{slime_boss:'small',chosen:'middle',mugger:'large',mugger_clone:'large'}});
test('refined templates allocate bounded physical tiers and emit matching data without a legacy base asset',()=>{
 const input=refined(),before=structuredClone(input);
 assert.equal(typeof art.monsterActorTiers,'function');
 const result=art.monsterActorTiers(input);
 const counts=result.templates.map(t=>[t.name,art.monsterActorInventory(t).shapesPerActor,descendants(t).length]);
 assert.deepEqual(counts,[['AbyssMonsterActor',0,35],['AbyssMonsterActor41',41,79],['AbyssMonsterActor96',96,135],['AbyssMonsterActor115',115,154]]);
 assert.equal(result.artData.poolCapacity,115);
 assert(!Object.hasOwn(result.artData,'asset'));
 assert.deepEqual(Object.values(result.artData.assets).map(a=>a.capacity),[41,96,115]);
 assert.deepEqual(result.templateByDefinition,{slime_boss:'AbyssMonsterActor41',chosen:'AbyssMonsterActor96',mugger:'AbyssMonsterActor115',mugger_clone:'AbyssMonsterActor115'});
 for(const t of result.templates.slice(1)){
  assert.deepEqual(t.children.slice(1),result.templates[0].children);
  assert.equal(t.children[0].visible,false);
  assert(descendants(t).every(n=>(n.children?.length??0)<=60));
 }
 assert.deepEqual(input,before);
});
test('invalid bindings and exceeding the 115 primitive ceiling fail before generating templates',()=>{
 const over=refined();over.assets.large.slots.push({});
 assert.throws(()=>art.monsterActorTiers(over),/capacity/);
 const missing=refined();missing.bindings.mugger='toString';
 assert.throws(()=>art.monsterActorTiers(missing),/binding/);
 const empty=refined();empty.assets.small.slots=[];
 assert.throws(()=>art.monsterActorTiers(empty),/capacity/);
});
test('legacy allocation remains explicit and the refined no-art variant has no physical drawing tree',()=>{
 const old=art.monsterActorTemplate({canvas:[106,106],poolCapacity:600});
 assert.equal(art.monsterActorInventory(old).shapesPerActor,600);
 const off=art.monsterActorTiers(null);
 assert.deepEqual(off,{templates:[art.monsterActorTemplate(null)],templateByDefinition:{},artData:null});
});

test('refined payload decodes and caches only the requested drawing',()=>{
 const slot={image:100002,imageType:'stretch',position:[-1.25,2],size:[8,7],pivot:[.5,.5],
  anchorMin:[.5,.5],anchorMax:[.5,.5],scale:[1,1],rotation:[0,35.5,-22],colour:[120,180,90,128]};
 const payload=art.monsterArtPayloadSource({status:'refined-release',assets:{first:{slots:[slot]},second:{slots:[slot]}}});
 const temp=mkdtempSync(join(tmpdir(),'abyss-lazy-monster-art-'));
 try {
  const entry=join(temp,'entry.lua');
  writeFileSync(entry,`
local art=assert(load(${luaString(payload)}))()
local first,second=art.assets.first,art.assets.second
assert(rawget(first,'slots')==nil and rawget(second,'slots')==nil,'catalogue decoded during load')
local slots=first.slots
assert(slots==first.slots and slots==rawget(first,'slots'),'selected drawing was not cached')
assert(#slots==1 and slots[1].image==100002 and slots[1].imageType=='stretch')
assert(slots[1].position[1]==-1.25 and slots[1].rotation[2]==35.5 and slots[1].colour[4]==128)
assert(rawget(second,'slots')==nil,'request decoded unrelated drawing')
assert(second.slots~=slots and second.slots[1].rotation~=slots[1].rotation)
`);
  const result=runLua(entry);
  assert.equal(result.status,0,result.stdout+result.stderr);
 }finally{rmSync(temp,{recursive:true,force:true});}
});

test('real native art writer renders three tiers, leaves no-art fallback, and reclaims cross-tier actor',()=>{
 const fixture=refined();
 const slot={image:100002,imageType:'basic',position:[1,2],size:[8,7],pivot:[.5,.5],anchorMin:[.5,.5],anchorMax:[.5,.5],scale:[1,1],rotation:[0,0,0],colour:[120,180,90,128]};
 for(const asset of Object.values(fixture.assets))asset.slots=asset.slots.map(()=>slot);
 const {templates,templateByDefinition,artData}=art.monsterActorTiers(fixture);
 const indexByName=Object.fromEntries(templates.map((t,i)=>[t.name,i+1]));
 const indices=Object.fromEntries(Object.entries(templateByDefinition).map(([def,name])=>[def,indexByName[name]]));
 const temp=mkdtempSync(join(tmpdir(),'abyss-refined-monster-tier-'));
 try {
  const entry=join(temp,'entry.lua');
  const run=variant=>{
   writeFileSync(entry,`assert(loadfile('tests/lua/support/refined_monster_tier_paint.lua'))(${toLua({templates,art:artData,indices})},${luaString(variant)})\n`);
   return runLua(entry);
  };
  const red=run('shared-metadata');
  assert.notEqual(red.status,0);
  assert.match(red.stderr,/paint failed: slime_boss/);
  const green=run('per-tier');
  assert.equal(green.status,0,green.stdout+green.stderr);
  assert.match(green.stdout,/PAINT PASS/);
 }finally{rmSync(temp,{recursive:true,force:true});}
});
