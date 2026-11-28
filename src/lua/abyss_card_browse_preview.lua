-- One passive surface for combat grid choices and deck browsing.
local Theme=require('abyss_theme')
local Pointer=require('abyss_pointer_input')
local Tip=require('abyss_card_keyword_tip')
local Keywords=require('abyss_card_keywords')
local hoverDelay=Keywords.hoverDelay
local Combat=require('abyss_combat')
local CardDisplay=require('abyss_card_display')
local OriginalDisplay=require('abyss_original_v4_display')
local M={}
local function noop() end
M.disabled={clear=noop,update=noop,bindGrid=noop,bindChoice=noop,consume=noop}

function M.new(panel,platform,host)
    local state={}
    local active
    local swallowed=setmetatable({}, {__mode='k'})
    local function hide(cancel)
        if cancel and active and active.hold then swallowed[active.hit]={touch=active.touch} end
        if active and active.shown and panel.alive~=false then panel:SetVisible(false) end
        active=nil
    end
    local function mobile()
        return platform.touchScreen and platform.touchScreen()
    end
    local function touch(event) return event and event.touchId end
    local function blocked()
        return host.exitOpen or host.disabled or host.sessionPaused or host.settlementRequested
            or host.settlementBusy or Pointer.blocked(platform)
    end
    local function start(owner,hit,capture,hold,event)
        if (mobile()==true)~=hold or blocked() then return end
        if active and active.hold and (active.touch~=touch(event) or active.hit==hit) then return end
        hide(true)
        local current,rows,floor=capture()
        if not current then return end
        active={owner=owner,hit=hit,hold=hold,touch=touch(event),current=current,rows=rows,floor=floor,time=0}
    end
    function state.enter(owner,hit,capture)
        start(owner,hit,capture,false)
    end
    function state.down(owner,hit,capture,event)
        local key=touch(event)
        if not active or not active.hold or active.hit~=hit or active.touch==key then swallowed[hit]=nil end
        if capture then start(owner,hit,capture,true,event) end
    end
    function state.exit(hit,event)
        if active and active.hit==hit and (not active.hold or not event or active.touch==touch(event)) then hide(true) end
    end
    function state.up(hit,event)
        if active and active.hold and active.hit==hit and active.touch==touch(event) then
            hide(Pointer.dragged(event,Theme.layout.cardDrag.threshold))
        end
    end
    function state.drag(hit,event)
        if active and active.hold and active.hit==hit and active.touch==touch(event)
            and Pointer.dragged(event,Theme.layout.cardDrag.threshold) then
            hide(true)
            return true
        end
    end
    function state.consume(hit,event)
        if active and active.hold and active.hit==hit then return true end
        local spent=swallowed[hit]
        return spent and (not event or touch(event)==nil or spent.touch==touch(event))
    end
    function state.clear(owner)
        if active and active.owner==owner then hide(true) end
    end
    function state.cancelIfBlocked()
        if active and blocked() then hide(true) end
    end
    function state.update(owner,dt)
        local s=active
        if not s or s.owner~=owner then return end
        if s.hit.alive==false or s.hit.activeInHierarchy==false or blocked() or not s.current() then
            hide(true);return
        end
        if s.shown or not dt then return end
        s.time=s.time+math.max(0,dt)
        if (s.hold and s.time<Theme.layout.statusInfo.delay) or (not s.hold and s.time<=hoverDelay) then return end
        local rows=s.rows()
        if not rows then hide();return end
        if s.hold then swallowed[s.hit]={touch=s.touch} end
        panel:SetAsLastSibling()
        Tip.paint(panel,s.hit,owner.root,rows,s.floor)
        s.shown=true
    end
    return state
end

local gridChoice={recoverExhaust=true,discardToDraw=true,discardToHand=true}

local function previewChoice(deck)
    local battle,run=deck.battle,deck.run
    local choice=battle and battle.pendingChoice
    if not deck.choiceToken or not choice or deck.choiceToken~=choice.token
        or not run or run.combat~=battle or run.phase~='combat' then return end
    if choice.cards or gridChoice[choice.op] or choice.op=='colorless' and choice.item.effect.kind=='secret' then return choice end
