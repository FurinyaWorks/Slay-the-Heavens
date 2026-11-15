local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Combat=require('abyss_combat')
local Discard=require('abyss_discard')
local Choice=require('abyss_choice_ui')
local Theme=require('abyss_theme')
assert(Theme.presentationProfile=='official-assets-first')
assert(Theme.layout.combatChoice.columns==3)
local spec
for _,layer in ipairs(F.Layout)do for _,panel in ipairs(layer.children or {})do
 if panel.name=='choicePanel'then spec=panel end
end end
local deck={};for i=1,15 do deck[i]='defend'end
local battle=Combat.new(F.Data,{deck=deck,enemies={'cultist'},seed=42})
Combat.draw(battle,10-#battle.hand);assert(Discard.begin(battle,9))
local run={phase='combat',combat=battle,combatGeneration=7}
local root=F.control(assert(spec));local commits=0
local view=Choice.new(root,F.Presentation,'click',{imageSource='static',cursorEvents={CursorDown='down',CursorUp='up'},
 color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end},function(kind,uids,token,generation,owner)
  commits=commits+1;assert(kind=='discard'and generation==7 and owner==battle)
  return Discard.choose(battle,uids,token)
 end)
local function emit(name,event,id)return root:GetChild(name):GetChild('hit').listeners[event]({touchId=id or 1})end
local function tap(name)emit(name,'down');emit(name,'up');return emit(name,'click')end
assert(view:refresh(run,true))
assert(root:GetChild('pageHint').text=='1 / 4')
assert(not root:GetChild('before'):GetChild('hit').interactable and not tap('before'))
assert(not tap('confirm')and commits==0)
local expected={}
for page=1,4 do
 assert(view.page==page and root:GetChild('pageHint').text==page..' / 4')
 if page<4 then
  for _,slot in ipairs({2,3,1})do
   local box=root:GetChild('card'..slot)
   assert(tap('card'..slot));expected[#expected+1]=battle.hand[(page-1)*3+slot].uid
   assert(box:GetChild('order').visible and box:GetChild('order').text=='已选 '..#expected)
  end
  emit('confirm','down',9);emit('confirm','up',9)
  assert(tap('after')and not emit('confirm','click',9)and commits==0,'old physical confirmation survived paging')
 end
end
assert(root:GetChild('card1').x==0 and not root:GetChild('card2').visible and not root:GetChild('card3').visible)
assert(not root:GetChild('after'):GetChild('hit').interactable and not tap('after'))
assert(not tap('card2')and not view:select(4))
assert(tap('before')and tap('after'))
for i,uid in ipairs(expected)do assert(view.selected[i]==uid)end
assert(#battle.hand==10 and #battle.discard==0)
assert(tap('confirm')and commits==1 and not view.visible and #battle.hand==1)
for i,uid in ipairs(expected)do assert(battle.discard[i].uid==uid)end
assert(not tap('confirm')and commits==1)

local host,canvas=F.fixture();assert(F.start(host))
assert(require('abyss_run').startCombat(host.run,'cultist_solo'));host:refresh()
assert(host.deckUI:openPile(host.run,'draw'));host.deckUI:update()
local tools=canvas:GetChild('deckPanel'):GetChild('pileTools')
for _,mode in ipairs({'original','type','cost','name'})do
 local field=tools:GetChild(mode)
 assert(field:GetChild('hit').listeners.click())
 assert(field:GetChild('direction').visible)
 local ascending=host.deckUI.sortAscending
 assert(field:GetChild('direction').rotation[3]==(ascending and 0 or 180))
 assert(field:GetChild('hit').listeners.click()and host.deckUI.sortAscending~=ascending)
 assert(field:GetChild('direction').rotation[3]==(host.deckUI.sortAscending and 0 or 180))
 for _,other in ipairs({'original','type','cost','name'})do
  assert(tools:GetChild(other):GetChild('direction').visible==(other==mode))
 end
end
host:disable()
local h,r=F.fixture();assert(F.start(h));local live=h.run
assert(h:openMenu())
local menu=r:GetChild('runMenu')
assert(not menu:GetChild('quit').visible,'pause repeats the destructive platform exit already offered by title')
for _,state in ipairs({'normal','hover','pressed','disabled'})do
 assert(menu:GetChild('mainMenu'):GetChild('hit'):GetChild(state):GetChild('label').text=='返回标题')
end
assert(h:returnToMainMenu()and h.run==live and h.sessionPaused)
assert(r:GetChild('menuPanel'):GetChild('titleQuit').visible)
assert(r:GetChild('menuPanel'):GetChild('sessionHint').text:find('退出奇域后无法继续',1,true))
assert(h:continueRun()and h.run==live and h:openMenu()and h:requestNavigation('abandon'))
assert(h.navigationAction=='abandon'and h.exitOpen and h.run==live)
assert(h:closeExit()and h.run==live)
h:disable()
print('MOBILE_CARD_INTERACTIONS_PASS')
