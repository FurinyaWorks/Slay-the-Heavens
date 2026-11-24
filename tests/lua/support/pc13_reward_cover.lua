local GameUI=require('abyss_game_ui')
local make=GameUI.new
local held
GameUI.new=function(root,data,presentation,event,platform)
 platform.controllerApi={events={Confirm='navConfirm',Cancel='navCancel'},directions={Left='left',Right='right'},modes={Specified='specified'},
  isController=function()return false end,getFocus=function()end,setFocus=function()end}
 platform.presentationReady=function(intent)return not (held and intent.page=='battlePanel')end
 return make(root,data,presentation,event,platform)
end
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Gate=require('abyss_page_reveal')
local victoryCues=0
local function sound(cue)if cue=='victory'then victoryCues=victoryCues+1 end end
local host,root=F.fixture(nil,function()return true end,nil,{CursorDown='down',CursorUp='up'},nil,sound)
local battle=root:GetChild('battlePanel')
local bannerPlate=battle:GetChild('feedback'):GetChild('bannerPlate')
local list=battle:GetChild('rewardList')
local hit=battle:GetChild('card1'):GetChild('hit')
local cover=root:GetChild('pageReveal')
local veil=cover:GetChild('veil')
local function tick()host:update(1/60);host.pageReveal:step(Gate.intent(host));host:refresh()end
local function settle()for _=1,4 do tick()end;assert(not cover.visible)end
settle();assert(host:start());settle();assert(F.confirmStart(host));settle()
assert(Run.startCombat(host.run,'raven_adept_solo'));host:refresh();settle()
local run,oldCombat=host.run,host.run.combat
-- Stage the map phase without publishing it, then let the real Run command
-- create the next battle. The ready Host still owns the old page until refresh.
run.phase='map';held=true
assert(Run.startCombat(run,'jaw_solo'));assert(host.run==run and run.combat~=oldCombat)
host:refresh()
local function blocked()
 assert(cover.visible and host.pageReveal:covered())
 assert(veil.size[1]==F.Theme.canvas.base[1] and veil.size[2]==F.Theme.canvas.base[2])
 local selected,energy=host.battleUI.selected,run.combat.energy
 assert(not hit.click())
 assert(host.battleUI.selected==selected and run.combat.energy==energy)
end
tick();blocked()
held=false;tick();blocked()
tick();assert(not cover.visible and not host.pageReveal:covered())
-- Controlled deck/enemy for deterministic lethal input; actual UI/Run execute
-- feedback, settlement and the card-picker transitions on that combat.
run.combat=F.Combat.new(run.data,{enemies={'acid_slime_s'},deck={'bludgeon'}})
host:refresh();settle();local lethalCombat=run.combat
host.battleUI:playSlot(1);host.battleUI:playSelected(1)
local monster=dofile('tests/lua/support/monster_control_fixture.lua')
local enemyId=lethalCombat.enemies[1].id
local lethalFrame,rewardFrame
for frame=1,400 do
 assert(not cover.visible and not host.pageReveal:covered(),'lethal feedback/settlement flashed a cover')
 if not host.battleUI.busy then break end
 host:update(1/60)
 if not lethalFrame and host.battleUI.feedback.deaths[enemyId] then
  lethalFrame=frame
  assert(monster(battle,'enemy1') and not list.visible,'lethal contact must be visible before rewards')
 end
 if list.visible then
  rewardFrame=rewardFrame or frame
  assert(not monster(battle,'enemy1') and not host.battleUI.busy,'enemy must retire before rewards are interactive')
 end
 assert(not bannerPlate.visible,'victory displayed a separate combat feedback plate')
 if victoryCues>0 then assert(list.visible and not host.battleUI.busy,'victory cue did not hand off to rewards in the same frame')end
end
assert(host.run==run and run.combat==lethalCombat and run.phase=='reward')
assert(victoryCues==1 and list.visible and list:GetChild('title').text=='战斗胜利')
local rewardDelay=assert(rewardFrame)-assert(lethalFrame)
print('REWARD_LETHAL_TO_LIST_FRAMES '..rewardDelay)
assert(rewardDelay<=24,'lethal contact to reward list took '..rewardDelay..' frames at 60 Hz')
local title=list:GetChild('title')
local shade=list:GetChild('v25RewardField'):GetChild('dark')
local alpha=F.Theme.officialAssets.backdropVeil.a
assert(title.localScaleX<1 and title.fontColor.a<255 and battle:GetChild('hero').visible)
assert(shade.imageColor.a>0 and shade.imageColor.a<alpha)
local gold=run.gold
battle:GetChild('goldReward').click()
assert(run.rewards.goldClaimed and run.gold>gold,'the first reward frame must accept input')
host:update(F.Theme.motion.slow)
assert(title.localScaleX==1 and title.fontColor.a==255 and shade.imageColor.a==alpha)
battle:GetChild('cardReward').click()
assert(host.battleUI.rewardScreen=='cards' and not cover.visible)
assert(host.battleUI:cancelAim() and not cover.visible)
assert(list.visible and not battle:GetChild('rewardStage').visible)
assert(title.localScaleX==1 and shade.imageColor.a==alpha)

-- Defect's remaining Frost orbs resolve after Lightning kills the last foe.
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
print('PC13_REWARD_COVER_PASS')
