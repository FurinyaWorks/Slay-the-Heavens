-- Formal generation and real Lua entry, with generated templates cloned by the Host fixture.
local F,counts,mark=...
local GameUI=require('abyss_game_ui')
local artBinding=require('abyss_monster_actor_binding')
local portraits=require('abyss_traveler_portrait_assets')
local browser=require('abyss_deck_browser_binding')
local templates=require('abyss_ui_templates')
local templateNames=require('performance_templates')
local destroy=F.monsterActors().destroy
local function bindActive(control)
    control.active=true
    function control:SetActive(value)
        self.active=value
        F.setEngineActive(self,value)
    end
end
local host,deckRoots,serial
local function start()
    deckRoots,serial=0,0
    local canvas=F.control({children=F.Layout})
    local stage=assert(canvas:GetChild('stage'))
    for _,name in ipairs({'nodePanel','choicePanel'}) do bindActive(stage:GetChild(name)) end
    local selection=stage:GetChild('characterPanel')
    local background=selection:GetChild('lumineSelectionBackground')
    bindActive(background:GetChild('figure') or background)
    bindActive(selection:GetChild('traveler'):GetChild('officialAvatar'))
    bindActive(stage:GetChild('battlePanel'):GetChild('hero'):GetChild('officialFigure'))

    local new=GameUI.new
    GameUI.new=function(root,data,presentation,event,platform)
        assert(platform.portraits and platform.nativePageLifecycle and platform.deckBrowser
            and platform.characterProfile=='production','formal profile fell back')
        host=new(root,data,presentation,event,platform)
        return host
    end
    script={object=canvas,GetParam=function(_,name)return name=='nativeBgmEnabled' end,
        EnableUpdate=function(self,active)self.updating=active end}
    Enum={ImageSource={StaticReference='static'}, ImageType={Basic='basic',Stretch='stretch'},
        ImageFillHorizontalType={Right='right'}, CursorEventType={CursorClick='click',CursorDown='down',CursorUp='up',CursorDrag='drag',CursorEndDrag='endDrag'},
        Device={Mobile='mobile',MobileController='mobileController'}}
    local function color(r,g,b,a) return {r=r,g=g,b=b,a=a} end
    Color=setmetatable({FromRGBA=color},{__call=function(_,...)return color(...)end})
    game={
        IsTestPlay=function()return false end, GetUICanvasSize=function()return 1560,720 end,
        GetDevice=function()return 'mobile' end, GetCursorUIPos=function()return 0,0 end,
        InstantiateClientUIControl=function(index,parent)
            local name=assert(templateNames[index],'unbound native template')
            local box=F.control(assert(templates[name]),parent)
            serial=serial+1
            parent.children['performanceClone'..serial]=box
            if index==browser.templateIndex then deckRoots=deckRoots+1 end
            if index==portraits.imagePrefabId or index==portraits.containerPrefabId or index==portraits.selectionHalfImagePrefabId then
                bindActive(box)
                if box.kind=='image' then
                    function box:SetFillUnused() self.fill=nil end
                    function box:SetFillHorizontal(side,amount) self.fill={side,amount} end
                end
            end
            return box
        end,
        DestroyClientUIControl=destroy,
        ServerSignal=function()return {SendSignal=function()end} end,
    }
    dofile('src/lua/abyss_ui.lua')
    OnStart()
    GameUI.new=new
    assert(host and script.updating,'formal startup did not install the update callback')
    host.seed=42
    return stage
end
local function ready()
    return script.updating and not host.disabled and not host.starting and not host.pageReveal:covered()
        and not host.battleUI.busy and not (host.prologue and host.prologue:covering())
end
local function settle()
    for frame=0,240 do
        if ready() then return frame end
        OnUpdate(1/60)
    end
    error('formal page failed to become interactive: '..tostring(host.mode)..' '..tostring(host.pageReveal.error))
end
local function decoded(art)
    local count=0
    for _,asset in pairs(art.assets) do
        if rawget(asset,'slots')~=nil then count=count+1 end
    end
    return count
end
local function expectMenu(stage)
    assert(host.mode=='menu' and not host.run and stage:GetChild('menuPanel').visible,'formal menu missing')
end

local stage=start()
local coldFrames=settle()
expectMenu(stage)
local art=assert(package.loaded.abyss_monster_art_data,'formal monster catalogue was never loaded')
local total=0
assert(art.status=='refined-release' and artBinding.enabled)
for id,key in pairs(art.bindings) do
    assert(art.assets[key] and artBinding.templateIndexByDefinition[id],'missing formal monster tier: '..id)
    total=total+1
end
assert(total==42,'expected 42 formal monster bindings')
local coldDecoded=decoded(art)
local coldLookups=assert(counts.mapGroupLookups,'map group queries were not observed')
assert(coldDecoded==0,'FORMAL_EAGER_MONSTERS '..coldDecoded..'/'..total)
-- Five groups plus the independent background lookup. The old binder did
-- another lookup for each map node scanned and reached hundreds.
assert(coldLookups<=6,'FORMAL_MAP_LOOKUPS '..coldLookups)
mark('cold-start')

local function click(panel,button)
    local accepted=F.click(stage,panel,button)
    assert(accepted,'native input rejected: '..panel..'/'..button)
    return settle()
end
local function enterMap()
    click('menuPanel','start')
    if not host.characterSelection.info then click('characterPanel','traveler') end
    local details=stage:GetChild('characterPanel'):GetChild('details')
    local retired={deckTitle=true,deckSummary=true,deckRule=true,deckOpen=true,deckView=true}
    for _,control in ipairs(details:GetChildren()) do
        assert(not retired[control.name],'FORMAL_RETIRED_SELECTION_CONTROL '..control.name)
    end
    click('characterPanel','confirm')
    assert(host.run.runSeed=='42' and host.run.nodeFlow.event.id=='neow')
    for _,option in ipairs({1,2,1}) do click('nodePanel','eventView/option'..option) end
    assert(host.run.phase=='map' and host.mapUI.navigationEnabled)
