local F = dofile('tests/lua/support/game_ui_fixture.lua')
local Run, Map = require('abyss_run'), require('abyss_map')
local Routes = dofile('tests/lua/support/map_routes.lua')
local advanceShop = dofile('tests/lua/support/shop_timeline.lua')

local function fixture(failSound)
    local sounds = {}
    local ui, root = F.fixture(nil, nil, nil, nil, nil, function(cue)
        assert(F.Theme.sound[cue], 'missing platform ID for '..cue)
        sounds[#sounds+1] = cue
        if failSound then error('native audio unavailable') end
    end)
    local function count(cue, expected)
        local total = 0
        for _, value in ipairs(sounds) do if value == cue then total = total+1 end end
        assert(total == expected, cue..': '..total..' ~= '..expected)
    end
    return ui, root, count
end

do
    local ui, root, count = fixture(true)
    assert(F.click(root,'menuPanel','start'))
    count('menu_confirm', 1)
    assert(F.click(root,'characterPanel','traveler'))
    F.click(root,'characterPanel','traveler')
    count('character_select', 1)
    assert(F.click(root,'characterPanel','elements/element2'))
    F.click(root,'characterPanel','elements/element2')
    count('character_select', 2)
    assert(F.confirmStart(ui,'silent'))
    assert(ui.run.character == 'silent' or ui.run.data.experimentalCharacter == 'silent')
    for _ = 1, 2 do
        assert(ui:openDeck()); assert(not ui:openDeck())
        ui:refresh(); assert(ui:closeDeck()); assert(not ui:closeDeck())
    end
    count('deck_open', 2); count('deck_close', 2)
    assert(Run.obtainPotion(ui.run,'blood_potion'))
    ui.run.hp = ui.run.hp - 10
    ui:refresh()
    assert(F.click(root,'potionEntry','open'))
    F.click(root,'potionPanel','use')
    count('potion_use', 0)
    assert(F.click(root,'potionPanel','slot1'))
    assert(F.click(root,'potionPanel','use'))
    F.click(root,'potionPanel','use'); ui:refresh(); count('potion_use', 1)
    assert(ui:closePotions())
    local first = assert(Map.available(ui.map)[1])
    assert(ui.mapUI:choose(first.id))
    count('map_pick', 1)
    assert(ui.run.phase == 'combat')
    ui:refresh(); count('map_pick', 1)
end

do
    local ui, root, count = fixture()
    assert(F.start(ui))
    local path = Routes.to(ui.map, function(node) return node.type == 'shop' end)
    for i = 1, #path-1 do assert(Map.choose(ui.map,path[i])) end
    assert(F.Nodes.enter(ui.run,ui.map,path[#path]))
    ui.run.gold = 0; ui:refresh(); ui:refresh()
    assert(root:GetChild('nodePanel'):GetChild('merchant'):GetChild('talk'):GetChild('hit').click())
    advanceShop(ui)
    assert(not ui.nodeUI:press('shopView/card1'))
    assert(not ui.nodeUI:press('shopView/card1'))
    count('merchant_deny', 1); count('merchant_greet', 1); count('merchant_buy', 0)
    ui.run.gold = 1000; ui:refresh()
    assert(ui.nodeUI:press('shopView/card1')); count('merchant_buy', 0)
    assert(ui.nodeUI:press('confirm'))
    ui:refresh(); count('merchant_buy', 1); count('merchant_greet', 1)
    assert(not ui.nodeUI:press('confirm')); count('merchant_buy', 1)
end

do
    local ui, root, count = fixture()
    assert(F.start(ui))
    assert(Run.startCombat(ui.run,'cultist_solo'))
    assert(Run.obtainPotion(ui.run,'energy_potion'));ui:refresh()
    local panel = root:GetChild('battlePanel')
    panel:GetChild('potion1').click()
    dofile('tests/lua/support/confirm_potion_popup.lua')(ui.battleUI,panel)
    assert(not ui.run.potions[1], 'confirmed potion must be spent')
    for _ = 1, 40 do ui:update(.05) end
    assert(not ui.battleUI:commitPotion(1)); count('potion_use', 1)
end

do
    local ui, root, count = fixture()
    assert(F.start(ui))
    ui.run = Run.new(F.Data,42)
    ui.battleUI.run=ui.run;ui.nodeUI.run=ui.run
    assert(Run.startCombat(ui.run,'cultist_solo'))
    local panel = root:GetChild('battlePanel')
    for _, enemy in ipairs(ui.run.combat.enemies) do enemy.hp=0 end
    assert(Run.finishCombat(ui.run));ui:refresh()
    assert(ui.run.rewards.gold and ui.run.rewards.potion)
    panel:GetChild('goldReward').listeners.click()
    panel:GetChild('goldReward').listeners.click()
    assert(panel:GetChild('claimPotion').listeners.click())
    assert(not panel:GetChild('claimPotion').listeners.click())
    ui:refresh(); count('gold_gain', 1); count('potion_claim', 1)
end

print('ACT2_AUDIO_INTERACTIONS_PASS menu/characters, deck, map, merchant, potions, rewards and audio failure')
