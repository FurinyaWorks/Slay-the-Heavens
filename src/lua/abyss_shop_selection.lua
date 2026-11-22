-- Presentation state from ShopScreen's hover and touchscreen-confirm paths.
-- Offers remain owned by the current run; this module never changes inventory.
local Theme = require('abyss_theme')
local Pointer = require('abyss_pointer_input')
local L = Theme.layout.nativeNode.shop
local M = {}
local integer=require('abyss_numbers').integer

local function bindOutside(state, owner, hit, clickEvent, cursor, platform, current)
    local active,foreground,released,observed={},{},nil,false
    local noTouch={}
    local function key(event) return event and event.touchId or noTouch end
    local function ready(token)
        return token and not owner.busy and not owner.presentationBusy and not owner.shopBusy and not Pointer.blocked(platform)
            and state.selected==token.selection and current(token.selection)
    end
    local function matches(token,event) return token and token.touch==(event and event.touchId) end
    local function cancel(event)
        active[key(event)]=nil
        if matches(released,event) then released=nil end
        return true
    end
    state.resetOutside=function() active,foreground,released={},{},nil end
    state.foregroundDown=function(event)
        observed=true
        foreground[key(event)]=true;cancel(event)
    end
    state.foregroundUp=function(event)
        if foreground[key(event)] then foreground[key(event)]=false end
    end
    state.foregroundClick=function(event)
        if event and event.touchId~=nil then foreground[key(event)]=nil;return end
        for touch,down in pairs(foreground)do if not down then foreground[touch]=nil end end
    end
    state.foregroundCancel=function(event) foreground[key(event)]=nil;cancel(event) end
    local function foregroundActive()
        for _,down in pairs(foreground)do if down then return true end end
        return false
    end
    if cursor and cursor.CursorDown and cursor.CursorUp then
        hit:AddCursorEventListener(cursor.CursorDown,function(event)
            observed=true
            if foreground[key(event)] then return true end
            foreground[key(event)]=nil;released=nil
            local token={selection=state.selected,touch=event and event.touchId}
            if not ready(token) then token.selection=nil end
            active[key(event)]=token
            return true
        end)
        hit:AddCursorEventListener(cursor.CursorUp,function(event)
            local held=active[key(event)];active[key(event)]=nil
            if held then released=ready(held) and held or nil end
            return true
        end)
        for _,kind in ipairs({'CursorDrag','CursorExit','CursorEndDrag'}) do
            if cursor[kind] then hit:AddCursorEventListener(cursor[kind],cancel) end
        end
    end
    hit:AddCursorEventListener(clickEvent,function(event)
        local token=released
        if observed then
            local touch=event and event.touchId
            if not token or touch~=nil and token.touch~=touch or touch==nil and next(active)~=nil then return true end
            released=nil
        else token={selection=state.selected} end
        if Pointer.blocked(platform) or foregroundActive() then return true end
        if ready(token) then state:cancel() end
        -- This surface never dispatches to purchase, leave, or another page.
        return true
    end)
end

