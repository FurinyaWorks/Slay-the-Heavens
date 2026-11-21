-- Real bootstrap, generated native tree and GameUI; only platform APIs are mocked.
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local GameUI=require('abyss_game_ui')
local function published(h)
 for _=1,80 do
  local opening=h.ui.prologue and h.ui.prologue:covering()
  local page=h.ui.pageReveal and h.ui.pageReveal:covered()
  if not h.ui.starting and not opening and not page then
   assert(h.ui.run and not h.ui.disabled,'native page must remain live');return
  end
  OnUpdate(.05)
 end
 error('native page did not publish before fatal injection')
end
local function setup(enabled,stopThrows)
 local canvas=F.control({children=F.Layout})
 local h={signals={},lines={},signalCalls=0,forbidden=false}
 local actualNew,actualPrint=GameUI.new,print
 GameUI.new=function(...)h.ui=actualNew(...);return h.ui end
 print=function(...)
  local values={};for i=1,select('#',...)do values[i]=tostring(select(i,...))end
  h.lines[#h.lines+1]=table.concat(values,' ');actualPrint(...)
 end
 script={object=canvas,GetParam=function(_,name)return name=='nativeBgmEnabled' and enabled or false end,
  EnableUpdate=function(self,value)self.updating=value end}
 Enum={CursorEventType={CursorClick='click'},ImageSource={StaticReference='static'},
  Device={Mobile='mobile',Controller='controller',MobileController='mobile-controller'}}
 Color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end
 local actors=F.monsterActors()
 package.loaded.abyss_monster_actor_binding={enabled=true,templateIndex=actors.templateIndex,
  containerTemplateIndex=actors.containerTemplateIndex,powerTemplateIndex=actors.powerTemplateIndex}
 game={IsTestPlay=function()return true end,GetUICanvasSize=function()return 1280,720 end,
  InstantiateClientUIControl=actors.instantiate,DestroyClientUIControl=actors.destroy,
  GetDevice=function()return 'mobile' end,GetCursorUIPos=function()return 0,0 end,
  ServerSignal=function(name)
   h.signalCalls=h.signalCalls+1
   assert(not h.forbidden,'ServerSignal after engine teardown')
   return {SendSignal=function()
    h.signals[#h.signals+1]=name
    if h.failStop and name=='ABYSS_BGM_STOP' then error('INJECTED_STOP_FAILURE')end
   end}
  end}
 dofile('src/lua/abyss_ui.lua');OnStart()
 GameUI.new=actualNew
 assert(h.ui and script.updating,'native bootstrap must be live')
 h.root=canvas:GetChild('stage');h.root.ui=h.ui
 for _=1,80 do if not h.ui.pageReveal:covered()then break end;OnUpdate(.05)end
 assert(h.ui:start())
 for _=1,80 do if not h.ui.pageReveal:covered()then break end;OnUpdate(.05)end
 assert(F.confirmStart(h.ui));published(h);h.ui:refresh()
 if enabled==true then assert(h.signals[#h.signals]=='ABYSS_BGM_MAP')else assert(#h.signals==0)end
 h.failStop=stopThrows
 function h.restore()print=actualPrint end
 function h.fail()
  game.GetUICanvasSize=function()error('INJECTED_FATAL_VIEWPORT')end
  OnUpdate(.05)
 end
 function h.cleaned()
  assert(h.ui.disabled and script.updating==false,'fatal update must disable owner and updates')
  local menu=h.root:GetChild('menuPanel')
  assert(menu.visible and not menu:GetChild('start').visible and menu:GetChild('summary').visible)
  assert(menu:GetChild('summary').text:find('INJECTED_FATAL_VIEWPORT',1,true),'original diagnostic was lost')
  assert(table.concat(h.lines,'\n'):find('ABYSS_UI failed update:',1,true),'original failure log was lost')
 end
 return h
end
local cases=0
local function test(name,fn)fn();cases=cases+1;print('ok fatal BGM '..cases..' - '..name)end
test('fatal failure stops active map BGM once; late updates and destroy remain inert',function()
 local h=setup(true);local before=#h.signals
 h.fail();h.cleaned()
 assert(#h.signals==before+1 and h.signals[#h.signals]=='ABYSS_BGM_STOP','fatal failure did not stop active BGM')
 OnUpdate(.05);OnStart();assert(#h.signals==before+1,'late callbacks retried the stop')
 h.forbidden=true;local calls=h.signalCalls;OnDestroy();OnUpdate(.05)
 assert(h.signalCalls==calls,'destroy must not call any ServerSignal');h.restore()
end)
test('STOP failure preserves original diagnostic, cleanup and one-shot ownership',function()
 local h=setup(true,true);local before=#h.signals
 h.fail();h.cleaned()
 assert(#h.signals==before+1 and h.signals[#h.signals]=='ABYSS_BGM_STOP','STOP was not attempted')
 OnUpdate(.05);OnDestroy();assert(#h.signals==before+1,'failed STOP was retried');h.restore()
end)
test('fatal failure also stops the actual battle scene after the opening event',function()
 local h=setup(true)
 assert(h.ui.run.nodeFlow.event.id=='neow')
 for _=1,3 do F.click(h.root,'nodePanel','eventView/option1');published(h)end
 assert(h.ui.run.phase=='map')
 local first=require('abyss_map').available(h.ui.map)[1]
 assert(h.ui.mapUI:choose(first.id));h.ui:refresh();published(h)
 assert(h.ui.run.phase=='combat' and h.signals[#h.signals]=='ABYSS_BGM_BATTLE')
 local before=#h.signals;h.fail();h.cleaned()
 assert(#h.signals==before+1 and h.signals[#h.signals]=='ABYSS_BGM_STOP')
 OnUpdate(.05);OnDestroy();assert(#h.signals==before+1);h.restore()
end)
for _,enabled in ipairs({false,'true',1})do
 test('non-boolean-enabled BGM sends no signals: '..tostring(enabled),function()
  local h=setup(enabled);h.fail();h.cleaned();OnUpdate(.05);OnDestroy()
  assert(h.signalCalls==0,'disabled BGM must not touch signal APIs');h.restore()
 end)
end
test('ordinary disable does not stop music; engine destroy never calls signal APIs',function()
 local h=setup(true);local before=#h.signals
 assert(h.ui:disable());assert(#h.signals==before,'ordinary GameUI disable changed music semantics')
 h.forbidden=true;local calls=h.signalCalls;OnDestroy();OnUpdate(.05)
 assert(h.signalCalls==calls,'engine destroy touched signal API');h.restore()
end)
test('destroying an otherwise live music owner forgets its port without sending STOP',function()
 local h=setup(true);local calls=h.signalCalls
 assert(not h.ui.disabled and script.updating)
 h.forbidden=true;OnDestroy();OnUpdate(.05);OnStart()
 assert(h.ui.disabled and script.updating==false and h.signalCalls==calls,'live engine teardown touched signal API')
 h.restore()
end)
print('FATAL_BGM_STOP_PASS '..cases)
