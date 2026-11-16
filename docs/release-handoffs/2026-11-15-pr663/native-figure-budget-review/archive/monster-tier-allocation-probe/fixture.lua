-- Everything outside the art-only adapter is exact Release Host/Combat.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Native=dofile('tests/lua/support/native_art_controls.lua')
local Art=require('abyss_monster_art')
local buildView=Art.new
local current=setmetatable({},{__mode='k'})
local replaced=0
local function countSlots(control)
 if not control then return 0 end
 local n=0
 for _,g in pairs(control:GetChild('monsterSamples').children) do for _ in pairs(g.children)do n=n+1 end end
 return n
end
Art.new=function(stage,platform,data,surfaces)
 if not surfaces then return buildView(stage,platform,data,surfaces) end
 data=data or require('abyss_monster_art_data')
 for _,asset in pairs(data.assets) do asset.capacity=#asset.slots<=41 and 41 or 115 end
 local controller=buildView(stage,platform,data,surfaces)
 local select=controller.select
 controller.select=function(self,rows)
  for _,entry in ipairs(rows) do
   local box=assert(surfaces:find(entry.id))
   local asset=data.assets[data.bindings[entry.actor.definitionId]]
   local nextTier=asset and asset.capacity or 0
   local previous=current[box]
   if previous==nil or (mode=='art-only' and previous~=nextTier) then
    -- Fixture-only attach semantics. The native engine feasibility of adding a
    -- named subtree to an already-live actor is not modeled by aliasing here.
    if previous~=nil then
     self:release(box) -- drop cached root before destroying its subtree
     local old=box:GetChild('monsterArt')
     if old then assert(platform.monsterActors.destroy(old)==nil)end
     replaced=replaced+1
    end
    local spec=tiers[tostring(nextTier)]
    if spec then local a=F.control(spec,box);Native.decorate(a);box.children.monsterArt=a end
    current[box]=nextTier
   end
  end
  return select(self,rows)
 end
 return controller
end
local canvas=F.control({children=F.Layout})
local function initial(c,s)if s.position then c:SetAnchoredPosition(s.position[1],s.position[2])end
 for _,child in ipairs(s.children or {})do initial(c:GetChild(child.name),child)end
end
for _,s in ipairs(F.Layout)do initial(canvas:GetChild(s.name),s)end
local root=F.Viewport.apply(canvas,1280,720)
local panel=root:GetChild('battlePanel')
local platform={seed=1,prologue=false,campaign=true,imageSource='static',imageTypes={basic=17,stretch=23},color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end}
local host=F.GameUI.new(root,F.Data,F.Presentation,'click',platform)
local surfaces=assert(require('abyss_monster_surfaces').get(panel))
root.ui=host
assert(F.start(host));assert(require('abyss_run').startCombat(host.run,'cultist_solo'))
local function show(state)host.run.combat=state;host:refresh();return state end
local function battle(ids)return F.Combat.new(F.Data,{deck={'strike','strike','defend'},enemies=ids,seed=11})end
local function source(name,boundary)
 local room=assert(require('abyss_room_encounters').resolve(name,'normal'))
 return F.Combat.new(F.Data,{deck={'strike','strike','defend'},seed=11,sourceEncounter=room.sourceEncounter,encounterBoundary=boundary,enemies=room.enemies})
end
local function boxFor(a)return assert(surfaces:find(a.id))end
local function verifyShape(box,id)
 local art=assert(box:GetChild('monsterArt'))
 assert(art.visible and not box:GetChild('portrait').visible,'requested art not published at current tier')
 local shapeCount=#expected[id]
 local pool=art:GetChild('monsterSamples')
 for i=0,countSlots(art)-1 do
  local c=pool:GetChild(string.format('group%03d',math.floor(i/60))):GetChild(string.format('shape%04d',i))
  if i<shapeCount then
   assert(c.visible and c.imageId==expected[id][i+1].image,'visible shape mismatch')
   for ax=1,3 do assert(math.abs(c.rotation[ax]-expected[id][i+1].rotation[ax])<1e-7)end
  else assert(not c.visible,'stale visible tail')end
 end
 return shapeCount,countSlots(art),art
end
local function measure(state,label,shapes,slots)
 show(state)
 local total,reserved=0,0
 for _,enemy in ipairs(state.enemies)do local n,m=verifyShape(boxFor(enemy),enemy.definitionId);total,reserved=total+n,reserved+m end
 assert(total==shapes and slots==reserved)
 print('REAL_FORMATION_PASS',label,#state.enemies,total,reserved,#state.enemies*115)
end
measure(source('3 Louse',{misc={boolean=function()return true end}}),'3 Louse red-red-red',123,123)
measure(source('Exordium Thugs',{misc={integer=function()return 0 end,boolean=function()return true end},visualFloat=function()return 0 end}),'red louse + cultist',156,156)
local state=show(battle({'red_louse','green_louse'}))
local original=state.enemies[1]
local box,slot=surfaces:find(original.id)
local hit,hp,intent,status=box:GetChild('hit'),box:GetChild('hp'),box:GetChild('intent'),box:GetChild('statusRow')
local input=hit.click
local _,_,short=verifyShape(box,'red_louse')
local siblingBox=boxFor(state.enemies[2])
local _,_,siblingArt=verifyShape(siblingBox,'green_louse')
local function replace(id)
 local a=battle({id}).enemies[1]
 a.id,a.sourcePosition=original.id,original.sourcePosition
 state.enemies[1]=a
 show(state)
 local nextBox,nextSlot=surfaces:find(original.id)
 assert(nextBox==box and nextSlot==slot,'actor surface was destroyed/rebound')
 assert(box:GetChild('hit')==hit and hit.click==input and box:GetChild('hp')==hp and box:GetChild('intent')==intent and box:GetChild('statusRow')==status)
 assert(boxFor(state.enemies[2])==siblingBox and siblingBox:GetChild('monsterArt')==siblingArt)
 return a
end
replace('cultist')
local _,reserved,big=verifyShape(box,'cultist')
assert(reserved==115 and not short.alive and big~=short)
replace('red_louse')
local _,again,last=verifyShape(box,'red_louse')
assert(again==41 and not big.alive and last~=big and last~=short and replaced==2)
print('SAME_SURFACE_SWAP_PASS',41,115,41,replaced)
-- Verify target listener still routes through the existing live actor.
local hpBefore=state.enemies[1].hp
local strike
for n,card in ipairs(state.hand)do if card.cardId=='strike'then strike=n;break end end
assert(strike and hpBefore>6)
panel:GetChild('card'..strike):GetChild('hit').click()
hit.click()
assert(state.enemies[1].hp<hpBefore and state.enemies[2].hp==state.enemies[2].maxHp)
print('TARGET_ROUTE_PASS')
-- Retire just one; the other actor and its art retain control ownership.
state.enemies[1].hp=0
host.battleUI.feedback:cancel()
host.battleUI:render()
assert(not surfaces:find(original.id) and not box.alive and not last.alive)
assert(boxFor(state.enemies[2])==siblingBox and siblingArt.alive)
print('RETIREMENT_PASS')
