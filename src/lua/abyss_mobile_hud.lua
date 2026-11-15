-- One construction-time calibration of the existing official HUD on touch devices.
-- 88 canvas units = 48.03pt at 393pt tall, or 44pt at 360pt tall. Device-unverified.
local Theme=require('abyss_theme')
local M={}
function M.profile(platform)
    if Theme.presentationProfile=='official-assets-first' and platform and platform.touchScreen and platform.touchScreen()==true then
        return Theme.officialAssets.mobileHud
    end
end
function M.handOrigin(platform,pile,fallback)
    local hud=M.profile(platform)
    if not hud then return fallback end
    return hud[pile]or hud.draw
end
local function frame(c,v)
    c:SetAnchoredPosition(v[1],v[2]);c:SetSizeDelta(v[3],v[4])
end
local function text(c,v,font)
    frame(c,v);c.fontSize=font;c.minimumFontSize=font;c.adaptiveFontSize=false
end
local function bar(panel,name,hud)
    local host=panel:GetChild(name);host:SetAnchoredPosition(0,hud.barY)
    host:SetSizeDelta(1280,hud.barHeight)
    host:GetChild('steel'):SetSizeDelta(1280,hud.barHeight)
    host:GetChild('topLight'):SetLocalScale(1,hud.barHeight/Theme.officialAssets.battleHud.height,1)
    host:GetChild('barShadow'):SetAnchoredPosition(0,-hud.barHeight/2-1.5)
    host:GetChild('officialHeroHeading'):SetVisible(false)
end
local function resources(panel,battle,hud)
    local owner=panel:GetChild('resources')or panel
    frame(owner:GetChild('hpIcon'),hud.hpIcon);frame(owner:GetChild('goldIcon'),hud.goldIcon)
    text(owner:GetChild(battle and 'player'or'hp'),hud.hp,hud.font)
    text(owner:GetChild(battle and 'piles'or'gold'),hud.gold,hud.font)
    local title=panel:GetChild('title')
    if title then text(title,hud.location,hud.locationFont)
    else
        for _,group in ipairs(panel:GetChildren())do
            local label=group.name:match('^mapGroup%d+$')and group:GetChild('title')
            if label then text(label,hud.location,hud.locationFont)end
        end
    end
    local hints=panel:GetChild('resourceHints');if not hints then return end
    for _,kind in ipairs({'hp','gold'})do
        local v=hud[kind..'Hint'];local hint=hints:GetChild(kind)
        frame(hint,v);hint:GetChild('hit'):SetSizeDelta(v[3],v[4])
    end
end
local function route(control,position,hud)
    control:SetAnchoredPosition(position[1],position[2])
    frame(control:GetChild('hit'),{0,hud.hitOffsetY,hud.routeWidth,hud.hit})
    text(control:GetChild('label'),{0,0,hud.routeWidth,42},hud.font)
end
local function entry(root,name,position,hud)
    local open=root:GetChild(name):GetChild('open');open:SetAnchoredPosition(position[1],position[2])
    local hit=open:GetChild('hit');frame(hit,{0,hud.hitOffsetY,hud.hit,hud.hit})
    for _,state in ipairs({'normal','hover','pressed','disabled'})do
        local variant=hit:GetChild(state);variant:SetAnchoredPosition(0,-hud.hitOffsetY)
        local face=variant:GetChild('officialBattleHud')
        local symbol=face:GetChild('symbol')
        if name=='deckEntry'then
            text(symbol,{-20,0,32,42},hud.font);text(face:GetChild('count'),{16,0,48,42},hud.font)
        else symbol:SetSizeDelta(36,36)end
    end
