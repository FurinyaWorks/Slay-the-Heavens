local V=dofile('tests/lua/support/hand_layout_values_fixture.lua')
local CardView=require('abyss_battle_card_view')
local apply=V.upvalue(CardView.new,'applyHandPose')
local values,index=V.upvalue(apply,'handValues')
local temporary,calls=0,0
debug.setupvalue(apply,index,function(...)
 local a,b,c,d,e,f,g,h=values(...);calls=calls+1
 if type(a)=='table'then temporary=temporary+1 end
 return a,b,c,d,e,f,g,h
end)
local construct,created=CardView.new
CardView.new=function(...)created=construct(...);return created end
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local host,ui,panel,event=H.setup({'strike','defend','strike','defend','strike'},{'cultist'},{touchScreen=function()return true end})
for _=1,90 do host:update(1/60)end
local run,battle=host.run,host.run.combat
local before=H.F.Combat.copy(run);before.elapsedSeconds=nil
local function geometry()
 local held=ui.gesture or ui.carry
 for uid,entry in pairs(V.upvalue(created.update,'handPoses'))do
  if not(held and held.moving and held.uid==uid)then
   local box=entry.box;local hit=box:GetChild('hit');local expected=V.reference(entry.current,entry.target)
   local actual={box.x,box.y,box.scale[1],box.localRotationZ,hit.x,hit.y,hit.sizeDeltaX,hit.sizeDeltaY}
   for i=1,8 do assert(actual[i]==expected[i],'actual Host geometry changed '..i)end
   assert(hit.localRotationZ==-expected[4] and hit.scale[1]==1 and hit.scale[2]==1)
   assert(ui.cardPositions[uid][1]==entry.current.x and ui.cardPositions[uid][2]==entry.current.y)
  end
 end
end
temporary,calls=0,0
local positions=0
for _=1,300 do
 local prior={};for uid,point in pairs(ui.cardPositions)do prior[uid]=point end
 host:update(1/60);geometry()
 for uid,point in pairs(ui.cardPositions)do
  assert(point~=prior[uid],'published origin snapshots must remain fresh')
  assert(point[1]==prior[uid][1]and point[2]==prior[uid][2]);positions=positions+1
 end
end
assert(calls==1500 and temporary==0 and positions==1500,'cache-hit temporary return tuple regressed')
for i=1,20 do ui:setHover(i%5+1);host:update(.05);geometry()end
ui:setHover(nil);host:update(10);geometry()
local uid=battle.hand[1].uid;local point=ui.cardPositions[uid];local x,y=point[1],point[2]
event('card1','down',23);local gesture=assert(ui.gesture);assert(gesture.origin==point)
event('card1','drag',23,100,0);assert(gesture.moving)
for _=1,12 do host:update(.05);geometry();assert(gesture.origin==point and point[1]==x and point[2]==y)end
event('dragLayer','up',23,100,-300);host:update(10);geometry()
assert(not ui.gesture and not ui.carry,'invalid touch drop did not retire its gesture')
host:resize(1600,900);host:update(10);geometry()
host:resize(1280,720);host:update(10);geometry()
assert(host.run==run and run.combat==battle)
local after=H.F.Combat.copy(run);after.elapsedSeconds=nil;assert(V.same(before,after),'layout changed full core/RNG state')
assert(temporary==0,'hover/drag/resize returned a temporary tuple')
assert(host:disable())
print('HAND_LAYOUT_HOST_PASS idle=300 temporaryTuples=0 originSnapshots=1500 hover=20 drag=12 resize=2 runRngEqual=true')