end

function M.deck(deck,platform,inDetail,scroll)
    local state=platform.cardBrowsePreview
    if not state then return M.disabled end
    local cursor=platform.cursorEvents or {}
    local function capture(instance,text,current)
        local generation,catalog,battle=deck.generation,deck.catalog,deck.battle
        local choice=previewChoice(deck)
        if not deck.visible or inDetail() or deck.choiceToken and not choice then return end
        return function()
            return deck.visible and not inDetail() and deck.generation==generation and current()
                and (not choice or choice==previewChoice(deck))
        end,function()
            local definition=Combat.cardDefinition(battle or {catalog=catalog},instance)
            return Keywords.cardTips(catalog.statuses,definition,instance.upgraded,text())
        end,-280
    end
    local controls={clear=state.clear,update=state.update,consume=state.consume}
    function controls.bindGrid(control,hit)
        local function read()
            local binding=deck.bindings[control]
            if not binding or binding.generation~=deck.generation or not binding.instance then return end
            local instance,progress=binding.instance,scroll()
            local id,upgraded=instance.cardId,instance.upgraded
            local function current()
                return deck.bindings[control]==binding and binding.instance==instance and instance.cardId==id
                    and instance.upgraded==upgraded and scroll()==progress and control.visible~=false
            end
            return capture(instance,function()return control:GetChild('face'):GetChild('label').text end,current)
        end
        if cursor.CursorEnter then hit:AddCursorEventListener(cursor.CursorEnter,function()state.enter(deck,hit,read)end) end
        if cursor.CursorExit then hit:AddCursorEventListener(cursor.CursorExit,function(event)state.exit(hit,event)end) end
        if cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(event)
                state.down(deck,hit,deck.choiceToken and read or nil,event)
            end)
            hit:AddCursorEventListener(cursor.CursorUp,function(event)state.up(hit,event)end)
        end
    end
    function controls.bindChoice(binding,hit)
        if deck.choiceToken and cursor.CursorDrag and not binding.previewDrag then
            hit:AddCursorEventListener(cursor.CursorDrag,function(event)state.drag(hit,event)end)
            binding.previewDrag=true
        end
    end
    controls.browser={exit=state.exit,enter=function(entry,available)
        state.enter(deck,entry.hit,function()
            if not available() then return end
            local instance,version=entry.instance,entry.version
            return capture(instance,function()return entry.bodyText end,
                function()return available() and entry.version==version and entry.instance==instance end)
        end)
    end}
    return controls
end

function M.describeInspection(display,run,definition,upgraded,text)
    local title=display.name..(upgraded and '+' or '')
    if definition.originalV4 then
        local raw=OriginalDisplay.describe(definition,upgraded)
        local keywords=OriginalDisplay.keywordDefinitions(definition,upgraded)
        return title,keywords~='' and raw..'\n'..keywords or raw
    end
    text=text or CardDisplay.permanentText(display,definition,{upgraded=upgraded})
    local rows=Keywords.runTips(run,definition,upgraded,text)
    if not rows then return end
    local lines={text}
    for _,row in ipairs(rows) do lines[#lines+1]=row.name..'：'..row.body end
    return title,table.concat(lines,'\n')
end

function M.paginate(raw,width,height)
    -- Bound each page using the shared viewport/font, counting a CJK codepoint
    -- as a full em. Do not truncate rules; every wrapped line stays reachable.
    local columns=math.max(1,math.floor(width/Theme.font.reading)-2)
    local rows=math.max(1,math.floor(height/Theme.layout.nativeText.lineHeight)-3)
    local lines,line,n={},'',0
    for ch in raw:gmatch('[%z\1-\127\194-\244][\128-\191]*') do
        if ch=='\n' then lines[#lines+1]=line;line,n='',0
        else line=line..ch;n=n+1;if n>=columns then lines[#lines+1]=line;line,n='',0 end end
    end
    if line~='' then lines[#lines+1]=line end
    local pages={}
    for i=1,#lines,rows do
        local page={};for j=i,math.min(i+rows-1,#lines) do page[#page+1]=lines[j] end
        pages[#pages+1]=table.concat(page,'\n')
    end
    return pages
end

return M
