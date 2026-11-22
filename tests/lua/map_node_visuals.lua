-- Only the native controls are doubled. The map owns route permissions,
-- visuals, gesture identity and state transitions.
local Map, UI = require('abyss_map'), require('abyss_map_ui')
local Theme, Layout = require('abyss_theme'), require('abyss_map_layout')
local function control(spec, parent)
    local c = {spec=spec,parent=parent,children={},visible=spec.visible~=false,
        image=spec.image,imageColor=spec.colour,listeners={},
        localScaleX=1,localScaleY=1,raycastTarget=true}
    function c:GetChild(name) return self.children[name] end
    function c:SetVisible(v) self.visible=v end
    function c:SetAnchoredPosition(x,y) self.position={x,y} end
    function c:SetSizeDelta(w,h) self.size={w,h} end
    function c:SetLocalScale(x,y) self.localScaleX,self.localScaleY=x,y end
    function c:SetImage(_,id) self.image=id end
    function c:AddCursorEventListener(event,fn) self.listeners[event]=fn end
    for _,child in ipairs(spec.children or {}) do c.children[child.name]=control(child,c) end
    return c
end
local root=control({children=require('abyss_map_controls').controls})
local panel=root:GetChild('stage'):GetChild('mapPanel')
local function box(index)
    for _,group in pairs(panel.children) do if group.children['node'..index] then return group.children['node'..index] end end
end
local map=Map.generate(require('abyss_data'),42)
local calls=0
local ui=UI.new(root,map,function(node)calls=calls+1;return Map.choose(map,node.id)end,'click',{
    cursor={CursorDown='down',CursorUp='up',CursorEnter='enter',CursorExit='exit'},
    imageSource='static',color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end})
local function equalColor(actual,want)
    for _,key in ipairs({'r','g','b'}) do assert(actual[key]==want[key],'node icon state colour '..key) end
    assert(actual.a<=want.a and actual.a>=math.floor(want.a*.66),'STS oscillateColor alpha range')
end
local seen={}
local function verify()
    local view=Map.view(map)
    for index,node in ipairs(view.nodes) do
        local b=box(index)
        if b.visible then
            local state=node.id==view.currentNodeId and 'current' or node.visited and 'visited' or node.available and 'available' or 'locked'
            seen[state]=true
            for _,child in pairs(b.children) do
                assert(not child.visible or child.spec.kind~='image' or child.spec.name=='icon',
                    'route nodes must not repaint rings or background discs: '..child.spec.name)
            end
            local icon,hit=b:GetChild('icon'),b:GetChild('hit')
            assert(icon.image==Theme.icon.node[node.type],'existing official node icon ID retained')
            local palette=Theme.color.mapCanvas
            local expectedInk=node.hasEmeraldKey and Theme.color.positive
                or state=='visited' and palette.visited or state=='current' and Theme.color.node.current
                or state=='available' and Theme.color.node.pathTaken or node.type=='boss' and palette.kind.boss or palette.far
            if state=='locked' and not node.hasEmeraldKey and node.type~='boss' then
                local v=Theme.layout.map.presentation
                local alpha=math.floor(palette.far.a*(node.floor>view.floor+1 and v.farLockedOpacity or v.lockedOpacity)+.5)
                expectedInk={r=expectedInk.r,g=expectedInk.g,b=expectedInk.b,a=alpha}
                assert(icon.imageColor.a==alpha,'near/far disabled rooms retain the exact approved opacity')
            end
            equalColor(icon.imageColor,expectedInk)
            if state=="locked" and node.type~="boss" then assert(icon.imageColor.a<palette.far.a,'TASK-4.13 locked rooms recede') end
            if state=='visited' then assert(icon.imageColor.r==palette.visited.r,'TASK-4.13 visited rooms share gold path ink') end
            assert(not b:GetChild('positionToken'),'the circle is the sole position marker')
            local size=node.type=='boss' and Theme.layout.map.bossNode or Theme.layout.map.node
            local ring=b:GetChild('ring')
            local circled=state=='current' or state=='visited'
            assert(ring.visible==circled,'current and visited rooms have distinct ink circles')
            if circled then
                local ink=state=='current' and palette.currentRing or palette.visitedRing
                equalColor(ring:GetChild('outline').imageColor,ink)
                equalColor(ring:GetChild('brush').imageColor,ink)
            end
            -- STS MapRoomNode: glyph 128*scale, MAP_CIRCLE_5 192*(scale*.95+.2), rotated by room angle.
            local fx=ui.roomFx[node.id]
            assert(math.abs(icon.size[1]-size*Layout.sts.iconPerScale*UI.drawScale(fx))<1e-6,'STS glyph scale')
            if state=='available' and node.type~='boss' then assert(UI.drawScale(fx)<=Layout.sts.baseScale*Theme.layout.map.presentation.availableScaleCap+1e-9,'TASK-4.13 reachable pulse capped') end
            assert(math.abs(b:GetChild('ring').size[1]-size*Layout.sts.circlePerScale*(fx.scale*.95+.2))<1e-6,'STS circle scale')
            assert(b:GetChild('ring').localRotationZ==fx.angle,'STS circle angle')
            assert(fx.scale>=.5 and fx.scale<=1.25,'STS scale bounds')
            assert(hit.size[1]==size and hit.size[2]==size,'unpainted hit target stays full sized')
            local function inside(part,angle)
                if not part.visible then return end
                local x,y=table.unpack(b.position)
                local ox,oy=table.unpack(part.position or {0,0})
                local w,h=table.unpack(part.size or part.spec.size)
                local a=(angle or 0)*math.pi/180
                local rx=(math.abs(w*math.cos(a))+math.abs(h*math.sin(a)))/2
                local ry=(math.abs(w*math.sin(a))+math.abs(h*math.cos(a)))/2
                assert(y+oy-ry>=Layout.viewport.bottom-.00001 and y+oy+ry<=Layout.viewport.top+.00001,
                    'animated '..part.spec.name..' overhangs map viewport')
                assert(x+ox-rx>=Layout.viewport.left and x+ox+rx<=Layout.viewport.right,'map horizontal overhang')
            end
            inside(icon);inside(b:GetChild('ring'),fx.angle);inside(hit)
            local enabled=state=='available' and ui.navigationEnabled
            assert(hit.visible==enabled and not hit.canControllerFocus,'only legal destinations are visible to the pointer')
        else
            assert(not b:GetChild('hit').visible and not b:GetChild('hit').canControllerFocus,'offscreen hits stay disabled')
        end
    end
