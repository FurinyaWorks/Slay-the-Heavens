package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local H=dofile('tests/lua/support/battle_gesture_fixture.lua')

for _, input in ipairs({'Back', 'right-click'}) do
    local host,ui,panel=H.setup({'defend','strike'},{'cultist'},{keyEvents={KeyboardSprintKeyDown='right'}})
    local cancel=input=='Back' and function()return ui:controllerBack()end or panel.keyListeners.right
    ui:playSlot(1)
    assert(ui.selected,'real selectable card')
    host.run.combat.energy=0
    ui:playSelected(nil)
    assert(ui.selected and panel:GetChild('notice').text~='','rejected play must explain its failure')
    assert(cancel(),input..' cancels the selected card')
    assert(not ui.selected and panel:GetChild('notice').text=='',input..' must clear the stale failure message')
    assert(not cancel(),input..' has no stale selection on repeat')
    assert(panel:GetChild('notice').text=='','no stale notice after repeated cancellation')
end

print('CARD_CANCEL_NOTICE_PASS failure/cancel/repeat')
