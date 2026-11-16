import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync,execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {testDrawings,rowsToSlots} from './native-registry-probe.mjs';
const out=fileURLToPath(new URL('.',import.meta.url)), repo=process.env.RELEASE_REPO?resolve(process.env.RELEASE_REPO):resolve(out,'../batch02/exact-release');process.chdir(repo);
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();assert.equal(head,'33d71575c5f186a1b54f7bf3e4f1826c145aa1d9');
const {prepareMonsterArt}=await import(pathToFileURL(join(repo,'scripts/monster-art.mjs')));
const {buildUI}=await import(pathToFileURL(join(repo,'scripts/build-ui.mjs')));
const {buildLuaData,toLua}=await import(pathToFileURL(join(repo,'scripts/build-lua-data.mjs')));
const generated=join(out,'stock-pilot-build');mkdirSync(generated,{recursive:true});
const registry=JSON.parse(readFileSync('data/presentation/native-monster-art.json','utf8'));
const assets=['cultist','jaw_worm','red_louse','green_louse'].map(enemy=>[enemy,'batch03-'+enemy.replaceAll('_','-'),join(process.env.BATCH03_DIR?resolve(process.env.BATCH03_DIR):resolve(out,'../batch03/final-stage'),enemy.replaceAll('_','-'),'native-layout.json')]);
const fourth=process.env.BATCH04_DIR?resolve(process.env.BATCH04_DIR):resolve(out,'../wake0614-portable/monster-pilot-04');
assets.push(...[['looter','looter'],['fungi_beast','fungi-beast']].map(([enemy,dir])=>[enemy,'batch04-'+dir,join(fourth,dir,'native-layout.json')]));
const expected=testDrawings(registry,assets,toLua);
const acidPath=process.env.ACID_MEDIUM_LAYOUT??resolve(out,'../acid-medium-compat/native-layout.json');
registry.asset.slots=rowsToSlots(JSON.parse(readFileSync(acidPath)),106);
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
assert(artData.poolCapacity==115)
local function child(spec,name)
 for _,v in ipairs(spec.children)do if v.name==name then return v end end
 error(name)
end
local poolSpec=child(child(require('abyss_ui_templates').AbyssMonsterActor,'monsterArt'),'monsterSamples')
local function nodeCount(n)local v=1;for _,c in ipairs(n.children or {})do v=v+nodeCount(c)end;return v end
print('TEMPLATE_CONTROLS',nodeCount(require('abyss_ui_templates').AbyssMonsterActor))
local allocated=0;for _,entry in ipairs(poolSpec.children)do allocated=allocated+#entry.children end
assert(allocated==artData.poolCapacity)
local function assertDrawing(box,id)
 local art=box:GetChild('monsterArt')
 local pool=art:GetChild('monsterSamples')
 local group=pool:GetChild('group000')
 local snapshots={}
 for j,slot in ipairs(expectedSlots[id])do
  local c=pool:GetChild(string.format('group%03d',math.floor((j-1)/60))):GetChild(string.format('shape%04d',j-1))
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
 for i, prior in ipairs(old)do assert(prior.control==new[i].control,'control identity changed '..i);assert(prior.writes==new[i].writes,'rotation writes changed '..i..': '..prior.writes..' -> '..new[i].writes)end
