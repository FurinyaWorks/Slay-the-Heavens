local F=dofile('tests/lua/support/game_ui_fixture.lua')
local V=dofile('scripts/official-assets-preview.lua')
local h,root=F.fixture()
require('abyss_compendium_host').attach(h,root,F.Data,F.Presentation,'click',{})
h:update(3)
V.capture('menu',h,root,'real GameUI + compendium adapter, no Run, offline controls')
for _,kind in ipairs({'cards','relics','potions'})do
 assert(h:openCompendium(kind));V.capture(kind,h,root,'real detached catalogue and UI commands, no Run, offline controls')
 if kind=='cards' then
  for index,row in ipairs(h.compendium.rows)do if row.id=='body_slam'then assert(h.compendium:select(index));break end end
  local panelOnly={GetChild=function(_,name)if name=='compendiumPanel'then return root:GetChild(name)end end}
  V.capture('cost-base',h,panelOnly,'real Body Slam printed cost, actual compendium subtree; background omitted')
  assert(h.compendium.commands.upgrade())
  V.capture('cost-upgraded',h,panelOnly,'real upgraded Body Slam printed cost, actual compendium subtree; background omitted')
 end
 assert(h:closeCompendium())
end
V.print()
