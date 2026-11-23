local H = dofile('tests/lua/support/battle_gesture_fixture.lua')
local monsterControl = dofile('tests/lua/support/monster_control_fixture.lua')
local enemyPower = dofile('tests/lua/support/monster_power_control_fixture.lua')
local Snapshot = dofile('tests/lua/support/ui_readability_snapshot.lua')
local Combat, Theme = H.F.Combat, H.F.Theme
local L = Theme.layout
local surfaces = {'hit', 'intentHit', 'hpHit'}
local count = 0
local capacityOnly = ... == 'capacity'

local function same(a, b)
    assert(type(a) == type(b), 'inspection changed rule-state type')
    if type(a) ~= 'table' then assert(a == b, 'inspection changed rule-state value'); return end
    for key, value in pairs(a) do same(value, b[key]) end
    for key in pairs(b) do assert(a[key] ~= nil, 'inspection added a rule-state field') end
end

local function test(name, fn, capacityCase)
    if capacityOnly and not capacityCase then return end
    fn()
    count = count + 1
    print('ok approved details ' .. count .. ' - ' .. name)
end

local function contains(text, part)
    assert(text:find(part, 1, true), 'missing ' .. part .. ' in ' .. text)
end

local function tapControl(hit, touch)
    local e = {touchId = touch}
    hit.listeners.down(e)
    hit.listeners.up(e)
    hit.listeners.click(e)
end

