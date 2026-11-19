-- EXPERIMENT_CONFIG is supplied in the generated simulator or GIA script.
local elapsed, phase = 0, 0
local left, right, first, effects

local function dynamic()
    local root = script.object
    local completed = 0
    for i = 1, EXPERIMENT_CONFIG.copies do
        local ok, result = pcall(game.InstantiateClientUIControl, EXPERIMENT_CONFIG.template, root)
        if not ok or not result then
            print('COOP_LAB api_error attempt=' .. i .. ' created=' .. completed .. ' error=' .. tostring(result))
            return
        end
        completed = completed + 1
        result:SetAnchoredPosition(math.floor((i - 1) / 20) * 380, -((i - 1) % 20) * 24)
    end
    print('COOP_LAB dynamic created=' .. completed)
end

function OnStart()
    if EXPERIMENT_CONFIG.copies then dynamic(); return end
    local instances = {}
    for _, name in ipairs({'local','partner','enemies','hand','hud','effects'}) do
        instances[name] = assert(game.InstantiateClientUIControl(
            EXPERIMENT_CONFIG.bindings[name], script.object), 'missing template ' .. name)
    end
    left, right = instances['local'], instances.partner
    for _, actor in ipairs({left, right}) do
        for _, mask in ipairs(EXPERIMENT_CONFIG.masks) do
            local image = assert(actor:GetChild(mask[1]):GetChild(mask[2]))
            assert(image:SetFillHorizontal(Enum.ImageFillHorizontalType.Right, .5) ~= false)
        end
    end
    first = instances.hand:GetChild('card0')
    effects = instances.effects
    effects:SetVisible(false)
    script:EnableUpdate(true)
    print('COOP_LAB ready view=' .. EXPERIMENT_CONFIG.view)
end

function OnUpdate(dt)
    if not effects then return end
    elapsed = elapsed + dt
    local nextPhase = math.floor(elapsed) % 6
    if phase == nextPhase then return end
    phase = nextPhase
    left:SetAnchoredPosition(phase == 1 and -409 or -435, 15)
    right:SetAnchoredPosition(phase == 1 and -244 or -232, 15)
    first:SetVisible(phase ~= 2)
    first:SetAnchoredPosition(-504, phase == 3 and -211 or -246)
    effects:SetVisible(phase == 4)
    script.object:SetVisible(phase ~= 5)
    print('COOP_LAB phase=' .. phase)
end
