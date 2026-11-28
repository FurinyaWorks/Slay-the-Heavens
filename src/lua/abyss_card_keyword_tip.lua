local Theme = require('abyss_theme')
local CardDisplay = require('abyss_card_display')
local P = Theme.layout.powerTips
local sourceScale = Theme.canvas.base[1] / 1920
local title = string.format('<color=#%02X%02X%02X>', P.title.r, P.title.g, P.title.b)
local M = {}

local function stagePosition(box, root)
    local x,y = 0,0
    while box and box~=root do
        x = x*(box.localScaleX or 1)+(box.anchoredPositionX or box.x or 0)
        y = y*(box.localScaleY or 1)+(box.anchoredPositionY or box.y or 0)
        box = box.parent
    end
    return x,y
end

function M.paint(panel,box,root,rows,floor)
    local parts = {}
    for i,row in ipairs(rows) do parts[i] = title..row.name..'</color>\n'..row.body end
    local text = table.concat(parts,'\n')
    local x,y = stagePosition(box,root)
    local baseW,baseH = table.unpack(Theme.canvas.base)
    local stage = root.parent
    local canvasW = math.max(baseW,stage and stage.sizeDeltaX or 0)
    local canvasH = math.max(baseH,stage and stage.sizeDeltaY or 0)
    local left,right = -canvasW/2+Theme.canvas.safe.x,canvasW/2-Theme.canvas.safe.x
    local top = canvasH/2-Theme.canvas.safe.y
    floor = math.max(floor or -canvasH/2,-canvasH/2+Theme.canvas.safe.y)
    local width,line = P.width,Theme.layout.nativeText.lineHeight
    local textWidth = width-2*P.padding
    local room = top-floor-2*P.padding
    -- Native text boxes reserve horizontal space and a font-relative inset
    -- beyond the measured lines. Keep the final body line inside that inset.
    local textInset = math.ceil(P.font/4+4)
    local font,fits,measured = CardDisplay.fit(text,P.font,textWidth-4,room-textInset,1.3)
    local height = fits and math.max(line,math.ceil(measured)+textInset) or room
    local total = height+2*P.padding
    local offset = (150+12)*sourceScale
    local desiredLeft = x>canvasW/4 and x-offset-width or x+offset
    local desiredTop = y+(210-32)*sourceScale
    if #rows>=4 then desiredTop = desiredTop+(#rows-1)*62*sourceScale end
    panel:SetAnchoredPosition(math.max(left,math.min(right-width,desiredLeft))+width/2,
        math.max(floor+total,math.min(top,desiredTop))-total/2)
    panel:SetSizeDelta(width,total)
    panel:GetChild('border'):SetSizeDelta(width,total)
    panel:GetChild('plate'):SetSizeDelta(width-2,total-2)
    local copy = panel:GetChild('copy')
    copy:SetSizeDelta(textWidth,height)
    copy.fontSize,copy.minimumFontSize,copy.text = font,font,text
    panel:SetVisible(true)
end

return M
