-- Native canvas units. On the 2556x1179 iPhone 14 Pro reference, 84 units
-- project to about 45.9pt at 3x. Viewport owns canvas scaling independently.
local Theme=require('abyss_theme')
local M={}
local states={'normal','hover','pressed','disabled'}

local function barGeometry(bar,desk,mobile)
    local y=Theme.canvas.base[2]/2-mobile.height/2
    local width=Theme.canvas.base[1]
    bar:SetAnchoredPosition(0,y)
    bar:SetSizeDelta(width,mobile.height)
    bar:GetChild('steel'):SetSizeDelta(width,mobile.height)
    bar:GetChild('topLight'):SetLocalScale(1,mobile.height/desk.height,1)
    bar:GetChild('barShadow'):SetAnchoredPosition(0,-mobile.height/2-1.5)
    bar:GetChild('officialHeroHeading'):SetAnchoredPosition(desk.heading[1],mobile.y-y)
    local floorX=mobile.potionX+(Theme.layout.battlePotions.count-1)*mobile.potionStep+85
    bar:GetChild('officialStairs'):SetAnchoredPosition(floorX,mobile.y-y)
    return floorX+33,y
end

local function resources(page,kind,desk,mobile)
    local owner=page:GetChild('resources') or page
    local hints=page:GetChild('resourceHints')
    for _,key in ipairs({'hp','gold'})do
        local icon,value=desk[key..'Icon'],desk[key]
        local shift=mobile[key..'Shift']
        owner:GetChild(key..'Icon'):SetAnchoredPosition(icon[1]+shift,mobile.y)
        local name=key
        if kind=='battlePanel' then name=key=='hp' and 'player' or 'piles' end
        owner:GetChild(name):SetAnchoredPosition(value[1]+shift,mobile.y)
        if hints then
            local left=math.min(icon[1]-icon[3]/2,value[1]-value[3]/2)
            local right=math.max(icon[1]+icon[3]/2,value[1]+value[3]/2)
            local hint=hints:GetChild(key)
            hint:SetAnchoredPosition((left+right)/2+shift,mobile.y)
            hint:GetChild('hit'):SetSizeDelta(math.max(mobile.hit,right-left),mobile.hit)
        end
    end
end

local function routeGeometry(route,mobile,y)
    route:SetAnchoredPosition(mobile.routeX,y)
    local hit=route:GetChild('hit')
    hit:SetAnchoredPosition(0,0)
    hit:SetSizeDelta(mobile.hit,mobile.hit)
end

local function belowBand(control,top)
    local bottom=-Theme.canvas.base[2]/2
    control:SetAnchoredPosition(0,(top+bottom)/2)
    control:SetSizeDelta(Theme.canvas.base[1],top-bottom)
end
local function rewardStageGeometry(stage,top)
    local layout=Theme.layout.rewardPick
    local x,y,_,h=table.unpack(layout.title)
    local headerY=math.min(y,top-h/2-4)
    local sx,_,sw=table.unpack(layout.subtitle)
    stage:GetChild('v25RewardPaper'):SetAnchoredPosition(x-layout.stage[1],headerY-layout.stage[2])
    local title=stage:GetChild('title')
    title:SetAnchoredPosition(x-layout.stage[1],headerY-layout.stage[2])
    local subtitle=stage:GetChild('subtitle')
    subtitle:SetAnchoredPosition(sx-layout.stage[1],headerY-42-layout.stage[2])
    subtitle:SetSizeDelta(sw,28)
end

local function contentGeometry(child,mobile)
    local top=mobile.contentTop
    local node=child('nodePanel')
    for _,name in ipairs({'pickerView','shopView','campView','treasureView'})do
        node:GetChild(name):SetAnchoredPosition(0,mobile.roomY)
    end
    -- Neow reuses the event controls but owns a full-stage scene. Its
    -- renderer selects the appropriate frame when the shared page is painted.
    local event=node:GetChild('eventView'):GetChild('plateBorder'):GetChild('v25EventParchment'):GetChild('field')
    belowBand(event,top-mobile.roomY)
    local battle=child('battlePanel')
    for _,name in ipairs({'rewardList','rewardStage'})do
        local dark=battle:GetChild(name):GetChild('v25RewardField'):GetChild('dark')
        belowBand(dark,top)
    end
    rewardStageGeometry(battle:GetChild('rewardStage'),top)
