-- One publication boundary for resource readiness and input. Only a scheduled
-- scene departure animates this cover. UI backdrop shades belong to their panels.
local M={}
function M.registerSource(platform,page)
    if platform and platform.presentationPage then platform.presentationPage(page)end
end
function M.basePage(mode)
    return ({battle='battlePanel',node='nodePanel',map='mapPanel'})[mode] or 'menuPanel'
end
function M.roomDuration(fast)
    return fast and .001 or .8 -- AbstractDungeon.fadeOut/fadeIn
end
local function same(a,b,except)
    if not a or not b then return false end
    for key,value in pairs(a)do if key~=except and b[key]~=value then return false end end
    for key,value in pairs(b)do if key~=except and a[key]~=value then return false end end
    return true
end
local function acceptPaintedIntent(ticket, intent, roomPainted)
    local before=ticket.intent
    if same(before,intent) then return true end
    if not roomPainted or not ticket.fast or before.page~='nodePanel'
        or before.nodeType~='event' or not before.event then return false end
    local painted={}
    for key,value in pairs(before)do painted[key]=value end
    -- Event rendering may select or clamp its picker while drawing the new
    -- stage. Every field that identifies the owner and stage must still match.
    painted.nodeMode,painted.picker,painted.pickPage=intent.nodeMode,intent.picker,intent.pickPage
    if not same(painted,intent) then return false end
    ticket.changed=true
    return true
end
local function reject(gate,message)
    if gate.error~=message then print('ABYSS_PAGE_REVEAL failed page='..tostring(gate.intent.page)..' epoch='..gate.epoch..' reason='..message)end
    if gate.entry then gate.entry.narration=nil end
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
    if page=='deckPanel' then return owner.deckUI.openSession,owner.deckUI.cardDetail or owner.deckUI.detailPages,owner.deckUI.detailPage,owner.deckUI.contentRevision end
    if page=='choicePanel' then return owner.choiceUI.context end
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
        deckBrowser=page=='deckPanel' and owner.deckUI.browserShell==true and not details,
        deckPaged=page=='deckPanel' and owner.deckUI.paged==true and not details}
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
    return progress^3*(progress*(progress*6-15)+10)
end
local function readiness(ready,intent)
    local ok,value,reason,progress=pcall(ready,intent)
    return ok and value==true and not reason,not ok and tostring(value) or reason,progress
end
local function sameRoom(a,b)
    return a.node==b.node or a.nodeId~=nil and a.nodeFloor~=nil and a.roomGeneration~=nil and a.mapSignature~=nil
end
local function retainedRoomResult(intent)
    return intent.complete and (intent.phase=='map' or intent.phase=='act_transition')
end
local function sameBase(a,b)
    if not a or not b then return false end
    for _,key in ipairs({'mode','run','battle','nodeId','nodeFloor','mapSeed','mapSignature','roomGeneration','eventId','characterOpen','character','act','floor'})do
        if a[key]~=b[key]then return false end
    end
    if not sameRoom(a,b)then return false end
    if a.phase==b.phase then return true end
    if a.mode=='node' then
        return a.phase=='node' and retainedRoomResult(b) or b.phase=='node' and retainedRoomResult(a)
    end
    local battlePhases={combat=true,reward=true}
    return a.mode=='battle' and a.battle~=nil and battlePhases[a.phase] and battlePhases[b.phase] or false
end
local function needsSchedulerConfirmation(intent)
    return intent.page=='choicePanel' and intent.phase=='combat'
end
local function entersCharacters(previous,intent)
    return previous and previous.page=='menuPanel' and intent.page=='characterPanel'
        and previous.mode==intent.mode and previous.run==intent.run
end
local function isMapOverlayChange(previous,intent)
    return previous and previous.run~=nil and previous.run==intent.run
        and (previous.page=='mapPanel' or intent.page=='mapPanel')
        and (sameBase(intent,previous) or intent.mode=='map' and intent.phase=='map')
