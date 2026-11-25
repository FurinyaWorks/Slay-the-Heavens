local G = dofile("tests/lua/support/battle_gesture_fixture.lua")
local Combat, L = G.F.Combat, G.F.Theme.layout
local number = require("abyss_numbers").integer

local function scene(mobile)
    local host, ui, panel, event, tap, drain = G.setup({"strike", "defend", "defend"}, nil,
        {touchScreen = function() return mobile end})
    local hero = panel:GetChild("hero")
    local info = panel:GetChild("statusInfo")
    local layer = info:GetChild("powerTips")
    local actor = host.run.combat.player
    local function descriptions()
        local copy = {}
        if info.visible and layer.visible then
            for i = 1, L.powerTips.rows do
                local box = layer:GetChild("tip" .. i)
                if box.visible then copy[#copy + 1] = box:GetChild("copy").text end
            end
        end
        return copy
    end
    local function icon(index) return hero:GetChild("statusRow"):GetChild("hit" .. index).listeners end
    return actor, ui, panel, hero:GetChild("hit").listeners, icon, descriptions, event, tap, drain, host
end

local function contains(text, needle) assert(text and text:find(needle, 1, true), tostring(text)) end

do
    local actor, ui, panel, hero, icon, descriptions = scene(false)
    local info = panel:GetChild("statusInfo")
    hero.enter()
    assert(not info.visible and #descriptions() == 0, "empty hover opens nothing")
    Combat.addStatus(actor, "strength", 3)
    ui:render()
    contains(descriptions()[1], "力量 3")
    assert(#descriptions() == 1 and not info:GetChild("hit").visible and not info:GetChild("page").visible)
    assert(info.disableCursorEventPassthrough == false)
    for _, name in ipairs({"title", "tag", "summary", "guard", "more", "plate"}) do
        assert(not info:GetChild(name).visible, name .. " must stay hidden")
    end
    Combat.addStatus(actor, "weak", 2)
    Combat.addStatus(actor, "strength", -1)
    ui:render()
    local ordered = Combat.statusView(actor)
    local weak, strength
    for i, entry in ipairs(ordered) do
        contains(descriptions()[i], entry.name .. " " .. number(entry.amount))
        if entry.id == "weak" then weak = i else strength = i end
    end
    contains(descriptions()[weak], "2 回合")
    for _ = 1, 12 do
        icon(weak).enter()
        hero.exit()
        assert(#descriptions() == 1)
        contains(descriptions()[1], "虚弱 2")
        icon(strength).enter()
        icon(weak).exit()
        contains(descriptions()[1], "力量 2")
        hero.enter()
        icon(strength).exit()
        assert(#descriptions() == 2)
    end
    hero.exit()
    assert(not info.visible)
    hero.click()
    assert(not info.visible, "desktop click does not pin status")
    icon(weak).enter()
    actor.statuses.weak = nil
    ui:render()
    assert(not panel:GetChild("hero"):GetChild("statusRow"):GetChild("hit2").visible)
    if weak == 1 then contains(descriptions()[1], "力量 2") else assert(not info.visible) end
    hero.enter()
    actor.statuses.strength = nil
    ui:render()
    assert(not info.visible, "losing the final Power closes its box")
end

do
    local actor, ui, panel, hero, icon, descriptions, event, tap, drain, host = scene(true)
    local battle = host.run.combat
    local function touch(handlers, id)
        local e = {touchId = id}
        handlers.down(e)
        handlers.up(e)
        handlers.click(e)
    end
    local info = panel:GetChild("statusInfo")
    local ground = panel:GetChild("statusDismiss")
    local hp, energy, hand = actor.hp, battle.energy, #battle.hand
    touch(hero, 7)
    assert(not info.visible and not ground.visible, "empty tap opens nothing")
    Combat.addStatus(actor, "strength", 3)
    Combat.addStatus(actor, "weak", 2)
    ui:render()
    hero.enter()
    assert(not info.visible, "touch must not synthesize hover")
    local fresh, foreign = {touchId = 65}, {touchId = 66}
    for _, hit in ipairs({hero, icon(1)}) do
        hit.down(fresh)
        hit.click(foreign)
        assert(not info.visible, "a foreign click cannot activate a held status tap")
        hit.up(fresh)
        hit.click(foreign)
        assert(not info.visible, "a foreign click cannot open a status tip")
        hit.click(fresh)
        assert(info.visible, "a foreign click cannot consume the released status tap")
        ground.click(fresh)
        for _, cancel in ipairs({hit.exit, hit.drag, hit.endDrag}) do
            hit.down(fresh)
            cancel(foreign)
            hit.up(fresh)
            hit.click(fresh)
            assert(info.visible, "a foreign pointer exit or drag cannot cancel a held status tap")
            ground.click(fresh)
        end
    end
    touch(hero, 7)
    assert(#descriptions() == 2 and ground.visible)
    local entries = Combat.statusView(actor)
    touch(icon(2), 7)
    assert(#descriptions() == 1)
    contains(descriptions()[1], entries[2].name .. " " .. number(entries[2].amount))
    touch(icon(1), 7)
    contains(descriptions()[1], entries[1].name .. " " .. number(entries[1].amount))
    ground.click({touchId = 7})
    assert(not info.visible and not ground.visible)
    assert(hp == actor.hp and energy == battle.energy and hand == #battle.hand)
    hero.down({touchId = 7})
    hero.drag({touchId = 7})
    hero.up({touchId = 7})
    hero.click({touchId = 7})
    assert(not info.visible, "a swipe starting on the hero is not a tap")
    touch(hero, 7)
    local card = panel:GetChild("card1")
    event("card1", "down", 8, card.x, card.y)
    assert(ui.gesture and not info.visible, "a card gesture starts normally while a touch tip is open")
    touch(hero, 9)
    assert(ui.gesture and not info.visible and energy == battle.energy)
    event("card1", "endDrag", 8, card.x, -350)

    local defendSlot
    for i, card in ipairs(battle.hand) do if card.cardId == "defend" then defendSlot = i break end end
    tap("card" .. defendSlot, 7)
    assert(ui.selected, "tap selects a self card")
    touch(hero, 7)
    assert(info.visible)
    tap("playArea", 7)
    assert(not info.visible and energy == battle.energy and hand == #battle.hand and ui.selected,
        "an open-ground dismissal never confirms a selected self card")

    assert(G.Run.obtainPotion(host.run, "fire_potion"))
    host:refresh()
    local potion = panel:GetChild("potion1")
    event("potion1", "down", 19, potion.x, potion.y)
    event("potion1", "drag", 19, 150, 100)
    assert(ui.potionAim and ui.potionAim.moving)
    touch(hero, 9)
    assert(not info.visible and ui.potionAim.moving and host.run.potions[1] == "fire_potion",
        "a status touch cannot hijack or commit a potion drag")
    event("dragLayer", "up", 19, -590, -310)
    assert(not ui.potionAim and host.run.potions[1] == "fire_potion")

    touch(hero, 7)
    local turn = battle.turn
    tap("endTurn", 12)
    drain()
    assert(not info.visible and battle.turn == turn + 1, "end turn works on the first press")
end

do
    local actor, ui, panel, hero, _, descriptions = scene(false)
    for _, id in ipairs({"strength", "dexterity", "vulnerable", "weak", "frail", "poison", "thorns", "regen",
        "artifact", "barricade", "ritual", "enrage"}) do Combat.addStatus(actor, id, 2) end
    ui:render()
    hero.enter()
    assert(#descriptions() == #Combat.statusView(actor))
    local layer = panel:GetChild("statusInfo"):GetChild("powerTips")
    local column
    for i, text in ipairs(descriptions()) do
        local box = layer:GetChild("tip" .. i)
        assert(box.x - box.sizeDeltaX / 2 >= -600 and box.x + box.sizeDeltaX / 2 <= 600, text)
        assert(box.y - box.sizeDeltaY / 2 >= L.battleNotice.bandTop and box.y + box.sizeDeltaY / 2 <= 234, text)
        if i == 1 then column = box.x end
    end
    assert(layer:GetChild("tip12").x > column, "a long list wraps to another column")
    for _, entry in ipairs(G.F.Data.statuses.statuses) do Combat.addStatus(actor, entry.id, 1) end
    ui:render()
    assert(#descriptions() == #Combat.statusView(actor), "the whole base catalog fits")
    for i, text in ipairs(descriptions()) do
        local box = layer:GetChild("tip" .. i)
        local halfW, halfH = box.sizeDeltaX * box.localScaleX / 2, box.sizeDeltaY * box.localScaleY / 2
        assert(box.x - halfW >= -600.01 and box.x + halfW <= 600.01, text)
        assert(box.y - halfH >= L.battleNotice.bandTop and box.y + halfH <= 234.01, text)
    end
    ui:resize(1600, 900)
    assert(not panel:GetChild("statusInfo").visible)
end

for _, mobile in ipairs({false, true}) do
    local actor, ui, panel, _, icon, descriptions, _, _, _, host = scene(mobile)
    host.run.character = "silent"
    Combat.addStatus(actor, "strength", 3)
    ui:render()
    local info, power = panel:GetChild("statusInfo"), icon(1)
    local event = {touchId = 42}
    if mobile then power.down(event) else power.enter() end
    ui:update(L.statusInfo.delay)
    assert(info.visible and ui.info and #descriptions() == 0, "non-traveler icons retain the shared readout")
    contains(info:GetChild("name1").text, "力量 3")
    if mobile then
        power.up(event)
        power.click(event)
        assert(info.visible and not ui.info.transient, "a held legacy status reader stays open")
    else
        power.exit()
        assert(not info.visible, "legacy hover still closes on exit")
    end
end

for _, from in ipairs({"silent", "ironclad"}) do
    local actor, ui, panel, _, icon, descriptions, _, _, _, host = scene(true)
    host.run.character = from
    Combat.addStatus(actor, "strength", 3)
    ui:render()
    local e = {touchId = 43}
    icon(1).down(e)
    local run = G.Run.new(G.F.Data, 43)
    assert(G.Run.startCombat(run, "raven_adept_solo"))
    run.character = from == "silent" and "ironclad" or "silent"
    Combat.addStatus(run.combat.player, "weak", 2)
    host.run, ui.run = run, run
    host:refresh()
    icon(1).up(e)
    icon(1).click(e)
    assert(not panel:GetChild("statusInfo").visible, "a late cross-route tap cannot open a new battle's status")
    icon(1).down(e)
    icon(1).up(e)
    icon(1).click(e)
    local info = panel:GetChild("statusInfo")
    assert(info.visible, "a fresh tap still opens the current status")
    contains(ui.info and info:GetChild("name1").text or descriptions()[1], "虚弱 2")
end

print("TRAVELER_POWER_TOOLTIP_PASS")
