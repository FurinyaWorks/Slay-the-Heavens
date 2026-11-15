local H=dofile('tests/lua/support/battle_action_fixture.lua')
local C,V=H.F.Combat,require('abyss_battle_intent_view')
local h,ui,panel=H.setup({'strike','defend'},{'lagavulin'})
local function box()return H.F.actorControl(panel,'enemy1')end
local function render()h:refresh();h:update(.8)end
local function assertState(kind)
 local u=box();local label,icon,badge=u:GetChild('intentLabel'),u:GetChild('intentIcon'),u:GetChild('intentBadge')
 if kind=='sleep'then
  assert(label.visible and label.text=='Zzz' and not icon.visible and not badge.visible,'sleep must replace, not inherit, both image icons')
 elseif kind=='composite'then
  assert(not label.visible and label.text=='' and icon.visible and badge.visible,'composite must replace Zzz with shield and buff')
  assert(icon.imageId==H.F.Theme.icon.intent.defend and badge.imageId==H.F.Theme.icon.intent.buff)
 else
  assert(not label.visible and not icon.visible and not badge.visible,'hidden states must not leak either representation')
 end
end
render();assertState('sleep')
assert(box())
local b=C.new(H.F.Data,{deck={'defend'},enemies={'jaw_worm'},seed=1})
local n=0
while C.intent(b,1).id~='jaw_worm_3' do assert(n<8 and C.endTurn(b));n=n+1 end
assert(V.selectedDescriptor(b,1).intent=='DEFEND_BUFF')
h.run.combat=b;render();assert(box(),'enemy1 display slot exists');assertState('composite')
local rs=h.run.relics;rs[#rs+1]='runic_dome';render();assertState('hidden');table.remove(rs)
render();assertState('composite')
h.run.combat=C.new(H.F.Data,{deck={'strike'},enemies={'lagavulin'},seed=42});render()
assert(box(),'enemy1 display slot exists');assertState('sleep')
h:disable()
print('SHARED_INTENT_ACTOR_PASS sleep/composite/hidden/composite/sleep')
