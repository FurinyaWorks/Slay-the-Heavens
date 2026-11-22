local Combat=require('abyss_combat')
local Data=require('abyss_data')
local Target=require('abyss_battle_target_bindings')
local Detail=require('abyss_battle_detail_bindings')
local Native=dofile('tests/lua/support/native_ui_contract.lua')
local Theme=require('abyss_theme')
-- Throw after native registration: exercise callbacks installed before a failed bind.
local failAt,registrations=nil,0
local reentrantRetire,beforeFailure
local function registered(control,event,callback)
 if not failAt then return end
 registrations=registrations+1
 if registrations~=failAt then return end
 if reentrantRetire then reentrantRetire();return end
 if beforeFailure then beforeFailure(control,event,callback) end
 error('injected native registration failure')
end
local function control(name,parent)
 local c={name=name,parent=parent,children={},listeners={},visible=true,alive=true,raycastTarget=true}
 function c:GetChild(n)return assert(self.children[n],self.name..' missing '..n)end
 function c:GetChildren()local a={};for _,v in pairs(self.children)do a[#a+1]=v end;return a end
 function c:AddCursorEventListener(e,f)Native.listener(e,f);assert(not self.listeners[e],self.name..' duplicate '..e);self.listeners[e]=f;registered(self,e,f) end
 if parent then parent.children[name]=c end
 return c
end
local function unit(name)
 local c=control(name);control('hit',c);control('intentHit',c);local row=control('statusRow',c);control('hit',row)
 for i=1,Theme.layout.statusIcon.perRow*Theme.layout.statusIcon.rows do control('hit'..i,row)end
 return c
end
local battle=Combat.new(Data,{deck={'strike','defend'},enemies={'acid_slime_m','acid_slime_m','acid_slime_m','acid_slime_m','acid_slime_m','acid_slime_m','acid_slime_m'},seed=42})
local owner={run={phase='combat',combat=battle},active=true,busy=false,dragEnabled=true,selectionEpoch=0}
local calls={status=0,help=0,down=0,swallowed=0,drag=0,render=0,potion=0,card=0,queue=0,close=0}
function owner:showStatus(index)calls.status=calls.status+1;calls.index=index end
function owner:openHelp(spec)calls.help=calls.help+1;calls.spec=spec end
function owner:queueHelp(spec,source,held,touch)calls.queue=calls.queue+1;self.help={spec=spec,source=source,touch=touch,held=held}end
function owner:render()calls.render=calls.render+1 end
function owner:setHover(value)self.hover=value end
function owner:cardHelpSpec()end
function owner:potionHelpSpec()end
function owner:commitPotion(slot,index)calls.potion=calls.potion+1;calls.index=index end
function owner:playSelected(index)calls.card=calls.card+1;calls.index=index end
local surfaces={entries={},boxes={}}
function surfaces:entry(slot)return self.entries[slot]end
function surfaces:control(slot)return self.boxes[slot]end
function surfaces:slotFor(box)for i,b in pairs(self.boxes)do if b==box then return i end end end
local host={monsterSurfaces=surfaces,platform={},clickEvent='click',cursor={CursorDown='down',CursorUp='up',CursorEndDrag='endDrag',CursorEnter='enter',CursorExit='exit'}}
local ownership={enemyInputs={},enemyPointerObserved=false}
local static={hero=unit('hero'),statusInfo=control('statusInfo')};control('hit',static.statusInfo);control('page',static.statusInfo)
for i=1,10 do static['card'..i]=unit('card'..i)end
for i=1,Theme.layout.battlePotions.count do static['potion'..i]=control('potion'..i);static['potionHelp'..i]=control('potionHelp'..i)end
local deps={}
function deps.child(name)return assert(static[name],'dynamic init must not request '..name)end
function deps.enemyAt(slot)return surfaces:entry(slot)end
function deps.sameEnemySlot(slot,actor)local e=surfaces:entry(slot);return e and e.actor==actor and e.id==actor.id end
function deps.swallowed()calls.swallowed=calls.swallowed+1;return false end
function deps.down()calls.down=calls.down+1;return false end
function deps.consumeReleasedDragClick()calls.drag=calls.drag+1;return false end
function deps.cancelPotionAim()return false end
function deps.discardEnemyPointer(input)input.held=nil;input.released=nil end
-- Deliberately permissive dependency: stale surface fencing must live in bindings themselves.
function deps.enemyReady()return true end
function deps.closeInfo()owner.info=nil;calls.close=calls.close+1;return true end
function deps.listen(c,fn)c:AddCursorEventListener('click',fn)end
local target=Target.install(owner,ownership,host,deps);deps.helpActorReady=target.helpActorReady
local detail=Detail.install(owner,ownership,host,deps)
target.bindEnemyControls();detail.bindDetailControls()
local function bind(slot,actor,index,box)
 if not box then box=control('dynamic'..slot);control('hit',box);control('intentHit',box) end
 surfaces.boxes[slot]=box;surfaces.entries[slot]={index=index,id=actor.id,actor=actor,controlSlot=slot}
 target.bindEnemyControl(slot,box);detail.bindEnemyDetailControls(slot,box)
 return box
end
local function event(c,kind,touch)if c.listeners[kind]then return c.listeners[kind]({touchId=touch})end end
local function click(c,touch)event(c,'down',touch);event(c,'up',touch);event(c,'click',touch)end
local boxes={};for i,actor in ipairs(battle.enemies)do boxes[i]=bind(i,actor,i)end
local targetEvents={'click','down','exit','up','endDrag'}
local intentEvents={'enter','exit','click','down','up','endDrag'}
local function callbacksFor(control,events)
 local count=0
 for _,name in ipairs(events)do assert(control.listeners[name],'missing native '..name);count=count+1 end
 for _ in pairs(control.listeners)do count=count-1 end
 assert(count==0,'unexpected native registration')
end
for i=1,7 do
 callbacksFor(boxes[i]:GetChild('hit'),targetEvents)
 callbacksFor(boxes[i]:GetChild('intentHit'),intentEvents)
 click(boxes[i]:GetChild('hit'),i);assert(calls.index==i)
end
-- A surface created from a feedback snapshot must remain usable after actual actor replaces it.
local shadowInitial={};for k,v in pairs(battle.enemies[2])do shadowInitial[k]=v end
surfaces.entries[2].actor=shadowInitial
local extra=bind(8,shadowInitial,2)
surfaces.entries[8].actor=battle.enemies[2]
click(extra:GetChild('hit'),82);assert(calls.index==2)
surfaces.entries[8]=nil;surfaces.boxes[8]=nil;target.unbindEnemyControl(8,extra);detail.unbindEnemyDetailControls(8,extra)
local settledHit=boxes[7]:GetChild('hit')
local before=settledHit.listeners.click
target.bindEnemyControl(7,boxes[7]);detail.bindEnemyDetailControls(7,boxes[7])
assert(settledHit.listeners.click==before,'idempotent one handle binding')
-- Existing static controls remain active, cards and potions preserve hover/help initialization.
event(static.hero:GetChild('hit'),'click',1);assert(calls.index==0)
event(static.card1:GetChild('hit'),'enter',1);assert(owner.hover==1);event(static.card1:GetChild('hit'),'exit',1);assert(owner.hover==nil)
-- A feedback snapshot changes actor object identity but not stable actor identity.
local original=battle.enemies[3];local shadow={};for k,v in pairs(original)do shadow[k]=v end
surfaces.entries[3].actor=shadow;owner.busy=true;owner.busy=false;surfaces.entries[3].actor=original
click(boxes[3]:GetChild('hit'),33);assert(calls.index==3,'snapshot replacement must not permanently disable a surface')
-- Manager entry/core insertion index changes; stable actor surface must target current core index.
table.insert(battle.enemies,1,table.remove(battle.enemies,7))
local staleCount=calls.status
click(boxes[7]:GetChild('hit'),70)
assert(calls.status==staleCount,'stale list index must not retarget a different core actor')
for slot,e in pairs(surfaces.entries)do for i,a in ipairs(battle.enemies)do if a.id==e.id then e.index=i;e.actor=a end end end
click(boxes[7]:GetChild('hit'),71);assert(calls.index==1,'target current original list index, not slot')
local intent=boxes[7]:GetChild('intentHit');click(intent,73);assert(calls.spec.index==1 and calls.spec.controlBox==boxes[7])
-- Retirement must preserve unrelated control callbacks and detail state.
local kept=static.hero:GetChild('hit')
local cardHit=static.card1:GetChild('hit')
local potion=static.potion1
local function snapshotListeners()
 local current={}
 for _,control in ipairs({kept,cardHit,potion,boxes[1]:GetChild('hit'),(boxes[1]:GetChild('intentHit'))})do
  local listeners={}
  for name,fn in pairs(control.listeners)do listeners[name]=fn end
  current[control]=listeners
 end
 return function()
  for control,listeners in pairs(current)do
   for name,fn in pairs(listeners)do assert(control.listeners[name]==fn,'retirement changed unrelated listener') end
   for name,fn in pairs(control.listeners)do assert(listeners[name]==fn,'retirement added unrelated listener') end
  end
 end
end
local preserved=snapshotListeners()
local function capture(box,touch)
 local callbacks={}
 for _,name in ipairs({'hit','intentHit'})do
  local control=box:GetChild(name)
  for _,fn in pairs(control.listeners)do callbacks[#callbacks+1]=function()fn({touchId=touch})end end
 end
 return callbacks
end
local old=boxes[7];local oldHit=old:GetChild('hit');event(oldHit,'down',74);event(intent,'down',75)
local oldCallbacks=capture(old,74)
surfaces.boxes[7]=nil;surfaces.entries[7]=nil
owner.info={source=cardHit,transient=true};owner.help={source=cardHit}
target.unbindEnemyControl(7,old);detail.unbindEnemyDetailControls(7,old)
assert(not ownership.enemyInputs[7] and owner.info and owner.help,'retirement left stale input or erased unrelated card help')
preserved()
old.alive=false
local replacement=bind(7,battle.enemies[2],2)
local function total()local n=0;for k,v in pairs(calls)do if type(v)=='number'and k~='index'then n=n+v end end;return n end
local baseline=total()
for _,fn in ipairs(oldCallbacks)do fn()end
assert(total()==baseline,'destroyed callbacks changed new UI or targeted reused slot')
assert(ownership.enemyInputs[7],'retired surface cleanup erased replacement input')
click(replacement:GetChild('hit'),76);assert(calls.index==2)

local function retireProbe(box,engineDestroyed)
 surfaces.boxes[9]=nil;surfaces.entries[9]=nil
 target.unbindEnemyControl(9,box,engineDestroyed);detail.unbindEnemyDetailControls(9,box,engineDestroyed)
 if engineDestroyed then box.alive=false end
end
-- A native Enter can run while binding before registration raises. Register
-- cleanup first so the partially bound surface cannot hold the owner's help.
local partial=control('partial');control('hit',partial);local partialHit=control('intentHit',partial)
registrations=0;failAt=#targetEvents+1
beforeFailure=function(control,event,fn)
 assert(control==partialHit and event=='enter')
 fn({touchId=900})
 assert(owner.help and owner.help.source==partialHit)
 owner.info={source=partialHit,transient=true}
end
local partialOK,partialError=pcall(bind,9,battle.enemies[2],2,partial)
failAt,beforeFailure=nil,nil
assert(not partialOK and tostring(partialError):find('injected native registration failure',1,true))
retireProbe(partial)
assert(not owner.help and not owner.info,'partial intent Enter was not cleaned after native registration failed')
preserved()

failAt=math.huge;registrations=0
local probe=bind(9,battle.enemies[2],2);local registrationCount=registrations
failAt=nil;retireProbe(probe)
assert(registrationCount==#targetEvents+#intentEvents,'all native target and intent registration sites must be covered')
for _,reentrant in ipairs({false,true})do
 for site=1,registrationCount do
  local box=control('probe'..site);control('hit',box);control('intentHit',box)
  registrations=0;failAt=site
  owner.help={source=cardHit};owner.info={source=cardHit,transient=true}
  if reentrant then reentrantRetire=function()retireProbe(box,true)end end
  local ok,err=pcall(bind,9,battle.enemies[2],2,box)
  failAt,reentrantRetire=nil,nil
  if reentrant then
   assert(ok,'reentrant retirement failed '..site..': '..tostring(err))
   assert(registrations==site,'registration continued after retirement at '..site)
  else
   assert(not ok and tostring(err):find('injected native registration failure',1,true),'missing injected failure '..site)
  end
  local callbacks=capture(box,901)
  retireProbe(box)
  assert(not ownership.enemyInputs[9] and owner.help.source==cardHit and owner.info.source==cardHit,
   'partial bind retained input or erased unrelated help')
  preserved()
  local fresh=bind(9,battle.enemies[2],2)
  local freshInput=assert(ownership.enemyInputs[9]);local count=total()
  for _,fn in ipairs(callbacks)do fn()end
  assert(total()==count,'partial bind retained active stale callback at registration '..site)
  assert(ownership.enemyInputs[9]==freshInput and owner.help.source==cardHit and owner.info.source==cardHit,
   'stale callback changed replacement input or unrelated help')
  retireProbe(fresh)
 end
end
print('REENTRANT_RETIRE_SITES='..registrationCount)
print('PARTIAL_BIND_FAILURE_SITES='..registrationCount)
-- Cross-battle same IDs cannot activate an old surface before lifecycle cleanup runs.
local newer=Combat.new(Data,{deck={'strike'},enemies={'acid_slime_m','acid_slime_m'},seed=42})
owner.run.combat=newer;baseline=total();click(replacement:GetChild('hit'),77);event(replacement:GetChild('intentHit'),'enter',78)
assert(total()==baseline,'old battle identity remained usable')
print('DYNAMIC_MONSTER_INPUT_BINDINGS_PASS')