end
local returnRoomKeys={'run','roomGeneration','act','floor','nodeId','mapSignature'}
local function returnsFromRoom(previous,intent)
    if not previous or intent.page~='mapPanel' or intent.mode~='map' or intent.phase~='map'
        or not intent.complete or not intent.nodeId or not intent.roomGeneration then return false end
    for _,key in ipairs(returnRoomKeys)do
        if previous[key]~=intent[key] then return false end
    end
    return previous.page=='nodePanel' and not previous.neow
        or previous.page=='battlePanel' and previous.phase=='reward' and not previous.complete
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
local function delta(dt)
    return type(dt)=='number' and dt>=0 and dt<math.huge and dt or 0
end
local subtitleFade,subtitleHold=.4,3.6
local subtitleEnd=subtitleFade*2+subtitleHold
local function advanceNarration(entry,dt)
    local narration=entry and entry.narration
    if not narration then return false end
    narration.elapsed=(narration.elapsed or 0)+delta(dt)
    if narration.elapsed<subtitleEnd then return true end
    entry.narration=nil
    return false
end
local slowWait,stallTimeout,totalTimeout=.4,4,12
local function resetWait(gate)
    gate.wait,gate.stall,gate.progress,gate.timedOut=0,0,nil,nil
end
local function waitForPreparation(gate,dt,progress)
    local elapsed=delta(dt)
    gate.wait=gate.wait+elapsed
    if progress~=nil and progress~=gate.progress then
        gate.progress=progress;gate.stall=0
    else
        gate.stall=gate.stall+elapsed
    end
    -- These are scheduler seconds. A blocking native call cannot be interrupted here.
    if gate.stall>=stallTimeout or gate.wait>=totalTimeout then
        gate.timedOut=true
        return reject(gate,gate.stall>=stallTimeout and 'preparation_stalled' or 'preparation_timeout')
    end
    return false
end
local function needsRecovery(gate)
    return gate.timedOut or gate.projectionError or gate.entry and gate.state=='failed'
