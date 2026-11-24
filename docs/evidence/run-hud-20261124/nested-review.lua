local H=assert(loadfile('tests/lua/support/mobile_run_hud_geometry.lua'))('helpers')
local Run=require('abyss_run')
for _,mobile in ipairs({false,true})do
 local ui,root,picture=H.create(mobile)
 ui.run.potions={[1]='fruit_juice',[2]='fire_potion',[3]='block_potion'}
 assert(Run.startCombat(ui.run,'cultist_solo'));ui:refresh();ui:update(1)
 local menuHit=root:GetChild('exitEntry'):GetChild('open'):GetChild('hit')
 local staleMenu={touchId=299}
 menuHit.listeners.down(staleMenu)
 assert(ui:openRelics(1));assert(not ui:openMenu(),'settings displaced relic modal')
 menuHit.listeners.up(staleMenu);menuHit.listeners.click(staleMenu)
 assert(ui.relicUI.visible and not ui.menuOpen,'stale settings touch displaced modal');assert(ui:closeDeck())
 H.click(picture,'/battlePanel/topBar/battleRoute/hit',301)
 assert(ui.routeOpen and ui.exitOpen,'route not open')
 assert(ui:openRelics(1),'route relic view blocked');assert(ui:closeDeck());assert(ui.routeOpen)
 assert(ui:openDeck(),'route deck blocked');assert(ui:closeDeck());assert(ui.routeOpen)
 assert(ui:openPotions(2),'route potion view blocked')
 local popup=root:GetChild('potionPanel')
 local use=popup:GetChild('use')
 assert(use.interactable==false and not ui.potionUI.targetMode,'map starts target selection')
 assert(ui:closePotions());assert(ui.routeOpen)
 assert(ui:openPotions(3),'route self potion view blocked')
 local count=ui.run.combat.player.block
 H.click(picture,'/potionPanel/use',302)
 assert(not ui.run.potions[3] and ui.run.combat.player.block>count,'legal no-target combat use blocked')
 assert(ui.routeOpen,'use loses caller')
 assert(ui:openPotions(1));H.click(picture,'/potionPanel/discard',303)
 assert(not ui.run.potions[1] and ui.routeOpen,'discard loses caller')
 assert(ui:openMenu(),'map settings blocked');assert(ui.routeOpen and ui.menuOpen,'settings loses route context');assert(ui:closeExit());assert(ui.routeOpen and not ui.menuOpen,'settings did not return route');
 assert(ui:closeExit());assert(not ui.routeOpen and ui.mode=='battle')
 print('REVIEW_A_NESTED_MAP_PASS '..tostring(mobile))
end
