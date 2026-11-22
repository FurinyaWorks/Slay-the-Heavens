-- One publication boundary; preparation continues behind an opaque input cover.
local M={}
function M.registerSource(platform,page)
    if platform and platform.presentationPage then platform.presentationPage(page)end
end
function M.basePage(mode)
    return ({battle='battlePanel',node='nodePanel',map='mapPanel'})[mode] or 'menuPanel'
end
local function same(a,b,except)
    if not a or not b then return false end
    for key,value in pairs(a)do if key~=except and b[key]~=value then return false end end
    for key,value in pairs(b)do if key~=except and a[key]~=value then return false end end
    return true
end
local function reject(gate,message)
    if gate.error~=message then print('ABYSS_PAGE_REVEAL failed page='..tostring(gate.intent.page)..' epoch='..gate.epoch..' reason='..message)end
    gate.error=message;gate.state='failed';gate.armed=nil;return false
end
local function pageFor(owner)
    if owner.characterOpen and not (owner.deckUI and owner.deckUI.visible) then return 'characterPanel'end
    for _,entry in ipairs({{owner.deckUI,'deckPanel'},{owner.potionUI,'potionPanel'},{owner.choiceUI,'choicePanel'}})do
        if entry[1] and entry[1].visible then return entry[2]end
    end
    if owner.routeOpen then return 'mapPanel'end
    return M.basePage(owner.mode)
end
local function overlayVersion(owner,page)
    if page=='deckPanel' then return owner.deckUI.openSession,owner.deckUI.detailPages,owner.deckUI.detailPage,owner.deckUI.contentRevision end
    if page=='choicePanel' then return owner.choiceUI.context,nil,owner.choiceUI.page end
end
function M.intent(owner)
    local run=owner.run or {};local page=pageFor(owner)
    local selection=owner.characterSelection or {};local character=selection.info or {}
    local node=owner.nodeUI or {};local flow=run.nodeFlow or {};local event=flow.event or {}
    local battle=owner.battleUI or {}
    local revision,details,detailPage,content=overlayVersion(owner,page)
    return {page=page,mode=owner.mode,run=owner.run,phase=run.phase,
        battle=run.combat,node=run.nodeFlow,nodeId=flow.id,nodeFloor=flow.floor,mapSeed=flow.mapSeed,
        mapSignature=flow.mapSignature,roomGeneration=run.roomGeneration,eventId=event.id,characterOpen=owner.characterOpen==true,
        character=character.id,characterDeck=selection.deckOpen==true,act=run.act,floor=run.floor,
        nodeMode=node.mode,picker=node.picker,eventStage=event.stage,event=flow.event,neow=flow.roomKind=='neow',opened=node.opened,
        nodePage=node.page,pickPage=node.pickPage,relicPage=node.relicPage,complete=flow.complete,
        rewards=run.phase=='reward' and battle.rewardScreen or nil,
        overlayRevision=revision,details=details,detailPage=detailPage,overlayContent=content}
end
local function sameOwner(a,b,except)
    if not a or not b then return false end
    for _,key in ipairs({'page','mode','run','phase','battle','node','nodeId','nodeFloor','mapSeed','mapSignature','roomGeneration','eventId','characterOpen','character','characterDeck','act','floor','overlayRevision'})do
        if key~=except and a[key]~=b[key]then return false end
    end
    return true
end
local function sameNeowText(a,b)
    local stages={neow_intro=true,neow_blessing=true,neow_result=true}
    return a.neow and b.neow and a.eventId=='neow' and b.eventId=='neow'
        and a.nodeFloor==0 and b.nodeFloor==0 and stages[a.eventStage] and stages[b.eventStage]
        and a.picker==b.picker and a.nodeMode==b.nodeMode
end
local function canUpdate(a,b)
    if a.page=='nodePanel'then return sameOwner(a,b,'node') and sameNeowText(a,b)end
    if not sameOwner(a,b)then return false end
    if a.page=='deckPanel'then return a.overlayContent~=b.overlayContent and same(a,b,'overlayContent')end
    return false
end
local function readiness(ready,intent)
    local ok,value,reason=pcall(ready,intent)
    return ok and value==true and not reason,not ok and tostring(value) or reason
end
local function sameRoom(a,b)
    return a.node==b.node or a.nodeId~=nil and a.nodeFloor~=nil and a.roomGeneration~=nil and a.mapSignature~=nil
end
local function sameBase(a,b)
    if not a or not b then return false end
    for _,key in ipairs({'mode','run','battle','nodeId','nodeFloor','mapSeed','mapSignature','roomGeneration','eventId','characterOpen','character','act','floor'})do
        if a[key]~=b[key]then return false end
    end
    if not sameRoom(a,b)then return false end
    if a.phase==b.phase then return true end
    local battlePhases={combat=true,reward=true}
    return a.mode=='battle' and a.battle~=nil and battlePhases[a.phase] and battlePhases[b.phase] or false
end
local function needsSchedulerConfirmation(intent)
    return intent.page=='choicePanel' and intent.phase=='combat'
