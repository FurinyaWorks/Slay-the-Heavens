-- Ordered binary32/binary64 attack modifiers; Actor supplies vulnerable policy.
local f32=require('abyss_sts_random').float32
local M={}
local function damageStep(trace,kind,value,operand)
    if kind=='vigor' and operand==0 or kind=='stance' and operand==1 then return value end
    if trace then trace[#trace+1]={kind=kind,value=value,operand=operand} end
    return value
end
local function applySourceAttackAdditions(source,amount,slow,trace)
        amount = amount + (source.statuses.strength or 0)
        damageStep(trace,'strength',amount,source.statuses.strength or 0)
        if slow then amount=damageStep(trace,'binary32',f32(amount)) end
        amount = amount + (source.statuses.vigor or 0)
        damageStep(trace,'vigor',amount,source.statuses.vigor or 0)
        if slow then amount=damageStep(trace,'binary32',f32(amount)) end
    return amount
end
local function applySourceAttackBonuses(state,source,target,amount,slow,trace,api)
    amount=applySourceAttackAdditions(source,amount,slow,trace)
        if (source.statuses.double_damage or 0)>0 then amount=damageStep(trace,'double_damage',amount*2,2) end
        if (source.statuses.pen_nib or 0)>0 then amount=damageStep(trace,'pen_nib',amount*2.0,2) end
        if (source.statuses.weak or 0) > 0 then amount = damageStep(trace,'weak',amount * state.rules.combat.weakPercent / 100,state.rules.combat.weakPercent/100) end
        if slow then amount=damageStep(trace,'binary32',f32(amount)) end
        if (target.statuses.vulnerable or 0) > 0 and target.statuses.slow==nil then
            local percent=api.vulnerablePercent(state,target)
            amount=amount*percent/100
            damageStep(trace,'vulnerable',amount,percent/100)
        end
    return amount
end
function M.float(state, source, target, base, fixed,trace,api)
    -- Force float arithmetic before modifiers: Fengari integers are 32-bit,
    -- while game Lua uses wider integers. Integer multiplication would wrap.
    local amount = base + 0.0
    damageStep(trace,'base',amount)
    local slow=not fixed and target.statuses.slow~=nil
    if slow then amount=damageStep(trace,'binary32',f32(amount)) end
    if not fixed then amount=applySourceAttackBonuses(state,source,target,amount,slow,trace,api)end
    if state.player.stance and source then
        local multiplier=require('abyss_stance_damage').damageMultiplier(state, source, target, fixed)
        amount = amount * multiplier
        damageStep(trace,'stance',amount,multiplier)
        if slow then amount=damageStep(trace,'binary32',f32(amount)) end
    end
    if not fixed and target.statuses.slow~=nil then
        amount=require('abyss_giant_head').receive(state,target,amount,trace)
    end
    if not fixed and (target.statuses.flight or 0)>0 then amount=damageStep(trace,'flight',amount/2,.5) end
    return amount
end
M.step=damageStep
return M
