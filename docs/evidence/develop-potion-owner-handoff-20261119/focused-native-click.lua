local H=dofile('tests/lua/support/battle_gesture_fixture.lua')
for _,named in ipairs({true,false})do
 local h,u,p,_,tap,drain=H.setup({'defend','defend'},{'cultist','jaw_worm'},{touchScreen=function()return true end})
 h.run.potions={'energy_potion'};h:refresh();tap('potion1',1000)
 local use=p:GetChild('potionHelp'):GetChild('potionPopup'):GetChild('use')
 use.listeners.down({touchId=17});use.listeners.up({touchId=17})
 local event={};if named then event.touchId=17 end
 use.listeners.click(event);drain()
 print('POTION_NATIVE_CLICK named='..tostring(named)..' menu='..tostring(u.potionMenu~=nil)..' inventory='..tostring(h.run.potions[1])..' energy='..h.run.combat.energy..' hand='..#h.run.combat.hand..' selected='..tostring(u.selected)..' payloadId='..tostring(event.touchId))
 if named then assert(not u.potionMenu and not h.run.potions[1] and h.run.combat.energy==5 and #h.run.combat.hand==2 and not u.selected,'named control')
 else assert(u.potionMenu and h.run.potions[1]=='energy_potion' and h.run.combat.energy==3 and #h.run.combat.hand==2 and not u.selected,'observed anonymous failure must be non-consuming')end
end
