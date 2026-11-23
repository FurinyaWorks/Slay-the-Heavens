-- Source Strike membership is independent of any localized card name.
local M={}

local function hasStrike(tags)
    for _,tag in ipairs(tags or {}) do
        if tag=='STRIKE' then return true end
    end
    return false
end

function M.matches(definition,upgraded)
    local upgrade=upgraded and definition.upgrade or {}
    local flag=upgrade.strikeTag
    if flag==nil then flag=definition.strikeTag end
    return flag==true or hasStrike(upgrade.sourceTags or definition.sourceTags)
        or hasStrike(upgrade.tags or definition.tags)
end

return M
