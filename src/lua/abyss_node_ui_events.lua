local Theme = require("abyss_theme")
local Narrative = require("abyss_narrative")
local Act1Events = require('abyss_act1_events')
local Act2Events = require('abyss_act2_events')
local Act3Events = require('abyss_act3_events')
local Art = require('abyss_lowcost_art')
local Viewport = require('abyss_viewport')
local number = require("abyss_numbers").integer
local C = Theme.color
local kinds = { camp = "营地", shop = "商店", event = "未知事件", treasure = "宝箱",ending_proceed='真结局' }
-- Keep legacy Act1 pointer ownership unchanged; only the new state machines join.
local addedStaged={dead_adventurer=true,designer=true,face_trader=true,knowing_skull=true,nloth=true}
local function stagedEvent(id)return addedStaged[id] or id=='match_game' or id=='neow' or id=='mysterious_sphere' or id=='mind_bloom' or Act2Events.ids[id]end
local events = {
    designer={name='设计师'},face_trader={name='换脸商'},knowing_skull={name='智者头骨'},nloth={name='恩洛斯'},
    dead_adventurer={name='冒险者遗骸'},colosseum={name='竞技场'},masked_bandits={name='蒙面强盗'},
    cursed_tome={name='诅咒书本'},forgotten_altar={name='遗忘石台'},augmenter={name='增幅师'},vampires={name='夜巡团'},
    neow={name='高塔恩赐'},
    duplicator={name='映光石龛'},
    match_game={name='留影牌局'},
    joust={name='决斗'},
    beggar={name='乞丐'},
    mausoleum={name='古墓'},
    traveling_merchant={name='行路商贩'},
    back_to_basics={name='古老文字'},
    the_library={name='图书馆'},
    tomb_red_mask={name='红面具领主之墓',body='面具守护着陵墓中的财宝。',leave='你离开了陵墓。'},
    sensory_stone={name='追忆石碑',body='石中封存着记忆。',leave='你离开了石头。'},
    mind_bloom={name='心灵绽放',body='意识在高塔深处展开。',leave='你离开了这片意识。'},
    mysterious_sphere={name='神秘球体',body='密闭的球形容器中传来机关运转声。',leave='你离开了容器。'},
    winding_halls={name='迷途回廊',body='曲折通道等待着你的选择。',leave='你离开了通道。'},
    moai_head={name='巨像之首',body='石像上的符文隐约发亮。',leave='你离开了巨像。'},
    falling={name='坠落',body='落石正在崩塌。你必须在手中的卡牌之间作出取舍。',leave='你重新站稳，继续赶路。'},
    mushrooms={name='蘑菇',body='发光的蘑菇覆盖了通道。',leave='你离开了蘑菇群。'},golden_idol={name='鎏金神像',body='一件遗物摆在古老的石台上。',leave='你离开了石台。'},
    ghosts={name='幽灵'},

    sssserpent={name='长蛇的交易',body='一条长蛇许诺金币，代价是一张诅咒。',leave='你离开了长蛇。'},
    big_fish={name='大鱼',body='三件礼物悬在面前。你只能选取一件。',leave='你带着选择的礼物离开。'},
    accursed_blacksmith={name='诅咒铁匠',body='古旧的铁砧尚有余温，旁边散落着可疑的器具。',leave='你离开了铁砧。'},
    bonfire={name='篝火精灵',body='篝火中的精灵向你招手。',leave='你告别了篝火。'},
    transmogrifier={name='变换神龛',body='神龛的微光能将一张卡牌化为新的形态。',leave='你离开了变换神龛。'},
    scrap_ooze={name='废料黏液',body='黏液深处似乎埋着一件遗物。伸手探索会受到伤害。',leave='你停止了探索。'},
    wheel={name='变化转轮',body='转轮等待你转动。它的六种结果无法自行挑选。',leave='你离开了转轮。'},
    lab={name='实验室',body='实验台上留着三瓶药水。',leave='你离开了实验室。'},
    woman_in_blue={name='蓝衣女子',body='一位蓝衣女子出售药水，瓶中的内容要付钱后才能知晓。',leave='你告别了蓝衣女子。'},
    we_meet_again={name='又见面了',body='一位熟人提出三笔交易。每笔交易的代价已经选定。',leave='你告别了这位熟人。'},
    fountain = { name='净化之泉', body='清澈的泉水在石隙间流淌。你可以借它洗去随身的诅咒。', leave='你离开了泉水。' },
    living_wall = { name='活墙', body=Narrative.eventCopy.living_wall.intro, leave='墙上的面孔渐渐沉寂。' },
    purifier = { name = "净化神龛", body = Narrative.eventCopy.purifier.intro:gsub("\n\n", "\n"),
        leave = "你向神龛行了一礼，转身继续赶路。" },
    cleric = { name = "圣职者", body = Narrative.eventCopy.cleric.intro:gsub("\n\n", "\n"),
        leave = "你婉拒了圣职者的服务，继续赶路。" },
    goop = {name="黏液金币",body="湿滑的泥潭中露出几枚金币。要取回它们，就得忍受黏液的侵蚀；绕道离开也会丢失部分盘缠。",leave="你收好剩下的盘缠，绕过泥潭。"},
    upgrade_shrine = {name="升级神龛",body="一道微光停在石龛上。你可以在此精进一式招数。",leave="你将这次机会留在身后。"},
    golden_wing = {name="金翼雕像",body="残破的金翼守着山道。承受伤害可以舍弃一式招数；足够强的攻击也能击碎外壳，取出金币。",leave="你绕过了雕像。"},
    shining_light = {name="闪耀之光",body="石隙间涌出耀眼的光。靠近它会灼伤身体，也会让尚未精进的招数获得提升。",leave="你避开了光芒。"},
    golden_shrine = {name="鎏金石龛",body="石龛中存着一份馈赠。你可以收下少量金币，也可以取走更多，但未散的执念会随你同行。",leave="你没有取走石龛中的金币。"},
}
local layout = Theme.layout.nativeNode
local OPTIONS = #layout.event.options.rows
local function find(entries, id, key)
    for _, item in ipairs(entries or {}) do if item[key or "id"] == id then return item end end
