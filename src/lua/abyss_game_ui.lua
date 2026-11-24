-- Host for the same-run map, node and battle views. Only commands change rules.
require("abyss_run")
require("abyss_map")
local Nodes = require("abyss_nodes")
local BattleUI = require("abyss_battle_ui")
local MapUI = require("abyss_map_ui")
local NodeUI = require("abyss_node_ui")
local DeckUI = require("abyss_deck_ui")
local PotionDiscardUI = require("abyss_potion_discard_ui")
require("abyss_narrative")
local Bgm = require("abyss_bgm")
local CharacterSelect = require("abyss_character_select")
require("abyss_character_select_view")
local MenuView=require("abyss_game_ui_menu_view")
local Theme = require("abyss_theme")
local M = {}
require("abyss_numbers")
require("abyss_run_seed")
local NeowHistory=require('abyss_neow_history')
local EndingHistory=require('abyss_ending_history')
require('abyss_acts')
local VictoryEgg=require('abyss_victory_easter_egg')

local Overlays = require('abyss_game_ui_overlays')
local View = require('abyss_game_ui_view')
local RunFlow = require('abyss_game_ui_run')
local Lifecycle = require('abyss_game_ui_lifecycle')
local Input = require('abyss_game_ui_input')
local Navigation = require('abyss_game_ui_navigation')
local PageReveal=require('abyss_page_reveal')
local function browserFrame()
    local viewport=Theme.layout.deckView.pileViewport or Theme.layout.deckView.viewport
    return {viewport[1],viewport[2]+viewport[4]/2-241.5,918,452}
end

local function revealMotion(platform)
    if platform.prologue==true and platform.color then
        return {color=platform.color,duration=Theme.motion.slow,entryTrace=platform.entryTrace}
    end
end
local function legacyPrologue(panel,platform,gate)
    return panel and platform.prologue==true and platform.color and not gate
