local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local h,u,p,event,tap,drain=H.setup({'defend','defend'},{'cultist'})
local popup=p:GetChild('potionHelp'):GetChild('potionPopup')
local plate,use=popup:GetChild('hit'),popup:GetChild('use')
local function fire(c,kind,id)
 local callback=c.listeners[kind]
 if callback then return callback({touchId=id}) end
end
local function start()
 h.run.potions[1]='energy_potion'; h:refresh();tap('potion1',100)
 assert(u.potionMenu and popup.visible)
 return h.run.combat.energy
end
local failures=0
local function check(condition,name)
 if not condition then failures=failures+1;print('FAIL '..name) else print('PASS '..name) end
end
local function close()
 h.run.potions[1]=nil;h:refresh();assert(not u.potionMenu)
end
for _,mode in ipairs({'anonymous_then_named_action_nil_click','named_then_other_named_action_nil_click','named_then_anonymous_action','anonymous_then_anonymous_action','plate_before_competing_click','active_anonymous_plate','stale_after_reopen'}) do
 local before=start()
 if mode:find('_then_') then
  local old=mode:sub(1,5)=='named' and 101 or nil
  local action=mode:find('_named_action') and 102 or nil
  fire(plate,'down',old);fire(plate,'up',old);fire(plate,'click',nil)
  assert(u.potionMenu and h.run.potions[1])
  fire(use,'down',action);fire(use,'up',action);fire(use,'click',nil); drain()
  check(not h.run.potions[1] and h.run.combat.energy==before+2,mode)
 elseif mode=='plate_before_competing_click' then
  fire(plate,'down',101);fire(plate,'up',101)
  fire(use,'down',102);fire(use,'up',102)
  fire(plate,'click',nil);fire(use,'click',nil)
  check(h.run.potions[1] and h.run.combat.energy==before,mode)
  fire(use,'click',102);drain()
  check(not h.run.potions[1] and h.run.combat.energy==before+2,'named competitor retains own Click')
 elseif mode=='active_anonymous_plate' then
  fire(plate,'down',nil);fire(plate,'click',nil)
  fire(use,'down',102);fire(use,'up',102);fire(use,'click',nil)
  check(h.run.potions[1] and h.run.combat.energy==before,mode)
 elseif mode=='stale_after_reopen' then
  fire(plate,'down',nil);fire(plate,'up',nil)
  close(); before=start()
  fire(plate,'click',nil);fire(use,'click',nil)
  check(h.run.potions[1] and h.run.combat.energy==before,mode)
 end
 close()
end

-- A fresh anonymous Click must not compete with an already rejected release.
h.run.potions[1]='block_potion';h:refresh();tap('potion1',103)
local battle=h.run.combat
fire(use,'down',104);fire(use,'up',104)
battle.player.block=2147483647
assert(fire(use,'click',104)==false and u.potionMenu and h.run.potions[1]=='block_potion',
 'stale Use must preserve the visible menu and its bottle')
event('card1','click',104);event('card1','click',nil)
assert(u.potionMenu and not u.selected,'the open popup still protects lower controls after rejected Use')
battle.player.block=0
fire(use,'down',105);fire(use,'up',105)
assert(fire(use,'click',nil),'rejected Use must retire before a new anonymous Click')
event('card1','click',105);event('card1','click',nil);drain()
assert(not u.potionMenu and not u.selected and not h.run.potions[1] and battle.player.block==12,
 'successful retry is protected against named and anonymous lower-control tails')

assert(failures==0,'neutral popup Host failures: '..failures)
print('POTION_NEUTRAL_POINTER_PASS')
