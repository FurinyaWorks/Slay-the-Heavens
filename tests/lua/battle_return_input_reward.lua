local H=dofile('tests/lua/support/battle_action_fixture.lua')
local test,finish=H.suite('BATTLE_RETURN_INPUT_REWARD')
local same=dofile('tests/lua/support/battle_return_state.lua')
for _,released in ipairs({false,true})do
 for _,closing in ipairs({'click-only','pointer'})do
 test('old '..(released and 'released' or 'held')..' skip expires across reward-card reader / '..closing,function()
  local h,u,p,e,t=H.reward()
  local rewards=h.run.rewards
  local before=H.F.Combat.copy(h.run)
  e('skip','down',7);if released then e('skip','up',7)end
  assert(u:openHelp(assert(u:cardHelpSpec(1)),p:GetChild('card1'),false))
  assert(u.info and p:GetChild('statusInfo').visible)
  local close=p:GetChild('statusInfo'):GetChild('hit')
  if closing=='pointer'then assert(close.listeners.down);close.listeners.down({touchId=8});if close.listeners.up then close.listeners.up({touchId=8})end end
  close.click({touchId=8})
  assert(not u.info)
  e('skip','up',7);e('skip','click',7)
  assert(u.rewardScreen=='cards' and not rewards.cardResolved,'old skip permission survived reward reader')
  assert(h.run.rewards==rewards and same(before,h.run),'reward reader changed complete run state')
  t('skip',7);assert(u.rewardScreen=='list' and not rewards.cardResolved,'fresh same-touch complete skip did not recover')
 end)
 end
end
test('old skip dismisses visible reader without resolving or navigating rewards',function()
 local h,u,p,e=H.reward();local rewards=h.run.rewards;local gold,deck=h.run.gold,#h.run.deck
 e('skip','down',7);e('skip','up',7)
 assert(u:openHelp(assert(u:cardHelpSpec(1)),p:GetChild('card1'),false))
 e('skip','click',7)
 assert(not u.info and u.rewardScreen=='cards' and h.run.rewards==rewards and not rewards.cardResolved)
 assert(h.run.gold==gold and #h.run.deck==deck)
end)
finish()
