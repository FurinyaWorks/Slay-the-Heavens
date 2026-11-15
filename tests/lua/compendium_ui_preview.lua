local F=dofile('tests/lua/support/game_ui_fixture.lua')
local V=dofile('scripts/official-assets-preview.lua')
local cursor={CursorEnter='enter',CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local h,root=F.fixture(nil,nil,nil,cursor)
require('abyss_compendium_host').attach(h,root,F.Data,F.Presentation,'click',{
 color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,imageSource='static',cursorEvents=cursor})
h:update(3)
V.capture('menu',h,root,'real GameUI + compendium adapter, no Run, offline controls')
for _,kind in ipairs({'cards','relics','potions'})do
 assert(h:openCompendium(kind));h:update(.05);V.capture(kind,h,root,'pinned-source catalogue structure; real native Grid/controls, no Run, offline not client pixels')
 if kind=='cards' then
  local first=root:GetChild('compendiumPanel'):GetChild('cardGrid').items[0]:GetChild('hit')
  first.listeners.enter();h:update(.25)
  V.capture('card-hover',h,root,'unclipped 4/3 hover overlay, original hit stays in native Grid; private .2 second tooltip delay')
  first.listeners.exit()
  for index,row in ipairs(h.compendium.rows)do if row.id=='body_slam'then assert(h.compendium:select(index));break end end
  V.capture('cost-base',h,root,'real Body Slam full card centered, printed cost1; actual native tree')
  assert(h.compendium.commands.upgrade())
  V.capture('cost-upgraded',h,root,'real upgraded Body Slam printed cost0, card internal source description')
  assert(h.compendium:closeDetails())
  for index,row in ipairs(h.compendium.rows)do if row.id=='bash'then assert(h.compendium:select(index));break end end
  V.capture('card-keywords',h,root,'real Bash card with static Vulnerable dictionary tooltip')
  assert(h.compendium:closeDetails());assert(h.compendium.commands.colorcolorless())
  V.capture('colorless',h,root,'actual admitted shared/status and colorless cards, no future starters')
 elseif kind=='relics'then
  assert(h.compendium:select(1,h.compendium.groups.common))
  V.capture('relic-popup',h,root,'same-rarity bounded native relic inspect; approved project replacement icon, no invented quote')
 else
  assert(h.compendium:select(1,h.compendium.groups.common))
  V.capture('potion-tip',h,root,'source-shaped bottle tooltip; C-mode pins the same text, no potion fullscreen popup')
 end
 assert(h:closeCompendium())
end
V.print()
