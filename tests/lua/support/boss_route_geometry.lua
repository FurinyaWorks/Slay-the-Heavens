local m=require('abyss_map_ui')
local eps=1e-6
local function approx(a,b) assert(math.abs(a-b)<eps,tostring(a)..' != '..tostring(b)) end
for n=1,7 do
 local priorx=-100
 for rank=1,n do
  local x,drop=m.bossRoutePort(rank,n,2)
  local dx,deep=m.bossRoutePort(rank,n,10.5)
  approx(dx,x)
  assert(x>priorx and x>=-16 and x<=16 and deep>drop)
  priorx=x
 end
end
local a,b=m.bossRoutePort(1,3,2);approx(a,-16);approx(b,66.32)
a,b=m.bossRoutePort(2,3,2);approx(a,0);approx(b,70.7)
a,b=m.bossRoutePort(3,3,2);approx(a,16);approx(b,66.32)
for _,start in ipairs({-336,-112,0,112,336}) do
 for _,port in ipairs({-16,0,16}) do
  local xx,yy=m.bossRoutePoint(start,20,port,65,0);approx(xx,start);approx(yy,20)
  for i=1,100 do
   local x,y=m.bossRoutePoint(start,20,port,65,i/100)
   assert(y>yy and (start==port or start<port and x>xx or start>port and x<xx))
   xx,yy=x,y
  end
  approx(xx,port);approx(yy,65)
 end
end
local x1,y1,x2,y2=m.clipBossDash(-600,5,600,125,-200,3,180,200)
approx(x1,-200);approx(y1,45);approx(x2,180);approx(y2,83)
x1,y1,x2,y2=m.clipBossDash(0,-20,0,80,-200,3,180,50)
approx(x1,0);approx(y1,3);approx(x2,0);approx(y2,50)
assert(not m.clipBossDash(-10,-100,10,-20,-200,3,180,50))
assert(not m.clipBossDash(0,51,10,51,-200,3,180,50))
print('PRODUCTION_BOSS_ROUTE_PASS')
