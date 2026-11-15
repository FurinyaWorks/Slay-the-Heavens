local M={}
function M.upvalue(fn,name)
 for i=1,100 do local key,value=debug.getupvalue(fn,i);if key==name then return value,i end;if not key then break end end
 error('missing hand geometry upvalue '..name)
end
-- Exact pre-refactor tuple formula; kept only as the numerical regression oracle.
function M.reference(pose,target)
 local Theme=require('abyss_theme');local L=Theme.layout
 local w,h=L.card.size[1],L.card.size[2]
 local r=target.restAngle*math.pi/180
 local c,s=math.abs(math.cos(r)),math.abs(math.sin(r))
 local restH,restW=(h*c+w*s)/2,(w*c+h*s)/2
 local hotH=h*Theme.motion.hoverScale/2
 local hotY=math.max(target.baseY+Theme.motion.hoverLift,-Theme.canvas.base[2]/2+Theme.canvas.safe.y+hotH)
 local low=math.min(target.baseY-restH,hotY-hotH)
 local high=math.max(target.baseY+restH,hotY+hotH)
 local dy,a=(low+high)/2-pose.y,pose.angle*math.pi/180
 local width=math.max(restW*2,w*Theme.motion.hoverScale)
 return {pose.x,pose.y,pose.scale,pose.angle,
  math.sin(a)*dy/pose.scale,math.cos(a)*dy/pose.scale,
  math.min(width,target.hitWidth or width)/pose.scale,(high-low)/pose.scale}
end
function M.same(a,b)
 if type(a)~='table'or type(b)~='table'then return a==b end
 for k,v in pairs(a)do if not M.same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end;return true
end
return M
