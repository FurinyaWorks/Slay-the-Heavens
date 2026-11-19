local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local h,u,p,event,tap=H.setup({'bash','defend'},{'cultist'})
for _=1,80 do h:update(1/60)end
local battle=h.run.combat
local slot
for i,c in ipairs(battle.hand)do if c.cardId=='bash' then slot=i end end
local name='card'..assert(slot)
local card=p:GetChild(name);local x,y=card.x,card.y
local before=H.F.Combat.copy(battle)
event(name,'down',17,x,y)
assert(u.help and u.help.card==u.gesture,'actual keyword card must queue a held help request')
event(name,'drag',17,x+80,y)
assert(u.gesture and u.gesture.browsed and not u.gesture.moving,'actual horizontal browse must not be a drag or stationary hold')
h:update(.36)
print('BROWSE_OBSERVED info='..tostring(p:GetChild('statusInfo').visible)..' gesture='..tostring(u.gesture~=nil)..' energy='..battle.energy..' hand='..#battle.hand)
assert(not p:GetChild('statusInfo').visible,'horizontal browse incorrectly opened stationary held help')
assert(u.gesture and u.gesture.browsed,'browse gesture lost to held help')
assert(battle.energy==before.energy and #battle.hand==#before.hand,'browsing is read-only')
print('BROWSE_HELP_PASS')
