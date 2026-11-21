-- Read back the live control writes of the project's approved native background.
local F = dofile('tests/lua/support/game_ui_fixture.lua')
local V = dofile('scripts/official-assets-preview.lua')
local Asset = require('abyss_traveler_portrait_assets')
local api = { image = 41, group = 73, half = 84 }
Asset.imagePrefabId, Asset.containerPrefabId, Asset.selectionHalfImagePrefabId = api.image, api.group, api.half
local function color(r, g, b, a) return {r = r, g = g, b = b, a = a} end
Enum = {ImageSource = {StaticReference = 'static'}, ImageFillHorizontalType = {Right = 'right'}}
Color = {FromRGBA = color}

local children, count, serial = {}, 0, 0
local function activate(control, value)
    control.active = value
    F.setEngineActive(control, value)
end
game = {
    InstantiateClientUIControl = function(index, parent)
        assert(index == api.image or index == api.half or index == api.group)
        serial = serial + 1
        local kind = index == api.group and 'container' or 'image'
        local control = F.control({name = 'facet' .. serial, kind = kind, size = {0, 0}}, parent)
        control.SetActive = activate
        control.SetFillUnused = function(c) c.fill = nil end
        control.SetFillHorizontal = function(c, side, amount)
            c.fill = {shape = 'horizontal', from = side, amount = amount}
        end
        children[parent] = children[parent] or {}
        children[parent][#children[parent] + 1] = control
        return control
    end,
    DestroyClientUIControl = function() error('unexpected portrait rollback during capture') end,
}
local root = F.Viewport.apply(F.control({children = F.Layout}), 1280, 720)
local panel = root:GetChild('characterPanel')
local selection = panel:GetChild('lumineSelectionBackground')
for _, control in ipairs({selection, panel:GetChild('traveler'):GetChild('officialAvatar')}) do
    control.SetActive = activate
    activate(control, true)
end
local portraits = require('abyss_traveler_portraits').new(root, nil, {selectionAvatar = true})
local ui
ui = F.GameUI.new(root, F.Data, F.Presentation, 'click', {
    prologue=true, presentationReady=function(intent)
        local info=ui.characterSelection.info
        return portraits:readyForPage(ui.mode,ui.characterOpen,info and info.id,intent.page)
    end,
    seed = 42, characterProfile = 'production', imageSource = 'static', color = color, portraits = portraits,
})
root.ui = ui
local Gate=require('abyss_page_reveal')
local function tick(dt)
    ui:update(dt)
    if ui.pageReveal:step(Gate.intent(ui),dt)then ui:refresh()end
    ui.pageReveal:paint(true)
end
local function settle()
    for _=1,500 do tick(.02);if not ui.pageReveal:covered()then return end end
    error('capture publication did not settle')
end
settle()
assert(F.click(root, 'menuPanel', 'start'));settle()
assert(not ui.characterSelection.info)
V.capture('empty',ui,root,'Current production Host, no selected character; offline projection')
assert(ui:selectCharacter('traveler') and ui:selectElement('ironclad'))
for _ = 1, 500 do
    tick(0.02)
    if portraits:status().selection.phase == 'ready' then break end
end
settle()
local status = portraits:status().selection
assert(status.phase == 'ready' and status.total == 1600 and selection.visible, status.reason)
local details = panel:GetChild('details')
assert(not details:GetChild('deckOpen'), 'unexpected starter deck hit area')
local relic = assert(details:GetChild('v25RelicIcon'))
assert(relic.visible and #relic:GetChildren() == 6, 'starter crystal facets did not mount')
assert(details:GetChild('relic').text == '岩脉残晶')

local function export(control)
    assert(control.visible and control.activeInHierarchy)
    local result = {
        name = control.name, kind = control.kind, visible = true, image = control.imageId,
        position = {control.x, control.y}, size = {control.sizeDeltaX, control.sizeDeltaY}, scale = control.scale,
        native = {rotation = control.rotation, pivot = control.pivot,
            anchor = {min = control.anchorMin, max = control.anchorMax}, fill = control.fill},
    }
    if control.kind == 'image' then
        count = count + 1
        local ink = control.imageColor
        result.colour = string.format('#%02X%02X%02X%02X', ink.r, ink.g, ink.b, ink.a)
    end
    if children[control] then
        result.children = {}
        for _, child in ipairs(children[control]) do result.children[#result.children + 1] = export(child) end
    end
    return result
end
local function named(node, name)
    for _, child in ipairs(node.children) do if child.name == name then return child end end
    error('unknown capture node ' .. name)
end
V.capture('selection', ui, root, 'Live official selection UI with approved native background; 1600 image controls')
local snapshot = named(named(V.scenes[#V.scenes].tree, 'characterPanel'), 'lumineSelectionBackground')
snapshot.children = {}
for _, child in ipairs(assert(children[selection])) do snapshot.children[#snapshot.children + 1] = export(child) end
assert(count == 1600)
assert(ui:confirmCharacter())
tick(.15)
assert(ui.pageReveal:covered() and ui.pageReveal.alpha>0 and ui.pageReveal.alpha<1 and not ui.run)
V.capture('fade-half',ui,root,'Real departure gate before full opacity; no Run has been created')
local fadeSnapshot=named(named(V.scenes[#V.scenes].tree,'characterPanel'),'lumineSelectionBackground')
fadeSnapshot.children={}
for _,child in ipairs(assert(children[selection]))do fadeSnapshot.children[#fadeSnapshot.children+1]=export(child)end
print('V2_SELECTION_EVIDENCE_PASS ' .. count)
V.print()
