-- Read Map.view/available, issue a synchronous choice command to the coordinator.
-- The coordinator owns Map.choose / Nodes.enter and resolving the chosen node.
-- No camp/shop/event/combat/run rules live in this module.
local Map = require("abyss_map")
local Theme = require("abyss_theme")
local MapLayout = require("abyss_map_layout")
local Acts = require("abyss_acts")
local Pointer = require('abyss_pointer_input')
local M = {}
-- MapRoomNode.render sizes: glyph 128*scale, MAP_CIRCLE_5 192*(scale*.95+.2).
-- TASK-4.13: STS breathes reachable glyphs .91..1.25 (up to 2.5x rest), which on
-- this 76px floor gap overlaps the current ring. Keep the STS rhythm but remap the
-- reachable glyph into [rest*1.1, rest*availableScaleCap] so pulses never collide.
function M.drawScale(fx)
    -- TASK-4.13 judge: current beacon reads by scale/tint only (no extra chrome).
    if fx.state == "current" then return fx.scale * 1.15 end
    if fx.state ~= "available" then
        local visual=Theme.layout.map.presentation
        return fx.scale*(fx.state=="locked" and (visual.lockedIconScale or 1)
            or fx.state=="visited" and (visual.visitedIconScale or 1) or 1)
    end
    local base, cap = MapLayout.sts.baseScale, Theme.layout.map.presentation.availableScaleCap
    local t = math.max(0, math.min(1, (fx.scale - .91) / (1.25 - .91)))
    local minimum=Theme.layout.map.presentation.availableScaleFloor or 1.1
    local scale=base * (minimum + (cap - minimum) * t)
    return fx.pressed and scale*.92 or fx.hovered and math.min(base*cap,scale*1.06) or scale
end
-- Track the last native writer, including pooled handles reused by another map/view.
-- Tokens have no control back-reference; weak keys do not retain retired handles.
local roomSizes=setmetatable({},{__mode='k'})
local function roomSize(fx,control,size)
    fx.sizeOwner=fx.sizeOwner or {}
    local painted=roomSizes[control]
    if painted and painted.owner==fx.sizeOwner and painted.size==size and control.alive~=false then return end
    local pending={};roomSizes[control]=pending
    local ok,result=pcall(control.SetSizeDelta,control,size,size)
    local current=roomSizes[control]==pending
    roomSizes[control]=nil
    if not ok then error(result,0)end
    -- Nested setters can complete in either order; retry an overlapping write.
    if result~=false and current then roomSizes[control]={owner=fx.sizeOwner,size=size} end
end
function M.paintRoom(fx)
    local icon, ring = fx.box:GetChild("icon"), fx.box:GetChild("ring")
    local iconSize = fx.size * MapLayout.sts.iconPerScale * M.drawScale(fx)
    roomSize(fx,icon,iconSize)
    -- oscillateColor drives color.a for reachable rooms.
    local ink = fx.ink
    if ink then icon.imageColor = fx.colour(ink.r, ink.g, ink.b, math.floor(ink.a * (fx.hovered and 1 or fx.alpha) + .5)) end
    local ringSize = fx.size * MapLayout.sts.circlePerScale * (fx.scale * .95 + .2)
    roomSize(fx,ring,ringSize)
end
-- Room ink by state: emerald > visited gold > locked faded > official type colour.
-- Rooms beyond the next row (and routes leaving the next row) are inactive decoration:
-- they may fade past the WCAG 1.4.11 floor, like STS DISABLED rooms/edges on parchment.
function M.isFar(floor, currentFloor)
    return type(floor) == "number" and type(currentFloor) == "number" and floor > currentFloor + 1
end
function M.pathWidth(taken, reachable)
    local v = Theme.layout.map.presentation
    return taken and v.takenPathWidth or reachable and MapLayout.lineWidth or v.lockedPathWidth
end
-- Presentation-only curve: monotone Y preserves viewport clipping; endpoints
-- and the route's narrow corridor stay fixed. Never touch the Run RNG.
function M.routePoint(x1,y1,x2,y2,t,seed)
    local bend=(seed%2==0 and 1 or -1)*(5+seed%6)
    local sway=math.sin(2*math.pi*t)*math.sin(math.pi*t)*(seed%3-1)
    return x1+(x2-x1)*t+bend*4*t*(1-t)+sway,y1+(y2-y1)*t
end
function M.roomInk(node, state, currentFloor)
    local palette = Theme.color.mapCanvas
    if node.hasEmeraldKey then return Theme.color.positive end
    if state == "visited" then return palette.visited end
    -- TASK-4.13: current is a steady warm-white beacon, never the breathing type ink of its options.
    if state == "current" then return Theme.color.node.current end
    if state == "locked" then
        local c = palette.far
        local v = Theme.layout.map.presentation
        local opacity = M.isFar(node.floor, currentFloor) and v.farLockedOpacity or v.lockedOpacity
        return { r = c.r, g = c.g, b = c.b, a = math.floor(c.a * opacity + .5) }
    end
    -- TASK-4.13 judge: next/available rooms speak one gold language (no lavender event ink).
    if state == "available" then return palette.available or Theme.color.node.pathTaken end
    return palette.kind[node.type]
