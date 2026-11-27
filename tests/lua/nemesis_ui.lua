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
assert(host.battleUI.info and host.battleUI.info.powerTips,'enemy tap must use the original compact tooltip')
local text=inspectDetails(host.battleUI,panel)
assert(text:find('策略',1,true)and text:find('这名敌人将要对你施加一种负面效果。',1,true),text)
assert(not text:find('弃牌堆',1,true)and not text:find('未知',1,true),text)
-- The effect remains exact in the detailed preview, not in the original intent tooltip.
local detail=require('abyss_battle_intent_view').intentView(r.combat,1)
eq(detail.text,'将 3 张「'..r.combat.catalog.cards.burn.name..'」放入你的弃牌堆')
assert(N.Run.endTurn(r));N.force(r.combat,'fire');host:refresh()
eq(box:GetChild('intent').text,'6x3')
dofile('tests/lua/support/monster_power_control_fixture.lua')(box,'nemesis_intangible'):GetChild('hit').click({touchId=92})
local powerText=inspectDetails(host.battleUI,panel)
assert(powerText:find('无实体',1,true)and powerText:find('最多为1',1,true),powerText)
print('NEMESIS_UI 1 groups; 0 failed')
