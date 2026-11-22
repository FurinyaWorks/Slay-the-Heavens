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
local function sound(cue)
 if cue=='victory'then victoryCues=victoryCues+1 end
end
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
assert(Run.startCombat(host.run,'cultist_solo'));host:refresh();settle()
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
for _=1,400 do
 assert(not cover.visible and not host.pageReveal:covered(),'lethal feedback/settlement flashed a cover')
 if not host.battleUI.busy then break end
 tick()
 assert(not bannerPlate.visible,'victory displayed a separate combat feedback plate')
 if victoryCues>0 then assert(list.visible and not host.battleUI.busy,'victory cue did not hand off to rewards in the same frame')end
end
assert(host.run==run and run.combat==lethalCombat and run.phase=='reward')
assert(victoryCues==1 and list.visible and list:GetChild('title').text=='战斗胜利')
battle:GetChild('cardReward').click()
assert(host.battleUI.rewardScreen=='cards' and not cover.visible)
assert(host.battleUI:controllerBack() and not cover.visible)
print('PC13_REWARD_COVER_PASS')
