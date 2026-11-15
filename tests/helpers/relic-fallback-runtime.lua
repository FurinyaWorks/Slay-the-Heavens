-- Same-item fallback after successful paint, through real Host/view owners.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Map,Nodes=require('abyss_run'),require('abyss_map'),require('abyss_nodes')
local Relics=require('abyss_relic_view_ui')
local host,root=F.fixture();assert(F.start(host))
local run,map=Run.new(F.Data,42),Map.generate(F.Data,42)
while not run.nodeFlow do
 local available=Map.available(map);assert(#available>0)
 for _,node in ipairs(available)do if node.type=='shop'then assert(Nodes.enter(run,map,node.id));break end end
 if not run.nodeFlow then assert(Map.choose(map,available[1].id))end
end
host.run,host.map=run,map;host.nodeUI.run,host.nodeUI.map=run,map
local shopIcon=root:GetChild('nodePanel'):GetChild('shopView'):GetChild('relic1'):GetChild('icon')
local platform={imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
local viewRoot=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local panel=viewRoot:GetChild('relicPanel')
local view=Relics.new(panel,viewRoot:GetChild('relicBar'),'click',platform,function()return ''end,function()end,function()end,'map')
local ids={'calling_bell','old_coin'} -- original88 / added33
local passed,failed=0,{}
local function test(label,body)
 local ok,why=pcall(body)
 if ok then passed=passed+1 else failed[#failed+1]=label..': '..tostring(why);print('RELIC_FALLBACK_FAIL '..failed[#failed])end
end
local function pool(icon)return icon.parent:GetChild(icon.name..'Art')end
local function painted(icon,id)
 assert(pool(icon).visible and not icon.visible,'semantic art '..id)
 local asset=F.Theme.lowCostArt.relic.assets[id]
 for i=0,15 do assert(pool(icon):GetChild('shape'..i).visible==(i<#asset.shapes),'stale shape '..id)end
end
local function fallback(icon,id)
 assert(icon.visible and icon.imageId==Relics.icon(id,true),'native fallback '..id)
end
local function exercise(surface,icon,refresh)
 for _,id in ipairs(ids)do for _,mode in ipairs({'missing','dead','throw'})do
  refresh(id);painted(icon,id)
  local parent,name=icon.parent,icon.name..'Art'
  local original,get=parent.children[name],parent.GetChild
  if mode=='missing'then parent.children[name]=nil
  elseif mode=='dead'then parent.children[name]={alive=false}
  else parent.GetChild=function(self,key)if key==name then error('injected unavailable pool')end;return get(self,key)end end
  test(surface..' '..id..' '..mode,function()
   refresh(id);fallback(icon,id) -- same item after its successful art hid the image
   local other=id==ids[1]and ids[2]or ids[1]
   refresh(other);fallback(icon,other) -- changed item must not keep the old image
   refresh('unknown_relic');fallback(icon,'unknown_relic')
  end)
  parent.children[name],parent.GetChild=original,get
  refresh(id);painted(icon,id) -- explicit available owner recovers without reset
 end end
 refresh('unknown_relic');fallback(icon,'unknown_relic');assert(not pool(icon).visible,'unknown clears cached art')
 refresh(ids[2]);painted(icon,ids[2])
end
exercise('shop',shopIcon,function(id)run.nodeFlow.relics[1].id=id;host:refresh()end)
run.relics={ids[1]};assert(view:open(run,1))
exercise('single',panel:GetChild('single'):GetChild('icon'),function(id)run.relics={id};view:render()end)
assert(view:close());assert(view:open(run))
exercise('list',panel:GetChild('row1'):GetChild('slot'):GetChild('icon'),function(id)run.relics={id};view:render()end)
assert(view:close());assert(view:open(run,1));painted(panel:GetChild('single'):GetChild('icon'),ids[2])
-- The shared node owner also draws the existing one-row treasure reward.
local treasureRun,treasureMap=Run.new(F.Data,42),Map.generate(F.Data,42)
while not treasureRun.nodeFlow do
 local available=Map.available(treasureMap);assert(#available>0)
 for _,node in ipairs(available)do if node.type=='treasure'then assert(Nodes.enter(treasureRun,treasureMap,node.id));break end end
 if not treasureRun.nodeFlow then assert(Map.choose(treasureMap,available[1].id))end
end
assert(Nodes.openTreasure(treasureRun))
local nodeUI=require('abyss_node_ui').new(viewRoot:GetChild('nodePanel'),treasureRun,treasureMap,F.Presentation,'click',nil,platform)
nodeUI:setVisible(true)
local treasureIcon=viewRoot:GetChild('nodePanel'):GetChild('treasureView'):GetChild('reward'):GetChild('icon')
local treasureItem=assert(treasureRun.nodeFlow.reward.items[1])
local function treasureRefresh(id)
 treasureItem.kind='relic';treasureItem.id=id;treasureItem.available=true
 nodeUI.treasureChoice=1;nodeUI:render()
end
exercise('treasure',treasureIcon,treasureRefresh)
local treasurePool=pool(treasureIcon)
treasureIcon.parent.children.iconArt=nil
-- Non-relic rewards already write their own gold image before relic cleanup.
-- A lost semantic pool must not leave that new fallback hidden.
test('treasure relic to gold without pool',function()
 treasureItem.kind='gold';treasureItem.id=nil;treasureItem.amount=23;nodeUI:render()
 local gold=F.Theme.icon.gold;gold=type(gold)=='table'and gold.id or gold
 assert(treasureIcon.visible and treasureIcon.imageId==gold,'gold fallback after missing relic pool')
end)
treasureIcon.parent.children.iconArt=treasurePool;treasureRefresh(ids[2]);painted(treasureIcon,ids[2])
print('RELIC_FALLBACK_CASES '..passed..' '..#failed)
assert(#failed==0,table.concat(failed,'; '))
assert(passed==25,'complete four-surface failure matrix and gold boundary')
print('RELIC_FALLBACK_RUNTIME_PASS 4_SURFACES 2_SETS 3_FAILURES')
