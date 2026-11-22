local G = dofile("tests/lua/support/battle_gesture_fixture.lua")
local Combat, Theme = G.F.Combat, G.F.Theme
local L = Theme.layout
local enemyControl = dofile("tests/lua/support/monster_control_fixture.lua")
local enemyPower = dofile("tests/lua/support/monster_power_control_fixture.lua")

local function tap(control, touch)
    local event = {touchId = touch}
    control.listeners.down(event)
    control.listeners.up(event)
    control.listeners.click(event)
end

local function contains(text, needle)
    assert(text and text:find(needle, 1, true), tostring(text))
end

local function setup(mobile)
    local host, ui, panel, event, namedTap, drain = G.setup({"strike", "defend", "defend"}, {"cultist", "cultist"},
        {touchScreen = function() return mobile end})
    local battle = host.run.combat
    Combat.addStatus(battle.player, "strength", 3)
    Combat.addStatus(battle.enemies[1], "strength", 2)
    ui:render()
    return host, ui, panel, battle, event, namedTap, drain
end

for _, mobile in ipairs({false, true}) do
    local _, ui, panel, battle = setup(mobile)
    local detail = panel:GetChild("statusInfo")
    local ground = panel:GetChild("statusDismiss")
    local player = panel:GetChild("hero")
    local monster = enemyControl(panel, "enemy1")
    local targets = {
        {index = 0, portrait = player:GetChild("hit"), power = player:GetChild("statusRow"):GetChild("hit1"), amount = 3},
        {index = 1, portrait = monster:GetChild("hit"), power = enemyPower(monster, "strength"):GetChild("hit"), amount = 2},
    }

    local function opened(index, transient)
        assert(detail.visible and ui.info.index == index and ui.info.transient == transient)
        assert(not detail:GetChild("hit").visible and not detail.disableCursorEventPassthrough)
        assert(detail:GetChild("page").visible == not transient and ground.visible == not transient)
        assert(detail:GetChild("plate").sizeDeltaX == L.actorDetail.width)
        local plate = detail:GetChild("plate")
        assert(plate.x - plate.sizeDeltaX / 2 >= -Theme.canvas.base[1] / 2 + Theme.canvas.safe.x)
        assert(plate.x + plate.sizeDeltaX / 2 <= Theme.canvas.base[1] / 2 - Theme.canvas.safe.x)
        assert(plate.y - plate.sizeDeltaY / 2 >= -Theme.canvas.base[2] / 2 + Theme.canvas.safe.y)
        assert(plate.y + plate.sizeDeltaY / 2 <= Theme.canvas.base[2] / 2 - L.topBar.height)
        contains(detail:GetChild("summary").text, "生命")
        contains(detail:GetChild("guard").text, "格挡")
        return plate.x
    end

    local before = Combat.copy(battle)
    for _, target in ipairs(targets) do
        local portrait, power = target.portrait, target.power
        portrait.listeners.enter()
        if mobile then assert(not detail.visible) else opened(target.index, true) end
        tap(portrait, 7)
        local x = opened(target.index, false)
        assert(target.index == 0 and x > player.x or target.index == 1 and x < monster.x,
            "the same card opens on the inward side of each portrait")
        if target.index == 1 then contains(detail:GetChild("section1").text, "意图 · 尚未执行") end
        portrait.listeners.exit()
        opened(target.index, false)

        -- A held chip can switch directly even when the previous reader suppressed its preview.
        local function holdPower()
            local held = {touchId = 7}
            power.listeners.down(held)
            ui:update(L.statusInfo.delay)
            power.listeners.up(held)
            power.listeners.click(held)
        end
        holdPower()
        opened(target.index, false)
        assert(ui.info.statusId == "strength")
        contains(detail:GetChild("name1").text, "力量 " .. target.amount)
        holdPower()
        assert(not detail.visible and not ground.visible)
        if not mobile then
            power.listeners.enter()
            opened(target.index, true)
            power.listeners.exit()
            assert(not detail.visible)
        end
    end

    -- The old portrait's exit must not dismiss the next actor's hover.
    if not mobile then
        targets[1].portrait.listeners.enter()
        targets[2].portrait.listeners.enter()
        targets[1].portrait.listeners.exit()
        opened(1, true)
        targets[2].portrait.listeners.exit()
        assert(not detail.visible)
    end
    tap(targets[1].portrait, 7)
    tap(targets[2].portrait, 7)
    opened(1, false)
    ground.listeners.click({touchId = 7})
    assert(not detail.visible and not ground.visible)
    assert(battle.energy == before.energy and battle.turn == before.turn and #battle.hand == #before.hand
        and #battle.events == #before.events and battle.seed == before.seed)
end

do
    local host, ui, panel, battle, event, namedTap, drain = setup(true)
    local detail = panel:GetChild("statusInfo")
    local hero = panel:GetChild("hero")
    local portrait = hero:GetChild("hit")
    local power = hero:GetChild("statusRow"):GetChild("hit1")
    local fresh, foreign = {touchId = 65}, {touchId = 66}
    local monster = enemyControl(panel, "enemy1"):GetChild("hit")
    for _, hit in ipairs({portrait, power, monster}) do
        local input = hit.listeners
        input.down(fresh)
        input.exit(foreign)
        input.drag(foreign)
        input.endDrag(foreign)
        input.up(foreign)
        input.click(foreign)
        assert(not detail.visible, "a foreign touch cannot activate a held inspection")
        input.up(fresh)
        input.click(foreign)
        assert(not detail.visible, "a foreign touch cannot activate a released inspection")
        input.click(fresh)
        assert(detail.visible, "a foreign touch cannot consume the valid inspection")
        panel:GetChild("statusDismiss").listeners.click(fresh)

        input.down(fresh)
        input.drag(fresh)
        input.up(fresh)
        input.click(fresh)
        assert(not detail.visible, "a swipe does not inspect")
    end

    tap(portrait, 7)
    local card = panel:GetChild("card1")
    event("card1", "down", 8, card.x, card.y)
    assert(ui.gesture and not detail.visible, "the first card press starts its usual gesture")
    tap(portrait, 9)
    assert(ui.gesture and not detail.visible)
    event("card1", "endDrag", 8, card.x, -350)
    local defend
    for i, instance in ipairs(battle.hand) do if instance.cardId == "defend" then defend = i break end end
    namedTap("card" .. defend, 7)
    local selected, energy, hand = ui.selected, battle.energy, #battle.hand
    assert(selected)
    tap(portrait, 7)
    assert(detail.visible)
    namedTap("playArea", 7)
    assert(not detail.visible and ui.selected == selected and battle.energy == energy and #battle.hand == hand,
        "field dismissal does not confirm the selected self card")

    assert(G.Run.obtainPotion(host.run, "fire_potion"))
    host:refresh()
    event("potion1", "down", 19)
    event("potion1", "drag", 19, 150, 100)
    assert(ui.potionAim and ui.potionAim.moving)
    tap(portrait, 9)
    assert(not detail.visible and ui.potionAim.moving and host.run.potions[1] == "fire_potion")
    event("dragLayer", "up", 19, -590, -310)
    assert(not ui.potionAim and host.run.potions[1] == "fire_potion")

    tap(portrait, 7)
    local turn = battle.turn
    namedTap("endTurn", 12)
    drain()
    assert(not detail.visible and battle.turn == turn + 1, "end turn works on the first press")
    tap(portrait, 7)
    ui:resize(1600, 900)
    assert(not detail.visible and not panel:GetChild("statusDismiss").visible)
end

do
    local host, ui, panel = setup(true)
    local hit = panel:GetChild("hero"):GetChild("statusRow"):GetChild("hit1")
    local touch = {touchId = 43}
    hit.listeners.down(touch)
    local run = G.Run.new(G.F.Data, 43)
    assert(G.Run.startCombat(run, "cultist_solo"))
    run.character = "silent"
    Combat.addStatus(run.combat.player, "weak", 2)
    host.run, ui.run = run, run
    host:refresh()
    hit.listeners.up(touch)
    hit.listeners.click(touch)
    local detail = panel:GetChild("statusInfo")
    assert(not detail.visible, "a late tap must not follow a slot into the replacement battle")
    tap(hit, 43)
    assert(detail.visible)
    contains(detail:GetChild("name1").text, "虚弱 2")
end

print("COMBAT_ACTOR_DETAILS_PASS")
