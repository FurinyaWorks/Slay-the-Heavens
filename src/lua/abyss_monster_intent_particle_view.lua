-- Per-instance native outputs for the two source intent particle classes.
-- Glyphs and the explicit 16-unit star bounds are replacements, not source atlas pixels.
local Particles=require('abyss_monster_intent_particles')
local Displayed=require('abyss_monster_displayed_intent')
local Surfaces=require('abyss_monster_power_surfaces')
local Random=require('abyss_randomxs128')
local Theme=require('abyss_theme')
local sequence=Particles.newSequence() -- Java static phase survives battle changes.
local cosmetic=Random.fromSeed('0') -- Separate visual stream; never combat RNG.
local M={}
local layers={'intentVfxBehind','intentVfxAfter'}
local hiddenParts={'edge','body','badge','count','hit'}
local function checkGeneration(pool,generation)
 assert(pool.generation==generation,'intent particle publication cancelled')
end
local function valid(pool,generation,key,control)
 checkGeneration(pool,generation)
 assert(pool:find(key)==control and control.alive~=false,'intent particle publication cancelled')
 checkGeneration(pool,generation)
end
local function write(pool,generation,key,control,target,name,...)
 valid(pool,generation,key,control)
 assert(target[name](target,...)~=false,'intent particle native write rejected: '..name)
 valid(pool,generation,key,control)
end
local function read(pool,generation,target,name)
 local value=target[name]
 checkGeneration(pool,generation)
 return value
end
local function child(pool,generation,control,name)
 local part=control:GetChild(name)
 checkGeneration(pool,generation)
 return part
end
local function differs(actual,expected)
 return actual~=nil and actual~=expected
end
local function angleDiffers(actual,expected)
 if actual==nil then return false end
 -- Native Euler angles may be normalized to [0, 360).
 local delta=(actual-expected)%360
 return delta>0.0001 and delta<359.9999