end
function M.new(root, data, presentation, clickEvent, platform)
    -- A seed is an explicit replay/test override. Normal runs sample at Start,
    -- never while constructing the title screen or refreshing the UI.
    local self = { root = root, data = data, seed = platform.seed, mode = "menu" }
    local owner = {exitGeneration=0, menuGeneration=0, ready=false}
    -- Per-host callbacks must stay with their original control tree.
    platform=setmetatable({},{__index=platform})
    local neowHistory=NeowHistory.new(platform.readNeowHistory)
    local endingHistory=EndingHistory.new({read=platform.readEndingHistory,write=platform.writeEndingHistory})
    -- Read-only Production data service; no navigation or eager catalogue build.
    self.productionCompendium = Overlays.productionCompendium(data,presentation)
    if platform.presentationReady then
        local cover=assert(root:GetChild('pageReveal'),'missing shared page reveal cover')
        local function ready(intent)
            if intent.page=='choicePanel' and self.choiceUI then
                local painted,reason,count=self.choiceUI:presentationReady()
                if not painted then return false,reason,'choice:'..tostring(count) end
            end
            return platform.presentationReady(intent)
        end
        self.pageReveal=PageReveal.new(cover,ready,function()
            owner.exitGeneration=owner.exitGeneration+1;owner.menuGeneration=owner.menuGeneration+1
        end,{full={0,0,Theme.canvas.base[1],Theme.canvas.base[2]},
            deckPanel=Theme.layout.deckView.viewport,deckBrowser=Theme.layout.deckView.pileViewport,deckPaged=browserFrame(),
            nodePanel=Theme.layout.nativeNode.backdrop,battlePanel=Theme.layout.rewardPick.stage,
            potionPanel={0,0,Theme.layout.modal.size[1],Theme.layout.modal.size[2]},
            choicePanel=Theme.layout.combatChoice.viewport or Theme.layout.combatChoice.panel,
            onMapReturn=function()
                if self.mapUI.visible and not self.exitOpen and not self.settlementRequested then
                    self.mapUI:startReturnReveal()
                end
            end},revealMotion(platform))
        function self.pointerBlocked()
            local gate=self.pageReveal
            return gate:covered() and (not self.exitOpen or self.routeOpen)
                and not (self.deckUI and self.deckUI.paged and not self.deckUI.cardDetail and not self.deckUI.detailPages
                    and gate.intent and gate.intent.deckPaged
                    and gate.localFrame and gate.state~='failed')
        end
        platform.pointerBlocked=self.pointerBlocked
        cover.disableCursorEventPassthrough=true
        cover:GetChild('blocker'):AddCursorEventListener(clickEvent,function()return true end)
        local cancel=cover:GetChild('cancel'):GetChild('hit')
        local function canRecover()return self.pageReveal.state=='failed' and (not self.exitOpen or self.routeOpen) end
        function self.recoverPage(_)
            if not canRecover()then return false end
            if self.routeOpen then return self:closeExit() end
            if self.deckUI.paged then return self:closeDeck() end
            return self:openMenu()
        end
        local function recover()return self:recoverPage()end
        cancel:AddCursorEventListener(clickEvent,recover)
    end
    local newSeed = platform.newSeed or function() return require("abyss_new_run_seed").next() end
    local bgm = Bgm.new(platform.music)
    local function child(name) return assert(root:GetChild(name), "missing game panel " .. name) end
    platform.mobileRunHud=require('abyss_mobile_run_hud').apply(child,platform)
    local menu = child("menuPanel")
    local exitPanel, exitEntry = child("exitPanel"), child("exitEntry")
    local runMenu = child("runMenu")
    local characterPanel = child("characterPanel")
    self.characterSelection=CharacterSelect.new(data,presentation,platform.campaignProfile or platform.characterProfile)
    self.fastMode=false
    self.setFastMode = Overlays.setFastMode(self)
    local openingCovered = Overlays.openingCovered(self)
    local inputCovered=function()return openingCovered() or self.pageReveal and self.pageReveal:covered()end
    local canViewRoute = Overlays.canViewRoute(self,inputCovered)
    local changed = Overlays.changed(self,owner)
    local function battleEntryCovered()
        local gate=self.pageReveal
        return gate and gate.entry and gate:covered()
    end
    self.battleUI = BattleUI.new(child("battlePanel"), data, presentation, clickEvent,
        platform, { embedded = true, onChange = changed, inputCovered=battleEntryCovered,
            onPile=function(kind)return self:openDeck(kind)end,
            onCardFocus=function(read)return self:openDeck(nil,read)end })
    self.mapUI = MapUI.new(child("mapPanel"), nil, Navigation.requestNodeEntry(self,platform,changed),
        clickEvent, { embedded = true, hudTop=platform.mobileRunHud and platform.mobileRunHud.contentTop, color = platform.color, imageSource = platform.imageSource,
        cursor = platform.cursorEvents, pointerBlocked = platform.pointerBlocked,
        inputCovered=inputCovered,available=function(map)return Nodes.available(self.run,map)end })
    self.nodeUI = NodeUI.new(child("nodePanel"), nil, nil,
        presentation, clickEvent, changed, { color = platform.color, imageSource = platform.imageSource,
            imageTypes = platform.imageTypes,
            imageFillRight = platform.imageFillRight,
            textAlignments = platform.textAlignments, mobileRunHud=platform.mobileRunHud,
            cursorEvents = platform.cursorEvents, sound = platform.sound, pointerBlocked = platform.pointerBlocked, touchScreen = platform.touchScreen,
            enhancedRooms=true, hostRendersEvents=true, hostRendersMap=true, inputCovered=inputCovered,
            onInspectCard=function(definition,upgraded)
                if not self.run or self.disabled or self.mode~='node' or self.exitOpen
                    or self.deckUI.visible or self.potionUI.visible or self.settlementRequested then return false end
                if not self.deckUI:inspect(self.run,definition,upgraded) then return false end
                self:refresh();return true
            end })
    platform.deckChanged=View.deckChanged(self,owner,platform,changed)
    self.deckUI = DeckUI.new(child("deckPanel"), presentation, clickEvent, platform, function() return self:closeDeck() end)
    do
        self.choiceUI = require("abyss_choice_ui").new(child("choicePanel"),presentation,clickEvent,platform,
            function(kind,uids,token,generation,battle)
                return self.battleUI:chooseCards(kind,uids,token,generation,battle)
            end)
    end
    local inCombat = Overlays.inCombat(self)
    local canManagePotions = Overlays.canManagePotions(inputCovered,self)
    local resourceHint = Overlays.resourceHint(self,canManagePotions,inCombat)
    platform.previewingRoute=function()return self.routeOpen==true end
    platform.hudAlive=function()return not self.disabled end
    platform.hudInputContext=function()return {self.run,self.mode,self.run and self.run.phase,
        self.run and self.run.nodeFlow,self.run and self.run.nodeFlow and self.run.nodeFlow.event and self.run.nodeFlow.event.stage,
        self.deckUI.generation,self.potionUI and self.potionUI.generation,owner.exitGeneration}end
    self.relicUI=require('abyss_relic_view_ui').new(child('relicPanel'),child('relicBar'),clickEvent,platform,
        function(run,id)return self.nodeUI:describeRelic(run,id)end,function()return self:closeDeck()end,
        function(i)return self:openRelics(i)end,function()return self.mode end)
    self.potionUI=PotionDiscardUI.new(child("potionPanel"),clickEvent,platform,canManagePotions,changed,
        function()return self:closePotions()end)
    self.openPotions = Overlays.openPotions(self)
    self.closePotions = Overlays.closePotions(self)
    local prologuePanel = root:GetChild("prologuePanel")
    -- Native entry opts into the short interstitial; rule-only hosts stay immediate.
    if legacyPrologue(prologuePanel,platform,self.pageReveal)then
        self.prologue=require('abyss_prologue').new(prologuePanel,{color=platform.color,clickEvent=clickEvent,
            progress=View.openingProgress(self,child,platform),
            onPhase=function()self:refresh()end,onCancel=function()self.starting=false end})
    end
    if prologuePanel then prologuePanel:SetVisible(false) end
    self.openExit = Overlays.openExit(self,owner)
    self.openMenu = Overlays.openMenu(self,owner)
    self.closeExit = Overlays.closeExit(self,owner)
    self.confirmExit = Overlays.confirmExit(self,owner)
    Navigation.install(self,owner,neowHistory)

    self.openDeck = Overlays.openDeck(inputCovered,self)
    self.openStarterDeck = Overlays.openStarterDeck(inputCovered,self,platform,owner)
    -- TASK-4.7 owned relics: icon-disc slots, not a text dump. Opening rides
    -- the deck gate so it stays read-only for battle, map, camp and chest.
    self.openRelics = Overlays.openRelics(self,inputCovered,platform)
    self.closeDeck = Overlays.closeDeck(self)

    local menuView = MenuView.new(self,menu,data,platform)
    if root:GetChild('victoryEasterEgg') then
        self.easterEgg=VictoryEgg.new(root,{canOpen=function()
            return type(platform.createEasterEggArt)=='function' and self.mode=='victory' and not self.disabled
                and not self.characterOpen and not self.exitOpen and not self.settlementRequested and not self.settlementBusy and not self.motion.deathReveal
        end,createArt=platform.createEasterEggArt,onVisibility=function(value)
            self.easterEggOpen=value;owner.exitGeneration=owner.exitGeneration+1;owner.menuGeneration=owner.menuGeneration+1;self:refresh()
        end})
    end
    self.onEngineDestroy = Lifecycle.onEngineDestroy(self)
    local start,settlement=menuView.start,menuView.settlement
    local present = View.present(menuView)
    self.animate = View.animate(menuView)
    self.paintArtLoading = View.paintArtLoading(platform,menu,self)

    local finishRunFlow = View.finishRunFlow(neowHistory,endingHistory,self)
    local selectMode = View.selectMode(self)
    local syncMenuContext = View.syncMenuContext(self,owner)
    local syncCardChoice = View.syncCardChoice(self)
    local closeStaleDeck = View.closeStaleDeck(self)
    local openCardChoice = View.openCardChoice(self,platform)
    local syncRewardReturn = View.syncRewardReturn(self)
    local refreshPotionEntry = View.refreshPotionEntry(child,inCombat,canManagePotions,platform)
    local refreshDeckEntry = View.refreshDeckEntry(child,self)
    local refreshUtilities = View.refreshUtilities(child,self,inCombat,refreshPotionEntry,refreshDeckEntry)
    local refreshMapResources = View.refreshMapResources(child)
    local suspendBattle = View.suspendBattle(self,openingCovered)
    local refreshPageVisibility = View.refreshPageVisibility(menu,self,suspendBattle,child,refreshMapResources,platform.nativePageLifecycle==true)
    local renderBattlePage = View.renderBattlePage(self,child)
    local renderMapPage = View.renderMapPage(self)
    local renderCurrentPage = View.renderCurrentPage(self,renderBattlePage,renderMapPage,platform)
    local exitDialogOwnsForeground = View.exitDialogOwnsForeground(self)
    local refreshExitDialog = View.refreshExitDialog(exitDialogOwnsForeground,exitPanel,self)
    local syncPortraits = View.syncPortraits(platform,self)
    local exitEntryVisible = View.exitEntryVisible(self)
    local refreshForeground = View.refreshForeground(characterPanel,self,platform,exitEntry,exitEntryVisible,exitPanel,exitDialogOwnsForeground,runMenu,canViewRoute,child,refreshExitDialog)
    local overlaysBlocked = View.overlaysBlocked(self)
    local syncOpening = View.syncOpening(self,openingCovered)
    local openingForeground = View.openingForeground(self,child,prologuePanel,runMenu,exitPanel)
    local syncOfficialBattleScene = View.syncOfficialBattleScene(root,self)
    self.refresh = View.refresh(self,finishRunFlow,syncOpening,selectMode,syncOfficialBattleScene,syncMenuContext,platform,syncCardChoice,closeStaleDeck,openCardChoice,canManagePotions,overlaysBlocked,syncRewardReturn,refreshUtilities,refreshPageVisibility,renderCurrentPage,bgm,present,refreshForeground,syncPortraits,openingForeground)
    local selectionChanged = RunFlow.selectionChanged(self,owner,View.refreshSelection(self,platform,syncPortraits))
    self.closeCharacters = RunFlow.closeCharacters(self,selectionChanged)
    self.selectCharacter = RunFlow.selectCharacter(self,selectionChanged)
    self.selectElement = RunFlow.selectElement(self,selectionChanged)
    self.start = RunFlow.start(self,selectionChanged)
    local beginRun = RunFlow.beginRun(platform,data,self,newSeed,presentation,endingHistory,neowHistory,prologuePanel,owner)
    self.confirmCharacter = RunFlow.confirmCharacter(self,beginRun)
    self.advanceAct = RunFlow.advanceAct(self)
    self.settle = RunFlow.settle(self,owner)
    owner.requestSettlement = RunFlow.requestSettlement(self,platform,neowHistory,owner)
    self.resize = Lifecycle.resize(self,owner)
    self.update = Lifecycle.update(self,platform,openingCovered,bgm)
    self.disable = Lifecycle.disable(self,platform,characterPanel,owner)
    Input.installUtilities(self,child,clickEvent,inCombat,exitPanel,runMenu)
    local bindCommand = Input.bindCommand(platform,self,canManagePotions,clickEvent,owner)
    Input.installMenu(self,child,clickEvent,resourceHint,bindCommand,start,settlement,exitEntry,exitPanel)
    Input.installRunMenu(self,bindCommand,runMenu,canViewRoute,child,owner)
    Input.installCharacters(self,characterPanel,clickEvent,bindCommand)
    owner.ready = true
    self:refresh()
    return self
end
return M
