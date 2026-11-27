local monsterControl=dofile('tests/lua/support/monster_control_fixture.lua')
local testStart=dofile('tests/lua/support/game_ui_fixture.lua').start
-- Actual read-only Host controls; no native/desktop/UI acceptance claim.
local H=dofile('tests/lua/support/battle_action_fixture.lua')
local inspectDetails=dofile('tests/lua/support/status_detail_fixture.lua')
local N=dofile('tests/lua/support/nemesis_fixture.lua')
local F=H.F
local function eq(a,b)assert(a==b,tostring(a)..' ~= '..tostring(b))end
local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local host=F.GameUI.new(root,N.D,F.Presentation,'click',{seed=1,campaign=true,prologue=false,
 imageSource='static',color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end})
assert(testStart(host))
local r=host.run;r.act,r.floor,r.encounters=3,35,N.Q.new('1',3)
assert(N.Run.startRoomCombat(r,'elite'));N.force(r.combat,'burn');host:refresh()
local panel=root:GetChild('battlePanel');local box=monsterControl(panel,'enemy1');local _,tap=H.controls(panel)
eq(box:GetChild('name').text,'天罚');eq(box:GetChild('hp').text,'185/185')
tap('enemy1',91)
local text=inspectDetails(host.battleUI,panel)
eq(text,'<color=#F5D78A>策略</color>\n这名敌人将要对你施加一种负面效果。')
-- The compact tooltip shows the approved category. The detailed projection
-- still exposes the exact pending Burn count, card and destination.
local intent=require('abyss_battle_intent_view').intentView(r.combat,1)
eq(intent.tooltipEnum,'DEBUFF')
eq(intent.text,'将 3 张「'..r.combat.catalog.cards.burn.name..'」放入你的弃牌堆')
assert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()
eq(box:GetChild('intent').text,'6x3')
dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'nemesis_intangible'):GetChild('hit').click({touchId=92})
local power=inspectDetails(host.battleUI,panel)
assert(power:find('无实体',1,true),'monster Intangible must be named in the existing status panel: '..power)
print('NEMESIS_UI 1 groups; 0 failed')
