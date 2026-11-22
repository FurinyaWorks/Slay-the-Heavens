-- Recycle the existing deck-card template. A cell binding owns one index in
-- one pending choice, even when the native grid keeps the same physical cell.
local Controller=require('abyss_controller')
local CardDisplay=require('abyss_card_display')
local M={}

local function geometry(grid,count,columns)
    local _,height=grid:GetItemSize()
    local _,gap=grid:GetItemSpacing()
    local top,bottom=grid:GetPadding()
    local rows=math.ceil(count/columns)
    return height+gap,math.max(0,top+bottom+rows*(height+gap)-gap-grid.sizeDeltaY)
end

function M.new(grid,controller,columns,bind,paint,paintSelection)
    local list={bindings={},cells={}}
    local function retire(clear)
        for control,entry in pairs(list.bindings)do
            if control.alive==false then
                entry.binding=nil
                Controller.unbind(controller,entry.hit,true)
                list.bindings[control]=nil
                if list.cells[entry.index]==control then list.cells[entry.index]=nil end
            elseif clear then
                CardDisplay.clearNativeArt(entry.face)
                entry.binding=nil
            end
        end
    end
    function list:close()
        self.context=nil;self.cards=nil;self.load=nil;self.cells={}
        if grid.visible==false then return end
        grid:SetVisible(false)
        retire(true)
        grid:RefreshItems(0,function()end)
        retire(false)
    end
    function list:open(context,cards)
        if self.context then retire(true) end
        self.context,self.cards,self.cells,self.load,self.error,self.initialReady=context,cards,{},'start',nil,false
        grid:SetVisible(true)
    end
    local function receive(control,index)
        local entry=list.bindings[control]
        if not entry then
            entry={hit=control:GetChild('hit'),face=control:GetChild('face'),label=control:GetChild('uid')}
            list.bindings[control]=entry
            bind(entry.hit,function()return entry.binding end)
        elseif list.cells[entry.index]==control then
            list.cells[entry.index]=nil
        end
        entry.binding=nil
        entry.index=index
        local instance=list.cards[index]
        control:SetVisible(instance~=nil)
        if not instance then CardDisplay.clearNativeArt(entry.face);return end
        entry.binding={context=list.context,index=index,instance=instance}
        paint(entry)
        paintSelection(entry)
        entry.hit:SetVisible(true)
        list.cells[index]=control
    end
    function list:update()
        if not self.context then return end
        retire(false)
        local context=self.context
        if self.load=='start' then
            grid.scrollProgress=0
            if self.indexBase==nil then
                self.load='probe'
                grid:RefreshItems(1,function(control,index)
                    if self.context~=context or self.load~='probe' then return end
                    if index~=0 and index~=1 then self.error='invalid_choice_grid_index';return end
                    self.indexBase,self.load=index,'fill'
                    control:SetVisible(false)
                end)
            else self.load='fill' end
        end
        if self.load~='fill' or context~=self.context then return end
        self.load=nil
        grid:RefreshItems(#self.cards,function(control,index)
            if self.context==context then receive(control,index-self.indexBase+1)end
        end)
    end
    function list:ready(rows)
        if not self.context or self.initialReady then return true end
        local needed=math.min(#self.cards,columns*rows)
        local count=0
        for index=1,needed do
            local control=self.cells[index]
            if control and control.alive~=false then count=count+1 end
        end
        self.initialReady=count==needed
        return self.initialReady,self.error,count
    end
    function list:repaint(full)
        for control,entry in pairs(self.bindings)do
            if control.alive~=false and entry.binding and entry.binding.context==self.context then
                if full then paint(entry)end
                paintSelection(entry)
            end
        end
    end
    function list.progress(_)return grid.scrollProgress or 0 end
    function list:scroll(delta)
        local step,extent=geometry(grid,#self.cards,columns)
        if extent==0 then return false end
        local progress=self:progress()
        local nextProgress=math.min(1,math.max(0,progress+delta*step/extent))
        if nextProgress==progress then return false end
        grid.scrollProgress=nextProgress
        return true
    end
    return list
end
return M