local function contents(panel)
    local info, parts = panel:GetChild('statusInfo'), {}
    local layer = info:GetChild('powerTips')
    assert(info.visible and layer.visible and not info:GetChild('plate').visible)
    local right = Theme.canvas.base[1] / 2 - Theme.canvas.safe.x
    local top = L.battlePotions.origin[2] - L.battlePotions.size[2] / 2 - Theme.space.s
    for i = 1, L.powerTips.rows do
        local tip = layer:GetChild('tip' .. i)
        if tip.visible then
            local halfW = tip.sizeDeltaX * tip.localScaleX / 2
            local halfH = tip.sizeDeltaY * tip.localScaleY / 2
            assert(tip.localScaleX == 1 and tip.localScaleY == 1, 'power text must not shrink to fit')
            assert(tip.x - halfW >= -right - .01 and tip.x + halfW <= right + .01)
            assert(tip.y + halfH <= top + .01 and tip.y - halfH >= L.battleNotice.bandTop)
            local copy = tip:GetChild('copy')
            assert(copy.sizeDeltaY >= L.nativeText.lineHeight and copy.sizeDeltaY < tip.sizeDeltaY)
            parts[#parts + 1] = copy.text
        end
    end
    return table.concat(parts, '\n'), parts
end

local function spikeScene(mobile)
    local host, ui, panel = H.setup({'strike','defend'}, {'spike_slime_l'},
        {touchScreen = function() return mobile end})
    local battle = Combat.new(H.F.Data, {deck={'strike','defend'}, enemies={'spike_slime_l'}, seed=2})
    battle.enemies[1].ai, battle.enemies[1].intentIndex = nil, 1
    host.run.combat = battle
    host:refresh()
    return host, ui, panel, battle, monsterControl(panel, 'enemy1')
end

test('attack and pure buff without powers replace one another on rapid PC hover', function()
    local host, ui, panel, _, _, _, _, root = H.setup({'defend'}, {'jaw_worm','cultist'},
        {touchScreen = function() return false end})
    local battle = host.run.combat
    local first = monsterControl(panel, 'enemy1'):GetChild('hit')
    local second = monsterControl(panel, 'enemy2'):GetChild('hpHit')
    for _, actor in ipairs(battle.enemies) do assert(#Combat.statusView(actor) == 0) end
    first.listeners.enter()
    local _, rows = contents(panel)
    assert(#rows == 1)
    assert(rows[1] == '<color=#F5D78A>攻势</color>\n这名敌人将要\n攻击造成 11 点伤害。')
    Snapshot.capture('jaw-worm-attack', root, H.F.Layout,
        {enemy='jaw_worm', move=Combat.intent(battle, 1).id})
    second.listeners.enter()
    first.listeners.exit()
    assert(ui.info and ui.info.actor == battle.enemies[2])
    _, rows = contents(panel)
    assert(#rows == 1 and rows[1] == '<color=#F5D78A>策略</color>\n这名敌人将要进行强化。')
    Snapshot.capture('cultist-buff', root, H.F.Layout)
    second.listeners.exit()
    assert(not ui.info and not panel:GetChild('statusInfo').visible)
end, true)

for _, mobile in ipairs({false, true}) do
    test(mobile and 'mobile tap shows the same STS stack from icon, body and HP' or
        'PC hover shows the same STS stack from icon, body and HP', function()
        local _, ui, panel, battle, box = spikeScene(mobile)
        local before, notice, target = Combat.copy(battle), panel:GetChild('notice').text, ui.target
        if mobile then ui:resize(844, 390) end
        local first
        local body, hp = box:GetChild('hit'), box:GetChild('hpHit')
        local track = box:GetChild('hpTrack')
        assert(hp.x == track.x and hp.y == track.y and hp.sizeDeltaX >= track.sizeDeltaX)
        assert(hp.y + hp.sizeDeltaY / 2 < body.y - body.sizeDeltaY / 2, 'HP is outside body targeting')
        for _, name in ipairs(surfaces) do
            local hit = box:GetChild(name)
            assert(hit.visible)
            if mobile then
                hit.listeners.enter()
                assert(not ui.info, 'touch arrival must not synthesize hover')
                tapControl(hit, 90)
            else
                tapControl(hit, 90)
                assert(not ui.info, 'PC clicks must not pin compact info')
                hit.listeners.enter()
            end
            local text, rows = contents(panel)
            assert(ui.info.transient == not mobile and ui.info.source == hit)
            assert(rows[1] == '<color=#F5D78A>策略</color>\n这名敌人将要对你施加负面效果并攻击造成 16 点伤害。')
            assert(#rows == 2)
            contains(rows[2], '分裂')
            first = first or text
            assert(first == text, 'icon, body and HP must show the same overview')
            if mobile then panel:GetChild('statusDismiss').click({touchId = 90}) else hit.listeners.exit() end
            assert(not ui.info and not panel:GetChild('statusInfo').visible)
        end
        local split = enemyPower(box, 'split'):GetChild('hit')
        if mobile then tapControl(split, 91) else split.listeners.enter() end
        local _, rows = contents(panel)
        assert(#rows == 1 and ui.info.statusId == 'split')
        contains(rows[1], '生命值降至一半或以下时')
        assert(panel:GetChild('notice').text == notice and ui.target == target)
        same(battle, before)
    end)
end

test('Jaw Worm action results match settlement and stay separate from active Block and Strength', function()
    local host, _, panel, _, tap, drain = H.setup({'defend'}, {'jaw_worm'}, {touchScreen = function() return true end})
    -- Seed 2 naturally selects Chomp, Bellow, then Thrash.
    local battle = Combat.new(H.F.Data, {deck = {'defend'}, enemies = {'jaw_worm'}, seed = 2})
    host.run.combat = battle
    host:refresh()
    local enemy = battle.enemies[1]
    local box = monsterControl(panel, 'enemy1')
    local function expectIntent(touch, title, text, activeStrength)
        tapControl(box:GetChild('intentHit'), touch)
        local _, rows = contents(panel)
        assert(#rows == (activeStrength and 2 or 1))
        assert(rows[1] == '<color=#F5D78A>' .. title .. '</color>\n' .. text, rows[1])
        if activeStrength then
            contains(rows[2], '>力量 3</color>')
            contains(rows[2], '普通攻击每段伤害 +3')
        end
        panel:GetChild('statusDismiss').click({touchId = touch})
    end
    local hp = battle.player.hp
    expectIntent(50, '攻势', '这名敌人将要\n攻击造成 11 点伤害。')
    tap('endTurn', 51)
    drain()
    assert(battle.player.hp == hp - 11)
    expectIntent(52, '守势', '这名敌人将要进行格挡并进行强化。')
    assert(Combat.statusView(enemy)[1] == nil and enemy.block == 0 and battle.player.hp == hp - 11)
    tap('endTurn', 53)
    drain()
    assert(enemy.statuses.strength == 3 and enemy.block == 6 and battle.player.hp == hp - 11)
    tapControl(enemyPower(box, 'strength'):GetChild('hit'), 54)
    local _, rows = contents(panel)
    assert(#rows == 1)
    contains(rows[1], '普通攻击每段伤害 +3')
    panel:GetChild('statusDismiss').click({touchId = 54})
    expectIntent(55, '攻势', '这名敌人将要格挡并攻击造成 10 点伤害。', true)
    assert(enemy.block == 6)
    tap('endTurn', 56)
    drain()
    assert(enemy.statuses.strength == 3 and enemy.block == 5 and battle.player.hp == hp - 21)
end)

test('the Three Sentries use the STS side threshold and keep the inspected actor clear', function()
    local enemies = {'sentry', 'sentry', 'sentry'}
    local host, ui, panel = H.setup({'defend'}, enemies, {touchScreen = function() return false end})
    local battle = Combat.new(H.F.Data, {deck = {'defend'}, enemies = enemies, encounterSource = '3 Sentries', seed = 2})
    host.run.combat = battle
    host:refresh()
    local tip = panel:GetChild('statusInfo'):GetChild('powerTips'):GetChild('tip1')
    local geometry = require('abyss_battle_enemy_view').geometry
    local safeRight = 640 - Theme.canvas.safe.x
    for slot = 1, #enemies do
        local hit = monsterControl(panel, 'enemy' .. slot):GetChild('intentHit')
        hit.listeners.enter()
        assert(ui.info and tip.visible)
        contents(panel)
        local halfW = tip.sizeDeltaX * tip.localScaleX / 2
        local g = geometry(battle.enemies[slot])
        local right = g.hitX + g.hitWidth / 2
        if right + 640 < 1544 / 1.5 and right + 20 / 1.5 + L.powerTips.width <= safeRight then
            assert(tip.x - halfW >= right, 'available right side should clear the inspected actor')
        else
            assert(tip.x + halfW <= g.hitX - g.hitWidth / 2, 'near the right edge the stack should open on the left')
        end
        assert(not panel:GetChild('statusInfo').disableCursorEventPassthrough)
        hit.listeners.exit()
    end
end)

test('long lists retain a separate attack-buff intent, active powers and source text', function()
    local touch = false
    local host, ui, panel, _, _, _, _, root = H.setup({'strike','defend'}, {'guardian'}, {touchScreen = function() return touch end})
    local battle = Combat.new(H.F.Data, {deck={'strike', 'defend'}, enemies={'guardian'}, seed=2})
    local enemy = battle.enemies[1]
    for i, move in ipairs(enemy.intents) do if move.id == 'guardian_7' then enemy.intentIndex = i end end
    for _, id in ipairs({'strength','dexterity','ritual','artifact','thorns','weak','vulnerable',
        'frail','poison','regen','barricade','constricted'}) do Combat.addStatus(enemy, id, 2) end
    enemy.constrictedSourceName = '来源测试'
    host.run.combat = battle
    host:resize(844,390)
    host:refresh()
    local box = monsterControl(panel, 'enemy1')
    local hpHit = box:GetChild('hpHit')
    local page = panel:GetChild('statusInfo'):GetChild('page')
    hpHit.listeners.enter()
    assert(ui.info.transient and ui.info.pages > 1 and not page.visible)
    Snapshot.capture('narrow-power-list', root, H.F.Layout)
    tapControl(hpHit, 97)
    assert(not ui.info.transient and page.visible)
    hpHit.listeners.exit()
    local footerX, footerY = page.x, page.y
    page.click({touchId=97,dragging=true})
    assert(ui.info.page == 1)
    page.click({touchId=97})
    assert(ui.info.page == 2)
    assert(page.x == footerX and page.y == footerY)
    panel:GetChild('statusDismiss').click({touchId=97})
    assert(not ui.info)
    -- The complete status definition set is larger than the preallocated pool.
    for id in pairs(enemy.statusDefinitions) do
        if id ~= 'no_block' and enemy.statuses[id] == nil then Combat.addStatus(enemy, id, 1) end
    end
    ui:render()
    touch = true
    tapControl(hpHit, 98)
    assert(ui.info.pages > 1 and page.visible)
    local all = {}
    local _, rows = contents(panel)
    Snapshot.capture('long-power-list', root, H.F.Layout)
    for i = 1, ui.info.pages do
        assert(ui.info.page == i)
        local _, items = contents(panel)
        for _, item in ipairs(items) do all[#all + 1] = item end
        page.click({touchId=98})
        assert(page.x == footerX and page.y == footerY)
    end
    assert(#all == #Combat.statusView(enemy) + 1 and ui.info.page == 1)
    local text = table.concat(all, '\n')
    local damage, times = box:GetChild('intent').text:match('^(%d+)x(%d+)$')
    assert(damage and times == '2')
    assert(rows[1] == '<color=#F5D78A>攻势</color>\n这名敌人将要进行强化并攻击造成 ' .. damage .. ' 点伤害 2 次。')
    contains(text, '剩余 2 回合')
    contains(text, '来源：来源测试')
    local last = #rows[1]
    for _, entry in ipairs(Combat.statusView(enemy)) do
        local title = entry.name .. (entry.stack == 'none' and '' or ' ' .. require('abyss_numbers').integer(entry.amount))
        last = assert(text:find('>' .. title .. '</color>', last + 1, true), 'missing or reordered status ' .. entry.id)
    end
    panel:GetChild('statusDismiss').click({touchId=98})
    assert(not ui.info)
end, true)

test('Runic Dome hides intent effects from both body and HP', function()
    local host, ui, panel = spikeScene(false)
    assert(H.Run.obtainRelic(host.run, 'runic_dome'))
    ui:render()
    local box = monsterControl(panel, 'enemy1')
    assert(not box:GetChild('intentHit').visible)
    box:GetChild('intentHit').listeners.enter()
    assert(not ui.info)
    for _, name in ipairs({'hit', 'hpHit'}) do
        local hit = box:GetChild(name)
        hit.listeners.enter()
        local text = contents(panel)
        contains(text, '分裂')
        assert(not text:find('策略', 1, true) and not text:find('负面效果', 1, true))
        hit.listeners.exit()
    end
end)

test('multi-hit hover follows displayed damage after a live Power callback', function()
    local host, _, panel, _, tap, drain, _, root = H.setup({'disarm'}, {'guardian'},
        {touchScreen = function() return false end})
    local battle = Combat.new(H.F.Data, {deck={'disarm'}, enemies={'guardian'}, seed=2})
    local enemy = battle.enemies[1]
    for i, move in ipairs(enemy.intents) do if move.id == 'guardian_3' then enemy.intentIndex = i end end
    host.run.combat = battle
    host:refresh()
    local box = monsterControl(panel, 'enemy1')
    local hit = box:GetChild('intentHit')
    local function preview()
        local damage, times = box:GetChild('intent').text:match('^(%d+)x(%d+)$')
        assert(damage and times == '4')
        hit.listeners.enter()
        local _, rows = contents(panel)
        contains(rows[1], '攻击造成 ' .. damage .. ' 点伤害 4 次。')
        return tonumber(damage)
    end
    local before = preview()
    hit.listeners.exit()
    tap('card1', 91)
    tap('enemy1', 91)
    drain()
    assert(enemy.statuses.strength == -2 and preview() == before - 2)
    Snapshot.capture('multi-hit-with-power', root, H.F.Layout)
end, true)

test('special intents and the attack-debuff multi-hit disclosure match the source branches', function()
    local tip = require('abyss_battle_info_content').intentTip
    for enum, expected in pairs({SLEEP={'熟睡','正在睡觉'}, STUN={'击晕','被击晕'},
        ESCAPE={'胆小','将要逃跑'}, MAGIC={'魔法','神秘的魔法'}, UNKNOWN={'不明','意图不明'},
        DEBUFF={'策略','一种负面效果'}, STRONG_DEBUFF={'策略','一种强大的负面效果'},
        DEFEND={'守势','回合进行格挡'}, DEFEND_DEBUFF={'守势','格挡并对你施加一种负面效果'}}) do
        local row = tip(enum)
        assert(row.name == expected[1])
        contains(row.body, expected[2])
    end
    assert(tip('NONE') == nil)
    assert(tip('ATTACK_DEBUFF', 4, 2).body == '这名敌人将要对你施加负面效果并攻击造成 4 点伤害。')
end)

test('intent and HP preserve card and potion aim while the portrait commits each once', function()
    local host, ui, panel, _, tap, drain = H.setup({'strike','defend'}, {'cultist','jaw_worm'},
        {touchScreen = function() return true end})
    local battle = host.run.combat
    local box = monsterControl(panel, 'enemy2')
    local body = box:GetChild('hit')
    local hp = battle.enemies[2].hp
    local slot
    for i, c in ipairs(battle.hand) do if c.cardId == 'strike' then slot = i end end
    tap('card' .. slot, 92)
    local selected, energy = ui.selected, battle.energy
    for _, name in ipairs({'intentHit', 'hpHit'}) do
        tapControl(box:GetChild(name), 92)
        contents(panel)
        assert(ui.selected == selected and battle.enemies[2].hp == hp and battle.energy == energy)
    end
    tap('enemy2', 92)
    assert(ui.selected == selected and not ui.info and battle.energy == energy, 'dismissal consumes the touch')
    tap('enemy2', 92)
    body.listeners.click({touchId = 92})
    drain()
    assert(battle.enemies[2].hp == hp - 6 and battle.energy == energy - 1 and not ui.info)

    host.run.potions = {'fire_potion'}
    ui:render()
    hp = battle.enemies[2].hp
    tap('potion1', 93)
    dofile('tests/lua/support/confirm_potion_popup.lua')(ui, panel, 93)
    local aim = assert(ui.potionAim)
    for _, name in ipairs({'intentHit', 'hpHit'}) do
        tapControl(box:GetChild(name), 93)
        contents(panel)
        assert(ui.potionAim == aim and battle.enemies[2].hp == hp and #host.run.potions == 1)
    end
    tap('enemy2', 93)
    assert(ui.potionAim == aim and not ui.info, 'dismissal keeps the potion armed')
    tap('enemy2', 93)
    body.listeners.click({touchId = 93})
    drain()
    assert(battle.enemies[2].hp == hp - 20 and not ui.info and #host.run.potions == 0)
end)

test('physical card and potion drags take priority over tooltip input', function()
    local host, ui, panel, event, _, drain = H.setup({'strike'}, {'jaw_worm'},
        {touchScreen = function() return true end})
    local battle = host.run.combat
    local box = monsterControl(panel, 'enemy1')
    local hp, energy = battle.enemies[1].hp, battle.energy
    for _, input in ipairs({'card1', 'potion1'}) do
        if input == 'potion1' then assert(H.Run.obtainPotion(host.run, 'fire_potion')); host:refresh() end
        event(input, 'down', 94)
        event(input, 'drag', 94, box.x, box.y)
        if input == 'potion1' and Theme.presentationProfile == 'official-assets-first' then
            -- This profile already cancels belt drags. Its supported potion
            -- targeting is exercised by the point-selection case above.
            event(input, 'up', 94, box.x, box.y)
            event(input, 'click', 94, box.x, box.y)
            assert(not ui.potionAim and not ui.potionMenu and not ui.info)
            assert(#host.run.potions == 1 and battle.enemies[1].hp == hp)
            return
        end
        assert(ui.gesture and ui.gesture.moving or ui.potionAim and ui.potionAim.moving)
        for _, name in ipairs(surfaces) do
            local hit = box:GetChild(name)
            if hit.listeners.enter then hit.listeners.enter() end
            tapControl(hit, 95)
            assert(not ui.info and not panel:GetChild('statusInfo').visible)
        end
        event('dragLayer', 'up', 94, box.x, box.y)
        drain()
        hp = hp - (input == 'card1' and 6 or 20)
        assert(battle.enemies[1].hp == hp and battle.energy == energy - 1 and #host.run.potions == 0)
    end
end, true)

print('APPROVED_ENEMY_DETAILS_PASS ' .. count)
