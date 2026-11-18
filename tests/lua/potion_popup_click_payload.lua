local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
local h,u,p,event,tap,drain=H.setup({'defend','defend'},{'cultist','jaw_worm'},{touchScreen=function()return true end})
local popup=p:GetChild('potionHelp'):GetChild('potionPopup')
local n=0
local function control(name)return popup:GetChild(name)end
local function send(name,kind,touch)
 return control(name).listeners[kind]({touchId=touch})
end
local function start(id)
 if u.potionMenu then assert(u:controllerBack())end
 u.potionAim=nil
 h.run.combat=H.F.Combat.new(H.F.Data,{deck={'defend','defend'},enemies={'cultist','jaw_worm'}})
 h.run.potions={id or 'energy_potion'};h:refresh();tap('potion1',1000+n)
 assert(u.potionMenu);n=n+1
 return h.run.combat
end
local function press(name,touch)send(name,'down',touch);send(name,'up',touch)end
local function unchanged(b)
 assert(h.run.potions[1] and b.energy==3 and #b.hand==2 and b.player.block==0 and not u.selected)
end
local function used(b)
 drain();assert(not u.potionMenu and not h.run.potions[1] and b.energy==5 and #b.hand==2 and not u.selected)
end
for _,spec in ipairs({{'use','energy_potion'},{'use','fire_potion'},{'discard','energy_potion'},{'dismiss','energy_potion'}})do
 for _,named in ipairs({true,false})do
  local b=start(spec[2]);local native={};if named then native.touchId=17 end
  press(spec[1],17);control(spec[1]).listeners.click(native)
  assert((native.touchId~=nil)==named,'native Click payload is never rewritten')
  drain();assert(not u.potionMenu and #b.hand==2 and not u.selected)
  if spec[1]=='use'and spec[2]=='energy_potion'then used(b)
  elseif spec[1]=='use'then assert(u.potionAim and h.run.potions[1]=='fire_potion')
  elseif spec[1]=='discard'then assert(not h.run.potions[1] and b.energy==3)
  else assert(h.run.potions[1]=='energy_potion'and b.energy==3)end
 end
end
-- Real competitors include a second pointer on the same button whose Down
-- could not replace A's capability, another action, and the neutral plate.
for _,name in ipairs({'use','discard','hit'})do
 for _,completed in ipairs({false,true})do
  local b=start();send('use','down',21);send(name,'down',22);send('use','up',21)
  if completed then send(name,'up',22)end
  send('use','click');unchanged(b);assert(u.potionMenu,'ambiguous Click cannot borrow A')
  send('use','click',21);used(b)
 end
end
-- Competition revokes this press's anonymous capability monotonically.
-- Neither terminal ordering nor later cleanup can prove a delayed Click's ID.
for _,a in ipairs({'use','discard'})do
 for _,same in ipairs({true,false})do
  local other=same and a or (a=='use'and'discard'or'use')
  for _,bFirst in ipairs({true,false})do
   for _,clickFirst in ipairs({true,false})do
    local b=start();send(a,'down',121);send(other,'down',122)
    if bFirst then send(other,'up',122);send(a,'up',121)
    else send(a,'up',121);send(other,'up',122)end
    if clickFirst then send(other,'click')end
    send(a,'click');unchanged(b)
    if not clickFirst then send(other,'click');unchanged(b)end
    if same then
     send(other,'click',122);send(a,'click');unchanged(b)
    end
    send(a,'click',121);drain()
    assert(not h.run.potions[1]and b.energy==(a=='use'and 5 or 3),'named owner retains its action')
   end
  end
 end
end
for _,a in ipairs({'use','discard'})do
 for _,same in ipairs({true,false})do
  local other=same and a or (a=='use'and'discard'or'use')
  local b=start();press(a,125);press(other,126)
  send(a,'click');unchanged(b)
  send(a,'click',125);drain()
  assert(not h.run.potions[1]and b.energy==(a=='use'and 5 or 3),'released A cannot borrow anonymous identity after B starts')
 end
end
for _,dragged in ipairs({false,true})do
 local b=start();send('use','down',131)
 for touch=132,133 do
  send('use','down',touch)
  if dragged then local drag=control('use').listeners.drag;if drag then drag({touchId=touch})end end
  send('use','up',touch)
 end
 send('use','click',133);send('use','up',131);send('use','click');unchanged(b)
 send('use','click',131);used(b)
end
for _,other in ipairs({'use','discard','hit'})do
 local b=start();send('use','down',141);send(other,'down',142)
 send('use','up',141);send(other,'up',142)
 send(other,'exit',142);send('use','click');unchanged(b)
 send('use','exit',141);press('use',141);send('use','click');used(b)
end
do
 local b=start();press('use',25);send('discard','click');unchanged(b)
 send('use','click',99);unchanged(b);send('use','click');used(b)
end
do
 local b=start();press('use',26);press('discard',26)
 send('use','click',26);unchanged(b)
 send('discard','click');assert(not h.run.potions[1]and b.energy==3,'fresh same-ID Down owns the new control')
end
do local b=start();press('use');send('use','click');used(b)end
-- Unknown terminals may retire one attributable origin but never grant Up.
for _,kind in ipairs({'up','exit','endDrag'})do
 for _,released in ipairs({false,true})do
  local b=start();send('use','down',31);if released then send('use','up',31)end
  send('use',kind);send('use','click');send('use','click',31);unchanged(b)
  press('use',31);send('use','click');used(b)
 end
end
for _,kind in ipairs({'up','exit','endDrag'})do
 local b=start();press('use',33);send('use',kind,99);send('use','click');used(b)
end
do
 local b=start();send('use','down',34)
 local drag=control('use').listeners.drag;if drag then drag({touchId=34})end
 send('use','up',34);send('use','click');send('use','click',34);unchanged(b)
 press('use',34);send('use','click');used(b)
end
do
 local b=start();press('use',37)
 local drag=control('use').listeners.drag;if drag then drag({touchId=99})end
 send('use','click');used(b)
end
do
 local b=start();press('use',35);send('discard','down',36);send('use','exit')
 send('use','click');unchanged(b);send('use','click',35);used(b)
end
local stale={
 function()h.run.potions[1]='fire_potion';h:refresh()end,
 function()h.run.potions={'energy_potion'};h:refresh()end,
 function()u:controllerBack();tap('potion1',501)end,
 function()h.run.combat.turn=h.run.combat.turn+1;h:refresh()end,
 function()h.run.combat=H.F.Combat.new(H.F.Data,{deck={'defend','defend'},enemies={'cultist'}});h:refresh()end,
 function()
  local run=H.Run.new(H.F.Data,79);assert(H.Run.startCombat(run,'cultist_solo'));run.potions={'energy_potion'}
  run.combat=H.F.Combat.new(H.F.Data,{deck={'defend','defend'},enemies={'cultist'}})
  h.run,u.run=run,run;h:refresh()
 end,
 function()h:resize(1400,760);h:resize(1280,720)end,
 function()assert(h:openDeck());assert(h:closeDeck())end,
}
for _,invalidate in ipairs(stale)do
 start();press('use',41);invalidate();send('use','click');send('use','click',41)
 local b=h.run.combat
 assert(h.run.potions[1]and b.energy==3 and #b.hand==2 and not u.potionAim and not u.selected,'stale menu/slot/owner/viewport cannot revive release')
end
-- A normalized ended ID and the native anonymous tail are both consumed by
-- existing target/action paths, including click-only-compatible controls.
do
 local b=start('fire_potion');press('use',61);send('use','click')
 p:GetChild('endTurn').listeners.click({});assert(b.turn==1 and u.potionAim)
 event('enemy1','click',61);assert(u.potionAim and h.run.potions[1])
 local hp=b.enemies[1].hp;tap('enemy1',62);drain()
 assert(not h.run.potions[1] and b.enemies[1].hp==hp-20 and #b.hand==2)
end
-- Controller blocking consumes all pending popup pointer capabilities.
do
 local F=H.F;local focus;local blocked=false
 local api={events={Confirm='confirm',Cancel='cancel',Focus='focus'},directions={Left='left',Right='right'},
  modes={Specified='specified',NearestControl='nearest'},getFocus=function()return focus end,
  setFocus=function(value)focus=value end,isController=function()return false end}
 local cursor={CursorDown='down',CursorDrag='drag',CursorUp='up',CursorEndDrag='endDrag',CursorExit='exit'}
 local host,root=F.fixture(nil,nil,nil,cursor,false,nil,{touchScreen=function()return true end},api)
 assert(F.start(host));assert(H.Run.startCombat(host.run,'cultist_solo'));host.run.potions={'energy_potion'};host:refresh()
 host.controller.blocked=function()return blocked end
 local panel=root:GetChild('battlePanel');local pop=panel:GetChild('potionHelp'):GetChild('potionPopup')
 local bottle=panel:GetChild('potion1');for _,kind in ipairs({'down','up','click'})do bottle.listeners[kind]({touchId=70})end
 local use=pop:GetChild('use');use.listeners.down({touchId=71});use.listeners.up({touchId=71})
 blocked=true;use.listeners.click({});blocked=false
 use.listeners.click({touchId=71});use.listeners.click({})
 assert(host.run.potions[1] and host.run.combat.energy==3,'blocked release cannot resurrect')
 use.listeners.down({touchId=71});use.listeners.up({touchId=71});use.listeners.click({})
 assert(not host.run.potions[1] and host.run.combat.energy==5)
end
-- An actual click-only host keeps its original single anonymous ambiguity.
do
 local host,ui,panel=H.setup({'defend','defend'},{'cultist'})
 host.run.potions={'fire_potion'};host:refresh()
 panel:GetChild('potion1').listeners.click({touchId=80})
 local pop=panel:GetChild('potionHelp'):GetChild('potionPopup');local use=pop:GetChild('use')
 use.listeners.down({touchId=81});use.listeners.up({touchId=81});use.listeners.click({})
 local enemy=H.F.actorControl(panel,'enemy1'):GetChild('hit');local hp=host.run.combat.enemies[1].hp
 enemy.listeners.click({});enemy.listeners.click({touchId=81})
 assert(ui.potionAim and host.run.combat.enemies[1].hp==hp,'neither native anonymous nor owned named tail becomes a target')
end
do
 local host,ui,panel=H.setup({'defend','defend'},{'cultist'})
 host.run.potions={'energy_potion'};host:refresh()
 panel:GetChild('potion1').listeners.click({touchId=90})
 panel:GetChild('potionHelp'):GetChild('potionPopup'):GetChild('use').listeners.click({})
 local card=panel:GetChild('card1'):GetChild('hit')
 for _=1,400 do if not ui.busy then break end;host:update(.05)end
 card.listeners.click({});assert(not ui.selected,'one anonymous click-only tail is consumed')
 card.listeners.click({});assert(ui.selected,'anonymous compatibility barrier retires once')
end
print('POTION_POPUP_CLICK_PAYLOAD_PASS '..n..' owned sequences plus Controller and click-only boundaries')
