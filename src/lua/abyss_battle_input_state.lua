-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local Combat = require("abyss_combat")
local Actors = require("abyss_actor")
local Run = require("abyss_run")
local EnemyView = require('abyss_battle_enemy_view')
local RewardOwner = require("abyss_battle_reward_owner")
local Controller = require("abyss_controller")
local M = {}
local function needsTarget(state, instance)
    -- Ask the core to validate the same card with and without a target.
    local _, reason = Combat.canPlay(state, instance.uid, nil)
    return reason == "invalid_target"
end
-- Finite current pointer evidence, shared by card, action, potion and target consumers.
-- It runs only on input callbacks, never in the frame loop; no queued commands.
local noTouch={}
local emptyInputs={}
local saturatedOrigin={ambiguous=true}
local MAX_POINTER_ORIGINS=16
local inputGroups={'cardInputs','potionInputs','actionInputs','enemyInputs'}
local function touchKey(event)return event and event.touchId or noTouch end
local function tokenOrigin(token)return token and (token.touch or noTouch)end
local function eachInput(ownership,visit)
    for _,name in ipairs(inputGroups)do
        for _,input in pairs(ownership[name] or emptyInputs)do if visit(input)then return true end end
    end
    return false
end
local function revokeInput(input)
    if input.held then input.held.anonymousSafe=false end
    if input.released then input.released.anonymousSafe=false end
end
local function clearPointer(input)
    revokeInput(input)
    input.held,input.released,input.pointerOverflow=nil,nil,nil
    for key,state in pairs(input.active or emptyInputs)do state.ambiguous=true;input.active[key]=nil end
end
local function retireOrigin(owner,input,origin)
    if input.active then input.active[origin]=nil end
    for _,name in ipairs({'held','released'})do
        local token=input[name]
        if tokenOrigin(token)==origin then
            token.anonymousSafe=false;input[name]=nil
            if owner.cardAim==token then owner.cardAim=nil end
        end
    end
end
local function uniqueOrigin(input)
    local origin
    for key in pairs(input.active or emptyInputs)do if origin then return end;origin=key end
    local held,released=tokenOrigin(input.held),tokenOrigin(input.released)
    if held and released and held~=released then return end
    local pending=held or released
    if origin and pending and origin~=pending then return end
    return origin or pending
end
local function pointerContext(owner,ownership)
    local run=owner.run
    local battle=run and run.combat
    local turn=battle and battle.turn
    local phase=run and run.phase
    if ownership.pointerRun~=run or ownership.pointerBattle~=battle
        or ownership.pointerTurn~=turn or ownership.pointerPhase~=phase then
        eachInput(ownership,clearPointer)
        ownership.pointerRun,ownership.pointerBattle=run,battle
        ownership.pointerTurn,ownership.pointerPhase=turn,phase
    end
end
local function beginPointer(owner,ownership,input,event)
    pointerContext(owner,ownership)
    input.active=input.active or {}
    if event and event.touchId~=nil then retireOrigin(owner,input,touchKey(event))end
    local ambiguous=false
    eachInput(ownership,function(other)
        if other.held or other.released or other.active and next(other.active)then ambiguous=true end
        revokeInput(other)
        for _,state in pairs(other.active or emptyInputs)do state.ambiguous=true end
    end)
    local count=0
    for _ in pairs(input.active)do count=count+1 end
    -- Missing terminal callbacks cannot create an unbounded touch-ID history.
    -- Saturation revokes anonymous recovery until the existing cancel barrier.
    if count>=MAX_POINTER_ORIGINS then input.pointerOverflow=true end
    if input.pointerOverflow then return saturatedOrigin end
    local state={ambiguous=ambiguous}
    input.active[touchKey(event)]=state
    return state
end
local function armPointer(input,token,event,state)
    token.originState=state
    token.anonymousSafe=state and not state.ambiguous and input.active[touchKey(event)]==state
end
local function endPointer(owner,input,event,ended)
    local origin=touchKey(event)
    if origin==noTouch and not(input.active and input.active[origin])then
        origin=uniqueOrigin(input);revokeInput(input)
        if origin then
            local gesture=owner.gesture
            retireOrigin(owner,input,origin)
            if gesture and gesture.input==input and tokenOrigin(gesture)==origin then
                owner.gesture,owner.selected,owner.hover,owner.suppressClick=nil,nil,nil,true
                owner:render()
            end
        end
        return
    end
    local state=input.active and input.active[origin]
    if input.active then input.active[origin]=nil end
    if ended and (state or tokenOrigin(input.held)==origin or tokenOrigin(input.released)==origin)then revokeInput(input)end
end
local function pointerEvent(token,event)
    if not token then return event end
    return {touchId=token.touch}
end
local function anonymousPointerReady(owner,input,token)
    return token and not input.pointerOverflow and token.anonymousSafe and token.originState
        and not token.originState.ambiguous and not owner.gesture and not owner.potionMenu
        and not(token.aim and token.aim.moving)
