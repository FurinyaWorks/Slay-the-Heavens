local M = {}

function M.paint(chrome, palette, color)
    if not color then return end
    for index, name in ipairs({'rim', 'cloth'}) do
        local token = palette[index]
        local ink = color(token.r, token.g, token.b, token.a)
        for _, part in ipairs(chrome:GetChild(name):GetChildren()) do
            part.imageColor = ink
        end
    end
end

return M
