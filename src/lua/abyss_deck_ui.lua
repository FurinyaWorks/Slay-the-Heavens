local CardSkin=require('abyss_card_skin')
-- Read-only deck/pile snapshots. No Run commands or RNG consumption.
local Combat = require("abyss_combat")
local Theme = require("abyss_theme")
local CardDisplay = require('abyss_card_display')
local OriginalDisplay = require('abyss_original_v4_display')
local CardOrigin = require('abyss_card_origin_view')
local M = {}
local Controller = require('abyss_controller')
local RoundedButton = require('abyss_rounded_button')
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
-- Match the original game's display categories; never sort an actual combat pile.
local browseFilters={{id='all',control='All'},{id='attack',control='Attack'},
    {id='skill',control='Skill'},{id='power',control='Power'},
    {id='status',control='Status'},{id='curse',control='Curse'}}
local browseSorts={'original','type','cost'}
local sortNames={original='获得顺序',cost='耗能',type='类型',name='名称'}
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
            if not available() or Controller.pointerBlocked(platform.controller) then return end
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
            if not available() or Controller.pointerBlocked(platform.controller) then
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
        if not available() or Controller.pointerBlocked(platform.controller) then return false end
        if observed or cursor.CursorDown and cursor.CursorUp and touch(event) ~= nil then
            if not current(released) or released.touch ~= touch(event) then return false end
            released = nil
        end
        return deck:back()
    end)
    Controller.bind(platform.controller, hit, 'deck', function() return deck:back() end, available, 100)
    return reset
end

