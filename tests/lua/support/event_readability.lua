local audit = dofile('tests/lua/support/two_act_selection_audit.lua')
local snapshot = dofile('tests/lua/support/ui_readability_snapshot.lua')
local layout = require('abyss_ui_layout')
local stage
for _, control in ipairs(layout) do
    if control.name == 'stage' then stage = control; break end
end
local nodeSpec
for _, control in ipairs(assert(stage).children) do
    if control.name == 'nodePanel' then nodeSpec = control; break end
end
local scoped = {{name='stage', children={assert(nodeSpec)}}}

local function capture(name, get, shown, host)
    local options = 0
    if shown('eventView') then
        for i = 1, 4 do
            local path = 'eventView/option' .. i
            if shown(path) then
                options = options + 1
                local row, hit = get(path), get(path .. '/hit')
                assert(hit.sizeDeltaX == row.sizeDeltaX and hit.sizeDeltaY == row.sizeDeltaY,
                    name .. ': choice and hit area must agree')
            end
        end
    end
    snapshot.capture(name, host, scoped, {options=options})
end

if ABYSS_MUTATION_CASE == 'ordinary-event-caption' then
    local r, m = audit.room('we_meet_again', 2)
    local _, get, shown, _, _, _, host = audit.ui(r, m)
    assert(shown('eventView/option1'))
    capture('event/we_meet_again', get, shown, host)
    return
end

local run, map = audit.room('match_game', 1)
local ui, get, shown, click, _, _, host = audit.ui(run, map)
local function match(name) capture('match/' .. name, get, shown, host) end
match('intro')
assert(click('eventView/option1'))
match('rules')
-- Independent expectations for the rules that the player must be able to read.
local rules = get('eventView/option1/title').text
assert(rules:find('十二张牌，五次机会',1,true), 'MATCH_RULES_ATTEMPT_LIMIT')
assert(rules:find('命中也会消耗一次机会，诅咒同样会被带走。',1,true), 'MATCH_RULES_MATCH_AND_CURSE')
if ABYSS_MUTATION_CASE == 'match-rule-copy' then return end
assert(click('eventView/option1'))
match('concealed')

local function findPair()
    local first = {}
    for i, card in ipairs(run.nodeFlow.event.board) do
        if not run.nodeFlow.event.removed[i] then
            if first[card.sourceCardId] then return first[card.sourceCardId], i end
            first[card.sourceCardId] = i
        end
    end
    error('expected a visible pair')
end

local function flip(index) assert(click('pickerView/forgeGrid/card' .. index)) end
local first, second = findPair()
flip(first)
match('one-revealed')
flip(second)
match('resolving')
local hooks = audit.H.Hooks
local obtain = hooks.onObtainCard
hooks.onObtainCard = function() return false, 'controlled_native_match_failure' end
ui:update(2)
hooks.onObtainCard = obtain
match('retry')
assert(click('pickerView/matchRetry'))
for _ = 2, 5 do
    first, second = findPair()
    flip(first)
    flip(second)
    ui:update(1)
end
match('cleanup')
ui:update(1)
match('result')
assert(click('eventView/option1'))
assert(run.phase == 'map')

-- Derive the initial route sweep from the shipped event pools. New events
-- through these pools inherit the same caption checks once wired into the UI.
local cases = audit.cases()
for _, case in ipairs(cases) do
    local r, m = audit.room(case.id, case.act)
    local _, find, visible, _, _, _, root = audit.ui(r, m)
    assert(visible('eventView'), case.id .. ': event entry must present its choices')
    capture('event/' .. case.id, find, visible, root)
end

local function labChoices(full)
    local lab, labMap = audit.room('lab', 1)
    if full then
        lab.potions = {'block_potion', 'energy_potion', 'fire_potion'}
        local random = audit.H.Random
        lab.shopRng = {merchant=random.fromSeed('42'), potion=random.fromSeed('66')}
    end
    local _, labGet, labShown, labClick, _, _, labHost = audit.ui(lab, labMap)
    assert(labClick('eventView/option1'))
    assert(lab.nodeFlow.event.stage == 'potion_rewards' and labShown('eventView/option4'))
    if full then
        for i, id in ipairs({'skill_potion', 'entropic_brew', 'power_potion'}) do
            assert(lab.nodeFlow.event.potionOffers[i].id == id)
        end
    end
    capture(full and 'boundary/lab-full-belt' or 'boundary/lab-four-choices', labGet, labShown, labHost)
end
labChoices(false)
labChoices(true)

local trade, tradeMap = audit.room('we_meet_again', 2)
trade.gold = 0
local tradeUI, tradeGet, tradeShown, _, _, _, tradeHost = audit.ui(trade, tradeMap)
assert(tradeShown('eventView/option2') and not tradeUI.actions['eventView/option2'].enabled)
capture('boundary/trade-disabled', tradeGet, tradeShown, tradeHost)
print('EVENT_READABILITY_PASS ' .. #cases)
