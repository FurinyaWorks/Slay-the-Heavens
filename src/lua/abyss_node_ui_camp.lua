-- Campfire selection uses the same native grid geometry as the deck browser.
local Theme = require('abyss_theme')
local Pointer = require('abyss_pointer_input')
local CardDisplay = require('abyss_card_display')
local copy = require('abyss_copy').copy
local L = Theme.layout.nativeNode.forge
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

function M.new(ctx)
    local owner, state = ctx.self, {}
    local picker = ctx.child('pickerView')
    local fit, scroll = picker:GetChild('forgeFit'), picker:GetChild('forgeScroll')
    local shade, prompt = picker:GetChild('forgeShade'), picker:GetChild('forgePrompt')
    local bases, bindings = {}, {}
    local session, list, actions
    local function currentSession()
        return session and session.run == owner.run and session.flow == owner.run.nodeFlow and session.map == owner.map
    end

    local function show(control, visible)
        if control.visible ~= visible then ctx.show(control, visible) end
    end

    local function pose(box, binding, hovered)
        if binding.hovered == hovered then return end
        binding.hovered = hovered
        local scale = hovered and L.hoverScale or 1
        box:SetLocalScale(scale, scale, 1)
        binding.glow:SetVisible(hovered)
    end

    local function forget(box, binding)
        if binding.art then CardDisplay.clearNativeArt(box) end
        ctx.skinFaces[box], bindings[box] = nil, nil
    end

    local function updateBindings()
        for box, binding in pairs(bindings) do
            if box.alive == false then forget(box, binding) end
        end
    end

    function state.update(_)
        updateBindings()
        if actions and list.pending then
            local refresh = list.pending
            list.pending = nil
            refresh()
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
                binding.art, binding.face = nil, nil
            end
            ctx.skinFaces[box] = nil
        end
    end

    function state.hide(_, keepList)
        if not session then return end
        suspendList()
        show(shade, false)
        if keepList and currentSession() then
            if list then list.resetScroll = true end
        else
            session, list = nil, nil
            for _, binding in pairs(bindings) do binding.list, binding.face = nil, nil end
        end
    end

    local function bindCard(box)
        local hit = box:GetChild('hit')
        local b = { hit = hit, glow = box:GetChild('glow'), hovered = false }
        bindings[box] = b
        local function entry()
            if actions and b.list == list then return actions[b.index] end
        end
        local function enabled()
            local action = entry()
            return box.alive ~= false and action and action.observe()
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
            if b.observed and not samePress or moved or Pointer.dragged(event, limit)
                or Pointer.blocked(ctx.options) then return false end
            return pick()
        end)
        return b
    end

    local function actionFor(grid, entries, card, index)
        local key = 'pickerView/forgeScroll/card' .. index
        local source = session
        local function observe()
            return actions == entries and source.run == owner.run and source.flow == owner.run.nodeFlow
                and source.map == owner.map and owner.run.phase == 'node' and not source.flow.complete
                and owner.picker == 'upgrade' and not owner.selected
                and grid.visible and picker.visible and owner.visible and not owner.busy and not owner.presentationBusy
        end
        ctx.action(key, true, function()
            if not observe() or not owner.actions[key] or owner.actions[key].observe ~= observe then return false, 'stale_action' end
            owner.selected, owner.notice = card.uid, ''
            owner:render()
            return true
        end, nil, nil, observe)
        return owner.actions[key]
    end

    local function paintFace(box, binding, card)
        local display = owner.presentation[card.cardId]
        local art = display and display.nativeArt
        local visibleArt = owner.visible and art or nil
        if art and not owner.visible then list.paintOnReveal = true end
        if binding.display == display and (binding.art == art or binding.art == visibleArt)
            and sameCard(binding.face, card, not art) then
            ctx.skinFaces[box] = true
            return
        end
        ctx.fillCard(box, card.cardId, card.upgraded, { instance = card })
        -- These recycled cells are owned by the list, outside the shared node render pass.
        ctx.artFaces[box] = nil
        binding.face, binding.display, binding.art = card, display, visibleArt
    end

    local function refreshGrid(source)
        local grid, rows = source.grid, source.rows
        local function paint(box, index)
            local binding = bindings[box] or bindCard(box)
            local card = rows[index]
            if binding.list ~= source or binding.index ~= index then
                binding.list, binding.index, binding.press = source, index, nil
                pose(box, binding, false)
                show(box, card ~= nil)
            end
            if card and actions then paintFace(box, binding, card) end
        end
        local function refresh()
            if list ~= source or not currentSession() then return end
            grid:RefreshItems(#rows, function(box, index)
                if list == source and currentSession() then paint(box, index - bases[grid] + 1) end
            end)
            if grid == scroll then scroll.scrollProgress = source.progress end
            source.resetScroll = false
        end
        if #rows == 0 then grid:RefreshItems(0, function() end); return end
        if bases[grid] then refresh(); return end
        -- Match the native deck browser's zero-/one-based index probe.
        grid:RefreshItems(1, function(box, index)
            if list ~= source or not currentSession() then return end
            bases[grid], source.pending = index, refresh
            paint(box, 1)
        end)
        state:update()
    end

    local function createList(rows, previous)
        suspendList()
        local w, h = L.viewport[3], L.viewport[4]
        local cardWidth, cardHeight = fit:GetItemSize()
        local spacing, gap = fit:GetItemSpacing()
        local top, bottom, left, right = fit:GetPadding()
        local rowCount = math.ceil(#rows / 5)
        local height = top + bottom + rowCount * cardHeight + math.max(0, rowCount - 1) * gap
        local grid = height > h and scroll or fit
        if grid == fit then
            local columns = math.min(#rows, 5)
            local width = left + right + columns * cardWidth + math.max(0, columns - 1) * spacing
            fit:SetSizeDelta(math.min(w, width), height)
        end
        return { grid = grid, rows = rows, progress = previous and not previous.resetScroll and previous.progress or 0 }
    end

    local function restoreList(wasActive)
        if list.resetScroll then list.resetScroll, list.progress = false, 0 end
        if not wasActive and list.grid == scroll and scroll.scrollProgress ~= list.progress then
            scroll.scrollProgress = list.progress
        end
        if not wasActive or owner.visible and list.paintOnReveal then
            list.paintOnReveal = nil
            for box, binding in pairs(bindings) do
                local card = binding.list == list and list.rows[binding.index]
                if card and box.alive ~= false then paintFace(box, binding, card) end
            end
        end
    end

    local function renderList(rows)
        local previous = list
        if not list or not sameRows(list.rows, rows) then list = createList(rows, previous) end
        local wasActive = actions ~= nil
        actions = {}
        for i, card in ipairs(list.rows) do actions[i] = actionFor(list.grid, actions, card, i) end
        showList(list.grid)
        local label = prompt:GetChild('label')
        local text = #rows > 0 and '选择一张卡牌升级' or '没有可升级的卡牌'
        if label.text ~= text then label.text = text end
        if list ~= previous then refreshGrid(list) else restoreList(wasActive) end
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

    function state:render(node)
        if not currentSession() then
            self:hide()
            session = { run = owner.run, flow = owner.run.nodeFlow, map = owner.map }
        end
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
