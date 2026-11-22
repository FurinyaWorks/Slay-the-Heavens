local H = dofile('tests/lua/support/committed_defeat_fixture.lua')
local count = 0
for _, phase in ipairs({'damage', 'player_death', 'defeat'}) do
    local ui, root, calls = H.setup()
    root:GetChild('battlePanel'):GetChild('endTurn').click()
    H.until_(ui, function() return H.phase(ui, phase) end)
    assert(ui.run.phase == 'defeat' and ui.mode == 'battle' and ui.battleUI.busy)
    assert(not ui.motion.deathReveal, 'guard must cover the earlier playback interval')
    if phase == 'damage' then assert(not ui.battleUI.feedback.deaths.player) end
    local run, battle = ui.run, ui.run.combat
    local hp, gold, rng = battle.player.hp, run.gold, battle.rng
    local restart, settle = H.hit(root, 'menuPanel', 'start'), H.hit(root, 'menuPanel', 'settle')
    -- Engine-delayed releases from the still-hidden result cannot acquire ownership.
    H.gesture(restart, 71); H.gesture(settle, 72)
    H.open(ui, root)
    local confirm, cancel = H.hit(root, 'exitPanel', 'confirm'), H.hit(root, 'exitPanel', 'cancel')
    local ok, reason=H.tap(confirm, 33)
    assert(not ok and reason == 'result_revealing' and calls() == 0,
        'committed ' .. phase .. ' must not request platform settlement')
    assert(not H.fire(confirm, 'click', 33))
    assert(not H.tap(confirm, 34))
    H.gesture(confirm, 35)
    local elapsed, index = ui.battleUI.feedback.elapsed, ui.battleUI.feedback.index
    ui:update(1)
    assert(ui.battleUI.feedback.elapsed == elapsed and ui.battleUI.feedback.index == index,
        'exit overlay pauses rather than consumes the death presentation')
    assert(ui.run == run and run.combat == battle and battle.player.hp == hp and run.gold == gold and battle.rng == rng)
    assert(H.tap(cancel, 36))
    assert(not ui.exitOpen and ui.run == run and calls() == 0)
    H.finish(ui)
    assert(ui.run == run and not ui.battleUI.busy)
    assert(not H.fire(confirm, 'click', 35), 'cancelled exit must expire a released confirm')
    assert(not H.fire(restart, 'click', 71) and not H.fire(settle, 'click', 72))
    assert(not ui.characterOpen and calls() == 0, 'blocked result gesture must not revive after unlock')
    assert(H.tap(settle, 41))
    assert(not H.fire(settle, 'click', 41))
    assert(calls() == 1 and ui.settlementRequested and ui.run == run)
    count = count + 1
    print('ok committed death exit ' .. count .. ' - ' .. 'native touch ' .. phase)
end
assert(count == 3)
print('LUA_PLAYER_DEATH_EXIT_GUARD_PASS ' .. count)
