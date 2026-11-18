local H=dofile('tests/lua/support/battle_action_fixture.lua')
local h,ui,panel,_,tap=H.setup({'strike','strike'},{'cultist','cultist'})
local function actor(slot)return H.F.actorControl(panel,'enemy'..slot)end
local function snapshot(root,out)
 out=out or{}
 out[root]={kind=root.kind,width=root.sizeDeltaX,height=root.sizeDeltaY,raycast=root.raycastTarget}
 for _,child in pairs(root.children or{})do snapshot(child,out)end
 return out
end
local before=snapshot(panel)
local function conserved()
 local after=snapshot(panel);local n,m=0,0
 for handle,value in pairs(before)do
  n=n+1;local actual=assert(after[handle],'a native control was replaced')
  assert(value.kind==actual.kind,'native control kind changed')
  -- Card selection legitimately enlarges hand-card corners. Target marker
  -- geometry and its input properties remain fixed while those states change.
  if handle.name:match('^target[HV]')then
   assert(value.width==actual.width and value.height==actual.height and value.raycast==actual.raycast,'target native shape/input changed')
  end
 end
 for _ in pairs(after)do m=m+1 end
 assert(n==m,'target corners added native controls')
end
local function corners(box,selected)
 local half=box:GetChild('portrait').sizeDeltaX/2
 for _,x in ipairs({-1,1})do for _,y in ipairs({-1,1})do
  local horizontal=box:GetChild('targetH'..x..'_'..y)
  local vertical=box:GetChild('targetV'..x..'_'..y)
  assert(horizontal.visible==selected and vertical.visible==selected,'target corners stale/missing')
  assert(horizontal.sizeDeltaX==20 and horizontal.sizeDeltaY==3 and vertical.sizeDeltaX==3 and vertical.sizeDeltaY==20)
  assert(horizontal.x==x*(half-horizontal.sizeDeltaX/2) and horizontal.y==y*half,'horizontal corner crosses its anchor')
  assert(vertical.x==x*half and vertical.y==y*(half-vertical.sizeDeltaY/2),'vertical corner crosses its anchor')
 end end
end
h:update(.1);corners(actor(1),false);corners(actor(2),false)
-- Baseline comparison starts after the normal first render/preparation geometry.
before=snapshot(panel)
local energy,hp=ui.run.combat.energy,ui.run.combat.enemies[1].hp
tap('card1',1);assert(ui.selected);corners(actor(1),true);corners(actor(2),true);conserved()
tap('card1',2);assert(not ui.selected);corners(actor(1),false);corners(actor(2),false);conserved()
assert(ui.run.combat.energy==energy and ui.run.combat.enemies[1].hp==hp,'selection altered combat')
-- The same Host and source actor pool are rebound; old selection must not leak.
ui.run.combat=H.F.Combat.new(H.F.Data,{deck={'strike'},enemies={'lagavulin'},seed=42})
h:refresh();h:update(.1);corners(actor(1),false)
before=snapshot(panel);tap('card1',3);assert(ui.selected);corners(actor(1),true);conserved()
tap('card1',4);assert(not ui.selected);corners(actor(1),false);conserved()
h:disable()
print('TARGET_CORNER_GEOMETRY_PASS four inward L pairs selected cancelled reused slot zero controls')
