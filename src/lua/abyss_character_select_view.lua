-- Native selection presentation. All numbers and deck entries come from loadouts.
local Theme=require('abyss_theme')
local Select=require('abyss_character_select')
local number=require('abyss_numbers').integer
local M={}
local function visible(control,value)
    if control.visible~=value then control:SetVisible(value)end
end
local function text(control,value)
    if control.text~=value then control.text=value end
end
local function image(control,platform,entry)
    if control and entry and platform.imageSource and control.imageId~=entry.id then
        control:SetImage(platform.imageSource,entry.id)
    end
end
-- The legacy layout lists cards in type order.
local typeOrder={attack=1,skill=2,power=3,status=4,curse=5}
local function sortedDeck(info)
    local cards={}
    for i,card in ipairs(info.deck)do cards[i]=card end
    table.sort(cards,function(a,b)
        local x,y=typeOrder[a.type] or 9,typeOrder[b.type] or 9
        if x~=y then return x<y end
        if a.count~=b.count then return a.count>b.count end
        return a.id<b.id
    end)
    return cards
end
-- The legacy selection summary shares no card faces with the deck browser.
local function renderStarterDeck(details,info)
    local parts={}
    for _,card in ipairs(sortedDeck(info))do parts[#parts+1]=card.name..'×'..number(card.count)end
    text(details:GetChild('deckTitle'),'初始牌组 · '..number(info.deckSize)..' 张')
    text(details:GetChild('deckSummary'),table.concat(parts,'  '))
end
local function selected(box,value)
    visible(box:GetChild('selected'),value)
end
local function paintBust(box,entry,platform)
    if not entry or not platform.imageSource then return end
    local hit=box:GetChild('hit')
    for _,state in ipairs({'normal','hover','pressed','disabled'}) do
        local face=hit:GetChild(state)
        local bust=face and face:GetChild('bust')
        image(bust,platform,entry)
    end
end
local function largeSlot(character,element)
    local slots=Theme.icon.heroSlots
    if character=='traveler' then return slots.large.traveler[element or 'ironclad'], slots.bust.traveler[element or 'ironclad'] end
    return slots.large[character], slots.bust[character]
end
local function paintPortraits(details,state,platform)
    local large=largeSlot(state.character,state.element)
    local portraits=details:GetChild('portraits')
    local key=state.character=='traveler' and ('traveler_'..(state.element or 'ironclad')) or state.character
    for _,id in ipairs(Select.characters)do
        if id=='traveler' then
            for _,element in ipairs(Select.elements)do
                local portrait=portraits:GetChild('traveler_'..element)
                if portrait then visible(portrait,key=='traveler_'..element)end
            end
        else visible(portraits:GetChild(id),id==key) end
    end
    image(portraits:GetChild(key),platform,large)
    return large
end
local function paintCharacterButtons(panel,state,platform,originalSts,open,singleRoster)
    for i,id in ipairs(Select.characters)do
        local box=panel:GetChild(i==5 and 'traveler' or 'character'..i)
        local allowed=(originalSts or open>1 or id=='traveler') and state:allowsCharacter(id)
        visible(box,allowed)
        selected(box,state.character==id and (id~='traveler' or not singleRoster))
        local _,bust=largeSlot(id,id=='traveler' and (state.element or 'ironclad') or nil)
        if allowed and (not originalSts or id~='traveler') then paintBust(box,bust,platform)end
    end
end
local function paintThemesAndElements(panel,state,platform,elementsOpen)
    local traveler=state.character=='traveler'
    -- Theme layers are prebuilt per character/element; only visibility changes.
    local theme=traveler and state.element or state.character
    local group=panel:GetChild('themes')
    for _,id in ipairs(Select.characters)do if id~='traveler' then visible(group:GetChild(id),id==theme)end end
    for _,id in ipairs(Select.elements)do visible(group:GetChild(id),id==theme)end
    local elements=panel:GetChild('elements')
    visible(elements,traveler and elementsOpen>1)
    for i,id in ipairs(Select.elements)do
        local box=elements:GetChild('element'..i)
        local allowed=state:allowsElement(id)
        visible(box,allowed)
        selected(box,state.element==id)
        if allowed and elements.visible then paintBust(box,Theme.icon.heroSlots.bust.traveler[id],platform)end
    end
end
local function paintDetails(details,state,platform,nativeV25,info)
    text(details:GetChild('name'),info.name)
    text(details:GetChild('stats'),(nativeV25 and '生命：' or '生命  ')..number(info.maxHp)..(nativeV25 and '/' or ' / ')..number(info.maxHp))
    text(details:GetChild('gold'),(nativeV25 and '金币：' or '金币  ')..number(info.gold))
    local relics,texts={},{}
    for _,r in ipairs(info.relics)do relics[#relics+1]=r.name;if r.text and r.text~='' then texts[#texts+1]=r.text end end
    text(details:GetChild('relic'),#relics>0 and table.concat(relics,'、') or '无')
    text(details:GetChild('relicText'),table.concat(texts,' '))
    if not nativeV25 and details:GetChild('deckSummary') then renderStarterDeck(details,info) end
    local large=paintPortraits(details,state,platform)
    local note=info.name
    if large and large.playable==false then note=note..' · 非本次正式角色' end
    text(details:GetChild('portraitNote'),note)
    if nativeV25 then
        visible(details:GetChild('v25Story'),info.id=='ironclad')
        visible(details:GetChild('v25RelicIcon'),info.id=='ironclad')
    end
end
local function countAllowed(ids,allows)
    local count=0
    for _,id in ipairs(ids)do if allows(id)then count=count+1 end end
    return count
end
function M.render(panel,state,platform,published)
    local info=state.info
    if published==false then info=nil end
    local originalSts=Theme.presentationProfile=='official-assets-first' and panel:GetChild('stsCharacter')~=nil
    local nativeV25=Theme.presentationProfile=='official-assets-first' and (originalSts or panel:GetChild('v25Roster')~=nil)
    text(panel:GetChild('hint'),state.notice or (nativeV25 and '' or (info and '查看初始信息，确认后开始冒险。' or '点击下方角色查看详情，再确认出发。')))
    -- 只剩一个可选角色/元素时不摆假选择钮（Pan 2026-10-31：单角色发版）。
    local open=countAllowed(Select.characters,function(id)return state:allowsCharacter(id)end)
    local elementsOpen=countAllowed(Select.elements,function(id)return state:allowsElement(id)end)
    local roster=panel:GetChild('v25Roster')
    paintCharacterButtons(panel,state,platform,originalSts,open,nativeV25 and roster and open==1)
    paintThemesAndElements(panel,state,platform,elementsOpen)
    local details=panel:GetChild('details');visible(details,info~=nil)
    if not nativeV25 then visible(panel:GetChild('deckView'),false) end
    if nativeV25 and roster then
        visible(roster,open==1)
        visible(panel:GetChild('title'),info==nil)
        visible(roster:GetChild('selected'):GetChild('selection'),info~=nil)
    end
    visible(panel:GetChild('confirm'),info~=nil)
    local confirm=panel:GetChild('confirm'):GetChild('hit')
    local enabled=info~=nil and state:canConfirm()
    if confirm.interactable~=enabled then confirm.interactable=enabled end
    if confirm.raycastTarget~=enabled then confirm.raycastTarget=enabled end
    if not info then return end
    paintDetails(details,state,platform,nativeV25,info)
end
return M
