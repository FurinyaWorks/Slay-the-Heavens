-- Main's small effect/use/discard card. Inventory and effects remain in Run.
local Theme=require('abyss_theme')
local Controller=require('abyss_controller')
local M={}
local P,L=Theme.layout.potionPopup,Theme.layout
local function wrap(text,width)
    local out,line,used={},'',0
    for _,code in utf8.codes(text)do
        local glyph=utf8.char(code)
        local weight=code<128 and .55 or 1
        if code==10 or used+weight>width then
            out[#out+1]=line;line,used='',0
        end
        if code~=10 then line=line..glyph;used=used+weight end
    end
    out[#out+1]=line
    return table.concat(out,'\n'),#out
end
function M.new(root,owner,platform,clickEvent,actions)
    local popup={generation=0}
    local pointers,pointerSeen={},false
    local anonymous={}
    local function pointerKey(touch)return touch==nil and anonymous or touch end
    local function resetPointers(newMenu)
        pointers={}
        if newMenu then pointerSeen=false end
    end
    local function child(name)return assert(root:GetChild(name),'missing potion popup '..name)end
    local function valid(token)
        local run=owner.run
        return token and owner.active and not owner.busy and not owner.gesture
            and run==token.run and run.phase=='combat' and run.combat==token.battle
            and run.combat.phase=='player' and run.combat.turn==token.turn
            and run.potions==token.inventory and run.potions[token.slot]==token.id
    end
    function popup.close(_)
        if not owner.potionMenu then return false end
        owner.potionMenu=nil;popup.generation=popup.generation+1
        resetPointers(true)
        root:SetVisible(false);return true
    end
    local function size(name,x,y,w,h)
        local part=child(name);part:SetAnchoredPosition(x,y);part:SetSizeDelta(w,h)
    end
    local function enabled(name,value)
        local part=child(name);part.interactable=value==true;part.raycastTarget=value==true
    end
    function popup.render(_)
        local token=owner.potionMenu
        if not valid(token)then popup:close();root:SetVisible(false);return end
        local item=actions.item(token.slot)
        if not item then popup:close();return end
        local effect,lines=wrap(actions.text(item,token.battle),math.floor((P.width-P.padding*2)/P.font))
        -- Native title/action labels retain a full text line even on the compact
        -- source buttons. Reserve their actual frames, plus body descent room.
        local header=math.max(P.header,L.nativeText.lineHeight)
        local actionHeight=math.max(P.actionHeight,L.nativeText.lineHeight)
        local effectHeight=math.max(L.nativeText.lineHeight,lines*P.line+P.line)
        local h=math.max(P.minimumHeight,P.padding*2+header+effectHeight+P.gap+actionHeight)
        local x=L.battlePotions.origin[1]+(token.slot-1)*L.battlePotions.step[1]
        local y=P.top-h/2
        root:SetAnchoredPosition(x,y);root:SetSizeDelta(P.width,h)
        size('dismiss',-x,-y,Theme.canvas.base[1],Theme.canvas.base[2])
        for _,name in ipairs({'border','plate','hit'})do
            local inset=name=='plate' and 2 or 0
            size(name,0,0,P.width-inset,h-inset)
        end
        local top=h/2-P.padding
        size('title',-P.targetWidth/2,top-header/2,P.width-P.padding*2-P.targetWidth,L.nativeText.lineHeight)
        size('target',(P.width-P.padding*2-P.targetWidth)/2,top-header/2,P.targetWidth,L.nativeText.lineHeight)
        size('effect',0,top-header-effectHeight/2,P.width-P.padding*2,effectHeight)
        child('title').text=item.name
        child('target').text=item.targetPolicy=='enemy_one' and '对一个敌人' or item.targetPolicy=='enemy_all' and '对所有敌人' or '对自己'
        child('effect').text=effect
        local actionY=-h/2+P.padding+actionHeight/2
        size('use',-P.width/6,actionY,P.width/2,actionHeight)
        size('discard',P.width/3-P.padding/2,actionY,P.width/3-P.padding,actionHeight)
        enabled('use',item.canUse);enabled('discard',item.canDiscard~=false)
        root:SetVisible(true);root:SetAsLastSibling()
    end
    function popup.open(_,slot)
        local run=owner.run
        local token=run and {run=run,battle=run.combat,turn=run.combat and run.combat.turn,
            inventory=run.potions,slot=slot,id=run.potions[slot]}
        if not token or not token.id or not valid(token)then return false end
        if owner.potionMenu and owner.potionMenu.slot==slot then return popup:close() end
        popup.generation=popup.generation+1;owner.potionMenu=token;resetPointers(true);popup:render();return true
    end
    local function act(name)
        local token=owner.potionMenu
        if not valid(token)then popup:close();return false end
        local item=actions.item(token.slot)
        if name=='use' and not item.canUse or name=='discard' and item.canDiscard==false then return false end
        popup:close()
        if name=='dismiss'then actions.changed();return true end
        return actions[name](token.slot)
    end
    local function forget(pointer)
        if pointer and pointers[pointerKey(pointer.touch)]==pointer then pointers[pointerKey(pointer.touch)]=nil end
    end
    local function uniquePointer(control)
        local only
        for _,pointer in pairs(pointers)do if only then return end;only=pointer end
        return only and only.control==control and only or nil
    end
    local function currentPointer(control,event)
        local touch=event and event.touchId
        local pointer
        if touch~=nil then pointer=pointers[pointerKey(touch)]else pointer=uniquePointer(control)end
        return pointer and pointer.control==control and pointer or nil
    end
    local function beginPointer(control,event)
        if not valid(owner.potionMenu) or root.activeInHierarchy==false then return end
        pointerSeen=true
        if actions.pointerDown then actions.pointerDown(event)end
        local pointer={selection=owner.potionMenu,generation=popup.generation,control=control,
            touch=event and event.touchId,active=true}
        pointers[pointerKey(pointer.touch)]=pointer
        return pointer
    end
    local function releasePointer(control,event)
        local pointer=currentPointer(control,event)
        if not pointer then return end
        -- Missing Up identity can cancel a unique named origin, never complete it.
        if pointer.touch~=(event and event.touchId) or not valid(owner.potionMenu)then forget(pointer);return end
        pointer.active,pointer.released=false,true
        -- A rejected foreign press is still a physical competitor. Keep only
        -- its latest unconsumed release per control, not a touch history.
        for _,old in pairs(pointers)do
            if old~=pointer and old.control==control and not old.active and not old.action then forget(old)end
        end
        return pointer
    end
    local function cancelPointer(control,event)
        local pointer=currentPointer(control,event);forget(pointer);return pointer
    end
    local function clickMatches(control,token,event)
        if not token or not token.released then return false end
        local touch=event and event.touchId
        if touch~=nil then return token.touch==touch end
        return uniquePointer(control)==token
    end
    local function forgetReleased(control,event)
        local touch=event and event.touchId
        if touch==nil then return end
        local pointer=currentPointer(control,event)
        if pointer and pointer.released then forget(pointer)end
    end
    local function bind(name)
        local control=child(name)
        local held,released,observed
        local function ready(token)
            return root.activeInHierarchy~=false and valid(owner.potionMenu) and (name=='dismiss' or control.interactable)
                and (not token or token.selection==owner.potionMenu and token.generation==popup.generation
                    and pointers[pointerKey(token.touch)]==token)
        end
        Controller.bind(platform.controller,control,'battlePotion',function()return act(name)end,function()return ready()end)
        local cursor=platform.cursorEvents or {}
        if cursor.CursorDown and cursor.CursorUp then
            control:AddCursorEventListener(cursor.CursorDown,function(event)
                observed=true
                local pointer=beginPointer(control,event)
                local touch=event and event.touchId
                if held and held.touch~=touch and ready(held) or released and released.touch~=touch and ready(released) then return end
                held,released=nil,nil
                if pointer and ready()then held=pointer;pointer.action=true end
            end)
            control:AddCursorEventListener(cursor.CursorUp,function(event)
                local pointer=releasePointer(control,event)
                if held and (held==pointer or pointers[pointerKey(held.touch)]~=held)then
                    released=held==pointer and ready(held) and held or nil
                    if not released then forget(held)end
                    held=nil
                end
            end)
            if cursor.CursorDrag then control:AddCursorEventListener(cursor.CursorDrag,function(event)
                local pointer=currentPointer(control,event)
                if not pointer then return end
                -- Drag revokes the action but remains a physical competitor
                -- until its own terminal event; anonymous Click cannot guess it.
                pointer.action=false
                if held==pointer then held=nil end
                if released==pointer then released=nil end
            end)end
            for _,kind in pairs({cursor.CursorEndDrag,cursor.CursorExit})do
                control:AddCursorEventListener(kind,function(event)
                    local retired=cancelPointer(control,event)
                    if held==retired then held=nil end
                    if released==retired then released=nil end
                end)
            end
        end
        control:AddCursorEventListener(clickEvent,function(event)
            if Controller.pointerBlocked(platform.controller)then resetPointers(false);held,released=nil,nil;return false end
            local token
            if observed or pointerSeen then
                token=released
                if not clickMatches(control,token,event)then forgetReleased(control,event);return false end
                released=nil
                if not ready(token)then forget(token);return false end
            elseif not ready()then return false end
            if actions.pointerClick and not actions.pointerClick(event,token)then forget(token);return false end
            local accepted,reason=act(name)
            if actions.pointerConsumed then actions.pointerConsumed(event,token)end
            return accepted,reason
        end)
    end
    for _,name in ipairs({'use','discard','dismiss'})do bind(name)end
    local plate=child('hit')
    local cursor=platform.cursorEvents or {}
    if cursor.CursorDown and cursor.CursorUp then
        plate:AddCursorEventListener(cursor.CursorDown,function(event)beginPointer(plate,event)end)
        plate:AddCursorEventListener(cursor.CursorUp,function(event)releasePointer(plate,event)end)
        for _,kind in pairs({cursor.CursorEndDrag,cursor.CursorExit})do plate:AddCursorEventListener(kind,function(event)cancelPointer(plate,event)end)end
    end
    plate:AddCursorEventListener(clickEvent,function(event)forgetReleased(plate,event);return true end)
    root.disableCursorEventPassthrough=true
    root:SetVisible(false)
    return popup
end
return M
