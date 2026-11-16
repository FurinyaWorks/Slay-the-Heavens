-- Opt-in white-box workload; the official engine OnUpdate wrapper is not simulated.
local observe=dofile('scripts/runtime-baseline/observer.lua')
local counts={nativeCalls=0,propertyWrites=0,methods={},properties={},calls={},allocations={},created=0,destroyed=0}
local retired=setmetatable({},{__mode='k'})
function ALLOC(site,value)counts.allocations[site]=(counts.allocations[site]or 0)+1;return value end
function OBSERVE(control)counts.created=counts.created+1;observe(control,counts)end
function RETIRE(control)if not retired[control]then retired[control]=true;counts.destroyed=counts.destroyed+1 end end
local function counted(object,key,label)
 local old=assert(object[key],label)
 object[key]=function(...)counts.calls[label]=(counts.calls[label]or 0)+1;return old(...)end
end
local function module(name,methods)
 local m=require(name)
 for _,key in ipairs(methods)do counted(m,key,name..'.'..key)end
 return m
end
module('abyss_battle_enemy_view',{'geometry'})
module('abyss_actor',{'statusView'})
module('abyss_actor_motion',{'idle'})
module('abyss_monster_art',{'pose'})
local particle=module('abyss_monster_intent_particle_view',{})
local originalNew=particle.new
local particleViews={}
particle.new=function(...)
 local v=originalNew(...);particleViews[#particleViews+1]=v
 for _,key in ipairs({'sync','update','paint','clear'})do counted(v,key,'particles.'..key)end
 return v
end
local F=assert(load(FIXTURE,'@tests/lua/support/game_ui_fixture.lua'))()
assert(#F.Templates.AbyssMonsterPower.children==6,'particle resource budget requires root plus six original children')
local Run=require('abyss_run')
local Surfaces=require('abyss_monster_surfaces')
local Powers=require('abyss_monster_power_surfaces')
local host,root=F.fixture()
for _,key in ipairs({'update','refresh','animate','syncController'})do counted(host,key,'GameUI.'..key)end
for _,key in ipairs({'update','render'})do counted(host.battleUI,key,'BattleUI.'..key)end
counted(host.battleUI.feedback,'update','Feedback.update')
for _,name in ipairs({'nodeUI','deckUI','mapUI'})do counted(host[name],'update',name..'.update')end
assert(F.start(host));assert(host.run.runSeed=='1');assert(Run.startCombat(host.run,'cultist_solo'))
local deck={'strike','defend','defend','strike','bash','defend','strike','defend','strike','defend'}
local function battle(enemies)
 host.run.combat=F.Combat.new(F.Data,{enemies=enemies,deck=deck,seed=42})
 host:refresh()
end
local fields={'visible','activeInHierarchy','alive','x','y','sizeDeltaX','sizeDeltaY','localScaleX','localScaleY','rotation','imageId','imageColor','fontColor','text','raycastTarget'}
local function primitive(v)
 if type(v)~='table'then return tostring(v)end
 local keys={};for k in pairs(v)do keys[#keys+1]=k end
 table.sort(keys,function(a,b)return tostring(a)<tostring(b)end)
 local out={};for _,k in ipairs(keys)do out[#out+1]=tostring(k)..'='..primitive(v[k])end
 return '{'..table.concat(out,',')..'}'
end
local function visual()
 local out={}
 local function control(c,label,children)
  out[#out+1]=label
  for _,k in ipairs(fields)do out[#out+1]=k..'='..primitive(c[k])end
  if children then local keys={};for k in pairs(c.children)do keys[#keys+1]=k end;table.sort(keys)
   for _,k in ipairs(keys)do control(c.children[k],label..'/'..k,true)end
  end
 end
 local panel=root:GetChild('battlePanel')
 control(panel:GetChild('hero'):GetChild('portrait'),'hero')
 for i=1,10 do control(panel:GetChild('card'..i),'card'..i)end
 local manager=Surfaces.get(panel)
 manager:each(function(box,_,entry)
  control(box:GetChild('portrait'),entry.id..'/portrait')
  for _,layer in ipairs({'intentVfxBehind','intentVfxAfter'})do
   local pool=Powers.get(box:GetChild(layer))
   if pool then pool:each(function(c,_,row)control(c,entry.id..'/'..layer..'/'..row.id,true)end)end
  end
 end)
 VISUAL(table.concat(out,'\n'))
end
local frames,live=0,0
local update=host.update
host.update=function(_,dt)
 local ok,why=update(host,dt);frames=frames+1
 if VERIFY_VISUAL then visual()end
 return ok,why
end
local function step(dt)assert(host:update(dt)~=false)end
local function steps(n)for _=1,n do step(1/60)end end
local function inventory()
 local current=live+counts.created-counts.destroyed
 local effects,outputs,pages=0,0,0
 for _,v in ipairs(particleViews)do
  for _,s in pairs(v.states)do effects=effects+#s.effects end
  for _,o in pairs(v.outputs)do for _,p in pairs(o)do p:each(function()outputs=outputs+1 end);for _ in pairs(p.pages)do pages=pages+1 end end end
 end
 return current,effects,outputs,pages
end
local function mark(name)
 local current,effects,outputs,pages=inventory()
 CORE(host.run) -- same full Run/RNG graph, including aliases, via existing observer.
 MARK(name,counts,frames,current,effects,outputs,pages)
 live=current;frames=0
 for k in pairs(counts)do counts[k]=type(counts[k])=='table'and{}or 0 end
end
battle({'cultist','jaw_worm'});steps(120);mark('warmup')
steps(300);mark('idle-300')
-- Real native clicks, selection/targeting and completion. No fast-mode change.
local played=0
for _=1,3 do
 local b=host.run.combat
 local slot
 for i,card in ipairs(b.hand)do if F.Combat.canPlay(b,card.uid,host.battleUI.target)then slot=i;break end end
 assert(slot,'continuous-card workload lost a playable card')
 local uid=b.hand[slot].uid
 F.click(root,'battlePanel','card'..slot)
 if host.battleUI.selected==uid then
  local _,why=F.Combat.canPlay(b,uid,nil)
  if why=='invalid_target' then
   local target=b.enemies[host.battleUI.target]
   local _,slot=Surfaces.get(root:GetChild('battlePanel')):find(target.id)
   F.click(root,'battlePanel','enemy'..assert(slot))
  else F.click(root,'battlePanel','playArea')end
 end
 local remains=false;for _,card in ipairs(b.hand)do if card.uid==uid then remains=true end end
 assert(not remains and not host.battleUI.busy,'card command did not complete')
 played=played+1;steps(20)
end
assert(played==3);mark('cards-3')
battle({'collector','byrd'})
local b=host.run.combat
local function move(a,id)for i,intent in ipairs(a.intents)do if intent.id==id then a.intentIndex=i;return end end;error('missing source intent')end
move(b.enemies[1],'spawn');move(b.enemies[2],'stunned');host:refresh();steps(120);mark('particle-warmup')
steps(300);mark('particles-300')
for cycle=1,20 do
 assert(host:openDeck());steps(15)
 local before=0;for _,v in ipairs(particleViews)do for _ in pairs(v.outputs)do before=before+1 end end
 assert(before==0,'hidden battle recreated particle outputs')
 host:closeDeck();steps(15)
 CYCLE(cycle,inventory())
end
mark('switch-20')
-- 60 seconds of simulated foreground time, independent of host wall clock.
for block=1,12 do steps(300);mark('long-'..block)end
assert(host:disable());mark('disable')
print('BATTLE_RUNTIME_PASS seed=42 cards=3 switches=20 longFrames=3600')
