local ShopUI = require("abyss_shop_ui")
local ShopSelection = require('abyss_shop_selection')
local Merchant = require('abyss_merchant')
local M = {}

-- Installs the shop setup responsibility on one node UI instance.
function M.install(ctx)
    ctx.merchant = Merchant.new(ctx.child("merchant"), { color = ctx.options.color, sound = ctx.options.sound, compact = true })

    local hit=ctx.child('merchant'):GetChild('talk'):GetChild('hit')
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
                if not ctx.self.visible or ctx.self.shopBusy or ctx.self.shopOpen then held=nil end
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

    local panel, back = ctx.child('shopView'), ctx.child('back')
    local layout = require('abyss_theme').layout.nativeNode
    local function inShop()
        local node=ctx.self.run and ctx.self.run.nodeFlow
        return node and node.type=='shop' and not node.complete
    end
    function ctx.syncShop()
        local node=ctx.self.run and ctx.self.run.nodeFlow
        if ctx.shopId~=(node and node.id) or ctx.shopRun~=ctx.self.run then
            ctx.cancelShop(true)
            ctx.shopId,ctx.shopRun=node and node.id,ctx.self.run
        end
    end
    function ctx.cancelShop(reset)
        ctx.shopEpoch=(ctx.shopEpoch or 0)+1;held=nil;released=nil
        ctx.shopTime=nil;ctx.shopClosing=false;ctx.self.shopBusy=nil
        if reset then ctx.self.shopOpen=false end
        panel:SetAnchoredPosition(0,0)
        back:SetAnchoredPosition(layout.back[1],layout.back[2])
    end
    function ctx.openShop()
        if not ctx.current() or not inShop() or ctx.self.mode~='main'
            or ctx.self.shopOpen or ctx.self.shopBusy then return false end
        ctx.self.shopOpen=true;ctx.self.shopBusy=true;ctx.shopTime=0;ctx.shopClosing=false
        ctx.resetButtons();ctx.self:render();return true
    end
    require('abyss_controller').bind(ctx.options.controller,hit,'node',ctx.openShop,function()
        return ctx.self.visible and inShop() and not ctx.self.shopOpen and not ctx.self.shopBusy
    end,1)
    function ctx.closeShop()
        if ctx.self.shopBusy then return false end
        ctx.shopSelection:clear();ctx.resetButtons()
        if not ctx.self.shopOpen then return ctx.commit('leaveShop',nil,function()return '',{}end) end
        ctx.self.shopBusy=true;ctx.shopTime=0;ctx.shopClosing=true
        ctx.self:render();return true
    end
    function ctx.paintShop()
        if not inShop() then return end
        local main=ctx.self.mode=='main'
        panel:SetVisible(main and ctx.self.shopOpen==true)
        if main then
            local p=ctx.shopTime and math.min(1,ctx.shopTime/.3) or 1
            local ease=1-(1-p)^3
            local hidden=ctx.shopClosing and ease or 1-ease
            -- Native canvas units already follow the shared viewport transform.
            local height=math.max(720,ctx.self.canvasHeight or 720)
            local width=math.max(1280,ctx.self.canvasWidth or 1280)
            panel:SetAnchoredPosition(0,hidden*height)
            if not ctx.shopSelection.selected then back:SetAnchoredPosition(layout.back[1]-hidden*width,layout.back[2]) end
            local cloth=panel:GetChild('v25ShopCloth')
            if cloth and ctx.options.color then
                cloth:GetChild('cloth').imageColor=ctx.options.color(82,100,74,math.floor(255*(1-.15*hidden)))
            end
        end
        local merchant=ctx.child('merchant')
        merchant:SetAnchoredPosition(0,-80)
        merchant:GetChild('portrait'):SetAnchoredPosition(0,0)
        local size=require('abyss_theme').layout.merchant.portrait[3]
        merchant:GetChild('portrait'):SetLocalScale(104/size,104/size,1)
        hit:SetSizeDelta(128,128)
        merchant:GetChild('portrait'):SetVisible(main and not ctx.self.shopOpen)
        merchant:GetChild('talk'):SetVisible(main and not ctx.self.shopOpen)
        merchant:GetChild('bubble'):SetAnchoredPosition(-530,260)
        merchant:GetChild('line'):SetAnchoredPosition(-530,264)
    end
    function ctx.updateShop(dt)
        if not ctx.shopTime then return end
        if not ctx.self.visible or not inShop() or ctx.shopId~=ctx.self.run.nodeFlow.id or ctx.shopRun~=ctx.self.run then ctx.cancelShop(true);return end
        ctx.shopTime=ctx.shopTime+math.max(0,dt)
        if ctx.shopTime<.3 then ctx.paintShop();return end
        local closing=ctx.shopClosing
        ctx.cancelShop(false);ctx.shopClosing=false
        if closing then
            ctx.self.shopOpen=false
            ctx.commit('leaveShop',nil,function()return '',{}end)
        else ctx.self:render() end
    end

    ctx.self.merchant = ctx.merchant

    ctx.shopSelection = ShopSelection.new(ctx.self, ctx.child('shopView'), ctx.options)
    ctx.renderShop = ShopUI.new(ctx.self, {
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
end
return M
