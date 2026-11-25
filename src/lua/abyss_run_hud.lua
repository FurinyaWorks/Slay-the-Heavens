local number=require('abyss_numbers').integer
local M={}

function M.resourceText(run,player,fallbackHp)
    local state=player or (run and run.phase=='combat' and run.combat and run.combat.player) or run
    local hp=state and state.hp or fallbackHp
    local maxHp=state and state.maxHp or fallbackHp
    return number(hp)..'/'..number(maxHp),number(state and state.gold or 0)
end
return M
