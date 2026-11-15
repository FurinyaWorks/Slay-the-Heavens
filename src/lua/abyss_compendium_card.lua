-- The library and its popup use the existing native card face, not text rows.
local Theme=require('abyss_theme')
local Display=require('abyss_card_display')
local Skin=require('abyss_card_skin')
local M={}
local types={attack='攻击',skill='技能',power='能力',status='状态',curse='诅咒'}
local function tintTree(control,color,platform)
    if not control then return end
    for _,child in ipairs(control:GetChildren())do child.imageColor=platform.color(color.r,color.g,color.b,color.a or 255)end
end
local function colorIdentity(face,definition,platform)
    local palette={green=Theme.color.positive,blue=Theme.cardSkin.roles.FR.accent,
        purple=Theme.cardSkin.roles.RD.accent,colorless=Theme.cardSkin.roles.colorless.accent}
    local color=palette[definition.color]
    if not platform.color then return end
    local native=face:GetChild('nativeCardBody')
    if not color or definition.type=='curse'then
        if native and definition.type~='curse'then
            local material=Theme.officialAssets.battleCardBodyMaterials.red
            tintTree(native:GetChild('outerBevel'),material.outerBevel,platform);tintTree(native:GetChild('innerWell'),material.innerWell,platform)
        elseif not native then tintTree(face:GetChild('roundBody'),Theme.color.cardBody,platform)end
        for _,name in ipairs({'roleRing','roleMark'})do face:GetChild(name):SetVisible(Theme.presentationProfile~='official-assets-first')end
        return
    end
    local well=Theme.color.cardWell
    local body={r=math.floor(well.r*.8+color.r*.2),g=math.floor(well.g*.8+color.g*.2),b=math.floor(well.b*.8+color.b*.2),a=255}
    if native then
        tintTree(native:GetChild('outerBevel'),color,platform);tintTree(native:GetChild('innerWell'),body,platform)
    else tintTree(face:GetChild('roundBody'),body,platform)end
    face:GetChild('costDisc').imageColor=platform.color(color.r,color.g,color.b,255)
    for _,name in ipairs({'roleRing','roleMark'})do face:GetChild(name):SetVisible(false)end
end
function M.write(face,row,platform,nativeArt)
    local definition=row.definition
    if not definition.color and definition.type~='curse'then
        local display={};for key,value in pairs(definition)do display[key]=value end
        display.color='colorless';definition=display
    end
    local function picture(control,id)control:SetImage(platform.imageSource or 'static',id)end
    local function tint(control,color)
        if platform.color then control.imageColor=platform.color(color.r,color.g,color.b,color.a or 255)end
    end
    Display.writeTitle(face:GetChild('name'),row.name,row.upgraded,nil,face:GetChild('type'),types[definition.type])
    local fits=Display.writeBody(face:GetChild('label'),row.text,face)
    face:GetChild('cost').text=definition.cost==-2 and ''or definition.costMode=='all_energy'and'X'or tostring(definition.cost)
    tint(face:GetChild('border'),Theme.color.rarity[definition.rarity]or Theme.color.line)
    tint(face:GetChild('nameBand'),Theme.color.rarityBand[definition.rarity]or Theme.color.rarityBand.basic)
    tint(face:GetChild('artPlate'),Theme.color.cardType[definition.type]or Theme.color.panelRaised)
    Display.writeArt(face:GetChild('art'),definition,picture,face)
    Display.writeNativeArt(face,definition,nativeArt,platform,face:GetChild('art'),'compendium:'..row.id)
    Skin.apply(face,definition,platform,{cost=definition.cost,baseCost=definition.cost,surfaceScope='deck'})
    colorIdentity(face,definition,platform)
    for _,name in ipairs({'glow','nativePlayableRim','costHalo'})do
        local decoration=face:GetChild(name);if decoration then decoration:SetVisible(false)end
    end
    return fits
end
function M.clear(face)return Display.clearNativeArt(face)end
local function enlargedText(face,scale,fonts)
    local box=Theme.layout.card.textBox
    local label=face:GetChild('label')
    label:SetLocalScale(1/scale,1/scale,1)
    label:SetSizeDelta(box[1]*scale,box[2]*scale)
    label.fontSize=fonts.body
    local frames={
        name={Theme.layout.card.size[1]-Theme.space.s,math.max(Theme.layout.card.nameBand,Theme.layout.nativeText.lineHeight),fonts.name},
        cost={Theme.layout.card.costDisc,Theme.layout.nativeText.lineHeight,fonts.cost},
        type={Theme.layout.card.size[1]-Theme.space.s,Theme.layout.nativeText.lineHeight,fonts.type}}
    for name,frame in pairs(frames)do
        local control=face:GetChild(name)
        control:SetLocalScale(1/scale,1/scale,1)
        control:SetSizeDelta(frame[1]*scale,frame[2]*scale)
        control.fontSize=frame[3]
    end
end
function M.popup(face,row,platform,nativeArt)
    M.write(face,row,platform,nativeArt)
    local layout=Theme.layout.compendium
    enlargedText(face,layout.popupScale,{body=layout.popupBodyFont,name=layout.popupTitleFont,cost=layout.popupCostFont,type=layout.popupTypeFont})
end
function M.hover(face,row,platform,nativeArt)
    M.write(face,row,platform,nativeArt)
    enlargedText(face,4/3,Theme.layout.compendium.hoverFonts)
end
return M