function M.new(root, presentation, clickEvent, platform, onClose)
    local self = { root = root, visible = false, generation = 0, openSession=0,contentRevision=0,bindings={} }
    local onChanged=platform.deckChanged
    local returnRevision=0
    function self.setPresentation(_, value)
        assert(not self.visible and type(value)=="table", "cannot replace visible deck presentation")
        presentation=value
    end
    local browserGrid = assert(root:GetChild("grid"), "missing deck grid")
    local pileGrid = root:GetChild('pileGrid')
    local grid = browserGrid
    local indexBases=setmetatable({},{__mode='k'})
    local function gridColumns() return self.browserShell and 5 or Theme.layout.deckView.columns end
    local function browserHeading(kind)
        if self.previewInfo then return '初始牌组' end
        return pileNames[kind] or '卡组'
    end
    local function liveFaces(fn)
        for control,binding in pairs(self.bindings)do
            if control.alive==false then
                Controller.unbind(platform.controller,binding.hit,true)
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
        return self.visible == true and self.browseEnabled == true and not self.browserShell and not self.detailOnly and not inDetail()
    end
    local function paintPileSort()
        if not self.browserShell then return end
        local tools=root:GetChild('pileTools')
        for _,mode in ipairs({'original','type','cost','name'})do
            local box=tools:GetChild(mode)
            local label,arrow=box:GetChild('label'),box:GetChild('direction')
            label.text=mode=='original' and '默认' or mode=='cost' and '费用' or sortNames[mode]
            arrow:SetVisible(true)
            local selected=self.sortMode==mode
            arrow.localRotationZ=selected and not self.sortAscending and 180 or 0
            if platform.color then
                local ink=selected and platform.color(228,211,94,255) or platform.color(233,230,220,255)
                label.fontColor,arrow.imageColor=ink,ink
            end
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
        if Theme.presentationProfile=='official-assets-first' then
            root:GetChild('pileTools'):SetVisible(self.browserShell==true and not inDetail())
        end
        root:GetChild('title'):SetVisible(not active and not self.browserShell and not self.cardDetail)
        if self.browserShell then
            local heading=root:GetChild('pileChrome'):GetChild('heading')
            if not inDetail() then heading.text=self.listTitle end
            heading:SetVisible(self.cardDetail==nil)
            paintPileSort()
            return -- The legacy filters and sort buttons stay hidden in this shell.
        end
        local heading=root:GetChild('browseTitle')
        heading:SetVisible(active)
        if active then heading.text=self.listTitle end
        paintBrowseSort(active)
        for _,filter in ipairs(browseFilters)do
            local control=root:GetChild('filter'..filter.control)
            control:SetVisible(active)
            control:GetChild('selected'):SetVisible(active and self.typeFilter==filter.id)
        end
    end
    local function detailPage()
        root:GetChild('title').text=self.detailTitle..' · '..self.detailPage..'/'..#self.detailPages
        if self.browserShell then root:GetChild('pileChrome'):GetChild('heading').text=root:GetChild('title').text end
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
        liveFaces(CardDisplay.clearNativeArt)
        self.detailTitle=title
        self.detailPage=1;grid:SetVisible(false);details:SetVisible(true);detailHit:SetVisible(true)
        closeLabel('返回');detailPage();paintBrowse()
        if self.browserShell then root:GetChild('pileReturn'):SetAsLastSibling()end
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
    local function picture(control,id) control:SetImage(platform.imageSource,id) end
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
                if Controller.pointerBlocked(platform.controller) or Controller.pointerDragged(event, Theme.layout.cardDrag.threshold) then return false end
                return pick()
            end)
            Controller.bind(platform.controller,hit,'deck',pick,function()
                local b=self.bindings[control]
                return control.alive~=false and self.visible and not inDetail() and b~=nil and b.generation==self.generation
            end,10)
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
        CardDisplay.writeTitle(face:GetChild("name"),display.name,instance.upgraded,
            definition.repeatable and (instance.upgrades or 1) or nil,face:GetChild("type"),typeNames[definition.type] or definition.type)
        local label=face:GetChild('label')
        local fits=bodyUnchanged or CardDisplay.writeBody(label,text,face)
        if Theme.cardSkin.text.body then label.fontColor=colour(Theme.cardSkin.text.body)end
        face:GetChild("cost").text = definition.cost == -2 and "" or definition.costMode == "all_energy" and "X" or tostring(definition.cost)
        return fits
    end
    local function paintCardArt(face,definition,display,uid)
        local art=face:GetChild('art')
        CardDisplay.writeArt(art,definition,picture,face)
        CardDisplay.writeNativeArt(face,definition,display.nativeArt,platform,art,uid)
    end
    local function paintCardSkin(face,definition,look)
        face:GetChild("name").fontColor=colour(Theme.cardSkin.text.title)
        tint(face:GetChild("border"), Theme.color.rarity[definition.rarity] or Theme.color.line)
        tint(face:GetChild("nameBand"), Theme.color.rarityBand[definition.rarity] or Theme.color.rarityBand.basic)
        tint(face:GetChild("nameRule"), Theme.color.rarity[definition.rarity] or Theme.color.line)
        tint(face:GetChild("artPlate"), Theme.color.cardType[definition.type] or Theme.color.panelRaised)
        CardSkin.apply(face,definition,platform,look)
    end
    local function fill(control, instance, catalog)
        PageReveal.registerSource(platform,'deckPanel')
        local battle=(self.choiceToken or self.pileKind) and self.battle
        local definition = Combat.cardDefinition(battle or {catalog=catalog}, instance)
        local display = assert(presentation[instance.cardId], "missing deck presentation " .. instance.cardId)
        local face = control:GetChild("face")
        local binding = self.bindings[control]
        local text=cardBody(display,definition,instance,battle)
        paintCardText(face,instance,display,definition,text,self.browserShell and binding and binding.bodyText==text)
        paintCardArt(face,definition,display,instance.uid)
        local printed=catalog.cards[instance.cardId]
        local base=instance.upgraded and printed.upgrade and printed.upgrade.cost or printed.cost
        local selected=false
        for _,uid in ipairs(self.choiceSelected or {}) do if uid==instance.uid then selected=true end end
        paintCardSkin(face,definition,{cost=definition.cost,baseCost=base,selected=selected,
            surfaceScope=self.pileView and 'battle' or 'deck',templateKind=self.browserShell and 'attack' or nil,
            templateMaterials=self.browserShell})
        if self.browserShell then
            face:GetChild('nativePlayableRim'):SetVisible(false)
            face:GetChild('glow'):SetVisible(false)
            face:GetChild('costHalo'):SetVisible(false)
        end
        control:GetChild("uid").text = selected and '已选择' or ''
        local hit=control:GetChild('hit')
        hit:SetVisible(true)
        bindCard(control,hit,instance,text,fill)
        control:SetVisible(true)
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
        notes[#notes+1]=CardOrigin.keywords(definition)
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
    -- Pure presentation projection. The permanent deck and the three combat
    -- piles retain their UIDs, acquisition order and RNG state unchanged.
    local function sortKey(card,printed)
        local repeatable=printedField(printed,card,'repeatable')
        local suffix=card.upgraded and ('+'..(repeatable and tostring(card.upgrades or 1) or '')) or ''
        local name=assert(presentation[card.cardId],'missing deck name').name..suffix
        if self.sortMode=='type' then return string.upper(printedField(printed,card,'type'))..name end
        if self.sortMode=='name' then return name end
        -- MasterDeck compares printed cost, not the transient costForTurn adapter.
        local cost=card.costOverride
        if cost==nil then cost=printedField(printed,card,'cost') end
        if printedField(printed,card,'costMode')=='all_energy' then cost=-1 end
        return tostring(cost)..name
    end
    local function sortedProjection()
        local entries={}
        local sorted=not self.pileKind or self.pileView
        local needsKey=sorted and self.sortMode~='original'
        for i,card in ipairs(self.allCards)do
            local printed=assert(self.catalog.cards[card.cardId],"unknown card")
            if self.typeFilter=='all' or printedField(printed,card,'type')==self.typeFilter then
                entries[#entries+1]={card=card,index=i,key=needsKey and sortKey(card,printed) or i}
            end
        end
        if sorted then
            local ascending=self.sortAscending
            table.sort(entries,function(a,b)
                if a.key==b.key then return a.index<b.index end
                if ascending then return a.key<b.key end
                return a.key>b.key
            end)
        end
        local cards={}
        for i,entry in ipairs(entries)do cards[i]=entry.card end
        return cards
    end
    local function projectCards()
        if self.typeFilter=='all' and (self.sortMode=='original' and self.sortAscending or self.pileKind and not self.pileView) then
            self.cards=self.allCards
        else
            self.cards=sortedProjection()
        end
        local total=#self.allCards
        local amount=self.typeFilter=='all' and tostring(total) or #self.cards..'/'..total
        self.listTitle=browserHeading(self.pileKind)..' · '..amount..' 张'
    end
    local function refreshGrid()
        self.gridReady=nil
        self.generation=self.generation+1
        local generation=self.generation
        local cards,catalog=self.cards,self.catalog
        self.controllerPage=1
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
        self.contentRevision=self.contentRevision+1
        paintPileSort()
        projectCards()
        if not self.browserShell then
            root:GetChild('title').text=self.listTitle
            paintBrowse()
        end
        refreshGrid()
        if self.browserShell then root:GetChild('pileReturn'):SetAsLastSibling()end
        if onChanged then onChanged()end
        return true
    end
    function self.setFilter(_,kind)
        if not canBrowse() or self.typeFilter==kind then return false end
        local allowed=false
        for _,entry in ipairs(browseFilters)do if entry.id==kind then allowed=true;break end end
        if not allowed then return false end
        self.typeFilter=kind
        return changeBrowse()
    end
    function self.setSort(_,mode)
        local shell=self.visible and self.browserShell and not inDetail() and not self.detailOnly
        if not (canBrowse() or shell) or self.pileKind then return false end
        local allowed=self.browserShell and mode=='name'
        for _,value in ipairs(browseSorts)do if mode==value then allowed=true;break end end
        if not allowed then return false end
        self.sortMode=mode
        self.sortDirections[mode]=not self.sortDirections[mode]
        self.sortAscending=self.sortDirections[mode]
        self.masterSort={run=self.run,mode=mode,directions=self.sortDirections,ascending=self.sortAscending}
        return changeBrowse()
    end
    function self.setPileSort(_,mode)
        if not self.visible or not self.pileView or inDetail() or not sortNames[mode] then return false end
        self.sortAscending=self.sortMode~=mode or not self.sortAscending
        self.sortMode=mode
        return changeBrowse()
    end
    local function restoreSort(run)
        self.sortMode,self.sortAscending='original',true
        self.sortDirections={original=false,type=false,cost=false,name=false}
        local saved=self.masterSort
        if saved and saved.run~=run then self.masterSort=nil;saved=nil end
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
        self.pileView=Theme.presentationProfile=='official-assets-first' and pileNames[pileKind]~=nil
        -- Visual shell selection never determines the snapshot, combat context or
        -- card surface owner. Permanent browsing still projects only run.deck.
        self.browserShell=Theme.presentationProfile=='official-assets-first' and choice==nil
        grid=self.browserShell and assert(pileGrid,'missing official pile grid') or browserGrid
        browserGrid:SetVisible(not self.browserShell)
        if pileGrid then pileGrid:SetVisible(self.browserShell) end
        root:GetChild('pileVeil'):SetVisible(self.browserShell)
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
        openBrowserShell(choice,pileKind)
        if Theme.presentationProfile=='official-assets-first' then root:GetChild('pileChrome'):GetChild('empty'):SetVisible(self.browserShell and #cards==0)end
        self.multiple,self.choiceSelected=choice and choice.multiple,choice and choice.selected
        self.optional=choice and choice.optional
        self.visible,self.run,self.allCards,self.cards,self.catalog=true,run,cards,cards,catalog
        self.browseEnabled=choice==nil
        self.typeFilter='all'
        restoreSort(run)
        self.controllerPage=1
        self.detailOnly,self.detailPages,self.cardDetail=nil,nil,nil
        upgradePreview:SetVisible(false)
        grid:SetVisible(true);details:SetVisible(false);detailHit:SetVisible(false)
        self.indexBase, self.pending, self.calibrating = nil, false, true
        root:SetVisible(true)
        root:SetAsLastSibling()
        self.listTitle=browserHeading(pileKind).." · "..#cards.." 张"
        if self.pileView then self.sortMode,self.sortAscending='original',true end
        if self.browseEnabled then projectCards() end
        root:GetChild("title").text = choice and choicePrompts(choice)[choice.op] or self.listTitle
        if Theme.presentationProfile=='official-assets-first' then
            root:GetChild('pileChrome'):GetChild('heading').text=self.listTitle
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
        refreshGrid()
        if self.browserShell then root:GetChild('pileReturn'):SetAsLastSibling()end
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
            fill(control,instance,catalog)
            prepared(key,control)
        end)
        refreshing=false
        ready()
    end
    local function controllerModeChanged()
        local mode=platform.controllerApi and platform.controllerApi.isController() or false
        if self.controllerMode==mode then return false end
        self.controllerMode=mode;self.controllerPage=1
        return not self.calibrating and self.cards and #self.cards>0
    end
    function self.update(_, dt)
        if not self.visible or inDetail() then liveFaces();return end
        if controllerModeChanged()then self.generation=self.generation+1;self.pending=true end
        local mode=self.controllerMode
        local pageSize=gridColumns()*2
        local pages=math.max(1,math.ceil(#(self.cards or {})/pageSize))
        for _,name in ipairs({'previous','next','pageHint'})do
            local box=root:GetChild(name)
            if box then
                box:SetVisible(mode and pages>1)
                if name=='pageHint' then box.text='摇杆导航 · 确认选择 · 返回关闭 · '..(self.controllerPage or 1)..'/'..pages
                else local hit=box:GetChild('hit');hit.interactable=name=='previous' and (self.controllerPage or 1)>1
                    or name=='next' and (self.controllerPage or 1)<pages;hit.raycastTarget=hit.interactable end
            end
        end
        if self.browserShell then liveFaces()
        else liveFaces(function(face)CardSkin.tick(face,dt or 0)end) end
        if not self.pending then return end
        self.pending, self.calibrating = false, false
        local generation, cards, catalog, base = self.generation, self.cards, self.catalog, self.indexBase
        if mode then
            local subset={}
            for i=((self.controllerPage or 1)-1)*pageSize+1,math.min((self.controllerPage or 1)*pageSize,#cards)do subset[#subset+1]=cards[i]end
            cards=subset;grid.scrollProgress=0
        end
        paintGrid(cards,catalog,base,generation)
        liveFaces()
    end
    function self.controllerStep(_,delta)
        if not self.visible or not self.controllerMode or inDetail() or self.calibrating then return false end
        local page=(self.controllerPage or 1)+delta
        if page<1 or page>math.ceil(#self.cards/(gridColumns()*2))then return false end
        self.generation=self.generation+1
        self.controllerPage,self.pending=page,true;self:update();return true
    end
    local resetPileReturn
    function self.close(_)
        if not self.visible then return false end
        if self.previewInfo then presentation=self.previousPresentation;self.masterSort=self.previewMasterSort end
        self.previewInfo,self.previousPresentation,self.previewMasterSort=nil,nil,nil
        self.generation = self.generation + 1
        self.visible, self.pending, self.calibrating, self.run, self.cards, self.catalog = false, false, false, nil, nil, nil
        self.pendingGrid=false;self.gridReady=nil
        self.allCards,self.browseEnabled,self.typeFilter,self.sortMode=nil,nil,nil,nil
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
        grid:RefreshItems(0, function() end)
        if pileGrid then pileGrid:SetVisible(false) end
        root:GetChild('pileVeil'):SetVisible(false)
        root:GetChild('header'):SetVisible(true)
        self.pileView,self.browserShell=nil,nil;grid=browserGrid
        root:GetChild('veil'):SetVisible(true)
        if Theme.presentationProfile=='official-assets-first' then
            resetPileReturn()
            for _,name in ipairs({'pileChrome','pileTools','pileReturn'})do root:GetChild(name):SetVisible(false)end
        end
        paintBrowse()
        liveFaces()
        return true
    end
    local previewHit=upgradePreview:GetChild('hit')
    previewHit:AddCursorEventListener(clickEvent,function()
        if Controller.pointerBlocked(platform.controller)then return false end
        return self:toggleUpgradePreview()
    end)
    Controller.bind(platform.controller,previewHit,'deck',function()return self:toggleUpgradePreview()end,
        function()return self.visible and self.cardDetail~=nil and self.cardDetail.upgraded~=nil end,80)
    root.disableCursorEventPassthrough = true
    local blocker=root:GetChild('blocker')
    local outsideHeld,outsideReleased,outsideObserved
    local cursor=platform.cursorEvents or {}
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
        if Controller.pointerBlocked(platform.controller) or not self.visible or not self.closeOnOutside then return true end
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
        if Controller.pointerBlocked(platform.controller)then return false end
        return nextPage()
    end)
    Controller.bind(platform.controller,detailHit,'deck',nextPage,nil,1)
    function self.back(_)
        if not self.visible then return false end
        if self.cardDetail then
            hideCardDetail();details:SetVisible(false);detailHit:SetVisible(false);grid:SetVisible(true)
            closeLabel('关闭');paintBrowse();self:update(0)
            if onChanged then onChanged()end
            return true
        end
        if self.detailPages and not self.detailOnly then
            self.detailPages,self.cardDetail=nil,nil;upgradePreview:SetVisible(false);details:SetVisible(false);detailHit:SetVisible(false);grid:SetVisible(true)
            root:GetChild('title').text=self.listTitle;closeLabel('关闭');self.pending=true;paintBrowse();return true
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
        if Controller.pointerBlocked(platform.controller)then return swallow or false end
        local result=self:back()
        return swallow or result
    end)
    Controller.bind(platform.controller,close,'deck',function()return self:back()end,nil,100)
    local function bindOfficialBrowser()
        if Theme.presentationProfile~='official-assets-first' then return end
        for _,mode in ipairs({'original','type','cost','name'})do
            local hit=root:GetChild('pileTools'):GetChild(mode):GetChild('hit')
            local action=function()
                if not self.browserShell then return false end
                if self.pileView then return self:setPileSort(mode)end
                return self:setSort(mode)
            end
            hit:AddCursorEventListener(clickEvent,function()if Controller.pointerBlocked(platform.controller)then return true end;return action()end)
            Controller.bind(platform.controller,hit,'deck',action,function()return self.visible and self.browserShell and not inDetail() end,80)
        end
        resetPileReturn=bindPileReturn(self,root:GetChild('pileReturn'),platform,cursor,clickEvent,function()return returnRevision end)
    end
    bindOfficialBrowser()
    for _,name in ipairs({'previous','next'})do
        local box=root:GetChild(name)
        if box then
            local delta=name=='previous' and -1 or 1
            local action=function()return self:controllerStep(delta)end
            box:GetChild('hit'):AddCursorEventListener(clickEvent,function()
                if Controller.pointerBlocked(platform.controller)then return false end
                return action()
            end)
            Controller.bind(platform.controller,box:GetChild('hit'),'deck',action,nil,80)
        end
    end
    for _,entry in ipairs(browseFilters)do
        local hit=root:GetChild('filter'..entry.control):GetChild('hit')
        local action=function()return self:setFilter(entry.id)end
        hit:AddCursorEventListener(clickEvent,function()
            if Controller.pointerBlocked(platform.controller)then return false end
            return action()
        end)
        Controller.bind(platform.controller,hit,'deck',action,canBrowse,65)
    end
    for _,mode in ipairs(browseSorts)do
        local hit=root:GetChild('sort'..mode):GetChild('hit')
        local action=function()return self:setSort(mode)end
        hit:AddCursorEventListener(clickEvent,function()
            if Controller.pointerBlocked(platform.controller)then return false end
            return action()
        end)
        Controller.bind(platform.controller,hit,'deck',action,function()return canBrowse() and not self.pileKind end,65)
    end
    root:SetVisible(false)
    return self
end
return M