end
local function createIntent(state)Particles.createIntent(state);state.createPending=true end
function M.new(platform,picture,tint)
 -- The surface pool drops the binding even if native destruction must retry.
 local configured={}
 local function retire(_,control)configured[control]=nil end
 local self={states={},outputs={},seenEvents=setmetatable({},{__mode="k"})}
 function self.release(_,box,engineDestroyed)
  local output=self.outputs[box]
  if output then
   local failure
   for _,pool in pairs(output)do local ok,why=pcall(engineDestroyed and pool.onEngineDestroy or pool.clear,pool);if not ok then failure=why end end
   if failure then error(failure)end
   self.outputs[box]=nil
  end
 end
 function self.onEngineDestroy(_)
  self.engineDestroyed=true
  local outputs=self.outputs;self.outputs={}
  self.states={};self.battle=nil;self.event=nil;self.shown=nil;self.failed=nil
  self.seenEvents=setmetatable({},{__mode="k"})
  local failure
  for _,output in pairs(outputs)do for _,pool in pairs(output)do
   local ok,why=pcall(pool.onEngineDestroy,pool);if not ok then failure=why end
  end end
  assert(not failure,failure)
 end
 function self.clear(_)
  if self.engineDestroyed then return end
  local failure
  for box in pairs(self.outputs)do local ok,why=pcall(self.release,self,box);if not ok then failure=why end end
  if failure then error(failure)end
  self.states={};self.battle=nil;self.event=nil;self.shown=nil;self.failed=nil
  self.seenEvents=setmetatable({},{__mode="k"})
 end
 local function observe(event)
  if not event or self.seenEvents[event]then return end
   if event.sourceIntentPowers then
    assert(event.sourceIntentPowers.scope=='all-monsters','unknown source power refresh scope')
    for _,state in pairs(self.states)do state.powersPending=true end
   end
   local d=type(event.detail)=='table' and event.detail or {}
   if event.kind=='player_turn' then for _,state in pairs(self.states)do createIntent(state)end
   elseif event.kind=='intent' and self.states[d.enemy]then Particles.flashIntent(self.states[d.enemy])
   elseif self.states[d.enemy] and (event.kind=='enemy_interrupt' or event.kind=='enemy_wake' and d.reason=='hp_loss' or event.kind=='enemy_mode' and d.mode=='defense')then
    createIntent(self.states[d.enemy])
   end
  self.event=event;self.seenEvents[event]=true
 end
 function self.sync(_,rows,battle,event,viewActive)
  assert(not self.engineDestroyed,'monster intent view engine destroyed')
  local entering=self.battle~=battle
  if entering then self:clear();self.battle=battle end
  local firstShow=viewActive~=false and battle~=nil and not self.shown
  if firstShow and #rows>0 then self.shown=true end
  local wanted={}
  for _,row in ipairs(rows)do
   wanted[row.id]=true
   if not self.states[row.id]then local state=Particles.newActor();state.displayed=Displayed.new();if firstShow then createIntent(state)end;self.states[row.id]=state end
  end
  if viewActive~=false then for id in pairs(self.states)do if not wanted[id]then self.states[id]=nil end end end
  observe(event)
 end
 function self.reconcile(_,battle)
  assert(not self.engineDestroyed,'monster intent view engine destroyed')
  if self.battle~=battle then return false end
  -- Only an explicit recovery catches up skipped real source callbacks.
  -- Ordinary render/raw status mutations never infer a power refresh.
  for _,event in ipairs(battle.events)do observe(event)end
  return true
 end
 function self.needsSelected(_,id)
  local state=assert(self.states[id],'missing intent instance')
  return state.createPending or state.powersPending
 end
 function self.face(_,id,selected,calculate)
  local state=assert(self.states[id],'missing intent instance')
  if state.createPending and selected then Displayed.createIntent(state.displayed,selected,calculate);state.createPending=nil end
  if state.powersPending then Displayed.applyPowers(state.displayed,selected,calculate);state.powersPending=nil end
  return Displayed.face(state.displayed)
 end
 function self.update(_,id,dt,face,g,dying,escaping)
  local state=assert(self.states[id],'missing intent instance')
  Particles.updateAlpha(state,dt)
  Particles.update(state,sequence,{dt=dt,intent=face.sourceEnum,intentAlpha=state.intentAlpha,
   isDying=dying,isEscaping=escaping,x=g.x+g.intentX,y=g.y+g.intentY,scale=g.sourceScale,
   starWidth=16,starHeight=16},function()return Random.nextFloat(cosmetic)end)
 end
 function self.alpha(_,id)return assert(self.states[id],'missing intent instance').intentAlpha end
 local function paintPartVisibility(pool,generation,key,control,e)
  local binding=configured[control]
  local first=not binding or binding.effect~=e
  if first then
   binding={effect=e,icon=child(pool,generation,control,'icon'),hidden={}}
   for i,name in ipairs(hiddenParts)do binding.hidden[i]=child(pool,generation,control,name)end
  end
  for _,part in ipairs(binding.hidden)do
   if first or read(pool,generation,part,'visible')~=false then write(pool,generation,key,control,part,'SetVisible',false)end
  end
  local icon=binding.icon
  if first or read(pool,generation,icon,'visible')~=true then write(pool,generation,key,control,icon,'SetVisible',true)end
  return binding,first
 end
 local function paintFixedImage(pool,generation,key,control,e,binding,first)
  local icon=binding.icon
  local image=e.textureKey=='TINY_STAR' and Theme.image.star or Theme.icon.intent.unknown
  local imageId=type(image)=='table' and image.id or image
  if binding.imageId~=imageId or differs(read(pool,generation,icon,'imageId'),imageId) then
   valid(pool,generation,key,control)
   assert(picture(icon,image)~=false,'intent particle image rejected')
   valid(pool,generation,key,control)
   binding.imageId=imageId
  end
  if first or differs(read(pool,generation,icon,'anchoredPositionX'),0) or differs(read(pool,generation,icon,'anchoredPositionY'),0) then
   write(pool,generation,key,control,icon,'SetAnchoredPosition',0,0)
  end
  if binding.width~=e.width or binding.height~=e.height
      or differs(read(pool,generation,icon,'sizeDeltaX'),e.width) or differs(read(pool,generation,icon,'sizeDeltaY'),e.height) then
   write(pool,generation,key,control,icon,'SetSizeDelta',e.width,e.height)
   binding.width,binding.height=e.width,e.height
  end
 end
 local function paintControl(pool,generation,key,control,e,g,allowed,revision)
  local binding,first=paintPartVisibility(pool,generation,key,control,e)
  paintFixedImage(pool,generation,key,control,e,binding,first)
  local icon=binding.icon
  write(pool,generation,key,control,icon,'SetLocalScale',e.scale,e.scale,1)
  if binding.rotation~=e.rotationDeg or angleDiffers(read(pool,generation,icon,'localRotationZ'),e.rotationDeg)
      or angleDiffers(read(pool,generation,icon,'localRotationX'),0) or angleDiffers(read(pool,generation,icon,'localRotationY'),0) then
   write(pool,generation,key,control,icon,'SetLocalRotation',0,0,e.rotationDeg)
   binding.rotation=e.rotationDeg
  end
  valid(pool,generation,key,control)
  tint(icon,{r=e.color[1]*255,g=e.color[2]*255,b=e.color[3]*255,a=e.color[4]*255})
  valid(pool,generation,key,control)
  write(pool,generation,key,control,control,'SetAnchoredPosition',e.centerX-g.x,e.centerY-g.y)
  if read(pool,generation,control,'visible')~=allowed then write(pool,generation,key,control,control,'SetVisible',allowed)end
  -- A nested paint may have observed a partly published binding. Rebind
  -- on the next paint if native calls overlapped, keeping pool ownership.
  configured[control]=self.paintRevision==revision and binding or nil
 end
 local function paint(box,id,g,allowed,revision)
  local state=assert(self.states[id],'missing intent instance')
  local output=self.outputs[box]
  if not output and #state.effects==0 then return end
  if not output then
   output={};self.outputs[box]=output
   for _,layer in ipairs(layers)do
    local parent=box:GetChild(layer)
    assert(self.outputs[box]==output,'intent particle publication cancelled')
    output[layer]=Surfaces.new(parent,platform,nil,retire)
   end
  end
  local rows={intentVfxBehind={},intentVfxAfter={}}
  for _,effect in ipairs(state.effects)do
   local layer=effect.renderBehind and 'intentVfxBehind' or 'intentVfxAfter'
   rows[layer][#rows[layer]+1]={id=tostring(effect.effectId),effect=effect}
  end
  for layer,pool in pairs(output)do
   pool:select(rows[layer],id)
   local generation=pool.generation
   for _,row in ipairs(rows[layer])do
    local key,e=row.id,row.effect
    local control=assert(pool:find(key))
    valid(pool,generation,key,control)
    paintControl(pool,generation,key,control,e,g,allowed,revision)
   end
  end
 end
 function self.paint(_,box,id,g,allowed)
  assert(not self.engineDestroyed,'monster intent view engine destroyed')
  assert(not self.failed,self.failed)
  self.paintRevision=(self.paintRevision or 0)+1
  local ok,reason=pcall(paint,box,id,g,allowed,self.paintRevision)
  if not ok then
   self.failed=tostring(reason)
   pcall(self.release,self,box) -- Retain failed native cleanup ownership for explicit clear retry.
   error(reason)
  end
 end
 return self
end
return M
