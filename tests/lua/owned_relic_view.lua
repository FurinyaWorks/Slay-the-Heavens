local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Theme=require('abyss_theme')
local h,r=F.fixture()
assert(F.start(h))
local run=h.run
run.relics={'anchor','anchor'}
for i=1,40 do run.relics[#run.relics+1]='burning_blood' end
h:refresh()
-- Top-bar art slots: owned-only discs bound to Theme.icon.relic.
local bar=r:GetChild('relicBar')
assert(bar.visible~=false,'relic disc row hidden on map')
for i=1,Theme.layout.relicView.bar.count do
  local slot=bar:GetChild('slot'..i)
  assert(slot.visible==true,'slot '..i..' should show owned relic')
  assert(slot:GetChild('rim') and slot:GetChild('face') and slot:GetChild('icon'),'disc art layers missing')
end
-- PD02/03: every physical slot is an actual relic; arrows page the strip.
local V=require('abyss_relic_view_ui')
local function same(a,b)for i=1,math.max(#a,#b)do if a[i]~=b[i]then return false end end return true end
assert(same(V.barCells(0,3),{false,false,false}))
assert(same(V.barCells(2,3),{1,2,false}))
assert(same(V.barCells(3,3),{1,2,3}))
assert(same(V.barCells(4,3),{1,2,3}))
assert(same(V.barCells(4,3,2),{4,false,false}))
for i=1,Theme.layout.relicView.bar.count do assert(not bar:GetChild('slot'..i):GetChild('more').visible)end
local panel=r:GetChild('relicPanel')
assert(bar:GetChild('slot1'):GetChild('hit').click())
assert(h.deckUI.visible and h.deckUI.detailOnly=='relics' and h.relicUI.selectedIndex==1)
assert(panel.visible and not r:GetChild('deckPanel').visible)
assert(panel:GetChild('single'):GetChild('name').text=='石锚')
assert(panel:GetChild('single'):GetChild('description').text:find('获得 10 点格挡',1,true))
for i=1,4 do assert(not panel:GetChild('row'..i).visible,'legacy collection rows are runtime-inaccessible')end
assert(h.relicUI:turn(1) and h.relicUI.selectedIndex==2)
assert(panel:GetChild('close'):GetChild('hit').click())
assert(not h.deckUI.visible and not h.relicUI.visible and h.mode=='map')
assert(bar:GetChild('slot2'):GetChild('hit').click())
assert(h.relicUI.selectedIndex==2)
assert(panel:GetChild('close'):GetChild('hit').click())
assert(bar:GetChild('next'):GetChild('hit').click());local page=h.relicUI.barPage
assert(bar:GetChild('slot1'):GetChild('hit').click());assert(h.relicUI.selectedIndex==h.relicUI.barCapacity+1)
assert(panel:GetChild('close'):GetChild('hit').click());assert(h.relicUI.barPage==page)
assert(h:openDeck());assert(not h:openRelics());assert(h:closeDeck())
run.relics={'neows_lament','maw_bank','anchor','ancient_tea_set'}
run.relicCounters={neows_lament=2,maw_bank=-2,ancient_tea_set=-2}
h:refresh()
for i,expected in pairs({'剩余 2 场','已失效',false,'已蓄能'})do
 assert(h:openRelics(i));assert((h.relicUI.selected.status or false)==expected);assert(h:closeDeck())
end
print('LUA_OWNED_RELIC_VIEW 4 passed')
