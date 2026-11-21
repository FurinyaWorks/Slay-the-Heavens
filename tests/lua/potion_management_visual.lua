package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Theme=require('abyss_run'),require('abyss_theme')
for _,belt in ipairs({false,true})do
 local h,r=F.fixture();assert(F.start(h))
 if belt then assert(Run.obtainRelic(h.run,'Potion Belt'))end
 assert(Run.obtainPotion(h.run,'fire_potion'));assert(Run.obtainPotion(h.run,'block_potion'))
 h:refresh();assert(h:openPotions())
 local panel=r:GetChild('potionPanel');local capacity=belt and 5 or 3
 local function face(i,state)return panel:GetChild('slot'..i):GetChild('hit'):GetChild(state)end
 local function check(selected)
  for i=1,5 do
   local slot=panel:GetChild('slot'..i);assert(slot.visible==(i<=capacity))
   assert(slot.x==(i-(capacity+1)/2)*92 and slot.y==120)
   for _,state in ipairs({'normal','hover','pressed','disabled'})do
    local f=face(i,state);local id=h.run.potions[i]
    assert(f:GetChild('bottle').visible==(id~=nil))
    assert(f:GetChild('emptyShell').visible==(id==nil))
    assert(f:GetChild('selectedShell').visible==(selected==i))
    if id then assert(f:GetChild('bottle').imageId==Theme.icon.potion[id])end
   end
  end
 end
 check(nil)
 assert(panel:GetChild('slot2'):GetChild('hit').click());check(2)
 assert(panel:GetChild('discard'):GetChild('hit').click());check(nil)
 assert(h.run.potions[1]=='fire_potion' and h.run.potions[2]==nil)
 assert(panel:GetChild('cancel'):GetChild('hit').click());assert(not panel.visible)
 assert(h:openPotions());check(nil)
end
print('LUA_POTION_MANAGEMENT_VISUAL_PASS')
