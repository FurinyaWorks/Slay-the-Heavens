-- Read-only card roots belong to the browser, with a lifetime independent of pages.
local Pointer = require('abyss_pointer_input')
local CardDisplay = require('abyss_card_display')
local Theme = require('abyss_theme')
local M = {pageSize=10}
local columns, stepX, stepY = 5, 177, 237

local function hide(entry)
    entry.version=entry.version+1
    entry.held,entry.released,entry.instance=nil,nil,nil
    if entry.root.alive==false then return end
    if entry.hit.alive~=false and entry.hit.raycastTarget~=false then entry.hit.raycastTarget=false end
    if entry.root.visible~=false then entry.root:SetVisible(false) end
    if entry.nativeArt then
        CardDisplay.clearNativeArt(entry.face,entry.art)
        entry.nativeArt=nil
    end
end

local function current(entry,token,job)
    return token and job and job.ready and entry.root.alive~=false and entry.hit.alive~=false
        and entry.instance and token.job==job and token.version==entry.version and token.uid==entry.instance.uid
end

local function bind(pool,entry)
    local hit,cursor=entry.hit,pool.cursor
    local function available()
        return pool.job and pool.job.ready and entry.instance~=nil and entry.root.alive~=false and hit.alive~=false
    end
    local function pick()
        if not available() then return false end
        return pool.pick(entry.instance)
    end
    if cursor.CursorDown and cursor.CursorUp then
        hit:AddCursorEventListener(cursor.CursorDown,function(event)
            entry.observed=true
            if not available() or Pointer.blocked(pool) then return end
            local touch=event and event.touchId
            if entry.held and entry.held.touch~=touch then return end
            entry.released=nil
            entry.held={job=pool.job,version=entry.version,uid=entry.instance.uid,touch=touch}
        end)
        hit:AddCursorEventListener(cursor.CursorUp,function(event)
            local held=entry.held
            if held and held.touch==(event and event.touchId) then
                entry.held=nil
                if current(entry,held,pool.job) then entry.released=held end
            end
        end)
        local function cancel(event)
            local touch=event and event.touchId
            if entry.held and (not event or entry.held.touch==touch) then entry.held=nil end
            if entry.released and (not event or entry.released.touch==touch) then entry.released=nil end
        end
        if cursor.CursorExit then hit:AddCursorEventListener(cursor.CursorExit,cancel) end
        if cursor.CursorEndDrag then hit:AddCursorEventListener(cursor.CursorEndDrag,cancel) end
    end
    hit:AddCursorEventListener(pool.click,function(event)
        if entry.observed or cursor.CursorDown and cursor.CursorUp and event and event.touchId~=nil then
            local token=entry.released
            if not token or token.touch~=(event and event.touchId) then return false end
            entry.released=nil
            if not current(entry,token,pool.job) then return false end
        end
        if Pointer.blocked(pool) or Pointer.dragged(event,Theme.layout.cardDrag.threshold) then return false end
        return pick()
    end)
end

local function live(pool,job)
    return pool.job==job and not pool.dead and pool.container.alive~=false
end

local function entryAlive(entry)
    if entry.root.alive==false or entry.face.alive==false or entry.art.alive==false or entry.hit.alive==false then return false end
    for _,part in pairs(entry.parts)do if part.alive==false then return false end end
    return true
end

local function remove(pool,entry,engineDestroyed)
    return engineDestroyed or entry.root.alive==false or pool.factory.destroy(entry.root)~=false
end

