local F=dofile('tests/lua/support/game_ui_fixture.lua')
local V=dofile('scripts/official-assets-preview.lua')
local h,root=F.fixture()
require('abyss_compendium_host').attach(h,root,F.Data,F.Presentation,'click',{})
h:update(3)
V.capture('menu',h,root,'real GameUI + compendium adapter, no Run, offline controls')
for _,kind in ipairs({'cards','relics','potions'})do
 assert(h:openCompendium(kind));V.capture(kind,h,root,'real detached catalogue and UI commands, no Run, offline controls')
 assert(h:closeCompendium())
end
V.print()
