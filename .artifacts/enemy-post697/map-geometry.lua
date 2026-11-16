local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Combat,Actors=require('abyss_run'),require('abyss_combat'),require('abyss_actor')
local View=require('abyss_battle_enemy_view')
local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorExit='exit',CursorEnter='enter',CursorEndDrag='endDrag'}
local h,r=F.fixture(nil,nil,nil,cursor);assert(F.start(h));assert(Run.startCombat(h.run,'cultist_solo'));h:refresh()
for _=1,90 do h:update(1/60)end
local run,map,battle=h.run,h.map,h.run.combat;local enemy=battle.enemies[1]
local function same(a,b)
 if type(a)~=type(b)then return false end
 if type(a)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local function get(...)
 local c=r;for _,name in ipairs({...})do c=assert(c:GetChild(name),name)end;return c
end
local function tap(hit,id)hit.listeners.down({touchId=id});hit.listeners.up({touchId=id});return hit.click({touchId=id})end
local before=Combat.copy(run);local position=View.geometry(enemy,false)
assert(h:openMenu());assert(tap(get('runMenu','map','hit'),301));assert(h.routeOpen)
assert(not h.mapUI.navigationEnabled and not h.mapUI:choose('f1_l1'))
assert(tap(get('mapPanel','previewBack','hit'),302))
assert(h.mode=='battle' and not h.routeOpen and h.run==run and h.map==map and h.run.combat==battle)
assert(same(before,run),'Map/return changed complete Run/RNG')
assert(same(position,View.geometry(enemy,false)),'Map/return changed live coordinate geometry')
local box=F.actorControl(r:GetChild('battlePanel'),'enemy1');assert(box.visible)
-- One actual returned frame exercises the coordinate-only renderer/name path;
-- the original 300-frame/two-profile matrix is reused by unchanged Git inputs.
local original=Actors.statusView;local calls=0
Actors.statusView=function(...)calls=calls+1;return original(...)end
h:update(1/60)
assert(calls==0,'returned coordinate frame derived unused status lists')
assert(same(position,View.geometry(enemy,false)) and calls==0)
Actors.statusView=original
local after=Combat.copy(run);before.elapsedSeconds=nil;after.elapsedSeconds=nil
assert(same(before,after),'returned frame changed gameplay/RNG')
h:disable();print('POST697_GAMEUI_MAP_GEOMETRY_PASS 1 returnedFrameStatusQueries=0 runRngEqual=true')
