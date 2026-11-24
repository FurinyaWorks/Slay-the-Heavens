-- TASK-4.7 owned-relic art slots: a top-bar disc row plus a read-only detail
-- overlay. Each entry is icon disc + Chinese name + status chip + effect text.
local Theme=require('abyss_theme')
local Pointer = require('abyss_pointer_input')
local Hooks=require('abyss_relic_hooks')
local Rewards=require('abyss_relic_rewards')
local M={}
local Art=require('abyss_lowcost_art')
local rarityNames={starter='初始遗物',common='普通遗物',uncommon='罕见遗物',rare='稀有遗物',
    boss='首领遗物',shop='商店遗物',special='特殊遗物'}
local function iconId(value)if type(value)=='table'then value=value.id end return type(value)=='number' and value or nil end
local function iconKey(id,run)
    local key=Hooks.localId(id)
    if key and not Theme.icon.relic[key] and run and run.data and run.data.relics then
        local definition=Rewards.definition(run,id)
        if definition then return definition.id end
    end
    return key
end
local function atlasIcon(id,key,battle)
    if battle and Theme.presentationProfile=='official-assets-first' then
        local icons=Theme.officialAssets.battleRelicIcons
        local override=icons and (iconId(icons[key]) or iconId(icons[id]))
        if override then return override end
    end
    return iconId(Theme.icon.relic[key]) or iconId(Theme.icon.relic[id]) or iconId(Theme.icon.node.treasure)
end
function M.icon(id,battle)
    return atlasIcon(id,iconKey(id),battle)
end
-- The same stable ID selects both the native artwork and its atlas fallback.
function M.paint(control,id,size,platform,run,fallback)
    local key=iconKey(id,run)
    local image=key and atlasIcon(id,key,true) or iconId(fallback)
    if platform.imageSource and image then control:SetImage(platform.imageSource,image) end
    if key then Art.paint(control,'relic',key,size,platform)
    else Art.hide(control) end
end
local function counterValue(run,id)
    local local_=Hooks.localId(id)
    local function read(counters)return counters and (counters[local_]~=nil and counters[local_] or counters[id])end
    local v=run.phase=='combat' and run.combat and read(run.combat.relicCounters) or nil
    if v==nil then v=read(run.relicCounters)end
    return local_,v
end
local function spentCounter(id,value)
    if id=='ancient_tea_set' then return false end
    if value==-2 then return true end
    if type(value)~='number' or value>0 then return false end
    return id=='omamori' or id=='matryoshka' or id=='winged_greaves' or id=='nloths_mask'
end
-- Counter meanings differ per relic, so only well-understood ones get wording.
function M.status(run,id)
    local local_,v=counterValue(run,id)
    if type(v)~='number' then return nil end
    if local_=='neows_lament' then return v==-2 and '已耗尽' or ('剩余 '..v..' 场') end
    if local_=='maw_bank' then return v==-2 and '已失效' or nil end
    if local_=='ancient_tea_set' then return v==-2 and '已蓄能' or nil end
    if local_=='lizard_tail' then return v==-2 and '已耗尽' or v==-1 and '剩余 1 次' or nil end
    if local_=='omamori' or local_=='matryoshka' or local_=='winged_greaves' or local_=='nloths_mask' then
        return v<=0 and '已耗尽' or ('剩余 '..v..' 次')
    end
    if v==-2 then return '已耗尽' end
    if v>=0 then return '计数 '..v end
    return nil
end
-- Physical cells map to actual owned indices on a bounded horizontal page.
function M.barCells(total,count,page)
    local cells={}
    for i=1,count do
        local index=((page or 1)-1)*count+i
        cells[i]=index<=total and index or false
    end
    return cells
