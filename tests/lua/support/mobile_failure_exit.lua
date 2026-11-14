local F=dofile('tests/lua/support/game_ui_fixture.lua')
local canvas=F.control({children=F.Layout})
local root=F.Viewport.apply(canvas,1280,720)
package.loaded.abyss_art_features={schemaVersion=2,flags={cards=false,menuBackground=false,selectionAvatar=false,battlePortrait=false,monsters=false}}
Enum={ImageSource={StaticReference='static'},ImageType={Stretch='stretch'},CursorEventType={CursorClick='click'},Device={Controller='controller',MobileController='mobileController',Mobile='mobile'}}
Color=setmetatable({FromRGBA=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end},{__call=function(_,r,g,b,a)return {r=r,g=g,b=b,a=a}end})
local actors=F.monsterActors()
package.loaded.abyss_monster_actor_binding={enabled=true,templateIndex=actors.templateIndex,containerTemplateIndex=actors.containerTemplateIndex,powerTemplateIndex=actors.powerTemplateIndex}
local updates,fault,broken,sent=false,false,false,0
game={InstantiateClientUIControl=actors.instantiate,DestroyClientUIControl=actors.destroy,
 GetUICanvasSize=function()if fault then error('injected live canvas failure')end;return 1280,720 end,
 IsTestPlay=function()return true end,GetDevice=function()return 'desktop'end,GetCursorUIPos=function()return 0,0 end,
 ServerSignal=function(name)assert(name=='ABYSS_LOSE');return {SendSignal=function()if broken then error('transport down')end;sent=sent+1 end}end}
script={object=canvas,GetParam=function()return false end,EnableUpdate=function(_,v)updates=v end}
dofile('src/lua/abyss_ui.lua');OnStart()
assert(updates,'real native host must initialize before the injected fault')
local menu=root:GetChild('menuPanel')
local quit=menu:GetChild('titleQuit'):GetChild('hit')
assert(quit.click,'real menu must install its original click listener')
assert(quit.click(),'normal title quit must open its confirmation rather than exit')
assert(sent==0,'ordinary title quit must retain existing confirmation')
fault=true;OnUpdate(.01)
assert(not updates and menu.visible,'update fault must publish a visible recovery screen')
assert(not root:GetChild('exitPanel').visible and not root:GetChild('runMenu').visible,'stale confirmation must not block recovery')
assert(menu:GetChild('titleQuit').visible and quit.raycastTarget,'recovery hit must be enabled')
assert(not menu:GetChild('continueRun').visible and not menu:GetChild('start').visible)
assert(not menu:GetChild('deathShade').visible,'death overlay must not cover recovery')
broken=true;assert(quit.click()==false and sent==0)
broken=false;assert(quit.click()==true and sent==1,'single native listener must route around disabled menu controller')
assert(quit.click()==false and sent==1)
OnDestroy();assert(quit.click()==false and sent==1,'destroyed entry must reject retained dispatcher')
print('MOBILE_FAILURE_NATIVE_PASS')
