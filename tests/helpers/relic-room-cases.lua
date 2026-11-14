local H=require('abyss_relic_hooks')
local U=require('abyss_uncommon_relics')
local Health=require('abyss_potion_health')
local original={localId=H.localId,gainGold=H.gainGold,owns=H.owns,uncommon=U.onEnterRoom,blocked=Health.blocked}
local function eq(a,b,label)assert(a==b,'[RELIC_ROOM] '..label)end
local function reset()
 H.localId=original.localId;H.gainGold=original.gainGold;H.owns=original.owns
 U.onEnterRoom=original.uncommon;Health.blocked=original.blocked
end
local function state(ids)
 local counters={maw_bank=0,sentinel=7}
 local run={relics=ids or {},relicCounters=counters,counterAlias=counters,hp=20,maxHp=80,gold=10,phase='map'}
 run.self=run;setmetatable(run,{tag='run-meta'});setmetatable(counters,{tag='counter-meta'})
 return run
end
local function apply(label,r,kind,phase,trace)
 local loads={};local old=require
 require=function(name)loads[#loads+1]=name;return old(name)end
 local result=table.pack(pcall(H.onEnterRoom,r,kind,phase));require=old
 if type(result[2])=='string'then
  EQUIP_ERROR(result[2]);result[2]=result[2]:gsub('src/lua/abyss_relic_hooks.lua:%d+:','src/lua/abyss_relic_hooks.lua:<line>:')
 end
 EQUIP_GRAPH_WRITE({run=r,result=result,loads=loads,trace=trace},label,false)
 return table.unpack(result,1,result.n)
end
if ROOM_GROUP=='ordinary'then
 for _,kind in ipairs({'event','shop','camp','battle','unknown'})do
  for _,phase in ipairs({'enter','entered','other',false})do
   for _,ids in ipairs({{}, {'maw_bank','ssserpent_head','meal_ticket','ancient_tea_set'}, {'MawBank','maw_bank','SsserpentHead','ssserpent_head','MealTicket','meal_ticket','Ancient Tea Set'}})do
    reset();local r=state(ids);local p=phase or nil
    eq(apply(kind..tostring(phase),r,kind,p),true,'ordinary success')
    if #ids==4 then
     eq(r.gold,10+(p~='entered'and (12+(kind=='event'and 50 or 0))or 0),'gold phases')
     eq(r.hp,20+(p~='enter'and kind=='shop'and 15 or 0),'healing phase')
     if p~='enter'and kind=='camp'then eq(r.relicCounters.ancient_tea_set,-2,'tea phase')end
    end
   end
  end
 end
 for _,value in ipairs({false,0,-2,12})do reset();local r=state({'maw_bank'});r.relicCounters.maw_bank=value;apply('counter-'..tostring(value),r,'event');eq(r.gold,value==-2 and 10 or 22,'disabled bank')end
 for _,field in ipairs({'relics','relicCounters'})do for _,value in ipairs({false,'nil'})do
  reset();local r=state({'maw_bank'});if value=='nil'then r[field]=nil else r[field]=value end;apply(field..tostring(value),r,'camp')
 end end
end
if ROOM_GROUP=='dynamic'then
 reset();local r=state({'maw_bank','ssserpent_head'});local trace={}
 U.onEnterRoom=function(run,kind,phase)trace[#trace+1]={'uncommon',run,kind,phase};run.relics={'maw_bank','ssserpent_head','maw_bank'};run.uncommonFirst=true end
 local count=0
 H.localId=function(id)trace[#trace+1]={'localId',id};return id end
 H.gainGold=function(run,n)
  eq(run.uncommonFirst,true,'uncommon first');count=count+1;trace[#trace+1]={'gold1',n};run.gold=run.gold+n
  H.localId=function(id)trace[#trace+1]={'localId2',id};return id=='maw_bank'and 'ssserpent_head'or id end
  H.gainGold=function(owner,amount)trace[#trace+1]={'gold2',amount};owner.gold=owner.gold+amount*2 end
 end
 apply('dynamic-methods',r,'event',nil,trace);eq(count,1,'dynamic gainGold');eq(r.gold,322,'dynamic localId each comparison')
 reset();r=state({'maw_bank','ancient_tea_set'});trace={}
 H.gainGold=function(run,n)run.gold=run.gold+n;H.owns=function(owner,id)trace[#trace+1]={'new-owns',owner,id};return true end end
 H.owns=function()error('stale owns',0)end
 apply('dynamic-owns',r,'camp',nil,trace);eq(r.relicCounters.ancient_tea_set,-2,'late owns read')
 reset();r=state({'maw_bank'});trace={}
 U.onEnterRoom=function(run)run.relics={'meal_ticket'};run.relicCounters=false end
 apply('uncommon-replaces-list',r,'shop',nil,trace);eq(r.hp,35,'post uncommon list');eq(r.relicCounters,false,'counter not eagerly created')
 reset();r=state({'maw_bank','maw_bank'});local oldList=r.relics;local calls=0
 H.gainGold=function(run,n)calls=calls+1;run.gold=run.gold+n;run.relics={'meal_ticket'}end
 apply('gold-replaces-list',r,'shop',nil,{oldList=oldList});eq(calls,2,'entry iterator keeps original list');eq(r.hp,35,'healing reads replaced list')
end
if ROOM_GROUP=='errors'then
 reset();local r=state({'maw_bank'});local trace={}
 U.onEnterRoom=function(run)run.partial='uncommon';error('uncommon injected',0)end
 H.localId=function()error('must not continue',0)end
 eq(apply('uncommon-throw',r,'event',nil,trace),false,'uncommon abort');eq(r.gold,10,'uncommon prevents gold')
 reset();r=state({'maw_bank','ssserpent_head'});local n=0
 H.gainGold=function(run,amount)n=n+1;run.gold=run.gold+amount;if n==2 then error('gold injected',0)end end
 eq(apply('gold-late-failure',r,'event'),false,'gold fails');eq(r.gold,72,'gold partial writes')
 reset();r=state({'maw_bank','meal_ticket','meal_ticket'});n=0
 Health.blocked=function()n=n+1;if n==2 then error('health injected',0)end;return false end
 eq(apply('heal-late-failure',r,'shop'),false,'heal fails');eq(r.hp,35,'heal partial writes');eq(r.gold,22,'gold before heal')
 reset();r=state({'maw_bank','ancient_tea_set'});r.relicCounters=setmetatable({maw_bank=0},{__newindex=function(owner,key,value)rawset(owner,'attempt',{key,value});error('tea injected',0)end})
 eq(apply('tea-late-failure',r,'camp'),false,'tea fails');eq(r.gold,22,'gold before tea');eq(r.relicCounters.attempt[2],-2,'tea write observed')
 for _,field in ipairs({'hp','maxHp','relicCounters','relics'})do reset();r=state({'maw_bank','meal_ticket'});r[field]=false;apply('false-'..field,r,'shop')end
 reset();r=state({'meal_ticket'});Health.blocked=function()return true end;apply('blocked-heal',r,'shop');eq(r.hp,20,'blocked heal')
 reset();r=state({'maw_bank'});local payload=setmetatable({why='opaque'},{tag='error-meta'});payload.self=payload;r.errorAlias=payload
 H.gainGold=function(run)run.partial=payload;error(payload,0)end
 local ok,err=apply('opaque-error',r,'event',nil,{payload=payload});eq(ok,false,'opaque fails');eq(err,payload,'opaque identity')
end
if ROOM_GROUP=='integration'then
 for _,ids in ipairs({{'maw_bank','meal_ticket','ancient_tea_set'}, {'golden_idol','maw_bank','ssserpent_head'}, {'bloody_idol','maw_bank'}, {'mark_of_bloom','meal_ticket'}})do
  for _,kind in ipairs({'event','shop','camp'})do reset();local r=state(ids);apply('real-'..kind,r,kind,'enter');apply('real-entered-'..kind,r,kind,'entered')end
 end
 for _,blocked in ipairs({false,true})do for _,size in ipairs({5,10})do
  reset();local r=state({'eternal_feather','maw_bank','ancient_tea_set'});r.deck={};for i=1,size do r.deck[i]={uid=i}end
  if blocked then r.relics[#r.relics+1]='mark_of_bloom'end
  eq(apply('feather-enter',r,'camp','enter'),true,'feather success');eq(r.hp,blocked and 20 or 20+size/5*3,'real feather before entry gold');eq(r.gold,22,'feather entry gold')
  eq(r.relicCounters.ancient_tea_set,nil,'tea waits entered');apply('feather-entered',r,'camp','entered');eq(r.relicCounters.ancient_tea_set,-2,'real tea entered')
 end end
end
reset()
