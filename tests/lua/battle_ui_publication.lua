local F=dofile('tests/lua/support/game_ui_fixture.lua')
local View=require('abyss_monster_intent_particle_view')
local Powers=require('abyss_monster_power_surfaces')

local mode=arg and arg[1]
local case=arg and arg[2]
local measure=mode=='measure'
local geometry={x=0,y=0,intentX=10,intentY=20,sourceScale=1}
local function instrument(control,name,counts)
 local method=assert(control[name])
 control[name]=function(self,...)
  counts[name]=(counts[name] or 0)+1
  return method(self,...)
 end
end
local function particle(source,onCreate)
 local box=F.control(F.Templates.AbyssMonsterActor)
 local platform=F.withMonsterActors({})
 local native=platform.monsterActors.instantiate
 local counts={}
 platform.monsterActors.instantiate=function(index,parent)
  local control=native(index,parent)
  for _,name in ipairs({'GetChild','SetVisible','SetAnchoredPosition','SetAsLastSibling'})do
   instrument(control,name,counts)
  end
  if index==platform.monsterActors.powerTemplateIndex then
   for _,part in pairs(control.children)do instrument(part,'SetVisible',counts)end
   local icon=control.children.icon
   for _,name in ipairs({'SetImage','SetSizeDelta','SetAnchoredPosition','SetLocalRotation','SetLocalScale'})do
    instrument(icon,name,counts)
   end
   -- These native properties are not exposed by the generic Host mock.
   local position,rotation=icon.SetAnchoredPosition,icon.SetLocalRotation
   function icon:SetAnchoredPosition(x,y)
    position(self,x,y)
    self.anchoredPositionX,self.anchoredPositionY=x,y
   end
   function icon:SetLocalRotation(x,y,z)
    rotation(self,x,y,z)
    self.localRotationX,self.localRotationY,self.localRotationZ=x,y,z%360
   end
   if onCreate then onCreate(control)end
  end
  return control
 end
 local view=View.new(platform,function(c,id)return c:SetImage('static',id)end,
  function(c,value)c.imageColor=value end)
 local battle={events={}}
 view:sync({{id='a'}},battle,nil,true)
 view:update('a',.51,{sourceEnum=source},geometry)
 local function paint(allowed)view:paint(box,'a',geometry,allowed)end
 local function control()
  for _,name in ipairs({'intentVfxBehind','intentVfxAfter'})do
   local pool=Powers.get(box:GetChild(name))
   local c=pool and pool:find('1')
   if c then return c end
  end
  error('missing active particle')
 end
 return view,box,paint,control,counts
end

local function stableParticle()
 local _,_,paint,control,counts=particle('UNKNOWN')
 paint(true)
 local c=control()
 local icon=c.children.icon
 local previous=counts.SetVisible
 local timer=os.clock()
 for _=1,300 do paint(true)end
 if measure then
  print('particle fixed',os.clock()-timer,counts.GetChild,counts.SetVisible,counts.SetImage,
   counts.SetSizeDelta,counts.SetLocalRotation,counts.SetLocalScale,counts.SetAnchoredPosition,counts.SetAsLastSibling)
  return
 end
 assert(counts.SetImage==1 and counts.SetSizeDelta==1 and counts.SetLocalRotation==1 and counts.SetVisible==previous,
  'UNKNOWN republished stable appearance')
 assert(counts.SetLocalScale==301,'dynamic scale was skipped')
 local rotation=icon.rotation[3]
 c.children.edge:SetVisible(true)
 c:SetVisible(false)
 icon:SetVisible(false)
 icon:SetImage('static',600)
 icon:SetSizeDelta(1,2)
 icon:SetAnchoredPosition(10,20)
 icon:SetLocalRotation(0,0,0)
 paint(true)
 assert(not c.children.edge.visible and c.visible and icon.visible and icon.imageId~=600
  and icon.sizeDeltaX==128 and icon.sizeDeltaY==128 and icon.x==0 and icon.y==0
  and icon.rotation[3]==rotation,'native drift was not restored')
 paint(false)
 assert(not c.visible)
end

local function particleLifecycle()
 local view,box,paint,control,counts=particle('STUN')
 paint(true)
 local c=control()
 local old=c.children.icon.rotation[3]
 view:update('a',.01,{sourceEnum='STUN'},geometry)
 paint(true)
 assert(c.children.icon.rotation[3]==old-.6 and counts.SetLocalRotation==2,'STUN rotation stopped')
 view:release(box)
 assert(not c.alive)
 paint(true)
 assert(control()~=c and counts.SetImage==2,'release did not invalidate appearance')
 local icon=control().children.icon
 icon:SetImage('static',600)
 icon.SetImage=function()return false end
 assert(not pcall(paint,true) and not icon.alive,'rejected image left a published effect')
 view:clear()
 local battle={events={}}
 view:sync({{id='a'}},battle,nil,true)
 view:update('a',.51,{sourceEnum='STUN'},geometry)
 paint(true)
 assert(control().children.icon.imageId~=600)