end
local M = {}
-- STS NeowEvent staging (port): Neow stands right, InfiniteSpeechBubble carries name/body,
-- LargeDialogOptionButtons stack on the left; the generic event plate/caption is not shown.
local NEOW = layout.event.neow
local eventArt = Theme.lowCostArt and Theme.lowCostArt.event
local artOwners = setmetatable({}, {__mode='k'})
local function place(control, rect)
    control:SetAnchoredPosition(rect[1], rect[2])
    if rect[3] then control:SetSizeDelta(rect[3], rect[4]) end
end
local function alignEventBody(body, neow, alignment)
    if not alignment or not alignment.horizontal or not alignment.vertical then return end
    body.horizontalAlignment = neow and alignment.horizontal.Middle or alignment.horizontal.Left
    body.verticalAlignment = neow and alignment.vertical.Middle or alignment.vertical.Top
end
local function renderEventText(event,neow,alignment)
    if not NEOW then return end
    local body=event:GetChild('body')
    event:GetChild('name'):SetVisible(not neow)
    if not neow or not NEOW.stsChoice then
        place(body,neow and NEOW.bubbleText or layout.event.body)
    end
    alignEventBody(body,neow,alignment)
end

local function renderEventFigure(event, id, alignment)
    local neow = id == 'neow' and NEOW ~= nil
    local figure, art = event:GetChild('neowFigure'), event:GetChild('art')
    if figure then figure:SetVisible(neow) end
    if art and not eventArt then art:SetVisible(not neow) end
    for _, name in ipairs({ 'plate', 'plateBorder', 'glow', 'caption' }) do
        local c = event:GetChild(name)
        if c then c:SetVisible(not neow and (name ~= 'caption' or not layout.event.reference)) end
    end
    if neow then event:GetChild('caption').text = '七天神像' end
    local bubble = event:GetChild('bubble'); if bubble then bubble:SetVisible(neow) end
    renderEventText(event,neow,alignment)
end
local function renderEventLayout(event,id,options)
    local mobile=options.mobileRunHud
    if mobile then event:SetAnchoredPosition(0,id=='neow' and 0 or mobile.roomY) end
    renderEventFigure(event,id,options.textAlignments)
end
-- LargeDialogOptionButton.calculateY (ROOM): bottom-aligned stack, -82px per slot, x = 620.
local function inlineCopy(row)
    local copy = row.title:gsub('［', '['):gsub('］', ']') .. ' ' .. (row.description or '')
    return (copy:gsub('\r?\n', ' '))