end
local function finite(n) return type(n) == "number" and n == n and math.abs(n) < math.huge end
local function clamp(n, low, high) return math.max(low, math.min(high, n)) end
local function returnReveal(panel,colour)
    local paper=panel:GetChild('v25MapPaper')
    local background=paper or panel:GetChild('mapGroup1')
    local shade=background and background:GetChild('mapReturnShade')
    -- The V25 parchment is #929286. Start near #3F3F3A over its dark room backdrop.
    local initialAlpha=paper and 144 or 64
    local remaining,alpha,owner
    local function paint(value)
        if alpha==value then return end
        alpha=value
        shade.imageColor=colour(0,0,0,value)
    end
    local function cancel()
        if not remaining then return end
        remaining,alpha,owner=nil,nil,nil
        if shade.alive~=false then shade:SetVisible(false) end
    end
    local function start()
        if not shade or shade.alive==false then return false end
        local ticket={}
        owner,remaining=ticket,1
        paint(initialAlpha)
        if owner~=ticket then return false end
        shade:SetVisible(true)
        if not owner and shade.alive~=false then shade:SetVisible(false) end
        return owner==ticket
    end
    local function update(dt)
        if not remaining or dt<=0 then return end
        -- DungeonMap fades toward 1 with fadeLerpSnap. Track its complement.
        -- Limit unusually large frame deltas so the paper cannot flash to full.
        remaining=remaining*(1-12*math.min(dt,1/30))
        if remaining<.01 then cancel()
        else paint(math.floor(initialAlpha*remaining+.5)) end
    end
    return start,update,cancel