function M.new(owner, root, options)
    local state = { entries = {}, scales = {} }
    local function mobile() return options.touchScreen and options.touchScreen() == true end
    local function current(q)
        if not q or not owner.visible or owner.run ~= q.run or owner.map ~= q.map
            or owner.mode ~= 'main' or owner.run.phase ~= 'node' or owner.run.nodeFlow ~= q.flow
            or q.flow.complete then return false end
        local offer = q.flow[q.category] and q.flow[q.category][q.slot]
        return offer == q.offer and not offer.sold and not offer.unavailable
            and offer.id == q.id and offer.price == q.price and offer.upgraded == q.upgraded
    end
    local function observe(q)
        if not q or q.retired then return false end
        if not current(q) then q.retired=true;return false end
        return true
    end
    function state:bindOutside(hit,clickEvent,cursor,platform)
        bindOutside(self,owner,hit,clickEvent,cursor,platform,current)
    end
    function state:clear()
        if self.resetOutside then self.resetOutside() end
        local repaint=self.selected~=nil or self.focus~=nil or self.dirty
        self.selected, self.focus = nil, nil
        if repaint then self.dirty=true;self:paint(1) end
    end
    function state:begin()
        if self.resetOutside then self.resetOutside() end
        self.dirty=true
        self.entries = {}
        self.focus = nil
        if self.selected and (not observe(self.selected) or self.selected.purchasable and owner.run.gold < self.selected.price) then self.selected = nil end
    end
    function state.inspectable(_self,category,offer)
        return mobile() and category~='cards' and not offer.sold and not offer.unavailable
    end
    function state:bind(key, category, slot, handler, name, description, enabled, reason)
        local flow = owner.run.nodeFlow
        local offer = flow[category][slot]
        local q = {key=key,category=category,slot=slot,offer=offer,id=offer.id,price=offer.price,
            upgraded=offer.upgraded,run=owner.run,map=owner.map,flow=flow,
            handler=handler,name=name,description=description,purchasable=enabled,reason=reason}
        self.entries[key] = q
        return function()
            if self.entries[key]~=q or not observe(q) then return false, 'stale_action' end
            if enabled and owner.run.gold<q.price then return false,'insufficient_gold' end
            if self.selected and self.selected.key == key then self.selected = nil else self.selected = q end
            owner.notice=not enabled and reason or ''
            owner:render()
            return true
        end, function() return self.entries[key]==q and observe(q) end
    end
    function state:footer()
        local selected = self.selected
        if not selected or not observe(selected) then self.selected = nil; return end
        local q = self.entries[selected.key]
        if not q or q.offer ~= selected.offer or q.price ~= selected.price then self.selected = nil; return end
        local function buy()
            if self.selected ~= selected or not observe(selected) then return false,'stale_action' end
            if not q.purchasable then return false,'unavailable_action' end
            self.selected = nil
            return q.handler()
        end
        return '取消选择', q.purchasable and ('购买 · ' .. integer(selected.price)) or '暂不可购买', q.purchasable, buy, nil,
            function() return self.selected == selected and observe(selected) end
    end
    function state:cancel()
        if not self.selected then return false end
        self:clear(); owner:render(); return true
    end
    function state:enter(key)
        if mobile() or not owner.visible or owner.shopBusy or owner.shopOpen==false or owner.mode ~= 'main' then return end
        local q = self.entries[key]
        -- Insufficient funds must not prevent reading a card or item.
        if q and not q.offer.sold and not q.offer.unavailable then self.focus = key;self.dirty=true end
    end
    function state:exit(key) if self.focus == key then self.focus = nil;self.dirty=true end end
    function state:isSelected(key) return self.selected and self.selected.key == key end
    local function paintCard(i,x,focused,amount)
        local key='shopView/card'..i
        local target=focused==key and L.hoverScale or 1
        local scale=(state.scales[i] or 1)+(target-(state.scales[i] or 1))*amount
        local moving=math.abs(scale-target)>=.001
        if not moving then scale=target end
        state.scales[i]=scale
        local box=root:GetChild('card'..i)
        box:SetLocalScale(scale,scale,1);box:SetAnchoredPosition(x,L.cardRows[i])
        -- Only the focused face scales; other cards keep their resting anchors.
        -- Counter-scale its hit area so animation never churns pointer focus.
        local hit=box:GetChild('hit')
        hit:SetLocalScale(1/scale,1/scale,1)
        hit:SetAnchoredPosition(0,0)
        box:GetChild('glow'):SetVisible(focused==key)
        root:GetChild('price'..i):SetAnchoredPosition(x,L.priceRows[i]-(scale-1)*Theme.layout.card.size[2]/2)
        return moving
    end
    function state:paint(dt)
        if not self.dirty then return end
        local focused = self.selected and self.selected.key or self.focus
        local amount = math.min(1, math.max(0, dt) / L.hoverDuration)
        local moving=false
        for i, x in ipairs(L.columns) do
            moving=paintCard(i,x,focused,amount) or moving
        end
        local q = focused and self.entries[focused]
        local detail = root:GetChild('detail')
        local show = q ~= nil and q.category ~= 'cards'
        detail:SetVisible(show)
        if show then
            detail:GetChild('name').text = q.name
            detail:GetChild('description').text = q.description
        end
        self.dirty=moving
    end
    function state:update(dt)
        if self.selected and (not observe(self.selected) or self.selected.purchasable and owner.run.gold < self.selected.price) then
            self:clear(); owner:render(); return
        end
        if not owner.visible or owner.mode ~= 'main' or not owner.run.nodeFlow
            or owner.run.nodeFlow.type ~= 'shop' then self:clear();return end
        if self.focus and not current(self.entries[self.focus]) then self.focus = nil;self.dirty=true end
        self:paint(dt)
    end
    return state
end
return M
