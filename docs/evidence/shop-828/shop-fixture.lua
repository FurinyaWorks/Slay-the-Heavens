local F = dofile('tests/lua/support/game_ui_fixture.lua')
local V = dofile(ARTIFACTS .. '/visual-tree.lua')
local Map = require('abyss_map')
local Reveal = require('abyss_page_reveal')
local Routes = dofile('tests/lua/support/map_routes.lua')
local fps = 30
local dt = 1 / fps
local repetitions = tonumber(os.getenv('SHOP_REPETITIONS')) or 9
local dwell = tonumber(os.getenv('SHOP_DWELL_TICKS')) or 0
local trace, totals, spans, activation, rootShown, coverLifted
local function count(area, method)
    if not trace then return end
    local key = area .. '.' .. method
    totals[key] = (totals[key] or 0) + 1
end
local function measureCall(owner, key, label)
    local original = owner[key]
    owner[key] = function(...)
        if not trace then return original(...) end
        local start = os.clock()
        local accepted, reason = original(...)
        local finish = os.clock()
        spans[label] = (spans[label] or 0) + (finish - start) * 1000
        if label == 'rules.nodeEnter' and accepted then activation = finish end
        return accepted, reason
    end
end
measureCall(F.Nodes, 'enter', 'rules.nodeEnter')

local methods = {'GetChild', 'GetChildren', 'SetVisible', 'SetImage', 'SetSizeDelta',
    'SetLocalScale', 'SetAnchoredPosition', 'SetLocalRotation', 'SetAsLastSibling',
    'SetActive', 'SetPivot', 'SetAnchorMin', 'SetAnchorMax', 'RefreshItems'}
local propertyNames = {'text', 'fontColor', 'imageColor', 'imageType', 'fillType', 'fillAmount',
    'raycastTarget', 'interactable', 'fontSize', 'autoSize', 'textAlignment'}
local function observe(control, area)
    for _, method in ipairs(methods) do
        local original = control[method]
        if original then
            control[method] = function(box, ...)
                count(area, method)
                local accepted, reason = original(box, ...)
                if trace and activation and method == 'SetVisible' then
                    if area == 'panel' and (...) == true and not rootShown then
                        rootShown = true
                        spans['node.activationToVisibility'] = (os.clock() - activation) * 1000
                    elseif area == 'cover' and (...) == false and not coverLifted then
                        coverLifted = true
                        spans['node.activationToUncover'] = (os.clock() - activation) * 1000
                    end
                end
                return accepted, reason
            end
        end
    end
    local state, previous = {}, getmetatable(control)
    for _, name in ipairs(propertyNames) do
        if not (control.kind == 'cursorArea' and name == 'interactable') then
            state[name] = {rawget(control, name)}
            rawset(control, name, nil)
        end
    end
    setmetatable(control, {
        __index = function(box, key)
            if state[key] then return state[key][1] end
            return previous.__index(box, key)
        end,
        __newindex = function(box, key, value)
            if state[key] then
                count(area, key)
                state[key][1] = value
                return
            end
            return previous.__newindex(box, key, value)
        end,
    })
    for _, child in pairs(control.children or {}) do
        observe(child, area == 'panel' and child.name ~= 'shopView' and child.name ~= 'merchant' and 'nodeOther'
            or area == 'panel' and child.name or area)
    end
