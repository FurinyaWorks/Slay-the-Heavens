local F=dofile('tests/lua/support/game_ui_fixture.lua')
local View=require('abyss_monster_intent_particle_view')
local Pools=require('abyss_monster_power_surfaces')
local Theme=require('abyss_theme')
local g={x=0,y=0,intentX=10,intentY=20,sourceScale=1}
local tests=0
local function test(name,fn)fn();tests=tests+1;print('ok intent_particle_publication '..tests..' - '..name)end
local function fixture(hook)
 local box=F.control(F.Templates.AbyssMonsterActor)
 local platform=F.withMonsterActors({})
 local make=platform.monsterActors.instantiate
 local created={}
 platform.monsterActors.instantiate=function(index,parent)
  local c=make(index,parent);created[#created+1]=c
  if index==platform.monsterActors.powerTemplateIndex and hook then hook(c)end
  return c
 end
 local picture=function(c,id)return c:SetImage('static',id)end
 local tint=function(c,value)c.imageColor=value end
 local view=View.new(platform,picture,tint)
 local battle={events={}}
 local function spawn()
  view:sync({{id='a'}},battle,nil,true)
  view:update('a',.51,{sourceEnum='UNKNOWN'},g)
  assert(#view.states.a.effects==1)
 end
 spawn()
 return view,box,created,spawn
end
local function outputs(box)
 local a={}
 for _,layer in ipairs({'intentVfxBehind','intentVfxAfter'})do
  local pool=Pools.get(box:GetChild(layer))
  if pool then pool:each(function(c)a[#a+1]=c end)end
 end
 return a
end
test('live particle repeats dynamic publication without static native writes',function()
 local view,box=fixture();view:paint(box,'a',g,true)
 local c=assert(outputs(box)[1]);local icon=c:GetChild('icon');local effect=view.states.a.effects[1]
 local static,dynamic=0,0
 for _,name in ipairs({'edge','body','badge','count','hit'})do local part=c:GetChild(name);local old=part.SetVisible
  part.SetVisible=function(self,...)static=static+1;return old(self,...)end
 end
 for _,name in ipairs({'SetVisible','SetImage','SetSizeDelta','SetAnchoredPosition'})do local old=icon[name]
  icon[name]=function(self,...)static=static+1;return old(self,...)end
 end
 for _,name in ipairs({'SetLocalScale','SetLocalRotation'})do local old=icon[name]
  icon[name]=function(self,...)dynamic=dynamic+1;return old(self,...)end
 end
 effect.scale=.73;effect.rotationDeg=31;effect.centerX=90;effect.centerY=45;effect.color={.2,.3,.4,.5}
 view:paint(box,'a',g,false)
 assert(static==0,'live particle repeated static native configuration: '..static)
 assert(dynamic==2 and icon.localScaleX==.73 and icon.rotation[3]==31)
 assert(c.x==90 and c.y==45 and not c.visible)
 assert(icon.imageColor.a==127.5 and icon.imageColor.r==51)
 assert(icon.imageId==Theme.icon.intent.unknown and icon.visible and icon.sizeDeltaX==128)
 for _,name in ipairs({'edge','body','badge','count','hit'})do assert(not c:GetChild(name).visible)end
 view:paint(box,'a',g,true);assert(c.visible,'render gate change lost')
 view:clear()
end)
test('clearing and recreating the same effect configures a new native instance',function()
 local view,box=fixture();view:paint(box,'a',g,true)
 local old=assert(outputs(box)[1]);local e=view.states.a.effects[1]
 view:release(box);assert(not old.alive)
 view:paint(box,'a',g,true)
 local new=assert(outputs(box)[1]);assert(new~=old and new.alive)
 assert(new:GetChild('icon').imageId==Theme.icon.intent.unknown and new:GetChild('icon').sizeDeltaX==128)
 assert(view.states.a.effects[1]==e,'surface recreation changed particle lifetime')
 view:clear()
end)
for _,mode in ipairs({'false','throw','clear','engineDestroy','imageFalse'})do
 test('initial native failure/retirement '..mode..' stops publication and retains no promise',function()
  local view,box,created
  local late=0
  view,box,created=fixture(function(c)
   local icon=c:GetChild('icon')
   if mode=='imageFalse'then icon.SetImage=function()return false end;return end
   icon.SetLocalScale=function()late=late+1 end
   icon.SetSizeDelta=function()
    if mode=='false'then return false elseif mode=='throw'then error('injected size failure')
    elseif mode=='clear'then view:clear()else view:onEngineDestroy()end
   end
  end)
  local ok,why=pcall(view.paint,view,box,'a',g,true)
  assert(not ok and (tostring(why):find('rejected')or tostring(why):find('injected')or tostring(why):find('cancelled')))
  assert(late==0,'retired or rejected setup received later scale publication')
  if mode~='engineDestroy'then for _,c in ipairs(created)do assert(not c.alive,'failed setup leaked owned control')end;view:clear()end
 end)
end
print('INTENT_PARTICLE_PUBLICATION_PASS '..tests)
