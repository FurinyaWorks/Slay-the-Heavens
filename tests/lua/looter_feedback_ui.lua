local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')
local H=dofile('tests/lua/support/battle_action_fixture.lua')
local test,finish=H.suite('LOOTER_FEEDBACK_UI')
test('gold HUD follows each displayed event frame, not committed final balance',function()
 local h,u,p,e,t,d=H.setup(nil,{'looter'});t('endTurn',1)
 assert(h.run.gold==84);assert(u.busy);assert(p:GetChild('piles').text=='99','HUD jumped before theft frame')
 local saw=false
 for i=1,100 do h:update(.05);if u.feedback.current and u.feedback.current.kind=='gold_stolen' then saw=true;assert(p:GetChild('piles').text=='84');break end end
 assert(saw);d()
end)
test('final escape plays once and goes straight to rewards',function()
 local h,u,p,e,t,d=H.setup(nil,{'looter'});local escaped=false
 for turn=1,5 do
  if h.run.phase~='combat' then break end;t('endTurn',turn)
  for i=1,400 do
   if not u.busy then break end
   if u.feedback.current and u.feedback.current.kind=='enemy_escape' then
    local id=h.run.combat.enemies[1].id;assert(not u.feedback.deaths[id]);assert(monsterControl(p,'enemy1').visible)
    local list=p:GetChild('rewardList')
    local frames=0
    while not list.visible and frames<200 do
     h:update(1/60);frames=frames+1
     if frames==15 then assert(monsterControl(p,'enemy1').visible and not list.visible,'escape must be visible before rewards')end
    end
    print('REWARD_ESCAPE_TO_LIST_FRAMES '..frames)
    assert(frames>=30 and frames<=33,'final escape to rewards took '..frames..' frames at 60 Hz')
    assert(not u.busy and not u.feedback.current and not monsterControl(p,'enemy1'))
    assert(list.visible and list:GetChild('title').text=='敌人已逃跑')
    escaped=true;break
   end
   h:update(.05)
  end
  d()
 end
 assert(escaped);assert(h.run.phase=='reward');assert(not p:GetChild('result').text:find('全灭'))
end)
finish()
