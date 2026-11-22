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
    local deck=owner.deckUI
    local localRelic=deck and deck.relicView and deck.relicView.localPanel
    for _,entry in ipairs({{not localRelic and deck,'deckPanel'},{owner.potionUI and not owner.potionUI.localPanel and owner.potionUI,'potionPanel'},{owner.choiceUI,'choicePanel'}})do
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
        battle=run.combat,node=run.nodeFlow,nodeId=flow.id,nodeFloor=flow.floor,nodeType=flow.type,mapSeed=flow.mapSeed,
        mapSignature=flow.mapSignature,roomGeneration=run.roomGeneration,eventId=event.id,characterOpen=owner.characterOpen==true,
        character=character.id,characterDeck=selection.deckOpen==true,act=run.act,floor=run.floor,
        nodeMode=node.mode,picker=node.picker,eventStage=event.stage,event=flow.event,neow=flow.roomKind=='neow',opened=node.opened,
        nodePage=node.page,pickPage=node.pickPage,relicPage=node.relicPage,complete=flow.complete,
        rewards=run.phase=='reward' and battle.rewardScreen or nil,
        overlayRevision=revision,details=details,detailPage=detailPage,overlayContent=content,
        deckBrowser=page=='deckPanel' and owner.deckUI.browserShell==true and not details}
end
local function sameOwner(a,b,except)
    if not a or not b then return false end
    for _,key in ipairs({'page','mode','run','phase','battle','node','nodeId','nodeFloor','nodeType','mapSeed','mapSignature','roomGeneration','eventId','characterOpen','character','characterDeck','act','floor','overlayRevision'})do
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
    if a.page=='menuPanel' and b.page=='menuPanel' and a.mode=='menu' and b.mode=='menu' then return true end
    if a.page=='characterPanel' and b.page=='characterPanel' then return sameOwner(a,b,'character')end
    if a.page=='nodePanel'then return sameOwner(a,b,'node') and sameNeowText(a,b)end
    if not sameOwner(a,b)then return false end
    if a.page=='deckPanel'then return a.overlayContent~=b.overlayContent and same(a,b,'overlayContent')end
    return false
end
local function shade(progress)
    return progress*progress*(3-2*progress)
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
local roomTypes={shop=true,event=true,camp=true}
local function entersMapRoom(previous,intent)
    return previous and previous.page=='mapPanel' and previous.mode=='map' and previous.phase=='map'
        and intent.page=='nodePanel' and intent.mode=='node' and intent.phase=='node'
        and previous.run==intent.run and previous.act==intent.act and intent.nodeId~=nil
        and not intent.complete and roomTypes[intent.nodeType]==true
end
local function logVisible(intent,epoch)
    print('ABYSS_PAGE_REVEAL visible page='..tostring(intent.page)..' epoch='..epoch)
