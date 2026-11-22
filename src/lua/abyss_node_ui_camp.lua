-- Campfire selection uses the same native grid geometry as the deck browser.
local Theme = require('abyss_theme')
local Controller = require('abyss_controller')
local CardDisplay = require('abyss_card_display')
local copy = require('abyss_copy').copy
local L = Theme.layout.nativeNode.forge
local cardActionPrefix = 'pickerView/forgeScroll/card'
local warmFacesPerUpdate = 2
local columns = 5
local M = {}

function M.labels(selected, node)
    if selected then return '取消', '确认升级' end
    if not node.campChoice then return '返回营地' end
end

local function find(rows, uid)
    for _, row in ipairs(rows) do if row.uid == uid then return row end end
end

-- Nodes.view copies the deck. Upgrade provenance is used by card details,
-- while this list paints only the card face and submits the selected UID.
local function sameCard(a, b, ignoreUid)
    if a == b then return true end
    if not a or not b then return false end
    for key, value in pairs(a) do
        if key ~= 'lastUpgradeOrigin' and b[key] ~= value and not (ignoreUid and key == 'uid') then return false end
    end
    for key in pairs(b) do
        if key ~= 'lastUpgradeOrigin' and a[key] == nil then return false end
    end
    return true
end

local function sameRows(a, b)
    if #a ~= #b then return false end
    for i, card in ipairs(a) do if not sameCard(card, b[i]) then return false end end
    return true
end

local function touch(event)
    return event and event.touchId or false
end

local function pose(box, binding, hovered)
    if binding.hovered == hovered then return end
    binding.hovered = hovered
    local scale = hovered and L.hoverScale or 1
    box:SetLocalScale(scale, scale, 1)
    binding.glow:SetVisible(hovered)
end

local function bindCard(ctx, box, resolveAction)
    local hit = box:GetChild('hit')
    local b = { hit = hit, glow = box:GetChild('glow'), hovered = false }
    local function entry()
        if box.alive ~= false then return resolveAction(b) end
    end
    local function enabled()
        if not box.visible then return false end
        local action = entry()
        return action and action.observe()
    end
    local function pick()
        if enabled() then return entry().handler() end
        return false, 'stale_action'
    end
    local cursor = ctx.cursor
    if cursor and cursor.CursorDown then
        hit:AddCursorEventListener(cursor.CursorDown, function(event)
            b.observed, b.press, b.touch, b.released = true, enabled() and entry() or nil, touch(event), false
            b.x, b.y = ctx.point(event)
        end)
    end
    if cursor and cursor.CursorUp then
        hit:AddCursorEventListener(cursor.CursorUp, function(event)
            if b.touch == touch(event) then b.released = true end
        end)
    end
    if cursor and cursor.CursorEndDrag then
        hit:AddCursorEventListener(cursor.CursorEndDrag, function(event)
            if not b.press or b.touch == touch(event) then b.observed, b.press = true, nil end
        end)
    end
    if cursor and cursor.CursorEnter and cursor.CursorExit then
        hit:AddCursorEventListener(cursor.CursorEnter, function()
            if enabled() then pose(box, b, true) end
        end)
        hit:AddCursorEventListener(cursor.CursorExit, function(event)
            if b.touch == touch(event) then b.press = nil end
            pose(box, b, false)
        end)
    end
    hit:AddCursorEventListener(ctx.clickEvent, function(event)
        local id = touch(event)
        if b.press and id ~= b.touch and (id or not b.released) then return false end
        local samePress = b.press and b.press == entry()
        local x, y = ctx.point(event)
        local limit = Theme.layout.cardDrag.threshold
        local moved = b.x and x and (x - b.x)^2 + (y - b.y)^2 >= limit^2
        b.press, b.x, b.y = nil, nil, nil
        if b.observed and not samePress or moved or Controller.pointerDragged(event, limit)
            or Controller.pointerBlocked(ctx.options.controller) then return false end
        return pick()
    end)
    Controller.bind(ctx.options.controller, hit, 'node', pick, enabled, 10)
    return b
end

local function submitGrid(source, amount, callback)
    local grid, request = source.grid, source.request
    if not source.firstCells then
        grid:RefreshItems(amount, callback)
        return
    end
    -- Hidden refreshes are speculative. Some native hosts reject them.
    local ok, accepted = pcall(grid.RefreshItems, grid, amount, callback)
    if (not ok or accepted == false) and source.request == request and source.firstCells then
        source.request, source.pending = nil, nil
        source.firstCells, source.warmFaces = {}, {}
    end
