local GameUI = require('abyss_game_ui')
local Reveal = require('abyss_page_reveal')
local Map = require('abyss_map')
local make = GameUI.new
local advanceShop = dofile('tests/lua/support/shop_timeline.lua')

local loading, failure, readyChecks, beforeReady
GameUI.new = function(root, data, presentation, click, platform)
    platform.nativePageLifecycle = true
    platform.presentationReady = function(intent)
        if readyChecks == nil or intent.page ~= 'nodePanel' then return true end
        local room = root:GetChild('nodePanel')
        assert(room.active and room.visible, 'readiness queried before the room was mounted')
        assert(room:GetChild('merchant').visible == (intent.nodeType == 'shop'), 'readiness queried before room paint')
        assert(room:GetChild('shopRoom').visible == (intent.nodeType == 'shop'), 'complete room was not painted')
        assert(not room:GetChild('shopView').visible, 'unused goods appeared before room publication')
        readyChecks = readyChecks + 1
        if beforeReady then beforeReady(room) end
        return not loading and not failure, failure
    end
    for _, name in ipairs({'nodePanel', 'choicePanel'}) do
        local page = root:GetChild(name)
        page.active = true
        function page:SetActive(active) self.active = active end
    end
    return make(root, data, presentation, click, platform)
end

local F = dofile('tests/lua/support/game_ui_fixture.lua')
local routes = dofile('tests/lua/support/map_routes.lua')
local cursor = {CursorDown='down', CursorUp='up'}
local function tick(host)
    host:update(1/60)
    if host.pageReveal:step(Reveal.intent(host)) then host:refresh() end
end
local function settle(host)
    for _ = 1, 10 do
        if not host.pageReveal:covered() then return end
        tick(host)
    end
    error('page did not become ready')
