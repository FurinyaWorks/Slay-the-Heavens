local ShopUI = require("abyss_shop_ui")
local ShopSelection = require('abyss_shop_selection')
local Merchant = require('abyss_merchant')
local M = {}

-- Installs the shop setup responsibility on one node UI instance.
function M.install(ctx)
    ctx.merchant = Merchant.new(ctx.child("merchant"), { color = ctx.options.color, sound = ctx.options.sound, compact = true })

    local talk = ctx.child('merchant'):GetChild('talk')
    local hit = talk:GetChild('hit')
    local observed,held,released=false,nil,nil
    local function valid(token)
        return token and token.epoch==ctx.shopEpoch and token.run==ctx.self.run
            and token.map==ctx.self.map and token.actions==ctx.self.actions and not ctx.self.shopBusy
    end
    function ctx.bindShopEntry(cursor)
        if cursor and cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(event)
                observed=true;released=nil
                held={touch=event and event.touchId,epoch=ctx.shopEpoch,run=ctx.self.run,map=ctx.self.map,actions=ctx.self.actions}
                if not ctx.self.visible or ctx.self.shopBusy or ctx.self.shopOpen
                    or ctx.options.inputCovered and ctx.options.inputCovered() then held=nil end
            end)
            hit:AddCursorEventListener(cursor.CursorUp,function(event)
                if held and held.touch==(event and event.touchId) then released,held=held,nil end
            end)
            local function cancel(event)
                local touch=event and event.touchId
                if held and held.touch==touch then held=nil end
                if released and released.touch==touch then released=nil end
            end
            for _,name in ipairs({'CursorExit','CursorEndDrag','CursorDrag'})do
                if cursor[name] then hit:AddCursorEventListener(cursor[name],cancel) end
            end
        end
        hit:AddCursorEventListener(ctx.clickEvent,function(event)
            if observed then
                if not valid(released) then return false end
                local touch=event and event.touchId
                if touch~=nil and touch~=released.touch then return false end
                released=nil
            end
            return ctx.openShop()
        end)
    end

    local panel, back, room = ctx.child('shopView'), ctx.child('back'), ctx.child('shopRoom')
    local prompt = room:GetChild('shopPrompt')
    local promptText = prompt.text
    local layout = require('abyss_theme').layout.nativeNode
    local duration = .3
    local shelfBack = { math.min(layout.back[1], -510), layout.back[2] }
    local preparedView, preparedFlow, preparationStep, shelfReady, opening
    local function inShop()
        local node=ctx.self.run and ctx.self.run.nodeFlow
        return node and node.type=='shop' and not node.complete and ctx.self.run.phase=='node'
    end
    function ctx.syncShop()
        local node=ctx.self.run and ctx.self.run.nodeFlow
        if ctx.shopId~=(node and node.id) or ctx.shopRun~=ctx.self.run or ctx.shopMap~=ctx.self.map then
            ctx.cancelShop(true)
            ctx.shopId,ctx.shopRun,ctx.shopMap=node and node.id,ctx.self.run,ctx.self.map
        end
    end
    function ctx.cancelShop(reset)
        ctx.shopEpoch=(ctx.shopEpoch or 0)+1;held=nil;released=nil
        if ctx.shopTime then
            panel:SetAnchoredPosition(0,0)
            back:SetAnchoredPosition(shelfBack[1],shelfBack[2])
        end
        ctx.shopTime=nil;ctx.shopClosing=false;ctx.self.shopBusy=nil
        opening = false
        if reset then
            ctx.self.shopOpen=false
            preparedView, shelfReady = nil, false
        end
    end
    local function beginSlide()
        opening = false
        ctx.self.shopOpen, ctx.shopTime = true, 0
        ctx.action('merchant/talk', false, ctx.openShop)
        ctx.paintShop()
    end
    function ctx.openShop()
        if not ctx.current() or not inShop() or ctx.self.mode~='main'
            or ctx.self.shopOpen or ctx.self.shopBusy then return false end
        opening, ctx.self.shopBusy = true, true
        ctx.resetButtons()
        if shelfReady and preparedView==ctx.self.view and preparedFlow==ctx.self.run.nodeFlow then
            beginSlide()
        else ctx.paintShop() end
        return true
    end
    function ctx.closeShop()
        if ctx.self.shopBusy then return false end
        ctx.shopSelection:clear();ctx.resetButtons()
        if not ctx.self.shopOpen then return ctx.commit('leaveShop',nil,function()return '',{}end) end
        ctx.self.shopBusy=true;ctx.shopTime=0;ctx.shopClosing=true
        ctx.paintShop();return true
    end

    local function moveShelf()
        local p = math.min(1, ctx.shopTime / duration)
        local remaining = (1-p)^3
        local hidden = ctx.shopClosing and 1-remaining or remaining
        -- Native canvas units already follow the shared viewport transform.
        local height = math.max(720, ctx.self.canvasHeight or 720)
        local width = math.max(1280, ctx.self.canvasWidth or 1280)
        panel:SetAnchoredPosition(0, hidden*height)
        back:SetAnchoredPosition(shelfBack[1]-hidden*width, shelfBack[2])
    end

    function ctx.showShopRoom(visible, clickable)
        if room.visible ~= visible then room:SetVisible(visible) end
        if talk.visible ~= clickable then talk:SetVisible(clickable) end
    end

    function ctx.paintShop()
        local main = ctx.self.mode=='main' and inShop() == true
        local entering = main and not ctx.self.shopOpen
        local farewell = ctx.self:holding() and ctx.self.result.view=='farewell'
        -- Keep the complete scene behind the shelf for the entire transition.
        ctx.showShopRoom(entering or farewell or (main and ctx.shopTime ~= nil), entering and not opening)
        local caption = opening and '正在展开' or promptText
        if prompt.text~=caption then prompt.text=caption end
        if main and ctx.shopTime then moveShelf() end
        local showShelf = main and ctx.self.shopOpen == true
        if panel.visible ~= showShelf then panel:SetVisible(showShelf) end
    end
    local function shelfPreparationView()
        local self = ctx.self
        if not self.visible or not inShop() or self.shopOpen or self.mode ~= 'main' then return end
        if ctx.options.inputCovered and ctx.options.inputCovered() then return end
        local view = self.view
        if view and view.node and view.node.type == 'shop' then return view end
    end

    local function prepareShelf()
        local view = shelfPreparationView()
        if not view then return end
        local flow = ctx.self.run.nodeFlow
        if preparedView==view and preparedFlow~=flow then ctx.self:render();return end
        if preparedView~=view then
            preparedView, preparedFlow, preparationStep, shelfReady = view, flow, 1, false
        end
        -- Fill the pre-created shelf behind the room, one product at the target frame rate.
        if not shelfReady then
            shelfReady = ctx.prepareShop(view, preparationStep)
            preparationStep = preparationStep + 1
        end
        if opening and shelfReady then beginSlide() end
    end

    function ctx.updateShop(dt)
        if not ctx.shopTime then prepareShelf();return end
        if not ctx.self.visible or not inShop() or ctx.shopId~=ctx.self.run.nodeFlow.id
            or ctx.shopRun~=ctx.self.run or ctx.shopMap~=ctx.self.map then ctx.cancelShop(true);return end
        ctx.shopTime=ctx.shopTime+math.max(0,dt)
        if ctx.shopTime<duration then moveShelf();return end
        local closing=ctx.shopClosing
        ctx.cancelShop(false)
        if closing then
            ctx.self.shopOpen=false
            ctx.commit('leaveShop',nil,function()return '',{}end)
        else ctx.showShopRoom(false, false) end
    end

    ctx.self.merchant = ctx.merchant

    ctx.shopSelection = ShopSelection.new(ctx.self, ctx.child('shopView'), ctx.options)
    ctx.renderShop, ctx.prepareShop = ShopUI.new(ctx.self, {
        selection = ctx.shopSelection,
        child = ctx.child, show = ctx.show, state = ctx.state, ink = ctx.ink, picture = ctx.picture,relicPicture=ctx.relicPicture,
        fillCard = ctx.fillCard, cardName = ctx.cardName, relicName = ctx.relicName, relicText = ctx.relicText,
        action = ctx.action, pageArrows = ctx.pageArrows,
        commit = function(...) return ctx.commit(...) end,
    })
    function ctx.shopFooter()
        ctx.action('merchant/talk', not ctx.self.shopOpen and not ctx.self.shopBusy, ctx.openShop)
        if ctx.shopSelection.selected then return ctx.shopSelection:footer() end
        return '离开',nil,false,nil,nil,nil
    end
    function ctx.shopBackPosition()
        if ctx.self.shopOpen and ctx.self.mode=='main' and inShop() then return shelfBack end
        return layout.back
    end
end
return M
