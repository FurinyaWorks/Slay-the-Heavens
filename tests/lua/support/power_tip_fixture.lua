-- Read visible copy from the actual compact native controls.
local Theme = require('abyss_theme')
return function(panel)
    local info = panel:GetChild('statusInfo')
    local tips = info:GetChild('powerTips')
    assert(info.visible and tips.visible and not info:GetChild('plate').visible, 'expected compact reader')
    local rows = {}
    for i = 1, Theme.layout.powerTips.rows do
        local tip = tips:GetChild('tip' .. i)
        if tip.visible then rows[#rows + 1] = tip:GetChild('copy').text end
    end
    return table.concat(rows, '\n'), rows
end
