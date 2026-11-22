-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local Combat = require("abyss_combat")
local Actors = require("abyss_actor")
local Controller = require("abyss_controller")
local M = {}
local function needsTarget(state, instance)
    -- Ask the core to validate the same card with and without a target.
    local _, reason = Combat.canPlay(state, instance.uid, nil)
    return reason == "invalid_target"
end
-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, ownership, host, dependencies)
    local bound=setmetatable({}, {__mode="k"})
    local function bindEnemyControl(screenSlot,box)
        -- A preceding native registration may synchronously retire this surface.
        if host.monsterSurfaces and host.monsterSurfaces:control(screenSlot)~=box then return end
            if bound[box] then return end
            local control, input = box:GetChild("hit"), {}
            local manager=host.monsterSurfaces
            local captured=manager and manager:entry(screenSlot)
            local actorId=captured and captured.id
            local boundRun,boundBattle=owner.run,owner.run and owner.run.combat
            local function entryAt()
                if input.retired or box.alive==false then return end
                if manager then
                    if host.monsterSurfaces~=manager or manager:control(screenSlot)~=box
                        or owner.run~=boundRun or not boundRun or boundRun.combat~=boundBattle then return end
                    local entry=manager:entry(screenSlot)
                    local current=entry and boundBattle.enemies[entry.index]
                    if entry and entry.id==actorId and current and current.id==actorId then return entry end
                    return
                end
                return dependencies.enemyAt(screenSlot)
            end
            assert(not manager or captured,"dynamic enemy must be published before binding")
            input.control=control
            bound[box]=input
            ownership.enemyInputs[screenSlot] = input
            -- Preview ownership is separate from owner.target (which defaults to 1).
            -- Reuse the same selection/turn/actor checks as the eventual command.
            local function previewEnemy(token, controller)
                local entry=entryAt()
                if not entry or not Actors.isActive(entry.actor) or not token.uid or token.aim or not dependencies.enemyReady(token) then return end
                local selected
                for _,card in ipairs(token.battle.hand)do if card.uid==token.uid then selected=card end end
                if not selected or not needsTarget(token.battle,selected) then return end
                token.previewReady=function()
                    if owner.gesture or not Actors.isActive(token.actor) or not entryAt() or not dependencies.enemyReady(token) then return false end
                    if controller then
                        return Controller.isController(host.controller) and host.controller.api.getFocus()==control
                    end
                    return input.held==token or input.released==token
                end
                owner.cardAim=token
                if not controller then owner:render() end
            end
            local device = host.platform and host.platform.touchScreen
            local function selectedCard()
                local battle = owner.run and owner.run.combat
                for _, instance in ipairs(battle and battle.hand or {}) do
                    if instance.uid == owner.selected then return instance end
                end
            end
            local function dismissPinnedReader(event, down)
                local info = owner.info
                if not info or not info.powerTips or info.index == 0 or info.transient then return false end
                local selected = selectedCard()
                if not owner.potionAim and not (selected and needsTarget(owner.run.combat, selected)) then return false end
                if not owner:dismissActorDetails() then return false end
                if down then owner.swallow = {touch = event and event.touchId} end
                dependencies.discardEnemyPointer(input, event)
                return true
            end
            local function inspectEnemy(target, pointer)
                if pointer and device and not device() then return false end
                return owner:showStatus(target, control, false, true)
            end
            local function chooseEnemy(pointer)
            local entry=entryAt()
            if not entry then return false end
            local target=entry.index
            local current=owner.run and owner.run.combat and owner.run.combat.enemies[target]
            if not Actors.isPresent(current) or current.id~=entry.id then return false end
            if owner.potionAim then
                if not Actors.isActive(current) then return false end
                local slot = owner.potionAim.slot
                owner.target = target
                return owner:commitPotion(slot, target)
            end
            if owner.active and not owner.busy and owner.run.phase == "combat" then
                local selected = selectedCard()
                if selected and needsTarget(owner.run.combat, selected) then
                    if not Actors.isActive(current) then return false end
                    owner.target = target
                    return owner:playSelected(target)
                end
                if Actors.isActive(current) then owner.target = target end
                return inspectEnemy(target, pointer)
            end
            end
            Controller.bind(host.controller,control,function()
                local selected = selectedCard()
                return (owner.potionAim or selected and needsTarget(owner.run.combat,selected)) and "aim" or "battle"
            end,function()owner.suppressClick=false;return chooseEnemy()end,function()
                local entry=entryAt()
                if not (dependencies.controllerReady() and owner.run.phase == "combat" and entry) then return false end
                local selected = selectedCard()
                return Actors.isActive(entry.actor) or Actors.isPresent(entry.actor)
                    and not owner.potionAim and not (selected and needsTarget(owner.run.combat, selected))
            end,screenSlot,"enemies",function()
                local entry=entryAt()
                if entry and Actors.isActive(entry.actor) then
                    owner.target=entry.index
                    local battle=owner.run and owner.run.combat
                    previewEnemy({slot=entry.index,screenSlot=screenSlot,actor=entry.actor,run=owner.run,
                        battle=battle,turn=battle and battle.turn,uid=owner.selected,
                        selectionEpoch=owner.selectionEpoch,aim=owner.potionAim},true)
                    owner:render()
                end
            end)
            if not entryAt() then return end
            control:AddCursorEventListener(host.clickEvent, function(event)
                if not entryAt() or Controller.pointerBlocked(host.controller)then return false end
                if dismissPinnedReader(event) or dependencies.swallowed(event, true) then
                    -- Dismissal consumes this pointer too, but cannot consume a
                    -- newer token owned by a different touch on the same actor.
                    dependencies.discardEnemyPointer(input,event)
                    return
                end
                if ownership.enemyPointerObserved then
                    -- Existing enemy hosts may send Down/Click without Up. Both
                    -- forms consume the same actor-bound, one-shot ownership.
                    local released = input.released or input.held
                    if not released or released.touch ~= (event and event.touchId) then return end
                    input.held, input.released = nil, nil
                    if not dependencies.enemyReady(released) then return end
                end
                if not dependencies.consumeReleasedDragClick(event) and not owner.suppressClick and not owner.gesture then return chooseEnemy(true) end
            end)
            if not entryAt() then return end
            local function bindPointer()
                control:AddCursorEventListener(host.cursor.CursorDown, function(event)
                    if not entryAt() then return false end
                    ownership.enemyPointerObserved = true
                    local token = input.held or input.released
                    if token and dependencies.enemyReady(token) and token.touch ~= (event and event.touchId) then return end
                    local dismissed = dismissPinnedReader(event, true) or dependencies.down(event, true)
                    input.held, input.released = nil, nil
                    if dismissed then return end
                    local run, battle = owner.run, owner.run and owner.run.combat
                    local entry=entryAt()
                    local actor=entry and entry.actor
                    if not actor then return end
                    local g = {slot=entry.index,screenSlot=screenSlot, actor=actor, run=run, battle=battle,
                        uid=owner.selected, selectionEpoch=owner.selectionEpoch,aim=owner.potionAim,
                        turn=battle.turn, touch=event and event.touchId}
                    if dependencies.enemyReady(g) then
                        input.held = g
                        previewEnemy(g,false)
                    end
                end)
                if not entryAt() then return end
                local function retireAim(token)
                    if owner.cardAim == token then owner.cardAim = nil; owner:render() end
                    if dependencies.cancelPotionAim("已取消药水瞄准。") then owner:render() end
                end
                local function releaseEnemy(event, ended)
                    if not entryAt() then return false end
                    ownership.enemyPointerObserved = true
                    local touch, held = event and event.touchId, input.held
                    if held and held.touch == touch then
                        input.held = nil
                        if ended then retireAim(held)
                        elseif not (event and event.dragging) and dependencies.enemyReady(held) then input.released = held end
                    elseif ended and input.released and input.released.touch == touch then
                        local released = input.released
                        input.released = nil
                        retireAim(released)
                    end
                end
                if device and host.cursor.CursorEnter and host.cursor.CursorExit then
                    control:AddCursorEventListener(host.cursor.CursorEnter,function()
                        if device() or Controller.isController(host.controller) or Controller.pointerBlocked(host.controller) or owner.selected then return end
                        local entry = entryAt()
                        if entry then return owner:showStatus(entry.index, control, true, true) end
                    end)
                end
                if not entryAt() then return end
                if host.cursor.CursorExit then
                    control:AddCursorEventListener(host.cursor.CursorExit,function(event)
                        if device then owner:dismissActorDetails(control) end
                        local aim=owner.cardAim
                        if aim and aim.touch==(event and event.touchId) and (aim==input.held or aim==input.released) then
                            owner.cardAim=nil;owner:render()
                        end
                    end)
                end
                if not entryAt() then return end
                control:AddCursorEventListener(host.cursor.CursorUp, releaseEnemy)
                if not entryAt() then return end
                if device and host.cursor.CursorDrag then
                    control:AddCursorEventListener(host.cursor.CursorDrag, function(event) releaseEnemy(event, true) end)
                end
                if not entryAt() then return end
                control:AddCursorEventListener(host.cursor.CursorEndDrag, function(event) releaseEnemy(event, true) end)
            end
            if owner.dragEnabled then bindPointer() end
    end
    local function unbindEnemyControl(screenSlot,box,engineDestroyed)
        local input=bound[box]
        if not input then return end
        input.retired=true;input.held=nil;input.released=nil
        if owner.info and owner.info.source == input.control then owner.info = nil end
        if ownership.enemyInputs[screenSlot]==input then ownership.enemyInputs[screenSlot]=nil end
        Controller.unbind(host.controller,input.control,engineDestroyed)
        bound[box]=nil
    end
    local function bindEnemyControls()
        if host.monsterSurfaces then return end
        for i=1,5 do bindEnemyControl(i,dependencies.child("enemy"..i)) end
    end
    local function helpActorReady(token,run)
        local spec=token.spec
        local actor=spec.index==0 and run.combat.player or run.combat.enemies[spec.index]
        if spec.controlBox and (not host.monsterSurfaces
            or host.monsterSurfaces:control(spec.screenSlot)~=spec.controlBox) then return false end
        return actor==token.actor and Actors.isPresent(token.actor)
            and (not spec.screenSlot or dependencies.sameEnemySlot(spec.screenSlot,token.actor,run.combat))
    end
    return {
        bindEnemyControls=bindEnemyControls, bindEnemyControl=bindEnemyControl,
        unbindEnemyControl=unbindEnemyControl, helpActorReady=helpActorReady
    }
end
return M
