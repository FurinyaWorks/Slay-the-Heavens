local F=dofile('tests/lua/support/game_ui_fixture.lua')
local S=dofile('tests/lua/support/ui_readability_snapshot.lua')
local V=dofile('scripts/official-assets-preview.lua')
local Run=require('abyss_run')
local Hints=require('abyss_node_resource_hints')
local cursor={CursorEnter='enter',CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local readoutScenes={}
local function unchanged(roots)
 local saved,pending={}, {roots}
 while #pending>0 do
  local value=table.remove(pending)
  if not saved[value]then
   local values={};saved[value]={values=values,meta=getmetatable(value)}
   for k,v in pairs(value)do values[k]=v;if type(k)=='table'then pending[#pending+1]=k end;if type(v)=='table'then pending[#pending+1]=v end end
  end
 end
 return function()
  for value,prior in pairs(saved)do
   assert(getmetatable(value)==prior.meta,'readout changed core metatable')
   for k,v in pairs(prior.values)do assert(value[k]==v,'readout changed core '..tostring(k))end
   for k,v in pairs(value)do assert(prior.values[k]==v,'readout added core '..tostring(k))end
  end
 end
end
assert(F.Theme.presentationProfile=='official-assets-first','must exercise final official projection')
local function setup()
 local ui,root=F.fixture(nil,nil,nil,cursor);Hints.attach(ui,root,'click',cursor);assert(F.start(ui,'ironclad'))
 assert(Run.obtainRelic(ui.run,'Potion Belt'))
 for _,id in ipairs({'fire_potion','block_potion','regen_potion','energy_potion','strength_potion'})do assert(Run.obtainPotion(ui.run,id))end
 ui.run.hp,ui.run.maxHp,ui.run.gold=9999,9999,999999
 ui:refresh();return ui,root
end
local function fullValue(ui,root,panel,kind,value)
 local hit=root:GetChild(panel):GetChild('resourceHints'):GetChild(kind):GetChild('hit')
 if hit.listeners.down then hit.listeners.down({touchId=31});hit.listeners.up({touchId=31})end
 assert(hit.click({touchId=31}))
 local text=table.concat(ui.deckUI.detailPages,''):gsub('\n','')
 assert(text:find(value,1,true),'complete readout dropped exact large resource')
 local name='official-'..panel:gsub('Panel','')..'-full-'..kind
 if not readoutScenes[name]then
  V.capture(name,ui,root,'actual existing DeckUI exact-value surface; explicit large-number stress, not natural resources; export scope is complete DeckUI subtree, background omitted')
  local scene=V.scenes[#V.scenes]
  for _,child in ipairs(scene.tree.children)do if child.name=='deckPanel'then scene.tree.children={child};break end end
  readoutScenes[name]=true
 end
 assert(ui:closeDeck())
end
local ui,root=setup()
S.capture('official-map-pressure',root,F.Layout,{stress=true,natural=false})
V.capture('official-map-pressure',ui,root,'explicit resource pressure, not natural acquisition or device rendering')
ui.run.gold=1234567890123;ui:refresh()
fullValue(ui,root,'mapPanel','gold','1234567890123')
ui.run.hp,ui.run.maxHp=1234567890,1234567890;ui:refresh()
fullValue(ui,root,'mapPanel','hp','1234567890/1234567890')
ui.run.hp,ui.run.maxHp,ui.run.gold=9999,9999,999999
assert(Run.startCombat(ui.run,'cultist_solo'));ui:refresh()
S.capture('official-battle-pressure',root,F.Layout,{stress=true,natural=false})
V.capture('official-battle-pressure',ui,root,'real current combat owner + five potions, explicit numeric pressure only')
ui.run.combat.player.gold,ui.run.gold=1234567890123,1234567890123;ui:refresh()
assert(root:GetChild('battlePanel'):GetChild('piles').text=='1234567890123','HUD silently compacted exact gold')
fullValue(ui,root,'battlePanel','gold','1234567890123')
local nodeUi,nodeRoot=setup()
local Routes=dofile('tests/lua/support/map_routes.lua');local Map=require('abyss_map')
local path=Routes.to(nodeUi.map,function(node)return node.type=='shop'end)
for i=1,#path-1 do assert(Map.choose(nodeUi.map,path[i]))end
nodeUi:refresh();assert(nodeUi.mapUI:choose(path[#path]))
S.capture('official-node-pressure',nodeRoot,F.Layout,{stress=true,natural=false})
V.capture('official-node-pressure',nodeUi,nodeRoot,'component shop reached via connected route; prior room resolution skipped, not natural playthrough')
nodeUi.run.gold=1234567890123;nodeUi.run.hp,nodeUi.run.maxHp=1234567890,1234567890;nodeUi:refresh()
local before={gold=nodeUi.run.gold,hp=nodeUi.run.hp,maxHp=nodeUi.run.maxHp,potions=Run.potionCount(nodeUi.run)}
local Random=require('abyss_sts_random');local savedRandom={}
for key,value in pairs(Random)do if type(value)=='function'then
 savedRandom[key]=value;Random[key]=function()error('node readout consumed core RNG '..key)end
end end
fullValue(nodeUi,nodeRoot,'nodePanel','gold','1234567890123')
fullValue(nodeUi,nodeRoot,'nodePanel','hp','1234567890/1234567890')
assert(nodeUi.nodeUI:press('shopView/card1'))
local confirmation=nodeRoot:GetChild('nodePanel'):GetChild('confirm'):GetChild('hit')
assert(nodeRoot:GetChild('nodePanel'):GetChild('confirm'):GetChild('label').text:find('购买',1,true),'test must retain a real pending shop purchase')
confirmation.listeners.down({touchId=37});confirmation.listeners.up({touchId=37})
local verifyUnchanged=unchanged({run=nodeUi.run,map=nodeUi.map})
fullValue(nodeUi,nodeRoot,'nodePanel','hp','1234567890/1234567890')
assert(not confirmation.click({touchId=37}),'old shop confirmation crossed full resource readout')
verifyUnchanged()
for key,value in pairs(before)do
 local current=key=='potions' and Run.potionCount(nodeUi.run) or nodeUi.run[key]
 assert(current==value,'node readout changed resource '..key)
end
local node=nodeRoot:GetChild('nodePanel');local oldHints=node:GetChild('resourceHints')
local goldHit=oldHints:GetChild('gold'):GetChild('hit')
goldHit.listeners.down({touchId=32});goldHit.listeners.up({touchId=32})
assert(nodeUi:openMenu());assert(nodeUi:closeExit())
assert(not goldHit.click({touchId=32}),'old node resource touch crossed menu')
goldHit.listeners.down({touchId=33});goldHit.listeners.exit({touchId=33});goldHit.listeners.up({touchId=33})
assert(not goldHit.click({touchId=33}),'cancelled node resource touch opened readout')
goldHit.listeners.down({touchId=34});goldHit.listeners.up({touchId=34})
assert(nodeUi:resize(1000,700)~=false)
assert(not goldHit.click({touchId=34}),'node resource touch survived resize')
local function find(specs,name)
 for _,spec in ipairs(specs)do
  if spec.name==name then return spec end
  local nested=spec.children and find(spec.children,name);if nested then return nested end
 end
end
F.monsterActors().destroy(oldHints)
local nodeSpec=assert(find(F.Layout,'nodePanel'))
node.children.resourceHints=F.control(assert(find(nodeSpec.children,'resourceHints')),node)
nodeUi:refresh()
assert(not goldHit.click({touchId=35}),'destroyed resource hit remained active')
local replacement=node:GetChild('resourceHints'):GetChild('gold'):GetChild('hit')
assert(replacement~=goldHit,'native hint subtree was not replaced')
fullValue(nodeUi,nodeRoot,'nodePanel','gold','1234567890123')
nodeUi:disable();assert(nodeUi.disabled and nodeUi.nodeResourceHints.destroyed)
assert(not replacement.click({touchId=31}) and not nodeUi.nodeResourceHints:destroy(),'resource adapter revived after disable')
for key,value in pairs(savedRandom)do Random[key]=value end
local focus
local api={events={Confirm='confirm',Cancel='cancel'},directions={Left=1,Right=2,Up=3,Down=4},modes={Specified=1},
 getFocus=function()return focus end,setFocus=function(control)focus=control end,isController=function()return true end}
local controlled,controlledRoot=F.fixture(nil,nil,nil,cursor,nil,nil,nil,api)
Hints.attach(controlled,controlledRoot,'click',cursor);assert(F.start(controlled,'ironclad'))
local route=Routes.to(controlled.map,function(n)return n.type=='shop'end)
for i=1,#route-1 do assert(Map.choose(controlled.map,route[i]))end
controlled:refresh();assert(controlled.mapUI:choose(route[#route]))
local controlledHit=controlledRoot:GetChild('nodePanel'):GetChild('resourceHints'):GetChild('gold'):GetChild('hit')
local count=#controlled.controller.records
for _=1,5 do controlled:refresh()end
assert(#controlled.controller.records==count,'refresh duplicated resource controller bindings')
focus=controlledHit
assert(controlledHit.navigationListeners.confirm() and controlled.deckUI.visible,'Controller readout blocked its own Confirm')
assert(not controlledHit.click(),'Controller Confirm leaked pointer action')
assert(controlled:closeDeck());controlled:update(.01)
controlled:disable()
assert(controlled.controller.byControl[controlledHit]==nil and not controlledHit.navigationListeners.confirm(),'destroyed Controller resource callback revived')
V.print();ui:disable();nodeUi:disable()
print('OFFICIAL_RESOURCE_READABILITY_PASS exact writer, three pages, five slots, complete existing readouts')
