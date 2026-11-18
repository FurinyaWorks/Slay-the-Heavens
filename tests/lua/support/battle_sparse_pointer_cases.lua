-- Regression for coalesced native motion: real Down then Up, no Drag callback.
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local T=require('abyss_theme')
local savedClock=os.clock
local passed=0
local ok,why=pcall(function()
 for _,touch in ipairs({false,true})do
  local h,u,p,e=H.setup({'defend','defend'},nil,{touchScreen=function()return touch end})
  local b=h.run.combat
  local x,y=p:GetChild('card1').x,T.layout.hand.y
  local now=0;os.clock=function()return now end
  e('card1','down',7,x,y)
  now=.05;e('card1','up',7,x+5,y+75)
  assert(b.energy==2 and #b.hand==1 and b.player.block==5,'coalesced legal release was lost')
  e('card1','up',7,x+5,y+75);e('card1','click',nil,x+5,y+75)
  assert(b.energy==2 and #b.hand==1 and b.player.block==5,'release tail replayed')
  os.clock=savedClock;passed=passed+1
 end
end)
os.clock=savedClock;assert(ok,why)
print('BATTLE_SPARSE_POINTER '..passed..' passed')
assert(passed==2)
