local F=dofile('tests/lua/support/game_ui_fixture.lua')
assert((F.Theme.presentationProfile=='official-assets-first')==OFFICIAL_NEOW_RETIREMENT,'generated runtime profile must match the actual builder')
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag'}
local function hit(root,panel,name)return root:GetChild(panel):GetChild(name):GetChild('hit')end
local function tap(control,id)
 control.listeners.down({touchId=id});control.listeners.up({touchId=id});return control.click({touchId=id})
end
local function setup()
 local canvas,signals=F.control({children=F.Layout}),0
 local root=F.Viewport.apply(canvas,1280,720)
 local host=F.GameUI.new(root,F.Data,F.Presentation,'click',{
  seed=1,campaign=true,campaignProfile='competition-two-act',cursorEvents=cursor,
  keyEvents={KeyboardCraftspersonKey42Down='backspace'},imageSource='static',color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end,
  settle=function()signals=signals+1;return true end,
 })
 root.ui=host
 return host,root,function()return signals end
end
local function neow(host,root)
 assert(host.run and host.run.nodeFlow and host.run.nodeFlow.event.id=='neow','real campaign must reach Neow')
 assert(host.nodeUI.run==host.run,'node view must use the current Run')
 local event=root:GetChild('nodePanel'):GetChild('eventView')
 for i=1,4 do
  local chrome=event:GetChild('option'..i):GetChild('stsNeowChrome')
  if OFFICIAL_NEOW_RETIREMENT then assert(chrome and chrome.visible,'production official StS Neow chrome must be active')
  else assert(chrome==nil,'default host must remain the no-chrome comparison')end
 end
end
local cases=0
for _,action in ipairs({'abandon','new'})do
 local host,root,signals=setup();assert(F.start(host));neow(host,root)
 local oldRun=host.run
 assert(host:openMenu())
 if OFFICIAL_NEOW_RETIREMENT then
  local runMenu=root:GetChild('runMenu')
  assert(runMenu.visible and runMenu:GetChild('mainMenu').visible)
  assert(not runMenu:GetChild('help'),'the retired guide must be absent from the generated menu')
  for _,name in ipairs({'title','resume','map','abandon','quit','dismissHint','catch'})do
   assert(not runMenu:GetChild(name).visible,name..' is hidden')
  end
  assert(not tap(hit(root,'runMenu','abandon'),10) and host.run==oldRun and host.menuOpen)
  assert(tap(runMenu:GetChild('blocker'),11))
  assert(not host.exitOpen and host.run==oldRun and host:openMenu())
  local back=assert(runMenu.keyListeners and runMenu.keyListeners.backspace,'missing native Backspace receiver')
  assert(runMenu.disableKeyEventPassthrough and back())
  assert(not runMenu.visible and runMenu.disableKeyEventPassthrough==false,'hidden menu must release keyboard input')
  assert(not host.exitOpen and not back() and host.run==oldRun and signals()==0)
  assert(host:openMenu())
 end
 if action=='new'then
  assert(tap(hit(root,'runMenu','mainMenu'),12));assert(host.sessionPaused and host.run==oldRun)
  assert(tap(hit(root,'menuPanel','continueRun'),13) and host.run==oldRun)
  assert(host:openMenu() and tap(hit(root,'runMenu','mainMenu'),14))
  assert(tap(hit(root,'menuPanel','start'),1))
 elseif OFFICIAL_NEOW_RETIREMENT then assert(host:requestNavigation('abandon'))
 else assert(tap(hit(root,'runMenu','abandon'),2))end
 local confirmation=OFFICIAL_NEOW_RETIREMENT and 'abandon' or action
 assert(host.navigationAction==confirmation,'paused official Start must confirm abandoning the live session')
 local option=root:GetChild('nodePanel'):GetChild('eventView'):GetChild('option1')
 assert(tap(hit(root,'exitPanel','confirm'),3),'confirmation must survive nil-run hide/reset')
 assert(host.run==nil and host.nodeUI.run==nil,'retired run must not be retained to paint chrome')
 assert(signals()==0 and not host.disabled and not host.settlementRequested,'navigation must not settle or disable the host')
 if OFFICIAL_NEOW_RETIREMENT then assert(not option:GetChild('stsNeowChrome').visible,'retired Neow material must hide')end
 if confirmation=='abandon'then
  assert(host.mode=='menu');assert(tap(hit(root,'menuPanel','start'),4))
 end
 assert(host.characterOpen and F.confirmStart(host));assert(host.run~=oldRun);neow(host,root)
 -- Repeat a true retirement, then exercise disable's same hide/reset path.
 assert(host:openMenu() and host:requestNavigation('abandon'))
 assert(host:confirmExit() and host.run==nil and host.nodeUI.run==nil)
 assert(host:disable() and host.disabled,'nil-run cleanup must finish')
 assert(host:disable()==false,'repeated cleanup must remain inert')
 assert(signals()==0);cases=cases+1
end
print('NEOW_NAVIGATION_RETIREMENT_PASS '..cases)