end
local function child(control, name) return assert(control:GetChild(name), "missing map UI control " .. name) end
-- Chapter metadata is presentation context, not permission to enter new content.
-- Legacy Act 1 intentionally has no act/firstFloor/terminalFloor fields.
local function chapterFor(map)
    if type(map) ~= "table" then return end
    local ok, chapter = pcall(Acts.get, map.act or 1)
    if not ok or not finite(map.floor) or map.floor % 1 ~= 0
        or map.floor < chapter.first - 1 or map.floor > chapter.last
        or type(map.sourceSignature) ~= "string" or map.sourceSignature == "" then return end
    if chapter.act == 1 then
        if map.version ~= 3 or map.act ~= nil or map.firstFloor ~= nil or map.terminalFloor ~= nil
            or map.sourceSignature:sub(1,7) ~= "map-v3:" then return end
    else
        local prefix = "map-v4:sts-a0-319009d5:" .. chapter.id .. ":"
        if map.version ~= 4 or map.firstFloor ~= chapter.first or map.terminalFloor ~= chapter.last
            or map.sourceSignature:sub(1,#prefix) ~= prefix then return end
    end
    if type(map.nodes) ~= "table" then return end
    for _, node in ipairs(map.nodes) do
        if type(node) ~= "table" or not finite(node.floor) or node.floor % 1 ~= 0 or node.floor < chapter.first or node.floor > chapter.last
            or node.localFloor ~= nil and node.localFloor ~= node.floor - chapter.first + 1 then return end
    end
    return chapter
end
local contextKeys = {"act", "version", "firstFloor", "terminalFloor", "sourceSignature", "seed", "runSeed", "mapSeed"}
local function sameContext(a, b)
    for _, key in ipairs(contextKeys) do
        if a[key] ~= b[key] then return false end
    end
    return true
end
local function entryContext(map)
    local context = {map=map,floor=map.floor,currentNodeId=map.currentNodeId,path=map.path,pathLength=#map.path}
    for _,key in ipairs(contextKeys) do context[key]=map[key] end
    return context
end
local function localFloor(map, floor) return floor - (map.firstFloor or 1) + 1 end
-- ===== Port of STS MapRoomNode update/render state (aeubanks/sts@319009d map/MapRoomNode.java) =====
local Sts = MapLayout.sts
local function roomState(node, currentNodeId)
    return node.id == currentNodeId and "current"
        or node.visited and "visited" or node.available and "available" or "locked"
end

local function routeInset(node, currentNodeId)
    local map = Theme.layout.map
    local size = node.type == "boss" and map.bossNode or map.node
    local state = roomState(node, currentNodeId)
    if state == "current" then
        return size * Sts.circlePerScale * (Sts.baseScale * .95 + .2) / 2, 0
    end
    -- Use the smallest visible glyph. As an available room breathes, the
    -- route stays attached underneath it without moving the route each frame.
    local scale = M.drawScale({state=state,scale=state=="available" and .91 or Sts.baseScale})
    return size * Sts.iconPerScale * scale * .45, node.hasEmeraldKey and map.emeraldIconY or 0
end

local function trimRoute(source, target, currentNodeId, dashed, x1,y1,x2,y2)
    local r1, r2
    if dashed then
        local offset1, offset2
        r1, offset1 = routeInset(source, currentNodeId)
        r2, offset2 = routeInset(target, currentNodeId)
        y1, y2 = y1 + offset1, y2 + offset2
    else
        -- The original single-line layout retains its MapEdge radii.
        local map = Theme.layout.map
        r1 = map.node * Sts.srcRadius
        r2 = target.type == "boss" and map.bossNode * Sts.bossRadius or map.node * Sts.dstRadius
    end
    local len = math.sqrt((x2 - x1)^2 + (y2 - y1)^2)
    local length = len - r1 - r2
    if length <= 0 then return end
    local ux, uy = (x2 - x1) / len, (y2 - y1) / len
    return length, x1 + ux*r1, y1 + uy*r1, x2 - ux*r2, y2 - uy*r2
end

-- MathHelper.scaleLerpSnap
local function scaleLerpSnap(value, target, dt)
    if value ~= target then
        value = value + (target - value) * math.min(1, dt * Sts.lerpSpeed)
        if math.abs(value - target) < Sts.snap then value = target end
    end
    return value
end
-- MapRoomNode fields `angle = random(360)` and `oscillateTimer = random(0, 6.28)`,
-- made deterministic per room so re-renders and replays are stable.
local function roomSeed(id)
    local h, text = 7, tostring(id)
    for i = 1, #text do h = (h * 31 + text:byte(i)) % 1000003 end
    return h
end
local function newRoomFx(id)
    local h = roomSeed(id)
    return { angle = h % 360, oscillateTimer = (h // 360 % 628) / 100.0, scale = Sts.baseScale, alpha = 1 }
end
-- MapRoomNode.oscillateColor (not taken branch)
local function oscillate(fx, dt)
    fx.oscillateTimer = fx.oscillateTimer + dt * Sts.oscillateRate
    fx.alpha = .66 + (math.cos(fx.oscillateTimer) + 1) / 6
    fx.scale = .25 + fx.alpha
end
-- Native clipping is not assumed: include the full animated glyph and rotated
-- ring, while preserving the original unpainted hit target.
function M.roomRadius(fx)
    local scale = fx.state == 'available' and Sts.baseScale * Theme.layout.map.presentation.availableScaleCap or math.max(Sts.baseScale,fx.scale)
    local iconRadius=fx.size*Sts.iconPerScale*scale/2
    local radius = math.max(fx.size/2,iconRadius+(fx.emerald and math.abs(Theme.layout.map.emeraldIconY)or 0))
    if fx.state == 'current' or fx.state == 'visited' then
        local angle = fx.angle*math.pi/180
        local ring = fx.size*Sts.circlePerScale*(scale*.95+.2)/2
        radius = math.max(radius,ring*(math.abs(math.cos(angle))+math.abs(math.sin(angle))))
    end
    if fx.state == 'current' then
        local visual=Theme.layout.map.presentation
        radius=math.max(radius,math.abs(visual.tokenOffset[1])+visual.tokenSize/2,math.abs(visual.tokenOffset[2])+visual.tokenSize/2)
    end
    if fx.emerald then
        local label=Theme.layout.map.emeraldLabel
        radius=math.max(radius,math.abs(label[1])+label[3]/2,math.abs(label[2])+label[4]/2)
    end
    return radius
end
local function roomVisible(fx,viewport)
    viewport=viewport or MapLayout.viewport
    local radius=M.roomRadius(fx)
    return fx.x-radius>=viewport.left and fx.x+radius<=viewport.right
        and fx.y-radius>=viewport.bottom and fx.y+radius<=viewport.top
end
M.stsScaleLerpSnap, M.stsOscillate, M.stsRoomFx = scaleLerpSnap, oscillate, newRoomFx
local function atStart(map) return map.floor == (map.firstFloor or 1) - 1 end

-- Standalone root holds mapBackdrop + stage/mapPanel from mapLayout(). With
-- options.embedded, root is the host's mapPanel and the host alone scales stage.
-- options may supply color(r,g,b,a) and imageSource; client defaults otherwise.
-- options.cursor (the platform cursor event enum) enables drag-to-scroll.
-- Host OnStart calls resize(game.GetUICanvasSize()), OnUpdate calls update(dt).
-- Host wheel deltas may call scrollBy(baseCanvasPixels).
function M.new(root, map, onChoose, clickEvent, options)
    assert(type(onChoose) == "function", "map UI requires onChoose callback")
    options = options or {}
    -- Per-host viewport: mobile HUD geometry must not mutate the PC layout.
    local Layout=setmetatable({},{__index=MapLayout})
    if options.hudTop then
        local bounds=Layout.viewport
        Layout.viewport={left=bounds.left,right=bounds.right,bottom=bounds.bottom,top=math.min(bounds.top,options.hudTop)}
    end
    local function available(owner)return options.available and options.available(owner)or Map.available(owner)end
    local function mapView(owner)
        local v=Map.view(owner);local enabled={}
        for _,node in ipairs(available(owner))do enabled[node.id]=true end
        for _,node in ipairs(v.nodes)do node.available=enabled[node.id]==true end
        return v
    end
    local function inputCovered()return options.inputCovered and options.inputCovered()end
    local colour = options.color or Color
    local imageSource = options.imageSource or (Enum and Enum.ImageSource.StaticReference)
    -- Platform Color has static methods and can be a callable table/userdata.
    -- Requiring a plain Lua function aborts the entire host before input binds.
    assert(colour ~= nil and imageSource ~= nil, "map UI needs client Color and imageSource")
    local embedded = options.embedded == true
    local stage, backdrop, panel
    if embedded then stage, panel = root, root
    else
        stage, backdrop = child(root, "stage"), child(root, "mapBackdrop")
        panel = child(stage, "mapPanel")
    end
    -- The title host binds real owners only after Start succeeds.
    if map ~= nil then assert(chapterFor(map), "invalid map chapter context") end
    local view = map and mapView(map)
    local self = { root = root, map = map, visible = map ~= nil, navigationEnabled = view and atStart(view) or false,
        scroll = 0, slots = {}, time = 0, breathing = {}, roomFx = {}, stage = stage, panel = panel,
        embedded = embedded, scale = 1, observedMap = map, observedContext = view,
        observedNodeId = view and view.currentNodeId, observedFloor = view and view.floor }
    local updateReturnReveal
    self.startReturnReveal,updateReturnReveal,self.cancelReturnReveal=returnReveal(panel,colour)
    local drag, released, pointerObserved, scrollAnimation
    local function cancelSelection()
        if drag then drag.selection = nil end
        released = nil
    end
    local function cancelDrag()
        if drag then self.dragged = true end
        cancelSelection()
        drag = nil
        scrollAnimation = nil
        for _,fx in ipairs(self.activeFx or {})do
            if fx.hovered or fx.pressed then
                fx.hovered,fx.pressed=false,false
                if fx.visible then M.paintRoom(fx)end
            end
        end
    end
    local controlCache = {}
    -- Reuse positive group lookups while binding the imported controls.
    local initialGroups = {}
    local function at(name)
        if controlCache[name] then return controlCache[name] end
        local i = 1
        while true do
            local group = initialGroups and initialGroups[i]
            if not group then
                group = panel:GetChild("mapGroup" .. i)
                if initialGroups then initialGroups[i] = group end
            end
            if not group then break end
            local found = group:GetChild(name)
            if found then controlCache[name] = found return found end
            i = i + 1
        end
        error("missing map UI control " .. name)
    end
    local function tint(control, c) control.imageColor = colour(c.r, c.g, c.b, c.a) end
    local function pathColour(ink, opacity)
        return colour(ink.r, ink.g, ink.b, math.floor(ink.a * opacity))
    end
    local visual = Theme.layout.map.presentation
    -- STS MapEdge/MapRoomNode contract: taken ink, reachable bright, unreachable recessive.
    local pathColours = {
        taken = pathColour(Theme.color.node.pathTaken, visual.takenOpacity),
        next = pathColour(Theme.color.node.reachable, visual.nextOpacity),
        future = pathColour(Theme.color.node.path, visual.futureOpacity),
        far = pathColour(Theme.color.node.path, visual.farFutureOpacity),
    }
    local function bind(name, fn)
        local hit=child(at(name),"hit")
        hit:AddCursorEventListener(clickEvent,function(event)
            if inputCovered() or Pointer.blocked(options)then return false end
            return fn(event)
        end)
    end
    local function position(node)
        return (node.lane - (Layout.lanes + 1) / 2) * Theme.layout.map.columnGap,
            Layout.firstY + (localFloor(self.map, node.floor) - 1) * Theme.layout.map.floorGap - self.scroll
    end
    local function observeMap(current)
        if self.map == self.observedMap and sameContext(current,self.observedContext) then return false end
        cancelDrag()
        -- A restarted run can share floor/node ids with the previous run. Identity
        -- resets its presentation and default gate before the host grants access.
        self.observedMap, self.observedContext = self.map, current
        self.entryError=nil
        self.observedNodeId, self.observedFloor = current.currentNodeId, current.floor
        self.navigationEnabled, self.time = atStart(current), 0
        self.scroll = clamp(Layout.firstY + (math.max(1, localFloor(current, current.floor)) - 1) *
            Theme.layout.map.floorGap - Layout.focusY, 0, Layout.maxScroll)
        return true
    end
    local function paintRouteDashes(control, firstDash, sourceId, targetId, route, width, ink)
        local seed=0
        local identity=tostring(sourceId)..':'..tostring(targetId)
        for i=1,#identity do seed=(seed*31+identity:byte(i))%997 end
        local ux,uy=(route.x2-route.x1)/route.length,(route.y2-route.y1)/route.length
        -- Keep spacing consistent on short routes and anchor a dash at
        -- each end. Clip the resulting pattern without shifting it.
        local count=clamp(math.floor(route.length/12),1,8)
        local intervals=count-.32
        for i=1,8 do
            local dash=i==1 and firstDash or child(control,'routeInk'..i)
            local first,last=math.max(route.a,(i-1)/intervals),math.min(route.b,(i-.32)/intervals)
            dash:SetVisible(last>first)
            if last>first then
                local sx,sy=M.routePoint(route.x1,route.y1,route.x2,route.y2,first,seed)
                local ex,ey=M.routePoint(route.x1,route.y1,route.x2,route.y2,last,seed)
                local cx,cy=(sx+ex)/2-route.x,(sy+ey)/2-route.y
                dash:SetAnchoredPosition(cx*ux+cy*uy,-cx*uy+cy*ux)
                dash:SetSizeDelta(math.sqrt((ex-sx)^2+(ey-sy)^2),width)
                dash.localRotationZ=math.atan(ey-sy,ex-sx)*180/math.pi-control.localRotationZ
                dash.imageColor=ink
            end
        end
    end

    local function line(control, source, target, taken, reachable, far, currentNodeId)
        local x1, y1 = position(source)
        local x2, y2 = position(target)
        local padding = math.abs(Theme.layout.map.emeraldIconY)
        if y2 + padding < Layout.viewport.bottom or y1 - padding > Layout.viewport.top then control:SetVisible(false) return end
        local firstDash = control:GetChild('routeInk1')
        local fullLength
        fullLength, x1, y1, x2, y2 = trimRoute(source,target,currentNodeId,firstDash,x1,y1,x2,y2)
        if not fullLength then control:SetVisible(false) return end
        -- Clip real graph segments to viewport, with half-stroke padding.
        -- TASK-4.13: walked > reachable > unreachable stroke weights (STS taken/available/disabled).
        local width = M.pathWidth(taken, reachable)
        local low, high = Layout.viewport.bottom + width / 2, Layout.viewport.top - width / 2
        if y2 < low or y1 > high then control:SetVisible(false) return end
        local a, b = clamp((low - y1) / (y2 - y1), 0, 1), clamp((high - y1) / (y2 - y1), 0, 1)
        local ax, ay = x1 + (x2 - x1) * a, y1 + (y2 - y1) * a
        local bx, by = x1 + (x2 - x1) * b, y1 + (y2 - y1) * b
        local dx, dy = bx - ax, by - ay
        if dy <= 0 then control:SetVisible(false) return end
        local x,y=(ax+bx)/2,(ay+by)/2
        control:SetVisible(true)
        control:SetAnchoredPosition(x,y)
        -- TASK-4.13: walked routes are heavier than reachable ones (STS taken edges read first).
        control:SetSizeDelta(math.sqrt(dx * dx + dy * dy), width)
        control.localRotationZ = math.atan(dy, dx) * 180 / math.pi
        local ink=taken and pathColours.taken or reachable and pathColours.next or far and pathColours.far or pathColours.future
        if firstDash then
            paintRouteDashes(control,firstDash,source.id,target.id,
                {x1=x1,y1=y1,x2=x2,y2=y2,length=fullLength,a=a,b=b,x=x,y=y},width,ink)
        else control.imageColor=ink end
    end
    function self.render(_)
        if not self.map then return false, "map_unbound" end
        local context = chapterFor(self.map)
        if not context then
            cancelDrag()
            self.navigationEnabled, self.slots, self.breathing = false, {}, {}
            at("title").text, at("notice").text = "", "地图章节信息无效 · 请重新启程"
            at("notice"):SetVisible(true)
            for i = 1, Layout.maxNodes do at("node" .. i):SetVisible(false) end
            for i = 1, Layout.maxEdges do at("edge" .. i):SetVisible(false) end
            return
        end
        local current, nodes, taken = mapView(self.map), {}, {}
        observeMap(current)
        if current.currentNodeId ~= self.observedNodeId or current.floor ~= self.observedFloor then
            cancelDrag()
            self.navigationEnabled = false
        end
        self.observedNodeId, self.observedFloor = current.currentNodeId, current.floor
        for _, node in ipairs(current.nodes) do nodes[node.id] = node end
        for i = 1, #current.path - 1 do taken[current.path[i] .. ":" .. current.path[i + 1]] = true end
        self.slots, self.breathing = {}, {}
        local chapter = Acts.get(current.act or 1)
        local terminal = chapter.terminal == 'boss_treasure' and "已抵达首领宝箱 · 请完成当前房间"
            or current.act == 4 and "已抵达终幕首领 · 请完成最终战斗与结算"
            or "已抵达终点 · 请完成当前房间"
        at("title").text = Theme.presentationProfile=='official-assets-first' and tostring(current.floor)
            or chapter.name .. " · 第 " .. current.floor .. " 层"
        at("notice").text = self.entryError or (current.complete and terminal or
            (current.floor == chapter.boss and (self.navigationEnabled
                and (chapter.terminal == 'boss_treasure' and "首领奖励已处理 · 请选择首领宝箱" or "首领奖励已处理 · 请前往终点")
                or "已抵达首领 · 请完成首领战斗与奖励") or
            (self.navigationEnabled and "" or "请先完成当前节点")
            ))
        local notice=current.emeraldSelection and Theme.layout.map.emeraldNotice or Theme.layout.map.notice
        at('notice'):SetAnchoredPosition(notice[1],notice[2]);at('notice'):SetSizeDelta(notice[3],Theme.layout.map.presentation.noticeHeight)
        if current.emeraldSelection then
            local prefix=at('notice').text~='' and at('notice').text..' · ' or ''
            at('notice').text=prefix..'绿字节点为燃烧精英，胜利可另领绿钥匙'
        end
        at('notice'):SetVisible(at('notice').text~='')
        local edge = 0
        for _, node in ipairs(current.nodes) do for _, id in ipairs(node.nextIds) do
            edge = edge + 1
            assert(edge <= Layout.maxEdges, "map UI edge capacity exceeded")
            local target = assert(nodes[id], "map UI dangling route")
            line(at("edge" .. edge), node, target, taken[node.id .. ":" .. id], node.id == current.currentNodeId and target.available,
                M.isFar(target.floor, current.floor), current.currentNodeId)
        end end
        for i = edge + 1, Layout.maxEdges do at("edge" .. i):SetVisible(false) end
        assert(#current.nodes <= Layout.maxNodes, "map UI node capacity exceeded")
        self.activeFx = {}
        for i = 1, Layout.maxNodes do
            local box, node = at("node" .. i), current.nodes[i]
            local visible = false
            if node then
                local size = node.type == "boss" and Theme.layout.map.bossNode or Theme.layout.map.node
                local x, y = position(node)
                local state = roomState(node, current.currentNodeId)
                local fx = self.roomFx[node.id] or newRoomFx(node.id)
                self.roomFx[node.id] = fx
                -- A newly selected room adds a rotated ring. Retire its reachable
                -- pulse first so focus never culls that ring at the first row.
                if state == "current" and fx.state ~= state then fx.scale = Sts.baseScale end
                fx.state,fx.size,fx.box,fx.x,fx.y,fx.emerald=state,size,box,x,y,node.hasEmeraldKey
                fx.hovered,fx.pressed=false,false
                visible=roomVisible(fx,Layout.viewport);fx.visible=visible
                -- Hidden transitions still lerp to rest; otherwise a temporarily
                -- oversized current ring could remain culled forever.
                self.activeFx[#self.activeFx+1]=fx
                child(box, "positionToken"):SetVisible(state == "current")
                -- Hidden rows have no slots or focus targets. Avoid rewriting
                -- every child of all 17 floors during each pan animation frame.
                if visible then
                box:SetAnchoredPosition(x, y)
                box:SetSizeDelta(size, size)
                box.localScaleX, box.localScaleY = 1, 1
                local icon = child(box, "icon")
                if state ~= "available" then fx.alpha = 1 end
                local ring = child(box, "ring")
                -- render(): circle when taken, or current after the first room was chosen.
                -- TASK-4.13 (Pan t95u): the walked path already links visited rooms, so only the
                -- current room keeps a ring, and it is a soft translucent halo of the old circle.
                ring:SetVisible(state == "current")
                ring.localRotationZ = fx.angle
                -- TASK-4.13: visited rings sink to trail gold so the current ring is the only bright one.
                tint(ring, Theme.color.mapCanvas.currentRing)
                local iconId = assert(Theme.icon.node[node.type], "missing node icon")
                icon:SetImage(imageSource, iconId)
                -- color: NOT_TAKEN for locked rooms, AVAILABLE ink for taken/current/available.
                fx.colour = colour
                -- TASK-4.13: on the dark canvas, taken rooms share the gold path ink and
                -- unreachable rooms recede by opacity, so current/visited/next read at a glance.
                fx.ink = M.roomInk(node, state, current.floor)
                M.paintRoom(fx)
                icon:SetAnchoredPosition(0,node.hasEmeraldKey and Theme.layout.map.emeraldIconY or 0)
                child(box,'emeraldLabel'):SetVisible(node.hasEmeraldKey==true)
                local hit = child(box, "hit")
                hit:SetSizeDelta(size, size)
                local clickable = visible and state == "available" and self.navigationEnabled
                    and not self.choosing and not scrollAnimation
                hit:SetVisible(clickable)
                if visible then self.slots[i] = node.id end
                if clickable then self.breathing[#self.breathing + 1] = box end
                else
                    child(box, 'hit'):SetVisible(false)
                end
            end
            box:SetVisible(visible)
        end
        self:update(0)
    end
    function self.resize(_, width, height)
        if not finite(width) or not finite(height) or width <= 0 or height <= 0 then return false, "invalid_canvas" end
        cancelDrag()
        self.canvasWidth, self.canvasHeight = width, height
        if embedded then self.scale = 1 return true end
        local scale = math.min(width / Theme.canvas.base[1], height / Theme.canvas.base[2])
        stage.localScaleX, stage.localScaleY = scale, scale
        backdrop:SetSizeDelta(width, height)
        self.scale = scale
        return true
    end
    function self.update(_, dt)
        if not finite(dt) or dt < 0 then return false, "invalid_delta" end
        if not self.visible then return true end
        updateReturnReveal(dt)
        if not chapterFor(self.map) or self.map ~= self.observedMap or not sameContext(self.map,self.observedContext) then
            self:render()
            return true
        end
        self.time = (self.time + dt) % Layout.breathSeconds
        if scrollAnimation and dt > 0 then
            -- A coordinator may replace/advance the map before the next render.
            if self.map ~= self.observedMap or self.map.floor ~= self.observedFloor
                or self.map.currentNodeId ~= self.observedNodeId then
                cancelDrag()
            else
                scrollAnimation.elapsed = scrollAnimation.elapsed + dt
                local t = clamp(scrollAnimation.elapsed / Layout.scrollSeconds,0,1)
                local from, target = scrollAnimation.from, scrollAnimation.target
                self.scroll = clamp(from + (target - from) * (1 - (1 - t)^3),0,Layout.maxScroll)
                if t == 1 then self.scroll, scrollAnimation = target, nil end
            end
            -- render's update(0) only paints breathing; it cannot advance/recurse.
            self:render()
            return true
        end
        -- MapRoomNode.update: reachable rooms oscillate; all others lerp-snap to 0.5.
        local visibilityChanged=false
        for _, fx in ipairs(self.activeFx or {}) do
            do
                local previousScale=fx.scale
                if fx.state == "available" and not self.reducedMotion then oscillate(fx, dt)
                elseif fx.state == "available" then fx.alpha, fx.scale = 1, .91
                else fx.scale = scaleLerpSnap(fx.scale, Sts.baseScale, dt) end
                -- Static rooms have no animation after the lerp snaps. A full
                -- render still owns repaint after scroll/show/rebind. Avoid
                -- resubmitting their unchanged colour on every stable frame.
                if fx.visible and (fx.state=="available" or fx.scale~=previousScale) then M.paintRoom(fx)end
                if dt>0 and roomVisible(fx,Layout.viewport)~=fx.visible then visibilityChanged=true end
            end
        end
        if visibilityChanged then self:render()end
        return true
    end
    function self.setReducedMotion(_, value)
        assert(type(value) == "boolean", "reduced motion must be boolean")
        self.reducedMotion = value
        if value and scrollAnimation then return self:setScroll(scrollAnimation.target) end
        self:update(0)
    end
    function self.setScroll(_, value, deferRender)
        if not finite(value) then return false, "invalid_scroll" end
        value = clamp(value, 0, Layout.maxScroll)
        if value ~= self.scroll or scrollAnimation then cancelSelection() end
        scrollAnimation = nil
        self.scroll = value
        if not deferRender then self:render() end
        return true
    end
    local function animateScrollTo(value)
        if not self.visible then return false,"map_hidden" end
        value = clamp(value,0,Layout.maxScroll)
        if scrollAnimation and scrollAnimation.target == value then return true end
        cancelDrag()
        if value == self.scroll or self.reducedMotion then return self:setScroll(value) end
        scrollAnimation = {from=self.scroll,target=value,elapsed=0}
        self:render()
        return true
    end
    function self.scrollBy(_, delta)
        if not self.visible then return false, "map_hidden" end
        if not finite(delta) then return false, "invalid_scroll" end
        return self:setScroll(self.scroll + delta)
    end
    function self.focusCurrent(_, animated, deferRender)
        if not self.map then return false, "map_unbound" end
        if not chapterFor(self.map) then
            if not deferRender then self:render() end
            return false,"invalid_map_context"
        end
        local current = entryContext(self.map)
        observeMap(current)
        local target = Layout.firstY + (math.max(1,localFloor(current,current.floor)) - 1) * Theme.layout.map.floorGap - Layout.focusY
        if animated then return animateScrollTo(target) end
        return self:setScroll(target, deferRender)
    end
    function self.setNavigationEnabled(_, enabled, retainBackdrop)
        if not self.map then return false, "map_unbound" end
        assert(type(enabled) == "boolean", "navigation enabled must be boolean")
        if not enabled then
            cancelDrag()
            -- A covering deck already gates all map input and retains the map's
            -- drawing. Repaint the navigation state when the map is uncovered.
            if retainBackdrop and not self.visible then self.navigationEnabled=false;return end
        end
        -- An explicit coordinator grant acknowledges any external map advance.
        if not chapterFor(self.map) then self:render() return false,"invalid_map_context" end
        local current = entryContext(self.map)
        observeMap(current)
        self.observedNodeId, self.observedFloor = current.currentNodeId, current.floor
        self.navigationEnabled = enabled self:render()
    end
    local function atPaintedPosition()
        return self.map==self.observedMap and sameContext(self.map,self.observedContext)
            and self.map.floor==self.observedFloor and self.map.currentNodeId==self.observedNodeId
    end
    function self.setVisible(_, visible, retainPage, retainPosition, renderByHost)
        assert(type(visible) == "boolean", "map visibility must be boolean")
        if visible and not self.map then return false, "map_unbound" end
        if not visible then cancelDrag();self:cancelReturnReveal() end
        -- A modal suspends navigation but retains its already mounted backdrop.
        self.visible = visible root:SetVisible(visible or retainPage==true)
        if visible and not (retainPosition and atPaintedPosition()) then self:focusCurrent(false, renderByHost) end
    end
    function self.matchesEntryContext(_,context)
        local current = self.map
        return current==context.map and sameContext(current,context) and current.floor==context.floor
            and current.currentNodeId==context.currentNodeId and current.path==context.path and #current.path==context.pathLength
    end
    function self.showEntryFailure(_,failure)
        local messages={event_pool_exhausted='受限事件池已用尽，或剩余事件条件不足；请选择其他路线或重新启程。',
            event_not_implemented='此事件尚未实现；请选择其他路线。',combat_unavailable='此层没有可用遭遇；请选择其他路线。'}
        self.entryError=messages[failure] or '暂时无法进入，请完成当前操作后重试。'
        self:render()
    end
    function self.choose(_, nodeId)
        if inputCovered() then return false, "navigation_disabled" end
        if not self.map then return false, "map_unbound" end
        if not chapterFor(self.map) then self:render() return false,"invalid_map_context" end
        local beforeMap = self.map
        local before = entryContext(beforeMap)
        if observeMap(before) then self:render() end
        if not self.visible or not self.navigationEnabled or self.choosing then return false, "navigation_disabled" end
        if before.floor == (before.terminalFloor or 17) then return false, "map_complete" end
        if type(nodeId) ~= "string" then return false, "invalid_node" end
        local selected
        for _, node in ipairs(available(beforeMap)) do if node.id == nodeId then selected = node break end end
        if not selected then
            for _, node in ipairs(beforeMap.nodes) do if node.id == nodeId then return false, "node_unavailable" end end
            return false, "invalid_node"
        end
        local expectedFloor = selected.floor
        self.choosing = true
        local called, accepted, reason = pcall(onChoose, selected, before)
        self.choosing = false
        if called and accepted=='selection_pending' and inputCovered() then
            self.entryError=nil
            cancelDrag()
            return true,accepted,reason
        end
        if not chapterFor(self.map) then self:render() return false,"invalid_map_context" end
        local after = self.map
        local sameMap = after == beforeMap and sameContext(after,before)
        local changed = not sameMap or after.floor ~= before.floor or after.currentNodeId ~= before.currentNodeId
        local committed = sameMap and after.currentNodeId == nodeId and after.floor == expectedFloor
        if called and accepted == true then self.entryError = nil end
        if changed or committed and called and accepted == true then
            if self.visible and not sameMap then observeMap(entryContext(after)) end
            self.navigationEnabled = false
            -- Recenter when the Host shows the map again, or once now for a
            -- standalone map that stayed visible after the choice.
            if self.visible then self:focusCurrent() end
        end
        if not called or accepted~=true then
            local failure=called and (reason or 'choice_rejected') or 'choice_callback_error'
            self:showEntryFailure(failure)
            return false,failure
        end
        if not committed then return false, "selection_not_committed" end
        return true
    end
    -- Dragging the route scrolls it with the finger. A press that moved past the
    -- threshold is a scroll, never a node choice, even if it ends on a node.
    local cursor = options.cursor
    local pointerInput = cursor and cursor.CursorDown and cursor.CursorUp
    local function touch(event) return event and event.touchId end
    local function selectionFor(slot, event)
        if not slot or not self.visible or not self.navigationEnabled then return end
        local nodeId = self.slots[slot]
        for _, node in ipairs(available(self.map)) do
            if node.id == nodeId then
                return {slot=slot, nodeId=nodeId, map=self.map, floor=self.map.floor,
                    currentNodeId=self.map.currentNodeId, context=self.observedContext, touch=touch(event)}
            end
        end
    end
    local function validSelection(selection, slot)
        return selection and chapterFor(self.map) ~= nil and selection.slot == slot and selection.map == self.map
            and sameContext(selection.context,self.map)
            and selection.floor == self.map.floor and selection.currentNodeId == self.map.currentNodeId
            and selection.nodeId == self.slots[slot] and self.visible and self.navigationEnabled
    end
    local function point(event)
        if not event or type(event.GetUIPos) ~= "function" then return end
        local x, y = event:GetUIPos()
        if type(y) ~= "number" or not finite(y) then return end
        local width, height = self.canvasWidth or Theme.canvas.base[1], self.canvasHeight or Theme.canvas.base[2]
        local scale = math.min(width / Theme.canvas.base[1], height / Theme.canvas.base[2])
        return finite(x) and x / scale or nil, y / scale
    end
    local function press(event, slot)
        pointerObserved = true
        -- Down is idempotent until the owner releases or is cancelled. A repeated
        -- callback cannot rearm a selection that already exited or began scrolling.
        if inputCovered() or not self.visible or not self.map then return end
        if not chapterFor(self.map) then self:render() return end
        if observeMap(entryContext(self.map)) then self:render() end
        if drag then
            -- A same-owner node Down can retire an abandoned background drag.
            -- Background has no node selection to steal; its delayed Up cannot
            -- release this node slot. Node-to-node ownership stays exclusive.
            if drag.touch == nil or drag.touch ~= touch(event) or drag.slot ~= nil or slot == nil then return end
            cancelDrag()
        end
        cancelSelection()
        self.dragged = false
        local x, y = point(event)
        local wasAnimating = scrollAnimation ~= nil
        scrollAnimation = nil
        -- Position is optional for a tap. Ownership must still work on hosts
        -- that supply Down/Up but omit drag events or pointer coordinates.
        drag = {touch=touch(event), startX=x, startY=y, y=y,
            selection=not wasAnimating and selectionFor(slot,event) or nil, slot=slot}
        if wasAnimating then self:render() end
    end
    local function move(event, slot)
        if not self.visible then cancelDrag() return end
        if not drag or touch(event) ~= drag.touch or slot ~= drag.slot then return end
        local x, y = point(event)
        if not y or not drag.startY then return end
        local dx = x and drag.startX and x - drag.startX or 0
        if not drag.moving and dx^2 + (y - drag.startY)^2 < Layout.dragThreshold^2 then return end
        drag.moving, self.dragged = true, true
        -- UI y grows upward; content follows the finger, so scroll moves the other way.
        local delta = y - drag.y
        drag.y = y
        -- Rendering may observe a replaced/advanced map and cancel this drag.
        self:setScroll(self.scroll - delta)
    end
    local function release(event, slot)
        if not drag or touch(event) ~= drag.touch or slot ~= drag.slot then return end
        move(event, slot)
        if drag and not drag.moving and validSelection(drag.selection, slot) then
            released = drag.selection
        end
        drag = nil
    end
    local function cancelPointer(event, slot, terminal)
        if released and touch(event) == released.touch and slot == released.slot then released = nil end
        if drag and touch(event) == drag.touch and slot == drag.slot then
            drag.selection = nil
            if terminal then cancelDrag() end
        end
    end
    local function draggable(control, slot)
        if not pointerInput then return end
        local function feedback(hovered,pressed)
            local id=slot and self.slots[slot]
            local fx=id and self.roomFx[id]
            if fx and fx.visible and fx.state=='available' and self.navigationEnabled then
                fx.hovered,fx.pressed=hovered,pressed;M.paintRoom(fx)
            end
        end
        local function feedbackOwned(event)
            return not drag or touch(event)==drag.touch and slot==drag.slot
        end
        if cursor.CursorEnter then control:AddCursorEventListener(cursor.CursorEnter,function()
            if not drag then feedback(true,false)end
        end)end
        control:AddCursorEventListener(cursor.CursorDown, function(event)
            press(event, slot)
            if drag and feedbackOwned(event) and drag.slot==slot then feedback(false,true)end
        end)
        if cursor.CursorDrag then control:AddCursorEventListener(cursor.CursorDrag, function(event) move(event, slot) end) end
        control:AddCursorEventListener(cursor.CursorUp, function(event)
            local owns=feedbackOwned(event);release(event, slot);if owns then feedback(false,false)end
        end)
        if cursor.CursorExit then control:AddCursorEventListener(cursor.CursorExit, function(event)
            local owns=feedbackOwned(event);cancelPointer(event, slot);if owns then feedback(false,false)end
        end) end
        if cursor.CursorEndDrag then control:AddCursorEventListener(cursor.CursorEndDrag, function(event)
            local owns=feedbackOwned(event);cancelPointer(event, slot, true);if owns then feedback(false,false)end
        end) end
    end
    if options.hudTop then
        local v=Layout.viewport
        at('dragArea'):SetAnchoredPosition((v.left+v.right)/2,(v.bottom+v.top)/2)
        at('dragArea'):SetSizeDelta(v.right-v.left,v.top-v.bottom)
    end
    draggable(at("dragArea"))
    for i = 1, Layout.maxNodes do local slot = i bind("node" .. slot, function(event)
        if scrollAnimation then return false,"map_scrolling" end
        if pointerInput and (pointerObserved or touch(event) ~= nil) then
            -- Up grants only its original map/node one Click. A foreign callback
            -- cannot consume that grant or borrow a newer active gesture.
            local selection = released
            if drag or not selection or touch(event) ~= nil and touch(event) ~= selection.touch then
                return false, "stale_gesture"
            end
            if selection.slot ~= slot then return false, "stale_gesture" end
            released = nil
            if not validSelection(selection, slot) then return false, "stale_gesture" end
            return self:choose(selection.nodeId)
        end
        -- Click-only/accessibility hosts retain the existing intentional click path.
        if self.dragged then self.dragged = false return false, "dragged" end
        if self.slots[slot] then return self:choose(self.slots[slot]) end
        return false, "node_outside_viewport"
    end) draggable(child(at("node" .. slot), "hit"), slot) end
    self:resize(Theme.canvas.base[1], Theme.canvas.base[2])
    if map then self:focusCurrent() else root:SetVisible(false) end
    initialGroups = nil
    return self
end
return M
