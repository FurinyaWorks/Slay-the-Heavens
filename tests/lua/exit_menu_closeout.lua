local F=dofile('tests/lua/support/game_ui_fixture.lua')
local cases=0
for _,touch in ipairs({false,true})do
 local calls,focus=0,nil
 local api={events={Confirm='confirm',Cancel='cancel',Focus='focus',LostFocus='blur'},directions={Left='left',Right='right'},modes={Specified='specified'},
  getFocus=function()return focus end,setFocus=function(c)focus=c end,isController=function()return true end}
 local ui,root=F.fixture(nil,function()calls=calls+1;return true end,nil,nil,false,nil,{touchScreen=function()return touch end},api)
 local menu,panel=root:GetChild('runMenu'),root:GetChild('exitPanel')
 assert(not menu:GetChild('help') and not panel:GetChild('help') and not panel:GetChild('guide'),'obsolete guide tree remains')
 assert(ui:openMenu() and menu.visible and not panel.visible)
 assert(menu:GetChild('catch').click() and ui.menuOpen,'interior click closes menu')
 ui:update(.01);ui:syncController()
 for _,record in ipairs(ui.controller.records)do assert(not record.control.name:find('help'),'obsolete guide focus target')end
 assert(menu:GetChild('resume'):GetChild('hit').click());assert(not ui.exitOpen)
 assert(ui:openMenu());ui:update(.01)
 assert(menu:GetChild('abandon'):GetChild('hit').click());assert(panel.visible and not ui.menuOpen)
 assert(panel:GetChild('cancel'):GetChild('hit').click() and not ui.exitOpen and calls==0)
 assert(ui:openExit());ui:update(.01)
 assert(panel:GetChild('confirm'):GetChild('hit').click() and calls==1 and ui.settlementRequested)
 assert(not ui:confirmExit() and calls==1,'repeat settlement')
 ui:disable();cases=cases+1
end
print('EXIT_MENU_CLOSEOUT_PASS '..cases)
