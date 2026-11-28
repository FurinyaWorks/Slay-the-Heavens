local Theme = require("abyss_theme")
local M = {}
local baseWidth, baseHeight = table.unpack(Theme.canvas.base)

function M.scale(width, height)
    return math.min(width / baseWidth, height / baseHeight)
end

function M.measure(width, height, mobile)
    assert(type(width) == "number" and width > 0 and width < math.huge, "invalid canvas width")
    assert(type(height) == "number" and height > 0 and height < math.huge, "invalid canvas height")
    local scale = M.scale(width, height)
    local w, h = width / scale, height / scale
    -- DIAG-12 measured paint outside the mobile logical canvas. Keep that
    -- allowance on visual covers only; the touchable rectangle comes from the API.
    local bleed = mobile and width / height >= baseWidth / baseHeight - 1e-6 and Theme.canvas.mobileBleedX or 0
    return { scale = scale, input = {0, 0, w, h}, visual = {0, 0, w + bleed / scale, h} }
end

local function finite(n)
    return type(n) == "number" and n == n and math.abs(n) < math.huge
end

-- Native pointer events are in lower-left canvas units. Stage positions
-- use the same fit scale and a centred origin. A missing axis remains unset.
function M.toStage(x, y, width, height)
    local validX, validY = finite(x), finite(y)
    local invalid = type(x) == "number" and not validX or type(y) == "number" and not validY
    local scale = M.scale(width, height)
    return validX and (x - width / 2) / scale or nil, validY and (y - height / 2) / scale or nil, invalid
end

local cardWidth, cardHeight = table.unpack(Theme.layout.card.size)
local hand = Theme.layout.hand

function M.handSpacing(count, extraWidth)
    if count <= 1 then return 0 end
    -- The side controls keep the remaining space as they move to the edges.
    local width = hand.maxWidth + math.max(0, extraWidth or 0) / 2
    return math.max(hand.spacingMin, math.min(hand.spacingMax, (width - cardWidth) / (count - 1)))
end

function M.handSlot(count, index, extraWidth)
    local spacing = M.handSpacing(count, extraWidth)
    local distance = index - (count - 1) / 2
    local angle = -distance * hand.arcDegrees
    local radians = math.abs(angle) * math.pi / 180
    local halfHeight = (cardHeight * math.cos(radians) + cardWidth * math.sin(radians)) / 2
    local floor = -baseHeight / 2 + Theme.canvas.safe.y + halfHeight - (hand.overhang or 0)
    return distance * spacing, math.max(floor, hand.y - math.abs(distance) * hand.arcDrop), angle, spacing
end

function M.handFocus(baseY)
    local floor = -baseHeight / 2 + Theme.canvas.safe.y + cardHeight * Theme.motion.hoverScale / 2
    return math.max(baseY + Theme.motion.hoverLift, floor)
end

function M.handHit(y, angle, scale, target)
    local radians = target.restAngle * math.pi / 180
    local c,s = math.abs(math.cos(radians)),math.abs(math.sin(radians))
    local restH = (cardHeight*c+cardWidth*s)/2
    local low,high = target.baseY-restH,target.baseY+restH
    local hotScale = Theme.motion.hoverScale
    -- Only the focused card owns its expanded vertical lane in the grounded
    -- profile. An idle card's transparent receiver must leave powers reachable.
    if target.hot or not hand.restHitOnly then
        local hotY,hotH = M.handFocus(target.baseY),cardHeight*hotScale/2
        low,high = math.min(low,hotY-hotH),math.max(high,hotY+hotH)
    end
    local dy,a = (low+high)/2-y,angle*math.pi/180
    -- Adjacent hand centres retain disjoint horizontal input lanes.
    local width = math.max(cardWidth*c+cardHeight*s,cardWidth*hotScale)
    return math.sin(a)*dy/scale,math.cos(a)*dy/scale,
        math.min(width,target.hitWidth or width)/scale,(high-low)/scale
end

-- Keep the authored launch/landing offset inside each icon at 16:9. The
-- generated native anchors determine how both the icon and its motion move.
function M.pileLayout(panel)
    local layout = Theme.layout
    local origin = {
        draw = layout.drawPile.position,
        discard = layout.discardPile.position,
        exhaust = {layout.topBar.exhaustIcon[1], layout.topBar.y},
    }
    local holder = panel and panel.anchorMinX == 0 and panel.anchorMaxX == 1 and panel.parent
    local anchors = {}
    if holder then
        for pile in pairs(origin) do
            local icon = panel:GetChild(pile .. "Icon")
            anchors[pile] = icon and icon.anchorMinX
        end
    end
    local function extraWidth()
        if not holder then return 0 end
        return (holder.sizeDeltaX or baseWidth) + (panel.sizeDeltaX or 0) - baseWidth
    end
    local function point(pile, extra)
        local base = origin[pile]
        if base then return base[1] + ((anchors[pile] or .5) - .5) * extra, base[2] end
    end
    return { extraWidth = extraWidth, point = point }
end

function M.apply(root, width, height, mobile)
    local frame = M.measure(width, height, mobile)
    local stage = assert(root:GetChild("stage"), "missing stage")
    assert(root:GetChild("canvasBackdrop"), "missing canvas backdrop")
    stage:SetLocalScale(frame.scale, frame.scale, 1)
    stage:SetSizeDelta(frame.input[3], frame.input[4])
    return stage, frame.scale, frame
end
return M
