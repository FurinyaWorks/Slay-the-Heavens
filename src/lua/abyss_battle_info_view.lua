-- Detail pagination and native layout. This module neither handles input nor changes combat.
local Actors = require("abyss_actor")
local Theme = require("abyss_theme")
local number = require("abyss_numbers").integer
local M = {}
local UnitView=require("abyss_battle_unit_view")
local EnemyView=require("abyss_battle_enemy_view")
local C, L, S = Theme.color, Theme.layout, Theme.space
local I, A, P = L.statusInfo, L.actorDetail, L.powerTips
local powerTitle = string.format("<color=#%02X%02X%02X>", P.title.r, P.title.g, P.title.b)
local function rowHeight(row, pitch)
    return I.name + (row.textLines + row.noteLines) * pitch + I.entryGap
end

local function openPage(paging)
    paging.page = {items = {}, rows = 0, sections = 0}
    paging.pages[#paging.pages + 1] = paging.page
    paging.used = 0
end

local function needsPage(page, used, head, height, budget)
    return page.rows > 0 and (page.rows >= I.rows or used + head + height > budget
        or head > 0 and page.sections >= I.sections)
end

local function sectionLabel(paging, section, continued)
    local page = paging.page
    page.items[#page.items + 1] = {label = section.label .. (continued and "（续）" or ""), colour = section.colour}
    page.sections, paging.used = page.sections + 1, paging.used + I.section
end

function M.paginator(lines)
    local function appendSection(paging, section)
        local labelled, continued = false, false
        for _, row in ipairs(section.rows) do
            row.textLines, row.noteLines = lines(row.text,paging.width,paging.font), lines(row.note,paging.width,paging.font)
            local height = rowHeight(row, paging.pitch)
            local head = section.label and not labelled and I.section or 0
            if needsPage(paging.page, paging.used, head, height, paging.budget) then
                openPage(paging)
                continued, labelled = labelled, false
            end
            if section.label and not labelled then
                sectionLabel(paging, section, continued)
                labelled = true
            end
            local page = paging.page
            page.items[#page.items + 1] = {row = row}
            page.rows, paging.used = page.rows + 1, paging.used + height
        end
    end

    return function(card,width,font)
        local room = Theme.canvas.base[2] - L.topBar.height - S.s - Theme.canvas.safe.y
        local heading=I.header+I.summary+I.divider
        local paging = {pages = {}, used = 0, width=width,font=font,
            pitch = card.actorDetail and A.pitch or I.line, budget = room - I.pad * 2 - heading - I.footer}
        openPage(paging)
        for _, section in ipairs(card.sections) do appendSection(paging, section) end
        return paging.pages
    end
end

local function footerText(info, pages)
    return not info.transient and (#pages > 1 and "第 " .. info.page .. "/" .. #pages .. " 页 · 点按卡片翻页"
        or "点按任意处关闭") or #pages > 1 and "共 " .. #pages .. " 页 · 点击查看全部" or nil
end

local function pageHeight(card, page, footer)
    local body = card.empty and I.section or 0
    local pitch = card.actorDetail and A.pitch or I.line
    for _, item in ipairs(page.items) do
        body = body + (item.label and I.section or rowHeight(item.row, pitch))
    end
    local heading=I.header+I.summary+I.divider
    return I.pad * 2 + heading + body + (footer and I.footer or 0)
end

local function place(panel, name, x, y, width, height)
    local part = panel:GetChild(name)
    part:SetAnchoredPosition(x, y)
    if width then part:SetSizeDelta(width, height) end
    return part
end

local function detailActor(battle, info)
    return info and battle and (info.index == 0 and battle.player or battle.enemies[info.index])
end

local function cardStyle(card)
    if card.actorDetail then return A.width, A.font end
    return I.width
end

local function powerTextHeight(copy, width, font)
    local plain = copy:gsub('<color=[^>]+>', ''):gsub('</color>', '')
    local room, lines = math.floor(width * 10 / font), 0
    for paragraph in (plain .. '\n'):gmatch('(.-)\n') do
        lines = lines + 1
        local used = 0
        for glyph in paragraph:gmatch('[%z\1-\127\194-\244][\128-\191]*') do
            local advance = #glyph == 1 and 6 or 10
            if used + advance > room then
                lines, used = lines + 1, 0
            end
            used = used + advance
        end
    end
    -- Reserve the project's compatibility budget for each visible line.
    return lines * L.nativeText.lineHeight
end

local function powerColumns(rows, width, font, room)
    local column, used, columns = {}, 0, {}
    for _, row in ipairs(rows) do
        local text = powerTitle .. row.name .. "</color>\n" .. row.body
        local height = powerTextHeight(text, width - P.padding * 2, font) + P.padding * 2
        if used > 0 and used + height > room then
            columns[#columns + 1] = {rows = column, height = used - P.gap}
            column, used = {}, 0
        end
        column[#column + 1] = {text = text, height = height, y = used}
        used = used + height + P.gap
    end
    columns[#columns + 1] = {rows = column, height = used - P.gap}
    return columns
end

local function powerLayout(rows, edge, direction, info)
    -- Work in coordinates running inward from the actor, mirrored for enemies.
    local safeRight = Theme.canvas.base[1] / 2 - Theme.canvas.safe.x
    local anchor = math.max(-safeRight, edge * direction)
    local top = L.battlePotions.origin[2] - L.battlePotions.size[2] / 2 - S.s
    local floor = L.battleNotice.bandTop + S.s
    local step = P.width + P.gap
    local perPage = math.floor((2 * safeRight + P.gap) / step)
    local columns = powerColumns(rows, P.width, P.font, top - floor)
    if #columns > perPage then
        floor = floor + L.nativeText.lineHeight
        columns = powerColumns(rows, P.width, P.font, top - floor)
    end
    info.pages = math.ceil(#columns / perPage)
    info.page = math.min(info.page or 1, info.pages)
    local first = (info.page - 1) * perPage + 1
    local page = {table.unpack(columns, first, math.min(#columns, first + perPage - 1))}
    local left = math.min(anchor, safeRight - math.min(#columns, perPage) * step + P.gap)
    return page, left, top, floor
end

-- STS TipHelper.calculateAdditionalOffset, using the measured native text heights.
local function monsterTipTop(columns, actorY, top, floor)
    local height = 0
    for _, column in ipairs(columns) do height = math.max(height, column.height) end
    local canvasHeight = Theme.canvas.base[2]
    local above = 0.5 - actorY / canvasHeight
    local natural = actorY + above * height - columns[1].rows[1].height / 2
    return math.min(top, math.max(natural, floor + height))
end

local function nativePowerBox(layer, index, x, y, entry)
    local box = place(layer, "tip" .. index, x, y, P.width, entry.height)
    place(box, "edge", 0, 0, P.width, entry.height)
    place(box, "face", 0, 0, P.width - 2, entry.height - 2)
    box:SetLocalScale(1, 1, 1)
    local copy = place(box, "copy", 0, 0, P.width - P.padding * 2, entry.height - P.padding * 2)
    copy.fontSize, copy.minimumFontSize = P.font, P.font
    copy.text = entry.text
    box:SetVisible(true)
end

local function paintCardTips(panel, rows, anchor, beginCompact, finishCompact)
    local layer=panel:GetChild("powerTips")
    beginCompact(panel)
    panel:GetChild("more"):SetVisible(false)
    panel:GetChild("page"):SetVisible(false)
    local edge=Theme.canvas.base[1]/2-Theme.canvas.safe.x
    local top=Theme.canvas.base[2]/2-L.topBar.height-S.s
    local floor=-Theme.canvas.base[2]/2+Theme.canvas.safe.y
    local columns=powerColumns(rows,P.width,P.font,top-floor)
    local gap=I.cardHoverGap
    local right,left=anchor.x+anchor.halfW+gap,anchor.x-anchor.halfW-gap
    local width=#columns*(P.width+P.gap)-P.gap
    local direction=right+width<=edge or left-width<-edge and anchor.x<=0
    local index=0
    for column,items in ipairs(columns)do
        local offset=(column-1)*(P.width+P.gap)+P.width/2
        local x=direction and right+offset or left-offset
        x=math.max(-edge+P.width/2,math.min(edge-P.width/2,x))
        local y=math.min(top,math.max(anchor.y+anchor.halfH,floor+items.height))
        for _,entry in ipairs(items.rows)do
            index=index+1
            nativePowerBox(layer,index,x,y-entry.y-entry.height/2,entry)
        end
    end
    finishCompact(panel,layer,index,false)
end

function M.new(self, child, enemyPosition, describeInfo, paginate, tint, ink, picture)
    local textStyles={}
    local function readingSize(control,name,font)
        local original=textStyles[name]
        if not original then
            original={font=control.fontSize or Theme.font.reading,minimum=control.minimumFontSize or Theme.font.minimum}
            textStyles[name]=original
        end
        control.fontSize=font or original.font
        control.minimumFontSize=font and math.min(original.minimum,font) or original.minimum
    end
    local function cardAnchor(info)
        local slot=info.slot
        local box=child('card'..slot)
        local pose=self.cardPositions[info.uid]
        if info.reward then
            local anim=self.rewardView and self.rewardView.cards[slot]
            if not anim then return end
            local pick=L.rewardPick
            pose={(slot-(#info.reward.cards+1)/2)*pick.step,pick.y+anim.lift+anim.rise}
        end
        if not pose or box.visible==false then return end
        local r=(box.localRotationZ or 0)*math.pi/180
        local w,h=L.card.size[1]*(box.localScaleX or 1),L.card.size[2]*(box.localScaleY or 1)
        return {x=pose[1],y=pose[2],halfW=(math.abs(math.cos(r))*w+math.abs(math.sin(r))*h)/2,
            halfH=(math.abs(math.cos(r))*h+math.abs(math.sin(r))*w)/2}
    end
    local function pageGeometry(battle, info, height, width, font, actorDetail)
        local x, portrait
        if info.index == 0 then
            x, portrait = L.player.position[1], L.player.portrait
            x = x + portrait / 2 + S.l + width / 2
        else
            local enemyX, _, size = enemyPosition(battle, info.index)
            x, portrait = enemyX - size / 2 - S.l - width / 2, size
        end
        local edge = Theme.canvas.base[1] / 2 - Theme.canvas.safe.x - width / 2
        x = math.max(-edge, math.min(edge, x))
        local top = Theme.canvas.base[2] / 2 - L.topBar.height - S.s
        local heroY=L.player.position[2]+UnitView.noticeLift(battle.player,L.player.portrait,L.player.position[2],true)
        local unitY = info.index == 0 and heroY or select(5,enemyPosition(battle,info.index)) or L.enemyRow.y
        local cardTop=unitY+portrait/2
        local y = math.min(top - height / 2, cardTop - height / 2)
        y = math.max(-Theme.canvas.base[2] / 2 + Theme.canvas.safe.y + height / 2, y)
        return {x = x, y = y, height = height, width=width,reading=font,line = L.nativeText.lineHeight,
            pitch = actorDetail and A.pitch or I.line, tagWidth = actorDetail and A.tagWidth or I.tagWidth,
            inner = width - I.pad * 2,
            left = x - width / 2 + I.pad, right = x + width / 2 - I.pad,
            cursor = y + height / 2 - I.pad, sections = 0, rows = 0}
    end

    local function frame(panel, card, geometry)
        local x, y, height = geometry.x, geometry.y, geometry.height
        place(panel, "shadow", x + S.s, y - S.s, geometry.width + S.border * 2, height + S.border * 2)
        tint(place(panel, "border", x, y, geometry.width + S.border * 2, height + S.border * 2),
            card.actorDetail and A.border or C.goldDim)
        tint(place(panel, "plate", x, y, geometry.width, height), card.actorDetail and A.fill or C.panelSunken)
        place(panel, "page", x, y, geometry.width, height)
        tint(place(panel, "accent", x, y + height / 2 - I.accent / 2, geometry.width, I.accent), card.actorDetail and A.border or card.accent)
    end

    local function header(panel, card, geometry)
        local showTag = not card.keywordOnly and (card.actorDetail or not geometry.reading)
        panel:GetChild('title'):SetVisible(not card.keywordOnly)
        panel:GetChild('tag'):SetVisible(showTag)
        if card.keywordOnly then return end
        local titleWidth=geometry.inner-(showTag and geometry.tagWidth or 0)
        local title = place(panel, "title", geometry.left + titleWidth / 2, geometry.cursor - I.header / 2,titleWidth,geometry.line)
        readingSize(title, "title", card.actorDetail and geometry.reading)
        title.text = card.title
        ink(title, card.actorDetail and A.title or C.goldBright)
        local tag = place(panel, "tag", geometry.right - geometry.tagWidth / 2, geometry.cursor - I.header / 2)
        readingSize(tag, "tag", card.actorDetail and geometry.reading)
        tag.text = card.tag
        ink(tag, card.accent)
        geometry.cursor = geometry.cursor - I.header
    end

    local function vitals(panel, card, geometry, summary, mid, glyph)
        local left, inner, line = geometry.left, geometry.inner, geometry.line
        place(panel, "hpIcon", left + glyph / 2, mid)
        place(panel, "summary", left + glyph + S.xs + (inner / 2 - glyph - S.xs) / 2, mid, inner / 2 - glyph - S.xs, line)
        summary.text = "生命 " .. number(card.hp) .. "/" .. number(card.maxHp)
        ink(summary, C.text)
        place(panel, "blockIcon", left + inner / 2 + glyph / 2, mid)
        local guard = place(panel, "guard", left + inner / 2 + glyph + S.xs + (inner / 2 - glyph - S.xs) / 2, mid, inner / 2 - glyph - S.xs, line)
        guard.text = "格挡 " .. number(card.block)
        ink(guard, card.block > 0 and C.block or C.textMuted)
        tint(panel:GetChild("blockIcon"), card.block > 0 and C.block or C.textMuted)
    end

    local function summaryLine(panel, card, geometry)
        for _,name in ipairs({'summary','rule'})do panel:GetChild(name):SetVisible(not card.keywordOnly)end
        if card.keywordOnly then
            for _,name in ipairs({'hpIcon','blockIcon','guard'})do panel:GetChild(name):SetVisible(false)end
            return
        end
        local mid, glyph = geometry.cursor - I.summary / 2, Theme.font.label
        local summary = panel:GetChild("summary")
        for _, name in ipairs({"hpIcon", "blockIcon", "guard"}) do panel:GetChild(name):SetVisible(card.hp ~= nil) end
        if card.hp then
            vitals(panel, card, geometry, summary, mid, glyph)
        else
            place(panel, "summary", geometry.x, mid, geometry.inner, geometry.line)
            summary.text = card.subtitle
            ink(summary, C.textDim)
        end
        geometry.cursor = geometry.cursor - I.summary
        place(panel, "rule", geometry.x, geometry.cursor - I.divider / 2,geometry.inner,S.hairline)
        geometry.cursor = geometry.cursor - I.divider
    end

    local function emptySection(panel, card, geometry)
        if card.empty then
            geometry.sections = 1
            local label = place(panel, "section1", geometry.x + S.xs + S.s, geometry.cursor - I.section / 2)
            label.text = card.empty
            ink(label, C.textMuted)
            panel:GetChild("sectionMark1"):SetVisible(false)
            panel:GetChild("section1"):SetVisible(true)
            geometry.cursor = geometry.cursor - I.section
        end
    end

    local function section(panel, item, geometry)
        geometry.sections = geometry.sections + 1
        local mark = place(panel, "sectionMark" .. geometry.sections, geometry.left + S.xs / 2, geometry.cursor - I.section / 2)
        local label = place(panel, "section" .. geometry.sections, geometry.x + S.xs + S.s, geometry.cursor - I.section / 2,geometry.inner,geometry.line)
        tint(mark, item.colour)
        label.text = item.label
        ink(label, item.colour)
        mark:SetVisible(true)
        label:SetVisible(true)
        geometry.cursor = geometry.cursor - I.section
    end

    local function detailRow(panel, row, geometry, textX)
        geometry.rows = geometry.rows + 1
        local i = geometry.rows
        local icon = place(panel, "icon" .. i, geometry.left + I.icon / 2, geometry.cursor - I.name / 2)
        picture(icon, row.icon and type(row.icon) == "number" and row.icon
            or row.status and Theme.icon.status[row.status]
            or Theme.icon.intent[row.icon or row.intent] or Theme.icon.intent.unknown)
        tint(icon, row.colour)
        local nameWidth = geometry.inner - I.icon - I.gap
        if row.tag and row.tag ~= "" then nameWidth = nameWidth - geometry.tagWidth - S.xs end
        local name = place(panel, "name" .. i, geometry.left + I.icon + I.gap + nameWidth / 2,
            geometry.cursor - I.name / 2, nameWidth, geometry.line)
        name.text = row.name
        readingSize(name, "name"..i, geometry.reading)
        ink(name, row.colour)
        local rowTag = place(panel, "tag" .. i, geometry.right - geometry.tagWidth / 2, geometry.cursor - I.name / 2,
            geometry.tagWidth,geometry.line)
        rowTag.text = row.tag or ""
        readingSize(rowTag, "tag"..i, geometry.reading)
        geometry.cursor = geometry.cursor - I.name
        local text = place(panel, "text" .. i, textX, geometry.cursor - row.textLines * geometry.pitch / 2,
            geometry.inner - I.icon - I.gap, math.max(geometry.line, row.textLines * geometry.pitch + I.line))
        text.text = row.text
        readingSize(text,'text'..i,geometry.reading)
        geometry.cursor = geometry.cursor - row.textLines * geometry.pitch
        local note = place(panel, "note" .. i, textX, geometry.cursor - row.noteLines * geometry.pitch / 2,
            geometry.inner - I.icon - I.gap, math.max(geometry.line, row.noteLines * geometry.pitch + I.line))
        note.text = row.note or ""
        readingSize(note,'note'..i,geometry.reading)
        geometry.cursor = geometry.cursor - row.noteLines * geometry.pitch - I.entryGap
        for _, part in ipairs({icon, name, rowTag, text, note}) do part:SetVisible(true) end
        note:SetVisible(row.note ~= nil)
    end

    local function pageItems(panel, card, page, geometry)
        emptySection(panel, card, geometry)
        local textX = geometry.left + I.icon + I.gap + (geometry.inner - I.icon - I.gap) / 2
        for _, item in ipairs(page.items) do
            if item.label then section(panel, item, geometry)
            else detailRow(panel, item.row, geometry, textX) end
        end
    end

    local function hideUnused(panel, geometry)
        for i = geometry.sections + 1, I.sections do
            panel:GetChild("sectionMark" .. i):SetVisible(false)
            panel:GetChild("section" .. i):SetVisible(false)
        end
        for i = geometry.rows + 1, I.rows do
            for _, name in ipairs({"icon", "name", "tag", "text", "note"}) do panel:GetChild(name .. i):SetVisible(false) end
        end
    end

    local function finish(panel, info, geometry, footer, actorDetail)
        local more = panel:GetChild("more")
        more:SetVisible(footer ~= nil)
        more:SetAnchoredPosition(geometry.x, geometry.y - geometry.height / 2 + I.pad + I.footer / 2)
        more.text = footer or ""
        more:SetSizeDelta(geometry.inner,geometry.line)
        panel:SetVisible(true)
        local modal = not info.transient and not actorDetail
        child("statusDismiss"):SetVisible(not info.transient and actorDetail == true)
        panel:GetChild("hit"):SetVisible(modal)
        panel:GetChild("page"):SetVisible(not info.transient)
        panel.disableCursorEventPassthrough = modal
        panel:SetAsLastSibling()
    end

    local compact, shown = false, 0
    local staticFrame = {"shadow", "border", "plate", "accent", "rule"}
    local function powerFooter(panel, info, x, floor)
        local line = L.nativeText.lineHeight
        local y = floor - line / 2
        local label = place(panel, "more", x, y, P.width, line)
        local page = place(panel, "page", x, y, P.width, line)
        if info.pages > 1 then
            local hint = not info.transient and " · 点按翻页" or self:canPinPowerTips(info.source) and " · 点击固定" or ""
            label.text = "第 " .. info.page .. "/" .. info.pages .. " 页" .. hint
        end
        label:SetVisible(info.pages > 1)
        page:SetVisible(info.pages > 1 and not info.transient)
    end

    local function powerAnchor(battle, info)
        if info.index == 0 then
            local x, y = table.unpack(L.player.position)
            local size = L.player.portrait
            return x + size / 2 + S.l, 1, y + UnitView.noticeLift(battle.player, size, y, true) + size / 2
        end
        local g = EnemyView.geometry(battle.enemies[info.index])
        local width = Theme.canvas.base[1]
        local scale = width / 1920
        local right = g.hitX + g.hitWidth / 2
        local rightEdge = right + 20 * scale
        local safeRight = width / 2 - Theme.canvas.safe.x
        -- STS AbstractMonster.renderTip chooses a side at TIP_X_THRESHOLD.
        -- The native tooltip is wider, so it also must fit before the safe edge.
        if right + width / 2 < 1544 * scale and rightEdge + P.width <= safeRight then return rightEdge, 1, g.hitY end
        return g.hitX - g.hitWidth / 2 - 60 * scale, -1, g.hitY
    end

    local function beginCompact(panel)
        if compact then return end
        for _, name in ipairs(staticFrame) do panel:GetChild(name):SetVisible(false) end
        for _, name in ipairs({"title", "tag", "hpIcon", "summary", "blockIcon", "guard", "more", "hit", "page"}) do
            panel:GetChild(name):SetVisible(false)
        end
        hideUnused(panel, {sections = 0, rows = 0})
    end

    local function finishCompact(panel,layer,index,dismiss)
        for i = index + 1, shown do layer:GetChild("tip" .. i):SetVisible(false) end
        compact, shown = true, index
        layer:SetVisible(true)
        panel.disableCursorEventPassthrough = false
        panel:SetVisible(true)
        panel:SetAsLastSibling()
        child("statusDismiss"):SetVisible(dismiss)
    end

    local function paintPowers(panel, info, rows, battle)
        local layer = panel:GetChild("powerTips")
        beginCompact(panel)
        local edge, direction, actorTop = powerAnchor(battle, info)
        local columns, left, top, floor = powerLayout(rows, edge, direction, info)
        local monsterTop = info.index > 0 and monsterTipTop(columns, actorTop, top, floor)
        local index = 0
        for column, items in ipairs(columns) do
            local y = monsterTop or math.min(top, math.max(actorTop, floor + items.height))
            local x = direction * (left + (column - 1) * (P.width + P.gap) + P.width / 2)
            for _, entry in ipairs(items.rows) do
                index = index + 1
                nativePowerBox(layer, index, x, y - entry.y - entry.height / 2, entry)
            end
        end
        powerFooter(panel, info, direction * (left + P.width / 2), floor)
        finishCompact(panel,layer,index,not info.transient)
    end

    local function clearPowers(panel)
        if not compact then return end
        panel:GetChild("powerTips"):SetVisible(false)
        child("statusDismiss"):SetVisible(false)
        for _, name in ipairs(staticFrame) do panel:GetChild(name):SetVisible(true) end
        compact = false
    end

    local function cardInfo(info)
        return info and (info.kind=='card' or info.kind=='rewardCard')
    end
    local function renderCardTips(panel,battle,info,positionOnly)
        local anchor=battle and cardAnchor(info)
        local prior=info.sideAnchor
        if positionOnly and prior and anchor and prior.x==anchor.x and prior.y==anchor.y
            and prior.halfW==anchor.halfW and prior.halfH==anchor.halfH then return end
        if not positionOnly then
            local actor=detailActor(battle,info)
            info.tips=actor and describeInfo(battle,info,actor)
        end
        info.sideAnchor=anchor
        if info.tips and anchor then paintCardTips(panel,info.tips,anchor,beginCompact,finishCompact)
        else
            clearPowers(panel)
            child("statusDismiss"):SetVisible(false)
            panel:SetVisible(false)
            if info.transient and not self:hasOverflowCard(info) then self.info=nil end
        end
    end
    local function describedCard(battle,info,actor)
        if not actor or actor.id~=info.id or not Actors.isPresent(actor)then return end
        if not info.kind and (info.actor ~= actor or info.turn ~= battle.turn) then return end
        return describeInfo(battle,info,actor)
    end
    local function awaitingPowers(info, battle, actor)
        -- An empty portrait hover can gain its first Power before the pointer exits.
        return info.transient and not info.statusId and not info.offset and actor == info.actor
            and Actors.isPresent(actor) and info.turn == battle.turn
    end
    local function renderPowers(panel, info, rows, battle, actor)
        if rows then paintPowers(panel, info, rows, battle); return true end
        if not awaitingPowers(info, battle, actor) then return false end
        clearPowers(panel)
        panel:SetVisible(false)
        return true
    end
    return function(battle,positionOnly)
        local panel, info = child("statusInfo"), self.info
        if cardInfo(info) then return renderCardTips(panel,battle,info,positionOnly) end
        if positionOnly then return end
        local actor = detailActor(battle, info)
        local card=describedCard(battle,info,actor)
        if info and info.powerTips and renderPowers(panel, info, card, battle, actor) then return end
        clearPowers(panel)
        if not card then
            self.info = nil
            child("statusDismiss"):SetVisible(false)
            panel:SetVisible(false)
            return
        end
        local width, font=cardStyle(card)
        local pages = paginate(card,width,font)
        info.page = math.max(1, math.min(info.page or 1, #pages))
        info.pages = #pages
        local page = pages[info.page]
        local footer = footerText(info, pages)
        local geometry = pageGeometry(battle, info, pageHeight(card, page, footer),width,font,card.actorDetail)
        frame(panel, card, geometry)
        header(panel, card, geometry)
        summaryLine(panel, card, geometry)
        pageItems(panel, card, page, geometry)
        hideUnused(panel, geometry)
        finish(panel, info, geometry, footer, card.actorDetail)
    end
end

return M
