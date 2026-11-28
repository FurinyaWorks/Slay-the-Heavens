-- A view of an existing core selection. Only the confirm callback issues a command.
local Combat=require("abyss_combat")
local Theme=require("abyss_theme")
local layout=Theme.layout.combatChoice
local PAGE_SIZE=layout.columns*layout.rows
local CardDisplay=require("abyss_card_display")
local Keywords=require("abyss_card_keywords")
local CardSkin=require("abyss_card_skin")
local M={}
local Pointer = require('abyss_pointer_input')
local types={attack="攻击",skill="技能",power="能力",status="状态",curse="诅咒"}
local states={"normal","hover","pressed","disabled"}
local kinds={"potion","discard","scry","hand","pile"}
local fields={potion='pendingPotionChoice',discard="pendingDiscard",scry="pendingScry",hand="pendingHandChoice",pile='pendingPileChoice'}
local function pending(run)
    if not run or run.phase~="combat" or not run.combat or run.combat.phase~="player" then return end
    for _,kind in ipairs(kinds) do
        local choice=run.combat[fields[kind]]
        if choice then return kind,choice end
    end
end
local function index(pile)
    local result={}
    for _,card in ipairs(pile or {}) do result[card.uid]=card end
    return result
end
local function candidates(run,kind,choice)
    local battle=run.combat
    if choice.turn~=battle.turn then return end
    if kind=='potion'then
        local view=require('abyss_potion_stance').view(battle,run.combatGeneration)
        return view and view.options
    end
    if kind=='pile' then
        local view=require('abyss_pile_choice').view(battle)
        if not view or view.generation~=run.combatGeneration then return end
        local source=index(battle[view.source]);local result={}
        for i,uid in ipairs(view.candidateUids) do result[i]=source[uid];if not result[i] then return end end
        return result
    end
    local source=kind=="scry" and index(battle.draw) or index(battle.hand)
    local uids=kind=="scry" and choice.candidateUids or choice.handUids
    if type(uids)~="table" then return end
    if kind=="scry" then
        if choice.drawSize~=#battle.draw or #uids>#battle.draw then return end
    elseif #uids~=#battle.hand then return end
    local cards,seen={},{}
    for i,uid in ipairs(uids) do
        local card=source[uid]
        if not card or seen[uid] then return end
        if kind=="scry" then
            if battle.draw[#battle.draw-i+1]~=card then return end
        elseif battle.hand[i]~=card
            or choice.cardIds and choice.cardIds[i]~=card.cardId
            or choice.upgraded and choice.upgraded[i]~=(card.upgraded==true) then return end
        seen[uid]=true;cards[i]=card
    end
    return cards
end
local function facts(cards,kind)
    local result={}
    for i,card in ipairs(cards) do
        result[i]=kind=='potion'and {option=card,id=card.id,name=card.name,text=card.text}
            or {card=card,uid=card.uid,id=card.cardId,upgraded=card.upgraded==true}
    end
    return result
end
local function matches(cards,saved,kind)
    if not cards or #cards~=#saved then return false end
    for i,card in ipairs(cards) do
        local old=saved[i]
        if kind=='potion'then
            if old.option~=card or old.id~=card.id or old.name~=card.name or old.text~=card.text then return false end
        elseif old.card~=card or old.uid~=card.uid or old.id~=card.cardId or old.upgraded~=(card.upgraded==true) then return false end
    end
    return true
end
function M.new(root,presentation,clickEvent,platform,onConfirm)
    assert(type(onConfirm)=="function","missing choice command callback")
    local view={root=root,visible=false,generation=0,selected={},page=1}
    local cursor=platform.cursorEvents or {}
    local pointerObserved=false
    local preview=platform.cardBrowsePreview
    local grid=root:GetChild("cards")
    local list
    local function child(name) return assert(root:GetChild(name),"missing choice control "..name) end
    local function caption(box,value)
        for _,state in ipairs(states) do box:GetChild("hit"):GetChild(state):GetChild("label").text=value end
    end
    local function colour(c) return platform.color(c.r,c.g,c.b,c.a) end
    local function fresh(duringConfirm)
        local c=view.context
        if not view.visible or not view.enabled or view.confirming and not duringConfirm or not c or view.run~=c.run
            or c.run.phase~="combat" or c.run.combat~=c.battle or c.battle.phase~="player"
            or c.run.combatGeneration~=c.combatGeneration or c.battle.turn~=c.turn then return false end
        local kind,choice=pending(c.run)
        return kind==c.kind and choice==c.pending and choice.token==c.token and choice.turn==c.pendingTurn
            and choice.count==c.count and choice.mode==c.mode
            and #c.battle.hand==c.handSize and #c.battle.draw==c.drawSize
            and matches(candidates(c.run,kind,choice),c.cards,kind)
    end
    local function limit() return view.context.kind=="scry" and #view.cards or view.context.count or 1 end
    local function countAllowed()
        return view.context.kind=="scry" or #view.selected==limit()
    end
    local function selected(uid)
        for i,value in ipairs(view.selected) do if value==uid then return i end end
    end
    local function paintCard(face,instance)
        local battle=view.context.battle
        local definition=Combat.cardDefinition(battle,instance)
        local display=assert(presentation[instance.cardId],"missing choice presentation "..instance.cardId)
        CardDisplay.writeTitle(face:GetChild('name'),display.name,instance.upgraded,
            definition.repeatable and (instance.upgrades or 1) or nil,face:GetChild('type'),types[definition.type] or definition.type)
        face:GetChild('name').fontColor=colour(Theme.cardSkin.text.title)
        CardDisplay.writeBody(face:GetChild('label'),CardDisplay.combatText(display,definition,instance,
            Combat.cardPreview(battle,instance),battle),face)
        face:GetChild('cost').text=definition.cost==-2 and '' or definition.costMode=='all_energy' and 'X' or tostring(definition.cost)
        CardDisplay.writeArt(face:GetChild('art'),definition,function(control,id)control:SetImage(platform.imageSource,id)end,face)
        CardDisplay.writeNativeArt(face,definition,display.nativeArt,platform,face:GetChild('art'),instance.uid)
        local printed=battle.catalog.cards[instance.cardId]
        local base=instance.upgraded and printed.upgrade and printed.upgrade.cost or printed.cost
        return definition,base
    end
    local function paintSkin(face,definition,base,picked)
        CardSkin.apply(face,definition,platform,{cost=definition.cost,baseCost=base,selected=picked,surfaceScope='choice'})
    end
    local function paintCell(entry)
        require('abyss_page_reveal').registerSource(platform,'choicePanel')
        entry.definition,entry.base=paintCard(entry.face,entry.binding.instance)
        entry.order=nil
    end
    local function paintCellSelection(entry)
        local order=selected(entry.binding.instance.uid) or false
        if order~=entry.order then
            entry.order=order
            paintSkin(entry.face,entry.definition,entry.base,order~=false)
            entry.label.text=order and '已选 '..order or ''
        end
        entry.hit.raycastTarget=not view.confirming
    end
    local function paintOptions(kind)
        for slot=1,2 do
            local option=child('option'..slot)
            local card=kind=='potion' and view.cards[slot]
            option:SetVisible(not not card)
            local hit=option:GetChild('hit')
            hit.interactable=not not card and not view.confirming;hit.raycastTarget=hit.interactable
            if card then
                local order=selected(card.id)
                caption(option,(order and '已选 '..order..' · ' or '')..card.name..'\n'..card.text)
            end
        end
    end
    local function paintChoiceStates(box,kind,picked)
        for _,state in ipairs(states) do
            local buttonState=box:GetChild("hit"):GetChild(state)
            for _,name in ipairs({'border','plate','label'})do
                buttonState:GetChild(name):SetVisible(kind=='potion')
            end
            local border=buttonState:GetChild("border")
            if border then border.imageColor=colour(picked and Theme.color.goldBright or Theme.color.goldDim) end
        end
    end
    local function paintChoiceSlot(slot,kind)
        local box=child("card"..slot)
        local card=view.cards[(view.page-1)*PAGE_SIZE+slot]
        box:SetVisible(card~=nil)
        local hit=box:GetChild("hit");hit.interactable=card~=nil and not view.confirming;hit.raycastTarget=hit.interactable
        if card then
            local order=selected(kind=='potion'and card.id or card.uid)
            local picked=order~=nil
            local face=assert(box:GetChild('face'),'missing choice card face')
            face:SetVisible(kind~='potion')
            box:GetChild('orderPlate'):SetVisible(kind~='potion' and picked)
            box:GetChild('order'):SetVisible(kind~='potion' and picked)
            box:GetChild('order').text=order and '已选 '..order or ''
            if kind=='potion' then
                caption(box,(order and '已选 '..order..' · ' or '')..card.name..'\n'..card.text)
            else
                local definition,base=paintCard(face,card)
                paintSkin(face,definition,base,picked)
                -- Keep the native button's semantic caption; only the shared face is visible.
                caption(box,face:GetChild('name').text..'\n'..face:GetChild('type').text
                    ..' · 费用 '..face:GetChild('cost').text..'\n'..face:GetChild('label').text)
            end
            paintChoiceStates(box,kind,picked)
        end
    end
    local function pileTitle()
        return view.context.mode=='omniscience' and '全知：选择免费打出两次的牌' or view.context.mode=='meditate' and '冥想：回收并保留' or view.context.mode=='headbutt' and '回收至牌堆顶' or '回收至手牌'
    end
    local function paintChoiceTitle(kind)
        child("title").text=kind=='potion'and '姿态药水：选择姿态'or kind=='pile' and pileTitle()
            or kind=="scry" and "占卜" or kind=="discard" and "选择弃牌"
            or view.context.mode=="put_on_deck" and "放回抽牌堆顶" or "选择消耗"
    end
    local function choiceInstructions(kind)
        local pileName=({draw='抽牌堆',discard='弃牌堆',exhaust='消耗堆'})[view.context.pending.source]
        return kind=='potion'and '选择一种姿态，必须完成选择。'or kind=='pile' and ('从'..(pileName or '牌堆')..'选择 '..limit()..' 张牌。')
            or kind=="scry" and "按选择顺序弃置；可不弃置。首张为抽牌堆顶。"
            or kind=="discard" and "选择 "..limit().." 张手牌弃置。" or "选择 1 张手牌。"
    end
    local function paintChoiceHint(kind)
        child("hint").text=choiceInstructions(kind).." 已选 "..#view.selected..(kind=='potion'and ' 种。'or " 张。")
            ..(list and kind~='potion' and #view.cards>PAGE_SIZE and ' 上下滚动浏览。' or '')
        child("status").text=view.error and "选择未提交，请重新确认。" or ""
    end
    local function paintChoiceNavigation(kind)
        local confirm=child("confirm")
        caption(confirm,kind=="scry" and (#view.selected==0 and "全部保留" or "确认弃置") or "确认选择")
        local confirmHit=confirm:GetChild("hit");confirmHit.interactable=countAllowed() and not view.confirming;confirmHit.raycastTarget=confirmHit.interactable
        if list then return end
        for _,name in ipairs({"before","after"}) do
            local box=root:GetChild(name)
            if box then
                box:SetVisible(#view.cards>PAGE_SIZE)
                local hit=box:GetChild("hit");hit.interactable=not view.confirming and (name=="before" and view.page>1 or name=="after" and view.page*PAGE_SIZE<#view.cards);hit.raycastTarget=hit.interactable
            end
        end
    end
    local function render()
        if not view.visible then return end
        require('abyss_page_reveal').registerSource(platform,'choicePanel')
        local kind=view.context.kind
        paintChoiceTitle(kind)
        paintChoiceHint(kind)
        if list then
            paintOptions(kind)
            list:repaint()
        else
            for slot=1,PAGE_SIZE do paintChoiceSlot(slot,kind) end
        end
        paintChoiceNavigation(kind)
    end
    function view:close()
        local visible=self.visible
        if preview then preview.clear(self) end
        self.generation=self.generation+1
        self.visible,self.enabled,self.run,self.context=false,false,nil,nil
        self.cards,self.selected,self.page,self.error={}, {},1,nil
        if list then list:close() end
        root:SetVisible(false)
        return visible
    end
    function view:refresh(run,enabled)
        local kind,choice=pending(run)
        if enabled~=true or not choice then self:close();return false end
        local cards=candidates(run,kind,choice)
        if not cards or #cards==0 then self:close();return false,"stale_choice_candidates" end
        if not list and #cards>PAGE_SIZE and (not root:GetChild("before") or not root:GetChild("after")) then
            self:close();return false,"choice_page_controls_missing"
        end
        local old=self.context
        self.enabled=true
        if preview then preview.clear(self) end
        if not old or self.run~=run or old.pending~=choice or not fresh(true) then
            self.generation=self.generation+1
            self.run,self.cards,self.selected,self.page,self.error=run,cards,{},1,nil
            local battle=run.combat
            self.context={run=run,battle=battle,turn=battle.turn,combatGeneration=run.combatGeneration,
                kind=kind,pending=choice,token=choice.token,pendingTurn=choice.turn,count=choice.count,mode=choice.mode,
                cards=facts(cards,kind),handSize=#battle.hand,drawSize=#battle.draw}
            if list then
                if kind=='potion' then list:close() else list:open(self.context,cards) end
            end
        end
        self.visible=true;root:SetVisible(true);root:SetAsLastSibling();render()
        return true
    end
    function view:update(dt)
        if list and self.visible and root.active~=false then list:update() end
        if preview then preview.update(self,dt) end
    end
    function view.presentationReady(_)
        if not list then return true end
        return list:ready(layout.rows)
    end
    function view:resize()
        if preview then preview.clear(self) end
        self.generation=self.generation+1
        return self.visible
    end
    function view:setPresentation(value)
        assert(type(value)=="table","invalid choice presentation")
        presentation=value;self.generation=self.generation+1
        if list then list:repaint(true)end
        render()
    end
    function view:select(slot)
        if not fresh() then return false,"stale_choice" end
        local maxSlot=list and #self.cards or PAGE_SIZE
        if type(slot)~="number" or slot%1~=0 or slot<1 or slot>maxSlot then return false,"invalid_choice_slot" end
        local card=self.cards[(self.page-1)*PAGE_SIZE+slot]
        if not card then return false,"invalid_choice_slot" end
        local key=self.context.kind=='potion'and card.id or card.uid
        local at=selected(key)
        if at then table.remove(self.selected,at)
        elseif limit()==1 then self.selected={key}
        elseif #self.selected<limit() then self.selected[#self.selected+1]=key
        else return false,"too_many_choices" end
        self.generation=self.generation+1;self.error=nil;render();return true
    end
    function view:confirm()
        if not fresh() then return false,"stale_choice" end
        if list and not self:presentationReady() then return false,"choice_preparing" end
        if not countAllowed() then return false,"invalid_choice_count" end
        local c=self.context
        local uids={};for i,uid in ipairs(self.selected) do uids[i]=uid end
        self.confirming=true;self.generation=self.generation+1;render()
        local called,ok,reason=pcall(onConfirm,c.kind,uids,c.token,c.combatGeneration,c.battle)
        self.confirming=false
        if not called then reason,ok=ok,false end
        if not ok then
            -- A callback can synchronously refresh or replace the Run. Never put
            -- an old selection back onto a replacement battle.
            if self.context==c then self.error=reason or "choice_rejected";render() end
            return false,reason
        end
        self:refresh(c.run,true)
        return true,reason
    end
    local function bind(hit,action,current,cardSlot)
        local function enabled()
            local binding=current and current()
            return hit.alive~=false and view.visible and not view.confirming and hit.raycastTarget~=false
                and (not current or binding and binding.context==view.context)
        end
        local held,released
        local function valid(token)
            if not enabled() or not fresh() then return false end
            if not token then return true end
            return token.generation==view.generation and token.context==view.context
                and (not current or token.binding==current() and token.progress==list:progress())
        end
        local function capture()
            local c=view.context
            if not c or (c.kind~='scry' and c.kind~='pile') or not valid() then return end
            local binding=current and current()
            local instance=binding and binding.instance or view.cards[(view.page-1)*PAGE_SIZE+cardSlot]
            local generation,progress,upgraded=view.generation,binding and list:progress(),instance.upgraded
            local function sameCard()
                local kind,choice=pending(c.run)
                return enabled() and view.context==c and view.generation==generation and kind==c.kind
                    and choice==c.pending and choice.token==c.token and c.battle.turn==c.turn
                    and c.run.combatGeneration==c.combatGeneration and c.run.combat==c.battle
                    and instance.upgraded==upgraded
                    and (not binding or binding==current() and list:progress()==progress)
            end
            local function rows()
                local definition=Combat.cardDefinition(c.battle,instance)
                local text=hit.parent:GetChild('face'):GetChild('label').text
                return Keywords.cardTips(c.battle.catalog.statuses,definition,instance.upgraded,text)
            end
            return sameCard,rows,layout.confirm[2]+layout.confirm[4]/2
        end
        local canPreview=preview and (current or cardSlot)
        if canPreview and cursor.CursorEnter then
            hit:AddCursorEventListener(cursor.CursorEnter,function()preview.enter(view,hit,capture)end)
        end
        local function touch(event) return event and event.touchId end
        if cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(event)
                pointerObserved=true
                if held and not valid(held) then held=nil end
                if held and held.touch~=touch(event) then return false end
                held,released=nil,nil
                if canPreview then preview.down(view,hit,capture,event) end
                if valid() then held={generation=view.generation,context=view.context,touch=touch(event),
                    binding=current and current(),progress=current and list:progress()} end
            end)
            if canPreview and cursor.CursorDrag then
                hit:AddCursorEventListener(cursor.CursorDrag,function(event)
                    if preview.drag(hit,event) then held,released=nil,nil end
                end)
            end
            hit:AddCursorEventListener(cursor.CursorUp,function(event)
                if canPreview then preview.up(hit,event) end
                if not held or held.touch~=touch(event) then return false end
                released=valid(held) and held or nil;held=nil
            end)
            for _,event in pairs({cursor.CursorExit,cursor.CursorEndDrag}) do
                if event then hit:AddCursorEventListener(event,function(pointer)
                    if canPreview then preview.exit(hit,pointer) end
                    local owner=held or released
                    if not pointer or owner and owner.touch==touch(pointer) then held,released=nil,nil end
                end) end
            end
        elseif canPreview and cursor.CursorExit then
            hit:AddCursorEventListener(cursor.CursorExit,function(event)preview.exit(hit,event)end)
        end
        hit:AddCursorEventListener(clickEvent,function(event)
            if canPreview and preview.consume(hit,event) then held,released=nil,nil;return false end
            if Pointer.blocked(platform)then return false end
            if current and Pointer.dragged(event,Theme.layout.cardDrag.threshold)then
                local owner=held or released
                if owner and owner.touch==touch(event)then held,released=nil,nil end
                return false
            end
            if pointerObserved or cursor.CursorDown and cursor.CursorUp and touch(event)~=nil then
                local token=released
                if not token or token.touch~=touch(event) or not valid(token) then return false end
                held,released=nil,nil
            elseif not valid() then return false end
            return action()
        end)
    end
    local function bindSlot(prefix,slot)
        bind(child(prefix..slot):GetChild('hit'),function()return view:select(slot)end,nil,prefix=='card' and slot or nil)
    end
    if grid then
        list=require('abyss_choice_grid').new(grid,layout.columns,function(hit,current)
            bind(hit,function()
                local binding=current()
                if not binding or binding.context~=view.context then return false end
                return view:select(binding.index)
            end,current)
        end,paintCell,paintCellSelection)
        for slot=1,2 do bindSlot('option',slot)end
    else
        for slot=1,PAGE_SIZE do bindSlot('card',slot)end
    end
    bind(child("confirm"):GetChild('hit'),function()return view:confirm()end)
    for _,name in ipairs({"before","after"}) do
        local box=root:GetChild(name)
        if box and list then
            box:SetVisible(false)
            local hit=box:GetChild('hit')
            hit.interactable=false;hit.raycastTarget=false
        elseif box then
            local delta=name=="before" and -1 or 1
            bind(box:GetChild('hit'),function()
                if not fresh() then return false,"stale_choice" end
                local page=view.page+delta
                if page<1 or (page-1)*PAGE_SIZE>=#view.cards then return false,"invalid_choice_page" end
                view.page=page;view.generation=view.generation+1;render();return true
            end)
        end
    end
    root.disableCursorEventPassthrough=true
    child("blocker"):AddCursorEventListener(clickEvent,function() return true end)
    root:SetVisible(false)
    return view
end
return M