end
local function pileCount(panel,icon,kind,position,hud)
    local offset=kind=='exhaust'and Theme.officialAssets.battleHud.exhaustPile.countOffset or Theme.layout.pileBadge.visual.offset
    local x,y=position[1]+offset[1],position[2]+offset[2]
    text(panel:GetChild(kind),{x,y,hud.count.size[1],hud.count.size[2]},hud.count.font)
    if kind=='exhaust'then icon:GetChild('pileCountBadge'):SetSizeDelta(hud.count.badge,hud.count.badge)
    else
        for _,part in ipairs({{'BadgeRing',hud.count.ring},{'Badge',hud.count.badge}})do
            frame(panel:GetChild(kind..part[1]),{x,y,part[2],part[2]})
        end
    end
end
local function piles(panel,hud)
    for _,kind in ipairs({'draw','discard','exhaust'})do
        local position=hud[kind];local icon=panel:GetChild(kind..'Icon')
        icon:SetAnchoredPosition(position[1],position[2])
        frame(icon:GetChild('hit'),{0,0,hud.hit,hud.hit})
        pileCount(panel,icon,kind,position,hud)
    end
    frame(panel:GetChild('endTurn'),hud.endTurn)
    local ratio=hud.endTurn[3]/Theme.layout.endTurn.size[1]
    for _,state in ipairs({'normal','hover','pressed','disabled'})do
        local face=panel:GetChild('endTurn'):GetChild(state)
        face:SetLocalScale((face.localScaleX or 1)*ratio,face.localScaleY or 1,1)
        local label=face:GetChild('label');text(label,{0,0,hud.endTurn[3],42},hud.font)
        label:SetLocalScale(1/ratio,1,1)
    end
    for _,name in ipairs({'energyIcon','energy'})do panel:GetChild(name):SetAnchoredPosition(hud.energy[1],hud.energy[2])end
end
local function readingButton(button,w,h,font)
    button:GetChild('hit'):SetSizeDelta(w,h)
    for _,state in ipairs({'normal','hover','pressed','disabled'})do
        text(button:GetChild('hit'):GetChild(state):GetChild('label'),{0,0,w-8,52},font)
    end
end
local function readingControls(root,reading)
    local menu=root:GetChild('runMenu');local rows=reading.runMenu
    for _,name in ipairs({'resume','help','map','mainMenu','abandon','quit'})do
        local spec=rows[name];local button=menu:GetChild(name)
        button:SetAnchoredPosition(spec[1],spec[2]);readingButton(button,spec[3],spec[4],reading.font)
    end
    local exit=root:GetChild('exitPanel')
    for _,name in ipairs({'confirm','cancel'})do readingButton(exit:GetChild(name),320,88,reading.font)end
    local help=exit:GetChild('help');help:SetAnchoredPosition(reading.exitHelp[1],reading.exitHelp[2])
    readingButton(help,160,88,reading.font)
end
function M.apply(root,platform)
    local hud=M.profile(platform);if not hud then return end
    for _,name in ipairs({'battlePanel','mapPanel','nodePanel'})do
        local panel=root:GetChild(name);local battle=name=='battlePanel'
        bar(panel,battle and'topBar'or'officialRunBar',hud);resources(panel,battle,hud)
    end
    local battle=root:GetChild('battlePanel')
    route(battle:GetChild('topBar'):GetChild('battleRoute'),{hud.route[1],hud.route[2]-hud.barY},hud)
    route(root:GetChild('nodePanel'):GetChild('runRoute'),hud.route,hud)
    -- Preview return is another live receiver, not a new map button.
    route(root:GetChild('mapPanel'):GetChild('previewBack'),hud.route,hud)
    entry(root,'deckEntry',hud.deck,hud);entry(root,'exitEntry',hud.menu,hud)
    root:GetChild('relicBar'):SetAnchoredPosition(hud.relicOffset[1],hud.relicOffset[2])
    root:GetChild('relicEntry'):GetChild('open'):SetAnchoredPosition(hud.relicEntry[1],hud.relicEntry[2])
    piles(battle,hud)
    local reading=Theme.officialAssets.mobileReading;readingControls(root,reading)
    return {deck=hud.deck,menu=hud.menu,routeBackText=Theme.officialAssets.battleHud.routeBackText,reading=reading}
end
return M