end

local function refreshPending(source)
    local refresh = source.pending
    source.pending = nil
    if refresh then refresh() end
end

local function warmWindowReady(source, bindings)
    for index = 1, source.firstWindow do
        local box = source.firstCells[index]
        local binding = box and bindings[box]
        if not binding or binding.index ~= index or box.alive == false then return false end
    end
    return true
end

function M.new(ctx)
    local owner, state = ctx.self, {}
    local picker = ctx.child('pickerView')
    local fit, scroll = picker:GetChild('forgeFit'), picker:GetChild('forgeScroll')
    local shade, prompt = picker:GetChild('forgeShade'), picker:GetChild('forgePrompt')
    local bases, bindings = {}, {}
    local session, list, actions, queuedNode
    local promptLabel = prompt:GetChild('label')
    local function currentSession()
        return session and session.run == owner.run and session.flow == owner.run.nodeFlow
            and session.map == owner.map and session.data == owner.run.data and owner.run.phase == 'node' and not session.flow.complete
    end

    local function show(control, visible)
        if control.visible ~= visible then ctx.show(control, visible) end
    end

    local function forget(box, binding)
        Controller.unbind(ctx.options.controller, binding.hit, box.alive == false)
        if binding.art then CardDisplay.clearNativeArt(box) end
        ctx.skinFaces[box], bindings[box] = nil, nil
    end

    local function updateBindings()
        for box, binding in pairs(bindings) do
            if box.alive == false then forget(box, binding) end
        end
    end

    local function showList(grid)
        show(fit, grid == fit)
        show(scroll, grid == scroll)
        show(prompt, grid ~= nil)
    end

    local function suspendList()
        if not actions then return end
        actions = nil
        showList(nil)
        for box, binding in pairs(bindings) do
            binding.press = nil
            if box.alive ~= false then pose(box, binding, false) end
            -- Release optional artwork so it can use its native pools in the preview.
            if binding.art then
                CardDisplay.clearNativeArt(box)
                binding.art = nil
            end
            ctx.skinFaces[box] = nil
        end
    end

    function state.hide(_, keepList)
        if not keepList then queuedNode = nil end
        if not session then return end
        suspendList()
        show(shade, false)
        if keepList and currentSession() then
            if list then list.resetScroll = true end
        else
            session, list, queuedNode = nil, nil, nil
            for _, binding in pairs(bindings) do binding.list, binding.face = nil, nil end
        end
    end

    local actionAt
    local function resolveAction(binding)
        if actions and binding.list == list then return actionAt(binding.index) end
    end

    local function actionFor(grid, entries, card, index)
        local key = cardActionPrefix .. index
        local source = session
        local function observe()
            return actions == entries and source == session and currentSession()
                and owner.picker == 'upgrade' and not owner.selected
                and grid.visible and picker.visible and owner.visible and not owner.busy and not owner.presentationBusy
                and not (ctx.options.inputCovered and ctx.options.inputCovered())
        end
        ctx.action(key, true, function()
            if not observe() or not owner.actions[key] or owner.actions[key].observe ~= observe then return false, 'stale_action' end
            owner.selected, owner.notice = card.uid, ''
            owner:render()
            return true
        end, nil, nil, observe)
        return owner.actions[key]
    end

    actionAt = function(index)
        local card = list.rows[index]
        if card and not actions[index] then actions[index] = actionFor(list.grid, actions, card, index) end
        return actions[index]
    end

    function state.action(_, key)
        if not actions or key:sub(1, #cardActionPrefix) ~= cardActionPrefix then return end
        local index = tonumber(key:sub(#cardActionPrefix + 1))
        if index and cardActionPrefix .. index == key then return actionAt(index) end
    end

    local function paintFace(box, binding, card, warming)
        local display = owner.presentation[card.cardId]
        local art = display and display.nativeArt
        local visibleArt = not warming and owner.visible and art or nil
        local changed = binding.display ~= display or binding.data ~= owner.run.data or not sameCard(binding.face, card, not art)
        if binding.art and (changed or binding.art ~= art) then
            CardDisplay.clearNativeArt(box)
            binding.art = nil
        end
        if changed then
            binding.definition = ctx.fillCard(box, card.cardId, card.upgraded, {
                instance = card, templateKind = 'attack', templateMaterials = true, deferNativeArt = true,
            })
            binding.face, binding.display, binding.data = card, display, owner.run.data
        end
        if visibleArt and binding.art ~= visibleArt then
            ctx.fillNativeCardArt(box, binding.definition, visibleArt, card.uid)
            -- These recycled cells belong to the list, outside the shared render pass.
            ctx.artFaces[box] = nil
            binding.art = visibleArt
        end
        ctx.skinFaces[box] = not warming and true or nil
    end

    local function refreshGrid(source)
        local grid, rows = source.grid, source.rows
        local request = {}
        source.request = request
        local function ownsRequest()
            return list == source and source.request == request and currentSession()
        end
        local function paint(box, index)
            if not ownsRequest() then return end
            local binding = bindings[box]
            if not binding then
                binding = bindCard(ctx, box, resolveAction)
                bindings[box] = binding
            end
            local card = rows[index]
            if binding.list ~= source or binding.index ~= index then
                binding.list, binding.index, binding.press = source, index, nil
                pose(box, binding, false)
            end
            if not ownsRequest() then return end
            if source.firstCells and card then source.firstCells[index] = box end
            if actions and card then
                local entries = actions
                actionAt(index)
                paintFace(box, binding, card)
                if ownsRequest() and actions == entries then show(box, true) end
            else
                show(box, false)
                source.warmFaces[box] = card
            end
        end
        local function refresh()
            if not ownsRequest() then return end
            submitGrid(source, #rows, function(box, index) paint(box, index - bases[grid] + 1) end)
            if not ownsRequest() then return end
            if grid == scroll and scroll.scrollProgress ~= source.progress then scroll.scrollProgress = source.progress end
            source.resetScroll = false
        end
        if #rows == 0 then submitGrid(source, 0, function() end); return end
        if bases[grid] then refresh(); return end
        submitGrid(source, 1, function(box, index)
            if not ownsRequest() or bases[grid] or (index ~= 0 and index ~= 1) then return end
            bases[grid], source.pending = index, refresh
            -- The calibration slot cannot represent a usable list.
            show(box, false)
        end)
    end

    local function retireCells(previous, source)
        for box, binding in pairs(bindings) do
            if list ~= source then return end
            if binding.list == previous and box.alive ~= false then show(box, false) end
        end
    end

    local function replaceList(rows, warming)
        local previous = list
        suspendList()
        if list ~= previous or not currentSession() then return end
        local w, h = L.viewport[3], L.viewport[4]
        local cardWidth, cardHeight = fit:GetItemSize()
        local spacing, gap = fit:GetItemSpacing()
        local top, bottom, left, right = fit:GetPadding()
        local rowCount = math.ceil(#rows / columns)
        local height = top + bottom + rowCount * cardHeight + math.max(0, rowCount - 1) * gap
        local grid = height > h and scroll or fit
        -- The partially clipped bottom row is still part of the visible window.
        local firstWindow = math.min(#rows, columns * math.ceil((h - top) / (cardHeight + gap)))
        local source = { grid = grid, rows = rows, warmFaces = {}, firstWindow = firstWindow,
            firstCells = warming and {} or nil,
            progress = previous and not previous.resetScroll and previous.progress or 0 }
        list = source
        if grid == fit then
            local count = math.min(#rows, columns)
            local width = left + right + count * cardWidth + math.max(0, count - 1) * spacing
            fit:SetSizeDelta(math.min(w, width), height)
        end
        if previous then retireCells(previous, source) end
        return source
    end

    local function resumeList(wasActive)
        local source, entries = list, actions
        if source.resetScroll then source.resetScroll, source.progress = false, 0 end
        if not wasActive and source.grid == scroll and scroll.scrollProgress ~= source.progress then
            scroll.scrollProgress = source.progress
        end
        for box, binding in pairs(bindings) do
            if list ~= source or actions ~= entries or not currentSession() then return end
            local card = binding.list == source and source.rows[binding.index]
            if card and box.alive ~= false then
                actionAt(binding.index)
                paintFace(box, binding, card)
                if list == source and actions == entries then show(box, true) end
            end
        end
        source.warmFaces = {}
    end

    local function ensureSession()
        if currentSession() then return end
        state:hide()
        session = { run = owner.run, flow = owner.run.nodeFlow, map = owner.map, data = owner.run.data }
    end

    local function activateGrid(source, reused, entries, wasActive)
        showList(source.grid)
        if list ~= source or actions ~= entries or not currentSession() then return end
        local needsRefresh = not reused or source.firstCells and not warmWindowReady(source, bindings)
        source.firstCells = nil
        if source.pending then
            refreshPending(source)
        elseif needsRefresh then
            -- Some hosts defer callbacks until the picker is visible.
            refreshGrid(source)
            refreshPending(source)
        end
        if list == source and actions == entries and reused then resumeList(wasActive) end
    end

    local function renderList(rows)
        local previous = list
        local source = list
        if not source or not sameRows(source.rows, rows) then source = replaceList(rows) end
        if not source or list ~= source or not currentSession() then return end
        local wasActive, entries = actions ~= nil, {}
        actions = entries
        local text = #rows > 0 and '选择一张卡牌升级' or '没有可升级的卡牌'
        if promptLabel.text ~= text then promptLabel.text = text end
        activateGrid(source, source == previous, entries, wasActive)
    end

    function state.queue(_, node)
        queuedNode = node
    end

    local function warmList()
        local node = queuedNode
        if not node or owner.view.node ~= node or owner.renderRun ~= owner.run or owner.renderMap ~= owner.map then return end
        local flow = owner.run.nodeFlow
        if not flow or flow.complete or owner.run.phase ~= 'node' then return end
        ensureSession()
        queuedNode = nil
        if not list or not sameRows(list.rows, node.upgradeCards) then
            local source = replaceList(node.upgradeCards, true)
            if source and list == source then refreshGrid(source) end
        end
    end

    local function paintWarmFaces(source)
        for _ = 1, warmFacesPerUpdate do
            local box, card = next(source.warmFaces)
            if not box or list ~= source or actions or not currentSession() then return end
            source.warmFaces[box] = nil
            if box.alive ~= false then
                paintFace(box, bindings[box], card, true)
                if list == source and not actions and currentSession() then show(box, true) end
            end
        end
    end

    function state.update()
        updateBindings()
        if list and not currentSession() then state:hide(); return end
        if actions then refreshPending(list); return end
        if not owner.visible or owner.mode ~= 'main' or owner.busy or owner.presentationBusy
            or ctx.options.inputCovered and ctx.options.inputCovered() then return end
        warmList()
        local source = list
        if not source then return end
        refreshPending(source)
        if list == source then paintWarmFaces(source) end
    end

    local function preview(selected)
        local before, after = picker:GetChild('before'), picker:GetChild('after')
        local upgraded = copy(selected)
        upgraded.upgrades = (selected.upgrades or (selected.upgraded and 1 or 0)) + 1
        upgraded.upgraded = true
        ctx.fillCard(before, selected.cardId, selected.upgraded, { instance = selected, inspectOnly = true })
        ctx.fillCard(after, selected.cardId, true, { instance = upgraded, inspectOnly = true })
        before:SetAnchoredPosition(L.previewBefore[1], L.previewBefore[2])
        after:SetAnchoredPosition(L.previewAfter[1], L.previewAfter[2])
        before:SetLocalScale(L.previewScale, L.previewScale, 1)
        after:SetLocalScale(L.previewScale, L.previewScale, 1)
        picker:GetChild('arrow'):SetAnchoredPosition(L.arrow[1], L.arrow[2])
    end

    function state.render(_, node)
        ensureSession()
        if list and list.grid == scroll and scroll.visible then list.progress = scroll.scrollProgress or 0 end
        owner.upgradeRows, owner.pickPage, owner.pageCount = node.upgradeCards, 1, 1
        local selected = find(owner.upgradeRows, owner.selected)
        if not selected then owner.selected = nil end
        for i = 1, 6 do show(picker:GetChild('card' .. i), false) end
        for _, key in ipairs({ 'before', 'after', 'arrow' }) do show(picker:GetChild(key), selected ~= nil) end
        for _, key in ipairs({ 'target', 'forgeGrid', 'previous', 'next' }) do show(picker:GetChild(key), false) end
        for _, key in ipairs({ 'label', 'hint', 'page', 'empty' }) do
            local control = picker:GetChild(key)
            if control.text ~= '' then control.text = '' end
        end
        show(shade, true)
        if selected then
            suspendList()
            preview(selected)
        else
            renderList(owner.upgradeRows)
        end
        return ''
    end

    return state
end

return M
