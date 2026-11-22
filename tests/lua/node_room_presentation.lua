local advanceShop = dofile('tests/lua/support/shop_timeline.lua')
-- Real Run/Map/Nodes and generated native controls.
local F = dofile('tests/lua/support/game_ui_fixture.lua')
local UI, Nodes = require("abyss_node_ui"), require("abyss_nodes")
local Run, Map, Combat = require("abyss_run"), require("abyss_map"), require("abyss_combat")
local Data, Layout, Presentation = F.Data, F.Layout, F.Presentation
local cursor = {CursorEnter="enter", CursorExit="exit", CursorDown="down", CursorUp="up", CursorEndDrag="endDrag"}
local function same(a,b)
    assert(type(a)==type(b))
    if type(a)~="table" then assert(a==b, tostring(a).." ~= "..tostring(b)) return end
    for k,v in pairs(a) do same(v,b[k]) end
    for k in pairs(b) do assert(a[k]~=nil) end
end
local function setup(kind,linked,extraCards,source,inputCovered)
    source=source or Data
    local run,map=Run.new(source,42),Map.generate(source,42)
    for _=1,extraCards or 0 do assert(Run.obtainCard(run,run.deck[1].cardId))end
    -- Frozen independent relic stream used by the existing membership-card fixture.
    run.relicPool=require('abyss_relic_pool').new('2',run.data.relicSource)
    if linked then
        run.campaign,run.endingUnlocked,run.act=true,true,1;run.keys={ruby=false,emerald=false,sapphire=false}
        dofile('tests/lua/support/sapphire_source_fixture.lua').stage(run,{gold='42'})
    end
    while not run.nodeFlow do
        local choices=Map.available(map) assert(#choices>0)
        for _,node in ipairs(choices) do
            if node.type==kind then assert(Nodes.enter(run,map,node.id)) break end
        end
        if not run.nodeFlow then assert(Map.choose(map,choices[1].id)) end
    end
    run.gold=10000 -- funding fixture only; original cards, prices and rules are unchanged
    local function find(list)
        for _,spec in ipairs(list) do
            if spec.name=="nodePanel" then return spec end
            local found=spec.children and find(spec.children) if found then return found end
        end
    end
    local root=F.control(assert(find(Layout)))
    local sounds={}
    local ui=UI.new(root,run,map,Presentation,"click",nil,{cursorEvents=cursor,enhancedRooms=true,inputCovered=inputCovered,color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,sound=function(cue)sounds[#sounds+1]=cue end})
    ui.testSounds=sounds
    ui:setVisible(true)
    if kind=="shop" then assert(root:GetChild("merchant"):GetChild("talk"):GetChild("hit").listeners.click());advanceShop(ui) end
    local function get(key)
        local box=root for part in key:gmatch("[^/]+") do box=assert(box:GetChild(part),key) end
        return box
    end
    local function emit(key,event,id,payload)
        local fn=get(key.."/hit").listeners[event]
        if fn then
            if payload=="nil" then return fn() end
            if payload=="empty" then return fn({}) end
            return fn({touchId=id})
        end
    end
    local function tap(key,id,payload)
        local box=get(key) while box do assert(box.visible,"hidden physical target") box=box.parent end
        emit(key,"down",id) emit(key,"up",id) return emit(key,"click",id,payload)
    end
    local function picker()
        assert(tap("shopView/removal",22)) assert(tap("pickerView/card1",22))
        assert(ui.mode=="picker" and ui.selected)
    end
    return ui,get,emit,tap,picker
end


local function test(name,fn)fn();print('ok room presentation - '..name)end
test('chest anticipates twice, bursts once, then reveals every reward without granting it',function()
 local ui,get,emit,tap=setup('treasure');local gold=ui.run.gold;local deck=#ui.run.deck
 assert(tap('treasureView/chest',1));assert(ui.presentationBusy,'opening needs an actual timeline')
 assert(#ui.testSounds==0,'opening sound belongs to the burst, not the initial click')
 assert(not ui:press('treasureView/chest'))
 ui:update(.045);local a=get('treasureView/closed').x
 ui:update(.09);local b=get('treasureView/closed').x
 assert(a~=b,'first shake must change pose')
 ui:update(.09);assert(get('treasureView/closed').x~=b,'second shake must change pose')
 ui:update(.16);assert(get('treasureView/burst').visible and get('treasureView/open').visible)
 assert(#ui.testSounds==1 and ui.testSounds[1]=='treasure_open')
 ui:update(1);assert(not ui.presentationBusy and not get('treasureView/burst').visible)
 for i,item in ipairs(ui.run.nodeFlow.reward.items)do
  assert(get('treasureView/rewardItem'..i).visible,'all rewards must be visible together')
  assert(#get('treasureView/rewardItem'..i..'/name').text>0)
 end
 assert(not get('treasureView/next').visible and not get('treasureView/previous').visible)
 assert(ui.run.gold==gold and #ui.run.deck==deck)
 assert(#ui.testSounds==1)
end)
test('visible reward rows claim gold independently and expire their old callback',function()
 local ui,get,emit,tap=setup('treasure',true)
 assert(tap('treasureView/chest',1));ui:update(2)
 local index,amount
 for i,item in ipairs(ui.run.nodeFlow.reward.items)do if item.kind=='gold' then index,amount=i,item.amount end end
 assert(index and amount>0)
 local key='treasureView/rewardItem'..index
 local old=ui.actions[key].handler;local gold=ui.run.gold;local pending=#ui.run.nodeFlow.reward.items
 assert(tap(key,2));assert(ui.run.gold==gold+amount and #ui.run.nodeFlow.reward.items==pending-1)
 assert(not old() and ui.run.gold==gold+amount)
 local pair=ui.run.nodeFlow.reward.sapphireKey;assert(pair and not ui.run.keys.sapphire)
end)
test('key and relic are simultaneously discoverable and mutually exclusive',function()
 local ui,get,emit,tap=setup('treasure',true)
 assert(tap('treasureView/chest',1));ui:update(2)
 local index,base
 for i,item in ipairs(ui.run.nodeFlow.reward.items)do
  if item.kind=='sapphire' then index=i elseif item.origin=='base' then base=item.id end
  assert(get('treasureView/rewardItem'..i).visible)
 end
 assert(index and base);local relics=#ui.run.relics
 assert(tap('treasureView/rewardItem'..index,2));assert(ui.run.keys.sapphire and #ui.run.relics==relics)
 for _,item in ipairs(ui.run.nodeFlow.reward.items)do assert(item.kind~='sapphire' and item.id~=base)end
end)
test('hover and long press expose full reward text without claiming on release',function()
 local ui,get,emit,tap=setup('treasure',true)
 assert(tap('treasureView/chest',1));ui:update(2)
 local index
 for i,item in ipairs(ui.run.nodeFlow.reward.items)do if item.origin=='base' then index=i end end
 local key='treasureView/rewardItem'..assert(index)
 local before=Combat.copy(ui.run)
 get(key..'/hit').listeners.enter({touchId=8})
 assert(get('treasureView/details').visible and #get('treasureView/details/description').text>0)
 get(key..'/hit').listeners.exit({touchId=8});assert(not get('treasureView/details').visible)
 emit(key,'down',9);ui:update(.4);assert(get('treasureView/details').visible)
 emit(key,'up',9);assert(not emit(key,'click',9));same(ui.run,before)
 ui:render();assert(not get('treasureView/details').visible)
end)
test('an interrupted animation never leaks into the next room or grants rewards',function()
 local ui,get,emit,tap=setup('treasure');local gold=ui.run.gold
 assert(tap('treasureView/chest',1));ui:update(.1);ui:setVisible(false)
 assert(not ui.presentationBusy and ui.run.gold==gold)
 ui:setVisible(true);ui:update(1)
 assert(not get('treasureView/burst').visible)
 for i in ipairs(ui.run.nodeFlow.reward.items)do assert(get('treasureView/rewardItem'..i).visible)end
end)
test('rest has a result beat and never heals twice',function()
 local ui,get,emit,tap=setup('camp');ui.run.hp=20;ui:render()
 assert(tap('campView/rest',1));local hp=ui.run.hp
 assert(ui.presentationBusy and get('roomEffect').visible)
 ui:update(2);assert(not ui.presentationBusy and ui.run.hp==hp and hp>20)
 assert(not ui:press('campView/rest'))
end)
local function tapCard(box, id)
 local hit = box:GetChild('hit')
 local event = {touchId=id}
 hit.listeners.down(event)
 return hit.listeners.click(event)
end
test('forge opens a five-column grid and confirms only from the before-after preview',function()
 local ui,get,_,tap=setup('camp',nil,2)
 assert(tap('campView/forge',1))
 local scroll=get('pickerView/forgeScroll')
 assert(scroll.visible and scroll.itemCount==12 and not get('pickerView/forgeFit').visible)
 assert(not get('confirm').visible and get('back'):GetChild('label').text=='返回营地')
 assert(get('pickerView/forgePrompt/label').text=='选择一张卡牌升级' and get('pickerView/page').text=='')
 scroll.scrollProgress=.8
 assert(tapCard(scroll.items[0],2))
 assert(not scroll.visible and not get('pickerView/forgePrompt').visible)
 assert(get('pickerView/before').scale[1]>=1.4 and get('pickerView/after').visible and get('pickerView/arrow').visible)
 assert(get('confirm').visible and get('back'):GetChild('label').text=='取消')
 assert(not ui.run.deck[1].upgraded and tap('back',3))
 assert(ui.mode=='picker' and not ui.selected and scroll.visible and scroll.scrollProgress==.8)
 assert(tapCard(scroll.items[0],4));assert(tap('confirm',5))
 assert(ui.presentationBusy);ui:update(.25)
 assert(not ui.presentationBusy and ui.testSounds[1]=='forge')
 assert(ui.run.deck[1].upgraded and ui.result and ui.result.choice=='upgrade')
 assert(get('campView').visible and not get('pickerView').visible)
end)
test('forge retains the native list and skips unchanged faces during scroll callbacks',function()
 local ui,get,_,tap=setup('camp',nil,3)
 assert(Run.obtainCard(ui.run,'searing_blow',{upgrades=2}))
 local repeatable=ui.run.deck[#ui.run.deck]
 assert(repeatable.lastUpgradeOrigin)
 ui:render()
 local scroll=get('pickerView/forgeScroll')
 local refresh,refreshes=scroll.RefreshItems,0
 function scroll:RefreshItems(...)
  refreshes=refreshes+1
  return refresh(self,...)
 end
 assert(tap('campView/forge',1) and refreshes==2)
 local box=scroll.items[0]
 local face=box:GetChild('description')
 local sizeDelta,writes=face.SetSizeDelta,0
 function face:SetSizeDelta(...)
  writes=writes+1
  return sizeDelta(self,...)
 end
 local old=ui.actions['pickerView/forgeScroll/card1'].handler
 -- The first two copies look identical, but tapping a recycled control must use its new UID.
 local event={touchId=2}
 local hit=box:GetChild('hit')
 hit.listeners.down(event)
 for i=1,30 do
  scroll.scrollProgress=i/30
  assert(scroll:recycle(0,i%2)==box)
 end
 assert(writes==0 and not hit.listeners.click(event) and not ui.selected)
 scroll:recycle(0,1)
 assert(tapCard(box,3) and ui.selected==ui.upgradeRows[2].uid)
 assert(tap('back',4) and scroll.scrollProgress==1 and refreshes==2)
 assert(not old() and not ui.selected)
 assert(tap('back',5) and tap('campView/forge',6))
 assert(scroll.scrollProgress==0 and refreshes==2 and writes==0)
 ui.run.deck[2].damageBonus=5
 ui:render()
 scroll:recycle(0,1)
 assert(refreshes==3 and writes>0, 'a changed card still needs to be painted')
 ui:setVisible(false)
 ui:setVisible(true)
 assert(refreshes==4 and scroll.itemCount==14)
end)
test('camp idle preloads only the first window and opens it without painting or refreshing',function()
 local covered=true
 local ui,get,_,tap=setup('camp',nil,70,nil,function()return covered end)
 local scroll=get('pickerView/forgeScroll')
 function scroll:flush()
  for i=0,math.min(self.itemCount,15)-1 do self:recycle(i,i+self.indexBase) end
 end
 local refresh,refreshes=scroll.RefreshItems,0
 function scroll:RefreshItems(...)
  refreshes=refreshes+1
  return refresh(self,...)
 end
 local display=require('abyss_card_display')
 local write,paints=display.writeBody,0
 function display.writeBody(...)
  paints=paints+1
  return write(...)
 end
 local before=Combat.copy(ui.run)
 local mapView, mapQueries = Map.view, 0
 function Map.view(...)
  mapQueries=mapQueries+1
  return mapView(...)
 end
 ui:update(.016)
 assert(refreshes==0 and paints==0)
 covered=false
 local function countActions()
  local count=0
  for key in pairs(ui.actions) do
   if key:match('^pickerView/forgeScroll/card%d+$') then count=count+1 end
  end
  return count
 end
 for _=1,10 do
  local previous=paints
  ui:update(.016)
  assert(paints-previous<=2 and countActions()==0)
 end
 assert(paints==15 and refreshes==2 and not scroll.visible and not get('pickerView').visible)
 assert(not tapCard(scroll.items[0],3) and not ui.selected)
 assert(tap('campView/forge',1))
 assert(scroll.visible and scroll.itemCount==80 and paints==15 and refreshes==2 and countActions()==15 and mapQueries==0)
 assert(scroll.items[14].visible and #scroll.items[14]:GetChild('description').text>0)
 same(ui.run,before)
 assert(ui:press('pickerView/forgeScroll/card80') and ui.selected==ui.run.deck[80].uid)
 display.writeBody, Map.view=write,mapView
end)
test('forge retries a partial hidden window and ignores obsolete refreshes after the deck changes',function()
 local ui,get,_,tap=setup('camp',nil,6)
 local scroll=get('pickerView/forgeScroll')
 local refresh,flush,refreshes=scroll.RefreshItems,scroll.flush,0
 function scroll:flush()
  if not self.visible and self.itemCount>1 then
   self:recycle(0,self.indexBase)
  else
   flush(self)
  end
 end
 function scroll:RefreshItems(...)
  refreshes=refreshes+1
  return refresh(self,...)
 end
 ui:update(.016)
 assert(refreshes==2 and not scroll.items[1])
 assert(tap('campView/forge',1) and refreshes==3 and scroll.items[1].visible)
 local obsolete,oldBox=scroll.refreshCallback,scroll.items[0]
 assert(tap('back',2))
 ui.run.deck[1].upgraded=true
 scroll.deferRefresh=true
 ui:render();ui:update(.016)
 assert(not oldBox.visible)
 assert(tap('campView/forge',3))
 obsolete(oldBox,0)
 assert(not oldBox.visible and not tapCard(oldBox,4) and not ui.selected)
 scroll:flush()
 assert(tapCard(oldBox,5) and ui.selected==ui.run.deck[2].uid)
end)
test('a host that rejects hidden refresh can still open the visible forge',function()
 local ui,get,_,tap=setup('camp',nil,6)
 local scroll=get('pickerView/forgeScroll')
 local refresh,refusals=scroll.RefreshItems,0
 function scroll:RefreshItems(amount,fn)
  if not self.visible then refusals=refusals+1;error('inactive native grid') end
  return refresh(self,amount,fn)
 end
 ui:update(.016);ui:update(.016)
 assert(refusals==1 and not scroll.visible)
 assert(tap('campView/forge',1) and tapCard(scroll.items[0],2))
 assert(ui.selected==ui.run.deck[1].uid)
end)
test('an interrupted hidden refresh leaves the next forge open usable',function()
 local ui,get,_,tap=setup('camp',nil,6)
 local scroll=get('pickerView/forgeScroll')
 local refresh,interrupted=scroll.RefreshItems,false
 function scroll:RefreshItems(amount,fn)
  refresh(self,amount,fn)
  if amount>1 and not interrupted then
   interrupted=true
   ui:setVisible(false)
  end
 end
 ui:update(.016)
 assert(interrupted and not ui.visible)
 ui:setVisible(true)
 assert(tap('campView/forge',1) and tapCard(scroll.items[0],2))
 assert(ui.selected==ui.run.deck[1].uid)
end)
test('the visible grid restores artwork for cells recycled while covered',function()
 local ui,get,_,tap=setup('camp',nil,3)
 local display=Presentation[ui.run.deck[1].cardId]
 local previousArt=display.nativeArt
 display.nativeArt={cardId=ui.run.deck[1].cardId}
 local CardDisplay=require('abyss_card_display')
 local write=CardDisplay.writeNativeArt
 local box,paints
 function CardDisplay.writeNativeArt(face,...)
  if face==box then paints=paints+1 end
  return write(face,...)
 end
 local scroll=get('pickerView/forgeScroll')
 assert(tap('campView/forge',1))
 box,paints=scroll.items[0],0
 ui:setVisible(false,true)
 scroll:recycle(0,1)
 assert(paints==0)
 ui:setVisible(true,true)
 CardDisplay.writeNativeArt,display.nativeArt=write,previousArt
 assert(paints==1,'the recycled face must request its artwork when revealed')
end)
test('a recycled card only shows the new type after releasing native art',function()
 local ui,get,_,tap=setup('camp',nil,6)
 local scroll=get('pickerView/forgeScroll')
 local attack,skill=ui.run.deck[1],nil
 for index,card in ipairs(ui.run.deck) do
  for _,definition in ipairs(ui.run.data.cards.cards) do
   if definition.id==card.cardId and definition.type=='skill' then skill=index;break end
  end
  if skill then break end
 end
 local display=Presentation[attack.cardId]
 local original=display.nativeArt
 display.nativeArt={cardId=attack.cardId,capacity=0,slots={}}
 local refresh=scroll.RefreshItems
 function scroll:RefreshItems(amount,fn)
  return refresh(self,amount,function(box,index)
   if not box:GetChild('artSamples') then
    box.children.artSamples=F.control({name='artSamples',kind='container',size={144,64}},box)
   end
   fn(box,index)
  end)
 end
 assert(tap('campView/forge',1))
 local box=scroll.items[0]
 assert(box:GetChild('artSamples').visible)
 assert(scroll:recycle(0,assert(skill)-1)==box)
 assert(not box:GetChild('art_attack').visible and box:GetChild('art_skill').visible)
 display.nativeArt=original
end)
test('a small eligible set is centered without a scroll bar and re-entry starts clean',function()
 local ui,get,_,tap=setup('camp')
 for i=3,#ui.run.deck do ui.run.deck[i].upgraded=true end
 ui:render()
 assert(tap('campView/forge',1))
 local fit=get('pickerView/forgeFit')
 assert(fit.visible and fit.itemCount==2 and not get('pickerView/forgeScroll').visible)
 assert(fit.sizeDeltaX==387 and fit.sizeDeltaY==273)
 assert(tap('back',2) and get('campView').visible)
 assert(tap('campView/forge',3) and not ui.selected and not get('confirm').visible)
end)
test('scroll reaches the last card without allowing a recycled or dragged touch to select it',function()
 local ui,get,_,tap=setup('camp',nil,3)
 local scroll=get('pickerView/forgeScroll')
 scroll.indexBase=1
 scroll.deferRefresh=true
 assert(tap('campView/forge',1))
 scroll:flush();ui:update(0);scroll:flush()
 assert(scroll.itemCount==13 and scroll.visible)
 local box=scroll.items[0]
 local old=box:GetChild('hit')
 local event={touchId=2}
 old.listeners.down(event)
 scroll.scrollProgress=1
 assert(scroll:recycle(0,13)==box)
 assert(not old.listeners.click(event) and not ui.selected)
 old.listeners.down(event);old.listeners.endDrag(event)
 assert(not old.listeners.click(event) and not ui.selected)
 local other={touchId=3}
 local second=scroll.items[1]:GetChild('hit')
 assert(not second.listeners.click({touchId=3, GetPressUIPos=function() return 20,-100 end,
  GetUIPos=function() return 20,-220 end}) and not ui.selected)
 old.listeners.down(event);old.listeners.down(other)
 old.listeners.endDrag(event)
 assert(not old.listeners.click(event) and not ui.selected)
 old.listeners.up(other)
 assert(old.listeners.click({}) and ui.selected==ui.run.deck[13].uid)
end)
test('a remaining mandatory upgrade returns to the grid and removes the ineligible card',function()
 local source=Combat.copy(Data);source.rules.camp.upgradeCount=2
 local ui,get,_,tap=setup('camp',nil,nil,source)
 local fit=get('pickerView/forgeFit')
 assert(tap('campView/forge',1));assert(tapCard(fit.items[0],2));assert(tap('confirm',3))
 local hit,event=fit.items[0]:GetChild('hit'),{touchId=4}
 hit.listeners.down(event)
 ui:update(.25)
 hit.listeners.up(event)
 assert(not hit.listeners.click(event), 'a press during the forge effect must stay blocked')
 assert(ui.run.phase=='node' and not ui.selected and not get('back').visible)
 assert(ui.run.deck[1].upgraded and fit.itemCount==9 and ui.upgradeRows[1].uid==ui.run.deck[2].uid)
 assert(tapCard(fit.items[0],5));assert(tap('confirm',6));ui:update(2)
 assert(ui.run.phase=='map' and ui.run.deck[2].upgraded and ui.result.choice=='upgrade')
end)
