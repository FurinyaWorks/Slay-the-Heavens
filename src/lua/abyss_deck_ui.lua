local CardSkin=require('abyss_card_skin')
-- Read-only deck/pile snapshots. No Run commands or RNG consumption.
local Combat = require("abyss_combat")
local Theme = require("abyss_theme")
local CardDisplay = require('abyss_card_display')
local OriginalDisplay = require('abyss_original_v4_display')
local CardOrigin = require('abyss_card_origin_view')
local M = {}
local Pointer = require('abyss_pointer_input')
local RoundedButton = require('abyss_rounded_button')
local Browser = require('abyss_deck_browser')
local NativeArt = require('abyss_card_art_runtime')
local typeNames = { attack = "攻击", skill = "技能", power = "能力", status = "状态", curse = "诅咒" }
local pileNames = {draw="抽牌堆",discard="弃牌堆",exhaust="消耗堆"}
local rarityOrder = {basic=1,special=2,common=3,uncommon=4,rare=5,curse=6}
local noPlayPreview = {}
local PageReveal = require('abyss_page_reveal')
-- ClientUIGridScrollerControl: current item size/spacing, top/bottom padding,
-- fixed columns and viewport determine visible rows, including clipped edges.
-- Only those logical indices must be painted; virtual offscreen items may not exist.
local function visibleCardWindow(grid,amount,columns)
    if amount==0 then return 1,0 end
    local _,height=grid:GetItemSize()
    local _,gap=grid:GetItemSpacing()
    local top,bottom=grid:GetPadding()
    local viewport=grid.sizeDeltaY
    columns=grid.layoutConstraintFixedCount or columns
    assert(height>0 and gap>=0 and viewport>0 and columns>0,'invalid deck grid geometry')
    local rows=math.ceil(amount/columns)
    local length=top+bottom+rows*height+(rows-1)*gap
    local offset=math.max(0,length-viewport)*math.max(0,math.min(1,grid.scrollProgress or 0))
    local first=math.max(0,math.floor((offset-top-height)/(height+gap))+1)
    local last=math.min(rows-1,math.ceil((offset+viewport-top)/(height+gap))-1)
    return first*columns+1,math.min(amount,(last+1)*columns)
end
local function visibleCardsReady(cells,first,last)
    for index=first,last do
        if not cells[index] or cells[index].alive==false then return false end
    end
    return true
