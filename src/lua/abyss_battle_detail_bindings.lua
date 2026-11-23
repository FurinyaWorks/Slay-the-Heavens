-- Read state, issue Run commands. No damage/energy/outcome rules live in this view.
local Combat = require("abyss_combat")
local Actors = require("abyss_actor")
local Theme = require("abyss_theme")
local Pointer = require('abyss_pointer_input')
local M = {}
local L = Theme.layout
local function validPower(value,id)
    return value and value.id==id and not value.hidden
end
local function potionCurrent(spec, run)
    return spec.kind ~= "potion" or run.potions == spec.inventory and run.potions[spec.slot] == spec.potionId
end
local function travelerCombat(run)
    return not run.combat.originalV4 and (run.character == nil or run.character == "ironclad")
end
local function closeSource(owner, closeInfo, control, silent)
    local info = owner.info
    if not info or info.source ~= control then return end
    if silent == true and info.powerTips then owner.info = nil
    elseif info.powerTips and info.index > 0 then owner:dismissActorDetails(control)
    elseif info.transient then
        closeInfo()
        if silent ~= true then owner:renderDetailsOnly() end
    end
end
local function bindEnemyReaders(bindHelp, screenSlot, box, entryAt, guard, cleanups)
    for _, name in ipairs({"intentHit", "hpHit"}) do
        if guard and not guard() then return end
        local control = box:GetChild(name)
        local intentOnly = name == "intentHit"
        local function describe()
            local entry = entryAt()
            if not entry or control.visible == false or not Actors.isPresent(entry.actor) then return end
            return {index = entry.index, screenSlot = screenSlot, controlBox = guard and box or nil,
                powerTips = true, intentOnly = intentOnly}
        end
        bindHelp(control, describe, true, nil, guard, cleanups, "enemy")
    end
end
local function helpPressReady(owner, token, run)
    return token and owner.active and not owner.busy and not owner.gesture and not owner.carry and run == token.run
        and run.phase == "combat" and run.combat == token.battle and run.combat.turn == token.turn
