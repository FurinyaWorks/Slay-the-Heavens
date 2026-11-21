-- Campfire selection uses the same native grid geometry as the deck browser.
local Theme = require('abyss_theme')
local Controller = require('abyss_controller')
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

local function touch(event)
    return event and event.touchId or false
end

function M.new(ctx)
    local owner, state = ctx.self, {}
    local picker = ctx.child('pickerView')
    local fit, scroll = picker:GetChild('forgeFit'), picker:GetChild('forgeScroll')
    local shade, prompt = picker:GetChild('forgeShade'), picker:GetChild('forgePrompt')
    local bases, bindings = {}, {}
    local session, painting, pending, progress

    local function forget(box, binding)
        Controller.unbind(ctx.options.controller, binding.hit, box.alive == false)
        CardDisplay.clearNativeArt(box)
        ctx.artFaces[box], ctx.skinFaces[box], bindings[box] = nil, nil, nil
    end

    local function updateBindings()
        for box, binding in pairs(bindings) do
            if box.alive == false then forget(box, binding) end
        end
    end

    function state.update(_)
        updateBindings()
        if pending then
            local refresh = pending
            pending = nil
            refresh()
        end
    end

    local function showList(grid)
        ctx.show(fit, grid == fit)
        ctx.show(scroll, grid == scroll)
        ctx.show(prompt, grid ~= nil)
    end

    function state.hide(_)
        if not session then return end
        session, pending, painting, progress = nil, nil, nil, nil
        showList(nil)
        ctx.show(shade, false)
        for box, binding in pairs(bindings) do
            binding.entry = nil
            CardDisplay.clearNativeArt(box)
            ctx.artFaces[box], ctx.skinFaces[box] = nil, nil
        end
    end

    local function bindCard(box)
        local hit = box:GetChild('hit')
        local b = { hit = hit }
        bindings[box] = b
        local function enabled()
            return box.alive ~= false and b.entry and b.entry.observe()
        end
        local function pick()
            if enabled() then return b.entry.handler() end
            return false, 'stale_action'
        end
        local function hover(entered)
            if not enabled() then return end
            local scale = entered and L.hoverScale or 1
            box:SetLocalScale(scale, scale, 1)
            box:GetChild('glow'):SetVisible(entered)
        end
        local cursor = ctx.cursor
        if cursor and cursor.CursorDown then
            hit:AddCursorEventListener(cursor.CursorDown, function(event)
                b.observed, b.press, b.touch = true, b.entry, touch(event)
                b.x, b.y = ctx.point(event)
            end)
        end
        if cursor and cursor.CursorEndDrag then
            hit:AddCursorEventListener(cursor.CursorEndDrag, function()
                b.observed, b.press = true, nil
            end)
        end
        if cursor and cursor.CursorEnter and cursor.CursorExit then
            hit:AddCursorEventListener(cursor.CursorEnter, function() hover(true) end)
            hit:AddCursorEventListener(cursor.CursorExit, function(event)
                if b.touch == touch(event) then b.press = nil end
                hover(false)
            end)
        end
        hit:AddCursorEventListener(ctx.clickEvent, function(event)
            local samePress = b.press and b.press == b.entry and b.touch == touch(event)
            local x, y = ctx.point(event)
            local moved = b.x and x and (x - b.x)^2 + (y - b.y)^2 >= Theme.layout.cardDrag.threshold^2
            local blocked = b.observed and (not samePress or moved)
            b.press, b.x, b.y = nil, nil, nil
            if blocked or event and event.dragging or Controller.pointerBlocked(ctx.options.controller) then return false end
            return pick()
        end)
        Controller.bind(ctx.options.controller, hit, 'node', pick, enabled, 10)
        return b
    end

    local function actionFor(grid, entries, card, index)
        local key = 'pickerView/forgeScroll/card' .. index
        local source = session
        local function observe()
            return painting == entries and source.run == owner.run and source.flow == owner.run.nodeFlow
                and source.map == owner.map and owner.picker == 'upgrade' and not source.flow.complete and not owner.selected
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

    local function refreshGrid(grid, rows)
        local entries = {}
        for i, card in ipairs(rows) do entries[i] = actionFor(grid, entries, card, i) end
        local function paint(box, index)
            local b = bindings[box] or bindCard(box)
            b.entry = entries[index]
            local card = rows[index]
            ctx.show(box, card ~= nil)
            if not card then return end
            ctx.fillCard(box, card.cardId, card.upgraded, { instance = card })
            box:SetLocalScale(1, 1, 1)
        end
        local function refresh()
            if painting ~= entries then return end
            grid:RefreshItems(#rows, function(box, index)
                if painting == entries then paint(box, index - bases[grid] + 1) end
            end)
            grid.scrollProgress = progress or 0
        end
        painting, pending = entries, nil
        if #rows == 0 then grid:RefreshItems(0, function() end); return end
        if bases[grid] then refresh(); return end
        -- Like the deck browser, probe one item before refreshing the whole list.
        grid:RefreshItems(1, function(box, index)
            if painting ~= entries then return end
            bases[grid], pending = index, refresh
            paint(box, 1)
        end)
        state:update()
    end

    local function renderList(rows)
        local w, h = L.viewport[3], L.viewport[4]
        local _, cardHeight = fit:GetItemSize()
        local _, gap = fit:GetItemSpacing()
        local top, bottom = fit:GetPadding()
        local rowCount = math.ceil(#rows / 5)
        local height = top + bottom + rowCount * cardHeight + math.max(0, rowCount - 1) * gap
        local grid = height > h and scroll or fit
        if grid == fit then
            local cardWidth = fit:GetItemSize()
            local spacing = fit:GetItemSpacing()
            local _, _, left, right = fit:GetPadding()
            local columns = math.min(#rows, 5)
            local width = left + right + columns * cardWidth + math.max(0, columns - 1) * spacing
            fit:SetSizeDelta(math.min(w, width), height)
        end
        showList(grid)
        prompt:GetChild('label').text = #rows > 0 and '选择一张卡牌升级' or '没有可升级的卡牌'
        refreshGrid(grid, rows)
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
        if not session or session.run ~= owner.run or session.flow ~= owner.run.nodeFlow or session.map ~= owner.map then
            self:hide()
            session = { run = owner.run, flow = owner.run.nodeFlow, map = owner.map }
        end
        if scroll.visible then progress = scroll.scrollProgress end
        owner.upgradeRows, owner.pickPage, owner.pageCount = node.upgradeCards, 1, 1
        local selected = find(owner.upgradeRows, owner.selected)
        if not selected then owner.selected = nil end
        for i = 1, 6 do ctx.show(picker:GetChild('card' .. i), false) end
        for _, key in ipairs({ 'before', 'after', 'arrow' }) do ctx.show(picker:GetChild(key), selected ~= nil) end
        for _, key in ipairs({ 'target', 'forgeGrid', 'previous', 'next' }) do ctx.show(picker:GetChild(key), false) end
        for _, key in ipairs({ 'label', 'hint', 'page', 'empty' }) do picker:GetChild(key).text = '' end
        ctx.show(shade, true)
        if selected then
            pending, painting = nil, nil
            showList(nil)
            preview(selected)
        else
            renderList(owner.upgradeRows)
        end
        return ''
    end

    return state
end

return M