end
function M.new(cover,ready,onIntent,frames,motion)
    assert(cover and type(ready)=='function','page reveal requires cover and readiness source')
    local gate={epoch=0,state='preparing',tick=0,alpha=1}
    local function alpha(value)
        local epoch=gate.epoch
        if motion then
            local veil=cover:GetChild('veil')
            if gate.epoch~=epoch then return false end
            local ink=motion.color(0,0,0,math.floor(shade(value)*255+.5))
            if gate.epoch~=epoch then return false end
            gate.alpha=value;veil.imageColor=ink
        else gate.alpha=value end
        return gate.epoch==epoch
    end
    function gate.usesFade(_)return motion~=nil end
    function gate:depart(commit,onCancel)
        if not motion or self:covered()then return false end
        local ticket=self.epoch
        self.departure=commit;self.cancelDeparture=onCancel;self.state='fadingOut'
        self.localFrame,self.localOnly=nil,nil
        if not alpha(0)then return false end
        if self:paint(true)==false or self.epoch~=ticket then return false end
        return true
    end
    local function supported(intent)
        if not intent then return false end
        local base=intent.characterOpen and 'characterPanel' or M.basePage(intent.mode)
        return intent.page==base or frames[intent.page]~=nil
    end
    local function localFrame(intent,previous)
        if not frames or not sameBase(intent,gate.published)then return end
        if not supported(intent) or not supported(previous)then return end
        -- Browser chrome sits outside this viewport. Publish it immediately
        -- while the existing cover still guards unfinished card cells.
        return intent.deckBrowser and frames.deckBrowser or frames[intent.page] or previous and frames[previous.page]
    end
    local paintedFrame;local paintToken=0
    local function currentPaint(ticket,epoch,frame,veil)
        local alive=veil.alive~=false
        local sameVeil=cover:GetChild('veil')==veil
        return alive and sameVeil and paintToken==ticket and gate.epoch==epoch and frame==(gate.localFrame or frames.size or frames.full)
    end
    local function paintFrame()
        if not frames then return true end
        local frame=gate.localFrame or frames.size or frames.full
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
    function gate.resize(_,width,height)
        if not frames then return end
        local scale=math.min(width/frames.full[3],height/frames.full[4])
        -- Extend the veil and input hit over the letterboxing of the scaled stage.
        frames.size={0,0,width/scale,height/scale}
        cover:GetChild('blocker'):SetSizeDelta(frames.size[3],frames.size[4])
        paintFrame()
    end
    function gate:covered()return self.state~='visible' end
    local function requestTransition(intent)
        gate.roomEntry=gate.state=='visible' and entersMapRoom(gate.published,intent)
            or gate.roomEntry and sameOwner(gate.intent,intent)
        gate.localFrame=localFrame(intent,gate.intent)
        gate.painting=nil
        gate.localOnly=motion and gate.published and gate.published.page=='characterPanel' and intent.page=='characterPanel'
        local exiting=motion and gate.published and not gate.localFrame and not gate.localOnly
            and (gate.published.page~=intent.page or not sameBase(intent,gate.published)) and gate.state=='visible'
        gate.epoch=gate.epoch+1;gate.intent=intent;gate.state=exiting and 'fadingOut' or 'preparing';gate.armed=nil;gate.error=nil
        return exiting
    end
    local function beginCover(ticket)
        local recovery=cover:GetChild('cancel')
        if gate.epoch~=ticket then return false end
        if recovery then recovery:SetVisible(false)end
        if gate.epoch~=ticket then return false end
        if onIntent then onIntent(ticket)end
        return gate.epoch==ticket
    end
    function gate:request(intent)
        if same(intent,self.intent)then return false end
        local cancel=self.cancelDeparture;self.departure=nil;self.cancelDeparture=nil
        if cancel then cancel()end
        local exiting=requestTransition(intent)
        local ticket=self.epoch
        if motion and not alpha((exiting or self.localOnly) and 0 or 1)then return false end
        if not beginCover(ticket)then return false end
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
        if self.departure then return false end
        if not fast then
            local unchanged=same(intent,self.intent)
            if not self:request(intent) and not unchanged then return false end
            if not same(intent,self.intent)then return false end
        end
        if self.state=='fadingOut' then return false end
        self.painting={epoch=self.epoch,intent=intent,fast=fast,changed=not same(intent,self.intent),roomEntry=self.roomEntry}
        return true
    end
    function gate:finish(intent,roomPainted)
        local ticket=self.painting
        if not ticket then return false end
        if ticket.epoch~=self.epoch then return false end
        -- Entry may reset the previous room's picker/page during paint.
        -- Verify the room identity before checking its new leases.
        if roomPainted and ticket.roomEntry and sameOwner(ticket.intent,intent) and not intent.complete then
            local value,reason=readiness(ready,intent)
            if self.painting~=ticket or ticket.epoch~=self.epoch then return false end
            self.painting=nil
            if not value or reason then
                if not same(intent,self.intent) and not self:request(intent) then return false end
                if reason then return reject(self,tostring(reason))end
                return false
            end
            self.intent=intent;self.published=intent;self.roomEntry=nil;self.armed=nil;self.error=nil
            self.state=motion and 'fadingIn' or 'visible'
            cover:SetVisible(self:covered())
            if ticket.epoch~=self.epoch then return false end
            if self.state=='visible'then logVisible(intent,ticket.epoch)end
            return true
        end
        if not same(ticket.intent,intent)then self:request(intent);return false end
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
        local covered,failed=self:covered(),self.state=='failed'
        if cover.visible~=covered then cover:SetVisible(covered)end
        if covered and raise then cover:SetAsLastSibling()end
        local message=cover:GetChild('message')
        if message then
            local text=failed and '画面暂未准备完成，可返回。' or '正在准备画面…'
            if message.visible~=failed then message:SetVisible(failed)end
            if message.text~=text then message.text=text end
        end
        local recovery=cover:GetChild('cancel')
        if self.epoch~=ticket then return false end
        if recovery and recovery.visible~=failed then recovery:SetVisible(failed)end
    end
    local function finishDeparture(dt)
        if not alpha(math.min(1,gate.alpha+(dt or 0)/motion.duration))then return false end
        if gate.alpha<1 then return false end
        gate.state='preparing'
        local commit=gate.departure;gate.departure=nil;gate.cancelDeparture=nil
        if commit then
            local ok,accepted=pcall(commit)
            if not ok or accepted==false then return reject(gate,tostring(accepted))end
        end
        return true -- Destination refresh is permitted only behind opaque black.
    end
    local function revealPage(intent,dt)
        local ticket=gate.epoch
        local value,reason=readiness(ready,intent)
        if ticket~=gate.epoch or not same(intent,gate.intent)then return false end
        if reason or not value then
            if not alpha(1)then return false end
            gate.state='preparing';gate.armed=nil
            if reason then return reject(gate,tostring(reason))end
            return false
        end
        if not alpha(math.max(0,gate.alpha-(dt or 0)/motion.duration))then return false end
        if gate.alpha>0 then return false end
        gate.state='visible';cover:SetVisible(false)
        if ticket~=gate.epoch then return false end
        logVisible(intent,ticket);return true
    end
    local function publishReadyPage(intent,ticket)
        -- New base pages confirm on another scheduler turn. A retained base's
        -- local work publishes as soon as this turn's real owners report ready.
        local localReady=(gate.localFrame or gate.localOnly) and not needsSchedulerConfirmation(intent)
        local confirmed=gate.armed and gate.armed.epoch==ticket and gate.armed.tick<gate.tick
        if not localReady and not confirmed then
            gate.state='ready';gate.armed={epoch=ticket,tick=gate.tick};return false
        end
        gate.state=motion and not gate.localFrame and not gate.localOnly and 'fadingIn' or 'visible'
        gate.published=intent;gate.roomEntry=nil;gate.armed=nil;gate.error=nil;cover:SetVisible(gate:covered())
        if ticket~=gate.epoch then return false end
        if gate.state=='visible' then logVisible(intent,ticket)end
        return true
    end
    function gate:step(intent,dt)
        if motion and self.state=='fadingOut' then return finishDeparture(dt)end
        if motion and self.state=='fadingIn' then return revealPage(intent,dt)end
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
        return publishReadyPage(intent,ticket)
    end
    return gate
end
return M
