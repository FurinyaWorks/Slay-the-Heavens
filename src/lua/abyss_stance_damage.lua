-- Pure stance damage stage; lifecycle and flow actions stay with Stances.
local M={}
local valid={Neutral=true,Wrath=true,Calm=true,Divinity=true}
function M.validStance(id)
    return valid[id]
end
function M.requirePlayer(state)
    assert(type(state)=="table" and type(state.player)=="table", "missing stance player")
    assert(valid[state.player.stance or "Neutral"], "invalid current stance")
    return state.player
end
-- Apply after Strength and the other source modifiers, before the final floor.
function M.damageMultiplier(state, source, target, fixed)
    local p=M.requirePlayer(state)
    assert(type(source)=="table" and type(target)=="table", "invalid stance damage actors")
    assert(fixed==nil or type(fixed)=="boolean", "invalid stance damage type")
    if fixed then return 1 end
    local n=1
    if source==p then
        if p.stance=="Wrath" then n=2 elseif p.stance=="Divinity" then n=3 end
    end
    if target==p and p.stance=="Wrath" then n=n*2 end
    return n
end
return M
