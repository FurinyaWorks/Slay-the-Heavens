-- One binding per native hit; recycled items replace data, not listeners.
local Controller=require('abyss_controller')
local M={}
local function moved(e)
    if not e then return false end
    if e.dragging then return true end
    if not e.GetPressUIPos or not e.GetUIPos then return false end
    local x,y=e:GetUIPos();local px,py=e:GetPressUIPos()
    return math.abs(x-px)>8 or math.abs(y-py)>8
end
function M.bind(hit,event,options,valid,version,action,order,hover)
    local held,released
    local cursor=options.cursorEvents or {}
    local function touch(e)return e and(e.touchId or e.pointerId)end
    if cursor.CursorDown and cursor.CursorUp then
        hit:AddCursorEventListener(cursor.CursorDown,function(e)
            if valid()then held={generation=version(),touch=touch(e)}end
        end)
        hit:AddCursorEventListener(cursor.CursorUp,function(e)
            if held and held.touch==touch(e)then released=held;held=nil end
        end)
        for _,kind in pairs({cursor.CursorExit,cursor.CursorEndDrag})do
            hit:AddCursorEventListener(kind,function()
                held,released=nil,nil
                if hover and hover.exit then hover.exit()end
            end)
        end
    end
    local function pointer(e)
        if not e or not touch(e)or not cursor.CursorDown or not cursor.CursorUp then return true end
        local token=released;released=nil
        return token and token.generation==version()and token.touch==touch(e)and not e.dragging
    end
    local function invoke(e,controllerAction)
        if not valid()or not controllerAction and Controller.pointerBlocked(options.controller)then return false end
        if moved(e)or not pointer(e)then return false end
        return action()
    end
    hit:AddCursorEventListener(event,invoke)
    if cursor.CursorEnter and hover then hit:AddCursorEventListener(cursor.CursorEnter,function()if valid()then hover.enter()end end)end
    Controller.bind(options.controller,hit,'compendium',function()return invoke(nil,true)end,valid,order,nil,hover and hover.enter)
    return invoke
end
return M