end
local function takePointer(owner,ownership,input,event,allowHeld,canAnonymous)
    local touch=event and event.touchId
    local token=input.released or touch~=nil and allowHeld and input.held
    if touch~=nil then
        if not token or token.touch~=touch then return end
    else
        input.released=nil -- blocked Clicks cannot replay after busy/turn recovery
        if canAnonymous and not canAnonymous(token)then return end
        if not anonymousPointerReady(owner,input,token)then return end
        local ambiguous=eachInput(ownership,function(other)
            return other.active and next(other.active) or other~=input and (other.held or other.released)
        end)
        if ambiguous then return end
    end
    input.held,input.released=nil,nil
    if input.active then input.active[touchKey(event)]=nil end
    token.anonymousSafe=false
    return token
end

-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, ownership, host, _dependencies)
    function owner:setData(nextData, nextPresentation)
        assert(not self.busy, "cannot replace card data during feedback")
        assert(type(nextData)=="table" and type(nextPresentation)=="table", "invalid UI card data")
        self.data, self.presentation = nextData, nextPresentation
        self.selected, self.hover, self.help = nil, nil, nil
    end
    local function child(name)
        local slot=name:match("^enemy(%d+)$")
        if slot and host.monsterSurfaces then return assert(host.monsterSurfaces:control(tonumber(slot)),"missing monster surface "..name)end
        local nested=name:match('^potion[45]$') or name:match('^potionHelp%d$') or name:match('^potionCaption%d$') or name=='potionReward' or name=='emeraldKeyReward' or name:match('^relicReward%d$')
        local found=(nested and host.stage:GetChild('potionHelp') or host.stage):GetChild(name)
        return assert(found, "missing UI control " .. name)
    end
    local function show(name, value) child(name):SetVisible(value == true) end
    local function label(name, value) child(name).text = value end
    local function colour(value) return host.platform.color(value.r, value.g, value.b, value.a) end
    local function tint(control, value) control.imageColor = colour(value) end
    local function ink(control, value) control.fontColor = colour(value) end
    local function picture(control, id)
        return control:SetImage(host.platform.imageSource, type(id) == "table" and id.id or id)
    end
    local function notice(value)
        label("notice", value)
        owner.rewardNotice = value
    end
    local function rewardScreen(screen)
        if owner.rewardScreen ~= screen then
            owner.rewardScreen, owner.rewardEpoch = screen, (owner.rewardEpoch or 0) + 1
            owner.hover = nil
        end
    end
    local function dragReady(g)
        return owner.active and not owner.busy and owner.run == g.run and owner.run.phase == "combat"
            and owner.run.combat == g.battle and g.battle.phase == "player" and g.battle.turn == g.turn
    end
    local function rewardReady(g)
        return RewardOwner.ready(owner, g)
    end
    local function cardReady(g)
        if not owner.active or owner.busy or owner.run ~= g.run or owner.run.phase ~= g.phase then return false end
        if g.phase == "combat" then
            local instance = g.battle.hand[g.slot]
            return dragReady(g) and instance ~= nil and instance.uid == g.uid
        end
        if g.phase ~= "reward" or owner.rewardScreen ~= "cards" or not rewardReady(g) then return false end
        return Run.rewardOptions(owner.run)[g.slot] == g.uid
    end
    local function cancelCardInputs()
        for _, input in ipairs(ownership.cardInputs) do clearPointer(input) end
    end
    local function potionReady(g)
        return dragReady(g) and owner.run.potions == g.inventory
            and owner.run.potions[g.slot] == g.id
    end
    local function cancelPotionInputs()
        for _, input in ipairs(ownership.potionInputs) do clearPointer(input) end
    end
    local function cancelPotionAim(message)
        if not owner.potionAim then return false end
        local aim=owner.potionAim
        if aim.moving and aim.input then
            aim.input.held,aim.input.released=nil,nil
            aim.input.consumed={touch=aim.touch}
            -- Explicit command wrappers may clear suppression before rejecting
            -- this invalidated aim. Retain that release's finite origin, while
            -- true stale/resize cancellation barriers remain deliberately true.
            if owner.suppressClick==false then
                ownership.releasedDragTouch,owner.suppressClick=aim.touch,aim
            end
        end
        owner.potionAim = nil
        if message then notice(message) end
        return true
    end
    local function aimReady(aim)
        if not potionReady(aim) then return false end
        if aim.moving and (not aim.input or not aim.input.held or aim.input.held.aim~=aim) then return false end
        local enemies = aim.battle.enemies
        if #enemies ~= #aim.actors then return false end
        for i, actor in ipairs(aim.actors) do
            if enemies[i] ~= actor or Actors.isActive(actor) ~= aim.living[i] then return false end
        end
        return true
    end
    local function actionContextReady(g)
        local run = owner.run
        if not owner.active or owner.busy or owner.gesture or run ~= g.run then return false end
        if run and (run.phase ~= g.phase or run.combat ~= g.battle
            or g.battle and g.battle.turn ~= g.turn) then return false end
        return true
    end
    local function playAreaReady(g)
        if g.aim then return owner.potionAim == g.aim and aimReady(g.aim) end
        local instance = g.battle and g.battle.hand[g.slot or 0]
        return dragReady(g) and instance and instance.uid == g.uid and owner.selected == g.uid
            and owner.selectionEpoch == g.selectionEpoch and not needsTarget(g.battle, instance)
    end
    local function rewardListActionReady(g, rewards)
        local relicIndex=g.name:match('^relicReward(%d)$')
        if relicIndex then
            local item=rewards.relics and rewards.relics[tonumber(relicIndex)]
            return item and not item.claimed and not item.unavailable
        end
        if g.name == "cardReward" then return not rewards.cardResolved end
        if g.name == "goldReward" then return rewards.goldClaimed == false end
        if g.name == 'emeraldKeyReward' then return Run.canClaimEmeraldKey(owner.run) end
        if g.name == "claimPotion" then return rewards.potion and not rewards.potion.resolved end
        if rewards.manualContinue then
            if g.name == "stolenGold" then return rewards.stolenGold and not rewards.stolenGold.claimed end
            if g.name == "continue" then return true end
        end
        return false
    end
    local function rewardActionReady(g, run)
        if not rewardReady(g) then return false end
        if owner.rewardScreen == "cards" then return g.name == "skip" and not run.rewards.cardResolved end
        if owner.rewardScreen ~= "list" then return false end
        return rewardListActionReady(g, run.rewards)
    end
    local function actionReady(g)
        if not actionContextReady(g) then return false end
        local run = owner.run
        if g.name == "start" then return not host.options.embedded and (not run or run.phase == "defeat") end
        if not run then return false end
        if g.name == "playArea" then return playAreaReady(g) end
        if g.name == "endTurn" then return dragReady(g) end
        if run.phase == "reward" then return rewardActionReady(g, run) end
        return g.name == "continue" and not host.options.embedded and run.phase == "map"
    end
    local function cancelActionInputs()
        for _, input in ipairs(ownership.actionInputs) do clearPointer(input) end
    end
    local function enemyAt(slot,battle)
        battle=battle or owner.run and owner.run.combat
        return battle and (host.monsterSurfaces and host.monsterSurfaces:entry(slot) or EnemyView.slots(battle,owner.feedback)[slot])
    end
    local function sameEnemySlot(slot,actor,battle)
        local entry=enemyAt(slot,battle)
        return entry and entry.actor==actor and entry.id==actor.id
    end
    local function enemyReady(g)
        return not owner.info and dragReady(g) and Actors.isActive(g.actor) and g.battle.enemies[g.slot] == g.actor
            and sameEnemySlot(g.screenSlot,g.actor,g.battle)
            and owner.selected == g.uid and owner.selectionEpoch == g.selectionEpoch
            and owner.potionAim == g.aim and (not g.aim or aimReady(g.aim))
    end
    local function discardEnemyPointer(input,event)
        local touch = event and event.touchId
        if input.held and input.held.touch == touch then input.held = nil end
        if input.released and input.released.touch == touch then input.released = nil end
    end
    -- Click-only controls must not inherit the latest completed drag's named
    -- touch, even after an independent action. A fresh Down retires that origin.
    -- Anonymous origins consume one ambiguous Click without a permanent lock.
    local function consumeReleasedDragClick(event)
        if not owner.active or owner.busy or owner.gesture then return false end
        local touch = event and event.touchId
        if touch ~= nil and touch == ownership.releasedDragTouch then return true end
        local g = owner.suppressClick
        if type(g) ~= 'table' then return false end
        owner.suppressClick = nil
        return g.touch == touch
    end
    return {
        pointerBegin=function(input,event)return beginPointer(owner,ownership,input,event)end,
        pointerArm=function(input,token,event,state)
            armPointer(input,token,event,state)
            if Controller.pointerBlocked(host.controller)then token.anonymousSafe=false end
        end,pointerEnd=function(input,event,ended)return endPointer(owner,input,event,ended)end,
        pointerTake=function(input,event,allowHeld,canAnonymous)return takePointer(owner,ownership,input,event,allowHeld,canAnonymous)end,
        pointerClear=clearPointer,pointerEvent=pointerEvent,
        child=child, show=show, label=label, colour=colour, tint=tint,
        ink=ink, picture=picture, notice=notice, rewardScreen=rewardScreen, dragReady=dragReady,
        rewardReady=rewardReady, cardReady=cardReady, cancelCardInputs=cancelCardInputs, potionReady=potionReady, cancelPotionInputs=cancelPotionInputs,
        cancelPotionAim=cancelPotionAim, aimReady=aimReady, actionContextReady=actionContextReady, playAreaReady=playAreaReady, rewardListActionReady=rewardListActionReady,
        rewardActionReady=rewardActionReady, actionReady=actionReady, cancelActionInputs=cancelActionInputs, enemyAt=enemyAt, sameEnemySlot=sameEnemySlot,
        enemyReady=enemyReady, discardEnemyPointer=discardEnemyPointer, consumeReleasedDragClick=consumeReleasedDragClick
    }
end
return M