end

local function pageGeometry(child,kind,desk,mobile)
    local page=child(kind)
    local bar=page:GetChild(kind=='battlePanel' and 'topBar' or 'officialRunBar')
    local floorX,barY=barGeometry(bar,desk,mobile)
    resources(page,kind,desk,mobile)
    if kind=='mapPanel' then
        routeGeometry(page:GetChild('mapRoute'),mobile,mobile.y)
        for _,group in ipairs(page:GetChildren())do
            if group.name:match('^mapGroup%d+$')then
                local title=group:GetChild('title')
                if title then title:SetAnchoredPosition(floorX,mobile.y)end
            end
        end
    else
        page:GetChild('title'):SetAnchoredPosition(floorX,mobile.y)
        if kind=='battlePanel' then
            routeGeometry(bar:GetChild('battleRoute'),mobile,mobile.y-barY)
            local x,y,w,h=table.unpack(mobile.status)
            local status=page:GetChild('floor')
            status:SetAnchoredPosition(x,y);status:SetSizeDelta(w,h)
        else
            routeGeometry(page:GetChild('runRoute'),mobile,mobile.y)
        end
    end
end

local function bottleGeometry(face,width,height)
    face:SetSizeDelta(width,height)
    face:GetChild('bottle'):SetSizeDelta(width,height)
    face:GetChild('emptyShell'):GetChild('dashes'):GetChild('bottleShadow'):SetSizeDelta(width,height)
end

local function potionGeometry(child,desk,mobile)
    local battle,entry=child('battlePanel'),child('potionEntry')
    local faces=entry:GetChild('open'):GetChild('hit')
    -- The existing official face (including the pressed state) still scales
    -- each graphic. Resize its bottle frames once, in that face's local space.
    local width=mobile.potionBottle[1]/desk.potionScale[1]
    local height=mobile.potionBottle[2]/desk.potionScale[2]
    for i=1,Theme.layout.battlePotions.count do
        local name='potion'..i
        local button=battle:GetChild(name) or battle:GetChild('potionHelp'):GetChild(name)
        local slot=entry:GetChild('slot'..i)
        local x=mobile.potionX+(i-1)*mobile.potionStep
        button:SetAnchoredPosition(x,mobile.y)
        button:SetSizeDelta(mobile.hit,mobile.hit)
        slot:SetAnchoredPosition(x,mobile.y)
        slot:SetSizeDelta(mobile.hit,mobile.hit)
        slot:GetChild('hit'):SetSizeDelta(mobile.hit,mobile.hit)
        for _,state in ipairs(states)do
            bottleGeometry(button:GetChild(state),width,height)
            bottleGeometry(faces:GetChild(state):GetChild('slot'..i),width,height)
        end
    end
end

function M.apply(child,platform)
    if Theme.presentationProfile~='official-assets-first' or not platform.touchScreen
        or not platform.touchScreen() then return end
    local mobile=Theme.officialAssets.mobileRunHud
    if not mobile then return end
    mobile=setmetatable({}, {__index=mobile})
    mobile.contentTop=mobile.relicBar.origin[2]-mobile.hit/2
    -- Standard room content has a 233-unit upper bound.
    mobile.roomY=math.min(0,mobile.contentTop-233-1)
    local desk=Theme.officialAssets.battleHud
    for _,kind in ipairs({'battlePanel','mapPanel','nodePanel'})do pageGeometry(child,kind,desk,mobile)end
    potionGeometry(child,desk,mobile)
    contentGeometry(child,mobile)
    return mobile
end
return M
