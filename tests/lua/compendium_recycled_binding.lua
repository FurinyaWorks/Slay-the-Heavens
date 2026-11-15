local F=dofile('tests/lua/support/game_ui_fixture.lua')
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag',CursorEnter='enter'}
local ui,root=F.fixture(nil,nil,nil,cursor)
require('abyss_compendium_host').attach(ui,root,F.Data,F.Presentation,'click',{cursorEvents=cursor,imageSource='static',
 color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end})
local panel=root:GetChild('compendiumPanel')
local function open(kind)
 assert(root:GetChild('compendiumEntries'):GetChild(kind):GetChild('hit').click());assert(ui:update(.05));return ui.compendium
end
local function gesture(hit,id,release)
 hit.listeners.down({touchId=id});if release then hit.listeners.up({touchId=id})end
end
local function fresh(hit,id)gesture(hit,id,true);return hit.click({touchId=id})end
local b=open('cards');local grid=panel:GetChild('cardGrid')
assert(panel:GetChild('sortcost'):GetChild('hit').click());grid.scrollProgress=.63
local generation,rows,direction=b.generation,b.rows,b.ascending
assert(panel:GetChild('colorred'):GetChild('hit').click())
assert(b.rows==rows and b.generation==generation and b.ascending==direction and b.sortMode=='cost'and grid.scrollProgress==.63,
 'same color tab reset source sorting or scroll')
for _,released in ipairs({false,true})do
 local item=grid:recycle(0,0);local hit=item:GetChild('hit');gesture(hit,41,released)
 assert(grid:recycle(0,10)==item,'fixture destroyed retained card control')
 if not released then hit.listeners.up({touchId=41})end
 assert(not hit.click({touchId=41})and not b.popup,'recycled card accepted old gesture')
 assert(fresh(hit,41)and b.selected.id==b.rows[11].id,'fresh same-touch card failed')
 assert(b:closeDetails())
end
-- Repainting the identical binding or recycling another slot must not cancel it.
local item=grid:recycle(0,0);local hit=item:GetChild('hit');gesture(hit,43,true)
grid:recycle(1,12);grid:recycle(0,0)
assert(hit.click({touchId=43})and b.selected.id==b.rows[1].id,'unrelated or identical refill cancelled valid gesture')
assert(b:closeDetails())
item=grid:recycle(0,0);hit=item:GetChild('hit');gesture(hit,44,true)
grid:recycle(0,9999);assert(not item.visible and not hit.click({touchId=44}),'empty card accepted retired gesture')
grid:recycle(0,10);assert(not hit.click({touchId=44}),'empty card revived old gesture')
assert(fresh(hit,44));assert(b:closeDetails());assert(ui:closeCompendium())
for _,kind in ipairs({'relics','potions'})do
 b=open(kind);grid=panel:GetChild('iconGrid')
 local indices={};for i,line in ipairs(b.lines)do if line.entries then indices[#indices+1]=i end end
 assert(#indices>1)
 local pairs_={}
 for i=2,#indices do
  if b.lines[indices[1]].rarity~=b.lines[indices[i]].rarity then
   pairs_[#pairs_+1]={indices[1],indices[i]};break
  end
 end
 for i=2,#indices do
  if b.lines[indices[i-1]].rarity==b.lines[indices[i]].rarity then
   pairs_[#pairs_+1]={indices[i-1],indices[i]};break
  end
 end
 assert(#pairs_==2,'missing same-rarity native recycle case')
 for _,pair in ipairs(pairs_)do
  for _,released in ipairs({false,true})do
   item=grid:recycle(0,pair[1]-1);local slot=item:GetChild('slot1');hit=slot:GetChild('hit')
   gesture(hit,45,released);assert(grid:recycle(0,pair[2]-1)==item)
   if not released then hit.listeners.up({touchId=45})end
   assert(not hit.click({touchId=45})and not b.popup and not b.tooltip,'recycled '..kind..' accepted old gesture')
   local expected=b.lines[pair[2]].entries[1].row.id
   assert(fresh(hit,45)and b.selected.id==expected,'fresh same-touch '..kind..' failed');assert(b:closeDetails())
  end
 end
 -- Header and absent rows retain controls too: neither may authenticate old data.
 for _,target in ipairs({0,9999})do
  item=grid:recycle(0,indices[1]-1);hit=item:GetChild('slot1'):GetChild('hit');gesture(hit,46,true)
  grid:recycle(0,target);assert(not hit.click({touchId=46}),'hidden icon accepted retired gesture')
  grid:recycle(0,indices[1]-1);assert(not hit.click({touchId=46}),'hidden icon revived old gesture')
  assert(fresh(hit,46));assert(b:closeDetails())
 end
 assert(ui:closeCompendium())
end
assert(not ui.run,'recycle regression invented a Run')
print('COMPENDIUM_REVIEW_FIX_PASS retained bindings, same-tab no-op, hidden retirement, same-touch recovery')
