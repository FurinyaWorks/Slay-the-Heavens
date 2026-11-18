local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local Theme=require('abyss_theme')
local host,ui,panel,_,tap=H.setup({'defend'},{'cultist'})
local popup=panel:GetChild('potionHelp'):GetChild('potionPopup')
local function dismiss(touch)
 local control=popup:GetChild('dismiss')
 for _,kind in ipairs({'down','up','click'})do control.listeners[kind]({touchId=touch})end
 assert(not ui.potionMenu and not popup.visible,'fresh dismissal closes the reading panel')
 -- A queued anonymous action is still the old physical gesture, not a retry.
 assert(popup:GetChild('use').listeners.click({})==false,'anonymous popup tail cannot use a bottle')
end
local function bottom(p)return p.y-p.sizeDeltaY/2 end
local function top(p)return p.y+p.sizeDeltaY/2 end
local ids={}
for _,item in ipairs(H.F.Data.potions.potions)do ids[#ids+1]=item.id end
for i,id in ipairs(ids)do
 host.run.potions[1]=id;host:refresh();tap('potion1',900+i)
 assert(ui.potionMenu and popup.visible,id..' opens')
 local title,effect,use=popup:GetChild('title'),popup:GetChild('effect'),popup:GetChild('use')
 assert(bottom(title)+.001>=top(effect),id..' title overlaps complete effect frame')
 assert(bottom(effect)+.001>=top(use),id..' effect overlaps use action')
 assert(top(title)<=popup.sizeDeltaY/2+.001 and bottom(use)>=-popup.sizeDeltaY/2-.001,id..' text outside popup')
 assert(popup.y-popup.sizeDeltaY/2>=-Theme.canvas.base[2]/2,id..' popup outside viewport')
 assert(math.abs(popup.x)+popup.sizeDeltaX/2<=Theme.canvas.base[1]/2,id..' popup outside viewport horizontally')
 if id=='flex_potion' then assert(effect.text:gsub('\n',''):find('人工制品可抵挡减益',1,true),'full temporary strength effect retained')end
 assert(host.run.potions[1]==id,'reading must not consume')
 dismiss(990+i)
 assert(host.run.potions[1]==id,'dismissal and its queued tail must not consume')
end
assert(H.Run.obtainRelic(host.run,'Potion Belt'))
-- Preserve the public menu command's five-capacity geometry contract. This
-- fixture's direct-panel tap helper does not resolve slots 4/5 in potionHelp.
host.run.potions[1]='flex_potion';host:refresh();tap('potion1',2000)
assert(ui:controllerBack(),'a fresh native press may return through the controller command')
for slot=1,5 do
 host.run.potions[slot]='flex_potion';host:refresh()
 assert(ui:openPotionMenu(slot));assert(math.abs(popup.x)+popup.sizeDeltaX/2<=Theme.canvas.base[1]/2,'physical slot bounds '..slot)
 assert(ui:controllerBack(),'public capacity inspection returns without another pointer action')
 assert(host.run.potions[slot]=='flex_potion','physical-slot reading and dismissal must not consume')
end
host.run.potions={'strength_potion','fire_potion','speed_potion'};host:refresh()
local function bottle(slot)return panel:GetChild('potion'..slot):GetChild('normal'):GetChild('bottle')end
assert(bottle(1).imageId==bottle(2).imageId,'regression needs same official silhouette')
local a,b=bottle(1).imageColor,bottle(2).imageColor
assert(a.r~=b.r or a.g~=b.g or a.b~=b.b,'configured tint must distinguish same-silhouette strength/fire bottles')
print('POTION_POPUP_READABILITY_PASS')
