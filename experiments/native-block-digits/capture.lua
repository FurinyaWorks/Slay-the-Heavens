local F=dofile('tests/lua/support/game_ui_fixture.lua')
local V=dofile('scripts/official-assets-preview.lua')
local Run=require('abyss_run')
local Enemy=require('abyss_battle_enemy_view')
local host,root=F.fixture()
assert(F.start(host));assert(Run.startCombat(host.run,'cultist_solo'))
local panel=root:GetChild('battlePanel')
local manager=assert(require('abyss_monster_surfaces').get(panel))
local font
for _,spec in ipairs(F.Templates.AbyssMonsterActor.children)do
 if spec.name=='block'then font=spec.text;break end
end
assert(font and font.fontSize==font.minFontSize,'native Block must not shrink to fit')
local failures,checks={},0
local function check(ok,message)
 checks=checks+1;if not ok then failures[#failures+1]=message end
end
local function near(a,b)return math.abs(a-b)<1e-7 end
local function unchanged(rootValue)
 local saved,pending={},{rootValue}
 while #pending>0 do
  local value=table.remove(pending)
  if not saved[value]then
   local values={};saved[value]={values=values,meta=getmetatable(value)}
   for k,v in pairs(value)do
    values[k]=v
    if type(k)=='table'then pending[#pending+1]=k end
    if type(v)=='table'then pending[#pending+1]=v end
   end
  end
 end
 return function()
  for value,prior in pairs(saved)do
   assert(getmetatable(value)==prior.meta,'render changed core metatable')
   for k,v in pairs(prior.values)do assert(value[k]==v,'render changed live core field '..tostring(k))end
   for k,v in pairs(value)do assert(prior.values[k]==v,'render added live core field '..tostring(k))end
  end
 end
end
local function rect(box,part)
 local c=box:GetChild(part)
 return {box.x+c.x,box.y+c.y,c.sizeDeltaX,c.sizeDeltaY}
end
local function clear(a,b)
 return math.abs(a[1]-b[1])+1e-7>=(a[3]+b[3])/2 or math.abs(a[2]-b[2])+1e-7>=(a[4]+b[4])/2
end
local function capture(name)
 V.capture(name,host,root,'actual native monster Block/HP output; other scene layers omitted; explicit digit pressure, not natural acquisition, official or device evidence')
 local function prune(n)
  local kept={}
  for _,child in ipairs(n.children or {})do
   if n.name=='AbyssMonsterActor'then
    if child.name:match('^hp')or child.name:match('^block')then kept[#kept+1]=child end
   elseif child.name=='battlePanel'or child.name=='actorLayer'or child.name:match('^nativeActor')or child.name=='AbyssMonsterActor'or child.name=='actorPage'then
    prune(child);kept[#kept+1]=child
   end
  end
  n.children=kept
 end
 prune(V.scenes[#V.scenes].tree)
end
local function inspect(state,label,neighbours)
 local rows={}
 for _,actor in ipairs(state.enemies)do
  local box=assert(manager:find(actor.id),'actual dynamic actor missing')
  local text,edge,icon=box:GetChild('block'),box:GetChild('blockEdge'),box:GetChild('blockIcon')
  local g=Enemy.geometry(actor)
  check(text.text==tostring(actor.block),label..' exact digits '..actor.id)
  check(text.visible and edge.visible and icon.visible,label..' visible Block '..actor.id)
  check(#text.text*.6*font.fontSize+4<=text.sizeDeltaX+1e-7,label..' clips Block'..actor.block..' width='..text.sizeDeltaX)
  check(text.sizeDeltaY>=font.fontSize*1.45+4,label..' native text line')
  check(near(text.x,icon.x)and near(edge.x,icon.x),label..' chip layers separated')
  check(text.sizeDeltaX<=icon.sizeDeltaX and edge.sizeDeltaX>=icon.sizeDeltaX,label..' text escaped solid chip')
  local hp,fill=box:GetChild('hp'),box:GetChild('hpFill')
  check(near(hp.x,g.healthX)and near(hp.sizeDeltaX,g.hitWidth)and near(fill.x,g.healthX),label..' HP/source geometry moved')
  check(hp.text==actor.hp..'/'..actor.maxHp,label..' HP value changed')
  check(near(box.x,g.x)and near(box.y,g.y),label..' actor source position changed')
  local right=box.x+edge.x+edge.sizeDeltaX/2
  local bar=box:GetChild('hpBorder');local left=box.x+bar.x-bar.sizeDeltaX/2
  check(right+F.Theme.layout.blockBadge.gap<=left+1e-7,label..' Block invades own HP border')
  rows[#rows+1]={box=box,actor=actor}
 end
 if neighbours then for i,a in ipairs(rows)do for j,b in ipairs(rows)do if i~=j then
  for _,part in ipairs({'blockEdge','blockIcon','block'})do
   check(clear(rect(a.box,part),rect(b.box,'hpBorder')),label..' '..part..' covers neighbour HP '..i..'/'..j)
   check(clear(rect(a.box,part),rect(b.box,'blockEdge')),label..' '..part..' covers neighbour Block '..i..'/'..j)
  end
 end end end end
end
-- One through five separately allocated native surfaces; fixed source-space
-- pressure positions are explicit, not a new encounter formation or natural bound.
for count=1,5 do
 local ids={};for i=1,count do ids[i]='acid_slime_s'end
 local state=F.Combat.new(F.Data,{enemies=ids,deck={'strike'},seed=42})
 for i,actor in ipairs(state.enemies)do actor.sourcePosition={x=-690+(i-1)*260,y=0}end
 host.run.combat=state
 for _,value in ipairs({1,10,99,100,999})do
  for _,actor in ipairs(state.enemies)do actor.block=value end
  host:refresh() -- First observation reconciles source display lifecycles.
  local verifyUnchanged=unchanged(state);host.battleUI:render()
  inspect(state,'pressure-'..count..'-'..value,true)
  verifyUnchanged()
 end
 if count==5 then capture('five-native-999')end
 for _,actor in ipairs(state.enemies)do actor.block=0 end
 host:refresh()
 for _,actor in ipairs(state.enemies)do
  local box=assert(manager:find(actor.id))
  for _,part in ipairs({'block','blockIcon','blockEdge'})do check(not box:GetChild(part).visible,'zero Block remains visible')end
 end
end
local boss=F.Combat.new(F.Data,{enemies={'guardian'},deck={'strike'},seed=43})
host.run.combat=boss
for _,value in ipairs({1,10,99,100,999})do
 boss.enemies[1].block=value;host:refresh();inspect(boss,'boss-'..value,true)
end
capture('boss-native-999')
-- Real constructor-generated encounter geometry, with explicit Block injection.
-- This tests actual formation spacing, not natural Block acquisition.
for _,encounter in ipairs({'Lots of Slimes','Gremlin Gang'})do
 local boundary={misc={integer=function()return 0 end,boolean=function()return false end},visualFloat=function()return 0 end}
 local state=F.Combat.new(F.Data,{deck={'strike'},seed=42,sourceEncounter=encounter,encounterBoundary=boundary})
 host.run.combat=state
 for _,value in ipairs({1,10})do
  for _,actor in ipairs(state.enemies)do actor.block=value end
  host:refresh();inspect(state,encounter..'-'..value,true)
 end
 capture(encounter..'-native-10')
end
V.print()
assert(#failures==0,table.concat(failures,'\n'))
print('NATIVE_BLOCK_DIGITS_PASS '..checks)