end
local function onMap(kind)
    readyChecks, loading, failure = nil, nil, nil
    local host, root = F.fixture(nil,nil,nil,cursor)
    host.seed = 42
    settle(host)
    assert(host:start())
    settle(host)
    assert(F.confirmStart(host))
    settle(host)
    if host.mode == 'node' then
        for _, option in ipairs({1, 2, 1}) do
            assert(F.click(root, 'nodePanel', 'eventView/option' .. option))
            settle(host)
        end
    end
    assert(host.mode == 'map')
    if kind == 'camp' then host.run.hp = host.run.maxHp - 10 end
    local path = routes.to(host.map, function(node) return node.type == kind end)
    for i = 1, #path - 1 do assert(Map.choose(host.map, path[i])) end
    host:refresh()
    settle(host)
    for slot, id in pairs(host.mapUI.slots) do
        if id == path[#path] then return host, root, 'node' .. slot, id end
    end
    error('reachable node not visible')
end
local function merchantHit(panel)
    return panel:GetChild('merchant'):GetChild('talk'):GetChild('hit')
end
local function pressAndRelease(hit, event)
    hit.listeners.down(event)
    hit.listeners.up(event)
end

for _, kind in ipairs({'shop', 'event', 'camp'}) do
    local host, root, button, id = onMap(kind)
    local mapPaints, roomPaints = 0, 0
    local mapRender, roomRender = host.mapUI.render, host.nodeUI.render
    host.mapUI.render = function(...) mapPaints = mapPaints + 1; return mapRender(...) end
    host.nodeUI.render = function(...) roomPaints = roomPaints + 1; return roomRender(...) end
    readyChecks = 0
    local staleTap = {touchId=1}
    if kind == 'shop' then
        beforeReady = function(room)
            assert(host.pageReveal:covered())
            pressAndRelease(merchantHit(room), staleTap)
        end
    end
    assert(F.click(root, 'mapPanel', button))
    beforeReady = nil
    assert(host.run.nodeFlow.type == kind and host.map.currentNodeId == id)
    assert(not host.pageReveal:covered() and readyChecks == 1, kind .. ' forced a loading frame')
    assert(mapPaints == 0 and roomPaints == 1, kind .. ' repainted during entry')
    assert(not host.mapUI:choose(id), 'hidden map accepted a second click')
    assert(not host.pageReveal:covered(), 'a hidden map click invalidated the room')
    if kind == 'shop' then
        assert(not host.nodeUI.actions['shopView/card1'], 'painted the hidden shop shelf')
        local hit = merchantHit(root:GetChild('nodePanel'))
        assert(not hit.click(staleTap), 'a covered touch opened the published shop')
        local freshTap = {touchId=2}
        pressAndRelease(hit, freshTap)
        assert(hit.click(freshTap), 'fresh touch did not open the shop')
        advanceShop(host)
        assert(host.nodeUI.actions['shopView/card1'], 'opened shop did not paint the shelf')
    elseif kind == 'event' then
        assert(host.nodeUI.actions['eventView/option1'].enabled)
    else
        assert(host.nodeUI.actions['campView/rest'].enabled)
        readyChecks = nil
        assert(F.click(root, 'nodePanel', 'campView/rest'))
        settle(host)
        host:update(2)
        assert(F.click(root, 'nodePanel', 'confirm'))
        settle(host)
        assert(host.mode == 'map' and host.mapUI.navigationEnabled and host.map.currentNodeId == id)
        assert(not root:GetChild('nodePanel').active, 'exited room stayed active')
    end
end

local host, root, button = onMap('shop')
readyChecks, loading = 0, true
assert(F.click(root, 'mapPanel', button))
assert(readyChecks == 1 and host.pageReveal:covered())
local merchant = merchantHit(root:GetChild('nodePanel'))
assert(not merchant.click() and not host.nodeUI.shopOpen, 'covered merchant accepted input')
tick(host)
assert(host.pageReveal:covered())
loading, failure = false, 'room art failed'
tick(host)
assert(host.pageReveal:covered() and host.pageReveal.error == failure)
failure = nil
tick(host)
assert(host.pageReveal:covered(), 'pending assets skipped scheduler confirmation')
tick(host)
assert(not host.pageReveal:covered() and merchant.click())

-- At the top of the real map, both the short central approach and the
-- diagonal approaches should touch the displayed boss glyph.
local mapHost, mapRoot = onMap('event')
local layout = require('abyss_map_layout')
local mapPanel = mapRoot:GetChild('mapPanel')
assert(mapHost.mapUI:setScroll(layout.maxScroll))
local rooms, boss, incoming = {}, nil, 0
for index, node in ipairs(mapHost.map.nodes) do
    rooms[node.id] = index
    if node.type == 'boss' then boss = node end
end
local bossBox = F.mapControl(mapPanel, 'node' .. rooms[assert(boss).id])
local icon = bossBox:GetChild('icon')
assert(bossBox.visible)
local edgeIndex = 0
for _, node in ipairs(mapHost.map.nodes) do
    for _, target in ipairs(node.nextIds) do
        edgeIndex = edgeIndex + 1
        if target == boss.id then
            local edge = F.mapControl(mapPanel, 'edge' .. edgeIndex)
            assert(edge.visible)
            local last
            for i = 1, 8 do
                local dash = edge:GetChild('routeInk' .. i)
                if dash.visible then last = dash end
            end
            assert(last, 'boss route lost its ink')
            local angle = math.rad(edge.localRotationZ)
            local heading = angle + math.rad(last.localRotationZ)
            local x = edge.x + last.x * math.cos(angle) - last.y * math.sin(angle) + last.sizeDeltaX / 2 * math.cos(heading)
            local y = edge.y + last.x * math.sin(angle) + last.y * math.cos(angle) + last.sizeDeltaX / 2 * math.sin(heading)
            local gap = math.sqrt((x - bossBox.x)^2 + (y - bossBox.y)^2) - icon.sizeDeltaX / 2
            assert(math.abs(gap) < 4, 'boss route leaves a gap at the glyph: ' .. gap)
            incoming = incoming + 1
        end
    end
end
assert(incoming > 1, 'both kinds of boss approach must be exercised')
GameUI.new = make
