local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local confirm=dofile('tests/lua/support/confirm_potion_popup.lua')
local M={F=H.F}
function M.setup()
    local host,ui,panel,event,tap,drain=H.setup({'strike','defend'},{'cultist','jaw_worm'}, {touchScreen=function()return true end})
    host.run.potions={'fire_potion','fire_potion'};host:refresh()
    local function hit(target)return H.F.actorControl(panel,'enemy'..(target or 1)):GetChild('hit')end
    local function anonymous(target,payload)return hit(target).click(payload)end
    local function arm(slot,touch)
        local previous=ui.potionAim;tap('potion'..slot,touch);confirm(ui,panel,touch,previous)
        assert(ui.potionAim and not ui.potionAim.moving and ui.potionAim.slot==slot,'explicit Use did not enter tap aim')
        return ui.potionAim
    end
    return host,ui,panel,event,tap,arm,anonymous,hit
end
function M.hand(battle)
    local rows={};for i,card in ipairs(battle.hand)do rows[i]=card.uid end;return rows
end
function M.unchangedHand(battle,rows)
    assert(battle.energy==3 and #battle.hand==#rows,'potion input changed energy or played a hand card')
    for i,uid in ipairs(rows)do assert(battle.hand[i].uid==uid,'potion input changed hand identity')end
end
return M
