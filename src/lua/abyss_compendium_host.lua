-- Optional composition at the native host boundary; GameUI ownership stays intact.
local UI=require('abyss_compendium_ui')
local Controller=require('abyss_controller')
local Theme=require('abyss_theme')
local M={}
function M.attach(host,root,data,presentation,event,platform)
    local panel,entries=root:GetChild('compendiumPanel'),root:GetChild('compendiumEntries')
    assert(panel and entries,'missing production compendium controls')
    assert(not host.compendium,'compendium already attached')
    local previous={}
    for _,name in ipairs({'refresh','update','resize','disable','onEngineDestroy','syncController','openMenu','openExit'})do previous[name]=host[name]end
    local width,height=table.unpack(Theme.canvas.base)
    local generation,bindings,context=0,{},{}
    local contextKeys={'mode','run','characterOpen','exitOpen','menuOpen','controlsOpen','easterEggOpen',
        'starting','settlementRequested','settlementBusy','disabled'}
    local function observeContext()
        local changed=false
        for _,key in ipairs(contextKeys)do
            if context[key]~=host[key] then changed=true;context[key]=host[key]end
        end
        if changed then generation=generation+1 end
    end
    local function available()
        return not host.disabled and host.mode=='menu' and host.run==nil and not host.characterOpen
            and not host.exitOpen and not host.controlsOpen and not host.easterEggOpen and not host.starting
            and not host.settlementRequested and not host.settlementBusy and not host.motion.deathReveal
    end
    local browser
    function host:closeCompendium()
        if not browser.visible then return false end
        browser:close();generation=generation+1
        if self.disabled then return false end
        self.mode='menu'
        previous.resize(self,width,height) -- Existing host generations reject pre-modal gestures.
        self:refresh()
        return true
    end
    browser=UI.new(panel,data,presentation,event,{controller=host.controller,cursorEvents=platform.cursorEvents,
        disabled=function()return host.disabled end,onClose=function()return host:closeCompendium()end})
    host.compendium=browser
    function host:openMenu(...)
        if browser.visible then return false,'compendium_open'end
        return previous.openMenu(self,...)
    end
    function host:openExit(...)
        if browser.visible then return false,'compendium_open'end
        return previous.openExit(self,...)
    end
    function host:openCompendium(kind)
        if not available()then return false end
        previous.resize(self,width,height)
        if not browser:open(kind)then return false end
        generation=generation+1;self.mode='compendium';self:refresh();return true
    end
    function host:syncController()
        if browser.visible then
            if self.controller then self.controller:sync('compendium',function()return self:closeCompendium()end)end
        else previous.syncController(self)end
    end
    function host:refresh()
        observeContext()
        if browser.visible and not self.disabled then
            root:GetChild('menuPanel'):SetVisible(false);root:GetChild('exitEntry'):SetVisible(false)
            entries:SetVisible(false);browser:render();self:syncController()
        else previous.refresh(self);observeContext();entries:SetVisible(available())end
    end
    function host:update(dt)
        if browser.visible then
            if self.disabled then return false,'ui_disabled' end
            if type(dt)~='number' or dt~=dt or dt<0 or dt==math.huge then return false,'invalid_delta' end
            if self.controller then self.controller:tick()end
            self:syncController();return true
        end
        return previous.update(self,dt)
    end
    function host:resize(w,h)
        width,height=w,h;browser:close();generation=generation+1
        if self.mode=='compendium'then self.mode='menu'end
        local result,reason=previous.resize(self,w,h);self:refresh();return result,reason
    end
    local function destroy(name)
        browser:destroy();if entries.alive~=false then entries:SetVisible(false)end;generation=generation+1
        for _,hit in ipairs(bindings)do Controller.unbind(host.controller,hit,hit.alive==false)end
        return previous[name](host)
    end
    function host.disable(_)return destroy('disable')end
    function host.onEngineDestroy(_)return destroy('onEngineDestroy')end
    local cursor=platform.cursorEvents or {}
    for _,kind in ipairs({'cards','relics','potions'})do
        local name=kind;local hit=entries:GetChild(name):GetChild('hit');local held,released
        local function touch(e)return e and (e.touchId or e.pointerId)end
        if cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(e)observeContext();if available()then held={generation=generation,touch=touch(e)}end end)
            hit:AddCursorEventListener(cursor.CursorUp,function(e)observeContext();if held and held.touch==touch(e)then released=held;held=nil end end)
            for _,cancelEvent in pairs({cursor.CursorExit,cursor.CursorEndDrag})do
                hit:AddCursorEventListener(cancelEvent,function()held,released=nil,nil end)
            end
        end
        local function invoke(e,controllerAction)
            observeContext()
            if not available() or not controllerAction and Controller.pointerBlocked(host.controller)then return false end
            if e and touch(e)~=nil and cursor.CursorDown and cursor.CursorUp then
                local token=released;released=nil
                if not token or token.generation~=generation or token.touch~=touch(e) or e.dragging then return false end
            end
            return host:openCompendium(name)
        end
        hit:AddCursorEventListener(event,invoke)
        Controller.bind(host.controller,hit,'menu',function()return invoke(nil,true)end,available,210+#bindings)
        bindings[#bindings+1]=hit
    end
    host:refresh()
    return host
end
return M
