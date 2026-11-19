local F = dofile('tests/lua/support/game_ui_fixture.lua')
local V = dofile('scripts/official-assets-preview.lua')
local canvas = F.control({children = F.Layout})
local root = F.Viewport.apply(canvas, 1280, 720)
local settlements = 0
local host = F.GameUI.new(root, F.Data, F.Presentation, 'click', {
    seed = 42, campaign = true, campaignProfile = 'competition-two-act',
    characterProfile = 'production', prologue = true, imageSource = 'static',
    color = function(r, g, b, a) return {r = r, g = g, b = b, a = a} end,
    settle = function(victory) assert(not victory); settlements = settlements + 1; return true end,
})
root.ui = host

local function click(panel, action)
    assert(F.click(root, panel, action), panel .. '/' .. action)
end
local function untilReady(isReady)
    for _ = 1, 100 do
        if isReady() then return end
        host:update(0.05)
    end
    assert(isReady(), 'Host did not reach the requested scene')
end
local function capture(name, provenance)
    V.capture(name, host, root, provenance)
end

click('menuPanel', 'start')
assert(host:selectCharacter('traveler') and host:selectElement('ironclad'))
capture('character', 'Selected Traveler through the live character picker')
assert(host:confirmCharacter())
untilReady(function() return host.nodeUI.visible and not host.prologue:covering() end)
click('nodePanel', 'eventView/option1')
assert(host.run.nodeFlow.event.stage == 'neow_blessing')
capture('neow', 'Fresh two-act run, real Neow blessing choices')
click('nodePanel', 'eventView/option2')
assert(host.run.nodeFlow.event.stage == 'neow_result')
click('nodePanel', 'eventView/option1')
untilReady(function() return host.mode == 'map' and host.mapUI.visible end)
capture('map', 'Real map after taking a Neow blessing')
local run, map = host.run, host.map
local floor = map.floor
assert(host.mapUI:scrollBy(10000))
local hasBoss
for _, node in ipairs(map.nodes) do
    if node.type == 'boss' then
        for slot, id in pairs(host.mapUI.slots) do
            if id == node.id then
                local icon = F.mapControl(root:GetChild('mapPanel'), 'node' .. slot):GetChild('icon')
                assert(icon.imageId == require('abyss_theme').icon.node.boss)
                hasBoss = true
            end
        end
    end
end
assert(hasBoss and map.floor == floor, 'Boss must be visible without selecting a room')
capture('map-boss', 'Same live route after scrolling to the boss')
assert(host.mapUI:scrollBy(-10000))

click('exitEntry', 'open')
local menu = root:GetChild('runMenu')
for _, name in ipairs({'resume', 'help', 'map', 'abandon', 'quit'}) do
    assert(not menu:GetChild(name).visible, 'Unexpected visible action: ' .. name)
end
assert(menu.visible and menu:GetChild('mainMenu').visible)
capture('run-menu', 'Actual upper-right menu input with its sole visible action')
click('runMenu', 'blocker')
assert(host.mode == 'map' and not menu.visible and host.run == run)
click('exitEntry', 'open')
click('runMenu', 'mainMenu')
assert(host.sessionPaused and host.mode == 'menu' and host.run == run and host.map == map)
click('menuPanel', 'continueRun')
assert(host.mode == 'map' and not host.sessionPaused and host.run == run and host.map == map)
assert(map.floor == floor and settlements == 0, 'Pause and resume must not leave the game')
click('exitEntry', 'open')
click('runMenu', 'mainMenu')
click('menuPanel', 'titleQuit')
assert(host.exitOpen and not host.settlementRequested)
click('exitPanel', 'confirm')
assert(settlements == 1 and host.settlementRequested)
print('V2_RUNTIME_EVIDENCE_PASS')
V.print()
