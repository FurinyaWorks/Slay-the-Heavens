local H=dofile('tests/lua/support/battle_action_fixture.lua')
local C=H.F.Combat
local h,ui,panel,_,tap,drain=H.setup({'strike','strike'},{'lagavulin'})
local function box()return H.F.actorControl(panel,'enemy1')end
local function marker(expected)
 local unit=box();local label=unit:GetChild('intentLabel')
 assert(label.visible==expected,'sleep label visibility')
 assert(label.text==(expected and 'Zzz' or ''),'sleep marker stale or missing')
 if expected then assert(not unit:GetChild('intentIcon').visible,'sleep still draws the ambiguous tiny glyph')end
end
h:update(.1);assert(C.intent(h.run.combat,1).kind=='sleep');marker(true)
local s=h.run.combat;local e=s.enemies[1]
local hp,block,energy,turn=e.hp,e.block,s.energy,s.turn
for _=1,8 do h:refresh()end
assert(e.hp==hp and e.block==block and s.energy==energy and s.turn==turn,'render mutated combat')
-- Two real card submissions first consume sleeping block, then wake on HP loss.
tap('card1',11);tap('enemy1',11);drain();h:refresh()
assert(C.intent(s,1).kind=='sleep');marker(true)
tap('card1',12);tap('enemy1',12);drain();h:refresh()
assert(C.intent(s,1).kind=='stunned');marker(false)
tap('endTurn',13);drain();h:refresh()
assert(C.intent(s,1).kind=='attack');marker(false)
assert(box():GetChild('intentIcon').visible,'attack icon not restored')
-- Rebind the same Host/slot to another real sleeping battle, then a non-sleeping actor.
h.run.combat=C.new(H.F.Data,{deck={'strike'},enemies={'lagavulin'},seed=42})
h:refresh();h:update(.1);marker(true)
local relics=h.run.relics
relics[#relics+1]='runic_dome';h:refresh()
assert(not box():GetChild('intentLabel').visible and not box():GetChild('intentIcon').visible,'hidden intent leaked sleeping marker')
table.remove(relics);h:refresh();marker(true)
h.run.combat=C.new(H.F.Data,{deck={'strike'},enemies={'cultist'},seed=42})
h:refresh();h:update(.1);marker(false)
h:disable()
print('SLEEP_INTENT_LABEL_PASS sleep wake attack sleep reused-slot')
