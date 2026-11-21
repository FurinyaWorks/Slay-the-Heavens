-- The native Grid scrolls the list. A trailing click may still carry drag
-- metadata even when the host did not send a press to the card itself.
local M = {}
function M.dragged(event, threshold)
    if not event then return false end
    if event.dragging then return true end
    if not event.GetPressUIPos or not event.GetUIPos then return false end
    local x, y = event:GetUIPos()
    local startX, startY = event:GetPressUIPos()
    if type(x) ~= 'number' or type(y) ~= 'number' or type(startX) ~= 'number' or type(startY) ~= 'number' then
        return false
    end
    return (x - startX)^2 + (y - startY)^2 >= threshold^2
end
return M
