-- Command adapters are installed on their explicit Combat owner.
-- Each closure keeps late method reads, return values and error propagation.
local M={}
function M.createOwner(Actors)
local Combat = { addStatus = Actors.addStatus, addTemporaryStrength = Actors.addTemporaryStrength,
    statusView = Actors.statusView, block = Actors.block,
    attackAmount = Actors.attackAmount,intentAttackAmount=Actors.intentAttackAmount,intentAttackPreview=Actors.intentAttackPreview,
    faceTarget=Actors.faceTarget,blockAmount = Actors.blockAmount }

local Upgrade=require('abyss_card_upgrade')
local upgradeFields={combatBaseCost=true,validSearingBlowCopy=true,canUpgrade=true,upgrade=true}
local function upgradeIndex(_,key)if upgradeFields[key]then return Upgrade[key]end end
local function upgradeNewIndex(self,key,value)
 if upgradeFields[key]then Upgrade[key]=value else rawset(self,key,value)end
end
setmetatable(Combat,{__index=upgradeIndex,__newindex=upgradeNewIndex})

    return Combat
end

function M.install(Combat,Actors)
-- Explicit combat commands supplied to card/effect strategies. Dynamic reads
-- remain at the original execution point; the host keeps dispatch ownership.
function Combat.silentFinalAllowedAfterVictory(effect)
    return require('abyss_silent_final_cards').allowedAfterVictory(effect)
end
function Combat.initializeGeneratedCard(state,card)
    return require('abyss_defect_final_cards').created(state,card)
end
function Combat.chooseSilentFinal(state,token,uid)
    return require('abyss_silent_final_cards').choose(Combat,state,token,uid)
end
function Combat.applySilentFinal(state,item)
    return require('abyss_silent_final_cards').apply(Combat,state,item)
end
function Combat.supportsWatcherFinal(op)
    return require('abyss_watcher_final_cards').ops[op]
end
function Combat.applyWatcherFinal(state,effect)
    return require('abyss_watcher_final_cards').execute(Combat,state,effect)
end
function Combat.created(state,card)
    return require('abyss_watcher_final_cards').created(Combat,state,card)
end
function Combat.freshCard(state,id,prototype)
    return require('abyss_card_actions').fresh(Combat,state,id,prototype)
end
function Combat.moveCardToHand(state,card)
    return require('abyss_card_actions').toHand(state,card)
end
function Combat.exhaustCard(state,card)
    return require('abyss_card_actions').exhaust(Combat,state,card)
end
function Combat.drainCardActions(state)
    return require('abyss_card_actions').drain(Combat,state)
end
function Combat.applyCardAction(state,item)
    return require('abyss_card_actions').apply(Combat,state,item)
end
function Combat.isCardImplemented(card)
    return require('abyss_card_capability').isImplemented(card)
end
function Combat.recycleCard(state,card,queue)
    return require('abyss_defect_final_cards').recycle(state,card,queue,Combat)
end

function Combat.makeTemporaryCard(state,effect)
    return require('abyss_build_actions').makeCard(state,effect,Combat)
end
function Combat.beforePermanentCardObtain(context,definition)
    return require('abyss_relic_family_combat').common.beforeObtainCard(context,definition)
end
function Combat.onPermanentCardObtain(context,card,definition,permanentApi)
    return require('abyss_relic_family_combat').common.onObtainCard(context,card,definition,permanentApi)
end
function Combat.applyPermanentCardInventory(state,effects,target,run,inCombat)
    return require('abyss_inventory').apply(state,effects,target,run,inCombat,Combat)
end

-- Explicit Power capability for leaf lifecycle callers.
function Combat.applyPower(...)return Actors.applyPower(...)end
end
return M
