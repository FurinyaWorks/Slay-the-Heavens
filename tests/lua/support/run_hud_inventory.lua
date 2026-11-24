local mode=...
local H=assert(loadfile('tests/lua/support/mobile_run_hud_geometry.lua'))('helpers')
local Run=require('abyss_run')
local integer=require('abyss_numbers').integer
local Map=require('abyss_map')
local Routes=dofile('tests/lua/support/map_routes.lua')
local function enter(host,kind,event)
 if event then host.run.data.rules.events.encounterId=event end
 local path=Routes.to(host.map,function(n)return n.type==kind and n.roomKind~='boss_treasure'end)
 for i=1,#path-1 do assert(Map.choose(host.map,path[i]))end
 host:refresh();assert(host.mapUI:choose(path[#path]))
end
local function visible(root,name)return root:GetChild(name).visible end
if mode=='relics' then
 for _,mobile in ipairs({true,false})do
  local host,root,picture=H.create(mobile)
  local cap=mobile and 11 or 25
  for _,n in ipairs({0,1,2,3,5,cap-1,cap,cap+1,25,26,53})do
   host.run.relics={};for i=1,n do host.run.relics[i]=i%2==0 and 'omamori' or 'burning_blood' end
   host:refresh()
   local bar=root:GetChild('relicBar')
   for i=1,25 do local slot=bar:GetChild('slot'..i);assert(slot.visible==(i<=math.min(cap,n)),'owned-only slot '..i..' at '..n)
    assert(not slot:GetChild('more').visible,'+N forbidden')end
   local pages=math.max(1,math.ceil(n/cap))
   assert(host.relicUI.barPage==1 and host.relicUI.barCapacity==cap,'capacity/paging policy')
   for page=1,pages do
    for i=1,math.min(cap,n-(page-1)*cap)do
     H.click(picture,'/relicBar/slot'..i..'/hit',100+i)
     assert(host.relicUI.selectedIndex==(page-1)*cap+i,'clicked index')
     assert(host.relicUI.selected.id==host.run.relics[(page-1)*cap+i])
     local single=root:GetChild('relicPanel'):GetChild('single')
     if n>1 then local selected=host.relicUI.selectedIndex;host.relicUI:turn(selected<n and 1 or -1);assert(single==root:GetChild('relicPanel'):GetChild('single'),'detail pool')end
     assert(host:closeDeck());assert(host.relicUI.barPage==page,'detail changed bar page')
    end
    if page<pages then H.click(picture,'/relicBar/next/hit',500+page)end
   end
   assert(not host.relicUI:turnBar(1),'last bar boundary')
   while host.relicUI.barPage>1 do assert(host.relicUI:turnBar(-1))end
   assert(not host.relicUI:turnBar(-1),'first bar boundary')
  end
  assert(host:openRelics(1));assert(host.relicUI.selectedIndex==1);assert(not host.relicUI:turn(-1));assert(host:closeDeck())
  host.run.relics={};host:refresh();assert(not host:openRelics(),'no empty collection entry')
 end
elseif mode=='mutations' then
 for _,mobile in ipairs({true,false})do
  local host,root,picture=H.create(mobile)
  host.run.relics={'matryoshka','omamori'};host.run.relicCounters={matryoshka=2,omamori=1};host:refresh()
  local menu=root:GetChild('exitEntry'):GetChild('open'):GetChild('hit')
  for _,closed in ipairs({false,true})do
   local touch={touchId=72};menu.listeners.down(touch);assert(host:openRelics(1))
   if closed then assert(host:closeDeck())end
   menu.listeners.up(touch);menu.listeners.click(touch)
   assert(not host.exitOpen,'stale menu touch crossed detail generation')
   if not closed then assert(host.relicUI.visible);assert(host:closeDeck())end
  end
  local slot=root:GetChild('relicBar'):GetChild('slot1')
  local icon=slot:GetChild('icon');local art=slot:GetChild('iconArt')
  local shape=art:GetChild('shape0');local prior=shape.imageColor
  host.run.relicCounters.matryoshka=0;host:refresh()
  assert(shape.imageColor.r<prior.r,'exhausted native relic art did not darken')
  local hit=slot:GetChild('hit');hit.listeners.enter()
  assert(root:GetChild('relicBar'):GetChild('tooltip').visible)
  host.run.relics[1]='burning_blood';host:refresh()
  assert(not root:GetChild('relicBar'):GetChild('tooltip').visible,'replaced relic retains old tooltip')
  local box=picture.at('/relicBar/slot1/hit')
  local drag={touchId=88,dragging=true};hit.listeners.down(drag);hit.listeners.up(drag);hit.listeners.click(drag);assert(not host.relicUI.visible,'drag opened detail')
  H.click(picture,'/relicBar/slot1/hit',1)
  if mobile then
   for _,name in ipairs({'close','next'})do
    local box=picture.at('/relicPanel/'..name..'/hit');assert(box.w/3>=44 and box.h/3>=44,'detail '..name..' below 44pt')
   end
  end
  table.remove(host.run.relics,1);host:refresh()
  assert(host.relicUI.selectedIndex==1 and host.relicUI.selected.id=='omamori','detail loses remaining relic')
  assert(host:closeDeck())
  local n=mobile and 12 or 26;host.run.relics={};for i=1,n do host.run.relics[i]='burning_blood'end;host:refresh()
  local stale={touchId=77};hit.listeners.down(stale)
  H.click(picture,'/relicBar/next/hit',2)
  hit.listeners.up(stale);hit.listeners.click(stale);assert(not host.relicUI.visible,'old bar page touch revived')
  table.remove(host.run.relics);host:refresh();assert(host.relicUI.barPage==1,'bar did not clamp after loss')
  assert(host:openRelics(1))
  local blocker=root:GetChild('relicPanel'):GetChild('blocker');local staleModal={touchId=91}
  if blocker.listeners.down then blocker.listeners.down(staleModal)end
  assert(host:closeDeck());assert(host:openRelics(2))
  if blocker.listeners.up then blocker.listeners.up(staleModal)end
  blocker.listeners.click(staleModal);assert(host.relicUI.visible,'old outside touch closed new detail');assert(host:closeDeck())
  local nextHit=root:GetChild('relicBar'):GetChild('next'):GetChild('hit')
  nextHit.listeners.down(stale);host:onEngineDestroy();nextHit.listeners.up(stale);nextHit.listeners.click(stale)
  assert(host.relicUI.barPage==1,'destroyed host accepts paging')
 end
elseif mode=='pages' then
 for _,mobile in ipairs({true,false})do
  local host,root,picture=H.create(mobile)
  enter(host,'event','upgrade_shrine')
  assert(visible(root,'relicBar') and visible(root,'potionEntry'),'ordinary event hides Run inventory')
  assert(host:openRelics(1) and host.relicUI.selectedIndex==1);assert(host:closeDeck())
  H.click(picture,'/nodePanel/eventView/option2/hit',1)
  assert(host.run.phase=='map' and host.mode=='node')
  assert(visible(root,'relicBar') and visible(root,'potionEntry'),'retained result hides inventory')
  assert(host:openDeck() and host:closeDeck())
  H.click(picture,'/nodePanel/confirm/hit',2)
  assert(host.mode=='map' and visible(root,'relicBar'))
  assert(host:openMenu());assert(not host:openRelics(1));assert(host:closeExit())
  for _,phase in ipairs({'victory','defeat'})do host.run.phase=phase;host:refresh();assert(not visible(root,'relicBar') and not visible(root,'potionEntry') and not visible(root,'deckEntry'),'settlement Run HUD '..phase)end
 end
elseif mode=='potions' then
 for _,capacity in ipairs({2,3,5})do
  local host,root,picture=H.create(true);host.run.potionSlots=capacity;host.run.potions={};host:refresh()
  local faces=root:GetChild('potionEntry'):GetChild('open'):GetChild('hit'):GetChild('normal')
  for i=1,5 do assert(faces:GetChild('slot'..i).visible==(i<=capacity),'empty capacity slots')end
  host.run.potions={[1]='fruit_juice',[capacity]='fire_potion'};host:refresh()
  assert(host:openPotions(capacity));assert(not Run.potionSlotView(host.run,capacity).canUse);assert(host:closePotions())
  assert(host:openPotions(1));assert(Run.potionSlotView(host.run,1).canUse);assert(host:closePotions())
  enter(host,'event','lab');assert(visible(root,'potionEntry'),'lab hides potions before reward')
  H.click(picture,'/nodePanel/eventView/option1/hit',1)
  host.run.potions={};for i=1,capacity do host.run.potions[i]='fire_potion'end;host:refresh()
  assert(host:openPotions(capacity));H.click(picture,'/potionPanel/discard',2)
  H.click(picture,'/nodePanel/eventView/option1/hit',3);assert(host.run.potions[capacity],'full reward cannot free slot')
 end
elseif mode=='route' then
 for _,mobile in ipairs({true,false})do
  local host,root,picture=H.create(mobile)
  assert(Run.startCombat(host.run,'cultist_solo'));host.run.potions={'fire_potion','energy_potion','blood_potion'}
  host:refresh();host:update(1)
  H.click(picture,'/battlePanel/topBar/battleRoute/hit',1)
  assert(host.routeOpen and visible(root,'potionEntry'))
  assert(host:openMenu() and root:GetChild('runMenu').visible);assert(host:closeExit());assert(host.routeOpen,'settings lost map caller')
  assert(host:openRelics(1));assert(host:closeDeck());assert(host.routeOpen,'detail lost map caller')
  assert(host:openDeck());assert(host:closeDeck());assert(host.routeOpen,'deck lost map caller')
  H.click(picture,'/potionEntry/slot1/hit',2)
  local popup=root:GetChild('potionPanel');assert(popup.visible)
  assert(not popup:GetChild('use').interactable,'route allowed enemy targeting')
  H.click(picture,'/potionPanel/dismiss',3)
  H.click(picture,'/potionEntry/slot2/hit',4)
  H.click(picture,'/potionPanel/use',5);assert(not host.run.potions[2],'route self potion failed')
  H.click(picture,'/potionEntry/slot3/hit',6)
  H.click(picture,'/potionPanel/discard',7);assert(not host.run.potions[3])
  H.click(picture,'/mapPanel/mapRoute/hit',8)
  assert(not host.routeOpen and host.run.phase=='combat' and host.mode=='battle')
 end
elseif mode=='special-potions' then
 for _,mobile in ipairs({true,false})do
  for _,id in ipairs({'blood_potion','fruit_juice','entropic_brew'})do
   local host,root,picture=H.create(mobile);host.run.potions={[1]=id};host.run.hp=30;host:refresh()
   local hp,max=host.run.hp,host.run.maxHp
   H.click(picture,'/potionEntry/slot1/hit',1)
   assert(Run.potionSlotView(host.run,1).canUse)
   H.click(picture,'/potionPanel/use',2)
   assert(not host.potionUI.visible)
   if id=='blood_potion'then assert(host.run.hp>hp and not host.run.potions[1])
   elseif id=='fruit_juice'then assert(host.run.maxHp>max and not host.run.potions[1])
   else assert(Run.potionCount(host.run)==Run.potionCapacity(host.run))end
  end
  local host,root,picture=H.create(mobile)
  host.run.potions={'blood_potion','fruit_juice','entropic_brew'};host:refresh()
  enter(host,'event','we_meet_again')
  assert(visible(root,'potionEntry')and visible(root,'relicBar'),'trade event hides inventory')
  for i=1,3 do
   assert(host:openPotions(i),'restricted potion cannot be inspected')
   local item=Run.potionSlotView(host.run,i);assert(not item.canUse and not item.canDiscard and item.reason=='potion_event_restricted')
   assert(not Run.usePotion(host.run,i) and not Run.discardPotion(host.run,i));assert(host:closePotions())
  end
  H.click(picture,'/nodePanel/eventView/option4/hit',3)
  assert(host.run.nodeFlow.event.stage=='result')
  assert(not Run.potionSlotView(host.run,1).canDiscard,'trade lock lost before floor exit')
  H.click(picture,'/nodePanel/eventView/option1/hit',4)
  if host.mode=='node'then H.click(picture,'/nodePanel/confirm/hit',5)end
  assert(host.mode=='map' and not Run.potionSlotView(host.run,1).canDiscard)
  host.run.data.rules.events.encounterId='upgrade_shrine'
  assert(host.mapUI:choose(Map.available(host.map)[1].id))
  assert(Run.potionSlotView(host.run,1).canDiscard,'trade lock survives room exit')
  local woman,wr,wp=H.create(mobile);woman.run.gold=100;woman.run.potions={'fire_potion','fire_potion','fire_potion'}
  enter(woman,'event','woman_in_blue');assert(visible(wr,'potionEntry'))
  H.click(wp,'/nodePanel/eventView/option3/hit',6)
  assert(woman.run.nodeFlow.event.stage=='potion_rewards')
  H.click(wp,'/potionEntry/slot2/hit',7);H.click(wp,'/potionPanel/discard',8)
  H.click(wp,'/nodePanel/eventView/option1/hit',9)
  assert(woman.run.nodeFlow.event.potionOffers[1].claimed and woman.run.potions[2],'Woman in Blue full-slot claim')
 end
elseif mode=='geometry' then
 for _,mobile in ipairs({true,false})do
  local host,root,picture,screen=H.create(mobile)
  local relic=picture.at('/relicBar/slot1/hit')
  for step=0,6 do
   if step>0 then assert(host.mapUI:scrollBy(120))end
   for _,group in ipairs(root:GetChild('mapPanel'):GetChildren())do
    if group.name:match('^mapGroup')then for _,node in ipairs(group:GetChildren())do
     if node.name:match('^node%d+$')and node.visible then
      local box=picture.at('/mapPanel/'..group.name..'/'..node.name..'/hit')
      assert(box.y+box.h/2<=relic.y-relic.h/2+.001,'map node invades relic band')
     end
    end end
   end
  end
  host.mapUI:focusCurrent()
  enter(host,'event','upgrade_shrine')
  local bar=picture.at('/nodePanel/officialRunBar/steel')
  local field=picture.at('/nodePanel/eventView/plateBorder/v25EventParchment/field')
  assert(field.y+field.h/2<=bar.y-bar.h/2+.001,'event field covers resource HUD')
  local relic=picture.at('/relicBar/slot1/hit');local name=picture.at('/nodePanel/eventView/name')
  assert(name.y+name.h/2<=relic.y-relic.h/2,'event title overlaps relic band')
 end
elseif mode=='lifecycle' then
 local F=dofile('tests/lua/support/game_ui_fixture.lua')
 local function count(c,seen)
  seen=seen or {};if seen[c]then return 0,0 end;seen[c]=true
  local objects,bindings=1,0
  for _ in pairs(c.listeners or {})do bindings=bindings+1 end
  for _,child in ipairs(c:GetChildren())do local n,l=count(child,seen);objects,bindings=objects+n,bindings+l end
  for _,child in pairs(c.items or {})do local n,l=count(child,seen);objects,bindings=objects+n,bindings+l end
  return objects,bindings
 end
 for _,mobile in ipairs({true,false})do
  local host,root,picture=H.create(mobile)
  local function check(label)
   assert(visible(root,'relicBar') and visible(root,'deckEntry'),'HUD missing: '..label)
   if host.run.phase~='combat'then assert(visible(root,'potionEntry'),'potion slots missing: '..label)end
   local owner=root:GetChild(host.mode=='battle' and 'battlePanel' or host.mode=='map' and 'mapPanel' or 'nodePanel')
   local resources=owner:GetChild('resources')or owner
   local hp=resources:GetChild(host.mode=='battle' and 'player' or 'hp')
   local gold=resources:GetChild(host.mode=='battle' and 'piles' or 'gold')
   assert(hp.visible and gold.visible,'resource fragments hidden: '..label)
   if host.mode~='battle' then assert(hp.text==integer(host.run.hp)..'/'..integer(host.run.maxHp) and gold.text==integer(host.run.gold),'stale resource values '..label..' hp='..hp.text..' expected='..tostring(host.run.hp)..'/'..tostring(host.run.maxHp)..' gold='..gold.text..' expected='..tostring(host.run.gold))end
   assert(host:openRelics(1));assert(visible(root,'relicBar'),'modal removes underlying HUD');assert(host:closeDeck())
   assert(host:openDeck());assert(visible(root,'relicBar'),'deck removes Run HUD');assert(not host:openPotions(1));assert(host:closeDeck())
   assert(host:openMenu());assert(visible(root,'relicBar'),'settings removes Run HUD');assert(host:closeExit())
   print('HUD_CHAIN '..(mobile and 'phone 'or 'pc ')..label..' '..host.mode..' '..host.run.phase)
  end
  assert(host.run.nodeFlow.event.id=='neow','campaign opening not exercised');check('blessing')
  H.click(picture,'/nodePanel/eventView/option1/hit',1)
  H.click(picture,'/nodePanel/eventView/option1/hit',2)
  -- Decline any remaining source opening screen using its real event action.
  for _=1,6 do
   if host.mode=='map' then break end
   local actions=host.nodeUI.actions
   local chosen
   for i=4,1,-1 do local key='eventView/option'..i;if actions[key]and actions[key].enabled then chosen=key;break end end
   if chosen then H.click(picture,'/nodePanel/'..chosen..'/hit',3)else H.click(picture,'/nodePanel/confirm/hit',4)end
  end
  assert(host.mode=='map');check('map')
  -- A real connected production seed-1 path containing this ordered room chain.
  local wanted={'combat','event','shop','camp','treasure'}
  local index={};for _,n in ipairs(host.map.nodes)do index[n.id]=n end
  local function pathFrom(id,step)
   local n=index[id];if n.type==wanted[step]then step=step+1 end
   if #n.nextIds==0 then return step>#wanted and {id}or nil end
   for _,nextId in ipairs(n.nextIds)do local tail=pathFrom(nextId,step);if tail then table.insert(tail,1,id);return tail end end
  end
  local route
  for _,n in ipairs(Map.available(host.map))do route=pathFrom(n.id,1);if route then break end end
  assert(route,'production map lacks ordered chain')
  host.run.data.rules.events.encounterId='upgrade_shrine'
  for _,id in ipairs(route)do
   assert(host.mapUI:choose(id));local flow=host.run.nodeFlow;local kind=flow.type
   check(kind)
   if host.mode=='battle' then
    -- Deterministic combat outcome fixture; real finish/reward/page commands.
    H.click(picture,'/battlePanel/topBar/battleRoute/hit',8);assert(host.routeOpen);assert(visible(root,'relicBar') and visible(root,'potionEntry'),'route hides inventory');assert(host:closeExit())
    for _,enemy in ipairs(host.run.combat.enemies)do enemy.hp=0 end
    host.run.combat.phase='victory';assert(Run.finishCombat(host.run));host:refresh();check('reward')
    H.click(picture,'/battlePanel/cardReward',10);check('reward-card-choice')
    H.click(picture,'/battlePanel/skip',11)
    if host.run.phase=='reward' then
     if host.run.rewards.goldClaimed==false then H.click(picture,'/battlePanel/goldReward',12)end
     H.click(picture,'/battlePanel/continue',13)
    end
   elseif kind=='event' then
    H.click(picture,'/nodePanel/eventView/option1/hit',20);check('event-card-choice')
    H.click(picture,'/nodePanel/pickerView/card1/hit',21)
    H.click(picture,'/nodePanel/confirm/hit',22)
    if host.mode=='node' then H.click(picture,'/nodePanel/confirm/hit',23)end
   elseif kind=='shop' then
    H.click(picture,'/nodePanel/back/hit',30);host:update(.4)
    if host.mode=='node' then H.click(picture,'/nodePanel/confirm/hit',31)end
   elseif kind=='camp' then
    if host.nodeUI.actions['campView/rest'].enabled then
     H.click(picture,'/nodePanel/campView/rest/hit',40)
    else
     H.click(picture,'/nodePanel/campView/forge/hit',40)
     local hit=root:GetChild('nodePanel'):GetChild('pickerView'):GetChild('forgeFit').items[0]:GetChild('hit')
     local event={touchId=401}
     for _,kind in ipairs({'down','up','click'})do if hit.listeners[kind]then hit.listeners[kind](event)end end
     H.click(picture,'/nodePanel/confirm/hit',402)
    end
    host.nodeUI:update(2);host:refresh()
    H.click(picture,'/nodePanel/confirm/hit',41)
   elseif kind=='treasure' then
    H.click(picture,'/nodePanel/treasureView/chest/hit',50);host.nodeUI:update(2)
    if flow.roomKind=='boss_treasure' then check('boss-relic-choice')end
    -- Leave through the native room's existing skip action, preserving RNG.
    H.click(picture,'/nodePanel/back/hit',51)
    if host.mode=='node' and host.run.phase=='map' then H.click(picture,'/nodePanel/confirm/hit',52)end
   end
   if host.run.phase=='act_transition' then check('act-transition');break end
   if host.mode=='map'then check('map-return')end
  end
  assert(host:openMenu());assert(host:returnToMainMenu());assert(not visible(root,'relicBar'))
  local same=host.run;assert(host:continueRun());assert(host.run==same);check('continue')
  -- Warm each modal pool, then check no controls/listeners grow over repeated cycles.
  check('warm');local objects,bindings=count(root)
  for i=1,20 do check('cycle-'..i)end
  local after,afterBindings=count(root);assert(after==objects and afterBindings==bindings,'HUD objects/bindings grow')
  assert(host:openMenu());assert(host:returnToMainMenu());assert(host:requestNavigation('new'));assert(host:confirmNavigation())
  assert(host.run==nil and host.characterOpen,'new run did not return to selection')
  assert(host:selectCharacter('traveler'));assert(host:selectElement('ironclad'));assert(host:confirmCharacter())
  assert(host.run~=same and host.run.floor==0 and host.relicUI.barPage==1,'new run reused old resources')
 end

end
print('RUN_HUD_PASS '..mode)
