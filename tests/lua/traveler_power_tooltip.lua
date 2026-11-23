local G = dofile("tests/lua/support/battle_gesture_fixture.lua")
local Combat, Theme = G.F.Combat, G.F.Theme
local L = Theme.layout
local number = require("abyss_numbers").integer
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

local function visibleTips(panel)
    local detail = panel:GetChild("statusInfo")
    local layer = detail:GetChild("powerTips")
    local boxes = {}
    if detail.visible and layer.visible then
        for i = 1, L.powerTips.rows do
            local box = layer:GetChild("tip" .. i)
            if box.visible then boxes[#boxes + 1] = box end
        end
    end
    return boxes
end

local function copy(box)
    return box:GetChild("copy").text
end

local function checkBounds(box)
    local halfWidth = box.sizeDeltaX * box.localScaleX / 2
    local halfHeight = box.sizeDeltaY * box.localScaleY / 2
    local edge = Theme.canvas.base[1] / 2 - Theme.canvas.safe.x
    assert(box.x - halfWidth >= -edge - .01 and box.x + halfWidth <= edge + .01)
    assert(box.y - halfHeight >= L.battleNotice.bandTop
        and box.y + halfHeight <= L.battlePotions.origin[2] - L.battlePotions.size[2] / 2 - Theme.space.s + .01)
end

do
    local host, ui, panel = G.setup({"defend"}, {"cultist"}, {touchScreen = function() return false end})
    local actor = host.run.combat.player
    Combat.addStatus(actor, "frail", 1)
    Combat.addStatus(actor, "strength", 4)
    ui:render()
    local row = panel:GetChild("hero"):GetChild("statusRow")
    local badges = row:GetChild("countBackplates")
    for index, expected in ipairs({"1", "4"}) do
        local count = row:GetChild("count" .. index)
        local badge = badges:GetChild("badge" .. index)
        assert(count.visible and count.text == expected and badge.visible)
        assert(count.sizeDeltaX >= L.nativeText.lineHeight and count.sizeDeltaY >= L.nativeText.lineHeight,
            "the native glyph must fit inside its transparent frame")
        assert(count.x == badge.x and count.y == badge.y and badge.sizeDeltaX < count.sizeDeltaX,
            "the expanded text does not move or enlarge the single-digit badge")
    end
end

for _, mobile in ipairs({false, true}) do
    local _, ui, panel, battle = setup(mobile)
    local detail = panel:GetChild("statusInfo")
    local ground = panel:GetChild("statusDismiss")
    local player = panel:GetChild("hero")
    local monster = enemyControl(panel, "enemy1")
    local targets = {
        {index = 0, actor = battle.player, portrait = player:GetChild("hit"),
            power = player:GetChild("statusRow"):GetChild("hit1"), x = player.x, amount = 3},
        {index = 1, actor = battle.enemies[1], portrait = monster:GetChild("hit"),
            power = enemyPower(monster, "strength"):GetChild("hit"), x = monster.x, amount = 2},
    }

    local function opened(index, count)
        local boxes = visibleTips(panel)
        assert(#boxes == count and ui.info.index == index and ui.info.transient == not mobile)
        assert(not detail:GetChild("hit").visible and not detail:GetChild("page").visible
            and not detail.disableCursorEventPassthrough and ground.visible == mobile)
        for _, name in ipairs({"title", "tag", "summary", "guard", "more", "plate"}) do
            assert(not detail:GetChild(name).visible, name .. " must stay hidden")
        end
        return boxes
    end

    local function inspect(hit)
        if mobile then tap(hit, 7) else hit.listeners.enter() end
    end

    local visuals = {}
    local before = Combat.copy(battle)
    for _, target in ipairs(targets) do
        if mobile then
            target.portrait.listeners.enter()
            assert(not detail.visible, "touch enter cannot open a tip")
        end
        inspect(target.portrait)
        local intentRows = target.index > 0 and 1 or 0
        local first = opened(target.index, 1 + intentRows)[1 + intentRows]
        assert((target.index == 0 and first.x > target.x) or (target.index == 1 and first.x < target.x))
        assert(first.sizeDeltaX == L.powerTips.width)
        assert(first:GetChild("copy").fontSize == L.powerTips.font)
        contains(copy(first), "<color=#F5D78A>力量 " .. target.amount .. "</color>")
        visuals[#visuals + 1] = {copy(first):gsub(tostring(target.amount), "N"), first.sizeDeltaX, first.sizeDeltaY,
            first:GetChild("face").sizeDeltaX, first:GetChild("copy").fontSize}
        checkBounds(first)

        Combat.addStatus(target.actor, "weak", 2)
        ui:render()
        local entries, boxes = Combat.statusView(target.actor), opened(target.index, 2 + intentRows)
        for i, entry in ipairs(entries) do contains(copy(boxes[i + intentRows]), entry.name .. " " .. number(entry.amount)) end

        inspect(target.power)
        if not mobile then target.portrait.listeners.exit() end
        assert(ui.info.statusId == "strength")
        contains(copy(opened(target.index, 1)[1]), "力量 " .. target.amount)
        if mobile then
            tap(target.power, 7)
            assert(not detail.visible and not ground.visible, "a second tap on the same chip closes it")
            inspect(target.power)
        end
        target.actor.statuses.strength = nil
        ui:render()
        if target.index == 0 and not mobile then
            contains(copy(opened(0, 1)[1]), "虚弱 2")
        else
            assert(not detail.visible and not ground.visible, "removing the selected status closes the tip")
        end

        target.actor.statuses.weak = nil
        ui:render()
        inspect(target.portrait)
        if target.index == 0 then
            assert(not detail.visible and not ground.visible, "a traveler without status displays nothing")
        else
            contains(copy(opened(target.index, 1)[1]), "策略")
        end
        Combat.addStatus(target.actor, "strength", 2)
        ui:render()
        if mobile then
            if target.index == 0 then assert(not detail.visible, "an empty traveler tap cannot pin the next status")
            else opened(target.index, 2) end
        else
            opened(target.index, 1 + intentRows)
            target.portrait.listeners.exit()
            tap(target.portrait, 7)
            assert(not detail.visible and not ground.visible, "PC clicks never pin status tips")
        end
    end
    for index, value in ipairs(visuals[1]) do assert(value == visuals[2][index], "different actor tip style") end

    inspect(targets[1].portrait)
    if mobile then
        local row = player:GetChild("statusRow"):GetChild("hit")
        inspect(row)
        opened(0, 1)
        inspect(row)
        assert(not detail.visible, "only repeating the same hotspot closes its tip")
    end
    inspect(targets[2].portrait)
    if not mobile then targets[1].portrait.listeners.exit() end
    opened(1, 2)
    if mobile then ground.listeners.click({touchId = 7})
    else targets[2].portrait.listeners.exit() end
    assert(not detail.visible and not ground.visible)

    local intent = monster:GetChild("intentHit")
    if mobile then tap(intent, 8)
    else intent.listeners.enter(); ui:update(L.statusInfo.delay) end
    local intentTips = opened(1, 2)
    contains(copy(intentTips[1]), "策略")
    assert(not copy(intentTips[1]):find("力量 2", 1, true))
    contains(copy(intentTips[2]), "力量 2")
    assert(ui.info.kind == nil and ui.info.powerTips and not detail:GetChild("plate").visible)
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
    local monster = enemyControl(panel, "enemy1")
    for _, hit in ipairs({portrait, power, monster:GetChild("hit"), monster:GetChild("intentHit"), monster:GetChild("hpHit")}) do
        local input = hit.listeners
        input.down(fresh)
        input.down(foreign)
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
    if Theme.presentationProfile == "official-assets-first" then
        event("potion1", "up", 19, 150, 100)
        assert(not ui.potionAim and host.run.potions[1] == "fire_potion", "dragging a potion never arms it")
        namedTap("potion1", 19)
        dofile("tests/lua/support/confirm_potion_popup.lua")(ui, panel, 19)
        local aim = assert(ui.potionAim)
        tap(portrait, 9)
        assert(not detail.visible and ui.potionAim == aim)
        for _, name in ipairs({"intentHit", "hpHit"}) do
            tap(monster:GetChild(name), 9)
            assert(detail.visible and ui.potionAim == aim and host.run.potions[1] == "fire_potion")
            panel:GetChild("statusDismiss").listeners.click({touchId = 9})
        end
        namedTap("playArea", 19)
    else
        assert(ui.potionAim and ui.potionAim.moving)
        tap(portrait, 9)
        for _, name in ipairs({"intentHit", "hpHit"}) do
            tap(monster:GetChild(name), 9)
            tap(monster:GetChild(name), 19)
        end
        assert(not detail.visible and ui.potionAim.moving and host.run.potions[1] == "fire_potion")
        event("dragLayer", "up", 19, -590, -310)
    end
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
    contains(copy(visibleTips(panel)[1]), "虚弱 2")
end

for _, mobile in ipairs({false, true}) do
    local host, ui, panel = G.setup({"strike", "defend"},
        {"mad_gremlin", "shield_gremlin", "fat_gremlin", "sneaky_gremlin", "wizard_gremlin"},
        {touchScreen = function() return mobile end})
    local battle = host.run.combat
    local ids = {"strength", "dexterity", "vulnerable", "weak", "frail", "poison", "thorns", "regen",
        "artifact", "barricade", "ritual", "enrage"}
    for i, actor in ipairs(battle.enemies) do
        actor.sourcePosition = {x = -790 + i * 200, y = (i - 1) * 12}
        for _, id in ipairs(ids) do Combat.addStatus(actor, id, i) end
    end
    for _, status in ipairs(G.F.Data.statuses.statuses) do Combat.addStatus(battle.player, status.id, 1) end
    ui:render()

    local function inspect(hit)
        if mobile then tap(hit, 91) else hit.listeners.enter() end
    end
    local function collect(hit)
        local pages, seen = ui.info.pages, {}
        if pages > 1 and not mobile then tap(hit, 91) end
        local page = panel:GetChild('statusInfo'):GetChild('page')
        for i = 1, pages do
            assert(ui.info.page == i)
            for _, box in ipairs(visibleTips(panel)) do
                checkBounds(box)
                seen[#seen+1] = copy(box)
            end
            if pages > 1 then page.click({touchId=91}) end
        end
        if pages > 1 or mobile then panel:GetChild('statusDismiss').click({touchId=91}) end
        return seen
    end
    local hero = panel:GetChild("hero")
    local heroHit = hero:GetChild('hit')
    inspect(heroHit)
    assert(#collect(heroHit) == #Combat.statusView(battle.player), 'every Power fits across the existing pool pages')
    local last = L.statusIcon.perRow * L.statusIcon.rows
    local overflow = hero:GetChild('statusRow'):GetChild('hit' .. last)
    inspect(overflow)
    assert(#collect(overflow) == #Combat.statusView(battle.player) - last + 1)

    for index, actor in ipairs(battle.enemies) do
        local monster = enemyControl(panel, "enemy" .. index)
        local hit = monster:GetChild("hit")
        inspect(hit)
        local entries = Combat.statusView(actor)
        local boxes = visibleTips(panel)
        assert(ui.info.actor == actor and #boxes > 0, "the live actor owns the tooltip")
        local geometry = require("abyss_battle_enemy_view").geometry(actor)
        local right = geometry.hitX + geometry.hitWidth / 2
        local opensRight = right + 640 < 1544 / 1.5
            and right + 20 / 1.5 + L.powerTips.width <= 640 - Theme.canvas.safe.x
        assert((boxes[#boxes].x > boxes[1].x) == opensRight and boxes[#boxes].x ~= boxes[1].x,
            "overflow columns follow the actor's chosen side")
        assert(#collect(hit) == #entries + 1, 'each Power has its own tooltip')
        if Theme.presentationProfile == "official-assets-first" then
            local more = enemyPower(monster, "@more"):GetChild("hit")
            inspect(more)
            local offset = ui.info.offset
            local tips = collect(more)
            assert(offset > 1 and #tips == #entries - offset + 1)
            for i, text in ipairs(tips) do
                contains(text, entries[offset + i - 1].name)
            end
        end
    end

    local retired = enemyPower(enemyControl(panel, "enemy5"), "strength"):GetChild("hit")
    local event = {touchId = 92}
    if mobile then retired.listeners.down(event) else retired.listeners.enter() end
    local replacement = G.Run.new(G.F.Data, 92)
    assert(G.Run.startCombat(replacement, "cultist_solo"))
    Combat.addStatus(replacement.combat.enemies[1], "strength", 42)
    host.run, ui.run = replacement, replacement
    host:refresh()
    if mobile then retired.listeners.up(event); retired.listeners.click(event)
    else retired.listeners.exit(); retired.listeners.enter() end
    assert(#visibleTips(panel) == 0, "a retired enemy cannot open tips in a new battle")
    inspect(enemyPower(enemyControl(panel, "enemy1"), "strength"):GetChild("hit"))
    contains(copy(visibleTips(panel)[1]), "力量 42")
end

print("COMBAT_ACTOR_DETAILS_PASS")
