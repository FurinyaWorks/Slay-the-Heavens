-- Exercise the shipped Lua UI. Sections which supply a fixture state identify it in the scene receipt.
local F = dofile('tests/lua/support/game_ui_fixture.lua')
local V = dofile('scripts/official-assets-preview.lua')
local Map = require('abyss_map')
local Run = require('abyss_run')
local Routes = dofile('tests/lua/support/map_routes.lua')

local function click(ui, root, panel, action)
    assert(F.click(root, panel, action), panel .. '/' .. action)
    ui:update(0)
end

local function start(settle)
    local ui, root = F.fixture(nil, settle)
    assert(F.start(ui))
    return ui, root
end

local function enterFirstBattle(ui)
    assert(ui.mapUI:choose(F.Nodes.available(ui.run, ui.map)[1].id))
    assert(ui.mode == 'battle' and ui.run.phase == 'combat')
end

local ui, root = start()
enterFirstBattle(ui)
for _ = 1, 6 do ui:update(0.5) end
V.capture('battle', ui, root, 'Seed 1, real first combat')
F.win(ui, root)
assert(ui.run.phase == 'reward' and ui.run.victories == 1)
V.capture('reward', ui, root, 'First encounter won through existing card and turn listeners')

local deck, deckRoot = start()
enterFirstBattle(deck)
local battle = deck.run.combat
-- Put representative cards in discard and exhaust while preserving each physical card UID.
for _, name in ipairs({'discard', 'exhaust'}) do
    local card = assert(table.remove(battle.draw))
    battle[name][#battle[name] + 1] = card
end
deck:refresh()
for _, name in ipairs({'draw', 'discard', 'exhaust'}) do
    click(deck, deckRoot, 'battlePanel', name .. 'Icon')
    local panel = deckRoot:GetChild('deckPanel')
    local grid = panel:GetChild('pileGrid')
    assert(deck.deckUI.pileKind == name and grid.visible and grid.itemCount == #battle[name])
    local item = assert(grid.items[0])
    V.capture('pile-' .. name, deck, deckRoot, 'Native pile listener on seeded nonempty combat piles')
    assert(item:GetChild('hit').click() and deck.deckUI.cardDetail)
    assert(deck.deckUI.cardDetail.instance.uid == deck.deckUI.bindings[item].uid)
    if name == 'exhaust' then
        V.capture('pile-detail', deck, deckRoot, 'Card detail uses the selected exhaust instance')
    end
    click(deck, deckRoot, 'deckPanel', 'pileReturn')
    assert(grid.visible and grid.itemCount == #battle[name])
    click(deck, deckRoot, 'deckPanel', 'pileReturn')
    assert(not deck.deckUI.visible and deck.battleUI.active)
end
assert(deck:openDeck() and deck.deckUI.pileKind == nil)
deck:update(0)
assert(deckRoot:GetChild('deckPanel'):GetChild('pileGrid').itemCount == #deck.run.deck)
V.capture('deck', deck, deckRoot, 'Permanent deck through the shared card browser')

local tools, toolsRoot = start()
assert(tools:openRelics(1))
tools:update(0)
assert(tools.deckUI.visible)
V.capture('relic', tools, toolsRoot, 'Live starter relic selected in the shared inspector')
assert(tools:closeDeck())
assert(Run.obtainPotion(tools.run, 'fire_potion'))
tools:refresh()
click(tools, toolsRoot, 'potionEntry', 'open')
assert(tools.potionUI.visible and tools.run.potions[1] == 'fire_potion')
click(tools, toolsRoot, 'potionPanel', 'slot1')
assert(tools.potionUI.selected.id == 'fire_potion')
V.capture('potion', tools, toolsRoot, 'Selected potion and description in the first physical slot')
click(tools, toolsRoot, 'potionPanel', 'cancel')
assert(not tools.potionUI.visible and tools.run.potions[1] == 'fire_potion')
click(tools, toolsRoot, 'potionEntry', 'open')
click(tools, toolsRoot, 'potionPanel', 'slot1')
click(tools, toolsRoot, 'potionPanel', 'discard')
assert(not tools.run.potions[1], 'discard did not empty the selected physical slot')

for _, kind in ipairs({'shop', 'event', 'camp'}) do
    local room, roomRoot = start()
    local path = Routes.to(room.map, function(node) return node.type == kind end)
    for i = 1, #path - 1 do assert(Map.choose(room.map, path[i])) end
    room:refresh()
    assert(room.mapUI:choose(path[#path]) and room.run.nodeFlow.type == kind)
    room:update(1)
    V.capture(kind, room, roomRoot, 'Existing connected-map fixture; preceding encounter resolution omitted')
end

local result, resultRoot = start(function() return true end)
for _, outcome in ipairs({'defeat', 'victory'}) do
    result.run.phase = outcome
    result:refresh()
    result:update(2)
    assert(result.mode == outcome and resultRoot:GetChild('menuPanel'):GetChild('result').visible)
    V.capture(outcome, result, resultRoot, 'Both terminal renderers receive a controlled outcome; no campaign result implied')
end

local transitionRoot = F.Viewport.apply(F.control({children = F.Layout}), 1280, 720)
local waitingForBattle = true
local transition = F.GameUI.new(transitionRoot, F.Data, F.Presentation, 'click', {
    seed = 1, imageSource = 'static',
    color = function(r, g, b, a) return {r = r, g = g, b = b, a = a} end,
    presentationReady = function(intent) return not (waitingForBattle and intent.page == 'battlePanel') end,
})
transitionRoot.ui = transition
local function advanceTransition()
    transition:update(0)
    local intent = require('abyss_page_reveal').intent(transition)
    if transition.pageReveal:step(intent) then transition:refresh() end
end
assert(F.start(transition))
advanceTransition()
advanceTransition()
assert(not transition.pageReveal:covered())
enterFirstBattle(transition)
local cover = transitionRoot:GetChild('pageReveal')
assert(cover.visible and cover.raised and transition.pageReveal:covered())
assert(cover:GetChild('blocker').click(), 'cover did not consume the pointer event')
V.capture('transition-room', transition, transitionRoot, 'First room transition while its real page readiness callback is held')
waitingForBattle = false
advanceTransition()
assert(transition.pageReveal:covered(), 'readiness must be confirmed on the next update')
advanceTransition()
assert(not cover.visible and transition.battleUI.active)

print('V2_P1_EVIDENCE_PASS')
V.print()
