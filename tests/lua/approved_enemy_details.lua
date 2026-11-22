local H = dofile('tests/lua/support/battle_gesture_fixture.lua')
local monsterControl = dofile('tests/lua/support/monster_control_fixture.lua')
local enemyPower = dofile('tests/lua/support/monster_power_control_fixture.lua')
local Combat, Theme = H.F.Combat, H.F.Theme
local L = Theme.layout
local surfaces = {'hit', 'intentHit', 'hpHit'}
local count = 0

local function same(a, b)
    assert(type(a) == type(b), 'inspection changed rule-state type')
    if type(a) ~= 'table' then assert(a == b, 'inspection changed rule-state value'); return end
    for key, value in pairs(a) do same(value, b[key]) end
    for key in pairs(b) do assert(a[key] ~= nil, 'inspection added a rule-state field') end
end

local function test(name, fn)
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
            assert(tip.x - halfW >= -right - .01 and tip.x + halfW <= right + .01)
            assert(tip.y + halfH <= top + .01 and tip.y - halfH >= L.battleNotice.bandTop)
            parts[#parts + 1] = tip:GetChild('copy').text
        end
    end
    return table.concat(parts, '\n'), parts
end

local function spikeScene(mobile)
    local host, ui, panel = H.setup({'strike','defend'}, {'spike_slime_l'},
        {touchScreen = function() return mobile end})
    local battle = host.run.combat
    battle.enemies[1].ai, battle.enemies[1].intentIndex = nil, 1
    ui:render()
    return host, ui, panel, battle, monsterControl(panel, 'enemy1')
end

for _, mobile in ipairs({false, true}) do
    test(mobile and 'mobile tap yields identical overview from body, intent and HP' or
        'PC hover yields identical overview from body, intent and HP', function()
        local _, ui, panel, battle, box = spikeScene(mobile)
        local before, notice, target = Combat.copy(battle), panel:GetChild('notice').text, ui.target
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
            assert(#rows == 2 and ui.info.transient == not mobile and ui.info.source == hit)
            contains(rows[1], '攻击 16')
            contains(rows[1], '塞入「黏滞」×2')
            contains(rows[2], '分裂')
            first = first or text
            assert(first == text)
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

test('long lists retain ordered mixed and multi-hit intent, duration and source text', function()
    local host, ui, panel = H.setup({'strike','defend'}, {'guardian'}, {touchScreen = function() return false end})
    local battle = host.run.combat
    local enemy = battle.enemies[1]
    -- Keep a real source intent identity while exercising a mixed projection.
    enemy.ai = nil
    enemy.intentIndex = 1
    enemy.intents = {{id='guardian_7', kind='defend', effects={
        {op='gainStatus',status='dexterity',value=3}, {op='block',value=10}, {op='damage',value=6,times=2}}}}
    for _, id in ipairs({'strength','dexterity','ritual','artifact','thorns','weak','vulnerable',
        'frail','poison','regen','barricade','constricted'}) do Combat.addStatus(enemy, id, 2) end
    enemy.constrictedSourceName = '来源测试'
    -- The legal status definition set is larger than the preallocated tooltip pool.
    for id in pairs(enemy.statusDefinitions) do
        if id ~= 'no_block' and enemy.statuses[id] == nil then Combat.addStatus(enemy, id, 1) end
    end
    ui:render()
    monsterControl(panel, 'enemy1'):GetChild('hpHit').listeners.enter()
    local text, rows = contents(panel)
    contains(rows[1], '自身获得 3 层敏捷')
    contains(rows[1], '获得 11 点格挡')
    contains(rows[1], '攻击 2 次')
    contains(text, '剩余 2 回合')
    contains(text, '来源：来源测试')
    local last = #rows[1]
    for _, entry in ipairs(Combat.statusView(enemy)) do
        local title = entry.name .. (entry.stack == 'none' and '' or ' ' .. require('abyss_numbers').integer(entry.amount))
        last = assert(text:find('>' .. title .. '</color>', last + 1, true), 'missing or reordered status ' .. entry.id)
    end
end)

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
        contains(text, '意图已隐藏')
        contains(text, '分裂')
        assert(not text:find('攻击 16', 1, true) and not text:find('黏滞', 1, true))
        hit.listeners.exit()
    end
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

print('APPROVED_ENEMY_DETAILS_PASS ' .. count)
