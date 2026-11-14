-- Bounded read-only catalogue browser. No Run or inventory operations.
local Theme=require('abyss_theme')
local Catalog=require('abyss_compendium_catalog')
local Controller=require('abyss_controller')
local Chars=require('abyss_prologue').chars
local M={}
local kinds={cards='卡牌图鉴',relics='遗物图鉴',potions='药水图鉴'}
local cardTypes={attack='攻击',skill='技能',power='能力',status='状态',curse='诅咒'}
local function detailText(row,kind)
    if kind~='cards'then return row.text end
    local definition=row.definition
    -- Match the existing full card reader's printed cost, not combat spending.
    local cost=definition.cost==-2 and '不可打出' or definition.costMode=='all_energy' and 'X' or tostring(definition.cost)
    return (cardTypes[definition.type] or definition.type)..' · 费用 '..cost..'\n\n'..row.text
end
local function detailPages(text)
    local chars,pages=Chars(text),{}
    local first,column,lines=1,0,1
    local layout=Theme.layout.compendium
    for i,char in ipairs(chars)do
        if char=='\n' then column=0;lines=lines+1
        else column=column+1;if column>=layout.detailColumns then column=0;lines=lines+1 end end
        if lines>layout.detailLines or i-first+1>=layout.detailCharacters then
            pages[#pages+1]=table.concat(chars,'',first,i);first,column,lines=i+1,0,1
        end
    end
    if first<=#chars then pages[#pages+1]=table.concat(chars,'',first)end
    return #pages>0 and pages or {''}
end
function M.new(root,data,presentation,event,options)
    local browser={visible=false,generation=0,page=1,detailPage=1,upgraded=false}
    local bindings,controller={},options.controller
    local function child(name)return assert(root:GetChild(name),'missing compendium '..name)end
    local function enabled()return browser.visible and not browser.destroyed and not options.disabled() and root.alive~=false end
    local function bind(name,action,order)
        local box=child(name);local hit=box:GetChild('hit');local held,released
        local cursor=options.cursorEvents or {}
        local function touch(e)return e and (e.touchId or e.pointerId)end
        if cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(e)
                if enabled()then held={generation=browser.generation,touch=touch(e)}end
            end)
            hit:AddCursorEventListener(cursor.CursorUp,function(e)
                if held and held.touch==touch(e)then released=held;held=nil end
            end)
            for _,kind in pairs({cursor.CursorExit,cursor.CursorEndDrag})do
                hit:AddCursorEventListener(kind,function()held,released=nil,nil end)
            end
        end
        local function invoke(e,controllerAction)
            if not enabled() or not controllerAction and Controller.pointerBlocked(controller)then return false end
            if e and touch(e)~=nil and cursor.CursorDown and cursor.CursorUp then
                local token=released;released=nil
                if not token or token.generation~=browser.generation or token.touch~=touch(e) or e.dragging then return false end
            end
            return action()
        end
        hit:AddCursorEventListener(event,invoke)
        Controller.bind(controller,hit,'compendium',function()return invoke(nil,true)end,enabled,order)
        bindings[#bindings+1]=hit
        return invoke
    end
    function browser.render(_)
        if not enabled()then return false end
        local size=Theme.layout.compendium.rows
        local total=math.max(1,math.ceil(#browser.rows/size));browser.page=math.min(browser.page,total)
        child('title').text=kinds[browser.kind]
        child('count').text=browser.page..' / '..total..' 页 · '..#browser.rows..' 项'
        for i=1,size do
            local row=browser.rows[(browser.page-1)*size+i];local box=child('row'..i)
            box:SetVisible(row~=nil)
            if row then box:GetChild('label').text=row.name end
        end
        local row=browser.selected
        child('detailTitle').text=row and row.name..(browser.upgraded and ' +' or '') or '选择一项查看详情'
        child('detail').text=browser.pages[browser.detailPage] or ''
        child('detailCount').text=row and browser.detailPage..' / '..#browser.pages..' 段' or ''
        child('upgrade'):SetVisible(browser.kind=='cards' and row~=nil and browser.catalog:card(row.id,true)~=nil)
        child('upgrade'):GetChild('label').text=browser.upgraded and '基础预览' or '升级预览'
        return true
    end
    function browser.select(_,index)
        if not enabled()then return false end
        local row=browser.rows[index];if not row then return false end
        browser.page=math.floor((index-1)/Theme.layout.compendium.rows)+1
        browser.selected,browser.upgraded,browser.detailPage=row,false,1
        browser.pages=detailPages(detailText(row,browser.kind));browser.generation=browser.generation+1
        return browser:render()
    end
    function browser.open(_,kind)
        if browser.destroyed or root.alive==false or not kinds[kind] or options.disabled()then return false end
        browser.catalog=browser.catalog or Catalog.new(data,presentation)
        browser.kind,browser.rows,browser.page,browser.visible=kind,browser.catalog:list(kind),1,true
        browser.generation=browser.generation+1;root:SetVisible(true)
        return browser:select(1)
    end
    function browser.close(_)
        local was=browser.visible
        browser.visible=false;browser.generation=browser.generation+1
        if root.alive~=false then root:SetVisible(false)end
        return was
    end
    function browser.destroy(_)
        if browser.destroyed then return false end
        browser:close()
        browser.destroyed=true
        for _,hit in ipairs(bindings)do Controller.unbind(controller,hit,hit.alive==false)end
        return true
    end
    browser.commands={}
    browser.commands.close=bind('close',function()return options.onClose()end,1)
    local function changePage(delta)
        local page=browser.page+delta
        if page<1 or page>math.ceil(#browser.rows/Theme.layout.compendium.rows)then return false end
        browser.page=page;return browser:select((page-1)*Theme.layout.compendium.rows+1)
    end
    browser.commands.previous=bind('previous',function()return changePage(-1)end,2)
    browser.commands.next=bind('next',function()return changePage(1)end,3)
    for i=1,Theme.layout.compendium.rows do
        local index=i
        browser.commands['row'..i]=bind('row'..i,function()return browser:select((browser.page-1)*Theme.layout.compendium.rows+index)end,10+i)
    end
    browser.commands.upgrade=bind('upgrade',function()
        if browser.kind~='cards' or not browser.selected then return false end
        local row=browser.catalog:card(browser.selected.id,not browser.upgraded)
        if not row then return false end
        browser.upgraded=not browser.upgraded;browser.pages=detailPages(detailText(row,browser.kind));browser.detailPage=1;browser.generation=browser.generation+1
        return browser:render()
    end,30)
    for _,pair in ipairs({{'detailPrevious',-1},{'detailNext',1}})do
        local name,delta=pair[1],pair[2]
        browser.commands[name]=bind(name,function()
            local page=browser.detailPage+delta
            if page<1 or page>#browser.pages then return false end
            browser.detailPage=page;browser.generation=browser.generation+1;return browser:render()
        end,40+delta)
    end
    root.disableCursorEventPassthrough=true
    child('blocker'):AddCursorEventListener(event,function()return true end)
    root:SetVisible(false)
    return browser
end
return M
