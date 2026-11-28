-- One passive surface for combat grid choices and deck browsing.
local Theme=require('abyss_theme')
local Pointer=require('abyss_pointer_input')
local Tip=require('abyss_card_keyword_tip')
local hoverDelay=require('abyss_card_keywords').hoverDelay
local M={}

function M.new(panel,platform,host)
    local state={}
    local active
    local swallowed=setmetatable({}, {__mode='k'})
    local function hide(cancel)
        if cancel and active and active.hold then swallowed[active.hit]={touch=active.touch} end
        if active and active.shown and panel.alive~=false then panel:SetVisible(false) end
        active=nil
    end
    local function mobile()
        return platform.touchScreen and platform.touchScreen()
    end
    local function touch(event) return event and event.touchId end
    local function blocked()
        return host.exitOpen or host.disabled or host.sessionPaused or host.settlementRequested
            or host.settlementBusy or Pointer.blocked(platform)
    end
    local function start(owner,hit,capture,hold,event)
        if (mobile()==true)~=hold or blocked() then return end
        if active and active.hold and (active.touch~=touch(event) or active.hit==hit) then return end
        hide(true)
        local current,rows,floor=capture()
        if not current then return end
        active={owner=owner,hit=hit,hold=hold,touch=touch(event),current=current,rows=rows,floor=floor,time=0}
    end
    function state.enter(owner,hit,capture)
        start(owner,hit,capture,false)
    end
    function state.down(owner,hit,capture,event)
        local key=touch(event)
        if not active or not active.hold or active.hit~=hit or active.touch==key then swallowed[hit]=nil end
        if capture then start(owner,hit,capture,true,event) end
    end
    function state.exit(hit,event)
        if active and active.hit==hit and (not active.hold or not event or active.touch==touch(event)) then hide(true) end
    end
    function state.up(hit,event)
        if active and active.hold and active.hit==hit and active.touch==touch(event) then
            hide(Pointer.dragged(event,Theme.layout.cardDrag.threshold))
        end
    end
    function state.drag(hit,event)
        if active and active.hold and active.hit==hit and active.touch==touch(event)
            and Pointer.dragged(event,Theme.layout.cardDrag.threshold) then
            hide(true)
            return true
        end
    end
    function state.consume(hit,event)
        if active and active.hold and active.hit==hit then return true end
        local spent=swallowed[hit]
        return spent and (not event or touch(event)==nil or spent.touch==touch(event))
    end
    function state.clear(owner)
        if active and active.owner==owner then hide(true) end
    end
    function state.cancelIfBlocked()
        if active and blocked() then hide(true) end
    end
    function state.update(owner,dt)
        local s=active
        if not s or s.owner~=owner then return end
        if s.hit.alive==false or s.hit.activeInHierarchy==false or blocked() or not s.current() then
            hide(true);return
        end
        if s.shown or not dt then return end
        s.time=s.time+math.max(0,dt)
        if (s.hold and s.time<Theme.layout.statusInfo.delay) or (not s.hold and s.time<=hoverDelay) then return end
        local rows=s.rows()
        if not rows then hide();return end
        if s.hold then swallowed[s.hit]={touch=s.touch} end
        panel:SetAsLastSibling()
        Tip.paint(panel,s.hit,owner.root,rows,s.floor)
        s.shown=true
    end
    return state
end

return M
