-- Reference spike only: never mounted by production builds.
-- STS1 Soul/CardTrailEffect: historical curve, warm core, 0.5s residual fade.
-- Budget: six halo/core pairs + six grey fragments = 18 reusable images.
local M={}
function M.layout()
 local root={name='referenceSpike',kind='container',size={1280,720},children={}}
 for i=1,18 do root.children[i]={name='part'..i,kind='image',image=i<=12 and 100002 or 100001,
  position={0,0},size={6,6},colour=i<=12 and '#FFD58A' or '#989391',visible=false,
  feather={pixels={i<=6 and 5 or 1.5,i<=6 and 4 or 1.5}}}end
 return root
end
local function spline(points,n,t)
 local u=t*(n-1);local k=math.min(n-1,math.floor(u)+1);local f=u-k+1
 local p0,p1,p2,p3=points[math.max(1,k-1)],points[k],points[k+1],points[math.min(n,k+2)]
 local function axis(i)return .5*((2*p1[i])+(-p0[i]+p2[i])*f+(2*p0[i]-5*p1[i]+4*p2[i]-p3[i])*f*f+(-p0[i]+3*p1[i]-3*p2[i]+p3[i])*f*f*f)end
 return axis(1),axis(2)
end
function M.new(root,platform,burn)
 local self={count=0,remaining=0,points={}}
 for i=1,10 do self.points[i]={0,0}end
 local parts={};for i=1,18 do parts[i]=root:GetChild('part'..i)end
 function self.reset()
  self.count,self.remaining=0,0;for _,part in ipairs(parts)do part:SetVisible(false)end
 end
 local function remember(x,y)
  if self.count==10 then for i=1,9 do self.points[i][1],self.points[i][2]=self.points[i+1][1],self.points[i+1][2]end
  else self.count=self.count+1 end
  self.points[self.count][1],self.points[self.count][2]=x,y
 end
 function self.update(entry,card,dt)
  for _,part in ipairs(parts)do part:SetVisible(false)end
  self.remaining=math.max(0,self.remaining-dt)
  if entry and card.visible and entry.to=='exhaust' then
   -- ExhaustCardEffect stays at the display position; the normal discard
   -- trail visible at the same time can belong to another played card.
   local q=math.max(0,(entry.age-burn.hold)/burn.burn)
   if q>=1 then card:SetVisible(false);return end
   if q>0 then for i=13,18 do
    local part=parts[i];local n=i-12;local size=(8+n%3*3)*(1-q*.4)
    part:SetVisible(true);part:SetSizeDelta(size,size)
    part:SetAnchoredPosition(card.x+math.sin(n*2.1)*(8+q*22),card.y-18+n*8+q*(18+n*4))
    part.localRotationZ=n*31+q*60
    part.imageColor=platform.color(170,163,156,math.floor((1-q)*210))
   end end
   return
  elseif entry and card.visible then
   if self.count==0 then remember(entry.start[1],entry.start[2])end
   remember(card.x,card.y);self.remaining=.5
  end
  if self.count<4 or self.remaining==0 then return end
  local fade=self.remaining/.5
  for i=1,6 do
   local x1,y1=spline(self.points,self.count,(i-1)/6)
   local x2,y2=spline(self.points,self.count,i/6)
   local dx,dy=x2-x1,y2-y1;local length=math.sqrt(dx*dx+dy*dy)
   local weight=i/6;local width=3+weight*8
   for _,core in ipairs({false,true})do
    local part=parts[i+(core and 6 or 0)]
    part:SetVisible(true);part:SetAnchoredPosition((x1+x2)/2,(y1+y2)/2)
    part:SetSizeDelta(length+12,core and width*.45 or width*1.6)
    part.localRotationZ=math.atan(dy,dx)*180/math.pi
    part.imageColor=core and platform.color(255,241,174,math.floor((60+weight*170)*fade))
     or platform.color(255,147,40,math.floor((50+weight*110)*fade))
   end
  end
 end
 return self
end
return M
