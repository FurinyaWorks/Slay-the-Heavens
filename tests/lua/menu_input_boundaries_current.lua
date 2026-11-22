-- Current host tree: unlike frozen historical fixtures, these exercise today's
-- native menu admission, layered pointer routing.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local function hit(box,name)return box:GetChild(name):GetChild('hit')end
local function panels(root)
 return root:GetChild('runMenu'),root:GetChild('exitPanel')
end
local cases=0
local function test(name,fn)fn();cases=cases+1;print('ok menu boundary '..cases..' - '..name)end
test('pointer catches preserve modal; outside consumes and returns one layer only',function()
 local calls=0
 local ui,root=F.fixture(nil,function()calls=calls+1;return true end)
 assert(F.start(ui));local run,map=ui.run,ui.map
 local floor=map.floor
 local menu,exit=panels(root)
 assert(menu.disableCursorEventPassthrough and root:GetChild('exitPanel').disableCursorEventPassthrough)
 assert(ui:openMenu());assert(menu:GetChild('catch').click()==true and ui.menuOpen)
 assert(not ui.mapUI:choose(F.Nodes.available(run,map)[1].id),'background route must stay blocked')
 assert(not menu:GetChild('help') and not exit:GetChild('help') and not exit:GetChild('guide'))
 assert(exit:GetChild('blocker').click()==true and ui.menuOpen,'hidden confirmation blocker must not dismiss menu')
 assert(menu:GetChild('blocker').click()==true and not ui.menuOpen and not ui.exitOpen)
 assert(menu:GetChild('blocker').click()==true)
 assert(ui.run==run and ui.map==map and map.floor==floor and calls==0,'dismissal must not advance or settle the run')
 assert(ui:openMenu() and hit(menu,'abandon').click())
 local why=root:GetChild('exitPanel'):GetChild('whyText')
 assert(why.visible and why.text=='本局仅在当前奇域会话中保留；退出奇域后无法继续。')
 assert(ui:closeExit() and calls==0)
 ui:disable()
end)
test('settlement busy and requested states swallow stale outside input',function()
 local ui,root
 local calls=0
 ui,root=F.fixture(nil,function()
  calls=calls+1
  local menu,exit=panels(root)
  assert(ui.settlementBusy and not ui:closeExit())
  assert(menu:GetChild('blocker').click()==true and exit:GetChild('blocker').click()==true)
  assert(ui.exitOpen,'outside events must not dismiss during settlement callback')
  return true
 end)
 local menu,exit=panels(root)
 assert(ui:openMenu())
 ui.settlementBusy=true
 assert(menu:GetChild('blocker').click()==true and ui.menuOpen)
 ui.settlementBusy=false
 assert(hit(menu,'abandon').click() and not ui.menuOpen and ui.exitOpen)
 local staleCancel=hit(exit,"cancel").click
 assert(hit(root:GetChild('exitPanel'),'confirm').click() and ui.settlementRequested and calls==1)
 assert(menu:GetChild('blocker').click()==true and exit:GetChild('blocker').click()==true)
 ui:update(.01);staleCancel();assert(ui.settlementRequested,'stale pointer must preserve settlement')
 assert(not ui:closeExit() and not ui:openMenu() and not ui:confirmExit() and calls==1)
 ui:disable()
end)
print('MENU_INPUT_BOUNDARIES_CURRENT_PASS '..cases)
