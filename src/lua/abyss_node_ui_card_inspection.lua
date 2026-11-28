-- Node card details use projected card text and never dispatch a room action.
local Theme = require('abyss_theme')
local Keywords = require('abyss_card_keywords')
local Pointer = require('abyss_pointer_input')
local KeywordTip = require('abyss_card_keyword_tip')
local L = Theme.layout.nativeNode
local footerTop = math.max(L.back[2]+L.back[4]/2,L.confirm[2]+L.confirm[4]/2)
local M = {}

function M.new(ctx,panel)
    local owner = ctx.self
    local state = {}
    local hover,held,opened,swallow
    local function hide()
        if opened then panel:SetVisible(false);opened=nil end
    end
    local function available(box)
        if not owner.visible or owner.busy or owner.presentationBusy or owner.shopBusy
            or ctx.options.inputCovered and ctx.options.inputCovered() or Pointer.blocked(ctx.options) then return false end
        while box and box~=ctx.root do
            if box.alive==false or not box.visible then return false end
            box = box.parent
        end
        return box==ctx.root
    end
    local function capture(box,read)
        if not available(box) then return end
        local card,action = read()
        if not card then return end
        return {box=box,read=read,card=card,action=action,run=owner.run,flow=owner.run.nodeFlow,map=owner.map,view=owner.view,time=0}
    end
    local function current(session)
        if owner.run~=session.run or owner.run.nodeFlow~=session.flow or owner.map~=session.map or owner.view~=session.view
            or not available(session.box) then return false end
        local card,action = session.read()
        return card==session.card and action==session.action
    end
    local function touch(event) return event and event.touchId end
    local function mobile() return ctx.options.touchScreen and ctx.options.touchScreen() end
    function state.reset(_)
        hover,held=nil,nil
        hide()
    end
    function state.consume(_,box,event)
        return swallow and swallow.box==box and (touch(event)==nil or touch(event)==swallow.touch)
    end
    function state.bind(_,box,read,listen)
        local cursor = ctx.cursor
        if not panel or not cursor then return end
        local hit = box:GetChild('hit')
        local function on(event,callback)
            if cursor[event] then listen(hit,cursor[event],callback) end
        end
        on('CursorEnter',function()
            if mobile() then return end
            hide()
            hover=capture(box,read)
        end)
        local function cancel(event)
            if held and held.box==box and held.touch==touch(event) then held=nil end
        end
        on('CursorExit',function(event)
            if hover and hover.box==box then hover=nil end
            if opened and opened.box==box then hide() end
            cancel(event)
        end)
        on('CursorDown',function(event)
            if swallow and swallow.box==box then swallow=nil end
            held=nil
            local session=capture(box,read)
            if not session or not (mobile() or session.card.definition.originalV4) then return end
            session.touch=touch(event)
            session.x,session.y=ctx.point(event)
            held=session
        end)
        on('CursorUp',cancel)
        on('CursorEndDrag',cancel)
        on('CursorDrag',function(event)
            if not held or held.box~=box or held.touch~=touch(event) then return end
            local x,y=ctx.point(event)
            if not x or not held.x or (x-held.x)^2+(y-held.y)^2>=Theme.layout.cardDrag.threshold^2 then held=nil end
        end)
    end
    function state:update(dt)
        if swallow and swallow.box.alive==false then swallow=nil end
        if opened and not current(opened) then hide() end
        if hover then
            if not current(hover) then hover=nil
            else
                hover.time=hover.time+math.max(dt,0)
                if hover.time>Keywords.hoverDelay then
                    local session=hover
                    hover=nil
                    local card=session.card
                    local rows=Keywords.runTips(owner.run,card.definition,card.upgraded,card.text)
                    if rows then KeywordTip.paint(panel,session.box,ctx.root,rows,footerTop);opened=session end
                end
            end
        end
        if not held then return end
        if not current(held) then held=nil;return end
        held.time=held.time+math.max(dt,0)
        if held.time<Theme.layout.statusInfo.delay then return end
        local session=held
        held=nil
        local card=session.card
        if ctx.options.onInspectCard and ctx.options.onInspectCard(card.definition,card.upgraded,card.text) then
            swallow={box=session.box,touch=session.touch}
            ctx.swipe=nil
            self:reset()
        end
    end
    return state
end

return M
