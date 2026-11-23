package.path = 'src/lua/?.lua;build/lua/?.lua;' .. package.path
local Combat = require('abyss_combat')
local Actions = require('abyss_card_actions')
local Profiles = require('abyss_character_profiles')
local data = Profiles.prepare(require('abyss_data'), 'silent')

local function play(s, id)
    for _, card in ipairs(s.hand) do
        if card.cardId == id then return assert(Combat.play(s, card.uid)) end
    end
    error('missing card: ' .. id)
end

for _, experimental in ipairs({true, false}) do
    local state = Combat.new(data, {deck = {'tools_of_the_trade'}, enemies = {'jaw_worm'}, seed = 42})
    -- Cross-class cards can also be played through the native turn host.
    state.experimentalMechanics = experimental
    play(state, 'tools_of_the_trade')
    state.rules.player.drawPerTurn = 0
    local original = Actions.fresh(Combat, state, 'endless_agony')
    state.draw = {original}
    assert(Combat.endTurn(state))
    local host = experimental and 'experimental' or 'native'
    local choice = assert(state.pendingDiscard, host .. ': original and copy must both be eligible for discard')
    assert(choice.count == 1 and #choice.handUids == 2)
    local copyUid = choice.handUids[2]
    assert(copyUid ~= original.uid and state.hand[2].cardId == original.cardId)
    assert(Combat.chooseDiscard(state, {copyUid}, choice.token))
    assert(#state.hand == 1 and state.hand[1] == original and #state.discard == 1)
    assert(state.discard[1].uid == copyUid and not state.pendingDiscard)
    print('ok Tools of the Trade includes the Endless Agony copy in discard choice for ' .. host)
end
