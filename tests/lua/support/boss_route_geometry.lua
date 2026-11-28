local UI,Layout=require('abyss_map_ui'),require('abyss_map_layout')
local style=Layout.bossRoute
local eps=1e-6
local function approx(a,b) assert(math.abs(a-b)<eps,tostring(a)..' != '..tostring(b)) end
local overflow=0
for lane=-3,3 do
 local x,y=lane*112,-180
 local length=math.sqrt(x*x+y*y)
 local ux,uy=x/length,y/length
 local worst=0
 for seed=0,100 do
  local marks=UI.bossRouteDashes(x,y,0,0,seed)
  assert(#marks>=5)
  worst=math.max(worst,#marks)
  for i,mark in ipairs(marks) do
   local distance=mark.x*ux+mark.y*uy
   approx(distance,style.bossReserve+style.pitch*(seed%101)/200+(i-1)*style.pitch)
   assert(length-distance>=style.sourceReserve-eps)
   local drift=math.abs(mark.x*uy-mark.y*ux)
   local angle=math.abs(mark.angle-math.atan(-uy,-ux)*180/math.pi)
   assert(drift<=1.25+eps and angle<=9+eps)
   if i==1 or i==#marks then approx(drift,0);approx(angle,0) end
   approx(math.sqrt(mark.dx^2+mark.dy^2)*2,style.length)
   -- Any point of the thickest stroke still clears the fitted art envelope.
   assert(math.sqrt(mark.x^2+mark.y^2)-math.sqrt(mark.dx^2+mark.dy^2+(UI.pathWidth(true,false)/2)^2)>Layout.bossInk.size/2)
  end
 end
 overflow=overflow+math.max(0,worst-style.sharedSlots)
end
assert(overflow==32 and overflow==style.overflow)
local x1,y1,x2,y2=UI.clipBossDash(-600,5,600,125,-200,3,180,200)
approx(x1,-200);approx(y1,45);approx(x2,180);approx(y2,83)
x1,y1,x2,y2=UI.clipBossDash(0,-20,0,80,-200,3,180,50)
approx(x1,0);approx(y1,3);approx(x2,0);approx(y2,50)
assert(not UI.clipBossDash(-10,-100,10,-20,-200,3,180,50))
assert(not UI.clipBossDash(0,51,10,51,-200,3,180,50))
print('PRODUCTION_BOSS_ROUTE_PASS')
