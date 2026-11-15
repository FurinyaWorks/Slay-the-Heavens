-- Resource initialization behind the existing PageReveal boundary. No controls
-- are created, and only the requested page (plus its live grid cells) is visited.
local M={}
local function resolve(owner,root,path,check)
    local node=root
    for i=2,#path do
        owner.lookups=owner.lookups+1;node=assert(node:GetChild(path[i]),'image mode path missing '..path[i]);check()
    end
    return node
end
function M.new(stage,binding,enums,clock)
    assert(binding.schemaVersion==1 and type(enums)=='table','image mode binding/enum unavailable')
    clock=clock or os.clock
    local self={dead=false,page=nil,reads=0,writes=0,lookups=0,aliveReads=0,requests=0,lastRequests=0}
    local pages,templates,cache={},{},setmetatable({},{__mode='k'})
    local cells=setmetatable({},{__mode='k'})
    local static=0
    for _,name in ipairs(binding.templateNames)do templates[name]={}end
    for _,row in ipairs(binding.static)do
        local page=row.path[2];pages[page]=pages[page]or {};table.insert(pages[page],row)
    end
    for _,row in ipairs(binding.templates)do
        templates[row.scope]=templates[row.scope]or {};table.insert(templates[row.scope],row)
    end
    local function live(row)
        if self.dead then return false end
        self.aliveReads=self.aliveReads+1
        if stage.alive==false then return false end
        if row.root~=stage then
            self.aliveReads=self.aliveReads+1
            if row.root.alive==false then return false end
        end
        return (not row.page or row.page==self.page) and (not row.valid or row.valid())
    end
    local function write(row,spec)
        local version=row.version
        local function check()assert(live(row) and row.version==version,'image mode lease retired')end
        check()
        local node=resolve(self,row.root,spec.path,check)
        local wanted=assert(enums[spec.mode],'unknown image mode enum '..tostring(spec.mode))
        local saved=cache[node]
        if saved==wanted then return end
        self.reads=self.reads+1;local actual=node.imageType
        assert(live(row) and row.version==version,'image mode lease retired')
        if actual~=wanted then
            self.writes=self.writes+1;node.imageType=wanted
            assert(live(row) and row.version==version,'image mode lease retired')
            self.reads=self.reads+1;assert(node.imageType==wanted,'image mode readback rejected')
        end
        assert(live(row) and row.version==version,'image mode lease retired');cache[node]=wanted
    end
    function self.beginFrame(_)
        self.lastRequests=0;self.started=nil
    end
    function self.request(_,page)
        if self.page==page then return end
        self.page=page;static=1
    end
    function self.template(_,root,name,valid)
        assert(templates[name],'missing image mode template '..tostring(name))
        local row=cells[root]
        if not row or row.name~=name then row={root=root,name=name,index=1,page='deckPanel'};cells[root]=row end
        row.valid=valid
        row.version=(row.version or 0)+1
        return row.ready==true
    end
    function self.templateReady(_,root)
        local row=cells[root];return row and live(row) and row.ready==true
    end
    local function advance(row,list)
        if not live(row)then return false end
        local spec=list[row.index]
        if not spec then row.ready=true;return false end
        local version=row.version
        local ok,reason=pcall(write,row,spec)
        if not live(row) or row.version~=version then return false end
        assert(ok,reason);row.index=row.index+1
        row.ready=row.index>#list;return true
    end
    local function nextRequest(page)
        local list=pages[self.page]or {}
        if static<=#list then
            local row={root=stage,index=static,valid=function()return self.page==page end}
            if advance(row,list)then static=row.index;return true end
            return false
        end
        for _,row in pairs(cells)do
            if not row.ready and live(row) and advance(row,templates[row.name]or {})then return true end
        end
        return false
    end
    function self.step(_,page)
        self:request(page)
        if self.dead then return false,'image mode owner released'end
        self.aliveReads=self.aliveReads+1
        if stage.alive==false then return false,'image mode owner released'end
        if self.busy then return false,'image mode synchronous reentry'end
        self.started=self.started or clock();self.busy=true
        local ok,reason=pcall(function()
            while self.lastRequests<64 and self.page==page and not self.dead do
                -- A native request cannot be preempted. Check every request,
                -- so only that one getter/write/readback may cross the bound.
                if clock()-self.started>=.008 then break end
                if not nextRequest(page)then break end
                self.lastRequests=self.lastRequests+1;self.requests=self.requests+1
            end
        end)
        self.busy=false
        if not ok then self.reason=tostring(reason)end
        if self.reason then return false,self.reason end
        if self.page~=page or static<=#(pages[self.page]or {})then return false end
        for _,row in pairs(cells)do if live(row)and not row.ready then return false end end
        return not self.dead
    end
    function self.release(_)
        self.dead=true;self.page=nil;cells=setmetatable({},{__mode='k'})
    end
    return self
end
return M
