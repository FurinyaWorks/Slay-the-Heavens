local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local F,Combat=H.F,H.F.Combat
local function unchanged(root)
 local saved,work={},{root}
 while #work>0 do
  local current=table.remove(work)
  if not saved[current]then
   local values={};saved[current]=values
   for key,value in pairs(current)do values[key]=value;if type(value)=='table'then work[#work+1]=value end end
  end
 end
 return function()
  for current,values in pairs(saved)do
   for key,value in pairs(values)do assert(current[key]==value,'read-only details changed '..tostring(key))end
   for key,value in pairs(current)do assert(values[key]==value,'read-only details added '..tostring(key))end
  end
 end
end
local host,ui,panel=H.setup({'strike','defend'},{'cultist'})
for _,id in ipairs({'strength','dexterity','artifact','thorns','regen','ritual','vulnerable','weak','frail'}) do
 Combat.addStatus(host.run.combat.player,id,2)
end
ui:render()
local checkReadOnly=unchanged(host.run.combat)
assert(ui:showStatus(0))
local info=panel:GetChild('statusInfo')
local grid=info:GetChild('statusGrid')
assert(grid and grid.kind=='grid' and type(grid.RefreshItems)=='function','unit details have no native continuous scroller')
ui:update(.01)
assert(grid.visible and grid.itemCount>12,'all status lines must be in the native list')
assert(info:GetChild('more').text:find('滑动',1,true),'native list has no discoverable scroll hint')
assert(info:GetChild('more').text:find('减益3',1,true),'offscreen debuffs must be discoverable in the fixed summary')
assert(info:GetChild('mode').visible,'click-only users need a paging fallback')
local found=false
for i=0,grid.itemCount-1 do
 local item=grid:recycle(0,i+grid.indexBase)
 if item:GetChild('text').text:find('易伤',1,true)then found=true end
end
assert(found,'Vulnerable is not reachable by continuous native scrolling')
checkReadOnly()
grid.scrollProgress=.7;ui:render();assert(grid.scrollProgress==.7,'unchanged render reset native scrolling')
local refresh=grid.RefreshItems
grid.RefreshItems=function(self,amount,callback)
 assert(amount~=1 or self.scrollProgress==0,'bottom-position refresh tried to recalibrate on an invisible single item')
 return refresh(self,amount,callback)
end
Combat.addStatus(host.run.combat.player,'vulnerable',1);ui:render()
assert(grid.itemCount>12 and grid.scrollProgress==.7,'live status change lost native position or full list')
grid.RefreshItems=refresh
local late=grid.refreshCallback
assert(info:GetChild('mode').click())
assert(not grid.visible and info:GetChild('page').visible,'C-mode paging not restored')
local page=ui.info.page
info:GetChild('page').click({touchId=81})
assert(ui.info.page~=page,'C-mode page tap cannot advance')
assert(info:GetChild('mode').click())
ui:update(.01);assert(grid.visible)
grid.destroyOnRefresh=true;grid.destroyOnRecycle=true
local old=grid.items[0];grid:recycle(0,0);assert(not old.alive)
info:GetChild('hit').click({touchId=82});assert(not ui.info and not info.visible)
local before=host.run.combat.energy
late(old,0) -- Native delayed work must reject closed/destroyed items before GetChild.
assert(host.run.combat.energy==before)
assert(ui:showStatus(0));ui:update(.01)
local active=grid.items[0];local text=active:GetChild('text').text
late(active,0);assert(active:GetChild('text').text==text,'old callback rebound a new reader')
assert(grid.visible and info.visible)
local callback=grid.refreshCallback
local actor=host.run.combat.player
host.run.combat.player=Combat.copy(actor)
active:GetChild('text').text='replacement actor sentinel'
callback(active,0)
assert(active:GetChild('text').text=='replacement actor sentinel','old actor callback wrote into a replacement actor reader')
host.run.combat.player=actor;ui:render()
host.run.phase='reward'
active:GetChild('text').text='retired combat phase sentinel'
callback(active,0)
assert(active:GetChild('text').text=='retired combat phase sentinel','retired combat callback wrote after the reward transition')
host.run.phase='combat'
local mode=info:GetChild('mode')
mode.listeners.down({touchId=90})
info:GetChild('hit').click({touchId=91})
assert(ui:showStatus(1));ui:update(.01)
local replacement=ui.info
mode.listeners.up({touchId=90});assert(not mode.click({touchId=90}))
assert(ui.info==replacement and not replacement.paged,'old mode gesture switched the reopened reader')
mode.listeners.down({touchId=94});assert(not mode.click({touchId=94})and not replacement.paged,'paired pointer mode accepted a click without Up')
mode.listeners.down({touchId=95});mode.listeners.endDrag({touchId=95});mode.listeners.up({touchId=95})
assert(not mode.click({touchId=95})and not replacement.paged,'drag release toggled paging')
mode.listeners.down({touchId=96});mode.listeners.up({touchId=96})
assert(not mode.click({touchId=96,dragging=true})and not mode.click({touchId=96}),'rejected drag click retained a replayable mode token')
mode.listeners.down({touchId=92});mode.listeners.up({touchId=92})
assert(mode.click({touchId=92})and replacement.paged,'fresh mode gesture did not recover')
assert(not mode.click({touchId=92}),'duplicate release toggled the reader twice')
local h2,u2,p2=H.setup({'strike'},{'cultist'})
local g2=p2:GetChild('statusInfo'):GetChild('statusGrid');g2.indexBase=1;g2.deferRefresh=true
Combat.addStatus(h2.run.combat.player,'vulnerable',2)
assert(u2:showStatus(0));g2:flush();u2:update(.01);g2:flush()
assert(g2.itemCount>1 and g2.items[0]:GetChild('text').text~='','one-based deferred native Grid did not calibrate')
g2.RefreshItems=nil
p2:GetChild('statusInfo'):GetChild('hit').click({touchId=93})
assert(u2:showStatus(0))
assert(not g2.visible and p2:GetChild('statusInfo'):GetChild('page').visible,'missing native Grid API must use the original C fallback')

local focus
local api={events={Confirm='confirm',Cancel='cancel'},directions={Left='left',Right='right'},modes={Specified='specified'},
 getFocus=function()return focus end,setFocus=function(value)focus=value end,isController=function()return true end}
local h3,r3=F.fixture(nil,nil,nil,nil,false,nil,nil,api)
assert(F.start(h3));assert(H.Run.startCombat(h3.run,'cultist_solo'))
h3:refresh()
local u3=h3.battleUI
assert(u3:showStatus(0));h3:syncController()
local m3=r3:GetChild('battlePanel'):GetChild('statusInfo'):GetChild('mode')
assert(focus==m3 and m3.canControllerFocus,'controller cannot reach C-mode control')
h3:update(.01);assert(m3.navigationListeners.confirm())
assert(u3.info.paged,'controller did not activate C-mode')
local energy=h3.run.combat.energy
h3:update(.01);h3:syncController();api.setFocus(m3)
assert(m3.navigationListeners.cancel());assert(not u3.info and h3.run.combat.energy==energy,'controller close changed battle state')
print('STATUS_DETAIL_SCROLL_PASS native, complete, C-mode, close, recycle, delayed callbacks')
