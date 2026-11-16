import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {testDrawings} from './native-registry-probe.mjs';
const out=fileURLToPath(new URL('.',import.meta.url)), repo=process.env.RELEASE_REPO?resolve(process.env.RELEASE_REPO):resolve(out,'../exact-release');process.chdir(repo);
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(head,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const {buildUI}=await import(pathToFileURL(join(repo,'scripts/build-ui.mjs')));
const {buildLuaData,toLua}=await import(pathToFileURL(join(repo,'scripts/build-lua-data.mjs')));
const generated=join(out,'native-build');mkdirSync(generated,{recursive:true});
const registry=JSON.parse(readFileSync('data/presentation/native-monster-art.json','utf8'));
const assets=[['acid_slime_s','pilot-acid-small','acid-small/native-layout.json'],['spike_slime_s','pilot-spike-small','spike-small/native44.json'],['spike_slime_m','pilot-spike-medium','spike-medium/native-layout.json']].map(([enemy,id,file])=>[enemy,id,resolve(out,'..',file)]);
const expected=testDrawings(registry,assets,toLua);
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
assert(artData.poolCapacity==600)
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
local kinds={acid_slime_s=0,spike_slime_s=0};local ids,boxes,drawings,xy={},{},{},{}
for i,actor in ipairs(state.enemies)do
 kinds[actor.definitionId]=assert(kinds[actor.definitionId])+1
 assert(not ids[actor.id]);ids[actor.id]=true
 assert(actor.sourcePosition.x==expected[i][1] and actor.sourcePosition.y==expected[i][2])
 local box=boxFor(actor);local art=box:GetChild('monsterArt')
 assert(not boxes[box] and not drawings[art]);boxes[box]=true;drawings[art]=true
 assert(art.visible and not box:GetChild('portrait').visible)
 xy[i]={box=box,x=box.x,y=box.y,art=art,shapes=assertDrawing(box,actor.definitionId)}
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
print('NATIVE_FORMATION_HOST_PASS source=Lots-of-Slimes acid=2 spike=3 independent=5 idleFrames=120 visible=187 allocatedPerInstance=600 retirement=one')
local medium=battle({'spike_slime_m'})
assertDrawing(boxFor(medium.enemies[1]),'spike_slime_m')
print('MEDIUM_NATIVE_HOST_PASS assets=3 fields=image,rotation,position,size,RGBA_after_pose_tint visibility=exact')
`;
writeFileSync(join(out,'native-fixture.lua'),fixture);
const code='package.path='+JSON.stringify(generated+'/?.lua;'+join(repo,'src/lua/?.lua;'))+'..package.path;dofile('+JSON.stringify(join(out,'native-fixture.lua'))+')';
const r=spawnSync(process.execPath,[join(repo,'node_modules/fengari-node-cli/src/lua-cli.js'),'-e',code],{encoding:'utf8',timeout:120000,maxBuffer:2e6});
writeFileSync(join(out,'native-raw.log'),r.stdout+r.stderr);console.log(r.stdout+r.stderr);assert.equal(r.status,0,String(r.error));
writeFileSync(join(out,'native-report.json'),JSON.stringify({head,pass:true,source:'Lots of Slimes',acid:2,spike:3,scope:'Actual GameUI/Combat/formation/runtime with native mocks; new batch02 art injected into a temporary explicit build input, exact visible primitive fields; not real device or product bindings',poolCapacity:600,fiveActorVisibleShapes:187,fiveActorAllocatedShapeSlots:3000,allVisibleSlotIdentitiesStable:true,newRowsVerified:true,slotsByEnemy:Object.fromEntries(Object.entries(expected).map(([id,slots])=>[id,slots.length])),officialDevice:false},null,2)+'\n');
