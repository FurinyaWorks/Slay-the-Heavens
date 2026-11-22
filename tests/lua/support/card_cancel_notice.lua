package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local H=dofile('tests/lua/support/battle_action_fixture.lua')
local host,ui,panel=H.setup({'defend','strike'},{'cultist'})
ui:playSlot(1)
assert(ui.selected,'real selectable card')
host.run.combat.energy=0
ui:playSelected(nil)
assert(ui.selected and panel:GetChild('notice').text~='','rejected play must explain its failure')
assert(ui:cancelAim(),'cancel selected card through actual Back action')
assert(not ui.selected and panel:GetChild('notice').text=='','card cancellation must clear the stale failure message')
assert(not ui:cancelAim(),'repeated Back has no stale selection')
assert(panel:GetChild('notice').text=='','no stale notice after repeated cancellation')
print('CARD_CANCEL_NOTICE_PASS failure/cancel/repeat')
