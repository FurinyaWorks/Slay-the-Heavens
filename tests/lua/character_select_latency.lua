local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Select=require('abyss_character_select')
local Reveal=require('abyss_page_reveal')
local Original=require('abyss_original_v4_profiles')
local Catalogue=require('abyss_run_card_catalog')

local count,preview=0,Select.preview
Select.preview=function(...)
    count=count+1
    return preview(...)
end
Original.prepare=function()error('selection prepared a full original run')end
Catalogue.prepareSelected=function()error('selection prepared a full elemental run')end

local source=F.Combat.copy(F.Data)
source.extension={};source.extension.self=source.extension
local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local panel=root:GetChild('characterPanel')
local details=panel:GetChild('details')
local pageReady,seedCalls=true,0
local host=F.GameUI.new(root,source,F.Presentation,'click',{
    characterProfile='full-source',imageSource='static',
    cursorEvents={CursorDown='down',CursorUp='up'},
    color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,
    presentationReady=function(intent)return intent.page~='characterPanel' or pageReady end,
    newSeed=function()seedCalls=seedCalls+1;return 1 end,
})
local function tick()
    if host.pageReveal:step(Reveal.intent(host),1/60)then host:refresh()end
end
local function tap(box)return box:GetChild('hit').click()end
local function check(id,key)
    local info=assert(host.characterSelection.info)
    assert(info.id==id and details.visible and details:GetChild('name').text==info.name)
    for _,name in ipairs({'stats','gold','relic','deckSummary'})do assert(details:GetChild(name).text~='',name)end
    local visible=0
    for _,part in ipairs(details:GetChild('portraits'):GetChildren())do
        if part.visible then visible=visible+1;assert(part.name==key,'old portrait under a new loadout')end
    end
    assert(visible==1 and not host.pageReveal:covered() and seedCalls==0)
    return info
end

tick();tick()
pageReady=false
assert(host:start() and host.pageReveal:covered())
assert(not tap(panel:GetChild('traveler')) and not host:confirmCharacter() and count==0)
pageReady=true;tick();tick()
assert(panel.visible and not host.pageReveal:covered())

local first={}
for _=1,4 do
    for i,id in ipairs(Select.characters)do
        local box=panel:GetChild(i==5 and 'traveler' or 'character'..i)
        assert(tap(box))
        assert(box:GetChild('selected').visible)
        if id=='traveler' then
            for j,element in ipairs(Select.elements)do
                assert(tap(panel:GetChild('elements'):GetChild('element'..j)))
                local info=check(element,'traveler_'..element)
                first[element]=first[element] or info
                assert(info==first[element])
            end
        else
            local info=check(id,id)
            first[id]=first[id] or info
            assert(info==first[id])
        end
    end
end
assert(count==8,'only the eight authored loadouts may be projected')

local confirm=panel:GetChild('confirm'):GetChild('hit')
confirm.listeners.down({touchId=1})
assert(host:selectElement('watcher'))
confirm.listeners.up({touchId=1})
assert(not confirm.click({touchId=1}) and seedCalls==0,'selection reused a held confirmation')

local function onSelected(box,change)
    local selected=panel:GetChild(box):GetChild('selected')
    local set=selected.SetVisible
    selected.SetVisible=function(self,value)
        set(self,value)
        if value then self.SetVisible=set;change()end
    end
    return selected
end
local firstBorder=onSelected('character1',function()assert(host:selectCharacter('arlecchino'))end)
local secondBorder=onSelected('character2',function()assert(host:selectCharacter('hutao'))end)
assert(host:selectCharacter('hutao'))
assert(check('hutao','hutao')==first.hutao and firstBorder.visible and not secondBorder.visible)

assert(host:closeCharacters() and host.characterSelection.info==nil)
tick();tick()
assert(host:start() and tap(panel:GetChild('traveler')))
assert(check('ironclad','traveler_ironclad')==first.ironclad and count==8)
host:disable()
assert(not panel.visible and not host:confirmCharacter() and seedCalls==0)
print('CHARACTER_SELECT_LATENCY_PASS')
