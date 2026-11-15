local Model=require('abyss_compendium_model')
local Theme=require('abyss_theme')
local M={}
function M.attach(browser,root,event,options,bind,command,canList,enabled,grid)
    local popup=root:GetChild('popup')
    local function isPopup()return enabled()and browser.popup==true end
    local function add(name,box,action,valid,order)
        command(name,box,action,valid,order)
        browser.staticHits=browser.staticHits or{};browser.staticHits[#browser.staticHits+1]=box:GetChild('hit')
    end
    add('close',root:GetChild('close'),options.onClose,canList,1)
    local function changePage(delta)
        local total=browser.kind=='cards'and math.ceil(#browser.rows/10)or math.ceil(#browser.lines/7)
        local page=browser.page+delta
        if page<1 or page>total then return false end
        browser.page=page;browser.generation=browser.generation+1
        grid().scrollProgress=total>1 and(page-1)/(total-1)or 0
        browser:refreshGrid();return true
    end
    add('previous',root:GetChild('previous'),function()return changePage(-1)end,canList,2)
    add('next',root:GetChild('next'),function()return changePage(1)end,canList,3)
    for _,color in ipairs(Model.colors)do
        add('color'..color,root:GetChild('color'..color),function()
            if browser.kind~='cards'then return false end
            browser.color=color;browser.sortMode,browser.ascending='rarity',true
            browser.activeSort=nil
            browser.sortDirections={rarity=false,type=false,cost=false}
            return browser:project()
        end,canList,4)
    end
    for _,mode in ipairs({'rarity','type','cost'})do
        add('sort'..mode,root:GetChild('sort'..mode),function()
            if browser.kind~='cards'then return false end
            browser.sortDirections[mode]=not browser.sortDirections[mode]
            browser.sortMode,browser.ascending=mode,browser.sortDirections[mode]
            browser.activeSort=mode
            browser.rows=Model.sort(browser.rows,mode,browser.ascending)
            browser.generation=browser.generation+1;browser:refreshGrid();return browser:render()
        end,canList,5)
    end
    local function upgrade()
        if browser.kind~='cards'then return false end
        if browser.popup then
            if not browser.catalog:card(browser.selected.id,true)then return false end
            browser.upgraded=not browser.upgraded;browser.listUpgraded=browser.upgraded
            local row=browser.upgraded and browser.catalog:card(browser.selected.id,true)or browser.selected
            browser.pages=Model.cardPages(row);browser.detailPage=1
        else browser.listUpgraded=not browser.listUpgraded end
        browser.generation=browser.generation+1;browser:refreshGrid();return browser:render()
    end
    add('viewUpgrade',root:GetChild('viewUpgrade'),upgrade,canList,6)
    add('upgrade',popup:GetChild('upgrade'),upgrade,isPopup,31)
    local function adjacent(delta)
        local index=browser.selectedIndex+delta
        if index<1 or index>#browser.selectedGroup then return false end
        browser.selectedIndex,browser.selected=index,browser.selectedGroup[index]
        local row=browser.selected
        if browser.kind=='cards'and browser.upgraded then row=browser.catalog:card(row.id,true)or row end
        browser.pages=browser.kind=='cards'and Model.cardPages(row)or Model.pages(row.text,Theme.layout.compendium)
        browser.detailPage,browser.tipPage=1,1;browser.generation=browser.generation+1;return browser:render()
    end
    add('popupPrevious',popup:GetChild('popupPrevious'),function()return adjacent(-1)end,isPopup,32)
    add('popupNext',popup:GetChild('popupNext'),function()return adjacent(1)end,isPopup,33)
    add('popupClose',popup:GetChild('popupClose'),function()return browser:closeDetails()end,isPopup,30)
    add('tipNext',popup:GetChild('tipNext'),function()
        browser.tipPage=(browser.tipPage or 1)%#browser.tipPages+1
        browser.generation=browser.generation+1;return browser:render()
    end,isPopup,35)
    for _,pair in ipairs({{'detailPrevious',-1},{'detailNext',1}})do
        local name,delta=pair[1],pair[2]
        add(name,popup:GetChild(name),function()
            local page=browser.detailPage+delta
            if page<1 or page>#browser.pages then return false end
            browser.detailPage=page;browser.generation=browser.generation+1;return browser:render()
        end,isPopup,34)
    end
    bind(popup:GetChild('dismiss'),function()return browser:closeDetails()end,isPopup,40)
    browser.staticHits[#browser.staticHits+1]=popup:GetChild('dismiss')
    popup:GetChild('cardHit'):AddCursorEventListener(event,function()return true end)
end
return M
