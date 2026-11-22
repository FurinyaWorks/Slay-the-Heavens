local F = dofile('tests/lua/support/game_ui_fixture.lua')
local cursor={CursorDown='down',CursorUp='up',CursorDrag='drag'}
local calls=0
local ui,root=F.fixture(nil,function()calls=calls+1;return true end,nil,cursor)
local function pointer(id, y)
    return {touchId=id,GetUIPos=function()return 640,y or 200 end}
end
local function tap(hit, id)
    local event=pointer(id)
    if hit.listeners.down then hit.listeners.down(event) end
    if hit.listeners.up then hit.listeners.up(event) end
    return hit.click(event)
end
local exit=root:GetChild('exitPanel')
assert(ui:openExit())
assert(exit.visible and not exit:GetChild('help') and not exit:GetChild('guide'))
assert(not ui:start() and calls==0)
assert(exit:GetChild('blocker').click() and ui.exitOpen)
assert(tap(exit:GetChild('cancel'):GetChild('hit'),nil))
assert(not ui.exitOpen and calls==0)
assert(ui:start())
if ui.characterOpen then
    assert(ui:selectCharacter('traveler') and ui:selectElement('ironclad'))
    assert(not ui.run and ui:confirmCharacter())
    ui:update(1)
end
local panel=root:GetChild('mapPanel')
for _, group in pairs(panel.children) do
    assert(not group.children.previous and not group.children.next and not group.children.focus)
end
local map, floor, node=assert(ui.map),ui.run.floor,ui.mapUI.map.currentNodeId
local open=root:GetChild('exitEntry'):GetChild('open'):GetChild('hit')
local resume=root:GetChild('runMenu'):GetChild('resume'):GetChild('hit')
assert(ui.mapUI:scrollBy(200) and ui.mapUI.scroll>0)
assert(tap(open,nil) and not ui.mapUI.visible)
assert(tap(resume,nil) and ui.mapUI.visible)
ui:update(1)
assert(ui.mapUI.scroll==0,'mouse menu return must recenter the existing map')
assert(ui.map==map and ui.mapUI.map==map and ui.run.floor==floor and ui.mapUI.map.currentNodeId==node)

local drag=F.mapControl(panel,'dragArea')
drag.listeners.down(pointer(7,400))
drag.listeners.drag(pointer(7,250))
assert(ui.mapUI.scroll==150)
assert(tap(open,8) and not ui.mapUI.visible)
assert(tap(resume,9) and ui.mapUI.visible)
ui:update(1)
drag.listeners.drag(pointer(7,100))
drag.listeners.up(pointer(7,100))
assert(ui.mapUI.scroll==0,'resuming must retire the old touch before recentering')
assert(ui.map==map and ui.mapUI.map==map and ui.run.floor==floor and ui.mapUI.map.currentNodeId==node)
assert(ui:openExit() and not ui.mapUI.navigationEnabled)
assert(ui:closeExit() and ui.mapUI.navigationEnabled and calls==0)
print('NATIVE_UI_PARITY_PASS')
