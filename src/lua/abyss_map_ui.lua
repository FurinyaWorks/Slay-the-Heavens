-- Read Map.view/available, issue a synchronous choice command to the coordinator.
-- The coordinator owns Map.choose / Nodes.enter and resolving the chosen node.
-- No camp/shop/event/combat/run rules live in this module.
local Map = require("abyss_map")
local Theme = require("abyss_theme")
local MapLayout = require("abyss_map_layout")
local Acts = require("abyss_acts")
local Pointer = require('abyss_pointer_input')
local Viewport = require('abyss_viewport')
local M = {}
-- MapRoomNode.render sizes: glyph 128*scale, MAP_CIRCLE_5 192*(scale*.95+.2).
function M.drawScale(fx)
    if fx.boss then
        if fx.pressed then return .50 end
        if fx.hovered then return .58 end
        return fx.state == 'available' and .53 + .02 * fx.alpha or .55
    end
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
    return fx.pressed and scale*.92 or fx.hovered and base*cap*1.06 or scale
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
    local ring = fx.fittedRing or fx.box:GetChild("ring")
    if fx.fittedRing and fx.state~='current' and fx.state~='visited' then return end
    if not fx.fittedRing then
        local icon = fx.box:GetChild("icon")
        local iconSize = fx.size * MapLayout.sts.iconPerScale * M.drawScale(fx)
        roomSize(fx,icon,iconSize)
        -- oscillateColor drives color.a for reachable rooms.
        local ink = fx.ink
        if ink then
            local alpha = fx.boss or fx.hovered or fx.pressed
            icon.imageColor = fx.colour(ink.r, ink.g, ink.b, math.floor(ink.a * (alpha and 1 or .82 + .18 * fx.alpha) + .5))
        end
    end
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
-- STS MapEdge/MapDot: sample the centreline from the destination back,
-- with a fixed phase and small deterministic jitter on interior strokes.
function M.bossRouteDashes(x1,y1,x2,y2,seed)
    local style=MapLayout.bossRoute
    local dx,dy=x1-x2,y1-y2
    local length=math.sqrt(dx*dx+dy*dy)
    local first=style.bossReserve+style.pitch*(seed%101)/200
    local count=1+math.floor((length-style.sourceReserve-first)/style.pitch)
    local dashes={}
    local slope=math.atan(-dy,-dx)
    for i=1,count do
        local distance=first+(i-1)*style.pitch
        local x,y=x2+dx*distance/length,y2+dy*distance/length
        local angle=slope
        if i>1 and i<count then
            seed=(seed*31+17)%997
            local offset=(seed%11-5)*.25
            x,y=x-dy/length*offset,y+dx/length*offset
            angle=angle+(seed%19-9)*math.pi/180
        end
        local half=style.length/2
        dashes[i]={x=x,y=y,dx=half*math.cos(angle),dy=half*math.sin(angle),angle=angle*180/math.pi}
    end
    return dashes
end
-- Clip the straight dash chords in the existing world-to-viewport transform.
function M.clipBossDash(x1,y1,x2,y2,left,bottom,right,top)
    local first,last=0,1
    local function clip(v,d,lo,hi)
        if math.abs(d)<1e-9 then return v>=lo and v<=hi end
        local a,b=(lo-v)/d,(hi-v)/d
        if a>b then a,b=b,a end
        first,last=math.max(first,a),math.min(last,b)
        return last>first
    end
    local dx,dy=x2-x1,y2-y1
    if not clip(x1,dx,left,right) or not clip(y1,dy,bottom,top) then return end
    return x1+first*dx,y1+first*dy,x1+last*dx,y1+last*dy
end
local function visibleBossDash(mark,scroll,v,margin)
    local x,y=mark.x,mark.y-scroll
    local x1,y1,x2,y2=x-mark.dx,y-mark.dy,x+mark.dx,y+mark.dy
    local left,bottom,right,top=v.left+margin,v.bottom+margin,v.right-margin,v.top-margin
    local minX,maxX=math.min(x1,x2),math.max(x1,x2)
    if maxX<left or minX>right or y2<bottom or y1>top then return end
    if minX>=left and maxX<=right and y1>=bottom and y2<=top then return x1,y1,x2,y2 end
    return M.clipBossDash(x1,y1,x2,y2,left,bottom,right,top)
