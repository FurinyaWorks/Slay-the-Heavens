local H=dofile('tests/lua/support/battle_action_fixture.lua')
local test,finish=H.suite('BATTLE_RETURN_INPUT_BATTLE')
local same=dofile('tests/lua/support/battle_return_state.lua')
for _,released in ipairs({false,true})do
 for _,closing in ipairs({'click-only','pointer'})do
 for _,reader in ipairs({'status','card'})do
  test('old '..(released and 'released' or 'held')..' endTurn expires across '..reader..' reader / '..closing,function()
   local h,u,p,e,t,drain=H.setup()
   local battle=h.run.combat
   local before=H.F.Combat.copy(h.run)
   e('endTurn','down',7);if released then e('endTurn','up',7)end
   if reader=='status'then p:GetChild('hero'):GetChild('statusRow'):GetChild('hit').click({touchId=8});assert(u.info)
   else assert(u:openHelp(assert(u:cardHelpSpec(1)),p:GetChild('card1'),false))end
   assert(u.info and p:GetChild('statusInfo').visible)
   local close=p:GetChild('statusInfo'):GetChild('hit')
   if closing=='pointer'then
    assert(close.listeners.down,'real detail-close Down registered');close.listeners.down({touchId=8})
    if close.listeners.up then close.listeners.up({touchId=8})end
   end
   close.click({touchId=8})
   assert(not u.info and not p:GetChild('statusInfo').visible)
   e('endTurn','up',7);e('endTurn','click',7)
   assert(battle.turn==1,'old endTurn permission survived detail modal')
   assert(h.run.combat==battle and same(before,h.run),'detail round trip changed complete run state')
   t('endTurn',7);assert(battle.turn==2,'fresh same-touch complete endTurn did not recover');drain()
  end)
 end
 end
end
test('old action may dismiss a visible reader but cannot execute its command',function()
 local h,u,p,e=H.setup();local b=h.run.combat
 e('endTurn','down',7);e('endTurn','up',7);assert(u:showStatus(0))
 local energy,hp,turn=b.energy,b.player.hp,b.turn
 e('endTurn','click',7)
 assert(not u.info,'existing any-click dismissal must remain available')
 assert(b.turn==turn and b.energy==energy and b.player.hp==hp and not u.busy,'visible-reader old action executed')
end)
test('rejected reader requests do not retire a valid action permission',function()
 for _,reader in ipairs({'status','card'})do
  local h,u,p,e,t,drain=H.setup();e('endTurn','down',7)
  if reader=='status'then assert(not u:showStatus(999))else assert(not u:openHelp({kind='card',index=999},p:GetChild('card1'),false))end
  e('endTurn','up',7);e('endTurn','click',7);assert(h.run.combat.turn==2,'rejected inspection consumed valid action');drain()
 end
end)
finish()