end
local function perPage()return #Theme.layout.relicView.rows*#Theme.layout.relicView.columns end
function M.new(root,bar,clickEvent,platform,describe,onClose,onSlot)
    local self={root=root,bar=bar,visible=false,page=1,barPage=1,detailGeneration=0}
    local official=Theme.presentationProfile=='official-assets-first'
    self.localPanel=official
    local baseBar=Theme.layout.relicView.bar
    local battleBar=official and assert(Theme.officialAssets.battleRelicBar,'missing official battle relic layout')
    local style=platform.mobileRunHud and platform.mobileRunHud.relicBar or battleBar or baseBar
    local boundCount=official and battleBar.count or baseBar.count
    local hitSize=platform.mobileRunHud and platform.mobileRunHud.hit or style.hit or style.step
    local capacity=style.count
    if platform.mobileRunHud then
        -- 40-unit safe margins + one 84-unit arrow and 8-unit gap per side.
        local width=Theme.canvas.base[1]-2*40-2*(hitSize+8)
        capacity=math.min(boundCount,math.floor((width-hitSize)/style.step)+1)
    end
    self.barCapacity=capacity
    local barCells={}
    local function context()return platform.hudInputContext and platform.hudInputContext() or {}end
    local function same(a,b)
        for k,v in pairs(a)do if b[k]~=v then return false end end
        for k,v in pairs(b)do if a[k]~=v then return false end end
        return true
    end
    local tooltip=bar:GetChild('tooltip')
    local function child(name)return assert(root:GetChild(name),'missing relic control '..name)end
    function self.resetBarHover(_)
        if self.hoverIndex then local icon=bar:GetChild('slot'..self.hoverIndex):GetChild('icon');icon:SetLocalScale(1,1,1);Art.scale(icon,1)end
        self.hoverIndex=nil
        if tooltip and tooltip.visible then tooltip:SetVisible(false)end
    end
    local function paintCounter(slot,run,id,battle)
        local key,value
        if id then key,value=counterValue(run,id)end
        local numeric=battle and type(value)=='number' and value>=0
        local counter=slot:GetChild('counter')
        counter:SetVisible(not not numeric);counter.text=numeric and tostring(value) or ''
        if official and platform.color then
            local ink=battle and spentCounter(key,value) and 110 or 255
            slot:GetChild('icon').imageColor=platform.color(ink,ink,ink,255)
            Art.tint(slot:GetChild('icon'),ink)
        end
    end
    function self.entry(_,run,i)
        local id=run.relics[i]
        local definition=Rewards.definition(run,id)
        local description=definition and describe(run,definition.id) or ''
        return {id=id,name=definition and definition.name or '未识别遗物',icon=M.icon(definition and definition.id or id,official),
            rarity=definition and rarityNames[definition.rarity] or '遗物',
            status=M.status(run,id),description=description~='' and description or '效果说明待补充。'}
    end
    function self.pages()return math.max(1,math.ceil(#(self.run and self.run.relics or {})/perPage()))end
    local function paintFrame(single)
        if Theme.presentationProfile=='official-assets-first' and platform.color then
            local p,f=single and Theme.color.panel or Theme.color.panelSunken,Theme.color.goldDim
            child('plate').imageColor=platform.color(p.r,p.g,p.b,p.a or 255)
            child('frame').imageColor=platform.color(f.r,f.g,f.b,f.a or 255)
        end
    end
    local function positionSingle(view,compact)
        if not compact then return end
        local x,y=-177,8
        local icon,art=view:GetChild('icon'),view:GetChild('iconArt')
        icon:SetAnchoredPosition(x,y)
        icon:SetSizeDelta(96,96)
        -- Native art is a sibling of the atlas image and needs the same anchor.
        if art then art:SetAnchoredPosition(x,y)end
        for name,frame in pairs({name={55,91,350,40},rarity={55,53,350,32},
            description={55,-18,350,104},status={55,-86,350,24}})do
            local control=view:GetChild(name)
            control:SetAnchoredPosition(frame[1],frame[2]);control:SetSizeDelta(frame[3],frame[4])
        end
    end
    local function renderFrame(run,single,compact)
        child('single'):SetVisible(single)
        local width=compact and 560 or single and Theme.layout.relicView.row[1]+Theme.layout.relicView.disc*2 or Theme.layout.relicView.panel[3]
        local height=compact and 342 or Theme.layout.relicView.panel[4]
        child('frame'):SetSizeDelta(width,height)
        local inset=compact and 2 or Theme.space.border*2
        child('plate'):SetSizeDelta(width-inset,height-inset)
        child('contentBlocker'):SetSizeDelta(width,height)
        paintFrame(single)
        child('close'):SetAnchoredPosition(single and width/2-58 or Theme.layout.relicView.close[1],
            compact and height/2-33 or Theme.layout.relicView.close[2])
        child('title'):SetVisible(not compact)
        child('title').text=single and '遗物详情' or '持有遗物 · '..#run.relics..' 件'
        return width,height
    end
    local function renderSingle(run,compact)
        local e=self:entry(run,self.selectedIndex);self.selected=e
        local view=child('single')
        positionSingle(view,compact)
        M.paint(view:GetChild('icon'),e.id,compact and 96 or Theme.layout.relicView.disc*2,platform,run,e.icon)
        for _,name in ipairs({'name','rarity','description'})do view:GetChild(name).text=e[name]end
        view:GetChild('status').text=e.status or ''
    end
    local function renderRows(run,single,n)
        self.rows={}
        for slot=1,n do
            local row=child('row'..slot)
            local i=(self.page-1)*n+slot
            if not single and i<=#run.relics then
                local e=self:entry(run,i);self.rows[slot]=e
                M.paint(row:GetChild('slot'):GetChild('icon'),e.id,Theme.layout.relicView.icon,platform,run)
                row:GetChild('name').text=e.name
                row:GetChild('description').text=e.description
                row:GetChild('chip'):SetVisible(e.status~=nil)
                row:GetChild('chip'):GetChild('label').text=e.status or ''
                row:SetVisible(true)
            else row:SetVisible(false) end
        end
    end
    local function positionPageControls(single,compact,width,height)
        for _,name in ipairs({'previous','next'})do
            local frame=Theme.layout.relicView[name]
            child(name):SetAnchoredPosition(single and (name=='previous' and -width/2+112 or width/2-112) or frame[1],compact and -height/2+26 or frame[2])
        end
    end
    local function renderPageControls(run,single,compact,width,height)
        local many=self:pages()>1
        child('previous'):SetVisible(single and self.selectedIndex>1 or not single and many)
        child('next'):SetVisible(single and self.selectedIndex<#run.relics or not single and many)
        positionPageControls(single,compact,width,height)
        child('pageHint'):SetVisible(not single and many)
        child('pageHint').text=not single and many and ('第 '..self.page..'/'..self:pages()..' 页') or ''
        child('placeholder'):SetVisible(#run.relics==0)
        if platform.mobileRunHud then
            for _,name in ipairs({'previous','next','close'})do
                child(name):GetChild('hit'):SetSizeDelta(name=='close' and 96 or 180,84)
            end
        end
    end
    function self.render(_)
        local run=self.run
        local single=self.selectedIndex~=nil
        local compact=single and official
        local width,height=renderFrame(run,single,compact)
        if single then renderSingle(run,compact)end
        renderRows(run,single,perPage())
        renderPageControls(run,single,compact,width,height)
    end
    function self.open(_,run,index)
        if self.visible or not run or #run.relics==0 or index~=nil and (type(index)~='number' or not run.relics[index]) then return false end
        self:resetBarHover()
        self.detailGeneration=self.detailGeneration+1
        self.visible,self.run=true,run
        self.selectedIndex=index or 1
        self.page=1
        root:SetVisible(true);root:SetAsLastSibling()
        self:render();return true
    end
    function self.close(_)
        if not self.visible then return false end
        self:resetBarHover()
        self.detailGeneration=self.detailGeneration+1
        self.visible,self.run,self.rows,self.selectedIndex,self.selected=false,nil,nil,nil,nil
        root:SetVisible(false);return true
    end
    function self.turn(_,step)
        if self.visible and self.selectedIndex then
            local target=self.selectedIndex+step
            if target<1 or target>#self.run.relics then return false end
            self.detailGeneration=self.detailGeneration+1
            self.selectedIndex=target;self:render();return true
        end
        if not self.visible or self:pages()<2 then return false end
        self.page=(self.page-1+step)%self:pages()+1;self:render();return true
    end
    local function paintBarCell(i,index,relics,run)
        local slot=bar:GetChild('slot'..i)
        slot:SetVisible(index~=false)
        slot:SetAnchoredPosition(style.origin[1]+style.step*(i-1),style.origin[2])
        local icon,hit=slot:GetChild('icon'),slot:GetChild('hit')
        icon:SetSizeDelta(style.icon,style.icon)
        hit:SetSizeDelta(hitSize,platform.mobileRunHud and hitSize or 44)
        slot:SetSizeDelta(hitSize,hitSize)
        hit:SetAnchoredPosition(0,0)
        for _,name in ipairs({'rim','face'})do slot:GetChild(name):SetVisible(not official)end
        slot:GetChild('more'):SetVisible(false)
        icon:SetVisible(index~=false)
        if index then M.paint(icon,relics[index],style.icon,platform,run)else Art.hide(icon)end
        paintCounter(slot,run,index and relics[index] or nil,official)
    end
    local function renderBar(run)
        local relics=run and run.relics or {}
        local pages=math.max(1,math.ceil(#relics/capacity))
        self.barPage=math.max(1,math.min(self.barPage,pages))
        barCells=M.barCells(#relics,capacity,self.barPage)
        for i=1,boundCount do paintBarCell(i,barCells[i] or false,relics,run)end
        local left=style.origin[1]-style.step
        local right=style.origin[1]+style.step*capacity
        for _,name in ipairs({'previous','next'})do
            local control=bar:GetChild(name)
            control:SetAnchoredPosition(name=='previous' and left or right,style.origin[2])
            control:GetChild('hit'):SetSizeDelta(hitSize,platform.mobileRunHud and hitSize or 44)
            control:SetVisible(pages>1 and (name=='previous' and self.barPage>1 or name=='next' and self.barPage<pages))
        end
    end
    function self.turnBar(_,step)
        if not self.barInteractive or step~=1 and step~=-1 then return false end
        local target=self.barPage+step
        if target<1 or target>math.ceil(#self.barRun.relics/capacity)then return false end
        self:resetBarHover();self.barPage=target;renderBar(self.barRun);return true
    end
    function self.refreshBar(_,run,visible,inputBlocked,deferHiddenPaint)
        if self.barRun~=run then self.barPage=1 end
        self.barInteractive=not not (visible and run and not inputBlocked and not self.visible)
        if not self.barInteractive or self.barRun~=run or self.hoverIndex and run.relics[barCells[self.hoverIndex]]~=self.hoverId then self:resetBarHover()end
        self.barRun=run
        if self.visible and run==self.run and #run.relics>0 then
            self.selectedIndex=math.min(self.selectedIndex,#run.relics);self:render()
        end
        bar:SetVisible(visible and run~=nil)
        if deferHiddenPaint and not visible then return end
        bar:GetChild('tray'):SetVisible(false)
        renderBar(run)
    end
    -- A pooled slot can represent a different relic after a page/room change.
    -- Down/Up/Click must agree on identity, not just on its old coordinates.
    local function bindBar(control,identity,action)
        local hit=control:GetChild('hit')
        local held,released
        local cursor=platform.cursorEvents or {}
        local pointers=cursor.CursorDown and cursor.CursorUp
        local function token()return {run=self.barRun,page=self.barPage,id=identity(),context=context()}end
        local function valid(t)
            return self.barInteractive and control.visible and (not platform.hudAlive or platform.hudAlive()) and not Pointer.blocked(platform)
                and (not t or t.run==self.barRun and t.page==self.barPage and t.id==identity() and same(t.context,context()))
        end
        if pointers then
            hit:AddCursorEventListener(cursor.CursorDown,function(e)held,released=nil,nil;if valid()then held=token();held.touch=e and e.touchId end end)
            hit:AddCursorEventListener(cursor.CursorUp,function(e)released=held and held.touch==(e and e.touchId) and valid(held) and held or nil;held=nil end)
            if cursor.CursorEndDrag then hit:AddCursorEventListener(cursor.CursorEndDrag,function()held,released=nil,nil end)end
        end
        hit:AddCursorEventListener(clickEvent,function(e)
            local t=released;released=nil
            if Pointer.dragged(e,8) or not valid(t) or pointers and (not t or t.touch~=(e and e.touchId))then return false end
            return action()
        end)
    end
    for _,name in ipairs({'previous','next'})do
        bindBar(bar:GetChild(name),function()return name end,function()return self:turnBar(name=='previous' and -1 or 1)end)
    end
    root.disableCursorEventPassthrough=true
    child('contentBlocker'):AddCursorEventListener(clickEvent,function()return self.visible end)
    local actions={blocker=function()return onClose()end,close=function()return onClose()end,previous=function()return self:turn(-1)end,next=function()return self:turn(1)end}
    for name,action in pairs(actions)do
        local control=child(name)
        local hit=name=='blocker' and control or control:GetChild('hit')
        local cursor=platform.cursorEvents or {}
        local held,released
        local function valid(token)
            return self.visible and control.visible and (not platform.hudAlive or platform.hudAlive()) and not Pointer.blocked(platform)
                and (not token or token.generation==self.detailGeneration and same(token.context,context()))
        end
        if cursor.CursorDown and cursor.CursorUp then
            hit:AddCursorEventListener(cursor.CursorDown,function(e)
                held,released=nil,nil
                if valid()then held={generation=self.detailGeneration,context=context(),touch=e and e.touchId}end
            end)
            hit:AddCursorEventListener(cursor.CursorUp,function(e)
                released=held and held.touch==(e and e.touchId) and valid(held) and held or nil;held=nil
            end)
        end
        hit:AddCursorEventListener(clickEvent,function(e)
            local token=released;released=nil
            if not valid(token) or cursor.CursorDown and cursor.CursorUp and (not token or token.touch~=(e and e.touchId)) then return false end
            return action()
        end)
    end
    for i=1,boundCount do
        local hit=bar:GetChild('slot'..i):GetChild('hit')
        local cursor=platform.cursorEvents
        if official and cursor and cursor.CursorEnter and cursor.CursorExit then
            hit:AddCursorEventListener(cursor.CursorEnter,function()
                if not self.barInteractive or self.visible or Pointer.blocked(platform)then return false end
                local slot=bar:GetChild('slot'..i)
                if slot.visible==false or not barCells[i] then return false end
                self:resetBarHover();self.hoverIndex=i
                slot:GetChild('icon'):SetLocalScale(1.25,1.25,1)
                Art.scale(slot:GetChild('icon'),1.25)
                if tooltip and self.barRun and self.barRun.relics[barCells[i]] then
                    local entry=self:entry(self.barRun,barCells[i])
                    self.hoverId=entry.id
                    tooltip:GetChild('name').text=entry.name
                    tooltip:GetChild('effect').text=entry.description..(entry.status and '\n'..entry.status or '')
                    local x=style.origin[1]+style.step*(i-1)
                    tooltip:SetAnchoredPosition(math.max(-450,math.min(450,x+148)),style.origin[2]-108)
                    tooltip:SetVisible(true);tooltip:SetAsLastSibling()
                end
                return true
            end)
            hit:AddCursorEventListener(cursor.CursorExit,function()
                if self.hoverIndex==i then self:resetBarHover()end
                return true
            end)
        end
        bindBar(bar:GetChild('slot'..i),function()
            local index=barCells[i];return index and self.barRun and self.barRun.relics[index]
        end,function()return onSlot(barCells[i])end)
    end
    return self
end
return M
