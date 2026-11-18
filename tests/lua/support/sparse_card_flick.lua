local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local T=require('abyss_theme')
local passed=0
for _,count in ipairs({2,5,10})do
 for _,touch in ipairs({false,true})do
  for _,drag in ipairs({false,true})do
   local deck={};for i=1,count do deck[i]='defend'end
   local h,u,p,e,_,drain=H.setup(deck,nil,{touchScreen=function()return touch end})
   local b=h.run.combat
   H.F.Combat.draw(b,count-#b.hand);u:render()
   assert(#b.hand==count,'exercise the requested hand size')
   local x,y=p:GetChild('card1').x,T.layout.hand.y
   local uid=b.hand[1].uid
   e('card1','down',7,x,y)
   h:update(.05)
   if drag then e('dragLayer','drag',7,x+5,y+75)end
   e(drag and 'dragLayer' or 'card1','up',7,x+5,y+75)
   assert(b.energy==2 and #b.hand==count-1 and b.player.block==5,
    'a fast upward release with zero or one Drag must play exactly one defend')
   for _,card in ipairs(b.hand)do assert(card.uid~=uid,'the captured UID was played')end
   e('card1','endDrag',7,x+5,y+75);e('card1','click',7,x+5,y+75)
   drain()
   e('card1','up',7,x+5,y+75);e('card1','click',7,x+5,y+75)
   assert(b.energy==2 and #b.hand==count-1 and b.player.block==5,
    'duplicate release and trailing Click must not play the replacement slot')
   passed=passed+1;print('ok sparse flick '..passed..' hand='..count..' touch='..tostring(touch)..' drag='..tostring(drag))
  end
 end
end
print('SPARSE_CARD_FLICK_PASS '..passed)
