local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')

-- Lightning kills the last enemy before the remaining Frost orbs grant block.
local orbHost,orbRoot=F.fixture(nil,function()return true end)
local defect=Run.new(F.Data,'1',{experimental=true,character='defect'})
assert(Run.startRoomCombat(defect,'normal'))
local owner=orbHost.battleUI
owner:setData(defect.data,require('abyss_character_presentation').prepare(F.Presentation,defect.data))
orbHost.run,owner.run=defect,defect
orbHost:refresh()
local combat=defect.combat
for _,enemy in ipairs(combat.enemies)do enemy.hp=1 end
combat.orbs.slots,combat.orbs.balls=10,{{kind='lightning'}}
for i=2,10 do combat.orbs.balls[i]={kind='frost'}end
combat.player.statuses.electrodynamics=1
owner:endTurn()
assert(defect.phase=='reward' and combat.player.block==18)
local panel=orbRoot:GetChild('battlePanel')
local floating=panel:GetChild('hero'):GetChild('floating')
local sawBlock=false
for _=1,400 do
 local stillVisible=floating.visible
 sawBlock=sawBlock or stillVisible
 owner:update(1/60)
 if not owner.busy then
  assert(not stillVisible and panel:GetChild('rewardList').visible,'rewards interrupted the last player effect')
  break
 end
end
assert(sawBlock and not owner.busy)
print('PC13_REWARD_FEEDBACK_TAIL_PASS')