end
function M.new(cover,ready,onIntent,frames,motion,onMapReturn)
    assert(cover and type(ready)=='function','page reveal requires cover and readiness source')
    local gate={epoch=0,state='preparing',tick=0,alpha=1,wait=0,stall=0}
    local function trace(entry,phase,detail)
        if entry and motion and motion.entryTrace then pcall(motion.entryTrace,phase,entry.id,detail)end
    end
    local function alpha(value)
        local epoch=gate.epoch
        if motion then
            local veil=cover:GetChild('veil')
            if gate.epoch~=epoch then return false end
            local base=gate.sceneDuration and 0 or 12
            local ink=motion.color(base,base,base,math.floor(shade(value)*255+.5))
            if gate.epoch~=epoch then return false end
            gate.alpha=value;veil.imageColor=ink
        else gate.alpha=value end
        return gate.epoch==epoch
    end
    function gate.usesFade(_)return motion~=nil end
    function gate:depart(commit,onCancel,entry,roomDuration,source)
        if not motion or self:covered()then return false end
        local ticket=self.epoch
        self.departure={commit=commit,cancel=onCancel,source=source or self.intent}
        self.entry=entry
        self.sceneDuration=roomDuration or motion.duration
        self.sceneDestination=nil
        self.state='fadingOut'
        self.localFrame,self.localOnly=nil,nil
        resetWait(self)
        if not alpha(0)then return false end
        if self:paint(true)==false or self.epoch~=ticket then return false end
        return true
    end
    function gate:abandon()
        self.epoch=self.epoch+1
        self.state='abandoned';self.departure=nil;self.entry=nil;self.painting=nil
        self.sceneDuration,self.sceneDestination=nil,nil
        self.intent=nil;self.published=nil;self.armed=nil;self.retryProjection=nil
        self.mapReturnPainted=nil
    end
    function gate:retryPreparation()
        if self.projectionError then self.retryProjection=true
        elseif needsRecovery(self)then
            self.state='preparing';self.error=nil;resetWait(self)
        end
    end
    function gate:takeProjectionRetry()
        if not self.retryProjection then return false end
        self.retryProjection=nil;self.projectionError=nil;self.error=nil
        self.state='preparing';resetWait(self)
        return true
    end
    local function supported(intent)
        if not intent then return false end
        local base=intent.characterOpen and 'characterPanel' or M.basePage(intent.mode)
        return intent.page==base or frames[intent.page]~=nil
    end
    local function localFrame(intent,previous)
        if not frames or not sameBase(intent,gate.published)then return end
        -- A pending map needs its entire route and legend guarded.
        if intent.page=='mapPanel' then return end
        if not supported(intent) or not supported(previous)then return end
        -- Browser chrome sits outside this viewport. Publish it immediately
        -- while the existing cover still guards unfinished card cells.
        return intent.deckPaged and frames.deckPaged or intent.deckBrowser and frames.deckBrowser or frames[intent.page] or previous and frames[previous.page]
    end
    local paintedFrame,paintedBlocker;local paintToken=0
    local function currentPaint(ticket,epoch,frame,veil)
        local alive=veil.alive~=false
        local sameVeil=cover:GetChild('veil')==veil
        return alive and sameVeil and paintToken==ticket and gate.epoch==epoch and frame==(gate.localFrame or frames.size or frames.full)
    end
    local function paintFrame()
        if not frames then return true end
        local frame=gate.localFrame or frames.size or frames.full
        local limited=gate.intent and gate.intent.deckPaged and gate.localFrame and gate.state~='failed'
        local blockerFrame=limited and frame or frames.size or frames.full
        if blockerFrame~=paintedBlocker then
            local ticket=gate.epoch
            cover.disableCursorEventPassthrough=not limited
            local blocker=cover:GetChild('blocker')
            if blocker:SetAnchoredPosition(blockerFrame[1],blockerFrame[2])==false or gate.epoch~=ticket then return false end
            if blocker:SetSizeDelta(blockerFrame[3],blockerFrame[4])==false or gate.epoch~=ticket then return false end
            paintedBlocker=blockerFrame
        end
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
        paintFrame()
    end
    function gate:covered()return self.state~='visible' end
    local function requestTransition(intent)
        local entry=gate.entry
        if entry and (gate.departure or entry.destination and not sameOwner(entry.destination,intent))then gate.entry=nil end
        if gate.departure or gate.sceneDestination and not sameBase(gate.sceneDestination,intent) then
            gate.sceneDuration=nil
            gate.sceneDestination=nil
        elseif gate.sceneDuration then
            gate.sceneDestination=intent
        end
        gate.roomEntry=entersMapRoom(gate.published,intent) or gate.roomEntry and sameOwner(gate.intent,intent)
        gate.localFrame=not gate.sceneDuration and localFrame(intent,gate.intent) or nil
        gate.painting=nil
        gate.localOnly=motion and gate.published and intent.page=='characterPanel'
            and (gate.published.page=='characterPanel' or entersCharacters(gate.published,intent))
        gate.epoch=gate.epoch+1;gate.intent=intent;gate.state='preparing';gate.armed=nil;gate.error=nil
        gate.projectionError=nil;gate.retryProjection=nil
        resetWait(gate)
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
        if self.state=='abandoned' or same(intent,self.intent)then return false end
        local departure=self.departure
        requestTransition(intent)
        self.departure=nil
        local ticket=self.epoch
        if departure and departure.cancel then departure.cancel()end
        if self.epoch~=ticket then return false end
        if motion and not alpha(self.localOnly and 0 or 1)then return false end
        if not beginCover(ticket)then return false end
        local entry=self.entry
        if entry and not entry.destination then
            entry.destination=intent
            trace(entry,'native_preparation_start',intent.page)
        end
        if self.epoch~=ticket then return false end
        print('ABYSS_PAGE_REVEAL preparing page='..tostring(intent.page)..' epoch='..self.epoch)
        if not paintFrame() or self.epoch~=ticket then return false end
        cover:SetVisible(true)
        if self.epoch~=ticket then return false end
        cover:SetAsLastSibling();return self.epoch==ticket
    end
    function gate:begin(intent)
        -- Opening the route from a completed room can paint and publish in
        -- one refresh, including when the run already switched to map mode.
        local localChange=localFrame(intent,self.intent)~=nil or isMapOverlayChange(self.published,intent)
        local fast=not self.sceneDuration and not needsSchedulerConfirmation(intent) and
            (self.state=='visible' and (canUpdate(intent,self.intent) or localChange or entersCharacters(self.published,intent))
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
    local function readyEntry(intent)
        local entry=gate.entry
        if not entry or entry.ready then return end
        entry.ready=true
        trace(entry,'native_preparation_end',intent.page)
        if gate.entry==entry then trace(entry,'page_ready',intent.page)end
    end
    local function enableEntry(intent,mapReturn)
        local entry=gate.entry;gate.entry=nil
        trace(entry,'input_enabled',intent.page)
        return true,not (entry or mapReturn)
    end
    local function finishMapRoom(self,intent,ticket)
        local value,reason=readiness(ready,intent)
        if self.painting~=ticket or ticket.epoch~=self.epoch then return false end
        self.painting=nil
        if not value or reason then
            if not same(intent,self.intent) and not self:request(intent) then return false end
            if reason then return reject(self,tostring(reason))end
            return false
        end
        self.intent=intent;self.published=intent;self.roomEntry=nil
        self.state=self.sceneDuration and 'fadingIn' or 'visible';self.armed=nil;self.error=nil
        readyEntry(intent)
        if ticket.epoch~=self.epoch then return false end
        cover:SetVisible(self:covered())
        if ticket.epoch~=self.epoch then return false end
        if self.state=='visible'then logVisible(intent,ticket.epoch)end
        return true
    end
    local function finishLocalPage(self,intent,ticket,mapReturn)
        -- Only the explicit post-paint caller can use readiness for new leases.
        local value,reason=readiness(ready,intent)
        if self.painting~=ticket or ticket.epoch~=self.epoch then return false end
        self.painting=nil
        if reason or value~=true then
            if not same(intent,self.intent) and not self:request(intent) then return false end
            if mapReturn then self.mapReturnPainted=self.epoch end
            if reason then return reject(self,tostring(reason))end
            return false
        end
        self.epoch=self.epoch+1;self.intent=intent;self.published=intent;self.armed=nil;self.error=nil
        local epoch=self.epoch
        if mapReturn then onMapReturn()end
        if self.epoch~=epoch then return false end
        self.state='visible';cover:SetVisible(false)
        if self.epoch~=epoch then return false end
        if onIntent then onIntent(epoch)end
        if self.epoch~=epoch then return false end
        print('ABYSS_PAGE_REVEAL updated page='..tostring(intent.page)..' epoch='..epoch)
        return true
    end
    local function mapReturnFor(intent)
        return onMapReturn and not gate.sceneDuration and returnsFromRoom(gate.published,intent)
    end
    function gate:finish(intent,roomPainted)
        local ticket=self.painting
        if not ticket then return false end
        if ticket.epoch~=self.epoch then return false end
        if needsRecovery(self)then self.painting=nil;return false end
        if self.entry and self.entry.narration then self.painting=nil;return false end
        -- Entry may reset the previous room's picker/page during paint.
        -- Verify the room identity before checking its new leases.
        if ticket.roomEntry then
            if roomPainted and sameOwner(ticket.intent,intent) and not intent.complete then
                return finishMapRoom(self,intent,ticket)
            end
            self.painting=nil
            if not same(intent,self.intent) then self:request(intent) end
            return false
        end
        if not acceptPaintedIntent(ticket,intent,roomPainted) then self:request(intent);return false end
        local mapReturn=mapReturnFor(intent)
        if not ticket.fast or not ticket.changed then
            self.mapReturnPainted=mapReturn and self.epoch
            self.painting=nil;return false
        end
        return finishLocalPage(self,intent,ticket,mapReturn)
    end
    local subtitle,subtitleAlpha
    local function paintSubtitle(narration,ticket)
        if not narration or not narration.elapsed then
            if subtitle and subtitle.visible then subtitle:SetVisible(false) end
            subtitleAlpha=nil
            return gate.epoch==ticket
        end
        if not subtitle then subtitle=cover:GetChild('subtitle') end
        if gate.epoch~=ticket then return false end
        if not subtitle then gate.entry.narration=nil;return true end
        local elapsed=narration.elapsed
        local progress=math.min(1,elapsed/subtitleFade,(subtitleEnd-elapsed)/subtitleFade)
        local opacity=math.floor(shade(progress)*255+.5)
        if subtitle.text~=narration.text then subtitle.text=narration.text end
        if gate.epoch~=ticket then return false end
        if subtitleAlpha~=opacity then
            local ink=motion.color(246,242,233,opacity)
            if gate.epoch~=ticket then return false end
            subtitle.fontColor=ink
            if gate.epoch~=ticket then return false end
            subtitleAlpha=opacity
        end
        if not subtitle.visible then subtitle:SetVisible(true) end
        return gate.epoch==ticket
    end
    local function paintRecovery(self,failed,ticket,narration)
        local message=cover:GetChild('message')
        if self.epoch~=ticket then return false end
        if message then
            local show=failed or not narration and self.state=='preparing' and self.wait>=slowWait
            local text=failed and '画面暂未准备完成，可返回。' or '正在准备画面…'
            if message.visible~=show then message:SetVisible(show)end
            if self.epoch~=ticket then return false end
            if message.text~=text then message.text=text end
        end
        local recovery=cover:GetChild('cancel')
        if self.epoch~=ticket then return false end
        if recovery and recovery.visible~=failed then recovery:SetVisible(failed)end
        return self.epoch==ticket
    end
    function gate:paint(raise)
        local ticket=self.epoch
        if not paintFrame()then return false end
        local covered,failed=self:covered(),self.state=='failed'
        if cover.visible~=covered then cover:SetVisible(covered)end
        if self.epoch~=ticket then return false end
        if covered and raise then cover:SetAsLastSibling()end
        if self.epoch~=ticket then return false end
        local narration=self.entry and self.entry.narration
        return paintSubtitle(narration,ticket) and paintRecovery(self,failed,ticket,narration)
    end
    local function restoreDeparture(departure,reason)
        gate.epoch=gate.epoch+1
        local ticket=gate.epoch
        gate.state='visible';gate.entry=nil;gate.error=nil;gate.roomEntry=nil
        gate.sceneDuration,gate.sceneDestination=nil,nil
        gate.intent=gate.published;gate.departure=nil;gate.painting=nil
        resetWait(gate)
        if departure.cancel then departure.cancel(reason)end
        return gate.epoch==ticket and gate.state=='visible' and alpha(0) and gate:paint()
    end
    function gate:cancelDeparture()
        if not self.departure then return false end
        return restoreDeparture(self.departure)
    end
    local function fadeOut(dt)
        if not alpha(math.min(1,gate.alpha+delta(dt)/gate.sceneDuration))then return false end
        local entry=gate.entry
        if entry and not entry.feedback and math.floor(shade(gate.alpha)*255+.5)>0 then
            entry.feedback=true;trace(entry,'feedback_submitted','veil')
        end
    end
    local function finishDeparture(intent,dt)
        local departure=gate.departure
        if not same(departure.source,intent)then return gate:request(intent)end
        if gate.alpha<1 then
            fadeOut(dt)
            return false
        end
        -- The opaque submission got a scheduler turn before any rule or native work.
        gate.state='preparing'
        gate.departure=nil
        local ticket=gate.epoch
        local ok,accepted,reason=pcall(departure.commit)
        if gate.epoch~=ticket then return false end
        if not ok or accepted==false then
            local failure=tostring(ok and (reason or 'departure_rejected') or accepted)
            if gate.entry then return restoreDeparture(departure,failure),false end
            return reject(gate,failure)
        end
        return true -- Destination refresh is permitted only behind opaque black.
    end
    function gate:advanceDeparture(intent,dt)
        if self.state~='fadingOut' then return false end
        return true,finishDeparture(intent,dt)
    end
    function gate:failProjection(entry,intent,reason)
        if self.entry~=entry then return false end
        if not same(intent,self.intent) then self:request(intent)end
        if self.entry~=entry or not same(intent,self.intent) then return false end
        if not alpha(1)then return false end
        self.painting=nil;self.projectionError=true
        reject(self,tostring(reason));return true
    end
    local function revealPage(intent,dt)
        if not same(intent,gate.intent)then return gate:request(intent)end
        local ticket=gate.epoch
        local value,reason,progress=readiness(ready,intent)
        if ticket~=gate.epoch or not same(intent,gate.intent)then return false end
        if reason or not value then
            if not alpha(1)then return false end
            gate.state='preparing';gate.armed=nil
            if reason then return reject(gate,tostring(reason))end
            return waitForPreparation(gate,dt,progress)
        end
        if not alpha(math.max(0,gate.alpha-delta(dt)/gate.sceneDuration))then return false end
        if gate.alpha>0 then return false end
        gate.sceneDuration,gate.sceneDestination=nil,nil
        gate.state='visible';cover:SetVisible(false)
        if ticket~=gate.epoch then return false end
        logVisible(intent,ticket);return enableEntry(intent)
    end
    local function publishReadyPage(intent,ticket,narrating)
        -- New base pages confirm on another scheduler turn. A retained base's
        -- local work publishes as soon as this turn's real owners report ready.
        local localReady=(gate.localFrame or gate.localOnly) and not needsSchedulerConfirmation(intent)
        local confirmed=gate.armed and gate.armed.epoch==ticket and gate.armed.tick<gate.tick
        if not localReady and not confirmed then
            gate.state='ready';gate.armed={epoch=ticket,tick=gate.tick};return false
        end
        if narrating then return false end
        local mapReturn=gate.mapReturnPainted==ticket
        gate.published=intent;gate.roomEntry=nil;gate.armed=nil;gate.error=nil
        -- The covered refresh already painted the map and its input targets.
        if mapReturn then onMapReturn()end
        if ticket~=gate.epoch then return false end
        gate.state=gate.sceneDuration and 'fadingIn' or 'visible'
        readyEntry(intent)
        if ticket~=gate.epoch then return false end
        cover:SetVisible(gate:covered())
        if ticket~=gate.epoch then return false end
        if gate.state=='visible' then
            logVisible(intent,ticket)
            return enableEntry(intent,mapReturn)
        end
        return true,not gate.entry
    end
    function gate:step(intent,dt)
        if self.state=='abandoned' then return false end
        if motion and self.state=='fadingOut' then return finishDeparture(intent,dt)end
        if motion and self.state=='fadingIn' then return revealPage(intent,dt)end
        self.tick=self.tick+1
        local unchanged=same(intent,self.intent)
        if not self:request(intent) and not unchanged then return false end
        if not same(intent,self.intent)then return false end
        if self.state=='visible' or needsRecovery(self)then return false end
        local ticket=self.epoch
        local value,reason,progress=readiness(ready,intent)
        if ticket~=self.epoch then return false end
        if reason then return reject(self,tostring(reason))end
        self.error=nil
        local narrating=advanceNarration(self.entry,dt)
        if value~=true then
            self.state='preparing';self.armed=nil
            return waitForPreparation(self,dt,progress)
        end
        return publishReadyPage(intent,ticket,narrating)
    end
    return gate
end
return M
