-- Session navigation keeps the live Run in memory; it is never a save file.
local NeowHistory=require('abyss_neow_history')
local Theme=require('abyss_theme')
local Nodes=require('abyss_nodes')
local M={}

local function canEnterNode(self)
    return self.run and self.map and self.mode=='map' and self.run.phase=='map'
        and not self.disabled and not self.exitOpen and not self.sessionPaused
        and not self.deckUI.visible and not self.potionUI.visible
end

local function sameEntry(self,request)
    local run=self.run
    return self.nodeEntry==request and self.pageReveal.epoch==request.epoch
        and run==request.run and self.map==request.map and run.roomGeneration==request.roomGeneration
        and run.floor==request.runFloor and self.mapUI:matchesEntryContext(request.context)
end

function M.requestNodeEntry(self,platform,changed)
    local sequence=0
    local function trace(phase,request,detail)
        if platform.entryTrace then pcall(platform.entryTrace,phase,request.id,detail)end
    end
    local function enterNow(node)
        local ok,reason=Nodes.enter(self.run,self.map,node.id)
        if ok then changed()end
        return ok,reason
    end
    return function(node,context)
        if not canEnterNode(self)then return false,'not_on_map' end
        local gate=self.pageReveal
        if not gate or not gate:usesFade()then return enterNow(node)end
        if self.nodeEntry or gate:covered()then return false,'navigation_disabled' end
        sequence=sequence+1
        local request={id=sequence,run=self.run,map=self.map,context=context,nodeId=node.id,epoch=gate.epoch,
            roomGeneration=self.run.roomGeneration,runFloor=self.run.floor}
        local function commit()
            if not canEnterNode(self) or not sameEntry(self,request) then return false,'entry_context_changed' end
            trace('core_enter_start',request,request.nodeId)
            local ok,reason=Nodes.enter(request.run,request.map,request.nodeId)
            if ok then request.committedGeneration=request.run.roomGeneration end
            trace('core_enter_end',request,reason)
            return ok,reason
        end
        local function cancel(reason)
            if self.nodeEntry~=request then return end
            self.nodeEntry=nil
            if reason and canEnterNode(self) and self.mapUI:matchesEntryContext(context) then
                self.mapUI:showEntryFailure(reason)
            end
        end
        self.nodeEntry=request
        trace('input_received',request,request.nodeId)
        local called,accepted=pcall(gate.depart,gate,commit,cancel,true,request.id)
        if not called or not accepted then
            cancel()
            local departure=gate.departure
            if gate.epoch==request.epoch and departure and departure.commit==commit then
                pcall(gate.cancelDeparture,gate)
            end
            return false,called and 'navigation_disabled' or 'choice_callback_error'
        end
        return 'selection_pending',request.id
    end
end

function M.cancelNodeEntry(self)
    local request=self.nodeEntry
    if request and not request.committedGeneration then self.pageReveal:cancelDeparture()end
end

function M.hasRun(self)
    return self.run~=nil and self.run.phase~='victory' and self.run.phase~='defeat'
        and not self.settlementRequested
end
function M.minimalRunMenu(self)
    return Theme.presentationProfile=='official-assets-first' and M.hasRun(self)
        and not self.sessionPaused and not self.characterOpen
end
local function blocked(self)
    return self.disabled or self.characterOpen or self.routeOpen
        or self.settlementRequested or self.settlementBusy or self.easterEggOpen
end
local function dismiss(self,owner)
    self.exitOpen,self.menuOpen,self.exitError,self.navigationAction=false,false,nil,nil
    owner.exitGeneration=owner.exitGeneration+1
    owner.menuGeneration=owner.menuGeneration+1
end
function M.install(self,owner,neowHistory)
    self.returnToMainMenu=function(_)
        if blocked(self) or not M.hasRun(self) or self.sessionPaused or not self.menuOpen then return false end
        -- Keep battle presentation, node result, reward/choice tokens and RNG in place.
        self.sessionPaused=true
        dismiss(self,owner);self:refresh();return true
    end
    self.continueRun=function(_)
        if blocked(self) or self.exitOpen or not self.sessionPaused or not M.hasRun(self) then return false end
        self.sessionPaused=false
        dismiss(self,owner);self:refresh();return true
    end
    self.requestNavigation=function(_,action)
        if blocked(self) or (action~='abandon' and action~='new') or not M.hasRun(self) then return false end
        if self.pageReveal and self.pageReveal:covered() then return false end
        if action=='abandon' and not self.menuOpen and not (self.sessionPaused and self.mode=='menu' and not self.exitOpen) then return false end
        if action=='new' and self.mode~='menu' then return false end
        self.navigationAction,self.exitOpen,self.menuOpen=action,true,false
        owner.exitGeneration=owner.exitGeneration+1
        self:refresh();return true,'confirmation_required'
    end
    self.confirmNavigation=function(_)
        if blocked(self) or not self.exitOpen or not self.navigationAction or not M.hasRun(self) then return false end
        local action=self.navigationAction
        NeowHistory.finish(neowHistory,self.run,'abandon')
        local battle=self.battleUI
        battle.feedback:cancel() -- Completion still needs the old Run and battle.
        battle.feedbackRun,battle.feedbackBattle,battle.feedbackLast=nil,nil,nil
        battle.reuseRetiredProjection=true
        self.battleUI.run,self.nodeUI.run,self.nodeUI.map,self.mapUI.map=nil,nil,nil,nil
        self.nodeUI.result,self.nodeUI.notice=nil,''
        self.run,self.map,self.runSeed,self.presentedBattle=nil,nil,nil,nil
        self.sessionPaused=false
        if self.choiceUI then self.choiceUI:close() end
        self.deckUI:close();self.potionUI:close()
        dismiss(self,owner)
        if action=='new' then return self:start() end
        self:refresh()
        return true,'run_abandoned'
    end
end
return M
