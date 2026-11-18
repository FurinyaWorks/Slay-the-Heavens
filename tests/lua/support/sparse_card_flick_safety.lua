local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local T=require('abyss_theme')
local passed=0
local function setup(touch)
 local h,u,p,e=H.setup({'defend','defend'},nil,{touchScreen=function()return touch end})
 return h,u,p,e,p:GetChild('card1').x,T.layout.hand.y
end
local function unchanged(b)
 assert(b.energy==3 and #b.hand==2 and b.player.block==0,'rejected release must preserve the hand and energy')
end
for _,touch in ipairs({false,true})do
 for _,kind in ipairs({'slow','lateral','cancel','oldTouch'})do
  local h,u,p,e,x,y=setup(touch)
  local b=h.run.combat
  e('card1','down',7,x,y)
  h:update(kind=='slow' and .2 or .05)
  if kind=='slow'then
   e('dragLayer','drag',7,x+5,y+75);e('dragLayer','up',7,x+5,y+75)
  elseif kind=='lateral'then
   e('dragLayer','drag',7,x+140,y+18);e('dragLayer','up',7,x+140,y+18)
  elseif kind=='cancel'then
   e('dragLayer','drag',7,x,0);e('dragLayer','drag',7,x,y);e('dragLayer','up',7,x,y)
  else
   -- A different pointer cannot finish the captured gesture, even at a valid endpoint.
   e('dragLayer','drag',8,x+5,y+75);e('dragLayer','up',8,x+5,y+75)
   unchanged(b)
   -- Resize invalidates the original press; late events cannot revive it.
   h:resize(1600,900)
   e('card1','up',7,x+5,y+75);e('card1','click',7,x+5,y+75)
  end
  unchanged(b)
  passed=passed+1;print('ok sparse safety '..passed..' '..kind..' touch='..tostring(touch))
 end
end
print('SPARSE_CARD_FLICK_SAFETY_PASS '..passed)