end

local function reentrantChildLookup()
 local view
 local retired=false
 local function bind(control)
  local get=control.GetChild
  function control:GetChild(name)
   assert(not retired,'native read after engine teardown')
   local part=get(self,name)
   if name=='icon' then view:onEngineDestroy();retired=true end
   return part
  end
 end
 local _,_,paint
 view,_,paint=particle('UNKNOWN',bind)
 local ok,reason=pcall(paint,true)
 assert(retired and not ok and tostring(reason):find('intent particle publication cancelled'),tostring(reason))
end

local function reentrantPaint()
 local _,_,paint,control=particle('UNKNOWN')
 paint(true)
 local c=control()
 local icon=c.children.icon
 local scale=icon.SetLocalScale
 local invoked=false
 function icon:SetLocalScale(...)
  if not invoked then invoked=true;paint(true)end
  scale(self,...)
 end
 paint(true);paint(true)
 assert(invoked and c.alive and control()==c,'same-owner reentry retired a live particle')
end

local function rejectedHide()
 local host,root=F.fixture()
 local panel=root:GetChild('battlePanel')
 local controls={panel:GetChild('hero'),panel:GetChild('card1'),panel:GetChild('statusInfo'),
  panel:GetChild('potionHelp'):GetChild('potionPopup')}
 local attempts={}
 for _,control in ipairs(controls)do
  local hide=control.SetVisible
  attempts[control]=0
  control.visible=true
  function control:SetVisible(value)
   attempts[self]=attempts[self]+1
   if attempts[self]==1 then return false end
   return hide(self,value)
  end
 end
 host.battleUI:render()
 host.battleUI:setActive(false)
 for _,control in ipairs(controls)do
  assert(not control.visible and attempts[control]>=2,'rejected hidden projection suppressed its retry: '..control.name)
 end
end

local function selection()
 local host,root=F.fixture()
 local panel=root:GetChild('battlePanel')
 local counts={}
 instrument(panel,'GetChild',counts)
 local render=host.battleUI.render
 local renders=0
 host.battleUI.render=function(self,...)
  renders=renders+1
  return render(self,...)
 end
 local timer=os.clock()
 for _=1,5 do assert(host:start());assert(host:closeCharacters())end
 if measure then
  print('selection',os.clock()-timer,renders,counts.GetChild or 0)
  return
 end
 assert(renders==0,'selection toggles repainted an already-cleared battle')
 assert(not panel.visible and not host.battleUI.active and not host.run)
end

local function abandon(feedback)
 local gesture=dofile('tests/lua/support/battle_gesture_fixture.lua')
 local host,battleUI,panel,event,_,_,_,root=gesture.setup({'defend','defend'})
 local old=host.run.combat
 if feedback then
  battleUI:endTurn()
  assert(battleUI.busy,'expected feedback in progress')
 else
  event('card1','down',3)
  assert(battleUI.gesture and battleUI.help,'expected held card')
  host:update(.4)
  assert(battleUI.info,'expected the long-press detail to open')
 end
 assert(host:openMenu())
 assert(host:returnToMainMenu())
 assert(host:requestNavigation('abandon'))
 local render=host.battleUI.render
 local retired=0
 battleUI.render=function(self,...)
  if not self.run then retired=retired+1 end
  return render(self,...)
 end
 assert(host:confirmNavigation())
 assert(retired>=1,'abandon did not render the old battle away')
 assert(not panel.visible and not battleUI.active and not battleUI.busy and not battleUI.displayBattle
  and not battleUI.viewRun and not battleUI.viewBattle and not battleUI.gesture and not battleUI.help)
 local previous=retired
 host:update(.05)
 assert(host:start());assert(host:closeCharacters())
 assert(retired==previous,'old battle ownership forced repeated retirement')
 assert(F.start(host))
 if host.mode=='node' then
  F.click(root,'nodePanel','eventView/option1')
  F.click(root,'nodePanel','eventView/option2')
  F.click(root,'nodePanel','eventView/option1')
  assert(host.mode=='map')
 end
 assert(host.mapUI:choose(F.Nodes.available(host.run,host.map)[1].id))
 host:refresh()
 local new=host.run.combat
 assert(battleUI.active and battleUI.viewBattle==new and new~=old)
 if not feedback then
  local energy,events=new.energy,#new.events
  event('card1','up',3)
  event('card1','endDrag',3)
  event('card1','click',3)
  assert(new.energy==energy and #new.events==events and not battleUI.selected,'late input crossed Run ownership')
 end
end

if not case or case=='particle' then stableParticle();if not measure then particleLifecycle();reentrantChildLookup();reentrantPaint()end end
if not case or case=='selection' then selection();if not measure then rejectedHide()end end
if not measure and (not case or case=='abandon') then abandon(false);abandon(true)end
print('BATTLE_UI_PUBLICATION_PASS')