end
-- Explicit ports preserve the approved implementation without a shared constructor closure.
function M.install(owner, _ownership, host, dependencies)
    local touchScreen = host.platform and host.platform.touchScreen
    local function statusActorAt(slot)
        local battle=owner.run and owner.run.combat
        if not battle then return end
        if slot==0 then return battle,0,battle.player end
        local entry=dependencies.enemyAt(slot,battle)
        if entry then return battle,entry.index,entry.actor end
    end
    local function hasCursorPair(first,second)
        return host.cursor and host.cursor[first] and host.cursor[second]
    end
    local function closeAutomaticCard(control)
        local info=owner.info
        if Theme.presentationProfile=='official-assets-first' and info and info.source==control
            and info.transient and info.kind=='card' then dependencies.closeInfo()end
    end
    local function forgetHelp(control,hoverSlot,input)
        input.held,input.released,input.consumed=nil,nil,nil
        if hoverSlot and owner.hover==hoverSlot then owner.hover=nil end
        if owner.help and owner.help.source==control then owner.help=nil end
        if owner.info and owner.info.source==control then owner.info=nil end
    end
    -- hoverSlot: a reward card also reports pointer enter/exit for its hover pose (one listener per event).
    local function bindHelp(control,describe,clickable,hoverSlot,guard,cleanups,actorControl)
        local function current()return not guard or guard()end
        if not current() then return end
        local input={}
        local enemyReader = actorControl == "enemy"
        local function keepActor()
            local info = owner.info
            return actorControl and (enemyReader or not (info and info.powerTips and info.index > 0 and not info.transient))
        end
        local function on(kind, callback) control:AddCursorEventListener(kind, callback) end
        local function show(spec, transient)
            if actorControl == "overview" then return owner:showStatus(spec.index, control, transient, spec.powerTips) end
            return owner:openHelp(spec, control, transient)
        end
        local function hoverOnly(spec)
            return spec and spec.powerTips and touchScreen and not touchScreen()
        end
        local function cancel(silent,engineDestroyed,event)
            if engineDestroyed then input.engineDestroyed=true end
            if input.engineDestroyed then forgetHelp(control,hoverSlot,input);return end
            local token = input.held or input.released
            if event and token and token.touch ~= event.touchId then return end
            input.held,input.released,input.consumed=nil,nil,nil
            closeAutomaticCard(control)
            if hoverSlot and owner.hover==hoverSlot then owner:setHover(nil) end
            if owner.help and owner.help.source==control then owner.help=nil end
            closeSource(owner, dependencies.closeInfo, control, silent)
        end
        if cleanups then cleanups[#cleanups+1]={control=control,cancel=cancel} end
        if hasCursorPair("CursorEnter","CursorExit") then
            on(host.cursor.CursorEnter,function()
                if not current() then return false end
                if hoverSlot then owner:setHover(hoverSlot) end
                local spec = describe()
                if spec and not spec.kind then
                    if not Pointer.blocked(host.platform) and not (touchScreen and touchScreen()) then
                        return show(spec, true)
                    end
                else owner:queueHelp(spec,control,false) end
            end)
            if not current() then return end
            on(host.cursor.CursorExit,function(event) cancel(false,false,event) end)
        end
        if not clickable or not current() then return end
        local function ready(token)
            local run=owner.run
            return current() and helpPressReady(owner, token, run)
                and dependencies.helpActorReady(token,run)
                and (not owner.potionAim or enemyReader and not owner.potionAim.moving or not token.spec.powerTips)
                and potionCurrent(token.spec,run)
        end
        local function tappedSpec(touch)
            if not input.pointerObserved then return describe() end
            local token = input.released
            if not token or token.touch ~= touch then return end
            input.released = nil
            if not ready(token) then return end
            local spec = describe()
            if spec and spec.powerTips == token.spec.powerTips and spec.statusId == token.spec.statusId
                and spec.offset == token.spec.offset then return spec end
        end
        on(host.clickEvent,function(event)
            if not current() or Pointer.blocked(host.platform) or enemyReader and event and event.dragging then return false end
            local touch = event and event.touchId
            if input.consumed and input.consumed.touch == touch then input.consumed = nil; return end
            if dependencies.consumeReleasedDragClick(event) or owner.suppressClick then return end
            local spec = tappedSpec(touch)
            if spec and not hoverOnly(spec) and not dependencies.swallowed(event, keepActor()) then return show(spec, false) end
        end)
        if not current() or not hasCursorPair("CursorDown","CursorUp") then return end
        local function bindPress()
            local function capturePress(spec, event)
                local run = owner.run
                if not run or run.phase ~= "combat" or not spec then return end
                local actor = spec.index == 0 and run.combat.player or run.combat.enemies[spec.index]
                local press = {run=run,battle=run.combat,turn=run.combat.turn,touch=event and event.touchId,spec=spec,actor=actor}
                if not ready(press) then return end
                input.held = press
                if actorControl ~= "overview" and not spec.powerTips then owner:queueHelp(spec,control,true,press.touch) end
            end
            on(host.cursor.CursorDown,function(event)
                if not current() then return false end
                local token = input.held or input.released
                if actorControl and ready(token) and token.touch ~= (event and event.touchId) then return end
                input.pointerObserved=true;input.held,input.released,input.consumed=nil,nil,nil
                if hoverOnly(describe()) then return end
                if dependencies.down(event, keepActor(), enemyReader) then return end
                capturePress(describe(), event)
            end)
            if not current() then return end
            local function releaseHelp(token)
                local help = owner.help
                owner.help = nil
                local info = owner.info
                if not help.fired or not info or info.source ~= control or not info.transient then
                    input.released = token
                    return
                end
                input.consumed = {touch = token.touch}
                info.transient = false
                owner:renderDetailsOnly()
            end
            on(host.cursor.CursorUp,function(event)
                local token = input.held
                if not token or token.touch ~= (event and event.touchId) then return end
                input.held = nil
                if not ready(token) or event and event.dragging then
                    if owner.help and owner.help.source == control then owner.help = nil end
                elseif owner.help and owner.help.source == control then releaseHelp(token)
                else input.released = token end
            end)
            if not current() then return end
            if host.cursor.CursorEndDrag then
                on(host.cursor.CursorEndDrag,function(event) cancel(false,false,event) end)
            end
            if not current() then return end
            if actorControl and host.cursor.CursorDrag then
                on(host.cursor.CursorDrag,function(event) cancel(false,false,event) end)
            end
        end
        bindPress()
    end

    local function statusSpec(screenSlot, position)
        local _, index, actor = statusActorAt(screenSlot)
        if not Actors.isPresent(actor) then return end
        local entries = Combat.statusView(actor)
        if not entries[position] then return end
        local slots = L.statusIcon.perRow * L.statusIcon.rows
        local overflow = position == slots and #entries >= slots
        local playerPosition = screenSlot == 0 and touchScreen and travelerCombat(owner.run) and position or nil
        local spec = {index = index, screenSlot = screenSlot > 0 and screenSlot or nil,
            powerTips = (screenSlot > 0 or touchScreen ~= nil) and true or nil, position = playerPosition}
        if overflow then spec.offset = position else spec.statusId = entries[position].id end
        return spec
    end

    local function bindActorHelp(screenSlot, box, entryAt, guard, cleanups)
        if screenSlot > 0 then bindEnemyReaders(bindHelp, screenSlot, box, entryAt, guard, cleanups) end
        if guard then return end
        for slot = 1, L.statusIcon.perRow * L.statusIcon.rows do
            local position = slot
            bindHelp(box:GetChild("statusRow"):GetChild("hit" .. slot), function()
                return statusSpec(screenSlot, position)
            end, true, nil, nil, nil, screenSlot > 0 and "enemy" or "status")
        end
    end

    local function bindDetailControls()
        -- Portrait targeting remains on the enemy hit. All other actor controls
        -- are read-only and use the same status reader as an untargeted portrait.
        local hero = dependencies.child("hero")
        hero.disableCursorEventPassthrough = true
        local row = hero:GetChild("statusRow")
        row.disableCursorEventPassthrough = true
        local function player()
            local _, _, actor = statusActorAt(0)
            local run = owner.run
            if not actor then return end
            return {index = 0, powerTips = touchScreen and travelerCombat(run) or nil}
        end
        bindHelp(hero:GetChild("hit"), player, true, nil, nil, nil, "overview")
        bindHelp(row:GetChild("hit"), player, true, nil, nil, nil, "overview")
        if touchScreen then
            local size = L.statusIcon.size + L.statusIcon.gap
            for slot = 1, L.statusIcon.perRow * L.statusIcon.rows do row:GetChild("hit" .. slot):SetSizeDelta(size, size) end
        end
        if not host.monsterSurfaces then
            for slot = 1, 5 do
                local control = dependencies.child("enemy"..slot):GetChild("statusRow"):GetChild("hit")
                bindHelp(control, function()
                    local entry = dependencies.enemyAt(slot)
                    return entry and {index = entry.index, screenSlot = slot, powerTips = true}
                end, true, nil, nil, nil, "enemy")
            end
        end
        dependencies.child("statusDismiss"):AddCursorEventListener(host.clickEvent,function(event)
            if not Pointer.blocked(host.platform) and not (event and event.dragging) then
                return owner:dismissActorDetails()
            end
        end)
        local info = dependencies.child("statusInfo")
        info.disableCursorEventPassthrough = true
        dependencies.listen(info:GetChild("hit"), function() if dependencies.closeInfo() then owner:renderDetailsOnly() end end)
        -- A tap on the card itself turns to the next page; a single page closes like any tap.
        -- Not routed through listen(): that dismisses the open card before any handler runs.
        local function infoPage()
            local open = owner.info
            if not open then return end
            owner.swallow = nil
            if (open.pages or 1) > 1 then open.page = open.page % open.pages + 1 owner:renderDetailsOnly()
            elseif dependencies.closeInfo() then owner:renderDetailsOnly() end
        end
        info:GetChild("page"):AddCursorEventListener(host.clickEvent,function(event)
            if Pointer.blocked(host.platform)then return false end
            local swallow=owner.swallow
            if swallow and swallow.touch==(event and event.touchId) then owner.swallow=nil;return end
            return infoPage()
        end)
        if host.cursor and host.cursor.CursorDown then
            info:GetChild("page"):AddCursorEventListener(host.cursor.CursorDown,function() owner.swallow=nil end)
        end
        bindActorHelp(0,dependencies.child("hero"),function()end)
        if not host.monsterSurfaces then
            for i=1,5 do
                local slot=i
                bindActorHelp(slot,dependencies.child("enemy"..slot),function()return dependencies.enemyAt(slot)end)
            end
        end
        for slot=1,10 do
            local index=slot
            bindHelp(dependencies.child("card"..slot):GetChild("hit"),function() return owner:cardHelpSpec(index) end,false,slot)
        end
        for slot=1,L.battlePotions.count do
            local index=slot
            bindHelp(dependencies.child("potionHelp"..slot),function() return owner:potionHelpSpec(index) end,false)
            bindHelp(dependencies.child("potion"..slot),function() return owner:potionHelpSpec(index) end,false)
        end
    end
    local bound=setmetatable({}, {__mode="k"})
    local function bindEnemyDetailControls(screenSlot,box)
        -- A preceding native registration may synchronously retire this surface.
        if host.monsterSurfaces and host.monsterSurfaces:control(screenSlot)~=box then return end
        if bound[box] then return end
        local manager=assert(host.monsterSurfaces,"dynamic monster surfaces required")
        local captured=assert(manager:entry(screenSlot),"dynamic enemy must be published before binding")
        local actorId=captured.id
        local run,battle=owner.run,owner.run and owner.run.combat
        local binding={controls={}};bound[box]=binding
        local function entryAt()
            if binding.retired or box.alive==false or host.monsterSurfaces~=manager or manager:control(screenSlot)~=box
                or owner.run~=run or not run or run.combat~=battle then return end
            local entry=manager:entry(screenSlot)
            local current=entry and battle.enemies[entry.index]
            if entry and entry.id==actorId and current and current.id==actorId then return entry end
        end
        local function guard()return entryAt()~=nil end
        bindActorHelp(screenSlot,box,entryAt,guard,binding.controls)
    end
    local function unbindEnemyDetailControls(_screenSlot,box,engineDestroyed)
        local binding=bound[box]
        if not binding then return end
        binding.retired=true
        for _,item in ipairs(binding.controls)do
            if item.cancel then item.cancel(true,engineDestroyed) end
        end
        bound[box]=nil
    end
    local powerBindings=setmetatable({}, {__mode="k"})
    local function bindEnemyPowerControl(actorSlot,powerSlot,powerBox,powerManager)
        if powerBindings[powerBox] or powerManager:control(powerSlot)~=powerBox then return end
        local manager=host.monsterSurfaces
        local actorBox=manager and manager:control(actorSlot)
        local actorEntry=manager and manager:entry(actorSlot)
        local powerEntry=powerManager:entry(powerSlot)
        if not actorBox or not actorEntry or not powerEntry then return end
        local actorId,powerId=actorEntry.id,powerEntry.id
        local run,battle=owner.run,owner.run and owner.run.combat
        local binding={controls={}};powerBindings[powerBox]=binding
        local function surfaceCurrent()
            return not (binding.retired or powerBox.alive==false or actorBox.alive==false
                or host.monsterSurfaces~=manager or manager:control(actorSlot)~=actorBox
                or owner.run~=run or not run or run.combat~=battle
                or powerManager:control(powerSlot)~=powerBox)
        end
        local function livePower()
            if not surfaceCurrent() then return end
            local entry=manager:entry(actorSlot)
            local power=powerManager:entry(powerSlot)
            local actor=entry and battle and battle.enemies[entry.index]
            if not entry or entry.id~=actorId or not actor or actor.id~=actorId
                or not Actors.isPresent(actor) or not validPower(power,powerId) then return end
            return entry, power, actor
        end
        local function describe()
            local entry, power, actor = livePower()
            if not entry then return end
            local spec = {index=entry.index,screenSlot=actorSlot,controlBox=actorBox,powerTips=true}
            if power.status and power.status.overflow then
                spec.offset = power.status.offset
                return spec
            end
            -- Resolve by power identity, never the row position or a feedback snapshot.
            for _,status in ipairs(Combat.statusView(actor))do
                if status.id==powerId then
                    spec.statusId = powerId
                    return spec
                end
            end
        end
        bindHelp(powerBox:GetChild("hit"),describe,true,nil,function()return describe()~=nil end,binding.controls,"enemy")
    end
    local function unbindEnemyPowerControl(powerBox,engineDestroyed)
        local binding=powerBindings[powerBox]
        if not binding then return end
        binding.retired=true
        for _,item in ipairs(binding.controls)do
            if item.cancel then item.cancel(true,engineDestroyed) end
        end
        powerBindings[powerBox]=nil
    end
    return {
        statusActorAt=statusActorAt, bindDetailControls=bindDetailControls,
        bindEnemyPowerControl=bindEnemyPowerControl, unbindEnemyPowerControl=unbindEnemyPowerControl,
        bindEnemyDetailControls=bindEnemyDetailControls, unbindEnemyDetailControls=unbindEnemyDetailControls
    }
end
return M