end
function M.roomInk(node, state, currentFloor)
    local palette = Theme.color.mapCanvas
    if node.type == 'boss' and state == 'locked' then return palette.kind.boss end
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
    local shade,initialAlpha
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
        if not shade or shade.alive==false then
            local paper=panel:GetChild('v25MapPaper')
            local background=paper or panel:GetChild('mapGroup1')
            shade=background and background:GetChild('mapReturnShade')
            -- Start the V25 parchment near #3F3F3A over its dark room backdrop.
            initialAlpha=paper and 144 or 64
        end
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
local function maxScroll(chapter)
    if chapter.terminal == 'boss_treasure' then return MapLayout.bossTreasureMaxScroll end
    return MapLayout.maxScroll + (chapter.act == 3 and 2 * Theme.layout.map.bossFloorLift or 0)
end
local function floorY(chapter, floor, bossLift)
    local y = MapLayout.firstY + math.max(0, floor - chapter.first) * Theme.layout.map.floorGap
    if floor == chapter.boss then return y + Theme.layout.map.bossFloorLift + (bossLift or 0) end
    if chapter.act == 3 and floor == chapter.last then return y + 2 * Theme.layout.map.bossFloorLift end
    return y
end
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
        r1 = source.type == "boss" and map.bossNode * Sts.bossRadius or map.node * Sts.srcRadius
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
    local scale = math.max(Sts.baseScale,fx.scale)
    local iconRadius=fx.size*Sts.iconPerScale*M.drawScale(fx)/2
    local radius = math.max(fx.size/2,iconRadius+(fx.emerald and math.abs(Theme.layout.map.emeraldIconY)or 0))
    if fx.state == 'current' or fx.state == 'visited' then
        local angle = fx.angle*math.pi/180
        local ring = fx.size*Sts.circlePerScale*(scale*.95+.2)/2
        radius = math.max(radius,ring*(math.abs(math.cos(angle))+math.abs(math.sin(angle))))
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

local function deviceLayout(hudTop)
    local layout=setmetatable({},{__index=MapLayout})
    if hudTop then
        local bounds=layout.viewport
        layout.viewport={left=bounds.left,right=bounds.right,bottom=bounds.bottom,top=math.min(bounds.top,hudTop)}
    end
    return layout
end

local function mapControls(root,embedded)
    if embedded then return root,nil,root end
    local stage=child(root,'stage')
    return stage,child(root,'mapBackdrop'),child(stage,'mapPanel')
