-- Artifact consumption and its observable reduction event.
local Presence=require('abyss_actor_presence')
local Events=require('abyss_events')
local M={}
function M.consume(state, actor, id)
    local before = actor.statuses.artifact or 0
    if before <= 0 then return false end
    actor.statuses.artifact = before - 1
    if before==1 and actor.definitionId then require('abyss_power_order').remove(actor,'artifact') end
    local callbackBefore=#state.events
    Events.emit(state, "status", {source=actor.id, target=actor.id, status="artifact",
        amount=-1, blockedStatus=id})
    -- Current core already compresses Artifact's queued Reduce/Remove into this
    -- consumption. Attribute its callback to that reduction, not failed Apply.
    Events.onModifyPower(state,'ArtifactPower.queuedReduction',callbackBefore,'compressed-existing-reduction')
    return true
end
function M.tryBlockDebuff(state, actor, id)
    if not Presence.isActive(actor) then return false end
    return M.consume(state, actor, id)
end
return M
