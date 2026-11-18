local Actors=require('abyss_actor')
local Theme=require('abyss_theme')
local Combat=require('abyss_combat')
local Data=require('abyss_data')
local statusView=Actors.statusView
local calls=0
Actors.statusView=function(...)calls=calls+1;return statusView(...)end
local geometryPath='src/lua/abyss_battle_enemy_view.lua'
local profile,canvas=Theme.presentationProfile,Theme.canvas.base
local actor=Combat.new(Data,{enemies={'cultist'},deck={'strike','defend'},seed=1}).enemies[1]
local function same(first,second)
 if type(first)~='table'or type(second)~='table'then return first==second end
 for key,value in pairs(first)do if not same(value,second[key])then return false end end
 for key in pairs(second)do if first[key]==nil then return false end end
 return true
end
local function unchangedFields(full,coordinates)
 for key,value in pairs(full)do
  if key~='statusCountWidth'then assert(coordinates[key]==value,'coordinate tuple changed: '..key)end
 end
 for key in pairs(coordinates)do assert(full[key]~=nil,'unexpected coordinate field '..key)end
end
local variants=0
for _,selected in ipairs({'official-assets-first','legacy-test-profile'})do
 Theme.presentationProfile=selected
 local View=dofile(geometryPath)
 for _,size in ipairs({{1280,720},{1920,1080}})do
  Theme.canvas.base=size
  for _,position in ipairs({{x=-160,y=0},{x=134,y=12}})do
   actor.sourcePosition=position
   local before=Combat.copy(actor)
   calls=0;local coordinates=View.geometry(actor,false)
   assert(calls==0,'coordinate-only geometry derived a status list')
   local full=View.geometry(actor)
   assert(calls==(selected=='official-assets-first'and 1 or 0),'default full metrics lost status derivation')
   unchangedFields(full,coordinates)
   calls=0;local px,_,portrait,width,py=View.position(1,1,actor)
   assert(calls==0,'coordinate-only position derived a status list')
   assert(px==full.x and py==full.y and portrait==full.portrait and width==full.hitWidth)
   assert(View.rowY(1,1,actor)==full.y and calls==0)
   assert(same(actor,before),'geometry mutated actor/RNG inputs')
   variants=variants+1
  end
 end
end
Theme.presentationProfile,Theme.canvas.base=profile,canvas
local View=dofile(geometryPath)
local previous=View.geometry(actor).statusCountWidth
for _,amount in ipairs({1,123456,-123456})do
 actor.statuses.strength=nil;actor.powerOrder={}
 Actors.addStatus(actor,'strength',amount)
 calls=0;local full=View.geometry(actor)
 assert(calls==1,'full status layout must read the latest ordered list')
 local expected=Theme.layout.nativeText.lineHeight
 for _,entry in ipairs(statusView(actor))do
  expected=math.max(expected,utf8.len(require('abyss_numbers').integer(entry.sourceAmount or entry.amount))*Theme.font.small)
 end
 assert(full.statusCountWidth==expected,'full status-count width changed')
 if amount==123456 then assert(full.statusCountWidth>previous,'long count failed to update full metrics')end
 local layout=View.powerLayout(full,false)
 assert(layout.pitch>0 and layout.columns>=Theme.layout.enemyRow.nativeStatusColumns)
 calls=0;unchangedFields(full,View.geometry(actor,false));assert(calls==0)
end
for index,entry in ipairs({{'weak',2},{'vulnerable',3}})do
 Actors.addStatus(actor,entry[1],entry[2])
 local ordered=statusView(actor)
 assert(#ordered==index+1 and ordered[index+1].id==entry[1],'status membership/order did not change')
 calls=0;local full=View.geometry(actor);assert(calls==1)
 calls=0;unchangedFields(full,View.geometry(actor,false));assert(calls==0)
end
actor.statuses.weak=nil;actor.statuses.vulnerable=nil
require('abyss_power_order').remove(actor,'weak');require('abyss_power_order').remove(actor,'vulnerable')
assert(#statusView(actor)==1 and statusView(actor)[1].id=='strength','status removal did not retain the remaining source order')
calls=0;local reduced=View.geometry(actor);assert(calls==1)
calls=0;unchangedFields(reduced,View.geometry(actor,false));assert(calls==0)
local guardian=Combat.new(Data,{enemies={'guardian'},deck={'strike'},seed=2}).enemies[1]
local heights={}
for _,phase in ipairs({'offense','defense'})do
 guardian.aiPhase=phase
 local full=View.geometry(guardian)
 calls=0;unchangedFields(full,View.geometry(guardian,false));assert(calls==0)
 heights[phase]=full.hitHeight
end
assert(heights.offense>heights.defense,'live Guardian phase did not change hitbox')
guardian.hp=0;guardian.escaped=true;guardian.sourcePosition={x=-268,y=9}
calls=0;local retired=View.geometry(guardian,false);assert(calls==0)
unchangedFields(View.geometry(guardian),retired)
Actors.statusView=statusView
print('ENEMY_GEOMETRY_METRICS_PASS profiles=2 statusChanges=3 geometryVariants='..variants..' powerCounts=1,2,3,1')

local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local host=H.setup({'strike','defend','strike','defend','strike'},{'cultist'})
for _=1,90 do host:update(1/60)end
local run,battle=host.run,host.run.combat
local before=Combat.copy(run);before.elapsedSeconds=nil
calls=0;Actors.statusView=function(...)calls=calls+1;return statusView(...)end
for _=1,300 do host:update(1/60)end
assert(calls==0,'idle coordinates derived '..calls..' status lists')
local after=Combat.copy(run);after.elapsedSeconds=nil
assert(host.run==run and run.combat==battle and same(before,after),'idle changed complete Run/RNG state')
Actors.statusView=statusView
assert(host:disable());host:update(1/60)
assert(host.run==run and run.combat==battle,'retirement changed committed battle identity')
print('ENEMY_GEOMETRY_HOST_PASS idleFrames=300 statusQueries=0 runRngEqual=true')
