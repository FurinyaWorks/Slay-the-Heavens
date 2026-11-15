local F=dofile('tests/lua/support/game_ui_fixture.lua')
local cursor={CursorDown='down',CursorUp='up',CursorExit='exit',CursorEndDrag='endDrag',CursorEnter='enter'}
local ui,root=F.fixture(nil,nil,nil,cursor)
assert(root:GetChild('compendiumEntries'),'missing actual generated catalogue entries')
local panel=root:GetChild('compendiumPanel')
assert(panel:GetChild('cardGrid')and panel:GetChild('iconGrid'),'source port requires actual native catalogue grids')
local Host=ABYSS_COMPENDIUM_MUTANT and assert(load(ABYSS_COMPENDIUM_MUTANT,'@compendium_context_mutant'))()or require('abyss_compendium_host')
Host.attach(ui,root,F.Data,F.Presentation,'click',{cursorEvents=cursor,imageSource='static',
 color=function(r,g,b,a)return{r=r,g=g,b=b,a=a}end})
local Run=require('abyss_run');local originalNew=Run.new
Run.new=function()error('catalogue created Run')end
local oldRandom,oldSeed=math.random,math.randomseed
math.random=function()error('catalogue consumed RNG')end
math.randomseed=function()error('catalogue reseeded RNG')end
local rng=require('abyss_sts_random');local saved={}
for key,value in pairs(rng)do if type(value)=='function'then saved[key]=value;rng[key]=function()error('catalogue consumed source RNG '..key)end end end
local function hit(parent,name)return root:GetChild(parent):GetChild(name):GetChild('hit')end
local function click(parent,name)return hit(parent,name).click()end
local function open(kind)assert(click('compendiumEntries',kind));assert(ui:update(.05));return ui.compendium end
local entries=root:GetChild('compendiumEntries')
local Combat=require('abyss_combat')
local same=dofile('tests/lua/support/current_game_ui_parity_fixture.lua').same
local dataBefore,presentationBefore=Combat.copy(F.Data),Combat.copy(F.Presentation)
local start=hit('menuPanel','start');start.listeners.down({touchId=91});start.listeners.up({touchId=91})
open('cards');assert(ui:closeCompendium())
assert(not start.click({touchId=91})and not ui.characterOpen and not ui.run,'old title gesture survived modal close')
local cardEntry=hit('compendiumEntries','cards')
for _,transition in ipairs({'characters','exit'})do
 cardEntry.listeners.down({touchId=92});cardEntry.listeners.up({touchId=92})
 if transition=='characters'then assert(ui:start());assert(ui:closeCharacters())else assert(ui:openExit());assert(ui:closeExit())end
 assert(not cardEntry.click({touchId=92})and not ui.compendium.visible,'old entry gesture survived '..transition..' transition')
