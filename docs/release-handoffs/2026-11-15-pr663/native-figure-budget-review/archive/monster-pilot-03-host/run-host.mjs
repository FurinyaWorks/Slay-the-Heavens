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
 for i, prior in ipairs(old)do assert(prior.control==new[i].control and prior.writes==new[i].writes)end
end
local cases=0
local function check(state,label)
 host.run.combat=state;host:refresh()
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
check(source('Cultist'),'Cultist')
check(source('Jaw Worm'),'Jaw Worm')
for _,count in ipairs({2,3})do
 for bits=0,2^count-1 do
  local n=0
  local state=source(count..' Louse',{misc={boolean=function()local v=math.floor(bits/2^n)%2==1;n=n+1;return v end}})
  assert(n==count and #state.enemies==count)
  for i,a in ipairs(state.enemies)do assert(a.definitionId==(math.floor(bits/2^(i-1))%2==1 and 'red_louse' or 'green_louse'))end
  check(state,count..' Louse bits='..bits)
 end
end
local thugs=source('Exordium Thugs',{misc={integer=function()return 0 end,boolean=function()return true end},visualFloat=function()return 0 end})
assert(thugs.enemies[1].definitionId=='red_louse' and thugs.enemies[2].definitionId=='cultist')
check(thugs,'Exordium Thugs: red_louse+cultist')
local fallback=check(battle({'cultist','looter'}),'fixture mixed gallery fallback')
local state=check(battle({'cultist','cultist'}),'fixture double long to short rebind')
local box=boxFor(state.enemies[1]);local tail=box:GetChild('monsterArt'):GetChild('monsterSamples'):GetChild('group001'):GetChild('shape0114')
assert(tail.visible)
local next=battle({'red_louse','green_louse'})
-- battle() retired the prior boxes. For same-surface transition use complete replacement actors with preserved IDs.
state=check(battle({'cultist','cultist'}),'fixture stable pre-rebind')
box=boxFor(state.enemies[1]);tail=box:GetChild('monsterArt'):GetChild('monsterSamples'):GetChild('group001'):GetChild('shape0114')
for i,a in ipairs(state.enemies)do next.enemies[i].id=a.id;next.enemies[i].sourcePosition=a.sourcePosition;state.enemies[i]=next.enemies[i]end
check(state,'fixture same identity shorter rebind')
assert(boxFor(state.enemies[1])==box and not tail.visible)
local survivor=boxFor(state.enemies[2]);state.enemies[1].hp=0;host.battleUI:render()
assert(not surfaces:find(state.enemies[1].id) and not box.alive and survivor==boxFor(state.enemies[2]))
assertDrawing(survivor,'green_louse')
print('RETIREMENT_PASS')
print('BATCH03_HOST_PASS',cases)

`;
writeFileSync(join(out,'stock-pilot-fixture.lua'),fixture);
const code='package.path='+JSON.stringify(generated+'/?.lua;'+join(repo,'src/lua/?.lua;'))+'..package.path;dofile('+JSON.stringify(join(out,'stock-pilot-fixture.lua'))+')';
const r=spawnSync(process.execPath,[join(repo,'node_modules/fengari-node-cli/src/lua-cli.js'),'-e',code],{encoding:'utf8',timeout:120000,maxBuffer:2e6});
writeFileSync(join(out,'stock-pilot-raw.log'),r.stdout+r.stderr);console.log(r.stdout+r.stderr);assert.equal(r.status,0,String(r.error));
writeFileSync(join(out,'stock-pilot-report.json'),JSON.stringify({head,pass:true,scope:'exact Release builder and GameUI native mock; explicit test registry only; not official engine/device',poolCapacity:selected.poolCapacity,priorSlimeOnlyPoolCapacity:41,retainedCatalogCapacity:full.poolCapacity,slotsByEnemy:Object.fromEntries(Object.entries(expected).map(([id,slots])=>[id,slots.length])),templateControls:Number(r.stdout.match(/TEMPLATE_CONTROLS\s+(\d+)/)[1]),cases:r.stdout.split('\n').filter(l=>l.startsWith('CASE_PASS')).map(l=>{const [,name,count,visible,reserved]=l.split('\t');return {name,actors:Number(count),visibleShapes:Number(visible),reservedShapes:Number(reserved)}}),inputHashes:Object.fromEntries([...assets.map(([enemy,,p])=>[enemy,p]),['acid_slime_m',acidPath]].map(([id,p])=>[id,createHash('sha256').update(readFileSync(p)).digest('hex')])),officialDevice:false},null,2)+'\n');
