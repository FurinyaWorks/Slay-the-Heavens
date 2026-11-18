-- Real host capability matrix, independently runnable without the old Lua batch.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local H=dofile('tests/lua/support/potion_targeting_fixture.lua')
local test,finish=H.suite('POTION_PARTIAL_POINTER')
for _,capability in ipairs({'click-only','Down-only','Up-only','paired'})do
 for _,named in ipairs({true,false})do
 test(capability..' popup Use retains the '..(named and 'named' or 'anonymous')..' tail boundary',function()
  local cursor={}
  if capability=='Down-only' or capability=='paired'then cursor.CursorDown='down'end
  if capability=='Up-only' or capability=='paired'then cursor.CursorUp='up'end
  if capability=='paired'then cursor.CursorDrag='drag';cursor.CursorEndDrag='endDrag';cursor.CursorExit='exit'end
  local host,root=F.fixture(nil,nil,nil,cursor,false,nil,{touchScreen=function()return true end})
  assert(F.start(host));assert(Run.startCombat(host.run,'cultist_solo'))
  host.run.combat=F.Combat.new(F.Data,{deck={'defend','defend'},enemies={'cultist','jaw_worm'}})
  host.run.potions={'fire_potion'};host:refresh()
  local ui,panel=host.battleUI,root:GetChild('battlePanel')
  local use=panel:GetChild('potionHelp'):GetChild('potionPopup'):GetChild('use')
  local enemy=F.actorControl(panel,'enemy2'):GetChild('hit')
  local b=host.run.combat;local hp,energy,hand=b.enemies[2].hp,b.energy,#b.hand
  panel:GetChild('potion1').listeners.click({touchId=70})
  if capability=='paired'then use.listeners.down({touchId=71});use.listeners.up({touchId=71})
  else assert(not use.listeners.down and not use.listeners.up,'partial capability must not invent a release')end
  local native=named and {touchId=71} or {}
  use.listeners.click(native);assert(ui.potionAim and host.run.potions[1]=='fire_potion')
  if capability=='click-only'then
   assert(not cursor.CursorDown and not cursor.CursorUp and not enemy.listeners.down and not enemy.listeners.up)
   enemy.listeners.click({})
  else
   enemy.listeners.click(native)
   assert(b.enemies[2].hp==hp and host.run.potions[1]=='fire_potion' and ui.potionAim,capability..' attributed tail consumed potion')
   if capability=='paired'then enemy.listeners.down({touchId=72});enemy.listeners.up({touchId=72})end
   enemy.listeners.click({touchId=72})
  end
  assert(b.enemies[2].hp==hp-20 and host.run.potions[1]==nil and ui.potionAim==nil,'fresh independent target failed')
  assert(b.energy==energy and #b.hand==hand and not ui.selected,'potion input played a card')
 end)
 end
end
finish()
