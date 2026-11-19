-- Current-source Host, only menu/map/camp navigation. No combat scenario.
local GameUI=require('abyss_game_ui');local create=GameUI.new;local F
local profile=require('abyss_ui_profile')
-- Reuse the repository's official-assets-runtime native active-state adapter.
GameUI.new=function(root,data,presentation,event,platform)
 if profile.nativePageLifecycle then
  local active={}
  for _,name in ipairs({'nodePanel','choicePanel'})do
   local page=root:GetChild(name);local prior=getmetatable(page);active[page]=true
   setmetatable(page,{__index=function(c,key)if key=='active'then return active[c]end;return prior.__index(c,key)end,
    __newindex=function(c,key,value)assert(key~='active','active is readonly');return prior.__newindex(c,key,value)end})
   page.SetActive=function(c,value)active[c]=value;F.setEngineActive(c,value)end
  end
 end
 platform.nativePageLifecycle=profile.nativePageLifecycle
 return create(root,data,presentation,event,platform)
end
F=dofile('tests/lua/support/game_ui_fixture.lua')
local Map=require('abyss_map');local routes=dofile('tests/lua/support/map_routes.lua')
local official=F.Theme.presentationProfile=='official-assets-first'
assert(official==profile.nativePageLifecycle,'actual builder/lifecycle profile mismatch')
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local function hit(r,p,n)return assert(assert(r:GetChild(p)):GetChild(n)):GetChild('hit')end
local function release(c,id)c.listeners.down({touchId=id});c.listeners.up({touchId=id})end
local function tap(c,id)
 local p=c;while p do assert(p.visible~=false and p.activeInHierarchy,'hidden/inactive target');p=p.parent end
 assert(c.raycastTarget~=false and (c.kind~='presetButton' or c.interactable~=false),'disabled target')
 release(c,id);return c.click({touchId=id})
end
local function same(a,b)
 if type(a)~=type(b)then return false end
 if type(a)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local function camp()
 local settlements=0
 local h,r=F.fixture(nil,function()settlements=settlements+1;return true end,nil,cursor);assert(F.start(h))
 local path=routes.to(h.map,function(n)return n.type=='camp'end)
 -- Existing map-menu fixture setup: advance the genuine map path without
 -- playing intermediate rooms. This is not a two-act or gameplay proof.
 for i=1,#path-1 do assert(Map.choose(h.map,path[i]))end
 h.run.floor=h.map.floor;assert(h.mapUI:choose(routes.at(h.map,path[#path]).id))
 assert(h.mode=='node' and h.run.phase~='combat')
 return h,r,function()return settlements end
end
local n=0
local function test(name,fn)fn();n=n+1;print('ok pc11 '..n..' - '..name)end

test('pre-run and same-map menu hide and reject redundant route',function()
 local h,r=F.fixture(nil,nil,nil,cursor)
 for _,started in ipairs({false,true})do
  if started then assert(F.start(h))end
  assert(h:openMenu());local route=hit(r,'runMenu','map')
  assert(not r:GetChild('runMenu'):GetChild('map').visible and not route.raycastTarget and not route.interactable)
  release(route,1);assert(not route.click({touchId=1}) and not h.routeOpen)
  assert(tap(hit(r,'runMenu','resume'),2) and not h.exitOpen)
 end
 h:disable()
end)
test('camp menu route remains reachable and returns in one Back without stale input',function()
 local h,r=camp();local before=F.Combat.copy(h.run);local mapBefore=F.Combat.copy(h.map)
 local run,map,flow=h.run,h.map,h.run.nodeFlow
 assert(h:openMenu());release(hit(r,'runMenu','resume'),10)
 assert(tap(hit(r,'runMenu','map'),11) and h.routeOpen)
 assert(not h.mapUI.navigationEnabled and not h.mapUI:choose('f1_l1'))
 assert(not h.nodeUI:press('campView/rest'))
 assert(tap(hit(r,'mapPanel','previewBack'),12))
 assert(not h.exitOpen and not h.menuOpen and not h.routeOpen and h.mode=='node')
 assert(not r:GetChild('runMenu').visible and not r:GetChild('mapPanel').visible)
 assert(h.run==run and h.map==map and run.nodeFlow==flow and same(before,run) and same(mapBefore,map))
 assert(h:openMenu());assert(not hit(r,'runMenu','resume').click({touchId=10}))
 assert(tap(hit(r,'runMenu','resume'),13));h:disable()
end)
test('profile route ownership exposes the current official duplicate and retains fallback',function()
 local h,r=camp();local shortcut=r:GetChild('nodePanel'):GetChild('runRoute')
 if official then
  assert(shortcut and shortcut.visible and shortcut.raycastTarget~=false)
  local before=F.Combat.copy(h.run)
  for i=1,2 do
   assert(tap(assert(shortcut:GetChild('hit')),20+i*2) and h.routeOpen)
   assert(tap(hit(r,'mapPanel','previewBack'),21+i*2))
   assert(not h.exitOpen and not h.menuOpen and not h.routeOpen and same(before,h.run))
  end
  assert(h:openMenu() and r:GetChild('runMenu'):GetChild('map').visible)
  assert(tap(hit(r,'runMenu','map'),30) and h.routeOpen)
  assert(tap(hit(r,'mapPanel','previewBack'),31))
  print('PC11_SINGLE_ENTRY_REQUIREMENT_FAIL: official runRoute AND runMenu/map are reachable')
 else
  assert(not shortcut,'default fallback must not borrow official top-bar control')
  assert(h:openMenu() and tap(hit(r,'runMenu','map'),30) and h.routeOpen)
  assert(tap(hit(r,'mapPanel','previewBack'),31))
  print('PC11_DEFAULT_FALLBACK_PASS')
 end
 h:disable()
end)
test('node title round trips preserve live session and do not invoke platform settlement',function()
 local h,r,settlements=camp();local run,map,flow=h.run,h.map,h.run.nodeFlow;local before=F.Combat.copy(run);local mapBefore=F.Combat.copy(map)
 for i=1,2 do
  assert(h:openMenu() and tap(hit(r,'runMenu','mainMenu'),40+i*2))
  assert(h.sessionPaused and h.mode=='menu' and not h.exitOpen)
  h:update(2);h:refresh();h:resize(1280,720)
  assert(same(before,run) and same(mapBefore,map) and not h.settlementRequested and settlements()==0)
  assert(tap(hit(r,'menuPanel','continueRun'),41+i*2))
  assert(h.mode=='node' and not h.sessionPaused and h.run==run and h.map==map and run.nodeFlow==flow)
 end
 h:disable()
end)
print('PC11_CURRENT_OBSERVATIONS_PASS '..n..' profile='..tostring(F.Theme.presentationProfile or 'default'))
