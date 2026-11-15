-- Pinned STS compendium interaction; detached Production data, native scrolling.
local Theme=require('abyss_theme')
local Catalog=require('abyss_compendium_catalog')
local Controller=require('abyss_controller')
local Model=require('abyss_compendium_model')
local Card=require('abyss_compendium_card')
local Input=require('abyss_compendium_input')
local M={}
local kinds={cards='卡牌图鉴',relics='遗物图鉴',potions='药水图鉴'}
function M.new(root,data,presentation,event,options)
    local browser={visible=false,generation=0,page=1,detailPage=1,upgraded=false,color='red',sortMode='rarity',ascending=true,
        sortDirections={rarity=false,type=false,cost=false},bindings={},commands={}}
    local platform=options.platform or {}
    local function child(name)return assert(root:GetChild(name),'missing compendium '..name)end
    local popup,tooltip,hoverHints=child('popup'),child('tooltip'),child('hoverHints')
    local function enabled()return browser.visible and not browser.destroyed and not options.disabled()and root.alive~=false end
    local function version()return browser.generation end
    local function canList()return enabled()and not browser.popup end
    local function clearBindings()
        for control,binding in pairs(browser.bindings)do
            if control.alive==false then
                Controller.unbind(options.controller,binding.hit,true);browser.bindings[control]=nil
            end
        end
    end
    local function clearArt()
        for _,binding in pairs(browser.bindings)do
            if binding.face and binding.face.alive~=false then Card.clear(binding.face)end
        end
    end
    local function bind(control,action,valid,order,hover)
        return Input.bind(control,event,options,valid or enabled,version,action,order,hover)
    end
    local function command(name,control,action,valid,order)
        browser.commands[name]=bind(control:GetChild('hit'),action,valid,order)
    end
    local function grid()return child(browser.kind=='cards'and'cardGrid'or'iconGrid')end
    local function cardRow(row,upgraded)
        return Model.sourceRow(upgraded and browser.catalog:card(row.id,true)or row)
    end
    local function bindItem(control,row,index,group)
        local binding=browser.bindings[control]
        if not binding then
            local hit=control:GetChild('hit')
            binding={hit=hit};browser.bindings[control]=binding
            local function hover(scale)
                if control.alive==false then return end
                local b=browser.bindings[control]
                if not b or not b.row then return end
                if browser.kind=='cards'then
                    browser:hoverCard(control,b.row,b.index,scale>1)
                else
                    control:GetChild('icon'):SetLocalScale(scale,scale,1)
                    if scale>1 then browser:showTip(b.row,false)
                    elseif not browser.tooltipPinned then tooltip:SetVisible(false);browser.tooltip=false end
                end
            end
            bind(hit,function()
                local b=browser.bindings[control]
                return browser:select(b.index,b.group)
            end,function()
                local b=browser.bindings[control]
                return control.alive~=false and canList()and b and b.generation==version()and b.row~=nil
            end,20,{enter=function()hover(browser.kind=='cards'and 4/3 or 1.25)end,exit=function()hover(1)end})
        end
        binding.row,binding.index,binding.group,binding.generation=row,index,group,version()
    end
    local function fillCard(control,index)
        clearBindings()
        local row=browser.rows[index+1]
        if not row then control:SetVisible(false);return end
        control:GetChild('uid'):SetVisible(false)
        control:GetChild('hit'):SetVisible(true)
        local face=control:GetChild('face');face:SetAnchoredPosition(0,0);face:SetLocalScale(1,1,1)
        control:GetChild('hit'):SetAnchoredPosition(0,0)
        Card.write(face,cardRow(row,browser.listUpgraded),platform,(presentation[row.id]or{}).nativeArt)
        bindItem(control,row,index+1,browser.rows);control:SetVisible(true)
        browser.bindings[control].face=face
        if browser.hovered and browser.hovered.control==control then browser:hoverCard(control,row,index+1,true)end
    end
    local function icon(row)
        if browser.kind=='relics'then return require('abyss_relic_view_ui').icon(row.id,Theme.presentationProfile=='official-assets-first')end
        return Theme.icon.potion[row.id]or Theme.icon.intent.unknown
    end
    local function fillIcons(control,index)
        clearBindings()
        local line=browser.lines[index+1]
        if not line then control:SetVisible(false);return end
        local heading=control:GetChild('heading');heading:SetVisible(line.heading~=nil);heading.text=line.heading or ''
        for i=1,10 do
            local slot=control:GetChild('slot'..i)
            local entry=line.entries and line.entries[i]
            slot:SetVisible(entry~=nil)
            if entry then
                slot:GetChild('icon'):SetImage(platform.imageSource or'static',icon(entry.row))
                local size=browser.kind=='potions'and 51.2 or 42.666666666666664
                slot:GetChild('icon'):SetSizeDelta(size,size)
                slot:GetChild('icon'):SetLocalScale(1,1,1)
                local tint=browser.kind=='potions'and(Theme.icon.potionTint or{})[entry.row.id]
                if platform.color then
                    tint=tint or{r=255,g=255,b=255,a=255}
                    slot:GetChild('icon').imageColor=platform.color(tint.r,tint.g,tint.b,tint.a or 255)
                end
                bindItem(slot,entry.row,entry.index,browser.groups[line.rarity])
            elseif browser.bindings[slot]then browser.bindings[slot].row=nil end
        end
        control:SetVisible(true)
    end
    function browser.tick(_)
        browser:updateHover(0)
        local pending=browser.pendingGrid
        if not pending or not enabled()or pending.generation~=version()or pending.base==nil then return false end
        browser.pendingGrid=nil;clearBindings()
        pending.control:RefreshItems(pending.count,function(control,index)
            if enabled()and pending.generation==version()then pending.fill(control,index-pending.base)end
        end)
        pending.control.scrollProgress=pending.progress;clearBindings();return true
    end
    function browser.refreshGrid(_)
        clearBindings();clearArt()
        local progress=grid().scrollProgress or 0
        local control=grid()
        browser.bases=browser.bases or{}
        local pending={control=control,generation=version(),progress=progress,base=browser.bases[control],
            count=browser.kind=='cards'and#browser.rows or#browser.lines,fill=browser.kind=='cards'and fillCard or fillIcons}
        browser.pendingGrid=pending
        if pending.base==nil then control:RefreshItems(1,function(_,index)
            if enabled()and pending.generation==version()then browser.bases[control]=index;pending.base=index end
        end)end
        return browser:tick()
    end
    local function renderTools()
        local cards=browser.kind=='cards'
        child('cardGrid'):SetVisible(cards);child('iconGrid'):SetVisible(not cards)
        if not cards then
            local frame=browser.kind=='potions'and Theme.layout.compendium.potionViewport or Theme.layout.compendium.iconViewport
            child('iconGrid'):SetSizeDelta(frame[3],frame[4]);child('iconGrid'):SetAnchoredPosition(frame[1],frame[2])
        end
        for _,color in ipairs(Model.colors)do
            local box=child('color'..color);box:SetVisible(cards)
            box:GetChild('label').text=(browser.color==color and '● 'or'')..Model.colorNames[color]
        end
        for _,mode in ipairs({'rarity','type','cost'})do
            local box=child('sort'..mode);box:SetVisible(cards)
            box:GetChild('label').text=({rarity='稀有度',type='类型',cost='费用'})[mode]..(browser.activeSort==mode and(browser.ascending and' ↑'or' ↓')or'')
        end
        child('viewUpgrade'):SetVisible(cards)
        child('viewUpgrade'):GetChild('label').text=(browser.listUpgraded and '☑ 'or'□ ')..'查看升级'
    end
    local function paintTip(controls,row,left,anchor,bodyHeight,height,originX,originY)
        local layout=Theme.layout.compendium.tip
        controls[1]:SetSizeDelta(layout.width,height)
        controls[1]:SetAnchoredPosition(left+layout.width/2-originX,anchor+layout.top-height/2-originY)
        controls[2].text=row.name;controls[3].text=row.text
        local textX=left+layout.textX+layout.bodyWidth/2-originX
        controls[2]:SetAnchoredPosition(textX,anchor+layout.headerY-layout.headerHeight/2-originY)
        controls[3]:SetAnchoredPosition(textX,anchor+layout.bodyY-bodyHeight/2-originY)
        controls[3]:SetSizeDelta(layout.bodyWidth,bodyHeight)
    end
    local function paintKeywords(box,row,upgraded,left,startY,page)
        local tips=Model.tipPages(Model.keywordRows(cardRow(row,upgraded),data),startY)
        page=math.min(page or 1,#tips)
        for i=1,4 do
            local suffix=i==1 and''or tostring(i)
            local frame=tips[page][i]
            local controls={box:GetChild('keywordPlate'..suffix),box:GetChild('keywordTitle'..suffix),box:GetChild('keywordText'..suffix)}
            for _,control in ipairs(controls)do control:SetVisible(frame~=nil)end
            if frame then paintTip(controls,frame.row,left,frame.anchor,frame.body,frame.height,0,0)end
        end
        return tips,page
    end
    local function renderKeywords(row)
        local tips,page=paintKeywords(popup,row,browser.upgraded,226.66666666666666,-80,browser.tipPage)
        browser.tipPages,browser.tipPage=tips,page
        popup:GetChild('tipNext'):SetVisible(#tips>1)
    end
    local function renderPreview(row,cards,box,upgraded,x,y)
        box=box or popup
        local preview=cards and Model.previews[row.id]
        local face=box:GetChild('previewFace');face:SetVisible(preview~=nil and preview~=false)
        if preview then
            face:SetAnchoredPosition(x or 316.6666666666667,y or 170);face:SetLocalScale(16/15,16/15,1)
            Card.write(face,Model.sourceRow(assert(browser.catalog:card(preview.id,preview.upgraded==true or preview.followParent and upgraded),'missing admitted source preview')),platform,
                (presentation[preview.id]or{}).nativeArt)
        end
    end
    function browser.clearHover(_)
        browser.hovered=nil
        if hoverHints.alive==false then return end
        hoverHints:SetVisible(false)
        Card.clear(hoverHints:GetChild('hoverFace'));Card.clear(hoverHints:GetChild('previewFace'))
    end
    function browser.updateHover(_,dt)
        local hover=browser.hovered
        if not hover then return false end
        if not canList()or hover.generation~=version()or hover.control.alive==false then browser:clearHover();return false end
        hover.elapsed=hover.elapsed+(dt or 0)
        local x,y=Model.cardPosition(hover.index,#browser.rows,child('cardGrid').scrollProgress)
        local moved=hover.x~=x or hover.y~=y
        if moved then hoverHints:GetChild('hoverFace'):SetAnchoredPosition(x,y)end
        hover.x,hover.y=x,y
        if hover.elapsed>.2 and(not hover.painted or moved)then
            local row=cardRow(hover.row,browser.listUpgraded)
            local count=#Model.keywordRows(row,data)
            local left,anchor,previewX,previewY=Model.hoverLayout(x,y,count)
            paintKeywords(hoverHints,hover.row,browser.listUpgraded,left,anchor,1)
            renderPreview(hover.row,true,hoverHints,false,previewX,previewY)
            hover.painted=true
        end
        return true
    end
    function browser.hoverCard(_,control,row,index,active)
        if not active then
            if browser.hovered and browser.hovered.control==control then browser:clearHover()end
            return
        end
        if not canList()then return false end
        browser:clearHover()
        browser.hovered={control=control,row=row,index=index,generation=version(),elapsed=0}
        for i=1,4 do
            local suffix=i==1 and''or tostring(i)
            for _,name in ipairs({'keywordPlate','keywordTitle','keywordText'})do hoverHints:GetChild(name..suffix):SetVisible(false)end
        end
        hoverHints:GetChild('previewFace'):SetVisible(false)
        local face=hoverHints:GetChild('hoverFace');face:SetLocalScale(4/3,4/3,1)
        Card.hover(face,cardRow(row,browser.listUpgraded),platform,(presentation[row.id]or{}).nativeArt)
        hoverHints:SetVisible(true);hoverHints:SetAsLastSibling();return browser:updateHover(0)
    end
    local function renderPopup()
        popup:SetVisible(browser.popup==true)
        if not browser.popup then return end
        popup:SetAsLastSibling()
        local row=browser.selected;local cards=browser.kind=='cards'
        popup:GetChild('face'):SetAnchoredPosition(0,0)
        popup:GetChild('face'):SetLocalScale(Theme.layout.compendium.popupScale,Theme.layout.compendium.popupScale,1)
        popup:GetChild('face'):SetVisible(cards);popup:GetChild('cardHit'):SetVisible(cards)
        popup:GetChild('relicIcon'):SetVisible(not cards)
        popup:GetChild('rarity'):SetVisible(not cards)
        if cards then
            local display=cardRow(row,browser.upgraded)
            local page={};for key,value in pairs(display)do page[key]=value end
            page.text=browser.pages[browser.detailPage];Card.popup(popup:GetChild('face'),page,platform,(presentation[row.id]or{}).nativeArt)
        else popup:GetChild('relicIcon'):SetImage(platform.imageSource or'static',icon(row))end
        popup:GetChild('detailTitle'):SetVisible(not cards);popup:GetChild('detail'):SetVisible(not cards)
        popup:GetChild('detailTitle').text=row.name
        popup:GetChild('rarity').text=Model.rarityNames[row.rarity]or row.rarity
        popup:GetChild('detail').text=browser.pages[browser.detailPage]or''
        popup:GetChild('detailCount').text=browser.detailPage..' / '..#browser.pages
        renderKeywords(row)
        popup:GetChild('popupPrevious'):SetVisible(browser.selectedIndex>1)
        popup:GetChild('popupNext'):SetVisible(browser.selectedIndex<#browser.selectedGroup)
        popup:GetChild('upgrade'):SetVisible(cards and browser.catalog:card(row.id,true)~=nil)
        popup:GetChild('upgrade'):GetChild('label').text=(browser.upgraded and'☑ 'or'□ ')..'查看升级'
        renderPreview(row,cards,popup,browser.upgraded)
        for _,name in ipairs({'detailPrevious','detailNext','detailCount'})do popup:GetChild(name):SetVisible(#browser.pages>1)end
    end
    function browser.render(_)
        if not enabled()then return false end
        child('title').text=kinds[browser.kind]
        child('count').text=#browser.rows..' 项'
        child('title'):SetVisible(false);child('count'):SetVisible(false)
        renderTools();renderPopup();return true
    end
    function browser.select(_,index,group)
        if not canList()then return false end
        group=group or browser.rows;local row=group[index];if not row then return false end
        if browser.kind=='potions'and browser.tooltipPinned and browser.selected and browser.selected.id==row.id then return browser:closeDetails()end
        browser.selected,browser.selectedIndex,browser.selectedGroup=row,index,group
        browser:clearHover()
        if browser.kind=='potions'then
            return browser:showTip(row,true)
        end
        browser.generation=browser.generation+1
        browser.popup=true;browser.upgraded=browser.listUpgraded==true
        browser.detailPage,browser.tipPage=1,1
        browser.pages=browser.kind=='cards'and Model.cardPages(cardRow(row,browser.upgraded))or Model.pages(row.text,Theme.layout.compendium)
        return browser:render()
    end
    function browser.showTip(_,row,pinned)
        if not canList()then return false end
        local layout=Theme.layout.compendium.tip
        local anchor=browser.kind=='potions'and layout.potionAnchor or layout.relicAnchor
        local body,height=Model.tipMeasure(row.text)
        local x,y=anchor[1]+layout.width/2,anchor[2]+layout.top-height/2
        tooltip:SetAnchoredPosition(x,y);tooltip:SetSizeDelta(layout.width,height)
        paintTip({tooltip:GetChild('plate'),tooltip:GetChild('name'),tooltip:GetChild('body')},row,anchor[1],anchor[2],body,height,x,y)
        tooltip:SetVisible(true)
        browser.tooltip,browser.tooltipPinned=true,pinned==true
        return true
    end
    function browser.closeDetails(_)
        if not browser.popup and not browser.tooltip then return false end
        browser.popup,browser.tooltip,browser.upgraded,browser.listUpgraded=false,false,false,false
        browser.generation=browser.generation+1;popup:SetVisible(false);tooltip:SetVisible(false)
        Card.clear(popup:GetChild('face'));Card.clear(popup:GetChild('previewFace'))
        if enabled()then browser:refreshGrid();browser:render()end
        return true
    end
    function browser.back(_)
        if browser:closeDetails()then return true end
        return options.onClose()
    end
    function browser.project(_)
        browser.generation=browser.generation+1;browser.page=1
        if browser.kind=='cards'then browser.rows=Model.cards(browser.allRows,browser.color,'rarity',true)
        else browser.rows=browser.allRows;browser.lines,browser.groups=Model.sections(browser.rows,browser.kind)end
        grid().scrollProgress=0;browser:refreshGrid();return browser:render()
    end
    function browser.open(_,kind)
        if browser.destroyed or root.alive==false or not kinds[kind]or options.disabled()then return false end
        browser.catalog=browser.catalog or Catalog.new(data,presentation)
        browser.kind,browser.allRows,browser.visible=kind,browser.catalog:list(kind),true
        browser.popup,browser.tooltip,browser.listUpgraded=false,false,false
        browser.selected=nil;root:SetVisible(true);popup:SetVisible(false);tooltip:SetVisible(false)
        return browser:project()
    end
    function browser.close(_)
        local was=browser.visible;browser.visible=false;browser.popup,browser.tooltip=false,false
        browser.generation=browser.generation+1
        browser:clearHover()
        clearArt()
        if popup.alive~=false then Card.clear(popup:GetChild('face'));Card.clear(popup:GetChild('previewFace'))end
        if root.alive~=false then root:SetVisible(false)end
        return was
    end
    function browser.destroy(_)
        if browser.destroyed then return false end
        browser:close();browser.destroyed=true
        for control,b in pairs(browser.bindings)do Controller.unbind(options.controller,b.hit,control.alive==false)end
        for _,hit in ipairs(browser.staticHits or{})do Controller.unbind(options.controller,hit,hit.alive==false)end
        return true
    end
    require('abyss_compendium_actions').attach(browser,root,event,options,bind,command,canList,enabled,grid)
    root.disableCursorEventPassthrough=true
    -- The imported hover subtree contains only display controls. Images do not
    -- expose CursorArea.raycastTarget; never write that property on them.
    hoverHints.disableCursorEventPassthrough=false
    child('blocker'):AddCursorEventListener(event,function()
        if enabled()and browser.tooltip then browser:closeDetails()end
        return true
    end)
    root:SetVisible(false)
    return browser
end
return M