end
function M.new(cover,ready,onIntent,frames)
    assert(cover and type(ready)=='function','page reveal requires cover and readiness source')
    local gate={epoch=0,state='preparing',tick=0}
    local function supported(intent)
        if not intent then return false end
        local base=intent.characterOpen and 'characterPanel' or M.basePage(intent.mode)
        return intent.page==base or frames[intent.page]~=nil
    end
    local function localFrame(intent,previous)
        if not frames or not sameBase(intent,gate.published)then return end
        if not supported(intent) or not supported(previous)then return end
        return frames[intent.page] or previous and frames[previous.page]
    end
    local paintedFrame;local paintToken=0
    local function currentPaint(ticket,epoch,frame,veil)
        local alive=veil.alive~=false
        local sameVeil=cover:GetChild('veil')==veil
        return alive and sameVeil and paintToken==ticket and gate.epoch==epoch and frame==(gate.localFrame or frames.full)
    end
    local function paintFrame()
        if not frames then return true end
        local frame=gate.localFrame or frames.full
        if frame==paintedFrame then return true end
        paintToken=paintToken+1;local ticket,epoch=paintToken,gate.epoch
        paintedFrame=nil -- a partial native write invalidates every old promise
        local veil=cover:GetChild('veil')
        if not currentPaint(ticket,epoch,frame,veil)then return false end
        local positioned=veil:SetAnchoredPosition(frame[1],frame[2])
        if not currentPaint(ticket,epoch,frame,veil)then return false end
        assert(positioned~=false,'page cover position rejected')
        local sized=veil:SetSizeDelta(frame[3],frame[4])
        if not currentPaint(ticket,epoch,frame,veil)then return false end
        assert(sized~=false,'page cover size rejected')
        paintedFrame=frame;return true
    end
    function gate:covered()return self.state~='visible' end
    function gate:request(intent)
        if same(intent,self.intent)then return false end
        self.localFrame=localFrame(intent,self.intent)
        self.painting=nil
        self.epoch=self.epoch+1;self.intent=intent;self.state='preparing';self.armed=nil;self.error=nil
        local ticket=self.epoch
        local recovery=cover:GetChild('cancel')
        if self.epoch~=ticket then return false end
        if recovery then recovery:SetVisible(false)end
        if self.epoch~=ticket then return false end
        if onIntent then onIntent(ticket)end
        if self.epoch~=ticket then return false end
        print('ABYSS_PAGE_REVEAL preparing page='..tostring(intent.page)..' epoch='..self.epoch)
        if not paintFrame() or self.epoch~=ticket then return false end
        cover:SetVisible(true)
        if self.epoch~=ticket then return false end
        cover:SetAsLastSibling();return self.epoch==ticket
    end
    function gate:begin(intent)
        local localChange=localFrame(intent,self.intent)~=nil
        local fast=not needsSchedulerConfirmation(intent) and
            (self.state=='visible' and (canUpdate(intent,self.intent) or localChange)
            or localChange and same(intent,self.published))
        if not fast then
            local unchanged=same(intent,self.intent)
            if not self:request(intent) and not unchanged then return false end
            if not same(intent,self.intent)then return false end
        end
        self.painting={epoch=self.epoch,intent=intent,fast=fast,changed=not same(intent,self.intent)}
        return true
    end
    function gate:finish(intent)
        local ticket=self.painting
        if not ticket then return false end
        if not same(ticket.intent,intent)then self:request(intent);return false end
        if ticket.epoch~=self.epoch then return false end
        if not ticket.fast or not ticket.changed then self.painting=nil;return false end
        -- Only the explicit post-paint caller can use readiness for new leases.
        local value,reason=readiness(ready,intent)
        if self.painting~=ticket or ticket.epoch~=self.epoch then return false end
        self.painting=nil
        if reason or value~=true then
            if self:request(intent) and reason then return reject(self,tostring(reason))end
            return false
        end
        self.epoch=self.epoch+1;self.intent=intent;self.published=intent;self.armed=nil;self.error=nil
        self.state='visible';cover:SetVisible(false)
        if onIntent then onIntent(self.epoch)end
        print('ABYSS_PAGE_REVEAL updated page='..tostring(intent.page)..' epoch='..self.epoch)
        return true
    end
    function gate:paint(raise)
        local ticket=self.epoch
        if not paintFrame()then return false end
        cover:SetVisible(self:covered())
        if self:covered() and raise then cover:SetAsLastSibling()end
        local message=cover:GetChild('message')
        if message then message.text=self.error and '画面暂未准备完成，可返回菜单。' or '正在准备画面…'end
        local recovery=cover:GetChild('cancel')
        if self.epoch~=ticket then return false end
        if recovery then recovery:SetVisible(self.state=='failed')end
    end
    function gate:step(intent)
        self.tick=self.tick+1
        local unchanged=same(intent,self.intent)
        if not self:request(intent) and not unchanged then return false end
        if not same(intent,self.intent)then return false end
        if self.state=='visible'then return false end
        local ticket=self.epoch
        local value,reason=readiness(ready,intent)
        if ticket~=self.epoch then return false end
        if reason then return reject(self,tostring(reason))end
        self.error=nil
        if value~=true then self.state='preparing';self.armed=nil;return false end
        -- New base pages confirm on another scheduler turn. A retained base's
        -- local work publishes as soon as this turn's real owners report ready.
        if self.localFrame and not needsSchedulerConfirmation(intent) or self.armed and self.armed.epoch==ticket and self.armed.tick<self.tick then
            self.state='visible';self.published=intent;self.armed=nil;self.error=nil;cover:SetVisible(false)
            print('ABYSS_PAGE_REVEAL visible page='..tostring(intent.page)..' epoch='..ticket);return true
        end
        self.state='ready';self.armed={epoch=ticket,tick=self.tick};return false
    end
    return gate
end
return M
