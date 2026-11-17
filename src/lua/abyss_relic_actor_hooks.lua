-- Actor-facing relic reactions; no session, card execution or combat host import.
local Presence=require('abyss_actor_presence')
local Reactions=require('abyss_combat_reactions')
local Queries=require('abyss_relic_queries')
local Out={}

do
local Q=Queries.boss
local function queryIndex(_,key)return Q[key]end
local function queryNewIndex(self,key,value)if Q[key]~=nil then Q[key]=value else rawset(self,key,value)end end
local M=setmetatable({}, {__index=queryIndex,__newindex=queryNewIndex})
Out.boss=M
local owns=Q.privateOwns
function M.wasHpLost(state,actor,amount)
 if actor==state.player and amount>0 and owns(state,'runic_cube')then
  local combat=false;for _,e in ipairs(state.enemies)do if Presence.isPresent(e)then combat=true;break end end
  if combat then require('abyss_combat_reactions').enqueueReaction(state,{op='draw',value=1},true)end
 end
end
end

do
local Q=Queries.uncommon
local function queryIndex(_,key)return Q[key]end
local function queryNewIndex(self,key,value)if Q[key]~=nil then Q[key]=value else rawset(self,key,value)end end
local M=setmetatable({}, {__index=queryIndex,__newindex=queryNewIndex})
Out.uncommon=M
local function effect(op,value,extra)local e=extra or {};e.op=op;e.value=value;return e end
function M.onMonsterDeath(state,enemy)
 if not M.owns(state,'gremlin_horn')or enemy.hp~=0 then return {}end
 for _,other in ipairs(state.enemies)do
  if other~=enemy and Presence.isPresent(other)and not other.isDying then return {effect('energy',1),effect('draw',1)}end
 end
 return {}
end
function M.wasHpLost(state,actor,amount)
 if actor==state.player and amount>0 and M.owns(state,'self_forming_clay')then return {effect('gainStatus',3,{status='next_turn_block'})}end
 return {}
end
function M.vulnerablePercent(owner,target)if target~=owner.player and M.owns(owner,'paper_frog')then return 175 end end
end

do
local Q=Queries.rare
local function queryIndex(_,key)return Q[key]end
local function queryNewIndex(self,key,value)if Q[key]~=nil then Q[key]=value else rawset(self,key,value)end end
local M=setmetatable({}, {__index=queryIndex,__newindex=queryNewIndex})
Out.rare=M
local owns=Q.privateOwns
local function enqueue(s,e,top)Reactions.enqueueReaction(s,e,top)end
function M.blockPower(s,target,id)
 return target==s.player and (id=='weak'and owns(s,'ginger')or id=='frail'and owns(s,'turnip'))or false
end
function M.onVulnerableApplied(s,target)
 if target~=s.player and owns(s,'champion_belt')then enqueue(s,{op='rareRelicWeak',targetId=target.id,value=1})end
end
function M.onAttacked(s,owner,damageType,amount)
 if owns(s,'torii')and owner~=nil and damageType=='normal'and amount>1 and amount<=5 then return 1 end
 return amount
end
function M.blockAtTurnStart(s,amount)return owns(s,'calipers')and math.max(0,amount-15)or 0 end
end

do
local Q=Queries.shop
local function queryIndex(_,key)return Q[key]end
local function queryNewIndex(self,key,value)if Q[key]~=nil then Q[key]=value else rawset(self,key,value)end end
local M=setmetatable({}, {__index=queryIndex,__newindex=queryNewIndex})
Out.shop=M
function M.onBlockBroken(state,target)
 if M.owns(state,'hand_drill')and target~=state.player then
  require('abyss_combat_reactions').enqueueReaction(state,
   {op='shopRelic',kind='handDrill',targetId=target.id},false)
 end
end
end

do
local M=setmetatable({}, {__index=Queries.hooks})
Out.combat=M
local function redSkullHealth(state,actor,before,queuedFatal,c,A)
 if M.owns(state,'red_skull')then
  local bloodied=actor.hp<=actor.maxHp/2.0
  local wasBloodied=before<=actor.maxHp/2.0
  if bloodied and not wasBloodied and not c.redSkullActive then
   c.redSkullActive=true
   if queuedFatal then require('abyss_combat_reactions').enqueueReaction(state,{op='gainStatus',status='strength',value=3},true)
   else A.applyPower(state,actor,'strength',3,actor)end
  elseif not bloodied and wasBloodied and c.redSkullActive then
   c.redSkullActive=false
   if queuedFatal then require('abyss_combat_reactions').enqueueReaction(state,{op='gainStatus',status='strength',value=-3},true)
   else A.applyPower(state,actor,'strength',-3,actor)end
  end
 end
end
function M.hpChanged(state,actor,before,queuedFatal,A)
 if actor~=state.player or not queuedFatal and not Presence.isActive(actor)then return end
 local inCombat=false
 for _,enemy in ipairs(state.enemies or {})do if Presence.isPresent(enemy)then inCombat=true;break end end
 if not inCombat and not queuedFatal then return end
 local c=state.relicCombat
 if not c then return end
 redSkullHealth(state,actor,before,queuedFatal,c,A)
end
function M.wasHpLost(state,actor,amount)
 if actor~=state.player or amount<=0 then return end
 local inCombat=false
 for _,enemy in ipairs(state.enemies or {})do if Presence.isPresent(enemy)then inCombat=true;break end end
 local c=state.relicCombat
 if not inCombat or not c then return end
 Out.boss.wasHpLost(state,actor,amount)
 for _,effect in ipairs(Out.uncommon.wasHpLost(state,actor,amount))do
  require('abyss_combat_reactions').enqueueReaction(state,effect,true)
 end
 if M.owns(state,'centennial_puzzle') and not c.centennialUsed then
  c.centennialUsed=true
  -- wasHPLost queues a TOP DrawCardAction; it must not draw while the HP
  -- action is still executing. This is the existing CardActions item ABI.
  -- The outer action owner drains it, including draw-triggered actions.
  require('abyss_combat_reactions').enqueueReaction(state,{op='draw',value=3},true)
 end
end
end
return Out
