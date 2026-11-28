-- Read-only reward and event previews share pointer ownership and hold timing.
local Theme=require('abyss_theme')
local Pointer=require('abyss_pointer_input')
local M={}
local related={snecko_eye={kind='status',id='confusion'},calling_bell={kind='card',id='curse_of_the_bell'}}
local function find(entries,id)
 for _,entry in ipairs(entries or {})do if entry.id==id then return entry end end
end
-- References select existing content; descriptions stay owned by their source.
function M.related(owner,relicId)
 local reference=related[relicId];if not reference then return nil end
 local data=owner.run.data
 if reference.kind=='status' then
  local definition=find(data.statuses and data.statuses.statuses,reference.id)
   or find(require('abyss_act2_enemies').statuses,reference.id)
  if definition then return {name=definition.name,description=definition.description}end
 else
  local definition=find(data.cards and data.cards.cards,reference.id)
  local display=owner.presentation and owner.presentation[reference.id]
  if definition then return {name='诅咒 · '..(display and display.name or definition.name),
   description=display and (display.text or display.textTemplate) or definition.text}end
 end
end
function M.new(owner,panel,options)
 local state={records={}}
 local function eventValid(record)
  local flow=owner.run.nodeFlow
  return flow==record.flow and flow.event and flow.event.stage==record.stage
   and not Pointer.blocked(options) and not (options.inputCovered and options.inputCovered())
   and record.preview.visible()
 end
 local function valid(record)
  return record and owner.visible and not owner.presentationBusy and owner.run==record.run
   and owner.map==record.map and owner.view==record.view and owner.actions[record.key]==record.entry
   and (not record.preview or eventValid(record))
 end
 local function close()
  local active=state.active
  if not active then return end
  state.active,state.activeTouch=nil,nil
  if active.preview then active.preview.hide() else panel:SetVisible(false) end
 end
 local function display(record,cursorY,touch)
  if state.active==record then return end
  close()
  state.active,state.activeTouch=record,touch
  if record.preview then record.preview.show(cursorY);return end
  panel:GetChild('name').text=record.name;panel:GetChild('description').text=record.description
  local name,description=panel:GetChild('relatedName'),panel:GetChild('relatedDescription')
  name.text=record.related and record.related.name or '';description.text=record.related and record.related.description or ''
  name:SetVisible(record.related~=nil);description:SetVisible(record.related~=nil)
  panel:SetVisible(true)
 end
 local function retireHold()
  if state.held and state.held.record.preview then state.swallow=state.held end
  state.held=nil
 end
 function state:reset()self.records={};retireHold();close()end
 function state:set(key,name,description,reference)
  self.records[key]={key=key,name=name,description=description,related=reference,run=owner.run,map=owner.map,view=owner.view,entry=owner.actions[key]}
 end
 function state:setEvent(key,preview)
  self:set(key)
  local record=self.records[key];record.preview=preview
  record.flow,record.stage=owner.run.nodeFlow,owner.run.nodeFlow.event.stage
 end
 function state:enter(key,cursorY)
  if options.touchScreen and options.touchScreen() then return end
  local record=self.records[key]
  if valid(record) then display(record,cursorY) elseif key:match('^eventView/') then close() end
 end
 function state:exit(key,event)
  local touch=event and event.touchId
  local held=self.held
  if held and held.record.key==key and (touch==nil or touch==held.touch) then retireHold() end
  if self.active and self.active.key==key and (touch==nil or self.activeTouch==nil or touch==self.activeTouch) then close() end
 end
 function state:down(key,event,cursorY)
  local record=self.records[key]
  if key:match('^eventView/') and not (options.touchScreen and options.touchScreen()) then return end
  local touch=event and event.touchId
  if self.held and self.held.touch~=touch then return end
  if not self.swallow or self.swallow.touch==touch then self.swallow=nil end
  self.held=nil;close()
  if valid(record) then self.held={record=record,touch=touch,time=0,cursorY=cursorY}end
 end
 function state:up(event)
  local held=self.held
  if not held or held.touch~=(event and event.touchId) then return end
  if held.record.preview and not valid(held.record) then retireHold() else self.held=nil end
 end
 function state:consume(key,event)
  local held=self.swallow
  if not held or held.record.key~=key then return false end
  if event and event.touchId~=nil and event.touchId~=held.touch then return false end
  self.swallow=nil;return true
 end
 function state:update(dt)
  local active=self.active
  if active and active.preview then
   if not valid(active) then close()
   elseif active.preview.followCursor and options.cursorPosition and not (options.touchScreen and options.touchScreen()) then
    active.preview.followCursor()
   end
  end
  local held=self.held;if not held then return end
  if not valid(held.record)then retireHold();return end
  held.time=held.time+math.max(0,dt)
  if held.time>=Theme.layout.statusInfo.delay then
   display(held.record,held.cursorY,held.touch);self.swallow=held;self.held=nil
  end
 end
 return state
end
return M
