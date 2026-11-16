local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run=require('abyss_run')
local Theme=require('abyss_theme')
assert(Theme.presentationProfile=='official-assets-first')
local cursor={CursorEnter='enter',CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local function get(root,...)for _,name in ipairs({...})do root=assert(root:GetChild(name),name)end;return root end
local function tap(hit,id)hit.listeners.down({touchId=id});hit.listeners.up({touchId=id});return hit.click({touchId=id})end
local function state(back,want)
 local face=assert(back:GetChild('v25Face'),'PC08: generated Host has no shared map return face')
 for _,name in ipairs({'normal','hover','pressed','disabled'})do
  assert(get(face,name).visible==(name==want),'return state '..want..'/'..name)
 end
end
local function same(a,b)
 if type(a)~=type(b)then return false end
 if type(a)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local count=0
local function test(name,fn)fn();count=count+1;print('ok pc08 '..count..' - '..name)end
local function setup(api)
 local h,r=F.fixture(nil,nil,nil,cursor,false,nil,nil,api);assert(F.start(h))
 return h,r,get(r,'mapPanel','previewBack'),get(r,'mapPanel','previewBack','hit')
end
local function preview(h,r,context)
 if context=='battle'then assert(Run.startCombat(h.run,'cultist_solo'));h:refresh()
 else
  local routes=dofile('tests/lua/support/map_routes.lua');local Map=require('abyss_map')
  local path=routes.to(h.map,function(n)return n.type=='camp'end)
  for i=1,#path-1 do assert(Map.choose(h.map,path[i]))end
  h.run.floor=h.map.floor;assert(h.mapUI:choose(routes.at(h.map,path[#path]).id))
 end
 assert(h:openMenu());assert(tap(get(r,'runMenu','map','hit'),1) and h.routeOpen)
 -- Include the current node's rotating token and reachable node pulse bounds.
 local layout=require('abyss_ui_layout');local spec
 for _,s in ipairs(layout)do
  if s.name=='stage'then for _,p in ipairs(s.children)do if p.name=='mapPanel'then
   for _,b in ipairs(p.children)do if b.name=='previewBack'then spec=b end end
  end end end
 end
 assert(spec);local bx,by=spec.position[1],spec.position[2]
 for _,fx in ipairs(h.mapUI.activeFx)do if fx.visible then
  local radius=fx.size*1.5 -- conservative full token/pulse envelope, beyond the current painted half-size
  assert(math.abs(fx.x-bx)>=radius+spec.size[1]/2 or math.abs(fx.y-by)>=radius+spec.size[2]/2,
   'map return covers visible selected/reachable node '..fx.box.name)
 end end
end
test('four live states, cancellation, stale touches, menu cover and C-tier click use the original hit',function()
 local h,r,back,hit=setup();state(back,'disabled');assert(not back.visible)
 preview(h,r,'battle');state(back,'normal');assert(back.visible)
 assert(get(back,'label').text==Theme.officialAssets.battleHud.routeBackText)
 local before=F.Combat.copy(h.run);local run,map,battle=h.run,h.map,h.run.combat
 hit.listeners.enter({});state(back,'hover');hit.listeners.down({touchId=2});state(back,'pressed')
 hit.listeners.exit({touchId=2});state(back,'normal');assert(not hit.click({touchId=2}) and h.routeOpen)
 hit.listeners.down({touchId=3});hit.listeners.up({touchId=3});state(back,'hover')
 assert(h:closeExit());state(back,'disabled');assert(not hit.click({touchId=3}))
 assert(h:openMenu());assert(not back.visible and not hit.click({touchId=3}))
 assert(tap(get(r,'runMenu','map','hit'),4));state(back,'normal')
 hit.listeners.down({touchId=7});hit.listeners.endDrag({touchId=7});state(back,'normal')
 assert(not hit.click({touchId=7}) and h.routeOpen)
 assert(tap(hit,5));assert(h.mode=='battle' and not h.exitOpen and not h.routeOpen)
 assert(h.run==run and h.map==map and h.run.combat==battle and same(before,h.run))
 -- A fresh receiver without a preceding gesture retains the supported click fallback.
 h:disable();local c,root,button,receiver=setup();preview(c,root,'battle')
 assert(receiver.click() and not c.routeOpen and c.mode=='battle');c:disable()
end)
test('camp preview restores its existing caller, live caption and unchanged Run including RNG',function()
 local h,r,back,hit=setup();local caption=get(back,'label').text;preview(h,r,'camp')
 assert(get(back,'label').text==caption);local before=F.Combat.copy(h.run);local flow=h.run.nodeFlow
 assert(not h.mapUI.navigationEnabled and not h.mapUI:choose('f1_l1'))
 assert(tap(hit,6) and not h.routeOpen and h.mode=='node' and h.run.nodeFlow==flow)
 assert(same(before,h.run));h:disable()
end)
test('controller focus uses existing binding and stale callbacks remain guarded',function()
 local focus
 local api={events={Confirm='confirm',Cancel='cancel',Focus='focus'},directions={Left='left',Right='right'},modes={Specified='specified'},
  getFocus=function()return focus end,setFocus=function(c)focus=c end,isController=function()return true end}
 local h,r,back,hit=setup(api);preview(h,r,'battle');h:update(.01);h:syncController();focus=hit
 assert(hit.canControllerFocus);hit.navigationListeners.focus();state(back,'hover')
 h.settlementBusy=true;h:refresh();state(back,'disabled')
 hit.navigationListeners.focus();state(back,'disabled')
 assert(not hit.navigationListeners.confirm() and h.routeOpen)
 h.settlementBusy=false;h:refresh();h:update(.01);h:syncController();focus=hit
 assert(hit.navigationListeners.cancel());assert(not h.routeOpen and h.mode=='battle');state(back,'disabled')
 h:update(.01);assert(not hit.navigationListeners.confirm() and not h.routeOpen)
 h:disable()
end)
print('OFFICIAL_MAP_RETURN_PASS '..count)
