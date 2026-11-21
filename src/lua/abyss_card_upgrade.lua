-- Combat-instance upgrade ownership, independent of play/queue orchestration.
local StatusHooks=require('abyss_blood_for_blood_cost')
local M={}
function M.combatBaseCost(state, instance)
    local def=assert(state.catalog.cards[instance.cardId])
    if def.costMode=='all_energy' then return -1 end
    local cost=instance.upgraded and def.upgrade and def.upgrade.cost or def.cost
    if instance.costOverride~=nil then cost=instance.costOverride end
    if instance.cardId=='masterful_stab'then cost=instance.combatCost or (instance.costOverride~=nil and cost or cost+(instance.masterfulLosses or 0))end
    if instance.cardId=='blood_for_blood' then cost=math.max(0,cost-(instance.costReduction or 0)) end
    return cost
end
function M.validSearingBlowCopy(instance)
    local base=instance.searingBlowCopyUpgrades
    if base==nil then return true end
    local n=instance.upgrades
    return instance.cardId=='searing_blow' and type(base)=='number' and base%1==0 and base>=0 and base<=2147483647
        and type(n)=='number' and n%1==0 and n>=base and n<=2147483647
        and type(instance.upgraded)=='boolean' and instance.upgraded==(n>base)
end
function M.canUpgrade(state,instance)
    local d=state.catalog.cards[instance.cardId]
    return M.validSearingBlowCopy(instance) and d and d.type~='status' and d.type~='curse' and d.upgrade~=nil and (not instance.upgraded or d.repeatable==true)
end
local function bloodCostBeforeUpgrade(state,instance)
    if instance.combatCost==nil then instance.combatCost=M.combatBaseCost(state,instance)end
    if instance.turnCost==nil and instance.costForTurn~=nil then instance.turnCost=instance.costForTurn end
    StatusHooks.onUpgrade(state,instance)
    instance.costOverride,instance.costReduction=nil,nil
    if instance.costForTurn~=nil then instance.costForTurn=instance.turnCost end
end
local function overrideCostBeforeUpgrade(state,instance,def)
    local before=M.combatBaseCost(state,instance)
    local turn=instance.costForTurn or before
    local diff=turn-before
    local nextCost=def.upgrade.cost
    instance.costOverride=nil
    if turn>0 then instance.costForTurn=math.max(0,nextCost+diff)end
end
function M.upgrade(state,instance)
    if not M.canUpgrade(state,instance)then return false end
    local def=state.catalog.cards[instance.cardId]
    if instance.cardId=='blood_for_blood'and not instance.upgraded then bloodCostBeforeUpgrade(state,instance)
    elseif def.upgrade.cost~=nil and (instance.costOverride~=nil or instance.costForTurn~=nil)then overrideCostBeforeUpgrade(state,instance,def)end
    instance.upgrades=(instance.upgrades or(instance.upgraded and 1 or 0))+1
    instance.upgraded=true;return true
end
return M