local function retire(pool,entry)
    local ok,removed=pcall(remove,pool,entry,pool.dead)
    if not ok or not removed then pool.retired[#pool.retired+1]=entry end
end

local function nativeKey(control)
    local ok,id=pcall(function()return control.id end)
    return ok and id or control
end

local function recoverShell(pool)
    if pool.dead or pool.container.alive==false then return end
    local occupied={}
    for _,list in ipairs({pool.entries,pool.retired})do
        for _,entry in ipairs(list)do occupied[nativeKey(entry.root)]=true end
    end
    for _,root in ipairs(pool.container:GetChildren())do
        if not occupied[nativeKey(root)] then retire(pool,{root=root}) end
    end
end

local function create(pool,job)
    pool.creating=true
    local root=assert(pool.factory.create(pool.container),'deck browser template creation failed')
    pool.creating=nil
    if not live(pool,job) then
        retire(pool,{root=root})
        return
    end
    local entry={root=root,version=0,parts={},nextPart=1}
    -- Track the allocation before child discovery so a failed bind can clean up.
    pool.incomplete=entry
    root:SetVisible(false)
    entry.face=assert(root:GetChild('face'),'missing browser face')
    entry.art=assert(entry.face:GetChild('art'),'missing browser artwork')
    entry.hit=assert(root:GetChild('hit'),'missing browser hit area')
    entry.hit.raycastTarget=false
    bind(pool,entry)
    if pool.incomplete==entry then
        pool.incomplete=nil
        if live(pool,job) then
            pool.entries[#pool.entries+1]=entry
            return entry
        end
        retire(pool,entry)
    end
end

local function mountPart(pool,entry,part)
    local mount=entry.root
    for _,name in ipairs(part.path)do mount=assert(mount:GetChild(name),'missing deck browser mount '..name) end
    entry.mounting=true
    entry.parts[part.name]=assert(pool.factory.create(mount,part),'deck browser chunk creation failed')
    entry.mounting=nil
    entry.nextPart=entry.nextPart+1
end

local function match(entries,models,job)
    local used={}
    for i,model in ipairs(models) do
        for _,entry in ipairs(entries) do
            if not used[entry] and M.sameLook(entry.look,model.look) then
                job.slots[i],used[entry]=entry,true
                break
            end
        end
    end
    for i=1,#models do
        if not job.slots[i] then
            for _,entry in ipairs(entries) do
                if not used[entry] then
                    job.slots[i],used[entry]=entry,true
                    break
                end
            end
        end
    end
end

function M.sameLook(a,b)
    if not a or not b then return false end
    for i=1,#b do
        if a[i]~=b[i] then return false end
    end
    return true
end

local function showHit(hit)
    if hit.visible~=true then
        assert(hit:SetVisible(true)~=false,'deck browser hit visibility rejected')
    end
end

local function prepare(pool,job)
    local i=job.next
    if not job.assigned then
        if i<=#job.cards then
            job.models[i]=pool.model(job.cards[i])
            job.next=i+1
            return
        end
        match(pool.entries,job.models,job)
        job.assigned,job.next=true,1
        return
    end
    if i>#job.cards then
        assert(pool.container:SetVisible(true)~=false,'deck browser container visibility rejected')
        if not live(pool,job) then return end
        job.ready=true
        return
    end
    local entry=job.slots[i]
    if not entry then
        assert(#pool.entries+#pool.retired<M.pageSize,'deck browser still owns retired native controls')
        job.slots[i]=create(pool,job)
        return -- Template creation is an independent budgeted operation.
    end
    assert(entryAlive(entry),'deck browser entry was destroyed')
    local part=pool.factory.parts and pool.factory.parts[entry.nextPart]
    if part then
        mountPart(pool,entry,part)
        return
    end
    local model=job.models[i]
    local unchanged=M.sameLook(entry.look,model.look)
    entry.look=nil
    pool.paint(entry,model,unchanged,function()return live(pool,job) and entryAlive(entry) end)
    if not live(pool,job) then return end
    assert(entryAlive(entry),'deck browser entry was destroyed while painting')
    local x,y=((i-1)%columns-2)*stepX,pool.startY-math.floor((i-1)/columns)*stepY
    if entry.position~=i then assert(entry.root:SetAnchoredPosition(x,y)~=false,'deck browser position rejected') end
    if not live(pool,job) then return end
    entry.position,entry.look,entry.instance=i,model.look,job.cards[i]
    entry.hit.raycastTarget=true
    if not live(pool,job) then return end
    showHit(entry.hit)
    if not live(pool,job) then return end
    assert(entry.root:SetVisible(true)~=false,'deck browser entry visibility rejected')
    if not live(pool,job) then
        if entry.root.alive~=false then hide(entry) end
        return
    end
    job.next=i+1
end

function M.new(container,factory,platform,click,startY,model,paint,pick)
    local pool={container=container,factory=factory,pointerBlocked=platform.pointerBlocked,
        cursor=platform.cursorEvents or {},click=click,startY=startY,model=model,paint=paint,pick=pick,entries={},retired={},revision=0,changing=0}
    function pool:cancel()
        self.revision=self.revision+1
        local revision=self.revision
        self.job=nil
        self.changing=self.changing+1
        local ok,reason=pcall(function()
            if self.container.alive~=false and self.container.visible~=false then self.container:SetVisible(false) end
            for _,entry in ipairs(self.entries) do
                if self.revision~=revision then break end
                hide(entry)
            end
        end)
        self.changing=self.changing-1
        assert(ok,reason)
        return revision
    end
    local function retryRetired()
        local retired=pool.retired
        pool.retired={}
        for _,entry in ipairs(retired) do retire(pool,entry) end
    end
    function pool:release(engineDestroyed)
        if engineDestroyed then self.job=nil;self.dead=true
        else self:cancel() end
        local entries,incomplete=self.entries,self.incomplete
        self.entries,self.incomplete={},nil
        retryRetired()
        if incomplete then retire(self,incomplete) end
        for _,entry in ipairs(entries) do retire(self,entry) end
    end
    function pool:request(cards)
        local revision=self:cancel()
        if self.revision~=revision or self.dead then return end
        retryRetired()
        if self.revision~=revision or self.dead then return end
        for i=#self.entries,1,-1 do
            if not entryAlive(self.entries[i]) then
                retire(self,table.remove(self.entries,i))
                if self.revision~=revision or self.dead then return end
            end
        end
        self.job={cards=cards,models={},slots={},next=1,yielded=false,ready=#cards==0}
    end
    function pool:step()
        local job=self.job
        if self.stepping or self.changing>0 or not job or job.ready or job.error then return end
        if not job.yielded then job.yielded=true;return end
        local clock=self.factory.clock or os.clock
        local start=clock()
        self.stepping=true
        repeat
            local ok,reason=pcall(prepare,self,job)
            if not ok and self.creating then
                self.creating=nil
                recoverShell(self)
            end
            if not ok and self.incomplete then
                local incomplete=self.incomplete
                self.incomplete=nil
                retire(self,incomplete)
            end
            if not ok and job.assigned then
                local entry=job.slots[job.next]
                if entry and entry.mounting then
                    -- A failed bridge can leave an attached child even when it
                    -- returned no handle. The owned root retires that subtree.
                    for i,owned in ipairs(self.entries)do
                        if owned==entry then retire(self,table.remove(self.entries,i));break end
                    end
                end
            end
            if not live(self,job) then break end
            if not ok then
                local revision=self:cancel()
                if self.revision==revision and not self.dead then self.job=job;job.error=tostring(reason) end
                break
            end
        until job.ready or clock()-start>=(self.factory.budget or .004)
        self.stepping=false
    end
    return pool
end
return M
