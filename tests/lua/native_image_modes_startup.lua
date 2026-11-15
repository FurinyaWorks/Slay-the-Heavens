local F=dofile('tests/lua/support/game_ui_fixture.lua')
local canvas=F.control({children=F.Layout});local stage=F.Viewport.apply(canvas,1280,720)
package.loaded.abyss_art_features={schemaVersion=2,flags={cards=false,menuBackground=false,selectionAvatar=false,battlePortrait=false,monsters=false}}
Enum={ImageSource={StaticReference='static'},ImageType={Basic='basic',Stretch='stretch'},
 CursorEventType={CursorClick='click',CursorDown='down',CursorUp='up'},Device={Controller='controller',MobileController='mobileController',Mobile='mobile'}}
Color=setmetatable({FromRGBA=function(...)return{...}end},{__call=function(_,...)return{...}end})
local actors=F.monsterActors()
package.loaded.abyss_monster_actor_binding={enabled=true,templateIndex=actors.templateIndex,containerTemplateIndex=actors.containerTemplateIndex,powerTemplateIndex=actors.powerTemplateIndex}
local updates=false
game={InstantiateClientUIControl=actors.instantiate,DestroyClientUIControl=actors.destroy,
 GetUICanvasSize=function()return 1280,720 end,IsTestPlay=function()return true end,GetDevice=function()return 'desktop'end,
 GetCursorUIPos=function()return 0,0 end,ServerSignal=function()return{SendSignal=function()end}end}
script={object=canvas,GetParam=function()return false end,EnableUpdate=function(_,v)updates=v end}
local GameUI=require('abyss_game_ui');local construct=GameUI.new;local view
GameUI.new=function(...)view=construct(...);return view end
local Modes=require('abyss_image_modes');local create=Modes.new;local modes
Modes.new=function(...)modes=create(...);return modes end
dofile('src/lua/abyss_ui.lua');OnStart();assert(updates and view and modes)
assert(modes.writes==0,'startup preloaded unused pages')
assert(F.start(view));local covered=false
for _=1,160 do
 OnUpdate(.1);assert(updates,'real native entry failed')
 if modes.page=='nodePanel'and modes.lastRequests>0 then
  assert(modes.lastRequests<=64);covered=covered or view.pageReveal:covered()
 end
 if view.mode=='node'and view.pageReveal.state=='visible'and not(view.prologue and view.prologue:covering())then break end
end
assert(covered,'mode requests escaped the existing page cover')
assert(view.mode=='node'and view.pageReveal.state=='visible','native entry never published prepared node page')
local function at(path)local n=stage;for i=2,#path do n=assert(n:GetChild(path[i]))end;return n end
for _,row in ipairs(require('abyss_image_mode_binding').static)do
 if row.path[2]=='nodePanel'then assert(at(row.path).imageType==Enum.ImageType[row.mode=='basic'and'Basic'or'Stretch'])end
end
local writes=modes.writes
for _=1,3 do OnUpdate(.01)end
assert(modes.writes==writes,'stable native entry repeated mode writes')
assert(view:openDeck())
for _=1,100 do OnUpdate(.01);assert(updates);if view.pageReveal.state=='visible'and modes.page=='deckPanel'then break end end
assert(view.pageReveal.state=='visible'and view.deckUI.visible,'actual deck page never published')
local before=modes.writes
assert(view.deckUI:setSort('name'));assert(view.pageReveal.state=='visible','cached sort covered the already complete grid')
OnUpdate(.01)
assert(view.pageReveal.state=='visible'and modes.writes==before,'cached sort repeated mode initialization')
-- Native scrolling can destroy a slot and instantiate a fresh template even
-- while the deck's presentation intent and its already visible page stay put.
local grid=stage:GetChild('deckPanel'):GetChild('pileGrid')
grid.destroyOnRecycle=true
local fresh={grid:recycle(0,0),grid:recycle(1,1)}
for _,cell in ipairs(fresh)do
 assert(not cell.visible and not modes:templateReady(cell),'fresh template published before mode readback')
end
local art=require('abyss_card_art_runtime');local artReady=art.presentationReady
art.presentationReady=function(page)if page=='deckPanel'then return false end;return artReady(page)end
before=modes.writes
for _=1,3 do OnUpdate(.01);assert(updates)end
assert(modes.writes==before,'fresh-cell modes bypassed the existing serial art readiness')
for _,cell in ipairs(fresh)do assert(not cell.visible,'unprepared art published a fresh cell')end
art.presentationReady=artReady
for _=1,20 do
 OnUpdate(.01);assert(updates,'fresh-cell preparation failed native entry')
 assert(modes.lastRequests<=64,'fresh-cell preparation increased the shared frame budget')
 assert(view.pageReveal.state=='visible','fresh-cell preparation covered the completed deck')
end
for _,cell in ipairs(fresh)do
 assert(cell.visible and modes:templateReady(cell),'fresh recycled cell remains hidden on visible unchanged deck page')
end
before=modes.writes
for _=1,3 do OnUpdate(.01)end
assert(modes.writes==before,'stable recycled templates repeated mode writes')
local cancelled=grid:recycle(0,0)
assert(not cancelled.visible and not modes:templateReady(cancelled))
assert(view.deckUI:close())
for _=1,3 do OnUpdate(.01)end
assert(not cancelled.visible and not modes:templateReady(cancelled),'closed deck revived a fresh-cell lease')
OnDestroy();assert(modes.dead and not updates)
before=modes.writes;OnUpdate(.01);assert(modes.writes==before,'released host continued mode writes')
print('NATIVE_IMAGE_MODES_STARTUP_PASS withoutPortraitOwner=true readyBeforePublish=true freshRecycle=true cancellation=true')
