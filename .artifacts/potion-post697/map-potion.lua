local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Combat=require('abyss_run'),require('abyss_combat')
local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorEnter='enter',CursorExit='exit',CursorEndDrag='endDrag'}
local h,r=F.fixture(nil,nil,nil,cursor);h.seed=61;assert(F.start(h))
-- Use the existing natural Fire drop vector on this GameUI's own initialized Run/map.
assert(Run.startCombat(h.run,'cultist_solo'))
for _=1,160 do
 if h.run.phase~='combat' then break end
 local uid
 for _,card in ipairs(h.run.combat.hand) do
  if Combat.canPlay(h.run.combat,card.uid,1) then
   uid=card.uid;if Combat.cardDefinition(h.run.combat,card).type=='attack' then break end
  end
 end
 if uid then assert(Run.play(h.run,uid,1)) else assert(Run.endTurn(h.run)) end
end
assert(h.run.phase=='reward' and h.run.rewards.potion.id=='fire_potion')
assert(Run.claimPotionReward(h.run));assert(Run.claimCardReward(h.run,0))
dofile('tests/lua/support/finish_combat_rewards.lua')(h.run)
assert(h.run.phase=='map');assert(Run.startCombat(h.run,'small_slimes'));h:refresh()
local u,p=h.battleUI,r:GetChild('battlePanel')
local monster=dofile('tests/lua/support/monster_control_fixture.lua')
local confirm=dofile('tests/lua/support/confirm_potion_popup.lua')
local function emit(name,kind,id)
 local box=name:match('^enemy') and monster(p,name) or p:GetChild(name)
 local hit=box.listeners and (box.listeners.down or box.listeners.click or box.click) and box or box:GetChild('hit')
 local fn=kind=='click' and (hit.click or hit.listeners.click) or hit.listeners[kind]
 assert(fn,'missing real receiver '..name..'/'..kind)
 return fn({touchId=id})
end
local function tap(name,id)
 local previous=u.potionAim
 emit(name,'down',id);emit(name,'up',id);emit(name,'click',id)
 if name:match('^potion') then confirm(u,p,id,previous) end
end
local function hitTap(hit,id)
 hit.listeners.down({touchId=id});hit.listeners.up({touchId=id});return hit.click({touchId=id})
end
local function same(a,b)
 if type(a)~=type(b) then return false end
 if type(a)~='table' then return a==b end
 for k,v in pairs(a) do if not same(v,b[k]) then return false end end
 for k in pairs(b) do if a[k]==nil then return false end end
 return true
end
tap('potion1',101);assert(u.potionAim,'real Use must start aim')
local before=Combat.copy(h.run);local run,map,battle=h.run,h.map,h.run.combat
assert(h:openMenu());assert(u.potionAim==nil,'menu cover must cancel aim')
assert(hitTap(r:GetChild('runMenu'):GetChild('map'):GetChild('hit'),102));assert(h.routeOpen)
assert(not h.mapUI.navigationEnabled and not h.mapUI:choose('f1_l1'))
assert(hitTap(r:GetChild('mapPanel'):GetChild('previewBack'):GetChild('hit'),103))
assert(not h.routeOpen and h.mode=='battle' and h.run==run and h.map==map and h.run.combat==battle)
assert(same(before,h.run),'read-only Map/return must preserve complete Run including RNG')
emit('enemy2','up',101);emit('enemy2','click',101)
assert(same(before,h.run),'stale aim tail after Map return must not consume or damage')
local hp=battle.enemies[2].hp
tap('potion1',104);assert(u.potionAim);tap('enemy2',105)
assert(h.run.potions[1]==nil and battle.enemies[2].hp==hp-20)
h:disable();print('POST697_GAMEUI_MAP_POTION_PASS 1')
