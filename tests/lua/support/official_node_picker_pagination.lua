local F=dofile('tests/lua/support/game_ui_fixture.lua')
local Run,Map,Nodes=require('abyss_run'),require('abyss_map'),require('abyss_nodes')
local UI=require('abyss_node_ui')
assert(#F.Theme.layout.nativeNode.picker.columns==3)
local spec
for _,layer in ipairs(F.Layout)do for _,panel in ipairs(layer.children or {})do if panel.name=='nodePanel'then spec=panel end end end
local function setup(kind)
 local run,map=Run.new(F.Data,42),Map.generate(F.Data,42)
 while true do
  local choices=Map.available(map);assert(#choices>0)
  local found
  for _,node in ipairs(choices)do if node.type==kind then found=node;break end end
  if found then assert(Nodes.enter(run,map,found.id));break end
  assert(Map.choose(map,choices[1].id))
 end
 run.gold=10000
 local root=F.control(assert(spec))
 local presentation=require('abyss_character_presentation').prepare(F.Presentation,run.data)
 local ui=UI.new(root,run,map,presentation,'click',function()end,{
  enhancedRooms=kind=='camp',imageSource='static',color=function(r,g,b,a)return {r=r,g=g,b=b,a=a}end,
  cursorEvents={CursorEnter='enter',CursorExit='exit',CursorDown='down',CursorUp='up',CursorEndDrag='endDrag'}})
 ui:setVisible(true)
 local function get(path)
  local c=root;for name in path:gmatch('[^/]+')do c=assert(c:GetChild(name),'missing '..path)end;return c
 end
 for i=4,6 do assert(next(get('pickerView/card'..i).children)==nil)end
 return ui,get,run,map
end

local ui,get,run=setup('shop')
assert(ui:press('merchant/talk'));ui:update(.31)
local original={};for i,card in ipairs(run.deck)do original[i]=card.uid end
assert(#original==10 and ui:press('shopView/removal'))
local rows=ui.removeRows;assert(#rows==10 and ui.pageCount==4)
local hit=get('pickerView/card1/hit')
hit.listeners.down({touchId=7})
assert(ui:setPage(2));hit.listeners.up({touchId=7})
assert(not hit.listeners.click({touchId=7}),'old page pointer gesture must be stale')
local seen={}
for page=1,4 do
 assert(ui:setPage(page))
 for slot=1,3 do
  local row=rows[(page-1)*3+slot]
  assert(get('pickerView/card'..slot).visible==(row~=nil))
  if row then
   assert(ui:press('pickerView/card'..slot));assert(ui.selected==row.uid)
   seen[row.uid]=true
  end
 end
 for slot=4,6 do assert(not get('pickerView/card'..slot).visible)end
end
for _,uid in ipairs(original)do assert(seen[uid],'every original candidate is reachable')end
assert(not ui:press('pickerView/card4'))
local chosen=ui.selected;assert(chosen==rows[10].uid)
assert(ui:setPage(1) and ui.selected==chosen)
assert(ui:press('confirm'));assert(#run.deck==9)
for _,card in ipairs(run.deck)do assert(card.uid~=chosen)end

-- Camp uses the native grid while hiding all six semantic picker parents.
local camp,cget=setup('camp')
assert(camp:press('campView/forge'))
for i=1,6 do assert(not cget('pickerView/card'..i).visible)end
assert(cget('pickerView/forgeFit').itemCount==10 and not cget('confirm').visible)
assert(camp:press('pickerView/forgeScroll/card1'))
assert(camp:press('confirm'))

local H=dofile('tests/helpers/act2_choice_events.lua')
local EventUI=dofile('tests/helpers/event_cards_native_ui.lua')
local eventRun,eventMap=H.fixture('drug_dealer')
local mandatory,mget,_,tap=EventUI.setup(eventRun,eventMap)
assert(tap('eventView/option2',1));assert(mandatory.pageCount==4)
local first,last=eventRun.deck[2].uid,eventRun.deck[10].uid
local stale=mandatory.actions['pickerView/card2'].handler
assert(tap('pickerView/card2',2));assert(not stale())
for i=1,3 do assert(tap('pickerView/next',i+2))end
assert(tap('pickerView/card1',6));assert(mandatory:setPage(1))
assert(mget('pickerView/card2/stamp').text=='第 1 张')
assert(mandatory:setPage(4));assert(mget('pickerView/card1/stamp').text=='第 2 张')
assert(tap('confirm',7));H.same(eventRun.nodeFlow.event.removedUids,{first,last})

-- Execute the original native Match cases against this same generated layout.
dofile('tests/lua/match_event_ui.lua')
print('OFFICIAL_NODE_PICKER_PAGINATION_PASS')