end
local function measure(index, label, operation)
    totals, spans = {}, {}
    trace = true
    local start = os.clock()
    local result, why = operation()
    local elapsed = (os.clock() - start) * 1000
    trace = false
    local fields = {'SHOP_BENCH', index, label, string.format('%.4f', elapsed)}
    local keys = {}
    for key in pairs(totals) do keys[#keys + 1] = key end
    table.sort(keys)
    for _, key in ipairs(keys) do fields[#fields + 1] = key .. '=' .. totals[key] end
    for key, ms in pairs(spans) do fields[#fields + 1] = '@' .. key .. '=' .. string.format('%.4f', ms) end
    print(table.concat(fields, '\t'))
    return result, why
end
local function show(control)
    if not control then return false end
    while control do
        if control.visible == false or control.activeInHierarchy == false then return false end
        control = control.parent
    end
    return true
end
local function snapshot(kind, name, ui, root, node, view, merchant, tick)
    local room = node:GetChild('shopRoom') or node:GetChild('v25ShopRoom') or node:GetChild('shopEntry')
    local portrait = merchant:GetChild('portrait')
    print(table.concat({'SHOP_VIS', kind, name, tick, show(room) and 1 or 0, show(portrait) and 1 or 0,
        show(view) and 1 or 0, view.y or 0, ui.nodeUI.shopBusy and 1 or 0}, '\t'))
    V.capture(kind .. '-' .. name, ui, root, 'Generated official-assets layout, Fengari GameUI state, browser geometry rendering')
end
local function tick(ui)
    local result, reason = ui:update(dt)
    if ui.pageReveal and ui.pageReveal:step(Reveal.intent(ui)) then ui:refresh() end
    return result, reason
end
local function settle(ui)
    for _ = 1, 90 do
        if not ui.pageReveal or not ui.pageReveal:covered() then return end
        tick(ui)
    end
    error('page reveal did not settle')
end
local function connectedRoute(ui)
    local path = Routes.to(ui.map, function(n) return n.type == 'shop' end)
    if ui.run.nodeFlow and #path > 1 then
        assert(ui.run.nodeFlow.complete)
        ui.run.nodeFlow = nil -- skip intervening rooms in this explicitly isolated fixture
    end
    for i = 1, #path - 1 do assert(Map.choose(ui.map, path[i])) end
    ui:refresh()
    settle(ui)
    for _ = 1, 90 do
        if ui.mapUI.navigationEnabled then break end
        tick(ui)
    end
    assert(ui.mapUI.navigationEnabled, 'route selector still disabled: ' .. tostring(ui.run.phase))
    return path[#path]
end
local function runShop(i, kind, ui, root, node, view, merchant, emitSnapshots)
    activation, rootShown, coverLifted = nil, nil, nil
    local route = connectedRoute(ui)
    ui.run.gold = 10000
    assert(measure(i, kind .. '.nodeSelection', function() return ui.mapUI:choose(route) end))
    assert(ui.run.nodeFlow and ui.run.nodeFlow.type == 'shop')
    local ready = 0
    while not ui.nodeUI.visible or (ui.pageReveal and ui.pageReveal:covered()) do
        ready = ready + 1
        measure(i, kind .. '.roomUpdate', function() return tick(ui) end)
        assert(ready < 90, 'room did not become interactive')
    end
    if emitSnapshots then snapshot(kind, 'room-published', ui, root, node, view, merchant, ready) end
    measure(i, kind .. '.roomFirstUpdate', function() return tick(ui) end)
    assert(not show(view), 'shelf must be hidden before opening')
    if emitSnapshots then snapshot(kind, 'room', ui, root, node, view, merchant, ready) end
    for _ = 1, dwell do
        measure(i, kind .. '.roomDwellUpdate', function() return tick(ui) end)
    end
    local hit = merchant:GetChild('talk'):GetChild('hit')
    assert(show(hit), 'merchant input must be visible')
    assert(measure(i, kind .. '.merchantClick', function() return hit.click() end))
    if emitSnapshots then snapshot(kind, 'shelf-start', ui, root, node, view, merchant, 0) end
    local ticks, firstShelf = 0, nil
    repeat
        ticks = ticks + 1
        local phase = show(view) and '.shelfUpdate' or '.prepUpdate'
        measure(i, kind .. phase, function() return tick(ui) end)
        if not firstShelf and show(view) and (view.y or 0) < 720 then firstShelf = ticks end
        assert(ticks < 90, 'shelf did not become interactive')
        if emitSnapshots and ticks == 1 then snapshot(kind, 'shelf-first-update', ui, root, node, view, merchant, ticks) end
        if emitSnapshots and firstShelf and ticks == firstShelf + 4 then
            snapshot(kind, 'shelf-mid', ui, root, node, view, merchant, ticks)
        end
    until not ui.nodeUI.shopBusy
    assert(show(view), 'shelf is hidden after opening')
    if emitSnapshots then snapshot(kind, 'shelf-ready', ui, root, node, view, merchant, ticks) end
    print(table.concat({'SHOP_READY', i, kind, ready, ticks, firstShelf or ticks}, '\t'))
    for _ = 1, 6 do measure(i, kind .. '.idleUpdate', function() return tick(ui) end) end
    local cost = ui.run.gold
    assert(measure(i, kind .. '.cardSelect', function() return ui.nodeUI:press('shopView/card1') end))
    assert(measure(i, kind .. '.purchase', function() return ui.nodeUI:press('confirm') end))
    assert(ui.run.gold < cost and ui.run.nodeFlow.cards[1].sold)
    settle(ui)
    assert(measure(i, kind .. '.leaveClick', function() return ui.nodeUI:press('back') end))
    ticks = 0
    while ui.nodeUI.shopBusy do
        ticks = ticks + 1
        measure(i, kind .. '.leaveUpdate', function() return tick(ui) end)
        assert(ticks < 90, 'exit did not complete')
    end
    assert(ui.run.nodeFlow.complete)
    settle(ui)
    assert(ui.nodeUI:press('confirm'))
    settle(ui)
end
for i = 1, repetitions do
    local ui, root = F.fixture()
    settle(ui)
    assert(ui:start())
    settle(ui)
    assert(F.confirmStart(ui))
    settle(ui)
    local node = root:GetChild('nodePanel')
    local view, merchant = node:GetChild('shopView'), node:GetChild('merchant')
    observe(node, 'panel')
    observe(root:GetChild('pageReveal'), 'cover')
    measureCall(ui.nodeUI, 'setVisible', 'node.visibility')
    measureCall(ui.nodeUI, 'render', 'node.render')
    measureCall(ui.nodeUI, 'update', 'node.update')
    runShop(i, 'cold', ui, root, node, view, merchant, i == 1)
    runShop(i, 'repeat', ui, root, node, view, merchant, false)
end
V.print()