end

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
    local Layout=deviceLayout(options.hudTop)
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
    local stage,backdrop,panel=mapControls(root,embedded)
    local bossViewport = panel:GetChild("bossViewport")
    local bossHost, bossRing, bossOverflow, bossOriginX, bossOriginY
    if bossViewport then
        bossHost = child(bossViewport,"bossInkHost")
        bossRing = child(bossViewport,"bossRing")
        bossOverflow = child(panel,"bossRouteOverflow")
        local v=Layout.viewport
        bossOriginX,bossOriginY=(v.left+v.right)/2,(v.bottom+v.top)/2
        bossViewport:SetAnchoredPosition(bossOriginX,bossOriginY)
        bossViewport:SetSizeDelta(v.right-v.left,v.top-v.bottom)
    end
    local function fittedBoss(bossName)
        return bossHost and MapLayout.bossInk.variants[bossName]
    end
    local inkSlots, inkColours, paintedBossInk
    local function paintBossInk(art, fx)
        if art ~= paintedBossInk then
            if not inkSlots then
                inkSlots, inkColours = {}, {}
                for i = 1, MapLayout.bossInk.cap do
                    inkSlots[i] = child(bossHost, string.format("ink%02d", i - 1))
                end
                for i, c in ipairs(MapLayout.bossInk.palette) do inkColours[i] = colour(c[1],c[2],c[3],255) end
            end
            for i, image in ipairs(inkSlots) do
                local shape = art[i]
                if shape then
                    image:SetImage(imageSource,shape[1])
                    image.imageColor = inkColours[shape[2]]
                    image:SetAnchoredPosition(shape[3],shape[4])
                    image:SetSizeDelta(shape[5],shape[6])
                    image:SetLocalRotation(shape[7],shape[8],shape[9])
                end
                image:SetVisible(shape ~= nil)
            end
            paintedBossInk = art
        end
        bossHost:SetAnchoredPosition(fx.x-bossOriginX,fx.y-bossOriginY)
        bossHost:SetVisible(true)
    end

    -- The title host binds real owners only after Start succeeds.
    local initialChapter = map ~= nil and assert(chapterFor(map), "invalid map chapter context") or nil
    local view = map and mapView(map)
    local self = { root = root, map = map, visible = map ~= nil, navigationEnabled = view and atStart(view) or false,
        scroll = 0, slots = {}, time = 0, breathing = {}, roomFx = {}, stage = stage, panel = panel,
        embedded = embedded, scale = 1, chapter = initialChapter, observedMap = map, observedContext = view,
        observedNodeId = view and view.currentNodeId, observedFloor = view and view.floor }
    local function currentBossName()
        return options.bossName and options.bossName(self.map)
    end
    local function bossLift()
        return fittedBoss(currentBossName()) and Layout.bossRoute.lift or 0
    end
    local function scrollLimit(chapter)
        return maxScroll(chapter)+bossLift()+MapLayout.viewport.top-Layout.viewport.top
    end
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
    local routeMarks, overflowSlots, overflowUsed = {}, {}, 0
    local pathColours = {
        taken = pathColour(Theme.color.node.pathTaken, visual.takenOpacity),
        next = pathColour(Theme.color.node.reachable, visual.nextOpacity),
        future = pathColour(Theme.color.node.path, visual.futureOpacity),
        far = pathColour(Theme.color.node.path, visual.farFutureOpacity),
    }
    if bossViewport then
        -- MapRoomNode.java sets these steady inks for all MapEdges after update.
        local palette=Theme.color.mapCanvas
        if not palette.available then palette=Theme.v25Battle.color.mapCanvas end
        local active,locked=pathColour(palette.available,1),pathColour(palette.far,1)
        pathColours={taken=active,next=active,future=locked,far=locked}
    end
    local function routeInk(taken,reachable,far)
        return taken and pathColours.taken or reachable and pathColours.next or far and pathColours.far or pathColours.future
    end
    local function bind(name, fn)
        local hit=child(at(name),"hit")
        hit:AddCursorEventListener(clickEvent,function(event)
            if inputCovered() or Pointer.blocked(options)then return false end
            return fn(event)
        end)
    end
    local function worldPosition(node, lift)
        return (node.lane - (Layout.lanes + 1) / 2) * Theme.layout.map.columnGap,
            floorY(self.chapter, node.floor, lift)
    end
    local function position(node)
        local x,y=worldPosition(node)
        return x,y-self.scroll
    end
    local function observeMap(current)
        if self.map == self.observedMap and sameContext(current,self.observedContext) then return false end
        cancelDrag()
        -- A restarted run can share floor/node ids with the previous run. Identity
        -- resets its presentation and default gate before the host grants access.
        self.observedMap, self.observedContext, self.chapter = self.map, current, chapterFor(self.map)
        self.entryError=nil
        routeMarks={}
        self:cancelReturnReveal()
        self.observedNodeId, self.observedFloor = current.currentNodeId, current.floor
        self.navigationEnabled, self.time = atStart(current), 0
        self.scroll = clamp(floorY(self.chapter, current.floor, bossLift()) - Layout.focusY, 0, scrollLimit(self.chapter))
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

    local function paintBossDash(dash,mark,ax,ay,bx,by,width,ink)
        dash:SetAnchoredPosition((ax+bx)/2,(ay+by)/2)
        dash:SetSizeDelta(math.sqrt((bx-ax)^2+(by-ay)^2),width)
        dash.localRotationZ=mark.angle
        dash.imageColor=ink
        dash:SetVisible(true)
    end
    local function hideBossOverflow(used)
        for i=used+1,overflowUsed do overflowSlots[i]:SetVisible(false) end
        overflowUsed=used
    end
    local function paintBossRoute(control,source,target,width,ink,used)
        local style,v=Layout.bossRoute,Layout.viewport
        local x1,y1=worldPosition(source)
        local x2,y2=worldPosition(target,style.lift)
        if y2<v.bottom+self.scroll or y1>v.top+self.scroll then control:SetVisible(false);return used end
        local key=source.id..":"..target.id
        local marks=routeMarks[key]
        if not marks then
            marks=M.bossRouteDashes(x1,y1,x2,y2,roomSeed(key))
            routeMarks[key]=marks
        end
        local slots=style.sharedSlots
        local any=false
        for i,mark in ipairs(marks) do
            local ax,ay,bx,by=visibleBossDash(mark,self.scroll,v,width/2)
            if i<=slots then
                local dash=child(control,'routeInk'..i)
                if ax then
                    any=true
                    paintBossDash(dash,mark,ax,ay,bx,by,width,ink)
                else dash:SetVisible(false) end
            elseif ax then
                used=used+1
                assert(used<=style.overflow,"map UI Boss route capacity exceeded")
                local dash=overflowSlots[used] or child(bossOverflow,'dash'..used)
                overflowSlots[used]=dash
                paintBossDash(dash,mark,ax,ay,bx,by,width,ink)
            end
        end
        if any then
            for i=#marks+1,slots do child(control,'routeInk'..i):SetVisible(false) end
            control:SetAnchoredPosition(0,0)
            control:SetSizeDelta(1,width)
            control.localRotationZ=0
        end
        control:SetVisible(any)
        return used
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
        local ink=routeInk(taken,reachable,far)
        if firstDash then
            paintRouteDashes(control,firstDash,source.id,target.id,
                {x1=x1,y1=y1,x2=x2,y2=y2,length=fullLength,a=a,b=b,x=x,y=y},width,ink)
        else control.imageColor=ink end
    end
    local function hideInvalidChapter()
        cancelDrag()
        if bossHost then bossHost:SetVisible(false);bossRing:SetVisible(false);hideBossOverflow(0) end
        self.navigationEnabled, self.slots, self.breathing = false, {}, {}
        at("title").text, at("notice").text = "", "地图章节信息无效 · 请重新启程"
        at("notice"):SetVisible(true)
        for i = 1, Layout.maxNodes do at("node" .. i):SetVisible(false) end
        for i = 1, Layout.maxEdges do at("edge" .. i):SetVisible(false) end
    end
    local function terminalNotice(chapter, current)
        return chapter.terminal == 'boss_treasure' and "已抵达首领宝箱 · 请完成当前房间"
            or current.act == 4 and "已抵达终幕首领 · 请完成最终战斗与结算"
            or "已抵达终点 · 请完成当前房间"
    end
    local function mapNotice(current, chapter, terminal)
        return self.entryError or (current.complete and terminal or
            (current.floor == chapter.boss and (self.navigationEnabled
                and (chapter.terminal == 'boss_treasure' and "首领奖励已处理 · 即将前往宝箱" or "首领奖励已处理 · 请前往终点")
                or "已抵达首领 · 请完成首领战斗与奖励") or
            (self.navigationEnabled and "" or "请先完成当前节点")
            ))
    end
    local function paintMapHeader(current, chapter)
        local terminal = terminalNotice(chapter, current)
        at("title").text = Theme.presentationProfile=='official-assets-first' and tostring(current.floor)
            or chapter.name .. " · 第 " .. current.floor .. " 层"
        at("notice").text = mapNotice(current, chapter, terminal)
        local notice=current.emeraldSelection and Theme.layout.map.emeraldNotice or Theme.layout.map.notice
        at('notice'):SetAnchoredPosition(notice[1],notice[2]);at('notice'):SetSizeDelta(notice[3],Theme.layout.map.presentation.noticeHeight)
        if current.emeraldSelection then
            local prefix=at('notice').text~='' and at('notice').text..' · ' or ''
            at('notice').text=prefix..'绿字节点为燃烧精英，胜利可另领绿钥匙'
        end
        at('notice'):SetVisible(at('notice').text~='')
    end
    local function paintMapEdges(current, nodes, taken, fit)
        local edge, used = 0, 0
        for _, node in ipairs(current.nodes) do for _, id in ipairs(node.nextIds) do
            local target = assert(nodes[id], "map UI dangling route")
            if target.roomKind ~= 'boss_treasure' then
                edge = edge + 1
                assert(edge <= Layout.maxEdges, "map UI edge capacity exceeded")
                local control=at("edge" .. edge)
                local walked,reachable=taken[node.id .. ":" .. id],node.id == current.currentNodeId and target.available
                local far=M.isFar(target.floor,current.floor)
                if fit and target.type=='boss' then
                    used=paintBossRoute(control,node,target,M.pathWidth(walked,reachable),routeInk(walked,reachable,far),used)
                else
                    line(control,node,target,walked,reachable,far,current.currentNodeId)
                end
            end
        end end
        hideBossOverflow(used)
        for i = edge + 1, Layout.maxEdges do at("edge" .. i):SetVisible(false) end
    end
    local bossInkVisible, shiftedBossHits = false, {}
    local function paintVisibleRoom(i, node, fx, floor, bossName, fit)
        local box, state, size = fx.box, fx.state, fx.size
        box:SetAnchoredPosition(fx.x, fx.y)
        box:SetSizeDelta(size, size)
        box.localScaleX, box.localScaleY = 1, 1
        local icon = child(box, "icon")
        if state ~= "available" then fx.alpha = 1 end
        local ring = child(box, "ring")
        if fit then
            ring:SetVisible(false)
            ring=bossRing
        end
        local circled = state == 'current' or state == 'visited'
        ring:SetVisible(circled)
        ring.localRotationZ = fx.angle
        if circled then
            if fit then ring:SetAnchoredPosition(fx.x-bossOriginX,fx.y-bossOriginY) end
            local ink = state == 'current' and Theme.color.mapCanvas.currentRing or Theme.color.mapCanvas.visitedRing
            tint(child(ring, 'outline'), ink)
            tint(child(ring, 'brush'), ink)
        end
        local iconId = fx.boss and Theme.icon.mapBoss[bossName] or Theme.icon.node[node.type]
        icon:SetVisible(not fit)
        if fit then
            paintBossInk(fit, fx)
            bossInkVisible = true
        else icon:SetImage(imageSource, iconId) end
        -- color: NOT_TAKEN for locked rooms, AVAILABLE ink for taken/current/available.
        fx.colour = colour
        -- TASK-4.13: on the dark canvas, taken rooms share the gold path ink and
        -- unreachable rooms recede by opacity, so current/visited/next read at a glance.
        fx.ink = M.roomInk(node, state, floor)
        M.paintRoom(fx)
        icon:SetAnchoredPosition(0,node.hasEmeraldKey and Theme.layout.map.emeraldIconY or 0)
        child(box,'emeraldLabel'):SetVisible(node.hasEmeraldKey==true)
        local hit = child(box, "hit")
        local hitVisible=true
        if fit then
            local v,r=Layout.viewport,size/2
            local left,right=math.max(v.left,fx.x-r),math.min(v.right,fx.x+r)
            local bottom,top=math.max(v.bottom,fx.y-r),math.min(v.top,fx.y+r)
            hitVisible=right>left and top>bottom
            if hitVisible then
                local x,y=(left+right)/2-fx.x,(bottom+top)/2-fx.y
                hit:SetAnchoredPosition(x,y)
                hit:SetSizeDelta(right-left,top-bottom)
                shiftedBossHits[hit]=(x~=0 or y~=0) and true or nil
            end
        else
            if shiftedBossHits[hit] then hit:SetAnchoredPosition(0,0);shiftedBossHits[hit]=nil end
            hit:SetSizeDelta(size,size)
        end
        local clickable = hitVisible and state == "available" and self.navigationEnabled
            and not self.choosing and not scrollAnimation
        hit:SetVisible(clickable)
        if hitVisible then self.slots[i] = node.id end
        if clickable then self.breathing[#self.breathing + 1] = box end
    end
    local function paintMapRoom(i, current, bossName, bossArt)
        local box, node = at("node" .. i), current.nodes[i]
        local visible = false
        if node and node.roomKind ~= 'boss_treasure' then
            local size = node.type == "boss" and Theme.layout.map.bossNode or Theme.layout.map.node
            local fit=node.type=='boss' and bossArt
            local x,y=worldPosition(node,fit and Layout.bossRoute.lift or 0)
            y=y-self.scroll
            local state = roomState(node, current.currentNodeId)
            local fx = self.roomFx[node.id] or newRoomFx(node.id)
            self.roomFx[node.id] = fx
            -- A newly selected room adds a rotated ring. Retire its reachable
            -- pulse first so focus never culls that ring at the first row.
            if state == "current" and fx.state ~= state then fx.scale = Sts.baseScale end
            fx.state,fx.size,fx.box,fx.x,fx.y,fx.emerald=state,size,box,x,y,node.hasEmeraldKey
            fx.boss = node.type == 'boss'
            fx.hovered,fx.pressed=false,false
            fx.fittedRing=fit and bossRing or nil
            if fit then
                local v,r=Layout.viewport,MapLayout.bossInk.size/2
                if state=='current' or state=='visited' then r=math.max(r,M.roomRadius(fx)) end
                visible=x+r>v.left and x-r<v.right and y+r>v.bottom and y-r<v.top
            else visible=roomVisible(fx,Layout.viewport) end
            fx.visible=visible
            -- Hidden transitions still lerp to rest; otherwise a temporarily
            -- oversized current ring could remain culled forever.
            self.activeFx[#self.activeFx+1]=fx
            -- Hidden rows have no slots or focus targets. Avoid rewriting
            -- every child of all 17 floors during each pan animation frame.
            if visible then paintVisibleRoom(i,node,fx,current.floor,bossName,fit) end
            if fit and not visible then child(box,"icon"):SetVisible(false) end
        end
        if not visible then
            local hit = child(box, 'hit')
            if node or hit.visible then hit:SetVisible(false) end
        end
        box:SetVisible(visible)
    end
    function self.render(_)
        if not self.map then return false, "map_unbound" end
        local chapter = chapterFor(self.map)
        if not chapter then
            hideInvalidChapter()
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
        paintMapHeader(current, chapter)
        local name=currentBossName()
        local fit=fittedBoss(name)
        paintMapEdges(current,nodes,taken,fit)
        assert(#current.nodes <= Layout.maxNodes, "map UI node capacity exceeded")
        self.activeFx = {}
        bossInkVisible = false
        for i = 1, Layout.maxNodes do paintMapRoom(i,current,name,fit) end
        if bossHost and not bossInkVisible then bossHost:SetVisible(false);bossRing:SetVisible(false) end
        self:update(0)
    end
    function self.resize(_, width, height)
        if not finite(width) or not finite(height) or width <= 0 or height <= 0 then return false, "invalid_canvas" end
        cancelDrag()
        self.canvasWidth, self.canvasHeight = width, height
        if embedded then self.scale = 1 return true end
        local scale = Viewport.scale(width, height)
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
                self.scroll = clamp(from + (target - from) * (1 - (1 - t)^3),0,scrollLimit(self.chapter))
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
                if dt>0 and not fx.fittedRing and roomVisible(fx,Layout.viewport)~=fx.visible then visibilityChanged=true end
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
        local chapter = chapterFor(self.map)
        if not chapter then
            if not deferRender then self:render() end
            return false, 'invalid_map_context'
        end
        value = clamp(value, 0, scrollLimit(chapter))
        if value ~= self.scroll or scrollAnimation then cancelSelection() end
        scrollAnimation = nil
        self.scroll = value
        if not deferRender then self:render() end
        return true
    end
    local function animateScrollTo(value)
        if not self.visible then return false,"map_hidden" end
        value = clamp(value,0,scrollLimit(self.chapter))
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
            return false, "invalid_map_context"
        end
        local current = entryContext(self.map)
        observeMap(current)
        local floor = current.floor
        if self.chapter.terminal == 'boss_treasure' then floor = math.min(floor, self.chapter.boss) end
        local target = floorY(self.chapter,floor,bossLift()) - Layout.focusY
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
        if selected.roomKind == 'boss_treasure' then return false, 'node_outside_viewport' end
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
        local width, height = self.canvasWidth or Theme.canvas.base[1], self.canvasHeight or Theme.canvas.base[2]
        local sx, sy = Viewport.toStage(x, y, width, height)
        if sy then return sx, sy end
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
