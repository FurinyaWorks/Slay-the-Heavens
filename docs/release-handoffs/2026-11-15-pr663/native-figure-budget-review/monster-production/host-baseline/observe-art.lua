-- Synthetic counters scoped to monster-art subtree. Readbacks during assertions excluded.
local M={}
local scope=nil
function M.begin(name)
 assert(not scope)
 scope={name=name,GetChild=0,GetChildren=0,imageColor=0,identicalRGBA=0,SetImage=0,SetLocalRotation=0}
end
function M.finish()
 local c=assert(scope);scope=nil
 print('MONSTER_ART_COUNTS',c.name,c.GetChild,c.GetChildren,c.imageColor,c.identicalRGBA,c.SetImage,c.SetLocalRotation)
end
function M.attach(root)
 local function add(control)
  if control._countedMonsterArt then return end
  control._countedMonsterArt=true
  local kind=control.name or ''
  local slot=kind:match('^shape%d+$')~=nil
  for _,meth in ipairs({'GetChild','GetChildren','SetImage','SetLocalRotation'})do
   local old=control[meth]
   if old then control[meth]=function(self,...)
    if scope then scope[meth]=scope[meth]+1 end
    return old(self,...)
   end end
  end
  if slot then
   local old=assert(getmetatable(control))
   local current=control.imageColor
   rawset(control,'imageColor',nil)
   local mt={};for k,v in pairs(old)do mt[k]=v end
   mt.__index=function(t,k)
    if k=='imageColor' then return current end
    if type(old.__index)=='function' then return old.__index(t,k) end
    if type(old.__index)=='table' then return old.__index[k] end
   end
   mt.__newindex=function(t,k,v)
    if k=='imageColor' then
     if scope then
      scope.imageColor=scope.imageColor+1
      if current and v and current.r==v.r and current.g==v.g and current.b==v.b and current.a==v.a then
       scope.identicalRGBA=scope.identicalRGBA+1
      end
     end
     current=v;return
    end
    if old.__newindex then return old.__newindex(t,k,v) end
    rawset(t,k,v)
   end
   setmetatable(control,mt)
  end
  for _,child in pairs(control.children or {})do add(child)end
 end
 add(root)
end
return M
