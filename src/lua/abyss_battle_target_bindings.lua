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
    local noTouch={}
    local function touchKey(event)return event and event.touchId or noTouch end
    local function eachInput(visitor)
        for _,name in ipairs({'cardInputs','potionInputs','actionInputs','enemyInputs'})do
            for _,input in pairs(ownership[name] or {})do if visitor(input) then return true end end
        end
        return false
    end
    local function revokeAnonymous()
        local pending=false
        eachInput(function(input)
            if input.held or input.released or input.active and next(input.active)then pending=true end
            if input.held then input.held.anonymousSafe=false end
            if input.released then input.released.anonymousSafe=false end
        end)
        return pending
    end
    local function anonymousToken(input)
        local token=input.released
        if not token or not token.cardTarget or token.aim then return end
        input.released=nil -- even a blocked anonymous Click cannot replay after recovery
        if not token.anonymousSafe or owner.potionMenu or owner.gesture then return end
        local ambiguous=eachInput(function(other)
            return other.active and next(other.active) or other~=input and (other.held or other.released)
        end)
        if not ambiguous then return token end
    end
    local function prepareClick(input,event)
        local anonymous=ownership.enemyPointerObserved and not(event and event.touchId~=nil)
        return anonymous and anonymousToken(input) or nil,anonymous
    end
    local function consumeClick(input,event,token)
        if not ownership.enemyPointerObserved then return true end
        local released=token or input.released or input.held
        if not released or not token and released.touch~=(event and event.touchId)then return false end
        input.held,input.released=nil,nil
        input.active[touchKey(event)]=nil
        return dependencies.enemyReady(released)
    end
    local function anonymousDownReady(ambiguous)
        return not ambiguous and not Controller.pointerBlocked(host.controller)
    end
    local function bindAnonymousDrag(control,input)
        if not host.cursor.CursorDrag then return end
        control:AddCursorEventListener(host.cursor.CursorDrag,function(event)
            local touch=event and event.touchId
            if input.held and (touch==nil or input.held.touch==touch)then input.held.anonymousSafe=false end
        end)
    end
    local function bindEnemyControl(screenSlot,box)
        -- A preceding native registration may synchronously retire this surface.
        if host.monsterSurfaces and host.monsterSurfaces:control(screenSlot)~=box then return end
            if bound[box] then return end
            local control, input = box:GetChild("hit"), {active={}}
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
                if not entry or not token.uid or token.aim or not dependencies.enemyReady(token) then return end
                local selected
                for _,card in ipairs(token.battle.hand)do if card.uid==token.uid then selected=card end end
                if not selected or not needsTarget(token.battle,selected) then return end
                token.cardTarget=true
                token.previewReady=function()
                    if owner.gesture or not entryAt() or not dependencies.enemyReady(token) then return false end
                    if controller then
                        return Controller.isController(host.controller) and host.controller.api.getFocus()==control
                    end
                    return input.held==token or input.released==token
                end
                owner.cardAim=token
                if not controller then owner:render() end
            end
            local function chooseEnemy()
            local entry=entryAt()
            if not entry then return false end
            local target=entry.index
            local current=owner.run and owner.run.combat and owner.run.combat.enemies[target]
            if not current or current.id~=entry.id then return false end
            if owner.potionAim then
                local slot = owner.potionAim.slot
                owner.target = target
                return owner:commitPotion(slot, target)
            end
            if owner.active and not owner.busy and owner.run.phase == "combat" and Actors.isActive(current) then
                owner.target = target
                local selected
                for _, instance in ipairs(owner.run.combat.hand) do
                    if instance.uid == owner.selected then selected = instance break end
                end
                if selected and needsTarget(owner.run.combat, selected) then owner:playSelected(target)
                else
                    owner:showStatus(target)
                end
            end
            end
            Controller.bind(host.controller,control,function()
                local selected
                if owner.run and owner.run.combat then
                    for _,card in ipairs(owner.run.combat.hand)do if card.uid==owner.selected then selected=card end end
                end
                return (owner.potionAim or selected and needsTarget(owner.run.combat,selected)) and "aim" or "battle"
            end,function()owner.suppressClick=false;return chooseEnemy()end,function()
                local entry=entryAt()
                return dependencies.controllerReady() and owner.run.phase=="combat" and entry and Actors.isActive(entry.actor)
            end,screenSlot,"enemies",function()
                local entry=entryAt()
                if entry then
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
                local token,anonymous=prepareClick(input,event)
                if anonymous and not token then return false end
                if not entryAt() then return false end
                if Controller.pointerBlocked(host.controller)then return false end
                if dependencies.swallowed(event) then
                    -- Dismissal consumes this pointer too, but cannot consume a
                    -- newer token owned by a different touch on the same actor.
                    dependencies.discardEnemyPointer(input,event)
                    return
                end
                -- Named hosts retain Down/Click compatibility. Only anonymous
                -- Click needs the confirmed, unique Up token prepared above.
                if not consumeClick(input,event,token)then return end
                if not dependencies.consumeReleasedDragClick(event) and not owner.suppressClick and not owner.gesture then return chooseEnemy() end
            end)
            if not entryAt() then return end
            if owner.dragEnabled then
                control:AddCursorEventListener(host.cursor.CursorDown, function(event)
                    if not entryAt() then return false end
                    ownership.enemyPointerObserved = true
                    local ambiguous=revokeAnonymous()
                    input.active[touchKey(event)]=true
                    local dismissed = dependencies.down(event)
                    input.held, input.released = nil, nil
                    if dismissed then return end
                    local run, battle = owner.run, owner.run and owner.run.combat
                    local entry=entryAt()
                    local actor=entry and entry.actor
                    if not actor then return end
                    local g = {slot=entry.index,screenSlot=screenSlot, actor=actor, run=run, battle=battle,
                        uid=owner.selected, selectionEpoch=owner.selectionEpoch,aim=owner.potionAim,
                        turn=battle.turn, touch=event and event.touchId,
                        anonymousSafe=anonymousDownReady(ambiguous)}
                    if dependencies.enemyReady(g) then
                        input.held = g
                        previewEnemy(g,false)
                    end
                end)
                if not entryAt() then return end
                local function clearCardAim(token)
                    if owner.cardAim==token then owner.cardAim=nil;owner:render() end
                end
                local function releaseEnemy(event, ended)
                    if not entryAt() then return false end
                    ownership.enemyPointerObserved = true
                    input.active[touchKey(event)]=nil
                    local touch, held = event and event.touchId, input.held
                    if held and held.touch == touch then
                        input.held = nil
                        input.released = not ended and dependencies.enemyReady(held) and held or nil
                        if ended then
                            clearCardAim(held)
                            if dependencies.cancelPotionAim("已取消药水瞄准。") then owner:render() end
                        end
                    elseif ended and input.released and input.released.touch == touch then
                        clearCardAim(input.released)
                        input.released = nil
                        if dependencies.cancelPotionAim("已取消药水瞄准。") then owner:render() end
                    end
                end
                if host.cursor.CursorExit then
                    control:AddCursorEventListener(host.cursor.CursorExit,function(event)
                        input.active[touchKey(event)]=nil
                        local touch=event and event.touchId
                        if input.held and (touch==nil or input.held.touch==touch)then input.held.anonymousSafe=false end
                        if input.released and (touch==nil or input.released.touch==touch)then input.released.anonymousSafe=false end
                        local aim=owner.cardAim
                        if aim and aim.touch==(event and event.touchId) and (aim==input.held or aim==input.released) then
                            owner.cardAim=nil;owner:render()
                        end
                    end)
                end
                bindAnonymousDrag(control,input)
                if not entryAt() then return end
                control:AddCursorEventListener(host.cursor.CursorUp, releaseEnemy)
                if not entryAt() then return end
                control:AddCursorEventListener(host.cursor.CursorEndDrag, function(event) releaseEnemy(event, true) end)
            end
    end
    local function unbindEnemyControl(screenSlot,box,engineDestroyed)
        local input=bound[box]
        if not input then return end
        input.retired=true;input.held=nil;input.released=nil;input.active={}
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