end
enterMap()
assert(decoded(art)==0,'monster drawings were decoded before the first fight')
local starter={table.unpack(host.run.deck)}
for i=1,75 do
    local card=F.Combat.copy(starter[(i-1)%#starter+1]);card.uid=1000+i
    host.run.deck[i]=card
end
mark('start-map')

local first=assert(F.Nodes.available(host.run,host.map)[1])
local slot
for i,id in pairs(host.mapUI.slots) do if id==first.id then slot=i;break end end
click('mapPanel','node'..assert(slot))
local battle=assert(host.run.combat,'first map hit did not start combat')
local firstDecoded=decoded(art)
assert(firstDecoded>0 and firstDecoded<=#battle.enemies,'formal first battle did not lazily paint its own monsters')
local surfaces=require('abyss_monster_surfaces').get(stage:GetChild('battlePanel'))
for _,enemy in ipairs(battle.enemies) do
    local actor=assert(surfaces:find(enemy.id))
    assert(actor:GetChild('monsterArt').visible and not actor:GetChild('portrait').visible,'first battle rendered a fallback monster')
end
mark('first-fight')

F.Combat.draw(battle,10-#battle.hand)
assert(#battle.hand==10,'ten-card load missing')
host.battleUI:render()
for _=1,60 do OnUpdate(1/60) end
mark('ten-card-hand')

battle.energy=10
local enemy=battle.enemies[1]
enemy.hp,enemy.maxHp=300,300
local function tap(box,touchId)
    local hit=assert(box.click and box or box:GetChild('hit'))
    assert(hit.raycastTarget,'native combat or card control cannot accept input')
    local event={touchId=touchId,GetUIPos=function()return 780+(box.x or 0),360+(box.y or 0) end}
    if hit.listeners.down then hit.listeners.down(event) end
    if hit.listeners.up then hit.listeners.up(event) end
    hit.click(event)
    settle()
end
local battlePanel=stage:GetChild('battlePanel')
for play=1,3 do
    local playable
    for i,card in ipairs(battle.hand) do
        if F.Combat.canPlay(battle,card.uid,1) then playable=i;break end
    end
    local card=assert(battle.hand[assert(playable)])
    tap(battlePanel:GetChild('card'..playable),play*2)
    assert(host.battleUI.selected==card.uid,'the native hand did not select the card')
    local untargeted=F.Combat.canPlay(battle,card.uid,nil)
    local actor=assert(surfaces:find(enemy.id))
    tap(untargeted and battlePanel:GetChild('playArea') or actor,play*2+1)
end
assert(#battle.hand==7 and host.run.combat==battle,'three plays did not commit to one battle')
mark('consecutive-play')

local panel=stage:GetChild('deckPanel')
local function openDeck()
    local frames=click('deckEntry','open')
    assert(host.deckUI.paged and not host.deckUI.pendingGrid and panel.visible,'formal deck page did not publish')
    local painted,firstCard=0,nil
    for _,card in ipairs(panel:GetChild('pileGrid'):GetChildren()) do
        if card.name==templateNames[browser.templateIndex] and card.visible then
            assert(card:GetChild('face'):GetChild('name').text~='','visible deck card was not painted')
            assert(card:GetChild('hit').raycastTarget==true,'visible deck card did not accept input')
            painted=painted+1
            firstCard=firstCard or card
        end
    end
    assert(painted==10,'formal deck first page did not publish all ten cards')
    return frames,firstCard
end
assert(deckRoots==0,'deck preallocated before its first open')
local coldOpen,firstCard=openDeck()
assert(deckRoots==10,'cold deck did not allocate exactly one page')
mark('deck-cold-open')
tap(firstCard,30)
assert(host.deckUI.cardDetail,'formal deck card did not open its details')
click('deckPanel','pileReturn')
assert(panel.visible and not host.deckUI.cardDetail,'detail return did not restore the deck page')
click('deckPanel','pileReturn')
assert(not panel.visible and host.run.combat==battle)
mark('deck-close')
local warmOpen=openDeck()
assert(deckRoots==10,'warm deck reallocated cached card faces')
mark('deck-warm-open')
click('deckPanel','pileReturn')
click('exitEntry','open')
click('runMenu','mainMenu')
assert(host.mode=='menu' and host.sessionPaused and host.run.combat==battle,'title lost the in-progress battle')
click('menuPanel','continueRun')
assert(host.mode=='battle' and not host.sessionPaused and host.run.combat==battle,'resume lost the in-progress battle')
mark('pause-resume')

local oldHost=host
destroy(script.object)
OnDestroy()
assert(not script.updating,'exit left the old scheduler active')
mark('exit')
host=nil
stage=start()
settle()
expectMenu(stage)
assert(host~=oldHost,'reentry kept the exited Host')
enterMap()
assert(host.run and not host.run.combat,'reentry revived the old battle')
destroy(script.object)
OnDestroy()
assert(not script.updating,'destroy left the old scheduler active')
mark('reenter')
print('PRODUCTION coldFrames='..coldFrames..' mapGroupLookups='..coldLookups..' monsterDecodes='..coldDecoded..'/'..firstDecoded
    ..' deckColdFrames='..coldOpen..' deckWarmFrames='..warmOpen)
print('PRODUCTION_HOST_PASS seed=42')
