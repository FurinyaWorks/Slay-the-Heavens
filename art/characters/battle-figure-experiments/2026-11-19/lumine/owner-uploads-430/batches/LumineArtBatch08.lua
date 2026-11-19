-- Lumine_Battle_Fit_744：图片与文本 Lua 绘制脚本
-- 挂到专用空客户端容器，OnStart 绘制；模板设为仅存为模板。
local IMAGE_PREFAB_ID = 0 -- 图片控件模板索引ID；无图片且未启用蒙版/羽化时无需填写
local BASE_SCALE = 1
local OFFSET_X = 0
local OFFSET_Y = 0
local ROOT = {0,0,133.0,133.0,0.5,0.5,0.5,0.5,0.5,0.5,1,1,0}
local ELEMENTS = {
    {100003,-0.9241999983787537,49.445499420166016,2.922600030899048,1.8865000009536743,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,-142.23880004882812,217,218,235,255},
    {100003,-1.9639999866485596,50.60070037841797,2.8108999729156494,1.6229000091552734,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,34.71500015258789,217,218,235,255},
    {100003,-4.621099948883057,48.52130126953125,3.696899890899658,1.0,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,120.0,243,229,232,255},
    {100003,-4.216700077056885,50.427398681640625,3.0652999877929688,1.0333000421524048,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,33.98780059814453,243,229,232,255},
    {100003,-3.4658000469207764,49.67649841308594,2.794600009918213,2.772599935531616,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,-41.40959930419922,243,229,232,255},
    {100003,-3.696899890899658,51.17839813232422,2.40120005607605,1.6979000568389893,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,-105.79319763183594,243,230,232,255},
    {100003,-5.314199924468994,50.8317985534668,2.9828999042510986,1.8265999555587769,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,129.23150634765625,243,230,232,255},
    {100003,-4.505499839782715,51.987098693847656,2.8297998905181885,2.000999927520752,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,-54.735599517822266,243,230,232,255},
    {100003,-3.5813000202178955,51.467201232910156,1.6338000297546387,1.0,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,135.0,244,197,109,255},
    {100003,-3.1191999912261963,51.81380081176758,1.0,1.6008000373840332,0.5,0.5,0.5,0.5,0.5,0.5,1.0,1.0,-163.22129821777344,244,197,109,255},
}
-- X/Y rotation degrees; one pair per image row.
local ROTATIONS = {{39.23152048359225,0.0},{30.0,0.0},{54.735610317245346,0.0},{47.607954285227066,0.0},{0.0,28.125505702055705},{0.0,45.0},{0.0,60.66612574879713},{0.0,55.550098012046504},{0.0,36.86989764584402},{33.98784358147893,0.0}}

local created = {}
local function Clear()
    for i = #created, 1, -1 do
        game.DestroyClientUIControl(created[i])
    end
    created = {}
end

function OnStart()
    Clear()
    if type(IMAGE_PREFAB_ID) ~= "number" or IMAGE_PREFAB_ID <= 0 or IMAGE_PREFAB_ID % 1 ~= 0 then
        printerr("[图片绘制] 请填写 IMAGE_PREFAB_ID：客户端图片控件模板索引ID")
        return
    end
    local parent = script.object
    if parent == nil then return end
    parent:SetAnchorMin(0.5, 0.5)
    parent:SetAnchorMax(0.5, 0.5)
    parent:SetPivot(ROOT[5], ROOT[6])
    parent:SetSizeDelta(ROOT[3], ROOT[4])
    parent:SetLocalScale(ROOT[11] * BASE_SCALE, ROOT[12] * BASE_SCALE, 1)
    parent:SetLocalRotation(0, 0, ROOT[13])
    parent:SetAnchoredPosition(OFFSET_X, OFFSET_Y)
    local ok, err = pcall(function()
        for index, item in ipairs(ELEMENTS) do
            local image = game.InstantiateClientUIControl(IMAGE_PREFAB_ID, parent)
            if image == nil then error("图片模板无法实例化，请确认已设为仅存为模板") end
            table.insert(created, image)
            image:SetImage(Enum.ImageSource.StaticReference, item[1])
            -- imageType 仅部分图片支持，保留不支持该属性的静态图片。
            pcall(function() image.imageType = Enum.ImageType.Stretch end)
            image:SetAnchorMin(item[8], item[9])
            image:SetAnchorMax(item[10], item[11])
            image:SetPivot(item[6], item[7])
            image:SetSizeDelta(item[4], item[5])
            image:SetLocalScale(item[12], item[13], 1)
            image:SetLocalRotation(ROTATIONS[index][1], ROTATIONS[index][2], item[14])
            image:SetAnchoredPosition(item[2], item[3])
            image.imageColor = Color.FromRGBA(item[15], item[16], item[17], item[18])
            image:SetAsLastSibling()
        end
    end)
    if not ok then
        Clear()
        printerr("[图片绘制] " .. tostring(err))
    end
end

function OnDestroy()
    Clear()
end
