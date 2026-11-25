-- The real startup and portrait owners run against native engine doubles.
local F = dofile('tests/lua/support/game_ui_fixture.lua')
local GameUI = require('abyss_game_ui')
local canvas = F.control({children=F.Layout})
local stage = assert(canvas:GetChild('stage'))
local function bindActive(panel)
    panel.active = true
    function panel:SetActive(active)
        self.active = active
        F.setEngineActive(self, active)
    end
    return panel
end
for _, name in ipairs({'nodePanel', 'choicePanel'}) do
    bindActive(stage:GetChild(name))
end
local character = stage:GetChild('characterPanel')
local selection = character:GetChild('lumineSelectionBackground')
bindActive(selection:GetChild('figure') or selection)
bindActive(character:GetChild('traveler'):GetChild('officialAvatar'))

local host, platform
local new = GameUI.new
GameUI.new = function(...)
    platform = select(5, ...)
    host = new(...)
    return host
end

local actors = F.monsterActors()
package.loaded.abyss_monster_actor_binding = {enabled=true, templateIndex=actors.templateIndex,
    containerTemplateIndex=actors.containerTemplateIndex, powerTemplateIndex=actors.powerTemplateIndex}
local portraits = require('abyss_traveler_portrait_assets')
local image, group, half = portraits.imagePrefabId, portraits.containerPrefabId, portraits.selectionHalfImagePrefabId
assert(image > 0 and group > 0 and half > 0, 'formal portrait templates must be bound')

script = {object=canvas, GetParam=function() return false end,
    EnableUpdate=function(self, active) self.updating=active end}
Enum = {ImageSource={StaticReference='static'}, ImageType={Stretch='stretch'},
    ImageFillHorizontalType={Right='right'}, CursorEventType={CursorClick='click'},
    Device={Mobile='mobile', MobileController='mobileController'}}
Color = setmetatable({FromRGBA=function(...) return {...} end}, {
    __call=function(_, r, g, b, a) return {r=r,g=g,b=b,a=a} end,
})

local stageBeforeInput, offscreen = true, {}
game = {
    IsTestPlay=function() return false end,
    GetUICanvasSize=function() return ABYSS_STARTUP_WIDTH, 720 end,
    GetDevice=function() return ABYSS_STARTUP_DEVICE end,
    GetCursorUIPos=function() return 0, 0 end,
    InstantiateClientUIControl=function(index, parent)
        local owner = parent
        while owner and owner.parent ~= stage do owner = owner.parent end
        if stageBeforeInput and (not owner or owner.name ~= 'menuPanel') then
            offscreen[#offscreen+1] = owner and owner.name or '<unowned>'
        end
        if index == image or index == group or index == half then
            local control = bindActive(F.control({name='portrait',kind=index==group and 'container' or 'image'}, parent))
            if control.kind == 'image' then
                function control:SetFillUnused() self.fill = nil end
                function control:SetFillHorizontal(side, amount)
                    assert(side == Enum.ImageFillHorizontalType.Right and amount == .5)
                    self.fill = {side, amount}
                end
            end
            return control
        end
        return actors.instantiate(index, parent)
    end,
    DestroyClientUIControl=actors.destroy,
}

assert(loadfile(ABYSS_STARTUP_SOURCE or 'src/lua/abyss_ui.lua'))()
OnStart()
GameUI.new = new
assert(host and script.updating, 'FORMAL_BOOT_NO_SCHEDULER')
assert(platform.portraits and platform.nativePageLifecycle, 'formal profile fell back')
local function ready(maxFrames)
    local frames = 0
    while (host.pageReveal:covered() or host.starting or host.prologue and host.prologue:covering())
        and script.updating and frames < maxFrames do
        frames = frames + 1
        OnUpdate(1/60)
    end
    assert(script.updating and not host.disabled and not host.pageReveal:covered()
        and not host.starting and not (host.prologue and host.prologue:covering()), 'FORMAL_BOOT_NO_READY')
    return frames
end

local turns = ready(60)
assert(host.mode == 'menu' and not host.run and stage:GetChild('menuPanel').visible, 'wrong first playable page')
assert(not stage:GetChild('nodePanel').activeInHierarchy and not stage:GetChild('choicePanel').activeInHierarchy,
    'cold menu activated hidden Run pages')
assert(#offscreen == 0, 'FORMAL_BOOT_OFFSCREEN: ' .. table.concat(offscreen, ', '))
local function verifyDeferredMonsterArt()
    local art = assert(package.loaded.abyss_monster_art_data, 'formal monster catalogue must be loaded')
    assert(art.status == 'refined-release' and next(art.assets), 'formal monster catalogue missing')
    local decoded, available = 0, 0
    for _, asset in pairs(art.assets) do
        available = available + 1
        if rawget(asset, 'slots') ~= nil then decoded = decoded + 1 end
    end
    assert(available == #ABYSS_EXPECTED_MONSTER_ART_IDS, 'formal monster catalogue count mismatch')
    for _, id in ipairs(ABYSS_EXPECTED_MONSTER_ART_IDS) do
        assert(art.assets[id], 'formal monster catalogue missing ' .. id)
    end
    assert(decoded == 0, 'FORMAL_BOOT_EAGER_DECODE: ' .. decoded .. '/' .. available)
    return available
end
local drawings = verifyDeferredMonsterArt()
stageBeforeInput = false
assert(F.click(stage, 'menuPanel', 'start') and host.characterOpen and not host.run, 'formal ready must accept Start')
ready(180)
verifyDeferredMonsterArt()
if not host.characterSelection.info then
    assert(F.click(stage, 'characterPanel', 'traveler'))
    ready(180)
end
assert(F.click(stage, 'characterPanel', 'confirm'))
ready(240)
assert(host.run and host.mode == 'node' and host.run.campaignProfile == 'competition-two-act'
    and host.run.nodeFlow.event.id == 'neow' and stage:GetChild('nodePanel').activeInHierarchy,
    'formal confirmation must enter the playable opening')
verifyDeferredMonsterArt()
OnDestroy()
assert(not script.updating, 'destroy must release the scheduler')
print('FORMAL_STARTUP_PASS ' .. ABYSS_STARTUP_DEVICE .. ' menuTurns=' .. turns .. ' offscreen=' .. #offscreen .. ' deferredDrawings=' .. drawings)
