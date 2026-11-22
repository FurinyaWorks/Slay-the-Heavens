-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local Actors = require("abyss_actor")
local Run = require("abyss_run")
local RewardOwner = require("abyss_battle_reward_owner")
local RewardLayout = require("abyss_battle_reward_layout")
local Theme = require("abyss_theme")
local M = {}
local C, L = Theme.color, Theme.layout
-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, ownership, host, dependencies)
    local closeInfo
    local function endTurnFace(part,state)
        local fill=state=='disabled' and C.panelSunken or L.endTurn.faceColour
        for _,name in ipairs({'plate','plateLeft','plateRight'})do dependencies.tint(part:GetChild(name),fill)end
        dependencies.ink(part:GetChild('label'),state=='disabled' and C.textMuted or L.endTurn.textColour)
    end
    local function button(name, enabled, primary, caption)
        local box = dependencies.child(name)
        box.interactable,box.raycastTarget = enabled == true,enabled == true
        for _, state in ipairs({"normal", "hover", "pressed", "disabled"}) do
            local part = box:GetChild(state)
            if caption then part:GetChild("label").text = caption end
            if name=='endTurn' then
                endTurnFace(part,state)
            elseif not RewardLayout.paintButton(name,part,state,owner.run,host.platform,dependencies.tint,dependencies.ink)
                and (state == "normal" or state == "hover") then
                dependencies.tint(part:GetChild("plate"), primary and (state == "hover" and C.goldBright or C.geo) or C.panelRaised)
                dependencies.ink(part:GetChild("label"), primary and C.textOnLight or C.goldBright)
            end
        end
    end
    function owner:resize(width, height)
        local cancelled = dependencies.cancelPotionAim("已取消药水瞄准。") or self.gesture ~= nil or self.carry ~= nil
        dependencies.cancelCardInputs()
        dependencies.cancelPotionInputs()
        dependencies.cancelActionInputs()
        for _, input in ipairs(ownership.enemyInputs) do input.held, input.released = nil, nil end
        if cancelled then self.gesture, self.carry, self.selected, self.suppressClick = nil, nil, nil, true end
        if closeInfo() then cancelled = true end
        self.canvasWidth, self.canvasHeight = width, height
        local k = math.min(width / Theme.canvas.base[1], height / Theme.canvas.base[2])
        dependencies.child("dragLayer"):GetChild("hit"):SetSizeDelta(width/k,height/k)
        if not host.options.embedded then -- The host owns the single canvas scale.
            host.stage:SetLocalScale(k, k, 1)
            host.root:GetChild("backdrop"):SetSizeDelta(width, height)
        end
        if cancelled then self:render() end
    end
    local function describeInfo(battle, info, actor)
        return host.infoContent(owner.data, owner.presentation, battle, info, actor)
    end
    closeInfo = function()
        if host.potionPopup and host.potionPopup:close() then return true end
        if not owner.info then return false end
        local info = owner.info
        local pinnedEnemy = info.powerTips and info.index > 0 and not info.transient
        local passThrough = not info.kind and not pinnedEnemy or info.transient and info.kind == "card"
        owner.info = nil
        dependencies.child("statusInfo"):SetVisible(false)
        if not info.kind then dependencies.child("statusDismiss"):SetVisible(false) end
        return true,passThrough
    end
    function owner:dismissActorDetails(source)
        local info = self.info
        if not info or info.kind or source and (info.source ~= source or not info.transient) then return false end
        closeInfo()
        if not (info.powerTips and info.index > 0) then self:renderDetailsOnly() end
        return true
    end
    function owner:showStatus(index, source, transient, powerTips)
        return self:openHelp({index = index, toggle = not transient and not powerTips, powerTips = powerTips}, source, transient)
    end
    local function actorDetailAvailable(transient, enemyReader)
        if owner.gesture or owner.carry or owner.potionMenu then return false end
        if owner.potionAim and (owner.potionAim.moving or transient and not enemyReader) then return false end
        return not (transient and owner.info and not owner.info.transient)
    end
    local function repeatsDetail(spec, source, transient, battle, actor)
        local info = owner.info
        if not info or transient or info.transient or info.actor ~= actor
            or info.battle ~= battle or info.turn ~= battle.turn then return false end
        if info.powerTips ~= spec.powerTips or info.statusId ~= spec.statusId or info.offset ~= spec.offset then return false end
        return spec.toggle or not spec.kind and source and source == info.source
    end
    local function helpContext(spec)
        local run = owner.run
        if not spec or not run or not owner.active or owner.busy then return end
        local reward = spec.kind == "rewardCard" and RewardOwner.ready(owner, spec)
        if run.phase ~= "combat" and not reward then return end
        local battle = run.combat
        local actor = spec.index == 0 and battle.player or battle.enemies[spec.index]
        if Actors.isPresent(actor) then return battle, actor, reward end
    end
    function owner:openHelp(spec, source, transient)
        local battle, actor, reward = helpContext(spec)
        if not actor then return false end
        local enemyReader = spec.powerTips and spec.index > 0
        if not spec.kind and not actorDetailAvailable(transient, enemyReader) then return false end
        if spec.powerTips and not enemyReader and self.potionAim then return false end
        local cancelled = not enemyReader and dependencies.cancelPotionAim("已取消药水瞄准。")
        if repeatsDetail(spec, source, transient, battle, actor) then
            closeInfo()
            if not enemyReader then self:renderDetailsOnly(cancelled) end
            return true
        end
        if not spec.kind then
            local help = self.help
            if help and source ~= help.source then self.help = nil end
        end
        self.info={index=spec.index,id=actor.id,actor=actor,battle=battle,kind=spec.kind,powerTips=spec.powerTips,statusId=spec.statusId,
            offset=spec.offset,position=transient and spec.position or nil,uid=spec.uid,source=source,transient=transient==true,turn=battle.turn,
            slot=spec.slot,potionId=spec.potionId,inventory=spec.inventory,reward=reward and spec or nil}
        if enemyReader then
            if not transient then
                dependencies.cancelActionInputs()
                for _, input in pairs(ownership.enemyInputs) do input.held, input.released = nil, nil end
            end
            host.renderInfo(battle)
        else self:renderDetailsOnly(cancelled) end
        return self.info ~= nil
    end
    function owner.queueHelp(_,spec,source,held,touch,card)
        local battle, actor = helpContext(spec)
        if not actor then return end
        owner.help={spec=spec,source=source,held=held,touch=touch,t=0,run=owner.run,battle=battle,
            turn=battle.turn,actor=actor,card=card}
    end
    function owner.cardHelpSpec(_,slot)
        local run=owner.run
        if run and run.phase=='reward' and owner.rewardScreen=='cards' then
            local id=Run.rewardOptions(run)[slot]
            if not id then return end
            return RewardOwner.capture({kind='rewardCard',index=0,battle=run.combat,slot=slot,cardId=id,
                upgraded=run.rewards.cardUpgrades and run.rewards.cardUpgrades[slot]==true},owner,run)
        end
        local battle=owner.run and owner.run.phase=="combat" and owner.run.combat
        local instance=battle and battle.hand[slot]
        if not instance then return end
        -- Every live hand card needs a read-only detail route, even without keywords.
        return {kind="card",index=0,uid=instance.uid}
    end
    function owner:potionHelpSpec(slot)
        local run = self.run
        if not run or run.phase ~= "combat" or not run.potions[slot] or slot>Run.potionCapacity(run) then return end
        return {kind="potion",index=0,slot=slot,potionId=run.potions[slot],inventory=run.potions}
    end
    return {
        button=button, describeInfo=describeInfo, closeInfo=closeInfo, endTurnFace=endTurnFace
    }
end
return M
