local H = dofile("tests/lua/support/potion_targeting_fixture.lua")
local setup,Run,Combat,F,eq,untouched = H.setup,H.Run,H.Combat,H.F,H.eq,H.untouched
local test,finish = H.suite("LUA_POTION_TARGETING")
-- Capability is explicit: C-tier has no Down/Up callbacks at all. Keep the
-- paired host too; a synthetic pointer sequence cannot prove click-only input.
for _,pointer in ipairs({false,true})do
local function freshPointerSetup()
 if not pointer then
  local h,u,p,r,e,click,tap,drain=setup(false)
  local bottle=p:GetChild('potion1')
  local use=p:GetChild('potionHelp'):GetChild('potionPopup'):GetChild('use')
  assert(not u.dragEnabled and not bottle.listeners.down and not bottle.listeners.up)
  assert(not use.listeners.down and not use.listeners.up,'C-tier popup must really lack Down/Up')
  return h,u,p,r,e,click,tap,drain
 end
 local h,u,p,r,e,_,tap,drain=setup(true)
 local touch=100
 local function click(name)touch=touch+1;return tap(name,touch)end
 return h,u,p,r,e,click,tap,drain
end

test('bottle-first Click does not select the default enemy or consume',function()
  local h,u,p,r,e,click=freshPointerSetup();local b=h.run.combat;local a,z=b.enemies[1].hp,b.enemies[2].hp
  local inv,energy,events=h.run.potions,b.energy,#b.events
  click('potion1');untouched(h,a,z);eq(h.run.potions,inv);eq(b.energy,energy);eq(#b.events,events);assert(u.potionAim)
  assert(p:GetChild('notice').text:find('点击敌人',1,true));assert(p:GetChild('notice').text:find('取消',1,true))
end)
test('second explicit enemy alone confirms bottle and never fires selected card',function()
  local h,u,p,r,e,click=freshPointerSetup();local b=h.run.combat;local a,z=b.enemies[1].hp,b.enemies[2].hp
  local energy,hand=b.energy,#b.hand
  click('card1');click('potion1');untouched(h,a,z);eq(u.selected,nil)
  click('enemy2');eq(b.enemies[1].hp,a);eq(b.enemies[2].hp,z-20);eq(Run.potionCount(h.run),0);eq(b.energy,energy);eq(#b.hand,hand);eq(u.potionAim,nil)
end)
test('prior enemy selection still needs a new explicit target after bottle',function()
  local h,u,p,r,e,click=freshPointerSetup();local b=h.run.combat;local a,z=b.enemies[1].hp,b.enemies[2].hp
  click('enemy2');assert(u.info);p:GetChild('statusInfo'):GetChild('hit').click();click('potion1');untouched(h,a,z);click('enemy1');eq(b.enemies[1].hp,0);eq(b.enemies[2].hp,z)
end)
test('fresh second bottle click cancels without consumption',function()
  local h,u,p,r,e,click=freshPointerSetup();local b=h.run.combat;local a,z=b.enemies[1].hp,b.enemies[2].hp
  local energy,hand=b.energy,#b.hand
  click('card1');assert(u.selected);click('potion1');eq(u.selected,nil)
  click('potion1');eq(u.potionAim,nil);click('enemy2');untouched(h,a,z)
  eq(b.energy,energy);eq(#b.hand,hand);eq(u.selected,nil)
end)
test('pure redraw preserves pending and explicit second enemy',function()
  local h,u,p,r,e,click=freshPointerSetup();local z=h.run.combat.enemies[2].hp
  click('potion1');local g=u.potionAim;h:refresh();u:render();eq(u.potionAim,g)
  click('enemy2');eq(h.run.combat.enemies[2].hp,z-20)
end)
print('POTION_TARGETING_CAPABILITY '..(pointer and 'paired' or 'click-only'))
end
finish()