end
cardEntry.listeners.down({touchId=93});cardEntry.listeners.exit({touchId=93});cardEntry.listeners.up({touchId=93})
assert(not cardEntry.click({touchId=93}),'cancelled entry gesture activated')
local b=open('cards')
assert(ui.mode=='compendium'and not ui.run and b.selected==nil and not b.popup,'library invented an auto-selected detail pane')
assert(not root:GetChild('menuPanel').visible and not root:GetChild('exitEntry').visible)
assert(not ui:openMenu()and not ui:openExit()and not ui:start(),'hidden menu escaped catalogue')
assert(not hit('exitEntry','open').click(),'stale hidden gear callback opened a modal')
local grid=panel:GetChild('cardGrid')
assert(grid.itemCount==#b.rows and grid.itemCount>60,'not a full native scrolling card group')
local function bodyTone()
 local face_=grid.items[0]:GetChild('face');local native=face_:GetChild('nativeCardBody')
 return(native and native:GetChild('innerWell')or face_:GetChild('roundBody')):GetChild('vertical').imageColor
end
local redBody=Combat.copy(bodyTone())
local sourceLayout=F.Theme.layout.compendium
local cellW,cellH=grid:GetItemSize();local gapX,gapY=grid:GetItemSpacing()
assert(math.abs(-sourceLayout.list[3]/2+8+cellW/2+353.3333333333333)<.0001,'source first card X drift')
assert(math.abs(sourceLayout.list[2]+sourceLayout.list[4]/2-8-cellH/2-81.86666666666667)<.0001,'source initial negative scroll offset lost')
assert(math.abs(cellW+gapX-176.66666666666666)<.0001 and math.abs(cellH+gapY-236.66666666666666)<.0001)
assert(sourceLayout.list[2]-sourceLayout.list[4]/2>-290,'native grid viewport overlaps footer hits')
local seen={}
for _,color in ipairs(require('abyss_compendium_model').colors)do
 assert(b.commands['color'..color]())
 if color=='green'then local c=bodyTone();assert(c.g>c.r,'green cards kept Geo material')end
 if color=='blue'then local c=bodyTone();assert(c.b>c.r,'blue cards kept Geo material')end
 if color=='purple'then local c=bodyTone();assert(c.r>c.g,'purple cards kept Geo material')end
 for _,row in ipairs(b.rows)do assert(not seen[row.id]);seen[row.id]=true;assert(not row.definition.originalV4)end
end
local count=0;for _ in pairs(seen)do count=count+1 end
assert(count==#b.allRows and count==356,'color tabs lost or added Production cards')
assert(b.commands.colorred())
same(bodyTone(),redBody,'recycled red material')
local bashIndex;for i,row in ipairs(b.rows)do if row.id=='bash'then bashIndex=i end end
local hoverHit=grid.items[bashIndex-1]:GetChild('hit')
hoverHit.listeners.enter()
local hoverLayer=panel:GetChild('hoverHints');local hoverFace=hoverLayer:GetChild('hoverFace')
assert(hoverLayer.visible and hoverLayer.parent==panel and hoverLayer.disableCursorEventPassthrough==false)
assert(math.abs(hoverFace.scale[1]-4/3)<.0001 and grid.items[bashIndex-1]:GetChild('face').scale[1]==1,'hover moved or enlarged the clipped Grid item')
assert(hoverFace.y+F.Theme.layout.card.size[2]*2/3>sourceLayout.list[2]+sourceLayout.list[4]/2,'hover never escaped Grid clipping')
assert(ui:update(.2));assert(not hoverLayer:GetChild('keywordTitle').visible,'hover tooltip appeared before source delay')
assert(ui:update(.01));assert(hoverLayer:GetChild('keywordTitle').text=='易伤'and hoverLayer:GetChild('keywordTitle').visible)
assert(b:select(bashIndex));assert(not hoverLayer.visible and b.popup,'hover stayed above the card modal')
hoverHit.listeners.enter();assert(not hoverLayer.visible,'hidden Grid hover stole modal priority')
assert(b:closeDetails());hoverHit.listeners.enter();hoverHit.listeners.exit();assert(not hoverLayer.visible)
local redCount=#b.rows
assert(b.commands.sortcost());local cost=-999
for _,row in ipairs(b.rows)do assert(row.definition.cost>=cost);cost=row.definition.cost end
assert(b.commands.sortcost());cost=999
for _,row in ipairs(b.rows)do assert(row.definition.cost<=cost);cost=row.definition.cost end
assert(b.commands.sorttype());assert(#b.rows==redCount,'type sorting was replaced with filtering')
local Model=require('abyss_compendium_model')
local sample={{name='a',definition={cost=1}},{name='b',definition={cost=1}},{name='c',definition={cost=2}}}
local sorted=Model.sort(Model.sort(sample,'name',false),'cost',true)
assert(sorted[1].name=='b'and sorted[2].name=='a','equal-cost sorting discarded previous order')
assert(b.commands.viewUpgrade()and b.listUpgraded)
local first=grid.items[0]:GetChild('face')
assert(first:GetChild('name').text~='','actual grid card face is blank')
local function selectCard(id,color)
 if color and b.color~=color then assert(b.commands['color'..color]())end
 if b.popup then assert(b:closeDetails())end
 for index,row in ipairs(b.rows)do if row.id==id then assert(b:select(index));return index end end
 error('missing public card '..id)
end
local index=selectCard('body_slam','red')
assert(b.popup and panel:GetChild('popup').visible)
local popup=panel:GetChild('popup');local face=popup:GetChild('face')
assert(face.x==0 and popup:GetChild('detail').visible==false,'card popup still uses a text sidebar')
assert(math.abs(face.scale[1]-8/3)<.0001 and face:GetChild('label').fontSize==32)
assert(face:GetChild('name').fontSize==31 and face:GetChild('cost').fontSize==51 and face:GetChild('type').fontSize==23)
assert(face:GetChild('cost').text=='0','global grid upgrade did not reach popup')
assert(b.commands.upgrade()and face:GetChild('cost').text=='1')
assert(b.commands.upgrade()and face:GetChild('cost').text=='0')
assert(b.commands.popupNext()and b.upgraded,'adjacent card reset upgrade state')
assert(b.selectedGroup==b.rows and b.selectedIndex==index+1)
assert(b.commands.popupPrevious()and b.selected.id=='body_slam')
grid.scrollProgress=.63
assert(b:closeDetails()and not b.listUpgraded and grid.scrollProgress==.63,'popup close reset scroll or retained upgrade')
assert(b:select(1));assert(not b.commands.popupPrevious(),'popup wrapped before first card');assert(b:closeDetails())
assert(b:select(#b.rows));assert(not b.commands.popupNext(),'popup wrapped after last card');assert(b:closeDetails())
selectCard('whirlwind','red');assert(face:GetChild('cost').text=='X');assert(b:closeDetails())
local Skin=require('abyss_card_skin');local apply=Skin.apply;local paintedColor
Skin.apply=function(box,definition,...)paintedColor=definition.color;return apply(box,definition,...)end
selectCard('dazed','colorless')
assert(paintedColor=='colorless'and b.selected.definition.color==nil,'display color normalization rewrote core or kept traveler face')
Skin.apply=apply
assert(not popup:GetChild('upgrade').visible,'status card offered a nonexistent upgrade');assert(b:closeDetails())
selectCard('power_through','red')
local preview=popup:GetChild('previewFace')
assert(preview.visible and preview:GetChild('label').text==b.catalog:card('wound',false).text)
assert(b.commands.upgrade()and preview:GetChild('label').text==b.catalog:card('wound',false).text,'parent upgrade leaked into base-only preview')
assert(b:closeDetails());selectCard('collect','purple')
assert(preview:GetChild('label').text==b.catalog:card('miracle',true).text,'Collect lost its constructor-upgraded Miracle')
assert(b:closeDetails());selectCard('storm_of_steel','green')
assert(preview:GetChild('label').text==b.catalog:card('shiv',false).text)
assert(b.commands.upgrade()and preview:GetChild('label').text==b.catalog:card('shiv',true).text,'Storm of Steel failed to upgrade its preview')
assert(b:closeDetails());selectCard('conjure_blade','purple')
assert(preview:GetChild('label').text:find('共 X 次',1,true),'Expunger preview invented a paid X')
assert(b.catalog:card('expunger',false).text:find('共 0 次',1,true),'constructor projection changed the core provider')
assert(b:closeDetails());selectCard('expunger','colorless')
assert(face:GetChild('label').text:find('共 X 次',1,true),'same constructor card disagrees between library and derived preview')
assert(b:closeDetails());selectCard('anger','red');assert(not preview.visible,'self-copy effect invented a source preview')
assert(b:closeDetails());selectCard('wish','purple');assert(not preview.visible,'Wish options were invented as a single derived preview')
assert(b:closeDetails());selectCard('bash','red')
assert(popup:GetChild('keywordTitle').visible and popup:GetChild('keywordTitle').text=='易伤','source status dictionary tips are missing')
assert(b:closeDetails());assert(b.commands.colorcolorless())
-- A real min-font failure uses card-internal segments, never a replacement sidebar.
local text=('中文长说明'):rep(100)
b.rows[1].text=text;assert(b:select(1));assert(#b.pages>1)
local all={face:GetChild('label').text}
local function fitsPage()
 local layout=F.Theme.layout.compendium;local box=F.Theme.layout.card.textBox
 local size,fits=require('abyss_card_display').fit(face:GetChild('label').text,layout.popupBodyFont,box[1]*layout.popupScale,box[2]*layout.popupScale,1.3,1)
 assert(fits and size==layout.popupBodyFont,'a visible long-text card segment still clips at source popup font')
end
fitsPage()
while b.commands.detailNext()do fitsPage();all[#all+1]=face:GetChild('label').text end
assert(table.concat(all)==text,'card-internal long-text reader lost source characters')
assert(not popup:GetChild('detail').visible);assert(b:closeDetails())
text=('段落\n'):rep(50);b.rows[1].text=text;assert(b:select(1));all={face:GetChild('label').text};fitsPage()
while b.commands.detailNext()do fitsPage();all[#all+1]=face:GetChild('label').text end
assert(table.concat(all)==text,'newline-heavy card reader lost source characters');assert(b:closeDetails())
local item=grid.items[0];local itemHit=item:GetChild('hit')
itemHit.listeners.down({touchId=7});itemHit.listeners.up({touchId=7})
assert(b.commands.colorred());assert(not itemHit.click({touchId=7})and not b.popup,'old cell gesture survived tab change')
assert(not grid.items[0]:GetChild('hit').click({dragging=true}),'native scroll drag inspected a card')
assert(not grid.items[0]:GetChild('hit').click({GetUIPos=function()return 20,0 end,GetPressUIPos=function()return 0,0 end}),'scroll displacement inspected a card')
grid.destroyOnRefresh=true;assert(b.commands.sortcost());assert(b.commands.sortcost())
grid.destroyOnRecycle=true;local retired=grid.items[0]:GetChild('hit');grid:recycle(0,#b.rows-1)
assert(not retired.click(),'retired native cell callback remained active')
assert(grid.items[0]:GetChild('hit').click()and b.selected.id==b.rows[#b.rows].id,'recycled native cell selected wrong card')
assert(b:closeDetails());assert(ui:closeCompendium())
b=open('cards');assert(b.color=='red','main-menu reopen lost the previous color tab');assert(ui:closeCompendium())
for _,kind in ipairs({'relics','potions'})do
 b=open(kind);local iconGrid=panel:GetChild('iconGrid')
 assert(iconGrid.visible and not grid.visible and #b.rows==(kind=='relics'and 149 or 33))
 local headers=0;for _,line in ipairs(b.lines)do if line.heading then headers=headers+1 end end
 assert(headers==(kind=='relics'and 7 or 3),'rarity sections replaced with tabs')
 if kind=='potions'then
  local frame=F.Theme.layout.compendium.potionViewport
  local _,rowH=iconGrid:GetItemSize();local visible=0;local titles=0
  for i,line in ipairs(b.lines)do
   local center=frame[2]+frame[4]/2-8-(i-.5)*rowH
   if line.heading then
    assert(center+2.6666666666666665+24<=frame[2]+frame[4]/2 and center+2.6666666666666665-24>=frame[2]-frame[4]/2,'potion rarity header outside settled first viewport')
    titles=titles+1
   end
   for _ in ipairs(line.entries or{})do
    assert(center+25.6<=frame[2]+frame[4]/2 and center-25.6>=frame[2]-frame[4]/2,'potion bottle outside settled first viewport')
    visible=visible+1
   end
  end
  assert(visible==33 and titles==3,'settled vanilla potion view hides a rarity or bottle')
 end
 local group=b.groups.common
 local lineIndex;for i,line in ipairs(b.lines)do if line.rarity=='common'and line.entries then lineIndex=i;break end end
 local control=iconGrid:recycle(0,lineIndex-1)
 assert(control:GetChild('slot1'):GetChild('hit').click())
 assert(b.selected.id==group[1].id and b.selectedGroup==group,'icon selection escaped rarity group')
 if kind=='relics'then
  assert(b.popup and popup:GetChild('relicIcon').visible and not face.visible)
  local relic=F.Theme.layout.compendium.relicPopup
  local icon_=popup:GetChild('relicIcon');local detail=popup:GetChild('detail');local inner=popup:GetChild('cardHit')
  assert(math.abs(relic.icon[2]-76*2/3)<.0001 and math.abs(icon_.sizeDeltaX-128*2*2/3)<.0001,'relic source icon geometry drift')
  assert(inner.visible and math.abs(inner.sizeDeltaY-680*2/3)<.0001,'relic inner hit block missing')
  assert(inner.click()and b.popup,'inside relic block dismissed popup')
  assert(math.abs(relic.detail[1]-detail.sizeDeltaX/2+200*2/3)<.0001 and relic.bodyFont==18,'relic source body left anchor or native font drift')
  local Display=require('abyss_card_display')
  for _,row in ipairs(b.rows)do
   local pages=Model.pages(row.text,F.Theme.layout.compendium)
   assert(table.concat(pages)==row.text,'relic paging lost text')
   for _,page in ipairs(pages)do
    local font_,fits=Display.fit(page,18,relic.detail[3],128,1.3)
    assert(font_==18 and fits,'relic page overflowed source width or icon clearance')
   end
  end
  assert(relic.detail[2]+128/2<relic.icon[2]-icon_.sizeDeltaY/2,'relic body ink intersects enlarged icon')
  assert(b.commands.popupNext()and b.selected.id==group[2].id);assert(b:back()and not b.popup)
 else
  assert(not b.popup and b.tooltip and panel:GetChild('tooltip').visible,'potion hover was replaced with a full popup')
  local order={};for i,row in ipairs(require('abyss_potion_random').pool('ironclad'))do order[row.id]=i end
  local prior=0;for _,row in ipairs(group)do assert(order[row.id]>prior);prior=order[row.id]end
  assert(b:back())
 end
 assert(ui:update(.05));assert(ui:closeCompendium());assert(entries.visible and not ui.run)
end
local close=hit('compendiumPanel','close')
b=open('cards');close.listeners.down({touchId=8});close.listeners.up({touchId=8});assert(ui:closeCompendium())
open('cards');assert(not close.click({touchId=8})and b.visible,'old close crossed modal generation')
ui:resize(1000,700);assert(not b.visible and ui.mode=='menu')
open('relics');ui:disable();assert(ui.disabled and not b.visible and not entries.visible)
assert(not ui:openCompendium('cards')and not b:open('cards')and not b.commands.next())
assert(not b:destroy(),'repeat destroy must be inert')
same(F.Data,dataBefore,'catalogue source');same(F.Presentation,presentationBefore,'presentation source')
Run.new=originalNew;math.random,math.randomseed=oldRandom,oldSeed
for key,value in pairs(saved)do rng[key]=value end
-- One-based and deferred native callbacks are real Grid modes, not fake pages.
local deferred,deferredRoot=F.fixture(nil,nil,nil,cursor)
Host.attach(deferred,deferredRoot,F.Data,F.Presentation,'click',{cursorEvents=cursor})
local deferredGrid=deferredRoot:GetChild('compendiumPanel'):GetChild('cardGrid')
deferredGrid.indexBase=1;deferredGrid.deferRefresh=true
assert(deferred:openCompendium('cards'));local late=deferredGrid.refreshCallback
assert(deferred:closeCompendium());late(nil,1)
assert(deferred:openCompendium('cards'));deferredGrid:flush();assert(deferred:update(.05));deferredGrid:flush()
assert(deferredGrid.itemCount==#deferred.compendium.rows)
assert(deferredGrid.items[0]:GetChild('hit').click())
assert(deferred.compendium.selected.id==deferred.compendium.rows[1].id,'one-based grid selected second card')
deferred:disable()
local focus
local api={events={Confirm='confirm',Cancel='cancel'},directions={Left=1,Right=2,Up=3,Down=4},modes={Specified=1},
 getFocus=function()return focus end,setFocus=function(control)focus=control end,isController=function()return true end}
local controlled,controlledRoot=F.fixture(nil,nil,nil,cursor,nil,nil,nil,api)
Host.attach(controlled,controlledRoot,F.Data,F.Presentation,'click',{cursorEvents=cursor})
focus=controlledRoot:GetChild('compendiumEntries'):GetChild('cards'):GetChild('hit')
assert(focus.navigationListeners.confirm());controlled:update(.05)
local controlledPanel=controlledRoot:GetChild('compendiumPanel')
focus=controlledPanel:GetChild('cardGrid').items[0]:GetChild('hit')
assert(focus.navigationListeners.confirm()and controlled.compendium.popup,'controller did not inspect a real card')
controlled:update(.05);focus=controlledPanel:GetChild('popup'):GetChild('popupClose'):GetChild('hit')
assert(focus.navigationListeners.cancel()and not controlled.compendium.popup and controlled.mode=='compendium','Cancel skipped the grid')
controlled:update(.05)
focus=controlledPanel:GetChild('close'):GetChild('hit')
assert(focus.navigationListeners.confirm()and controlled.mode=='menu','controller did not return to menu')
controlled:disable()
print('COMPENDIUM_UI_PASS source grids, colors, stable sort, shared upgrade, bounded popup, sections, no Run/RNG, stale gestures, native recycle')
