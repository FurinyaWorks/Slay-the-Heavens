local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Map=require('abyss_run'),require('abyss_map')
local events={CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up',CursorEndDrag='endDrag'}
local function setup(kind,cursor,count)
 local host,root=F.fixture(nil,nil,nil,cursor)
 assert(F.start(host))
 local run,map=Run.new(F.Data,42),Map.generate(F.Data,42)
 run.deck={}
 for i=1,count or 14 do run.deck[i]={uid=100+i,cardId=i%2==0 and 'corruption' or 'strike'}end
 run.gold=999
 while true do
  local choices=Map.available(map);assert(#choices>0)
  local target
  for _,node in ipairs(choices)do if node.type==kind then target=node;break end end
  if target then assert(F.Nodes.enter(run,map,target.id));break end
  assert(Map.choose(map,choices[1].id))
 end
 host.run,host.map=run,map;host.battleUI.run=run;host.mapUI.map=map
 host.nodeUI.run,host.nodeUI.map=run,map;host:refresh()
 local panel=root:GetChild('nodePanel')
 local function get(path)
  local node=panel
  for name in path:gmatch('[^/]+')do node=assert(node:GetChild(name),path)end
  return node
 end
 local function tap(path,id)
  local hit=get(path):GetChild('hit')
  if cursor then hit.listeners.down({touchId=id});hit.listeners.up({touchId=id})end
  return hit.click({touchId=id})
 end
 return host,root,host.nodeUI,get,tap
end
local function state(box,expected)
 local shared=assert(box:GetChild('sharedButtonChrome'))
 for _,name in ipairs({'normal','hover','pressed','disabled'})do
  assert(shared:GetChild(name).visible==(name==expected),box.name..' '..name..' '..expected)
 end
 for _,name in ipairs({'normal','hover','pressed','disabled','selected','border'})do assert(not box:GetChild(name).visible)end
end
local host,root,ui,get,tap=setup('shop',events)
assert(host:openDeck());host:update(0)
local deck=root:GetChild('deckPanel')
assert(deck:GetChild('pileGrid').itemCount==14 and not deck:GetChild('grid').visible)
assert(not host.deckUI.choiceToken,'readonly deck must not become a transactional picker')
local first=host.run.deck[1]
deck:GetChild('pileGrid').items[1]:GetChild('hit').click()
assert(host.run.deck[1]==first and not first.upgraded and host.run.gold==999,'inspection is view-only')
if host.deckUI.detailPages then assert(host.deckUI:back())end
assert(host.deckUI:back())
assert(tap('shopView/removal',1));assert(ui.pageCount==5 and ui.pickPage==1)
state(get('confirm'),'disabled');state(get('pickerView/previous'),'disabled')
local next=get('pickerView/next'):GetChild('hit')
next.listeners.enter({touchId=2});state(get('pickerView/next'),'hover')
next.listeners.down({touchId=2});state(get('pickerView/next'),'pressed')
assert(get('pickerView/next').scale[1]==1,'shared preset owns its press scale once')
next.listeners.up({touchId=2});next.listeners.exit({touchId=2});state(get('pickerView/next'),'normal')
for i=1,4 do assert(tap('pickerView/next',i+2))end
assert(ui.pickPage==5);state(get('pickerView/next'),'disabled')
assert(not tap('pickerView/next',9));assert(not get('pickerView/card3').visible)
local held=get('pickerView/card1'):GetChild('hit')
held.listeners.down({touchId=20});ui:render();held.listeners.up({touchId=20});held.click({touchId=20})
assert(not ui.selected,'old touch cannot select after refresh')
assert(tap('pickerView/card2',21));assert(ui.selected==114);state(get('confirm'),'normal')
assert(get('confirm/label').text:find('金币',1,true),'full price caption survives material reuse')
local count,gold=#host.run.deck,host.run.gold
assert(tap('back',22));assert(#host.run.deck==count and host.run.gold==gold)
assert(tap('shopView/removal',23));assert(tap('pickerView/card1',24));assert(tap('confirm',25))
assert(#host.run.deck==count-1 and host.run.gold<gold)
host:disable()
-- Independent review caught overlap only after the real card hover handler.
-- Read static imported positions plus the current Host's actual transform writes.
local function hoverClearance(host,root,ui,get,tap)
 local specs={}
 local function pair(control,spec)
  specs[control]=spec
  for _,item in ipairs(spec.children or {})do pair(assert(control:GetChild(item.name)),item)end
 end
 for _,spec in ipairs(F.Layout)do if spec.name=='stage'then pair(root,spec)end end
 local function rect(control)
  local x,y,w,h=0,0,control.sizeDeltaX,control.sizeDeltaY
  while control do
   local spec=specs[control]or{}
   local scale=control.scale or spec.scale or {1,1}
   local position=spec.position or {0,0}
   x=(control.x or position[1])+x*scale[1];y=(control.y or position[2])+y*scale[2]
   w,h=w*scale[1],h*scale[2];control=control.parent
  end
  return {x=x,y=y,w=w,h=h}
 end
 local function separate(a,b,label)
  local ar,br=rect(a),rect(b)
  assert(math.abs(ar.x-br.x)>=(ar.w+br.w)/2 or math.abs(ar.y-br.y)>=(ar.h+br.h)/2,label..' overlaps')
 end
 for _,device in ipairs({{1280,720},{1920,1080},{2340,1080}})do
  F.Viewport.apply(root.parent,device[1],device[2])
  for i=1,12 do
   local card=get('pickerView/forgeGrid/card'..i)
   if card.visible and get('pickerView/forgeGrid').visible then
    local hit=card:GetChild('hit');hit.listeners.enter({touchId=80+i})
    assert(card.scale[1]==F.Theme.layout.nativeNode.forge.hoverScale,'real hover handler must run')
    for _,name in ipairs({'forgePrevious','forgeNext'})do
     local page=get('pickerView/'..name)
     if page.visible then separate(card,page,'hover card'..i..' '..name)end
    end
    for _,name in ipairs({'back','confirm'})do if get(name).visible then separate(card,get(name),'hover card '..name)end end
    separate(card,get('pickerView/page'),'hover card page text')
    hit.listeners.exit({touchId=80+i});assert(card.scale[1]==1)
   end
  end
  for _,name in ipairs({'forgePrevious','forgeNext'})do
   local page=get('pickerView/'..name)
   if page.visible then
    for _,action in ipairs({'back','confirm'})do if get(action).visible then separate(page,get(action),name..' '..action)end end
    separate(page,get('pickerView/page'),name..' page text')
    local r=rect(page)
    assert(math.abs(r.x)+r.w/2<=device[1]/2 and math.abs(r.y)+r.h/2<=device[2]/2,'world footer leaves canvas')
   end
  end
  for _,name in ipairs({'back','confirm'})do
   local action=get(name)
   if action.visible then
    for _,preview in ipairs({'before','after','target'})do
     local card=get('pickerView/'..preview)
     if card.visible then separate(action,card,name..' selected '..preview)end
    end
    if get('pickerView/page').text~=''then separate(action,get('pickerView/page'),name..' page text')end
    local r=rect(action);local k=math.min(device[1]/1280,device[2]/720)
    assert(math.abs(r.x)+r.w/2+F.Theme.canvas.safe.x*k<=device[1]/2,'action outside horizontal safe area')
    assert(math.abs(r.y)+r.h/2+F.Theme.canvas.safe.y*k<=device[2]/2,'action outside vertical safe area')
   end
  end
 end
 F.Viewport.apply(root.parent,1280,720)
end
host,root,ui,get,tap=setup('camp',events)
assert(tap('campView/forge',60));assert(ui.pageCount==2)
hoverClearance(host,root,ui,get,tap)
assert(tap('pickerView/forgeNext',61));assert(ui.pickPage==2)
hoverClearance(host,root,ui,get,tap);host:disable()
host,root,ui,get,tap=setup('camp',events,26)
assert(tap('campView/forge',62));assert(tap('pickerView/forgeNext',63));assert(ui.pickPage==2 and ui.pageCount==3)
assert(get('pickerView/forgePrevious').visible and get('pickerView/forgeNext').visible)
hoverClearance(host,root,ui,get,tap);host:disable()
-- No cursor event capability: the same real click receivers remain usable.
host,root,ui,get,tap=setup('camp',nil)
assert(tap('campView/forge',30));assert(ui.pageCount==2)
assert(tap('pickerView/forgeNext',31));assert(ui.pickPage==2)
assert(not get('pickerView/forgeGrid/card3').visible)
assert(tap('pickerView/forgeGrid/card2',32));assert(ui.selected==114)
assert(get('pickerView/before').visible and get('pickerView/after').visible)
hoverClearance(host,root,ui,get,tap)
assert(tap('back',33));assert(not ui.selected and ui.pickPage==2)
-- A changed current list clamps the last page, without inventing new cards.
while #ui.upgradeRows>12 do table.remove(ui.upgradeRows)end
ui:render();assert(ui.pageCount==1 and ui.pickPage==1)
assert(not get('pickerView/forgeNext').visible)
assert(tap('pickerView/forgeGrid/card1',34));assert(tap('confirm',35))
assert(host.run.deck[1].upgraded and not host.run.deck[2].upgraded)
assert(get('confirm/label').text=='继续')
host:update(F.Theme.layout.nativeNode.roomMotion.forgeDuration+.01)
assert(tap('confirm',36));assert(host.mode=='map')
host:disable()
print('RELEASE_PICKER_CONTROLS_PASS')