end
local cases=0
local function check(state,label)
 host.run.combat=state;host:refresh();host:update(1/60) -- settle one frame of room replacement invalidation before idle measurements
 local before={};local visible=0
 for i,actor in ipairs(state.enemies)do
  local box=boxFor(actor)
  if expectedSlots[actor.definitionId] then
   assert(box:GetChild('monsterArt').visible and not box:GetChild('portrait').visible)
   before[i]=assertDrawing(box,actor.definitionId);visible=visible+#before[i]
  else assert(box:GetChild('portrait').visible and not box:GetChild('monsterArt').visible)end
 end
 for i=1,120 do host:update(1/60)end
 for i,actor in ipairs(state.enemies)do if before[i] then checkStable(before[i],assertDrawing(boxFor(actor),actor.definitionId))end end
 cases=cases+1
 print('CASE_PASS',label,#state.enemies,visible,#state.enemies*allocated)
 return state
end
local function source(name,boundary)
 local resolved=assert(require('abyss_room_encounters').resolve(name,'normal'))
 local options={deck={'strike','strike','defend'},seed=11,sourceEncounter=resolved.sourceEncounter,encounterBoundary=boundary,enemies=resolved.enemies}
 return F.Combat.new(F.Data,options)
end
local looter=check(source('Looter'),'Looter real room')
assert(#looter.enemies==1 and looter.enemies[1].definitionId=='looter')
local state=check(source('2 Fungi Beasts'),'2 Fungi Beasts real room')
assert(#state.enemies==2 and state.enemies[1].definitionId=='fungi_beast' and state.enemies[2].definitionId=='fungi_beast')
local a,b=boxFor(state.enemies[1]),boxFor(state.enemies[2])
assert(a~=b and a:GetChild('monsterArt')~=b:GetChild('monsterArt'),'each actor owns independent drawing')
local info={}
for _,name in ipairs({'hit','hp','intent','statusRow'})do
 local c=b:GetChild(name);info[name]={c,c.x,c.y,c.sizeDeltaX,c.sizeDeltaY}
end
for i=1,120 do host:update(1/60)end
for name,v in pairs(info)do local c=b:GetChild(name);assert(c==v[1] and c.x==v[2] and c.y==v[3] and c.sizeDeltaX==v[4] and c.sizeDeltaY==v[5],'HUD/input geometry changed '..name)end
print('HUD_IDENTITY_PASS')
local strike
for slot,card in ipairs(state.hand)do if card.cardId=='strike' then strike=slot;break end end
assert(strike)
local hp=state.enemies[2].hp;local otherHp=state.enemies[1].hp
panel:GetChild('card'..strike):GetChild('hit').click();b:GetChild('hit').click()
assert(state.enemies[2].hp<hp and state.enemies[1].hp==otherHp,'real target click must damage second actor only')
for i=1,200 do host:update(.05);if not host.battleUI.busy then break end end
assert(not host.battleUI.busy)
assert(boxFor(state.enemies[2])==b,'target hit preserved actor root')
assertDrawing(b,'fungi_beast')
print('TARGET_INPUT_PASS')
local x,y=b.x,b.y
state.enemies[1].hp=0;host.battleUI:render()
assert(not surfaces:find(state.enemies[1].id) and not a.alive)
assert(boxFor(state.enemies[2])==b and b.x==x and b.y==y,'single render preserves surviving drawing and coordinates')
assertDrawing(b,'fungi_beast')
print('RETIREMENT_PASS')
local priorArt=b:GetChild('monsterArt')
host.battleUI:setActive(false);assert(not b.alive and not priorArt.alive,'unmount destroys owned surfaces')
host.battleUI:setActive(true);b=boxFor(state.enemies[2]);assertDrawing(b,'fungi_beast')
print('MOUNT_PASS')
local next=check(source('Looter'),'Looter after fungi room replacement')
assert(not b.alive and boxFor(next.enemies[1])~=b,'new room owns fresh actor surface')
print('BATCH04_HOST_PASS',cases)

`;
writeFileSync(join(out,'stock-pilot-fixture.lua'),fixture);
const code='package.path='+JSON.stringify(generated+'/?.lua;'+join(repo,'src/lua/?.lua;'))+'..package.path;dofile('+JSON.stringify(join(out,'stock-pilot-fixture.lua'))+')';
const r=spawnSync(process.execPath,[join(repo,'node_modules/fengari-node-cli/src/lua-cli.js'),'-e',code],{encoding:'utf8',timeout:120000,maxBuffer:2e6});
writeFileSync(join(out,'stock-pilot-raw.log'),r.stdout+r.stderr);console.log(r.stdout+r.stderr);assert.equal(r.status,0,String(r.error));
writeFileSync(join(out,'stock-pilot-report.json'),JSON.stringify({head,pass:true,scope:'exact Release builder and GameUI native mock; explicit test registry only; not official engine/device',poolCapacity:selected.poolCapacity,priorSlimeOnlyPoolCapacity:41,priorBatch03PoolCapacity:115,retainedCatalogCapacity:full.poolCapacity,slotsByEnemy:Object.fromEntries(Object.entries(expected).map(([id,slots])=>[id,slots.length])),templateControls:Number(r.stdout.match(/TEMPLATE_CONTROLS\s+(\d+)/)[1]),cases:r.stdout.split('\n').filter(l=>l.startsWith('CASE_PASS')).map(l=>{const [,name,count,visible,reserved]=l.split('\t');return {name,actors:Number(count),visibleShapes:Number(visible),reservedShapes:Number(reserved)}}),inputHashes:Object.fromEntries([...assets.map(([enemy,,p])=>[enemy,p]),['acid_slime_m',acidPath]].map(([id,p])=>[id,createHash('sha256').update(readFileSync(p)).digest('hex')])),checks:{hudIdentity:r.stdout.includes('HUD_IDENTITY_PASS'),targetInput:r.stdout.includes('TARGET_INPUT_PASS'),retirement:r.stdout.includes('RETIREMENT_PASS'),mount:r.stdout.includes('MOUNT_PASS'),roomCases:3,idleFramesPerCase:120,settlingFramesPerCase:1},officialDevice:false},null,2)+'\n');
