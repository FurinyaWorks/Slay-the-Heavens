-- The native writer and input paths have a separate five-card rendering
-- regression. This fixture combines their shared geometry across the release roster.
local Actors = require('abyss_actor')
local Combat = require('abyss_combat')
local Data = require('abyss_data')
local EnemyView = require('abyss_battle_enemy_view')
local Formation = require('abyss_encounter_formation')
local Queue = require('abyss_encounter_queue')
local Run = require('abyss_run')
local Summons = require('abyss_act2_summons')
local Theme = require('abyss_theme')
local Viewport = require('abyss_viewport')
local MonsterArt = require('abyss_monster_art_data')
local number = require('abyss_numbers').integer

local L = Theme.layout
local baseWidth = Theme.canvas.base[1]
local function child(parent, name)
    for _, spec in ipairs(parent) do if spec.name == name then return spec end end
    error('generated release control is missing: ' .. name)
end
local cardTemplate = child(child(child(require('abyss_ui_layout'), 'stage').children, 'battlePanel').children, 'card1')
local costRim = child(child(child(cardTemplate.children, 'stsReferenceCost').children, 'costMaterial').children, 'rim')
local costText = child(cardTemplate.children, 'cost')
local glow = Theme.officialAssets.battleCardChrome.glow.staticFocus.normal
local stances = assert(L.enemyRow.groundContact, 'expected official refined release theme').classification
assert(Theme.presentationProfile == 'official-assets-first' and MonsterArt.status == 'refined-release')
local roster, rosterSet = {}, {}
for id in pairs(MonsterArt.bindings) do
    assert(stances[id], 'missing release stance for ' .. id)
    roster[#roster + 1] = id
    rosterSet[id] = true
end
assert(#roster == 42)
table.sort(roster)

local function battle(options)
    options.deck, options.seed = {'defend'}, 42
    return assert(Combat.new(Data, options))
end

-- Shared enemy geometry depends on this actor's constructor position and view
-- state. Equivalent actor slots in different source RNG draws share assertions.
local positions, checkedKeys, routes = {}, {}, {}
local formations, multi, covered = 0, 0, {}
local function addActor(actor, label)
    local p = actor.sourcePosition or {}
    local key = table.concat({actor.definitionId, p.x or '_', p.y or '_', actor.aiPhase or '_'}, ':')
    for _, status in ipairs(Actors.statusView(actor)) do
        key = key .. ':' .. status.id .. '=' .. tostring(status.amount)
    end
    if not checkedKeys[key] then
        checkedKeys[key] = true
        positions[#positions + 1] = {actor, label}
    end
    if label ~= 'roster' then covered[actor.definitionId] = true end
end
local function addFormation(enemies, label)
    formations = formations + 1
    routes[label] = true
    local count = 0
    for _, actor in ipairs(enemies) do
        if Actors.isPresent(actor) then addActor(actor, label); count = count + 1 end
    end
    assert(count > 0, label)
    if count > 1 then multi = multi + 1 end
end

local function leaderBattle()
    return battle({sourceEncounter = 'Gremlin Leader',
        encounterBoundary = {misc = {integer = function(lo) return lo end}}})
end
local defaults = {}
-- Construct each real base Actor separately so its ordinary opening powers
-- and silhouette do not depend on an artificial all-roster encounter.
for _, id in ipairs(roster) do
    defaults[id] = id == 'gremlin_leader' and leaderBattle().enemies[3] or battle({enemies = {id}}).enemies[1]
    addActor(defaults[id], 'roster')
end
local function copyAt(actor, x, y)
    local copy = {}
    for key, value in pairs(actor) do copy[key] = value end
    copy.sourcePosition = x and {x = x, y = y} or actor.sourcePosition
    copy.statuses, copy.powerOrder = Combat.copy(actor.statuses), Combat.copy(actor.powerOrder)
    return copy
end

-- Enumerate each Boolean / index outcome through MonsterHelper's port. For
-- continuous cosmetic offsets include both endpoints independently in every
-- axis and the interval midpoint. Identical ordered formations are counted once.
local function sourceVariants(source, build)
    local choices, seen, slots = {}, {}, {}
    local wanted = {}
    local function explore()
        local index = 0
        local function choose(options)
            index = index + 1
            if choices[index] ~= nil then return choices[index] end
            wanted.index, wanted.options = index, options
            error(wanted, 0)
        end
        local function visual(lo, hi) return choose({lo, (lo + hi) / 2, hi}) end
        local boundary = {
            construct = function(id, x, y) return {id, x, y} end,
            visualFloat = visual,
            misc = {
                boolean = function() return choose({false, true}) end,
                integer = function(lo, hi)
                    local options = {}
                    for n = lo, hi do options[#options + 1] = n end
                    return choose(options)
                end,
            },
        }
        local ok, result = pcall(build, boundary)
        if ok then
            local key = {}
            for _, slot in ipairs(result) do key[#key + 1] = table.concat(slot, ':') end
            local signature = table.concat(key, '|')
            if not seen[signature] then
                seen[signature] = true
                formations = formations + 1
                routes[source] = true
                if #result > 1 then multi = multi + 1 end
                for _, slot in ipairs(result) do
                    local id, x, y = table.unpack(slot)
                    local slotKey = table.concat(slot, ':')
                    if not slots[slotKey] then
                        slots[slotKey] = true
                        local actor = copyAt(assert(defaults[id], id), x, y)
                        if source == 'Gremlin Leader' and id ~= 'gremlin_leader' then Actors.addStatus(actor, 'minion', 1) end
                        addActor(actor, source)
                    end
                end
            end
            return
        end
        assert(result == wanted, result)
        local at, options = wanted.index, wanted.options
        for _, value in ipairs(options) do choices[at] = value; explore() end
        choices[at] = nil
    end
    explore()
end
local function fixedVariants(spec)
    sourceVariants(spec.source, function(boundary)
        local sourcePositions = require('abyss_monster_source_positions').positions(spec.source, boundary.visualFloat)
        local enemies = {}
        for i, id in ipairs(spec.enemies) do
            local p = assert(sourcePositions[i], spec.source)
            enemies[i] = boundary.construct(id, p.x, p.y)
        end
        return enemies
    end)
end
for act, resolver in ipairs({require('abyss_room_encounters'), require('abyss_act2_enemies')}) do
    local rules = Queue.rules(act)
    for _, tier in ipairs({'weak', 'strong', 'elite'}) do
        for _, entry in ipairs(rules[tier]) do
            local source = entry[1]
            local spec = assert(resolver.resolve(source, tier == 'elite' and tier or 'normal'))
            if spec.sourceEncounter then
                sourceVariants(source, function(boundary) return Formation.assemble(spec.sourceEncounter, boundary) end)
            else
                fixedVariants(spec)
            end
        end
    end
    local bossResolver = act == 1 and require('abyss_act1_bosses') or resolver
    local bosses = act == 1 and {'The Guardian', 'Slime Boss', 'Hexaghost'} or {'Champ', 'Collector', 'Automaton'}
    for _, name in ipairs(bosses) do fixedVariants(assert(bossResolver.resolve(name, 'boss'))) end
end

-- Event-only native fallback actors are legal even though they have no
-- refined matte. Use the event constructor rather than cabinet coordinates.
local eventRun = Run.new(Data, '42', {experimental = true, campaign = true})
for _, event in ipairs({
    {1, 8, 'The Mushroom Lair'}, {1, 8, '3 Sentries'}, {1, 8, 'Gremlin Nob'},
    {1, 8, 'Lagavulin Event'}, {2, 18, 'Masked Bandits'},
    {2, 18, 'Colosseum Guards'}, {2, 18, 'Colosseum Nobs'},
}) do
    eventRun.act = event[1]
    local eventCombat = assert(Run.prepareEventEncounter(eventRun, event[3], event[2]))
    addFormation(eventCombat.prepared.actors, 'event/' .. event[3])
end

for _, entry in ipairs({{'guardian', 'The Guardian'}, {'acid_slime_l'}, {'spike_slime_l'}, {'slime_boss', 'Slime Boss'}}) do
    local id, source = table.unpack(entry)
    local state = battle({enemies = {id}, encounterSource = source})
    local enemy = state.enemies[1]
    local amount = id == 'guardian' and enemy.aiThreshold or math.ceil(enemy.maxHp / 2)
    Combat.damage(state, state.player, enemy, amount, true)
    assert(Combat.endTurn(state))
    if id == 'guardian' then
        assert(enemy.aiPhase == 'defense' and enemy.statuses.sharp_hide > 0)
    else
        assert(#state.enemies == 3 and enemy.hp == 0)
    end
    addFormation(state.enemies, id .. '/transition')
end
for _, boss in ipairs({'collector', 'automaton'}) do
    local state = battle({enemies = {boss}})
    if boss == 'collector' then Summons.torches(Combat, state, state.enemies[1], false)
    else Summons.bronze(Combat, state) end
    assert(#state.enemies == 3)
    addFormation(state.enemies, boss .. '/summon')
end
-- Each leader spawn slot has the same eight source draws, with replacement.
-- Exercise the production rally writer with the two occupied opening slots
-- and the third currently free. Opening formation already covers slot 1/2.
for roll = 1, 8 do
    local state = leaderBattle()
    local leader = state.enemies[3]
    local testCombat = {
        summonEnemies = Combat.summonEnemies,
        random = function(_, maximum) assert(maximum == 8); return roll end,
    }
    Summons.rally(testCombat, state, leader)
    assert(leader.act2GremlinSlots[3])
    addFormation(state.enemies, 'gremlin_leader/rally')
end
local loaded = #positions
for index = 1, loaded do
    local row = positions[index]
    if row[1].definitionId == 'byrd' then
        local grounded = copyAt(row[1])
        grounded.statuses.flight = 0
        addActor(grounded, row[2] .. '/landed')
    end
end
for _, id in ipairs(roster) do assert(covered[id], 'no legal formation for ' .. id) end
local fallbacks = 0
for id in pairs(covered) do if not rosterSet[id] then fallbacks = fallbacks + 1 end end
assert(fallbacks == 4, 'expected four legal event fallback actors')

local inputs = {
    {1920, 1080, false}, {2560, 1080, false}, {1920, 1080, true},
    {2556, 1179, true}, {2732, 2048, true},
}
local halfW, halfH = L.card.size[1] / 2, L.card.size[2] / 2
local function orientedBox(x, y, w, h, angle)
    local radians = angle * math.pi / 180
    local c, s = math.cos(radians), math.sin(radians)
    local ac, as = math.abs(c), math.abs(s)
    return {x = x, y = y, w = w, h = h, c = c, s = s, ac = ac, as = as, top = y + as * w + ac * h}
end
local function separation(x, y, hw, hh, card)
    local dx, dy = card.x - x, card.y - y
    return math.max(
        math.abs(dx) - (hw + card.ac * card.w + card.as * card.h),
        math.abs(dy) - (hh + card.as * card.w + card.ac * card.h),
        math.abs(dx * card.c + dy * card.s) - (card.w + hw * card.ac + hh * card.as),
        math.abs(-dx * card.s + dy * card.c) - (card.h + hw * card.as + hh * card.ac))
end

local hands = {}
for _, input in ipairs(inputs) do
    local canvas = Viewport.measure(table.unpack(input))
    local extra = canvas.input[3] - baseWidth
    local groups = {}
    hands[#hands + 1] = groups
    for count = 1, Data.rules.player.maxHand do
        local cards = {}
        groups[count] = cards
        for index = 0, count - 1 do
            local x, y, angle, spacing = Viewport.handSlot(count, index, extra)
            local card = orientedBox(x, y, halfW, halfH, angle)
            local function part(p, w, h, name)
                local cx, cy = table.unpack(p)
                local box = orientedBox(x + card.c * cx - card.s * cy, y + card.s * cx + card.c * cy, w / 2, h / 2, angle)
                box.slot, box.kind = index + 1, name
                cards[#cards + 1] = box
                cards.top = math.max(cards.top or -math.huge, box.top)
            end
            -- Use the actual native cost art and text bounds. Include the
            -- overhang of the idle playable rim as an enclosing rectangle.
            local blur = math.max(glow.coreSoftness, glow.pulseSoftness)
            part({0, 0}, 2 * (halfW + blur), 2 * (halfH + blur), 'face')
            part(costRim.position, costRim.size[1], costRim.size[2], 'cost rim')
            part(costText.position, costText.size[1], costText.size[2], 'cost text')
            local dx, dy, width, height = Viewport.handHit(y, angle, 1,
                {baseY = y, restAngle = angle, hitWidth = count > 1 and spacing or nil, hot = false})
            local hit = orientedBox(x + card.c * dx - card.s * dy, y + card.s * dx + card.c * dy, width / 2, height / 2, 0)
            hit.slot, hit.kind = index + 1, 'card receiver'
            cards[#cards + 1] = hit
            cards.top = math.max(cards.top, hit.top)
        end
    end
end
local stackSets = {
    {},
    {{'strength', 20}, {'weak', 3}, {'vulnerable', 4}},
    {{'strength', -10}, {'weak', 16}, {'vulnerable', 99}, {'artifact', 3},
        {'metallicize', 100}, {'thorns', 10}, {'ritual', 4}, {'poison', 21}},
    {{'strength', -999}, {'weak', 10}, {'poison', 2147483647}},
}
local nrects, cases, overflowCases = 0, 0, 0
local minimumGap, minimumVertical, closest = math.huge, math.huge, ''
local function checkRect(label, input, x, y, w, h)
    for count, cards in ipairs(hands[input]) do
        local vertical = y - h / 2 - cards.top
        minimumVertical = math.min(minimumVertical, vertical)
        if vertical < minimumGap then
            for _, card in ipairs(cards) do
                local gap = separation(x, y, w / 2, h / 2, card)
                if gap < minimumGap then
                    minimumGap = gap
                    closest = string.format('%s view=%d cards=%d slot=%d %s [%.2f, %.2f | %.2f, %.2f]',
                        label, input, count, card.slot, card.kind, x, y, card.x, card.y)
                end
                assert(gap >= 1 - 1e-6, closest .. ' gap=' .. tostring(gap))
            end
        end
    end
    nrects = nrects + 1
end
local function checkPowers(actor, label, input)
    local g = EnemyView.geometry(actor, true)
    local hpWidth = (g.healthWidth or g.hitWidth) + 2 * Theme.space.border
    checkRect(label .. ' HP border/receiver', input, g.x + g.healthX, g.y + g.healthY,
        hpWidth, g.healthHeight + 2 * Theme.space.border)
    local layout = EnemyView.powerLayout(g, inputs[input][3])
    local capacity = layout.columns * layout.rows
    local powers = Actors.statusView(actor)
    local overflow = #powers > capacity
    if overflow then overflowCases = overflowCases + 1 end
    for slot = 1, math.min(capacity, #powers) do
        local status = powers[slot]
        local more = overflow and slot == capacity
        local x = g.x + layout.firstX + (slot - 1) % layout.columns * layout.pitch
        local y = g.y + layout.firstY - math.floor((slot - 1) / layout.columns) * layout.rowPitch
        local name = more and '@more' or status.id
        local at = label .. '/' .. name
        if not more then checkRect(at .. ' icon', input, x, y, layout.icon, layout.icon) end
        local amount = status.sourceAmount or status.amount
        if more or amount > 0 or amount < 0 and status.canGoNegative then
            local value = more and '+' .. number(#powers - capacity + 1) or number(amount)
            local textWidth = math.max(L.nativeText.lineHeight, utf8.len(value) * Theme.font.small)
            local line = Theme.font.small * 1.2
            checkRect(at .. ' count', input, x + layout.countX - textWidth / 2,
                y + layout.countY + L.nativeText.lineHeight / 2 - line / 2, textWidth, line)
        end
        checkRect(at .. ' receiver', input, x, y, layout.pitch, layout.hitHeight)
    end
    cases = cases + #hands[input]
end
for _, row in ipairs(positions) do
    for _, stacks in ipairs(stackSets) do
        local actor = copyAt(row[1])
        for _, status in ipairs(stacks) do
            Actors.addStatus(actor, status[1], status[2] - (actor.statuses[status[1]] or 0))
        end
        local at = row[2] .. '/' .. actor.definitionId
        for input in ipairs(inputs) do checkPowers(actor, at, input) end
    end
end
local routeCount = 0
for _ in pairs(routes) do routeCount = routeCount + 1 end
assert(multi > 100 and routeCount >= 45 and overflowCases > 0)
print(string.format('RELEASE_ENEMY_CLEARANCE_MATRIX_PASS refined=%d eventFallbacks=%d routeStates=%d formations=%d multi=%d actorLayouts=%d viewportProfiles=%d hands=1-%d statusCombinations=%d cases=%d rectChecks=%d overflow=%d minVertical=%.3f minSeparation=%.3f (%s)',
    #roster, fallbacks, routeCount, formations, multi, #positions, #inputs, Data.rules.player.maxHand, #stackSets, cases, nrects, overflowCases, minimumVertical, minimumGap, closest))
