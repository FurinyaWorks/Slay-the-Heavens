-- Node HUD readouts share the existing read-only DeckUI surface and modal gates.
local Overlays=require('abyss_game_ui_overlays')
local Controller=require('abyss_controller')
local M={}
function M.attach(host,root,event,cursor)
    assert(not host.nodeResourceHints,'node resource hints already attached')
    cursor=cursor or {}
    local owner={generation=0,records={},context={}}
    host.nodeResourceHints=owner
    local canManage=Overlays.canManagePotions(Overlays.openingCovered(host),host)
    local read=Overlays.resourceHint(host,canManage,Overlays.inCombat(host))
    local previous={}
    for _,name in ipairs({'refresh','update','resize','disable','onEngineDestroy'})do previous[name]=host[name]end
    local function context()
        local run=host.run
        return {mode=host.mode,run=run or false,phase=run and run.phase or false,
            room=run and run.roomGeneration or false,disabled=host.disabled==true,
            exit=host.exitOpen==true,characters=host.characterOpen==true,potions=host.potionUI.visible,
            deck=host.deckUI.visible,deckGeneration=host.deckUI.generation,
            choices=host.choiceUI and host.choiceUI.visible or false,picker=host.nodeUI.mode}
    end
    local function observe()
        for key,value in pairs(context())do
            if owner.context[key]~=value then owner.generation=owner.generation+1;owner.context[key]=value end
        end
    end
    local function available(record)
        return not owner.destroyed and not host.disabled and host.mode=='node' and host.run~=nil
            and not host.potionUI.visible and host.nodeUI.mode~='picker' and canManage(host.run)
            and owner.records[record.kind]==record and record.hit.alive~=false
    end
    local function retire(record)
        if record then Controller.unbind(host.controller,record.hit,record.hit.alive==false)end
    end
    local function bind(kind,hit)
        local record={kind=kind,hit=hit}
        owner.records[kind]=record
        local function touch(e)return e and (e.touchId or e.pointerId)end
        local function token()return {generation=owner.generation,run=host.run}end
        if cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(e)
                observe();record.observed=true;record.held,record.released=nil,nil
                if available(record)then record.held=token();record.held.touch=touch(e)end
            end)
            hit:AddCursorEventListener(cursor.CursorUp,function(e)
                observe()
                if record.held and record.held.touch==touch(e)then record.released=record.held;record.held=nil end
            end)
            for _,cancelEvent in pairs({cursor.CursorExit,cursor.CursorEndDrag})do
                hit:AddCursorEventListener(cancelEvent,function(e)
                    local held=record.held or record.released
                    if not e or held and held.touch==touch(e)then record.held,record.released=nil,nil end
                end)
            end
        end
        local function invoke(e,controllerAction)
            observe()
            if not available(record) or not controllerAction and Controller.pointerBlocked(host.controller)then return false end
            if not controllerAction and (record.observed or touch(e)~=nil and cursor.CursorDown and cursor.CursorUp)then
                local released=record.released;record.released=nil
                if not released or released.generation~=owner.generation or released.run~=host.run
                    or released.touch~=touch(e) or e and e.dragging then return false end
            end
            return read(kind)
        end
        hit:AddCursorEventListener(event,function(e)return invoke(e,false)end)
        Controller.bind(host.controller,hit,'node',function()return invoke(nil,true)end,
            function()return available(record)end,kind=='hp' and 20 or 21)
    end
    local function sync()
        observe()
        if owner.destroyed then return end
        for kind,record in pairs(owner.records)do
            if record.hit.alive==false then retire(record);owner.records[kind]=nil end
        end
        if host.disabled or host.mode~='node' then return end
        local panel=root:GetChild('nodePanel')
        local hints=panel and panel.alive~=false and panel:GetChild('resourceHints')
        if not hints then return end
        for _,kind in ipairs({'hp','gold'})do
            local hit=hints:GetChild(kind):GetChild('hit');local record=owner.records[kind]
            if not record or record.hit~=hit then
                retire(record);owner.generation=owner.generation+1;bind(kind,hit)
            end
        end
    end
    function owner.destroy(_)
        if owner.destroyed then return false end
        owner.destroyed=true;owner.generation=owner.generation+1
        for _,record in pairs(owner.records)do retire(record)end
        owner.records={};return true
    end
    function host:refresh(...)
        local result=table.pack(previous.refresh(self,...));sync();return table.unpack(result,1,result.n)
    end
    function host:update(...)
        local result=table.pack(previous.update(self,...));sync();return table.unpack(result,1,result.n)
    end
    function host:resize(...)
        owner.generation=owner.generation+1
        local result=table.pack(previous.resize(self,...));sync();return table.unpack(result,1,result.n)
    end
    function host:disable(...)owner:destroy();return previous.disable(self,...)end
    function host:onEngineDestroy(...)owner:destroy();return previous.onEngineDestroy(self,...)end
    sync();return owner
end
return M
