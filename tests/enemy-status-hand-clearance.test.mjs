import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readdirSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import './helpers/mobile-composite-intent.cases.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);

test('refined Release keeps resting cards and their receivers clear of Guardian powers and legal encounters',t=>{
 const base=resolve('.artifacts/test-tmp');mkdirSync(base,{recursive:true});
 const out=mkdtempSync(join(base,'refined-status-clearance-'));t.after(()=>rmSync(out,{recursive:true,force:true}));
 buildLuaData('data',join(out,'abyss_data.lua'));
 buildUI(out,undefined,{officialAssets:true,refinedReleaseMonsterArt:true,nativePageLifecycle:true,experimentalCharacters:false});
 const lua=require.resolve('fengari-node-cli/src/lua-cli.js');
 const path=out.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;';
 const env={...process.env,LUA_PATH:path,LUA_PATH_5_3:path,LUA_INIT:'',LUA_INIT_5_3:''};
 for(const [fixture,marker] of [
  ['release_guardian_clearance','RELEASE_GUARDIAN_CLEARANCE_PASS'],
  ['release_enemy_clearance_matrix','RELEASE_ENEMY_CLEARANCE_MATRIX_PASS'],
 ]){
  const result=spawnSync(process.execPath,[lua,'-e',`dofile('tests/lua/support/${fixture}.lua')`],{env,encoding:'utf8',timeout:60_000});
  assert.ifError(result.error);
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.ok(result.stdout.includes(marker),result.stdout);
  t.diagnostic(result.stdout.split('\n').filter(line=>line.startsWith('GUARDIAN_CLEARANCE ')||line.includes(marker)).join('\n'));
 }
});

