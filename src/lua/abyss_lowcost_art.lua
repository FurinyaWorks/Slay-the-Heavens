-- Small authored illustrations on existing icon/Actor owners; no gameplay state.
local Theme=require('abyss_theme')
local M={}
local painted=setmetatable({},{__mode='k'})
local function poolFor(icon)
 if not icon or icon.alive==false then return nil end
 if type(icon.name)~='string' then return nil end
 local parent=icon and icon.parent
 if not parent or parent.alive==false then return nil end
 local ok,pool=pcall(parent.GetChild,parent,icon.name..'Art')
 if not ok or not pool or pool.alive==false then return nil end
 return pool
end
local function visible(control,value)return control:SetVisible(value)~=false end
local function current(pool,icon,state)
 return painted[pool]==state and pool.alive~=false and icon.alive~=false
  and icon.parent==state.parent and pool.parent==state.parent
end
local function fallback(pool,icon,state,restore)
 visible(pool,false)
 local active=painted[pool]
 if not active or not current(pool,icon,active)then return end
 if active~=state then
  -- The outer visibility write may have hidden a newly painted event.
  if not active.asset then return end
  active.ready=false
 elseif restore==false then return end
 visible(icon,true)
end
local function check(pool,icon,state)
 if current(pool,icon,state)then return end
 local newer=painted[pool]
 if newer and current(pool,icon,newer)then
  newer.ready=false;fallback(pool,icon,newer)
 end
 error('artwork ownership changed')
end
local function colour(pool,icon,state,control,r,g,b,a)
 local value=state.color(r,g,b,a);check(pool,icon,state)
 control.imageColor=value;check(pool,icon,state)
end
local function matches(state,asset,size,platform)
 return state.asset==asset and state.size==size and state.source==platform.imageSource
  and state.color==platform.color and state.fillRight==platform.imageFillRight
end
local function reveal(pool,icon,old)
  local ok=pcall(function()
   local accepted=visible(pool,true);check(pool,icon,old);assert(accepted)
   accepted=visible(icon,false);check(pool,icon,old);assert(accepted)
  end)
  if not ok and current(pool,icon,old)then old.ready=false;fallback(pool,icon,old)end
  return ok and current(pool,icon,old)
end
local function drawEventShape(call, control, shape, fillRight)
 call(control,'SetPivot',shape.pivot[1],shape.pivot[2])
 call(control,'SetLocalScale',shape.scale[1],shape.scale[2],1)
 call(control,'SetLocalRotation',shape.rotation[1],shape.rotation[2],shape.rotation[3])
 if shape.halfMask then
  assert(fillRight~=nil,'horizontal mask direction unavailable')
  call(control,'SetFillHorizontal',fillRight,.5)
 else
  call(control,'SetFillUnused')
 end
end
local function draw(pool,icon,token,registry,asset,size,platform)
 local function call(control,method,...)
  check(pool,icon,token)
  local accepted=control[method](control,...);check(pool,icon,token)
  assert(accepted~=false,'artwork setter rejected')
 end
 return pcall(function()
  -- The imported sibling already shares the icon's authored anchor position.
  -- Native handles need not expose initial x/y getters before their first write.
  call(pool,'SetVisible',false)
  call(pool,'SetLocalScale',size/registry.canvas,size/registry.canvas,1)
  for i=1,registry.capacity do
   local control=pool:GetChild('shape'..(i-1));local shape=asset.shapes[i]
   if shape then
    call(control,'SetImage',platform.imageSource,shape.image)
    if shape.pivot then
     control.enableMask=shape.halfMask;check(pool,icon,token)
     drawEventShape(call,control,shape,token.fillRight)
    end
    call(control,'SetAnchoredPosition',shape.x,shape.y);call(control,'SetSizeDelta',shape.w,shape.h)
    if not shape.pivot then call(control,'SetLocalRotation',0,0,shape.rotation or 0) end
    local c=shape.colour;colour(pool,icon,token,control,c.r,c.g,c.b,c.a or 255)
   end
   call(control,'SetVisible',shape~=nil)
  end
  call(pool,'SetVisible',true);call(icon,'SetVisible',false)
 end)
end
local function finish(pool,icon,token,ok)
 if not ok and current(pool,icon,token)then token.failed=true;fallback(pool,icon,token)end
 if ok and current(pool,icon,token)then token.ready=true;return true end
 return false
end
function M.paint(icon,kind,id,size,platform)
 local pool=poolFor(icon);if not pool then return false end
 local registry=Theme.lowCostArt and Theme.lowCostArt[kind]
 local asset=registry and registry.assets[id]
 if not asset or not platform.imageSource or not platform.color then
  M.hide(icon)
  return false
 end
 local old=painted[pool]
 if old and old.failed and matches(old,asset,size,platform)then return false end
 if old and old.ready and matches(old,asset,size,platform)then return reveal(pool,icon,old)end
 local token={asset=asset,size=size,source=platform.imageSource,color=platform.color,fillRight=platform.imageFillRight,
  parent=icon.parent,pose=old and old.pose,dim=old and old.dim}
 painted[pool]=token
 return finish(pool,icon,token,draw(pool,icon,token,registry,asset,size,platform))
end
function M.hide(icon,restore)
 local pool=poolFor(icon)
 if not pool then return end
 local token={parent=icon.parent}
 painted[pool]=token
 fallback(pool,icon,token,restore)
 if current(pool,icon,token)then painted[pool]=nil end
end
function M.scale(icon,scale)
 local pool=poolFor(icon);local state=pool and painted[pool]
 if state then pool:SetLocalScale(state.size/100*scale,state.size/100*scale,1)end
end
function M.pose(box,x,y,sx,sy,tone,alpha)
 local icon=box:GetChild('portrait');local pool=poolFor(icon);local state=pool and painted[pool]
 if not state or not state.ready then return end
 local opacity=(state.dim or 1)*alpha
 local key=table.concat({tone.r,tone.g,tone.b,tone.a or 255,opacity},':')
 local ok=pcall(function()
  local accepted=pool:SetAnchoredPosition(x,y);check(pool,icon,state);assert(accepted~=false)
  accepted=pool:SetLocalScale(state.size/100*sx,state.size/100*sy,1);check(pool,icon,state);assert(accepted~=false)
  state.pose={x=x,y=y,sx=sx,sy=sy,tone=tone,alpha=alpha}
  if state.tone==key then return end
  for i,shape in ipairs(state.asset.shapes)do
   local c=shape.colour
   colour(pool,icon,state,pool:GetChild('shape'..(i-1)),math.floor(c.r*tone.r/255),math.floor(c.g*tone.g/255),
    math.floor(c.b*tone.b/255),math.floor((c.a or 255)*(tone.a or 255)/255*opacity))
  end
  state.tone=key
 end)
 if not ok and current(pool,icon,state)then state.ready=false;visible(pool,false);visible(icon,true)end
end
function M.dim(icon,alpha)
 local pool=poolFor(icon);local state=pool and painted[pool]
 if state then state.dim=alpha end
end
function M.refresh(box,tone)
 local icon=box:GetChild('portrait');local pool=poolFor(icon);local state=pool and painted[pool]
 if not state or not state.ready then return end
 local pose=state.pose
 if pose then M.pose(box,pose.x,pose.y,pose.sx,pose.sy,pose.tone,pose.alpha)
 else M.pose(box,icon.x or 0,icon.y or 0,icon.localScaleX or 1,icon.localScaleY or 1,tone,1)end
end
return M
