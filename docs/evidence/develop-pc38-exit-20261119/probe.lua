-- Current-source offline Host characterization; no historical runner/preloads.
assert(package.loaded.abyss_game_ui==nil and package.preload.abyss_game_ui==nil)
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local function hit(r,p,n)return assert(assert(r:GetChild(p)):GetChild(n)):GetChild('hit')end
local function tap(c,id)
 local parent=c
 while parent do assert(parent.visible~=false and parent.activeInHierarchy,'hidden/inactive control');parent=parent.parent end
 assert(c.raycastTarget~=false and (c.kind~='presetButton' or c.interactable~=false),'disabled control')
 c.listeners.down({touchId=id});c.listeners.up({touchId=id});return c.click({touchId=id})
end
local function same(a,b)
 if type(a)~=type(b)then return false end
 if type(a)~='table'then return a==b end
 for k,v in pairs(a)do if not same(v,b[k])then return false end end
 for k in pairs(b)do if a[k]==nil then return false end end
 return true
end
local cases=0
local function test(name,fn)fn();cases=cases+1;print('ok pc38 observation '..cases..' - '..name)end

test('menu help remains reachable through current visible native listeners',function()
 local h,r=F.fixture(nil,nil,nil,cursor);assert(F.start(h));assert(h.run.phase~='combat')
 assert(h:openMenu());local guide=r:GetChild('exitPanel'):GetChild('guide')
 assert(tap(hit(r,'runMenu','help'),1))
 assert(h.controlsOpen and guide.visible and h.exitOpen)
 assert(tap(guide:GetChild('close'):GetChild('hit'),2))
 assert(not h.controlsOpen and not guide.visible and h.exitOpen and h.menuOpen)
 assert(h:closeExit() and not h.exitOpen);h:disable()
end)
test('abandon confirmation still opens help, blocks confirm, and returns to warning',function()
 local h,r=F.fixture(nil,nil,nil,cursor);assert(F.start(h));assert(h.run.phase~='combat')
 local run=h.run;local before=F.Combat.copy(run)
 assert(h:openMenu() and tap(hit(r,'runMenu','abandon'),3))
 assert(h.navigationAction=='abandon')
 assert(r:GetChild('exitPanel'):GetChild('message').text:find('无法恢复',1,true))
 assert(tap(hit(r,'exitPanel','help'),4) and h.controlsOpen)
 assert(not h:confirmExit() and h.run==run and same(before,run))
 assert(h:closeExit() and not h.controlsOpen and h.navigationAction=='abandon')
 assert(r:GetChild('exitPanel').visible)
 assert(tap(hit(r,'exitPanel','cancel'),5) and not h.exitOpen and h.run==run and same(before,run))
 h:disable()
end)
test('repeated abandon cancellation preserves session; confirmation discards only the run',function()
 local calls=0;local h,r=F.fixture(nil,function()calls=calls+1;return true end,nil,cursor)
 assert(F.start(h));assert(h.run.phase~='combat');local run=h.run;local before=F.Combat.copy(run)
 for i=1,2 do
  assert(h:openMenu() and tap(hit(r,'runMenu','abandon'),10+i*2))
  assert(tap(hit(r,'exitPanel','cancel'),11+i*2))
  assert(h.run==run and same(before,run) and calls==0 and not h.exitOpen)
 end
 assert(h:openMenu() and tap(hit(r,'runMenu','abandon'),20))
 assert(tap(hit(r,'exitPanel','confirm'),21))
 assert(h.run==nil and h.mode=='menu' and calls==0 and not h:confirmExit())
 h:disable()
end)
test('platform exit cancellation, failed settlement retry and duplicate suppression remain intact',function()
 local calls=0;local h,r=F.fixture(nil,function(victory)assert(not victory);calls=calls+1;return calls>1 end,nil,cursor)
 assert(F.start(h));assert(h.run.phase~='combat');local run=h.run;local before=F.Combat.copy(run)
 assert(h:openMenu() and h:returnToMainMenu())
 assert(tap(hit(r,'menuPanel','titleQuit'),30))
 assert(tap(hit(r,'exitPanel','cancel'),31) and h.run==run and same(before,run) and calls==0)
 assert(tap(hit(r,'menuPanel','titleQuit'),32))
 assert(not tap(hit(r,'exitPanel','confirm'),33) and calls==1 and not h.settlementRequested)
 assert(h:closeExit() and h:continueRun() and same(before,run))
 assert(h:openMenu() and h:returnToMainMenu() and h:openExit())
 assert(h:confirmExit() and calls==2 and h.settlementRequested)
 assert(not h:confirmExit() and calls==2);h:disable()
end)
print('PC38_CURRENT_OBSERVATIONS_PASS '..cases)
print('PC38_REMOVAL_REQUIREMENT_FAIL: active runMenu/help and exitPanel/help still open guide')