end
verify()
for _=1,12 do ui:update(.09);verify()end
local function legalHit()
    local id = Map.available(map)[1].id
    for index, node in ipairs(map.nodes) do
        if node.id == id then
            local hit = box(index):GetChild('hit')
            assert(hit.visible)
            return hit
        end
    end
    error('missing legal room target')
end
local function tap(hit, event)
    hit.listeners.down(event)
    hit.listeners.up(event)
    return hit.listeners.click(event)
end
local first, mouse = legalHit(), {}
assert(tap(first, mouse))
assert(calls==1 and map.floor==1)
verify()
for _=1,12 do ui:update(.09);verify()end
assert(box(1).visible and box(1):GetChild('ring').visible,
    'a temporarily culled current room must reappear after its ring settles')
assert(not first.listeners.click(mouse) and calls==1,'repeated mouse click must not advance again')
ui:setNavigationEnabled(true)
local second, touch = legalHit(), {touchId=7}
assert(tap(second, touch))
assert(calls==2 and map.floor==2)
verify()
ui:setNavigationEnabled(true)
-- Stable locked/current/visited rooms must not keep crossing the native painter
-- boundary every frame. A render still repaints after rebind/scroll/show.
for _=1,180 do ui:update(1/60)end
local paintRoom,staticPaints=UI.paintRoom,0
UI.paintRoom=function(fx)
    if fx.state~='available' then staticPaints=staticPaints+1 end
    return paintRoom(fx)
end
ui:update(1/60)
UI.paintRoom=paintRoom
assert(staticPaints==0,'settled static map rooms painted again in a stable update')
for _,invalid in ipairs({map.path[1],map.currentNodeId,'f16_l4','missing'}) do
    assert(not ui:choose(invalid) and calls==2 and map.floor==2,'illegal routes must not become selectable')
end
for offset=0,Layout.maxScroll,120 do ui:setScroll(offset);ui:update(.07);verify() end
ui:setVisible(false);ui:setVisible(true);ui:render();verify()
for _,state in ipairs({'current','visited','available','locked'}) do assert(seen[state],'missing real visual state '..state) end
local function notice()
    for _,group in pairs(panel.children) do if group.children.notice then return group.children.notice end end
end
ui:setNavigationEnabled(true);ui:render()
assert(notice().text=='' and not notice().visible,'normal routes do not show permanent input instructions')
ui.entryError='测试错误';ui:render()
assert(notice().text=='测试错误' and notice().visible,'real entry errors must remain visible')
ui.entryError=nil;ui:setNavigationEnabled(false)
assert(notice().text=='请先完成当前节点' and notice().visible,'blocked room state is necessary information')
ui:setNavigationEnabled(true);assert(notice().text=='' and not notice().visible,'resolved errors must not leave stale notices')
local bossMap=Map.generate(require('abyss_data'),42)
for _=1,16 do assert(Map.choose(bossMap,Map.available(bossMap)[1].id)) end
ui.map=bossMap;ui:render();ui:setNavigationEnabled(false)
assert(notice().text=='已抵达首领 · 请完成首领战斗与奖励' and notice().visible)
ui:setNavigationEnabled(true)
assert(notice().text=='首领奖励已处理 · 即将前往宝箱' and notice().visible,'the coordinator owns the automatic transition')
print('MAP_NOTICE_PASS no teaching; real errors, room locks and reward target retained')
print('MAP_NODE_VISUALS_PASS 4 states, official icons, hit areas, pointers and illegal routes')
return {root=root,map=map,ui=ui}
