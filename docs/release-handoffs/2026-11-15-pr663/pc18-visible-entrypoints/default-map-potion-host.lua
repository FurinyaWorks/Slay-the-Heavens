local F=dofile('tests/lua/support/game_ui_fixture.lua')
assert(F.Theme.presentationProfile~='official-assets-first' and F.Theme.presentationProfile~='v25-reference')
local host,root=F.fixture()
assert(F.start(host) and host.mode=='map')
local function get(c,...)for _,name in ipairs({...})do c=assert(c:GetChild(name),name)end;return c end
local hit=get(root,'potionEntry','open','hit')
local potions=host.run.potions
potions[1],potions[2]='strength_potion','flex_potion'
host:refresh()
assert(get(root,'potionEntry').visible and hit.interactable)
for _,face in ipairs({'normal','hover','pressed','disabled'})do
 local current=get(hit,face)
 local label=get(current,'label')
 assert(label.visible and label.text=='药水 2/3')
 for slot=1,5 do assert(not get(current,'slot'..slot).visible,'formal default does not show individual map slots') end
end
assert(F.click(root,'potionEntry','open') and host.potionUI.visible)
local p=get(root,'potionPanel')
local first=get(p,'slot1','hit','normal','label').text
local second=get(p,'slot2','hit','normal','label').text
assert(first=='槽 1\n力量药水' and second=='槽 2\n肌肉药水',first..' / '..second)
assert(host.run.potions==potions and potions[1]=='strength_potion' and potions[2]=='flex_potion')
print('PASS formal-default Host: map displays count only (2/3), individual slots hidden in all four states')
print('PASS existing management UI names Strength and Flex distinctly; same physical inventory unmodified')
assert(host.potionUI:close());host:refresh()
assert(F.click(root,'mapPanel','node1') and host.mode=='battle')
local function sameColor(a,b)return a and b and a.r==b.r and a.g==b.g and a.b==b.b and a.a==b.a end
local b=get(root,'battlePanel')
for _,face in ipairs({'normal','hover','pressed','disabled'})do
 local x=get(b,'potion1',face,'bottle')
 local y=get(b,'potion2',face,'bottle')
 assert(x.visible and y.visible and x.imageId==111046 and y.imageId==111046,face..' visible atlas fallback')
 assert(sameColor(x.imageColor,y.imageColor),face..' same atlas tint')
 assert(not x.parent:GetChild('bottleArt') and not y.parent:GetChild('bottleArt'))
end
assert(host.run.potions[1]=='strength_potion' and host.run.potions[2]=='flex_potion')
print('PASS formal-default Host: Strength/Flex visible in battle, same 111046 and same tint in all four imported faces')
local left,right=get(b,'potionHelp','potionCaption1'),get(b,'potionHelp','potionCaption2')
assert(left.visible and left.text=='力' and right.visible and right.text=='肌')
print('PASS formal-default Host: battle captions are visible and distinguish Strength/Flex as 力 / 肌')