test('real official enemy writer keeps two complete power rows above every resting hand and fits tall bodies/targets below HUD',t=>{
 const base=resolve('.artifacts/test-tmp');mkdirSync(base,{recursive:true});
 const out=mkdtempSync(join(base,'enemy-status-clearance-'));t.after(()=>rmSync(out,{recursive:true,force:true}));
 buildLuaData('data',join(out,'abyss_data.lua'));buildUI(out,undefined,{officialAssets:true});
 const preloads=readdirSync(out).filter(n=>n.endsWith('.lua')).map(n=>
  `package.preload[${luaString(n.slice(0,-4))}]=assert(loadfile(${luaString(join(out,n).replaceAll('\\','/'))}))`).join('\n');
 const source=`package.path='src/lua/?.lua;tests/lua/?.lua;'..package.path
${preloads}
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Theme=require('abyss_theme');local E=require('abyss_battle_enemy_view')
local A=require('abyss_actor');local C=require('abyss_combat')
local touch=false;local px,py
local cursor={CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up'}
local host,root=F.fixture(nil,nil,nil,cursor,nil,nil,{position=function()return px,py end,touchScreen=function()return touch end})
assert(F.start(host))
local panel=root:GetChild('battlePanel');local maxRest=-math.huge
local function top(card)
 local a=math.abs(card.localRotationZ)*math.pi/180
 return card.y+(Theme.layout.card.size[2]*math.cos(a)+Theme.layout.card.size[1]*math.sin(a))/2*(card.scale and card.scale[2]or 1)
end
local function fresh(ids,n,powers,sourceEncounter)
 local state=C.new(F.Data,{enemies=ids,deck={'strike'},seed=42,sourceEncounter=sourceEncounter,
  encounterBoundary={misc={integer=function(lo)return lo end,boolean=function()return false end},visualFloat=function(lo)return lo end}})
 state.hand={};for i=1,n do state.hand[i]={uid=100+i,cardId='strike',upgraded=false}end
 for _,actor in ipairs(state.enemies)do for _,id in ipairs(powers or{})do A.addStatus(actor,id,99-(actor.statuses[id]or 0))end end
 host.run.phase='combat';host.run.combat=state;host:refresh();host:update(.8)
 return state
end
for n=1,F.Data.rules.player.maxHand do
 fresh({'acid_slime_l'},n)
 for i=1,n do maxRest=math.max(maxRest,top(panel:GetChild('card'..i)))end
end
assert(math.abs(maxRest-(-164.77154281290242))<.00001,'actual resting fan boundary drifted')
local target=require('abyss_battle_targeting').install({feedback={}},nil,{}, {aimReady=function()return true end})
local powers={'strength','weak','vulnerable','artifact','metallicize','thorns','ritual'}
for _,part in ipairs(F.Templates.AbyssMonsterPower.children)do
 if part.name=='count'then assert(part.text.fontSize==Theme.font.small,'imported power font differs')end
end
local function openReader(hit,actor)
 if touch then
  local event={touchId=90}
  hit.listeners.down(event);hit.listeners.up(event);hit.listeners.click(event)
 else
  hit.listeners.click()
  assert(not host.battleUI.info,'a bare desktop click must not open a reader')
  hit.listeners.enter()
 end
 local info=assert(host.battleUI.info,'native reader did not open')
 assert(info.source==hit and info.actor==actor and info.transient==not touch,'native reader lost its input owner')
 return info
end
local function closeReader(hit)
 if touch then panel:GetChild('statusDismiss').click({touchId=91}) else hit.listeners.exit() end
 assert(not host.battleUI.info and not panel:GetChild('statusInfo').visible,'native reader stayed open after dismissal')
end
local function readerText(info)
 local text={}
 local status=panel:GetChild('statusInfo')
 local tips=status:GetChild('powerTips')
 for page=1,info.pages do
  if page>1 then info.page=page;host.battleUI:renderDetailsOnly()end
  assert(status.visible and tips.visible,'status content is not visible')
  for i=1,Theme.layout.powerTips.rows do
   local tip=tips:GetChild('tip'..i)
   if tip.visible then text[#text+1]=tip:GetChild('copy').text end
  end
 end
 return table.concat(text,'\\n')
end
local function check(state,expectedRows)
 local manager=require('abyss_monster_surfaces').get(panel)
 local previous
 for index,actor in ipairs(state.enemies)do
  local box=assert(manager:find(actor.id));local g=E.geometry(actor)
  local hp=box:GetChild('hp');assert(box.y+hp.y-hp.sizeDeltaY/2>=maxRest+8,'HP text enters resting hand')
  local portrait,hpBorder=box:GetChild('portrait'),box:GetChild('hpBorder')
  local feet=portrait.y-portrait.sizeDeltaY/2
  assert(hpBorder.y+hpBorder.sizeDeltaY/2<feet,'HP bar overlaps portrait: '..actor.definitionId)
  assert(hp.y+Theme.font.small/2<feet,'HP digits overlap portrait: '..actor.definitionId)
  if actor.block>0 then
   local fill,block=box:GetChild('hpFill'),box:GetChild('blockIcon')
   assert(block.visible and block.x<fill.x-fill.sizeDeltaX/2,'block must stay left of HP')
   assert(math.abs(block.y-fill.y-4*g.sourceScale)<.00001,'block must move with HP')
  end
  local intent=box:GetChild('intent')
  local hud=Theme.officialAssets.battleHud
  assert(box.y+intent.y+intent.sizeDeltaY/2<=hud.y-hud.height/2-Theme.space.s+.00001,'tall actor intent enters HUD')
  assert(g.y+g.portrait/2<box.y+intent.y-intent.sizeDeltaY/2,'tall portrait overlaps intent')
  assert(math.abs(box:GetChild('hit').sizeDeltaY-g.hitHeight)<.00001,'render and target dimensions disagree')
  local valid,chosen=target.potionDragTarget({x=g.hitX,y=g.hitY,battle=state})
  assert(valid and chosen==index,'shared targeting geometry cannot reach actual actor')
  local pool=assert(require('abyss_monster_power_surfaces').get(box:GetChild('statusRow')))
  local rows={};local bounds
  pool:each(function(chip,_,entry)
   if not chip.visible then assert(entry.hidden,'hidden chip must retain its source entry');return end
   local icon,count,hit=chip:GetChild('icon'),chip:GetChild('count'),chip:GetChild('hit')
   local bottom=box.y+chip.y+icon.y-icon.sizeDeltaY/2
   if count.visible then bottom=math.min(bottom,box.y+chip.y+count.y+count.sizeDeltaY/2-Theme.font.small*1.2)end
   assert(bottom>=maxRest+8-.00001,'complete power/count line enters resting hand: '..actor.definitionId..'/'..entry.id)
   assert(count.fontSize==nil or count.fontSize==Theme.font.small,'layout must not shrink imported power text')
   assert(box.y+chip.y+icon.sizeDeltaY/2<=box.y+g.healthY-g.healthHeight/2-4,'power overlaps HP')
   rows[chip.y]=true
   local left=box.x+chip.x-icon.sizeDeltaX/2
   local right=box.x+chip.x+icon.sizeDeltaX/2
   if count.visible then left=math.min(left,box.x+chip.x+count.x-count.sizeDeltaX/2);right=math.max(right,box.x+chip.x+count.x+count.sizeDeltaX/2)end
   bounds=bounds or {left=left,right=right};bounds.left=math.min(bounds.left,left);bounds.right=math.max(bounds.right,right)
   if entry.id=='strength' then
    assert(openReader(hit,actor).statusId=='strength','power detail lost native identity')
    closeReader(hit)
   end
   if entry.status.overflow then
    local entries=A.statusView(actor);local layout=E.powerLayout(g,touch)
    local firstHidden=layout.columns*layout.rows
    assert(count.text=='+'..(#entries-firstHidden+1),'more count omitted a real status')
    local info=openReader(hit,actor)
    assert(not info.statusId and info.offset==firstHidden,'more must start at the first overflowed status')
    local more=readerText(info)
    for i,status in ipairs(entries)do
     assert(pool:find(status.id),'overflow removed native source membership')
     if i>=firstHidden then assert(more:find(status.name,1,true),'overflow detail lost '..status.id)end
    end
    closeReader(hit)
    local overview=box:GetChild('hpHit')
    info=openReader(overview,actor)
    assert(not info.statusId and not info.offset,'HP must open the complete status overview')
    local all=readerText(info)
    for _,status in ipairs(entries)do assert(all:find(status.name,1,true),'complete status detail lost '..status.id)end
    closeReader(overview)
   end
  end)
  local n=0;for _ in pairs(rows)do n=n+1 end
  if expectedRows==2 then
   assert(n==2,'long power list must use two bounded rows: '..actor.definitionId..' at '..(g.y+g.healthY))
  end
  if expectedRows==1 then
   assert(n==1 and pool:find('@more').visible,'low enemy must keep its overflow above the hand')
  end
  if previous and bounds then assert(bounds.left>previous.right,'adjacent actors power rows overlap')end
  previous=bounds
  px,py=640+g.hitX,360+g.hitY;host:update(.001)
  assert(box:GetChild('name').fontColor.a==255,'moved actor hover name lost hit geometry')
  px,py=nil,nil
 end
end
for _,mobile in ipairs({false,true})do
 touch=mobile
 check(fresh({'acid_slime_s'},10,{'weak','vulnerable','poison'}),2)
 check(fresh({'acid_slime_s'},10,powers),2)
 check(fresh(nil,10,{'weak','vulnerable','poison','strength','artifact'},'Lots of Slimes'),2)
 check(fresh({'acid_slime_l'},10,powers),2)
 check(fresh({'spike_slime_l'},10,powers),2)
 for _,id in ipairs({'hexaghost','collector','guardian','champ'})do check(fresh({id},10))end
 local guardian=fresh({'guardian'},10,powers)
 guardian.enemies[1].aiPhase='defense';guardian.enemies[1].block=20
 host:refresh();check(guardian,1)
 local multi=fresh({'sentry','sentry','sentry'},10,{'strength','weak','vulnerable','artifact'})
 for i,actor in ipairs(multi.enemies)do actor.sourcePosition={x=-330+(i-1)*225,y=25}end
 host:refresh();check(multi,2)
 -- Hover cards may rise over the lower lane, as in STS, but neither the actor
 -- nor status positions follow hover/target selection or change source actors.
 local actor=multi.enemies[1];local before=E.geometry(actor)
 local card=panel:GetChild('card1');px,py=640+card.x,360+card.y
 host.battleUI:setHover(1);host:update(.5)
 local after=E.geometry(actor);assert(after.x==before.x and after.y==before.y and after.hitY==before.hitY,'card hover moved target geometry')
 if not mobile then assert(top(panel:GetChild('card1'))>maxRest,'hover contract did not exercise the raised hand')end
 assert(actor.sourcePosition.x==-330 and actor.hp==actor.maxHp,'presentation changed source actor or HP')
 host.battleUI:setHover(nil);px,py=nil,nil
end
host:disable();print('ENEMY_STATUS_CLEARANCE_PASS')
`;
 const script=join(out,'probe.lua');writeFileSync(script,source);
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),script],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/ENEMY_STATUS_CLEARANCE_PASS/,result.stdout+result.stderr);
 const enemySource=readFileSync('src/lua/abyss_battle_enemy_view.lua','utf8');
 const controls=[
  ['old-floor',"E.floorY=330\n",/HP text enters resting hand|power\/count line enters resting hand/],
  ['old-status-placement',`package.preload.abyss_battle_enemy_view=assert(load(${luaString(enemySource.replace("if Theme.presentationProfile=='official-assets-first' then","if false then"))}))\n`,/long power list must use two bounded rows/],
  ['unfitted-tall-body',`package.preload.abyss_battle_enemy_view=assert(load(${luaString(enemySource.replace('local bodyScale=presentationScale(source,bottom,sy)','local bodyScale=sy'))}))\n`,/tall actor intent enters HUD/],
 ];
 for(const [name,injection,expected]of controls){
  const marker=name==='old-floor'?'local touch=false;':'local F=dofile';
  const mutant=source.replace(marker,injection+marker).replace('for n=1,F.Data.rules.player.maxHand do','for n=F.Data.rules.player.maxHand,F.Data.rules.player.maxHand do');
  const path=join(out,name+'.lua');writeFileSync(path,mutant);
  const killed=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),path],{encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});
  assert(!killed.error,String(killed.error));assert.doesNotMatch(killed.stdout,/ENEMY_STATUS_CLEARANCE_PASS/,name+' rollback survived');
  assert.match(killed.stdout+killed.stderr,expected,name+' did not fail its intended product boundary');
 }
});