end
-- Read-only browser input, not a Run/combat state. UIDs stay local to the
-- preview and never consume the Run allocator or an RNG stream.
function M.previewContext(info)
    if type(info)~='table' or type(info.id)~='string' or type(info.deck)~='table' then return nil,'preview_unavailable' end
    local deck,definitions,presentation={},{},{}
    for index,entry in ipairs(info.deck)do
        if type(entry)~='table' or type(entry.id)~='string' or type(entry.definition)~='table' or entry.definition.id~=entry.id
            or type(entry.display)~='table' or type(entry.count)~='number' or entry.count<=0 or entry.count>=math.huge or entry.count%1~=0 then
            return nil,'preview_content_unavailable'
        end
        definitions[#definitions+1]=Combat.copy(entry.definition);presentation[entry.id]=Combat.copy(entry.display)
        for copy=1,entry.count do deck[#deck+1]={cardId=entry.id,uid='starter:'..info.id..':'..index..':'..copy,upgraded=false}end
    end
    return {readOnlyPreview=true,deck=deck,data={cards={cards=definitions}}},presentation
end
local browseSorts={'original','type','cost'}
local sortNames={original='获得顺序',cost='耗能',type='类型'}
-- STS1 V2.3.4 localization/zhs/ui.json, with the original Exhaust spacing.
local browseDescriptions={
    deck='这些牌将会出现在每一场战斗中。',
    draw='每回合开始时将从这里抽牌。',
    discard='当抽牌堆被抽空时，这里的牌将会被洗牌并重新放入抽牌堆。',
    exhaust='在这场战斗中被 消耗 的牌。',
}
local cardChoiceTitle="选择卡牌"
local noteWidth,noteHeight=400,384

local function frozenEye(run)
    for _, relic in ipairs(run.relics or {}) do if relic=="frozen_eye" then return true end end
    return false
end

-- Display grouping uses the printed metadata (including upgrade overrides).
-- Live combat adapters change effects, costs and playability, not these fields.
local function printedField(printed,instance,field)
    local upgraded=instance.upgraded and printed.upgrade
    if upgraded and upgraded[field]~=nil then return upgraded[field] end
    return printed[field]
end

local function pileCards(run, kind, presentation)
    local result, pile, copies = {}, run.combat[kind], {}
    -- Draw/Exhaust view screens copy with addToBottom; Discard uses its group directly.
    for i=1,#pile do result[i]=Combat.copy(pile[kind=="discard" and i or #pile-i+1],copies) end
    if kind=="discard" or frozenEye(run) then return result end
    local ranked={}
    for i,card in ipairs(result) do
        local printed=assert(run.combat.catalog.cards[card.cardId],"unknown card")
        ranked[card]={index=i,status=printedField(printed,card,'type')=="status" and 1 or 0,
            rarity=assert(rarityOrder[printedField(printed,card,'rarity')],"unknown pile card rarity"),
            name=assert(presentation[card.cardId],"missing pile presentation").name..(card.upgraded and "+" or "")}
    end
    -- Stable name -> rarity -> status-last ordering from CardGroup's three sorts.
    table.sort(result,function(a,b)
        local x,y=ranked[a],ranked[b]
        if x.status~=y.status then return x.status<y.status end
        if x.rarity~=y.rarity then return x.rarity<y.rarity end
        if x.name~=y.name then return x.name<y.name end
        return x.index<y.index
    end)
    return result
end

local function permanentOrChoiceCards(run,choice)
    local catalog={cards={}}
    for _,card in ipairs(run.data.cards.cards) do catalog.cards[card.id]=card end
    -- Permanent cards never acquire temporary hand cost/growth/status.
    if not choice then return Combat.copy(run.deck),catalog end
    if choice.cards then return Combat.copy(choice.cards),catalog end
    local cards={}
    for _,uid in ipairs(choice.uids) do
        for _,pile in ipairs({run.combat.hand,run.combat.draw,run.combat.discard,run.combat.exhaust}) do
            for _,card in ipairs(pile) do
                if card.uid==uid then cards[#cards+1]=Combat.copy(card) end
            end
        end
    end
    return cards,catalog
end

local function bindPileReturn(deck, button, platform, cursor, clickEvent, revision)
    local hit, art = button:GetChild('hit'), button:GetChild('art')
    local chrome = art:GetChild('roundedButton')
    local palette = Theme.officialAssets.roundedButtonPalettes.cancel
    local held, released, observed, hovered
    local painted = 'normal'
    local function available()
        return deck.visible and deck.browserShell and not deck.choiceToken and not deck.detailOnly
    end
    local function current(token)
        return token and available() and token.generation == deck.generation and token.run == deck.run
            and token.revision == revision()
    end
    local function paint(state)
        if painted == state then return end
        painted = state
        RoundedButton.paint(chrome, palette[state], platform.color)
        local scale = state == 'pressed' and Theme.layout.deckView.pressedScale or 1
        art:SetLocalScale(scale, scale, 1)
    end
    local function reset()
        held, released, hovered = nil, nil, nil
        paint('normal')
    end
    local function touch(event) return event and event.touchId end
    if cursor.CursorEnter then
        hit:AddCursorEventListener(cursor.CursorEnter, function()
            if not available() or Pointer.blocked(platform) then return end
            hovered = true
            if not held then paint('hover') end
        end)
    end
    for _, kind in pairs({cursor.CursorExit, cursor.CursorEndDrag}) do
        hit:AddCursorEventListener(kind, function(event)
            local owner = held or released
            if not owner or not event or owner.touch == touch(event) then reset() end
        end)
    end
    if cursor.CursorDown and cursor.CursorUp then
        hit:AddCursorEventListener(cursor.CursorDown, function(event)
            if current(held) and held.touch ~= touch(event) then return end
            observed, held, released = true, nil, nil
            if not available() or Pointer.blocked(platform) then
                reset()
                return
            end
            if touch(event) ~= nil then hovered = nil end
            held = {generation=deck.generation, run=deck.run, revision=revision(), touch=touch(event)}
            paint('pressed')
        end)
        hit:AddCursorEventListener(cursor.CursorUp, function(event)
            if not held or held.touch ~= touch(event) then return end
            released, held = current(held) and held or nil, nil
            paint(released and hovered and 'hover' or 'normal')
        end)
    end
    hit:AddCursorEventListener(clickEvent, function(event)
        if not available() or Pointer.blocked(platform) then return false end
        if observed or cursor.CursorDown and cursor.CursorUp and touch(event) ~= nil then
            if not current(released) or released.touch ~= touch(event) then return false end
            released = nil
        end
        return deck:back()
    end)

    return reset
end

function M.new(root, presentation, clickEvent, platform, onClose)
    local self = { root = root, visible = false, generation = 0, openSession=0,contentRevision=0,bindings={} }
    local onChanged=platform.deckChanged
    local returnRevision=0
    local browserFit=(platform.deckBrowser or Theme.presentationProfile=='official-assets-first') and CardDisplay.newTextFitter()
    function self.setPresentation(_, value)
        assert(not self.visible and type(value)=="table", "cannot replace visible deck presentation")
        presentation=value
        if browserFit then browserFit=CardDisplay.newTextFitter() end
    end
    local browserGrid = assert(root:GetChild("grid"), "missing deck grid")
    local pileGrid = root:GetChild('pileGrid')
    local grid = browserGrid
    local cursor=platform.cursorEvents or {}
    local pool,browserRun,browserRequest
    local previousControl,nextControl,pageHint=root:GetChild('previous'),root:GetChild('next'),root:GetChild('pageHint')
    local previousHit,nextHit=previousControl:GetChild('hit'),nextControl:GetChild('hit')
    local legacyEmpty=root:GetChild('browserEmpty')
    local official=Theme.presentationProfile=='official-assets-first'
    local browserChrome=official and root:GetChild('pileChrome')
    local empty=browserChrome and browserChrome:GetChild('empty') or legacyEmpty
    local pileHeading=browserChrome and browserChrome:GetChild('heading')
    local pileReturn=official and root:GetChild('pileReturn')
    local titleControl=root:GetChild('title')
    local indexBases=setmetatable({},{__mode='k'})
    self.browserWarmupPending=official and not platform.deckBrowser and pileGrid and pileGrid.RefreshItems~=nil
    function self.prepareBrowser()
        if not self.browserWarmupPending or self.visible then return end
        self.browserWarmupPending=false
        if indexBases[pileGrid]~=nil then return end
        local generation=self.generation
        local submitting,accepted=true,false
        local early={}
        local function remember(control,index)
            if self.generation~=generation or self.visible or indexBases[pileGrid]~=nil
                or not control or control.alive==false or (index~=0 and index~=1) then return end
            pcall(control.SetVisible,control,false)
            if self.generation==generation and not self.visible then indexBases[pileGrid]=index end
        end
        -- Some native hosts defer work on hidden grids. A click always owns
        -- its refresh and can supersede this optional one-item probe.
        local ok,result=pcall(pileGrid.RefreshItems,pileGrid,1,function(control,index)
            if submitting then early.control,early.index=control,index
            elseif accepted then remember(control,index)end
        end)
        submitting,accepted=false,ok and result~=false
        if accepted then remember(early.control,early.index)end
        early.control,early.index=nil,nil
    end
    local function gridColumns() return self.browserShell and 5 or Theme.layout.deckView.columns end
    local function browserHeading(kind)
        if self.previewInfo then return '初始牌组' end
        return pileNames[kind] or '卡组'
    end
    local function liveFaces(fn)
        for control in pairs(self.bindings)do
            if control.alive==false then
                self.bindings[control]=nil
            elseif fn then fn(control:GetChild('face')) end
        end
    end
    local details,detailHit=root:GetChild('details'),root:GetChild('detailHit')
    local upgradePreview=root:GetChild('upgradePreview')
    local cardFocus=root:GetChild('cardFocus')
    local detailFace=cardFocus:GetChild('face')
    local function inDetail()return self.detailPages~=nil or self.cardDetail~=nil end
    local function closeLabel(value)
        for _,state in ipairs({'normal','hover','pressed','disabled'}) do
            root:GetChild('close'):GetChild('hit'):GetChild(state):GetChild('label').text=value
        end
    end
    local function canBrowse()
        return self.visible == true and self.browseEnabled == true and not self.detailOnly and not inDetail()
    end
    local deckSort,description,rarityTip=root:GetChild('deckSort'),root:GetChild('browserDescription'),root:GetChild('rarityTip')
    local function paintDeckSort()
        if not platform.color then return end
        local role=self.previewInfo and self.previewInfo.id or self.run.character
        local colors=Theme.layout.characterSelect.themes
        local bar=colors[role] or colors.ironclad
        deckSort:GetChild('plate').imageColor=platform.color(bar.r,bar.g,bar.b,82)
        for _,mode in ipairs(browseSorts)do
            local box=deckSort:GetChild(mode)
            local label,arrow=box:GetChild('label'),box:GetChild('direction')
            local selected=self.sortMode==mode
            local ascending=self.sortDirections[mode]
            if selected then ascending=self.sortAscending end
            arrow.localRotationZ=ascending and 0 or 180
            local tone=selected and Theme.color.goldBright or Theme.color.text
            local ink=platform.color(tone.r,tone.g,tone.b,tone.a)
            label.fontColor,arrow.imageColor=ink,ink
        end
    end
    local function paintBrowseSort(active)
        for _,mode in ipairs(browseSorts)do
            local control=root:GetChild('sort'..mode)
            control:SetVisible(active and not self.pileKind)
            local selected=active and self.sortMode==mode
            control:GetChild('selected'):SetVisible(selected)
            local direction=self.sortAscending
            local label=sortNames[mode]..(selected and (direction and ' ↑' or ' ↓') or '')
            for _,state in ipairs({'normal','hover','pressed','disabled'})do
                control:GetChild('hit'):GetChild(state):GetChild('label').text=label
            end
        end
    end
    local function paintBrowse()
        local active=canBrowse()
        local sorting=active and not self.pileKind
        local showSort=sorting and self.browserShell==true
        deckSort:SetVisible(showSort)
        if showSort then paintDeckSort() end
        description:SetVisible(active==true)
        if active then description.text=browseDescriptions[self.pileKind or 'deck'] end
        rarityTip:SetVisible(active==true and self.pileKind=='draw' and not frozenEye(self.run))
        titleControl:SetVisible(not sorting and not self.browserShell and not self.cardDetail)
        if self.browserShell then
            local caption=active and pileNames[self.pileKind] or nil
            if caption then pileHeading.text=caption end
            pileHeading:SetVisible(caption~=nil or self.detailPages~=nil)
        end
        local heading=root:GetChild('browseTitle')
        local legacySort=sorting and not self.browserShell
        heading:SetVisible(legacySort==true)
        if legacySort then heading.text=self.listTitle end
        paintBrowseSort(legacySort==true)
    end
    local function detailPage()
        titleControl.text=self.detailTitle..' · '..self.detailPage..'/'..#self.detailPages
        if self.browserShell then pileHeading.text=titleControl.text end
        details.text=self.detailPages[self.detailPage]..'\n\n点按正文翻页 · '..(self.browserShell and '左下角返回' or '右上角返回')
    end
    function self.showDetails(_,definition,upgraded)
        if not self.visible or self.choiceToken or not definition.originalV4 then return false end
        local raw=OriginalDisplay.describe(definition,upgraded)
        local keywords=OriginalDisplay.keywordDefinitions(definition,upgraded)
        if keywords~=''then raw=raw..'\n'..keywords end
        return self:showText(definition.name..(upgraded and '+' or ''),raw)
    end
    local function paginate(raw,width,height)
        -- Bound each page using the shared viewport/font, counting a CJK codepoint
        -- as a full em. Do not truncate rules; every wrapped line stays reachable.
        local columns=math.max(1,math.floor(width/Theme.font.reading)-2)
        local rows=math.max(1,math.floor(height/Theme.layout.nativeText.lineHeight)-3)
        local lines,line,n={},'',0
        for ch in raw:gmatch('[%z\1-\127\194-\244][\128-\191]*') do
            if ch=='\n' then lines[#lines+1]=line;line,n='',0
            else line=line..ch;n=n+1;if n>=columns then lines[#lines+1]=line;line,n='',0 end end
        end
        if line~='' then lines[#lines+1]=line end
        local pages={}
        for i=1,#lines,rows do
            local page={};for j=i,math.min(i+rows-1,#lines) do page[#page+1]=lines[j] end
            pages[#pages+1]=table.concat(page,'\n')
        end
        return pages
    end
    local function hideCardDetail()
        if not self.cardDetail then return end
        self.cardDetail=nil
        returnRevision=returnRevision+1
        cardFocus:SetVisible(false);upgradePreview:SetVisible(false)
        CardDisplay.clearNativeArt(detailFace)
    end
    function self.showText(_,title,raw)
        if not self.visible or self.choiceToken then return false end
        hideCardDetail()
        for _,name in ipairs({'previous','next','pageHint'})do root:GetChild(name):SetVisible(false) end
        local x,y,width,height=table.unpack(Theme.layout.deckView.viewport)
        details:SetAnchoredPosition(x,y);details:SetSizeDelta(width,height)
        detailHit:SetAnchoredPosition(x,y);detailHit:SetSizeDelta(width,height)
        self.detailPages=paginate(raw,width,height)
        self.generation=self.generation+1;self.pending=false;self.pendingGrid=false;self.gridReady=nil
        if self.paged then pool:cancel() end
        liveFaces(CardDisplay.clearNativeArt)
        self.detailTitle=title
        self.detailPage=1;grid:SetVisible(false);details:SetVisible(true);detailHit:SetVisible(true)
        closeLabel('返回');detailPage();paintBrowse()
        if self.browserShell then pileReturn:SetAsLastSibling()end
        return true
    end
    function self.inspectText(_,run,title,raw)
        if self.visible then return false end
        self.visible,self.run,self.detailOnly=true,run,true
        self.generation=self.generation+1;root:SetVisible(true);root:SetAsLastSibling()
        root:GetChild('close'):SetVisible(true)
        local close=root:GetChild('close'):GetChild('hit');close.interactable,close.raycastTarget=true,true
        for _,name in ipairs({'previous','next','pageHint'})do root:GetChild(name):SetVisible(false) end
        return self:showText(title,raw)
    end
    -- TASK-4.7: the owned-relic overlay rides the deck modal lifecycle so every
    -- existing deck-open gate (battle input, map paths, rewards) stays read-only.
    function self.inspectRelics(_,run,view,index)
        if self.visible or not view then return false end
        self.openSession=self.openSession+1
        self.visible,self.run,self.detailOnly,self.relicView=true,run,'relics',view
        self.generation=self.generation+1;root:SetVisible(false)
        if not view:open(run,index)then self.visible,self.run,self.detailOnly,self.relicView=false,nil,nil,nil;return false end
        return true
    end
    function self.inspect(_,run,definition,upgraded)
        if self.visible or not definition.originalV4 then return false end
        self.visible,self.run,self.detailOnly=true,run,true
        self.generation=self.generation+1;root:SetVisible(true);root:SetAsLastSibling()
        root:GetChild('close'):SetVisible(true);local close=root:GetChild('close'):GetChild('hit');close.interactable,close.raycastTarget=true,true
        return self:showDetails(definition,upgraded)
    end
    local function colour(value) return platform.color(value.r, value.g, value.b, value.a) end
    local function picture(control,id) return control:SetImage(platform.imageSource,id) end
    local function tint(control, value) control.imageColor = colour(value) end
    local function updateForethoughtChoice(choice, token)
        if not self.visible or self.choiceToken~=token or self.battle.pendingChoice~=choice or choice.token==token then
            return false
        end
        self.choiceToken,self.choiceSelected=choice.token,choice.selected
        root:GetChild('title').text=cardChoiceTitle..' · 已选'..#choice.selected
        return true
    end
    local function isForethoughtToggle(choice)
        local item=choice.item
        return choice.multiple and choice.op=='colorless' and item and item.effect.kind=='forethought'
    end
    local function pickChoice(control,binding,repaint)
        local callback,token,uid=self.onPick,self.choiceToken,binding.uid
        local choice=self.battle.pendingChoice
        if callback and isForethoughtToggle(choice) then
            local ok,reason=callback(token,uid)
            if updateForethoughtChoice(choice,token) and control.alive~=false then
                repaint(control,binding.instance,self.catalog)
            end
            return ok,reason
        end
        self:close()
        if callback then callback(token,uid) end
    end
    local function bindCard(control,hit,instance,bodyText,repaint)
        if not self.bindings[control] then
            -- Keep the hit handle: GetChild is invalid once native Grid retires its item.
            self.bindings[control]={hit=hit}
            local function pick()
                local b=self.bindings[control]
                if control.alive==false or not b then return false end
                if self.visible and not self.choiceToken and not inDetail() and b.generation==self.generation then
                    return self:showCardDetails(b.instance)
                end
                if not self.visible or not self.choiceToken or b.generation~=self.generation
                    or not self.run or self.run.combat~=self.battle
                    or not self.battle.pendingChoice or self.battle.pendingChoice.token~=self.choiceToken then return end
                return pickChoice(control,b,repaint)
            end
            hit:AddCursorEventListener(clickEvent,function(event)
                if Pointer.blocked(platform) or Pointer.dragged(event, Theme.layout.cardDrag.threshold) then return false end
                return pick()
            end)
        end
        self.bindings[control].generation,self.bindings[control].uid=self.generation,instance.uid
        -- Browser instances already belong to this read-only snapshot. Details
        -- make their own copy before calculating or previewing upgrades.
        self.bindings[control].instance=instance
        if self.browserShell then self.bindings[control].bodyText=bodyText end
    end
    local function cardBody(display,definition,instance,battle)
        if not battle then return CardDisplay.permanentText(display,definition,instance) end
        -- V4 simulations require a hand card; a pile still gets live rules text.
        local preview=self.pileKind and definition.originalV4 and noPlayPreview
            or Combat.cardPreview(battle,instance,nil,definition)
        return CardDisplay.combatText(display,definition,instance,preview,battle)
    end
    local function paintCardText(face,instance,display,definition,text,bodyUnchanged)
        local fit=self.browserShell and browserFit or nil
        CardDisplay.writeTitle(face:GetChild("name"),display.name,instance.upgraded,
            definition.repeatable and (instance.upgrades or 1) or nil,face:GetChild("type"),typeNames[definition.type] or definition.type,fit)
        local label=face:GetChild('label')
        local fits,accepted=true,true
        if not bodyUnchanged then fits,accepted=CardDisplay.writeBody(label,text,face,fit) end
        if Theme.cardSkin.text.body then label.fontColor=colour(Theme.cardSkin.text.body)end
        face:GetChild("cost").text = definition.cost == -2 and "" or definition.costMode == "all_energy" and "X" or tostring(definition.cost)
        return fits,accepted
    end
    local function paintDeckPalette(face,definition)
        face:GetChild("name").fontColor=colour(Theme.cardSkin.text.title)
        tint(face:GetChild("border"), Theme.color.rarity[definition.rarity] or Theme.color.line)
        tint(face:GetChild("nameBand"), Theme.color.rarityBand[definition.rarity] or Theme.color.rarityBand.basic)
        tint(face:GetChild("nameRule"), Theme.color.rarity[definition.rarity] or Theme.color.line)
        tint(face:GetChild("artPlate"), Theme.color.cardType[definition.type] or Theme.color.panelRaised)
    end
    local function paintCardSkin(face,definition,look)
        paintDeckPalette(face,definition)
        CardSkin.apply(face,definition,platform,look)
    end
    local function appearanceOf(face,instance,display,definition,base,text)
        return {face,definition.id,definition.type,definition.rarity or false,definition.color or false,
            definition.originalV4 and definition.originalV4.role or false,display.name,not not instance.upgraded,
            definition.repeatable and (instance.upgrades or 1) or false,definition.cost,definition.costMode or false,
            base or false,not not self.pileView,text}
    end
    local function sameAppearance(previous,current)
        if not previous or not current then return false end
        for index,value in ipairs(current)do if previous[index]~=value then return false end end
        return true
    end
    local function paintFace(control,face,instance,display,definition,base,selected,text,binding,appearance)
        local previous=binding and binding.appearance
        local matches=sameAppearance(previous,appearance)
        local art=face:GetChild('art')
        local syncArt=not matches or display.nativeArt or binding.nativeArt or art.visible~=true
        if syncArt then PageReveal.registerSource(platform,'deckPanel') end
        local accepted,artPending=true,display.nativeArt~=nil
        if not matches then
            if binding then binding.appearance=nil end
            local bodyUnchanged=previous and previous[1]==face and binding.bodyText==text
            local _,textAccepted=paintCardText(face,instance,display,definition,text,bodyUnchanged)
            accepted=CardDisplay.writeArt(art,definition,picture,face)~=false and textAccepted~=false
        end
        if display.nativeArt then
            CardDisplay.writeNativeArt(face,definition,display.nativeArt,platform,art,instance.uid)
        elseif syncArt then
            local _,clean=CardDisplay.clearNativeArt(face,art)
            artPending=not clean
        end
        if matches then return accepted,artPending end
        paintCardSkin(face,definition,{cost=definition.cost,baseCost=base,selected=selected,
            surfaceScope=self.pileView and 'battle' or 'deck',templateKind=self.browserShell and 'attack' or nil,
            templateMaterials=self.browserShell})
        if self.browserShell then
            for _,name in ipairs({'nativePlayableRim','glow','costHalo'})do
                accepted=face:GetChild(name):SetVisible(false)~=false and accepted
            end
        end
        control:GetChild("uid").text=selected and '已选择' or ''
        return accepted,artPending
    end
    local function fill(control, instance, catalog)
        local generation=self.generation
        local battle=(self.choiceToken or self.pileKind) and self.battle
        local definition = Combat.cardDefinition(battle or {catalog=catalog}, instance)
        local display = assert(presentation[instance.cardId], "missing deck presentation " .. instance.cardId)
        local face = control:GetChild("face")
        local binding = self.bindings[control]
        local text=cardBody(display,definition,instance,battle)
        local printed=catalog.cards[instance.cardId]
        local base=instance.upgraded and printed.upgrade and printed.upgrade.cost or printed.cost
        local selected=false
        for _,uid in ipairs(self.choiceSelected or {}) do if uid==instance.uid then selected=true end end
        local appearance=self.browserShell and CardSkin.referenceGeometry(face)
            and appearanceOf(face,instance,display,definition,base,text)
        local accepted,artPending=paintFace(control,face,instance,display,definition,base,selected,text,binding,appearance)
        if self.generation~=generation or control.alive==false then return false end
        local hit=control:GetChild('hit')
        if hit.visible~=true then accepted=hit:SetVisible(true)~=false and accepted end
        if self.generation~=generation then return false end
        bindCard(control,hit,instance,accepted and text or nil,fill)
        local painted=self.bindings[control]
        if control.visible~=true then accepted=control:SetVisible(true)~=false and accepted end
        if self.generation~=generation then return false end
        painted.appearance,painted.nativeArt=accepted and appearance or nil,artPending
        return true
    end
    local function detailVersion(instance,display,state,battle)
        local definition=Combat.cardDefinition(state,instance)
        -- V4 combat tooltips retain printable rules in piles where no target is selected.
        local text=cardBody(display,definition,instance,not definition.originalV4 and battle)
        return {instance=instance,definition=definition,text=text}
    end
    local function cardNotes(context,version,fits)
        local definition,instance=version.definition,version.instance
        local notes={}
        if definition.originalV4 then
            notes[#notes+1]=OriginalDisplay.describe(definition,instance.upgraded)
            notes[#notes+1]=OriginalDisplay.keywordDefinitions(definition,instance.upgraded)
        elseif not fits then notes[#notes+1]=version.text:gsub('<color=#[%x]+>',''):gsub('</color>','') end
        notes[#notes+1]=context.provenance
        local text=table.concat(notes,'\n'):gsub('^%s+',''):gsub('%s+$','')
        local pages=paginate(text,noteWidth,noteHeight)
        if #pages==1 then pages[1]=text end
        return pages
    end
    local function paintCardNotes()
        local context=self.cardDetail
        local page=context.notePage
        local pages=context.notes
        details.text=pages[page] or ''
        if #pages>1 then details.text=details.text..'\n\n下一页 · '..page..'/'..#pages end
        details:SetVisible(#pages>0);detailHit:SetVisible(#pages>1)
    end
    local function paintCardDetail(context,version)
        local definition=version.definition
        local fits=paintCardText(detailFace,version.instance,context.display,definition,version.text)
        local last=context.painted
        local art=detailFace:GetChild('art')
        if not last or last.type~=definition.type then CardDisplay.writeArt(art,definition,picture,detailFace) end
        local nativeArt=context.display.nativeArt
        -- The hidden grid retains its artwork pools for the immediate return.
        -- The inspector uses the normal fallback for incrementally built art.
        if not last and nativeArt and not nativeArt.runtime then
            CardDisplay.writeNativeArt(detailFace,definition,nativeArt,platform,art,context.instance.uid)
        end
        if not last or last.type~=definition.type or last.rarity~=definition.rarity or last.cost~=definition.cost then
            paintCardSkin(detailFace,definition,{cost=definition.cost,baseCost=definition.cost,surfaceScope='deck',
                templateKind=not last and Theme.presentationProfile=='official-assets-first' and 'attack' or nil})
        end
        context.painted=definition
        version.notes=version.notes or cardNotes(context,version,fits)
        context.notes,context.notePage=version.notes,1
        paintCardNotes()
        for _,state in ipairs({'normal','hover','pressed','disabled'})do
            upgradePreview:GetChild('hit'):GetChild(state):GetChild('label').text=context.preview and '查看当前' or '查看升级'
        end
        return true
    end
    function self.showCardDetails(_,instance)
        if not self.visible or self.choiceToken or inDetail() then return false end
        local state=self.battle or {catalog=self.catalog}
        local current=Combat.copy(instance)
        local display=assert(presentation[current.cardId],'missing detail presentation')
        local context={instance=current,display=display,combat=self.battle~=nil,preview=false,
            current=detailVersion(current,display,state,self.battle),provenance=CardOrigin.describe(self.run,current,self.battle~=nil)}
        local upgraded=Combat.copy(current)
        if Combat.upgrade(state,upgraded)then context.upgraded=detailVersion(upgraded,display,state,self.battle)end
        self.cardDetail=context
        if self.paged then pool:cancel();self.pendingGrid=false end
        returnRevision=returnRevision+1
        details:SetAnchoredPosition(360,30);details:SetSizeDelta(noteWidth,noteHeight)
        detailHit:SetAnchoredPosition(360,30);detailHit:SetSizeDelta(noteWidth,noteHeight)
        for _,name in ipairs({'previous','next','pageHint'})do root:GetChild(name):SetVisible(false)end
        grid:SetVisible(false)
        paintCardDetail(context,context.current)
        cardFocus:SetVisible(true);upgradePreview:SetVisible(context.upgraded~=nil)
        closeLabel('返回');paintBrowse()
        if onChanged then onChanged()end
        return true
    end
    function self.toggleUpgradePreview(_)
        local context=self.cardDetail
        if not self.visible or not context or not context.upgraded then return false end
        context.preview=not context.preview
        return paintCardDetail(context,context.preview and context.upgraded or context.current)
    end
    local function browserModel(instance)
        local battle=self.pileKind and self.battle
        local definition=Combat.cardDefinition(battle or {catalog=self.catalog},instance)
        local display=assert(presentation[instance.cardId],'missing browser presentation')
        local printed=self.catalog.cards[instance.cardId]
        local base=printedField(printed,instance,'cost')
        local text=cardBody(display,definition,instance,battle)
        return {definition=definition,display=display,instance=instance,text=text,base=base,
            look={definition.id,definition.type,definition.rarity or false,definition.color or false,
                definition.originalV4 and definition.originalV4.role or false,display.name,not not instance.upgraded,
                definition.repeatable and (instance.upgrades or 1) or false,definition.cost,definition.costMode or false,
                base or false,not not self.pileView,text}}
    end
    local function paintBrowser(entry,model,unchanged,current)
        local face,definition,instance=entry.face,model.definition,model.instance
        if not unchanged then
            CardDisplay.writeTitle(face:GetChild('name'),model.display.name,instance.upgraded,
                definition.repeatable and (instance.upgrades or 1) or nil,face:GetChild('type'),typeNames[definition.type] or definition.type,browserFit)
            if not current() then return end
            if entry.bodyText~=model.text then
                local _,accepted=CardDisplay.writeBody(face:GetChild('label'),model.text,face,browserFit)
                assert(accepted~=false,'deck browser body geometry rejected')
                if not current() then return end
                entry.bodyText=model.text
            end
            face:GetChild('name').fontColor=colour(Theme.cardSkin.text.title)
            if Theme.cardSkin.text.body then face:GetChild('label').fontColor=colour(Theme.cardSkin.text.body) end
            face:GetChild('cost').text=definition.cost==-2 and '' or definition.costMode=='all_energy' and 'X' or tostring(definition.cost)
            paintDeckPalette(face,definition)
            assert(CardDisplay.writeArt(entry.art,definition,picture,face)~=false,'deck browser art geometry rejected')
            if not current() then return end
            CardSkin.apply(face,definition,platform,{cost=definition.cost,baseCost=model.base,
                surfaceScope=self.pileView and 'battle' or 'deck',staticCost=self.browserShell,referenceParts=entry.parts,
                templateKind=self.browserShell and 'attack' or nil,templateMaterials=self.browserShell})
        end
        if not current() then return end
        if model.display.nativeArt then
            entry.nativeArt=true
            CardDisplay.writeNativeArt(face,definition,model.display.nativeArt,platform,entry.art,instance.uid)
        elseif entry.art.visible~=true then
            entry.art:SetVisible(true)
        end
    end
    if pileGrid and platform.deckBrowser then
        local viewport=official and Theme.layout.deckView.pileViewport or Theme.layout.deckView.viewport
        pool=Browser.new(pileGrid,platform.deckBrowser,platform,clickEvent,viewport[4]/2-123,browserModel,paintBrowser,
            function(instance)
                return self:showCardDetails(instance)
            end)
    end
    function self.syncRun(_,run)
        if browserRun==run then return end
        browserRun=run
        if self.paged and self.visible and not self.previewInfo and self.run~=run then self:close() end
        self.savedPage,self.masterSort=nil,nil
        if pool then pool:release() end
    end
    function self.releaseBrowser()
        if pool then pool:release() end
    end
    function self.onEngineDestroy()
        if pool then pool:release(true) end
    end
    -- Pure presentation projection. The permanent deck and the three combat
    -- piles retain their UIDs, acquisition order and RNG state unchanged.
    local function sortKey(card,printed)
        local repeatable=printedField(printed,card,'repeatable')
        local suffix=card.upgraded and ('+'..(repeatable and tostring(card.upgrades or 1) or '')) or ''
        local name=assert(presentation[card.cardId],'missing deck name').name..suffix
        if self.sortMode=='type' then return string.upper(printedField(printed,card,'type'))..name end
        -- MasterDeck compares printed cost, not the transient costForTurn adapter.
        local cost=card.costOverride
        if cost==nil then cost=printedField(printed,card,'cost') end
        if printedField(printed,card,'costMode')=='all_energy' then cost=-1 end
        return tostring(cost)..name
    end
    local function sortedProjection()
        local entries={}
        for i,card in ipairs(self.allCards)do
            local printed=assert(self.catalog.cards[card.cardId],"unknown card")
            entries[i]={card=card,index=i,key=self.sortMode=='original' and i or sortKey(card,printed)}
        end
        local ascending=self.sortAscending
        table.sort(entries,function(a,b)
            if a.key==b.key then return a.index<b.index end
            if ascending then return a.key<b.key end
            return a.key>b.key
        end)
        local cards={}
        for i,entry in ipairs(entries)do cards[i]=entry.card end
        return cards
    end
    local function projectCards()
        if self.pileKind or self.sortMode=='original' and self.sortAscending then
            self.cards=self.allCards
        else
            self.cards=sortedProjection()
        end
    end
    local function pageControls(shown,page,pages,total)
        previousControl:SetVisible(shown)
        nextControl:SetVisible(shown)
        pageHint:SetVisible(shown)
        if not shown then return end
        local before,after=page>1,page<pages
        previousHit.interactable,previousHit.raycastTarget=before,before
        nextHit.interactable,nextHit.raycastTarget=after,after
        pageHint.text='第 '..page..'/'..pages..' 页 · '..total..' 张'
    end
    browserRequest=function()
        self.generation=self.generation+1
        self.pending,self.calibrating=false,false
        self.contentRevision=self.contentRevision+1
        self.pageCount=math.ceil(#self.cards/Browser.pageSize)
        self.pageIndex=math.max(1,math.min(self.pageIndex,self.pageCount))
        local cards={}
        for i=(self.pageIndex-1)*Browser.pageSize+1,math.min(self.pageIndex*Browser.pageSize,#self.cards) do
            cards[#cards+1]=self.cards[i]
        end
        pageControls(true,self.pageCount>0 and self.pageIndex or 0,self.pageCount,#self.allCards)
        if empty then empty:SetVisible(#cards==0) end
        require('abyss_page_reveal').registerSource(platform,'deckPanel')
        pool:request(cards)
        self.pendingGrid=#cards>0
        self.preparedCards,self.prepareError=0,nil
    end
    local function refreshGrid()
        if self.paged then browserRequest();return end
        self.gridReady=nil
        self.generation=self.generation+1
        local generation=self.generation
        local cards,catalog=self.cards,self.catalog
        -- Only the shared official browser publishes a complete same-page list.
        -- Legacy/choice grids retain their calibration-then-update transaction.
        self.indexBase=self.browserShell and indexBases[grid] or nil
        self.pending,self.calibrating=false,false
        grid.scrollProgress=0
        if #cards==0 then
            self.pendingGrid=false
            liveFaces(CardDisplay.clearNativeArt)
            grid:RefreshItems(0,function()end);liveFaces();return
        end
        if self.indexBase~=nil then
            self.pending=true;self:update(0);return
        end
        self.calibrating=true
        -- Calibrate native 0/1 based indices before scheduling the complete list.
        grid:RefreshItems(#cards>0 and 1 or 0,function(control,index)
            if not self.visible or self.generation~=generation or not self.calibrating or self.indexBase~=nil then return end
            self.indexBase,self.pending=index,true
            indexBases[grid]=index
            -- The official viewport is still covered. The probe owns an index,
            -- while the real refresh owns the first complete visible window.
            if self.browserShell then control:SetVisible(false)
            else fill(control,cards[1],catalog) end
        end)
        liveFaces()
        -- A synchronous probe lets the shared browser paint before the click returns.
        if self.browserShell and self.pending and self.generation==generation then self:update(0) end
    end
    local function changeBrowse()
        if not self.paged then self.contentRevision=self.contentRevision+1 end
        self.pageIndex=1
        projectCards()
        paintBrowse()
        if not self.browserShell then
            root:GetChild('title').text=self.listTitle
        end
        refreshGrid()
        if self.browserShell then pileReturn:SetAsLastSibling()end
        if onChanged then onChanged()end
        return true
    end
    function self.setSort(_,mode)
        if not canBrowse() or self.pileKind or not sortNames[mode] then return false end
        self.sortMode=mode
        self.sortDirections[mode]=not self.sortDirections[mode]
        self.sortAscending=self.sortDirections[mode]
        self.masterSort={run=self.run,mode=mode,directions=self.sortDirections,ascending=self.sortAscending}
        return changeBrowse()
    end
    local function restoreSort(run)
        self.sortMode,self.sortAscending='original',true
        self.sortDirections={original=false,type=false,cost=false}
        local saved=self.masterSort
        if saved and (saved.run~=run or not sortNames[saved.mode]) then self.masterSort=nil;saved=nil end
        if saved and not self.pileKind and not self.choiceToken then
            self.sortMode,self.sortAscending,self.sortDirections=saved.mode,saved.ascending,saved.directions
        end
    end
    local function choicePrompts(choice)
        return {codex='尼利宝典：选择一张牌洗入抽牌堆（可跳过）',silentFinal=choice and (choice.kind=='retain'and '选择本回合保留的手牌（可不选）'or choice.kind=='setup'and '选择放回牌堆顶并准备的牌'or '选择下回合复制的手牌'),watcher_final=choice and choice.kind=='wish' and '许愿：选择一种效果' or '异界之援：选择一张攻击',discover="选择加入手牌的牌，本回合费用为0",colorless=cardChoiceTitle,exhaustChoose="选择要消耗的牌",recoverExhaust="选择要回收的牌",discardToDraw="选择放回抽牌堆顶的牌",
            exhaustMany='选择任意张手牌消耗（可不选）',discardRedraw='选择任意张手牌丢弃并重抽',discardToHand='选择弃牌回手，本回合费用为0',
            handToDraw="选择放回抽牌堆顶的手牌",upgradeHand="选择要升级的牌",dualWield="选择要复制的攻击或能力牌"}
    end
    local function openBrowserShell(choice,pileKind)
        self.pileView=(official or self.paged) and pileNames[pileKind]~=nil
        -- Visual shell selection never determines the snapshot, combat context or
        -- card surface owner. Permanent browsing still projects only run.deck.
        self.browserShell=Theme.presentationProfile=='official-assets-first' and choice==nil
        grid=self.paged and pileGrid or (self.browserShell and pileGrid and pileGrid.RefreshItems and pileGrid or browserGrid)
        browserGrid:SetVisible(not self.paged and grid==browserGrid)
        if pileGrid then pileGrid:SetVisible(not self.paged and grid==pileGrid) end
        if Theme.presentationProfile=='official-assets-first' then
            local chrome=root:GetChild('pileChrome')
            chrome:SetVisible(self.browserShell)
            root:GetChild('veil'):SetVisible(not self.browserShell)
        end
        root:GetChild('header'):SetVisible(not self.browserShell)
    end
    function self.open(_, run, choice, onPick, pileKind)
        if self.visible then return false end
        self.openSession=self.openSession+1
        self.generation = self.generation + 1
        local cards, catalog
        if pileKind then
            cards,catalog=pileCards(run,pileKind,presentation),run.combat.catalog
        else
            cards,catalog=permanentOrChoiceCards(run,choice)
        end
        self.choiceToken,self.onPick,self.battle=choice and choice.token,onPick,(choice or pileKind) and run.combat
        self.pileKind=pileKind
        self.paged=pool~=nil and choice==nil
        if self.paged and not self.previewInfo then self:syncRun(run) end
        openBrowserShell(choice,pileKind)
        if Theme.presentationProfile=='official-assets-first' then root:GetChild('pileChrome'):GetChild('empty'):SetVisible(self.browserShell and #cards==0)end
        self.multiple,self.choiceSelected=choice and choice.multiple,choice and choice.selected
        self.optional=choice and choice.optional
        self.visible,self.run,self.allCards,self.cards,self.catalog=true,run,cards,cards,catalog
        self.browseEnabled=choice==nil
        restoreSort(run)
        local entry=self.previewInfo and ('starter:'..self.previewInfo.id) or pileKind or 'deck'
        local saved=self.paged and self.savedPage
        self.entry=entry
        self.pageIndex=1
        if saved and saved.entry==entry and saved.battle==(pileKind and run.combat or nil) then
            self.pageIndex=saved.page
        end
        self.detailOnly,self.detailPages,self.cardDetail=nil,nil,nil
        upgradePreview:SetVisible(false)
        grid:SetVisible(not self.paged);details:SetVisible(false);detailHit:SetVisible(false)
        self.indexBase, self.pending, self.calibrating = nil, false, true
        root:SetVisible(true)
        root:SetAsLastSibling()
        self.listTitle=browserHeading(pileKind).." · "..#cards.." 张"
        if self.browseEnabled then projectCards() end
        root:GetChild("title").text = choice and choicePrompts(choice)[choice.op] or self.listTitle
        if Theme.presentationProfile=='official-assets-first' then
            root:GetChild('pileReturn'):SetVisible(self.browserShell)
        end
        if self.multiple then root:GetChild('title').text=root:GetChild('title').text..' · 已选'..#choice.selected..(choice.required and '/'..choice.required or '') end
        local closeButton=root:GetChild('close')
        closeButton:SetVisible(not self.browserShell and (not choice or self.multiple==true or self.optional==true))
        if not self.browserShell then
            local close=closeButton:GetChild('hit')
            close.interactable=not choice or self.optional==true or self.multiple and (not choice.required or #choice.selected==choice.required) or false
            close.raycastTarget=close.interactable
            closeLabel(self.optional and '跳过' or self.multiple and '确认选择' or '关闭')
        end
        paintBrowse()
        if self.paged then NativeArt.setLeasePage('deckPanel') end
        refreshGrid()
        if self.browserShell then pileReturn:SetAsLastSibling()end
        return true
    end
    function self.openPreview(_,info)
        if self.visible then return false end
        local context,display=M.previewContext(info)
        if not context then return false,display end
        local previous,sort=presentation,self.masterSort
        self.previewInfo,self.previousPresentation,self.previewMasterSort=info,previous,sort
        presentation=display
        local ok,reason=self:open(context)
        if not ok then
            presentation=previous;self.masterSort=sort
            self.previewInfo,self.previousPresentation,self.previewMasterSort=nil,nil,nil
        end
        return ok,reason
    end
    function self.openPile(_, run, kind)
        if not pileNames[kind] or not run or run.phase~="combat" or not run.combat
            or run.combat.phase~="player" or type(run.combat[kind])~="table" then return false end
        return self:open(run,nil,nil,kind)
    end
    local function paintGrid(cards,catalog,base,generation)
        local cells,indices={},{}
        local complete,refreshing,painted=false,true,0
        self.pendingGrid=true
        local function ready()
            if not self.visible or self.generation~=generation or inDetail() then return true end
            local currentFirst,currentLast=visibleCardWindow(grid,#cards,gridColumns())
            complete=visibleCardsReady(cells,currentFirst,currentLast)
            self.pendingGrid=not complete
            return complete,painted
        end
        self.gridReady=ready
        local function prepared(index,control)
            local previous=indices[control]
            if previous and cells[previous]==control then cells[previous]=nil end
            indices[control]=nil
            if index>=1 and index<=#cards then
                cells[index],indices[control]=control,index;painted=painted+1
            end
            if not refreshing and not complete then ready() end
        end
        grid:RefreshItems(#cards,function(control,index)
            if not self.visible or self.generation~=generation then return end
            local key=index-base+1
            local instance=cards[key]
            if not instance then CardDisplay.clearNativeArt(control:GetChild('face'));control:SetVisible(false);prepared(0,control);return end
            if fill(control,instance,catalog) then prepared(key,control) end
        end)
        refreshing=false
        ready()
    end
    function self.update(_, dt)
        if self.paged then
            if not inDetail() and self.pendingGrid then
                require('abyss_page_reveal').registerSource(platform,'deckPanel')
                pool:step()
                local job=pool.job
                if job and job.assigned then self.preparedCards=job.next-1 end
                if job and job.error then
                    self.prepareError=job.error;self.pendingGrid=false
                    if not platform.presentationReady then pageHint.text='卡牌加载失败，返回后可重试' end
                elseif job and job.ready then
                    self.pendingGrid=false
                end
            end
            return
        end
        if not self.visible or inDetail() then liveFaces();return end
        if self.browserShell then liveFaces()
        else liveFaces(function(face)CardSkin.tick(face,dt or 0)end) end
        if not self.pending then return end
        self.pending, self.calibrating = false, false
        local generation, cards, catalog, base = self.generation, self.cards, self.catalog, self.indexBase
        paintGrid(cards,catalog,base,generation)
        liveFaces()
    end
    function self.stepPage(_,delta)
        if not self.paged or inDetail() then return false end
        local page=self.pageIndex+delta
        if page<1 or page>self.pageCount then return false end
        self.pageIndex=page
        browserRequest()
        if onChanged then onChanged() end
        return true
    end
    local resetPileReturn
    function self.close(_)
        if not self.visible then return false end
        if self.paged then
            self.savedPage={entry=self.entry,battle=self.pileKind and self.battle,page=self.pageIndex}
            pool:cancel()
            NativeArt.setLeasePage(nil)
            pageControls(false)
            if empty then empty:SetVisible(false) end
        end
        if self.previewInfo then presentation=self.previousPresentation;self.masterSort=self.previewMasterSort end
        self.previewInfo,self.previousPresentation,self.previewMasterSort=nil,nil,nil
        self.generation = self.generation + 1
        self.visible, self.pending, self.calibrating, self.run, self.cards, self.catalog = false, false, false, nil, nil, nil
        self.pendingGrid=false;self.gridReady=nil
        self.allCards,self.browseEnabled,self.sortMode,self.sortAscending,self.sortDirections=nil,nil,nil,nil,nil
        self.choiceToken,self.onPick,self.battle=nil,nil,nil
        self.pileKind,self.listTitle=nil,nil
        self.multiple,self.choiceSelected,self.optional=nil,nil,nil
        hideCardDetail()
        self.detailPages,self.detailOnly=nil,nil
        self.closeOnOutside=nil
        upgradePreview:SetVisible(false)
        if self.relicView then self.relicView:close();self.relicView=nil end
        details:SetVisible(false);detailHit:SetVisible(false)
        root:SetVisible(false);liveFaces(CardDisplay.clearNativeArt)
        if not self.paged then grid:RefreshItems(0, function() end) end
        self.paged,self.prepareError=nil,nil
        if pileGrid then pileGrid:SetVisible(false) end
        root:GetChild('header'):SetVisible(true)
        self.pileView,self.browserShell=nil,nil;grid=browserGrid
        root:GetChild('veil'):SetVisible(true)
        if Theme.presentationProfile=='official-assets-first' then
            resetPileReturn()
            for _,name in ipairs({'pileChrome','pileReturn'})do root:GetChild(name):SetVisible(false)end
        end
        paintBrowse()
        liveFaces()
        return true
    end
    local previewHit=upgradePreview:GetChild('hit')
    previewHit:AddCursorEventListener(clickEvent,function()
        if Pointer.blocked(platform)then return false end
        return self:toggleUpgradePreview()
    end)
    root.disableCursorEventPassthrough = true
    local blocker=root:GetChild('blocker')
    local outsideHeld,outsideReleased,outsideObserved
    if cursor.CursorDown and cursor.CursorUp then
        blocker:AddCursorEventListener(cursor.CursorDown,function(event)
            outsideObserved=true;outsideReleased=nil
            outsideHeld=self.visible and self.closeOnOutside and {generation=self.generation,touch=event and event.touchId} or nil
        end)
        blocker:AddCursorEventListener(cursor.CursorUp,function(event)
            outsideReleased=outsideHeld and outsideHeld.touch==(event and event.touchId) and outsideHeld or nil
            outsideHeld=nil
        end)
        for _,event in pairs({cursor.CursorExit,cursor.CursorEndDrag})do
            if event then blocker:AddCursorEventListener(event,function()outsideHeld,outsideReleased=nil,nil end)end
        end
    end
    blocker:AddCursorEventListener(clickEvent,function(event)
        local token=outsideReleased;outsideHeld,outsideReleased=nil,nil
        if Pointer.blocked(platform) or not self.visible or not self.closeOnOutside then return true end
        if outsideObserved or event and event.touchId~=nil then
            if not token or token.generation~=self.generation or token.touch~=(event and event.touchId) then return true end
        end
        onClose();return true
    end)
    local function nextPage()
        if not self.visible then return false end
        local context=self.cardDetail
        if context and #context.notes>1 then
            context.notePage=context.notePage%#context.notes+1;paintCardNotes();return true
        end
        if not self.detailPages then return false end
        self.detailPage=self.detailPage%#self.detailPages+1;detailPage();return true
    end
    detailHit:AddCursorEventListener(clickEvent,function()
        if Pointer.blocked(platform)then return false end
        return nextPage()
    end)
    function self.back(_)
        if not self.visible then return false end
        if self.cardDetail then
            hideCardDetail();details:SetVisible(false);detailHit:SetVisible(false);grid:SetVisible(not self.paged)
            closeLabel('关闭');paintBrowse()
            if self.paged then browserRequest() else self:update(0) end
            if onChanged then onChanged()end
            return true
        end
        if self.detailPages and not self.detailOnly then
            self.detailPages,self.cardDetail=nil,nil;upgradePreview:SetVisible(false);details:SetVisible(false);detailHit:SetVisible(false);grid:SetVisible(not self.paged)
            titleControl.text=self.listTitle;closeLabel('关闭');paintBrowse()
            if self.paged then
                browserRequest()
                if onChanged then onChanged() end
            else self.pending=true end
            return true
        end
        if self.multiple or self.optional then
            if not root:GetChild('close'):GetChild('hit').interactable or not self.run or self.run.combat~=self.battle
                or not self.battle.pendingChoice or self.battle.pendingChoice.token~=self.choiceToken then return false end
            local callback,token=self.onPick,self.choiceToken
            self:close();return callback(token,0)
        end
        if self.choiceToken then return false end
        return onClose()
    end
    local close=root:GetChild('close'):GetChild('hit')
    close:AddCursorEventListener(clickEvent,function()
        local swallow=self.visible and self.browserShell
        if Pointer.blocked(platform)then return swallow or false end
        local result=self:back()
        return swallow or result
    end)
    local function bindOfficialBrowser()
        if Theme.presentationProfile~='official-assets-first' then return end
        for _,mode in ipairs(browseSorts)do
            local hit=deckSort:GetChild(mode):GetChild('hit')
            hit:AddCursorEventListener(clickEvent,function()
                if Pointer.blocked(platform)then return true end
                return self.browserShell and self:setSort(mode) or false
            end)
        end
        resetPileReturn=bindPileReturn(self,root:GetChild('pileReturn'),platform,cursor,clickEvent,function()return returnRevision end)
    end
    bindOfficialBrowser()
    for _,name in ipairs({'previous','next'})do
        local box=root:GetChild(name)
        if box then
            local delta=name=='previous' and -1 or 1
            local action=function()return self:stepPage(delta)end
            box:GetChild('hit'):AddCursorEventListener(clickEvent,function()
                if Pointer.blocked(platform)then return false end
                return action()
            end)
        end
    end
    local keys=platform.keyEvents
    if pool and keys and root.AddKeyEventListener then
        for _,action in ipairs({{'KeyboardCraftspersonKey38Down',-1},{'KeyboardCraftspersonKey39Down',1}}) do
            local event=keys[action[1]]
            local delta=action[2]
            if event then
                root:AddKeyEventListener(event,function()
                    if self.paged and not Pointer.blocked(platform) then return self:stepPage(delta) end
                    return false
                end)
            end
        end
    end
    for _,mode in ipairs(browseSorts)do
        local hit=root:GetChild('sort'..mode):GetChild('hit')
        local action=function()return self:setSort(mode)end
        hit:AddCursorEventListener(clickEvent,function()
            if Pointer.blocked(platform)then return false end
            return action()
        end)
    end
    root:SetVisible(false)
    return self
end
return M
