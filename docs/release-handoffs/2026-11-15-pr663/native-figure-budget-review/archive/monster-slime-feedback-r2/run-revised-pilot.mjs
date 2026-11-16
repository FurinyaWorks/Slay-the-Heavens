import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {testDrawings,rowsToSlots} from '../monster-pilot-02/formation-check/native-registry-probe.mjs';
const out=fileURLToPath(new URL('.',import.meta.url)), repo=process.env.RELEASE_REPO?resolve(process.env.RELEASE_REPO):resolve(out,'../exact-release');process.chdir(repo);
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(head,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const {prepareMonsterArt}=await import(pathToFileURL(join(repo,'scripts/monster-art.mjs')));
const {buildUI}=await import(pathToFileURL(join(repo,'scripts/build-ui.mjs')));
const {buildLuaData,toLua}=await import(pathToFileURL(join(repo,'scripts/build-lua-data.mjs')));
const generated=join(out,'stock-pilot-build');mkdirSync(generated,{recursive:true});
const registry=JSON.parse(readFileSync('data/presentation/native-monster-art.json','utf8'));
const assets=[['acid_slime_s','pilot-acid-small','acid-small/native-layout.json'],['spike_slime_s','pilot-spike-small','spike-small/native44.json'],['spike_slime_m','pilot-spike-medium','spike-medium/native-layout.json']].map(([enemy,id,file])=>[enemy,id,enemy==='spike_slime_s'?resolve(out,'spike-small/native-layout.json'):resolve(out,'../monster-pilot-02',file)]);
const expected=testDrawings(registry,assets,toLua);
assert(process.env.ACID_MEDIUM_LAYOUT,'pass exact experimental acid-medium layout path');
registry.asset.slots=rowsToSlots(JSON.parse(readFileSync(process.env.ACID_MEDIUM_LAYOUT)),106);
expected.acid_slime_m=registry.asset.slots;
const full=prepareMonsterArt(registry);
assert.equal(full.poolCapacity,600);
const chosen=new Set(registry.candidateAssets);
registry.additionalAssets=Object.fromEntries(Object.entries(registry.additionalAssets).filter(([id])=>chosen.has(id)));
registry.bindings=Object.fromEntries(Object.entries(registry.bindings).filter(([,id])=>chosen.has(id)));
const selected=prepareMonsterArt(registry);
assert.deepEqual(Object.keys(selected.assets).sort(),Object.keys(full.assets).sort());
for(const [id,value]of Object.entries(selected.assets))assert.deepEqual(value.slots,full.assets[id].slots);

{buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,{artFeatures:{monsters:true},monsterArt:registry});}
let fixture=readFileSync('tests/lua/support/native_monster_art_host.lua','utf8').split("local state=battle({'cultist','acid_slime_m','acid_slime_m'})")[0];
fixture+=`local MonsterArt=require('abyss_monster_art')
local pose=MonsterArt.pose
local shades=setmetatable({},{__mode='k'})
MonsterArt.pose=function(box,x,y,sx,sy,tone,alpha)
 shades[box]={tone,alpha}
 return pose(box,x,y,sx,sy,tone,alpha)
end
local expectedSlots=${toLua(expected)}
local function near(a,b)
 assert(type(a)=='number' and math.abs(a-b)<1e-7,tostring(a)..' vs '..tostring(b))
end
local artData=require('abyss_monster_art_data')
assert(artData.poolCapacity==41)
local function child(spec,name)
 for _,v in ipairs(spec.children)do if v.name==name then return v end end
 error(name)
end
local poolSpec=child(child(require('abyss_ui_templates').AbyssMonsterActor,'monsterArt'),'monsterSamples')
local allocated=0;for _,entry in ipairs(poolSpec.children)do allocated=allocated+#entry.children end
assert(allocated==artData.poolCapacity)
local function assertDrawing(box,id)
 local art=box:GetChild('monsterArt')
 local pool=art:GetChild('monsterSamples')
 local group=pool:GetChild('group000')
 local snapshots={}
 for j,slot in ipairs(expectedSlots[id])do
  local c=group:GetChild(string.format('shape%04d',j-1))
  assert(c.imageId==slot.image and c.visible)
  snapshots[j]={control=c,writes=c.rotationWrites}
  near(c.x,slot.position[1]);near(c.y,slot.position[2])
  near(c.sizeDeltaX,slot.size[1]);near(c.sizeDeltaY,slot.size[2])
  for k=1,3 do near(c.rotation[k],slot.rotation[k])end
  local sample=assert(shades[box])
  for k,name in ipairs({'r','g','b','a'})do
   near(c.imageColor[name],math.floor(slot.colour[k]*(sample[1][name] or 255)/255*(k==4 and sample[2] or 1)))
  end
 end
 for i=#expectedSlots[id],allocated-1 do
  local g=pool:GetChild(string.format('group%03d',math.floor(i/60)))
  assert(not g:GetChild(string.format('shape%04d',i)).visible)
 end
 return snapshots
end
local function checkStable(old,new)
 assert(#old==#new)
 for i, prior in ipairs(old)do assert(prior.control==new[i].control and prior.writes==new[i].writes)end
end
local calls=0
local state=F.Combat.new(F.Data,{deck={'strike','strike','defend'},seed=11,sourceEncounter='Lots of Slimes',encounterBoundary={misc={integer=function(lo,hi)calls=calls+1;return lo end}}})
host.run.combat=state;host:refresh()
assert(state.sourceEncounter=='Lots of Slimes' and #state.enemies==5 and calls==5)
local expected={{-480,30},{-320,2},{-160,32},{10,-12},{200,9}}
local visible=0;local kinds={acid_slime_s=0,spike_slime_s=0};local ids,boxes,drawings,xy={},{},{},{}
for i,actor in ipairs(state.enemies)do
 kinds[actor.definitionId]=assert(kinds[actor.definitionId])+1
 assert(not ids[actor.id]);ids[actor.id]=true
 assert(actor.sourcePosition.x==expected[i][1] and actor.sourcePosition.y==expected[i][2])
 local box=boxFor(actor);local art=box:GetChild('monsterArt')
 assert(not boxes[box] and not drawings[art]);boxes[box]=true;drawings[art]=true
 assert(art.visible and not box:GetChild('portrait').visible)
 xy[i]={box=box,x=box.x,y=box.y,art=art,shapes=assertDrawing(box,actor.definitionId)}
 visible=visible+#xy[i].shapes
 print('ACTOR',i,actor.id,actor.sourcePosition.x,actor.sourcePosition.y,box.x,box.y)
end
assert(kinds.acid_slime_s==2 and kinds.spike_slime_s==3)
for i=1,120 do host:update(1/60)end
for i,actor in ipairs(state.enemies)do assert(boxFor(actor)==xy[i].box and xy[i].art.visible);checkStable(xy[i].shapes,assertDrawing(xy[i].box,actor.definitionId))end
local retired=state.enemies[2];retired.hp=0;host.battleUI:render()
assert(not surfaces:find(retired.id) and not xy[2].box.alive)
for i,actor in ipairs(state.enemies)do if i~=2 then
 local box=boxFor(actor);assert(box==xy[i].box and box.x==xy[i].x and box.y==xy[i].y and xy[i].art.visible)
 checkStable(xy[i].shapes,assertDrawing(box,actor.definitionId))
end end
print('NATIVE_FORMATION_HOST_PASS source=Lots-of-Slimes acid=2 spike=3 independent=5 idleFrames=120 visible='..visible..' allocatedPerInstance='..allocated..' retirement=one')
local medium=battle({'spike_slime_m'})
assertDrawing(boxFor(medium.enemies[1]),'spike_slime_m')
print('MEDIUM_NATIVE_HOST_PASS assets=4 fields=image,rotation,position,size,RGBA_after_pose_tint visibility=exact')
for i,branch in ipairs({true,false})do
 local hits=0
 local small=F.Combat.new(F.Data,{deck={'strike','strike','defend'},seed=11,sourceEncounter='Small Slimes',encounterBoundary={misc={boolean=function()hits=hits+1;return branch end}}})
 host.run.combat=small;host:refresh()
 assert(hits==1 and #small.enemies==2 and small.sourceEncounter=='Small Slimes')
 local left=branch and 'spike_slime_s' or 'acid_slime_s'
 local right=branch and 'acid_slime_m' or 'spike_slime_m'
 assert(small.enemies[1].definitionId==left and small.enemies[2].definitionId==right)
 assertDrawing(boxFor(small.enemies[1]),left);assertDrawing(boxFor(small.enemies[2]),right)
 print('SMALL_SLIMES_HOST_PASS',i,left,right)
end
local mixed=battle({'cultist','acid_slime_s'})
local outside=boxFor(mixed.enemies[1])
assert(outside:GetChild('portrait').visible and not outside:GetChild('monsterArt').visible)
assertDrawing(boxFor(mixed.enemies[2]),'acid_slime_s')
print('UNSELECTED_GALLERY_FALLBACK_PASS')

`;
writeFileSync(join(out,'stock-pilot-fixture.lua'),fixture);
const code='package.path='+JSON.stringify(generated+'/?.lua;'+join(repo,'src/lua/?.lua;'))+'..package.path;dofile('+JSON.stringify(join(out,'stock-pilot-fixture.lua'))+')';
const r=spawnSync(process.execPath,[join(repo,'node_modules/fengari-node-cli/src/lua-cli.js'),'-e',code],{encoding:'utf8',timeout:120000,maxBuffer:2e6});
writeFileSync(join(out,'stock-pilot-raw.log'),r.stdout+r.stderr);console.log(r.stdout+r.stderr);assert.equal(r.status,0,String(r.error));
writeFileSync(join(out,'stock-pilot-report.json'),JSON.stringify({head,pass:true,source:'Lots of Slimes',acid:2,spike:3,scope:'Actual GameUI/Combat/formation/runtime with native mocks; new batch02 art injected into a temporary explicit build input, exact visible primitive fields; not real device or product bindings',poolCapacity:41,fiveActorVisibleShapes:3*expected.spike_slime_s.length+2*expected.acid_slime_s.length,fiveActorAllocatedShapeSlots:205,twoRealSmallSlimesBranches:true,unselectedFallback:true,allVisibleSlotIdentitiesStable:true,newRowsVerified:true,slotsByEnemy:Object.fromEntries(Object.entries(expected).map(([id,slots])=>[id,slots.length])),officialDevice:false},null,2)+'\n');