end
local function inlineLines(text, maxWidth, font)
    local lines, width = 1, 0
    local latin = math.ceil(font * 0.6)
    for _, code in utf8.codes(text) do
        local advance = code <= 255 and latin or font
        if code == 10 then lines, width = lines + 1, 0
        elseif width + advance > maxWidth then lines, width = lines + 1, advance
        else width = width + advance end
    end
    return lines
end
local compactPadding = 4
local function compactFrames(rows, textWidth)
    local frames, bottom = {}, -275
    for i = math.min(#rows, OPTIONS), 1, -1 do
        local height = inlineLines(inlineCopy(rows[i]), textWidth, 18) * Theme.layout.nativeText.lineHeight + compactPadding
        frames[i] = {225, bottom + height / 2, 700, height}
        bottom = bottom + height + 11
    end
    return frames
end
local function clearCompactBody(event, frames)
    local first = frames[1]
    if not first then return end
    local x, y, width, height = table.unpack(layout.event.body)
    local body, name = event:GetChild('body'), layout.event.name
    local authoredTop = y + height / 2
    local optionTop = first[2] + first[4] / 2 + 8
    local needed = inlineLines(body.text, width, 21) * Theme.layout.nativeText.lineHeight
    local top = math.max(authoredTop, math.min(optionTop + needed, name[2] - name[4] / 2 - 8))
    -- Tall option stacks can use the spare space below the authored stack.
    local drop = math.min(20, math.max(0, optionTop + needed - top))
    for _, frame in ipairs(frames) do frame[2] = frame[2] - drop end
    local resized = math.max(0, math.min(height, top - optionTop + drop))
    if resized ~= height or top ~= authoredTop then place(body, {x, top - resized / 2, width, resized}) end
end
local function sizeOptionInput(box, w, h, neow, mobile)
    for _, part in ipairs({ 'border', 'hit' }) do
        local control = box:GetChild(part)
        if control then control:SetSizeDelta(w, h) end
    end
    if neow and NEOW.stsChoice then
        box:GetChild('hit'):SetSizeDelta(w, mobile and mobile.hit or math.max(h, NEOW.stsChoice.hitHeight))
    end
end

local function neowFrame(mobile)
    local n=NEOW.options
    if not mobile then return n.bottom,n.spacing,n.size[2] end
    local frame=mobile.neowOptions
    return -Theme.canvas.base[2]/2+frame.bottomInset+mobile.hit/2,frame.spacing,frame.faceHeight
end

local function placeNeowDialog(event,count,mobile)
    if not NEOW.stsChoice then return end
    local bottom,spacing,height=neowFrame(mobile)
    local x,preferred,w,h=table.unpack(NEOW.bubbleText)
    if mobile then preferred=preferred+mobile.neowOptions.bubbleLift end
    local bubble=event:GetChild('bubble')
    local optionTop=bottom+(count-1)*spacing+height/2
    -- Keep sparse dialogue near its next action while retaining the full
    -- figure and an uncluttered lane for the four-choice stack.
    local y=math.min(preferred,math.max(-56,optionTop+bubble.sizeDeltaY/2+56))
    bubble:SetAnchoredPosition(x,y)
    place(event:GetChild('body'),{x,y,w,h})
end

local function neowOption(box, index, count, mobile)
    local n=NEOW.options
    local bottom,spacing,height=neowFrame(mobile)
    if mobile then
        local frame=mobile.neowOptions
        box:GetChild('stsNeowChrome'):SetLocalScale(1,height/n.size[2],1)
        local caption=box:GetChild('stsNeowText')
        caption:SetSizeDelta(n.title[3],height)
        caption.fontSize=frame.fontSize
    end
    box:SetAnchoredPosition(n.x,bottom+(count-index)*spacing)
    place(box:GetChild('title'),n.title)
    place(box:GetChild('description'),n.description)
    return n.size[1],height
end

local function positionEventOptionChrome(box,w,h)
    if layout.event.reference and not box:GetChild('roundedButton') then
        place(box:GetChild('v25BaseMaterial'), {0, 0, w - 4, h - 4})
        local chrome = box:GetChild('v25StateChrome')
        chrome:SetSizeDelta(w, h)
        place(chrome:GetChild('topStitch'), {0, h / 2 - 2, w - 8, 2})
        place(chrome:GetChild('lowerRim'), {0, -h / 2 + 2, w - 8, 2})
        place(chrome:GetChild('faceDepth'), {0, 0, w - 6, h - 6})
        for _, name in ipairs({'v25Corner0_0','v25Corner0_1','v25Corner1_0','v25Corner1_1'}) do
            box:GetChild(name):SetSizeDelta(42, h / 2)
        end
    end
end
local function placeOptions(event, neow, rows, mobile)
    local o = layout.event.options
    local count = math.min(#rows, OPTIONS)
    if neow then placeNeowDialog(event,count,mobile) end
    local frames = layout.event.reference and not neow and compactFrames(rows, o.title[3])
    if frames then clearCompactBody(event, frames) end
    for i = 1, OPTIONS do
        local box = event:GetChild('option' .. i)
        if box then
            local w, h = o.size[1], o.size[2]
            if neow then
                w,h=neowOption(box,i,count,mobile)
            elseif frames and frames[i] then
                w, h = frames[i][3], frames[i][4]
                place(box, frames[i]);place(box:GetChild('title'), {0, 0, o.title[3], h - compactPadding})
            elseif o.rows[i] then
                box:SetAnchoredPosition(o.x, o.rows[i])
                place(box:GetChild('title'), o.title)
                place(box:GetChild('description'), o.description)
            end
            box:SetSizeDelta(w, h)
            sizeOptionInput(box, w, h, neow, mobile)
            for _, part in ipairs({ 'normal', 'disabled', 'hover', 'pressed', 'selected' }) do
                local c = box:GetChild(part); if c then c:SetSizeDelta(w - 4, h - 4) end
            end
            positionEventOptionChrome(box,w,h)
            box:GetChild('description'):SetVisible(not frames)
        end
    end
end

local function eventNotice(id, copy, result)
    if id == 'neow' then return '' end
    if (stagedEvent(id) or Act3Events.ids[id]) then return copy.name .. ' · 请选择上方选项' end
    return result and copy.name or (copy.name .. " · 选择一项，或直接离开")
end

function M.resetArt(event)
    if not eventArt then return end
    local owner = {}
    artOwners[event] = owner
    local icon = event:GetChild('art')
    Art.hide(icon, false)
    if artOwners[event] == owner then icon:SetVisible(false) end
end

local function renderEventArt(ctx, event, id)
    local reference = layout.event.reference
    if not reference then return end
    if id == 'neow' then M.resetArt(event);return end
    local icon = event:GetChild('art')
    local illustrations=Theme.icon.eventArt or {}
    local picture = illustrations[id] or illustrations.default or reference.icon
    local owner
    if eventArt then
        owner = {picture=picture}
        artOwners[event] = owner
    end
    -- Prepare the current event's fallback before pooled native writes can fail.
    ctx.picture(icon, picture)
    local active = artOwners[event]
    if active ~= owner then
        if active and active.picture and icon.visible ~= false then ctx.picture(icon, active.picture) end
        return
    end
    ctx.tint(icon, reference.figureInk)
    if eventArt and artOwners[event] == owner
        and not Art.paint(icon, 'event', id, layout.event.art[3], ctx.options)
        and artOwners[event] == owner then ctx.show(icon, true) end
end

local function optionDescription(ctx, selected)
    local description = ctx.eventOptionText(selected)
    return description
end

local function descriptionInk(enabled)
    local reference = layout.event.reference
    return reference and (enabled and reference.textInk or reference.disabledInk) or enabled and C.textDim or C.textMuted
end

local function eventCopyInk(text,id)
    local reference = layout.event.reference
    local function paint(pattern, colour)
        local hex = string.format('#%02X%02X%02X', colour.r, colour.g, colour.b)
        text = text:gsub(pattern, function(value,tail)
            return '<color=' .. hex .. '>' .. value .. '</color>' .. (tail or '')
        end)
    end
    if id=='nest' then
        local reward,cost=reference and reference.rewardInk or C.positive,reference and reference.costInk or C.dangerText
        paint('获得%s*[%d%.]+%s*金币。', reward)
        paint('(获得)(「)', reward)
        paint('受到%s*[%d%.]+%s*点普通伤害。', cost)
        return text
    end
    if not reference then return text end
    paint('支付%s*[%d%.]+%s*金币', reference.costInk)
    paint('失去%s*[%d%.]+%s*点生命', reference.costInk)
    paint('回复%s*[%d%.]+%s*点生命', reference.rewardInk)
    paint('获得%s*[%d%.]+%s*金币', reference.rewardInk)
    paint('从牌组移除一张卡牌', reference.rewardInk)
    return text
end

local function inlineOption(row,id)
    local text = inlineCopy(row)
    return row.enabled and eventCopyInk(text,id) or text
end

local function clamp(value,min,max)
    return math.max(min,math.min(value,max))
end

local function anchored(box, axis)
    return box['anchoredPosition'..axis] or box[axis:lower()] or 0
end

local function previewPosition(ctx,box)
    local width,height=ctx.self.canvasWidth or Theme.canvas.base[1],ctx.self.canvasHeight or Theme.canvas.base[2]
    local scale=Viewport.scale(width,height)
    return width/scale/2,height/scale/2,anchored(box.parent,'Y'),width,height
end

local function showEventCard(ctx,box,preview,instance)
    local halfWidth,halfHeight,roomY=previewPosition(ctx,box)
    local width,height=table.unpack(Theme.layout.card.size)
    -- LargeDialogOptionButton places the card on the right and raises it off
    -- the bottom. Clamp to the right edge of this project's wider option stack.
    local x=math.min(anchored(box,'X')+(box.sizeDeltaX or layout.event.options.size[1])/1.75,halfWidth-width/2-14)
    local y=clamp(anchored(box,'Y')+roomY,-halfHeight+height/2+5,halfHeight-height/2-5)
    preview:SetAnchoredPosition(x,y-roomY)
    ctx.fillCard(preview,instance.cardId,instance.upgraded,{instance=instance})
    preview:SetVisible(true)
end

local function relicPosition(ctx,box,preview,cursorY,followCursor)
    local halfWidth,halfHeight,roomY,width,height=previewPosition(ctx,box)
    if followCursor and ctx.options.cursorPosition then
        local x,y=ctx.options.cursorPosition()
        local _,currentY=Viewport.toStage(x,y,width,height)
        cursorY=currentY or cursorY
    end
    local tipWidth=Theme.layout.statusInfo.cardHoverWidth
    local tipHeight=preview.sizeDeltaY or 180
    -- The source tooltip's left edge is 470px at 1920px. Its top follows the
    -- cursor; raise the stack when its bottom would pass below the viewport.
    local x=-halfWidth+470*2/3+tipWidth/2
    local y=clamp((cursorY or anchored(box,'Y')+roomY)-tipHeight/2,-halfHeight+tipHeight/2+5,halfHeight-tipHeight/2-5)
    return x,y-roomY
end

local function relicPreview(ctx,box,preview,id)
    local previousX,previousY
    local function placeRelic(event,followCursor)
        local x,y=relicPosition(ctx,box,preview,event,followCursor)
        if x==previousX and y==previousY then return end
        preview:SetAnchoredPosition(x,y);previousX,previousY=x,y
    end
    return {
        show=function(event)
            preview:GetChild('name').text=ctx.relicName(id)
            preview:GetChild('description').text=ctx.relicText(id)
            placeRelic(event);preview:SetVisible(true)
        end,
        followCursor=function() placeRelic(nil,true) end,
        hide=function()preview:SetVisible(false);previousX,previousY=nil,nil end}
end

local function cardPreview(ctx,box,option)
    local cardId=option.previewCardId or option.cardId
    if not cardId or not ctx.card(cardId) then return end
    local preview=box.parent:GetChild('previewCard')
    if not preview then return end
    local instance=option.previewCard or (option.cardId and option or {cardId=cardId})
    return {show=function()showEventCard(ctx,box,preview,instance)end,
        hide=function()preview:SetVisible(false);ctx.clearPreviewCard(preview)end}
end

local function bindEventPreview(ctx,key,box,option)
    local card=cardPreview(ctx,box,option)
    local control=option.previewRelicId and box.parent:GetChild('previewRelic')
    local relic=control and relicPreview(ctx,box,control,option.previewRelicId)
    if not card and not relic then return end
    ctx.rewardDetail:setEvent(key,{
        visible=function()return box.parent.visible and box.visible end,
        show=function(y)
            if card then card.show() end
            if relic then relic.show(y) end
        end,
        hide=function()
            if card then card.hide() end
            if relic then relic.hide() end
        end,
        followCursor=relic and relic.followCursor})
end

-- The separators below belong specifically to abyss_neow.description's
-- current structured offer contract. Unknown formatting stays neutral and full.
local function neowOfferParts(offer, description)
    if offer.type == 'BOSS_RELIC' then return description:match('^(.-)，(.+)$') end
    if offer.drawback ~= 'NONE' then return description:match('^(.-)；(.+)$') end
    return '', description
end

local function coloured(text, colour)
    return '<color=' .. string.format('#%02X%02X%02X', colour.r, colour.g, colour.b) .. '>' .. text .. '</color>'
end

local function neowInlineOption(row)
    local token = NEOW.stsChoice
    local description = (row.description or ''):gsub('。$', '')
    if row.neowOffer then
        if not row.enabled then return '[ ' .. description .. ' ]' end
        local cost, reward = neowOfferParts(row.neowOffer, description)
        if not reward then return '[ ' .. description .. ' ]' end
        local penalty = cost ~= '' and coloured(cost, token.costInk) .. ' ' or ''
        return '[ ' .. penalty .. coloured(reward, token.rewardInk) .. ' ]'
    end
    local title = row.title:gsub('［', ''):gsub('］', '')
    if title == '继续' or title == '启程' or title == '跳过' then return '[ ' .. title .. ' ]' end
    return '[ ' .. title .. ' ' .. description .. ' ]'
end

local function neowOffer(info, choice)
    if info.id ~= 'neow' or not info.rewards then return nil end
    local index = tonumber(choice:match('^reward_(%d+)$'))
    return index and info.rewards[index] or nil
end

local function writeEventDescription(ctx,box,row,id,compact)
    local control=box:GetChild('description')
    control.text=not compact and row.enabled and id=='nest' and eventCopyInk(row.description,id) or row.description
    ctx.ink(control,descriptionInk(row.enabled))
end

local function writeOption(ctx, box, row, id)
    local line = box:GetChild('stsNeowText')
    if line then
        local active = id == 'neow'
        line:SetVisible(active);box:GetChild('title'):SetVisible(not active)
        if active then
            line.text = neowInlineOption(row)
            ctx.ink(line, row.enabled and NEOW.stsChoice.ink or NEOW.stsChoice.disabledInk)
            box:GetChild('description'):SetVisible(false)
            return
        end
    end
    local compact = layout.event.reference and id ~= 'neow'
    box:GetChild('title').text = compact and inlineOption(row,id) or row.title
    ctx.ink(box:GetChild('title'), compact and descriptionInk(row.enabled) or row.enabled and C.goldBright or C.textMuted)
    writeEventDescription(ctx,box,row,id,compact)
end

-- Every owner of the reused event controls restores the same layout and ink.
-- Neow changes visibility, geometry and text controls, not only their content.
function M.renderChoices(ctx,event,id,rows)
    renderEventLayout(event,id,ctx.options)
    if eventArt then renderEventArt(ctx, event, id) end
    ctx.ink(event:GetChild('body'),id=='neow' and C.panelSunken or C.text)
    if NEOW then placeOptions(event,id=='neow',rows,ctx.options.mobileRunHud) end
    for i=1,OPTIONS do
        local row,box=rows[i],event:GetChild('option'..i)
        ctx.show(box,row)
        if row then ctx.state(box,row.enabled);writeOption(ctx,box,row,id) end
    end
end

-- Installs the events responsibility on one node UI instance.
function M.install(ctx)
    function ctx.renderEvent(view, node, result)
        local event = ctx.child("eventView")
        local id = node.event and node.event.id or (result and result.eventId)
        local copy = events[id] or { name = kinds.event, body = "", leave = "你离开了。" }
        local function writeEventHeading()
            event:GetChild("name").text = copy.name
            local mode=ctx.self.run.unknown and ctx.self.run.unknown.pools and ctx.self.run.unknown.pools.mode or ctx.self.run.data.rules.events.poolMode
            event:GetChild("caption").text = (stagedEvent(id) or Act3Events.ids[id]) and kinds.event or mode=='restricted-seven' and "未知事件 · 受限事件池（7种）"
                or mode=='restricted-six' and "未知事件 · 受限事件池（6种）" or kinds.event
        end
        writeEventHeading()
        renderEventLayout(event,id,ctx.options)
        renderEventArt(ctx, event, id)
        local body
        local function eventOutcomeBody()
            body=result and result.text or node.event and node.event.body or copy.body
            if not result and node.event and node.event.stage=='result' and node.event.obtainedRelicId then
                body=body..'\n获得遗物：'..ctx.relicName(node.event.obtainedRelicId)..'。'
            end
            if not result and node.event.stage=='relic_reward' and node.event.relicOffer then
                body=body..'\n可领取遗物：'..ctx.relicName(node.event.relicOffer.id)..'。'
            end
            local function describeTransformedCard()
                if not result and id=='transmogrifier' and node.event.obtainedCardUid then
                    local obtained=find(ctx.self.run.deck,node.event.obtainedCardUid,'uid')
                    body=body..'\n已变换为：'..ctx.cardName(obtained.cardId,obtained.upgraded)..'。'
                end
            end
            describeTransformedCard()

        end
        eventOutcomeBody()
        event:GetChild("body").text = body
        ctx.ink(event:GetChild("body"), id == 'neow' and C.panelSunken or C.text)
        local rows = {}
        local function buildEventRows()
            if not result then
                local info, gold, deckOk = node.event, ctx.self.run.gold, #node.purgeCards > 0
                local function need(cost) return "金币不足（需要 " .. cost .. "，现有 " .. gold .. "）" end
                local function purify(_cost)
                    return function()
                        ctx.self.mode, ctx.self.picker, ctx.self.pickPage, ctx.self.selected, ctx.self.notice = "picker", "purify", 1, nil, ""
                        ctx.self:render() return true
                    end
                end
                if id ~= 'cleric' and id ~= 'purifier' then
                    local function buildEventOptions()
                        for _,option in ipairs(info.options) do
                            local selected=option
                            rows[#rows+1]={title='［'..(selected.rewardCard and ctx.cardName(selected.cardId,selected.upgraded)or selected.title)..'］',
                                description=optionDescription(ctx,selected),option=selected,
                                neowOffer=neowOffer(info,selected.choice),enabled=selected.enabled,handler=function()
                                    -- Repeated-search events retain the same command after
                                    -- rendering new odds. An old callback is still stale.
                                    if ctx.self.view~=view or ctx.self.renderRun~=ctx.self.run or ctx.self.renderMap~=ctx.self.map then return false,'stale_action' end
                                    if Act1Events.ids[id] or (stagedEvent(id) or Act3Events.ids[id]) then
                                        return ctx.commit('chooseEvent',selected.choice,function()
                                            local outcome=ctx.self.run.nodeFlow.event
                                            local text=outcome.body or '请选择一张卡牌。'
                                            -- These state machines already keep their result
                                            -- screen until Leave; completion needs no extra hold.
                                            return text
                                        end)
                                    end
                                    if id=='living_wall' then
                                        return ctx.commit('chooseEvent',selected.choice,function()
                                            local outcome=ctx.self.run.nodeFlow.event
                                            if outcome.stage=='choose_card' then
                                                ctx.self.mode,ctx.self.picker,ctx.self.pickPage,ctx.self.selected='picker','living_'..selected.choice,1,nil
                                                return '请选择一张卡牌'
                                            end
                                            local text='没有符合条件的卡牌。墙上的面孔渐渐沉寂。'
                                            return text,{text=text}
                                        end)
                                    end
                                    if selected.picker then
                                        ctx.self.mode,ctx.self.picker,ctx.self.pickPage,ctx.self.selected,ctx.self.notice='picker',
                                        selected.picker=='event_upgrade' and 'upgrade' or selected.picker,1,nil,''
                                        ctx.self:render();return true
                                    end
                                    return ctx.commit('chooseEvent',selected.choice,function(before)
                                        local outcome=ctx.self.run.nodeFlow.event
                                        -- 只列出实际变化的资源，未变化的生命/金币不显示
                                        local lines,changes={},{}
                                        if ctx.self.run.hp~=before.hp then changes[#changes+1]='生命 '..number(before.hp)..' → '..number(ctx.self.run.hp) end
                                        if ctx.self.run.gold~=before.gold then changes[#changes+1]='金币 '..number(before.gold)..' → '..number(ctx.self.run.gold) end
                                        if #changes>0 then lines[1]=table.concat(changes,'；') end
                                        if outcome.upgradedUids and #outcome.upgradedUids>0 then
                                            local names={}
                                            for _,uid in ipairs(outcome.upgradedUids) do
                                                local card=find(ctx.self.run.deck,uid,'uid');names[#names+1]=ctx.cardName(card.cardId,true,card.upgrades)
                                            end
                                            lines[#lines+1]='已升级：'..table.concat(names,'、')
                                        end
                                        if outcome.obtainedCardUid then
                                            local obtained=find(ctx.self.run.deck,outcome.obtainedCardUid,'uid')
                                            lines[#lines+1]='已获得诅咒：'..ctx.cardName(obtained.cardId,false)
                                        end
                                        if outcome.removedUids then
                                            lines[#lines+1]='已移除诅咒：'..#outcome.removedUids..' 张'
                                        end
                                        local text=#lines>0 and table.concat(lines,'\n') or '什么也没有发生。'
                                        return text,{text=text}
                                    end)
                                end}
                        end
                    end
                    buildEventOptions()

                elseif id == "cleric" then
                    local function buildClericOptions()
                        local healOk = gold >= info.healCost
                        rows[1] = { title = "［治疗］", enabled = healOk, handler = function()
                                return ctx.commit("chooseEvent", "heal", function(before)
                                    local healed = ctx.self.run.hp - before.hp
                                    return "治疗完成 · 回复 " .. number(healed) .. " 点生命", { text = "圣职者的祝祷落在你身上，伤口渐渐愈合。\n支付 " ..
                                        number(before.gold - ctx.self.run.gold) .. " 金币，回复 " .. number(healed) .. " 点生命（生命 " .. number(before.hp) .. " → " .. number(ctx.self.run.hp) .. "）。" }
                                end)
                            end,
                            description = not healOk and need(info.healCost) or (info.heal > 0 and
                            ("支付 " .. number(info.healCost) .. " 金币，回复 " .. number(info.heal) .. " 点生命（生命 " .. number(ctx.self.run.hp) .. " → " .. number(ctx.self.run.hp + info.heal) .. "）")
                                or ("支付 " .. info.healCost .. " 金币；生命已满，不会回复")) }
                        local purifyOk = gold >= info.removeCost and deckOk
                        rows[2] = { title = "［净化］", enabled = purifyOk, handler = purify(info.removeCost),
                            description = gold < info.removeCost and need(info.removeCost) or
                            (deckOk and ("支付 " .. info.removeCost .. " 金币，从牌组移除一张卡牌") or "没有可移除的卡牌") }
                    end
                    buildClericOptions()

                else
                    rows[1] = { title = "［祈祷］", enabled = deckOk, handler = purify(info.removeCost),
                        description = deckOk and (info.removeCost > 0 and ("支付 " .. info.removeCost .. " 金币，从牌组移除一张卡牌")
                            or "免费从牌组移除一张卡牌") or "没有可移除的卡牌" }
                end
                if id=='cleric' or id=='purifier' then rows[#rows + 1] = { title = "［离开］", enabled = true, description = "什么也不会发生。", handler = function()
                            return ctx.commit("chooseEvent", "leave", function() return "已离开" .. copy.name, { text = copy.leave } end)
                        end } end
            end
        end
        buildEventRows()
        if NEOW then placeOptions(event, id == 'neow', rows, ctx.options.mobileRunHud) end
        for i = 1, OPTIONS do
            local row, box = rows[i], event:GetChild("option" .. i)
            ctx.show(box, row)
            if row then
                ctx.state(box, row.enabled)
                writeOption(ctx, box, row, id)
                local key="eventView/option" .. i
                ctx.action(key, row.enabled, row.handler, row.description)
                if row.option then bindEventPreview(ctx,key,box,row.option) end
            end
        end
        return eventNotice(id, copy, result)
    end

    function ctx.bindStagedEventActions(node)
        if node and node.type=='event' and stagedEvent(node.event.id) then
            for key, entry in pairs(ctx.self.actions) do
                if key=='confirm' or key=='back' or key:match('^eventView/') or key:match('^pickerView/') then
                    ctx.bindAct2Action(key,entry)
                end
            end
        end
    end
end
return M
