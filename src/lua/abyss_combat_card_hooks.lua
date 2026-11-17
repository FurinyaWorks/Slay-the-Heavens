-- Power lifecycle and admission only; callers retain combat/transaction ownership.
local Presence=require('abyss_actor_presence')
local Reactions=require('abyss_combat_reactions')
local Schedule=require('abyss_power_schedule')
local Out={}

do
local M={}
Out.colorless=M
local function actions()return Reactions end
function M.endOwnerTurn(state,actor,Actors)
    if (actor.statuses.shackled or 0)>0 then
        local amount=actor.statuses.shackled
        Actors.applyPower(state,actor,'strength',amount,actor)
        actor.statuses.shackled=nil;require('abyss_power_schedule').remove(state,actor,'shackled')
    end
    if actor~=state.player then return end
    for _,bomb in ipairs(state.colorlessBombs or {})do
        if bomb.turns>0 then
            bomb.turns=bomb.turns-1;actor.statuses[bomb.id]=bomb.turns>0 and bomb.turns or nil
            if bomb.turns==0 then actions().enqueue(state,{op='damageAll',value=bomb.damage,fixed=true})end
        end
    end
end
function M.debuffApplied(state,target,id,amount,source)
    local n=state.player.statuses.sadistic_nature or 0
    if n<=0 or source~=state.player or target==state.player or id=='shackled'then return end
    local debuff=target.statusDefinitions[id].kind=='debuff'or (id=='strength'or id=='dexterity')and amount<=0
    if debuff then actions().enqueue(state,{op='colorless',kind='sadisticDamage',value=n},state.player,target)end
end
end

do
local M={}
Out.silent=M
local function remove(s,id)
 Schedule.remove(s,s.player,id);s.player.statuses[id]=nil
end
function M.powerDescription(actor,id)
 local n=actor.statuses[id]or 0
 local number=require('abyss_numbers').integer
 if id=='wraith_form'then return '每个自己的回合结束时，失去'..number(-n)..'点敏捷；敏捷减少可被人工制品抵挡。'
 elseif id=='nightmare'then return '下回合开始，获得'..number(n)..'张'..(actor.nightmareCardName or '所选卡牌')..'的临时复制，然后移除此能力。'end
end
function M.onHpLost(s)
 for _,name in ipairs({'hand','draw','discard'})do for _,c in ipairs(s[name])do if c.cardId=='masterful_stab'then
  c.masterfulLosses=(c.masterfulLosses or 0)+1
  if c.combatCost~=nil then c.combatCost=c.combatCost+1 end
  if c.turnCost~=nil then c.turnCost=c.turnCost+1 end
  if c.costOverride~=nil then c.costOverride=c.costOverride+1 end
  if c.costForTurn~=nil and c.costForTurn>=0 then c.costForTurn=c.costForTurn+1 end
 end end end
end
function M.endTurn(s,actor)
 if actor~=s.player then return end
 if actor.statuses.burst then remove(s,'burst')end
end
function M.death(s,actor,before,push)
 local n=actor.statuses.corpse_explosion or 0
 if before<=0 or actor.hp>0 or n<=0 or actor.escaped or actor==s.player then return end
 local live=false;for _,e in ipairs(s.enemies)do if Presence.isPresent(e)then live=true end end
 if live then (push or Reactions.enqueueReaction)(s,{op='silentFinal',kind='corpseDamage',value=actor.maxHp*n})end
end
end

do
local M={}
Out.defect=M
function M.removePower(state,id)
 Schedule.remove(state,state.player,id);state.player.statuses[id]=nil
 if id=='rebound'then state.reboundJustEvoked=nil end
end
function M.reducePower(state,id)
 local old=state.player.statuses[id]or 0
 if old<=1 then M.removePower(state,id)else state.player.statuses[id]=old-1 end
end
function M.incoming(state,target,amount)
 if target==state.player and target.statuses.buffer~=nil then
  if amount>0 then M.reducePower(state,'buffer')end
  return 0
 end
 return amount
end
function M.static(state,count)
 for _=1,count do
  Reactions.enqueueReaction(state,{op='channelOrb',orb='lightning',value=1},true)
 end
end
end

do
local M={}
Out.watcher=M
function M.gainedBlock(state,amount)
 local n=state.player.statuses.wave_of_the_hand or 0
 if amount<=0 or n<=0 then return end
 local effect={op='applyStatusAll',status='weak',value=n}
 if state.actionQueue then require('abyss_action_queue').pushBottom(state,{kind='effect',effect=effect})
 else Reactions.enqueue(state,effect)end
end
end

do
local M={}
Out.warriorStatus=M
local MAX=2147483647
local copy=require('abyss_copy').copy
local function integer(n,lo) return type(n)=='number' and n==n and n%1==0 and n>=(lo or 0) and n<=MAX end
local function resolved(s,c)
 local d=copy(assert(s.catalog.cards[c.cardId],'unknown status-build card'))
 if c.upgraded then for k,v in pairs(d.upgrade or {}) do d[k]=copy(v) end end;return d
end
local function cost(s,c)
 local d=resolved(s,c);local base=c.combatCost or d.cost;local turn=c.turnCost
 if turn==nil then turn=base end
 assert(integer(base) and integer(turn),'invalid Blood for Blood cost metadata');return base,turn
end
function M.onHpLost(s,n)
 assert(integer(n),'invalid Blood for Blood HP loss');if n==0 then return false end
 local times=s.player.damagedThisCombat or 0;assert(integer(times) and integer(times+1),'damagedThisCombat overflow')
 local changes={};local seen={}
 for _,name in ipairs({'hand','draw','discard'}) do
  for _,c in ipairs(s[name]) do
   assert(not seen[c.uid],'duplicate damage-notification UID');seen[c.uid]=true
   if c.cardId=='blood_for_blood' then
    local base,turn=cost(s,c);local nextBase=math.max(0,base-1)
    if nextBase~=base then changes[#changes+1]={card=c,base=nextBase,turn=math.max(0,turn-1)} end
   end
  end
 end
 for _,change in ipairs(changes) do change.card.combatCost=change.base;change.card.turnCost=change.turn end
 s.player.damagedThisCombat=times+1;return true
end
function M.onUpgrade(s,c)
 assert(c.cardId=='blood_for_blood' and not c.upgraded,'invalid Blood for Blood upgrade')
 local base,turn=cost(s,c);local rawBase=base<4 and base-1 or 3
 c.combatCost=math.max(0,rawBase);c.turnCost=turn>0 and math.max(0,rawBase+turn-base) or 0
 return true
end
end

do
local M={}
Out.warriorStrength=M
local MAX=2147483647
local function integer(v,lo) return type(v)=='number' and v==v and v%1==0 and v>=(lo or 0) and v<=MAX end
local function amount(state,id)
 local n=state.player.statuses[id] or 0;assert(integer(n),'invalid strength power amount');return n
end
local function action(op,value,extra)
 local e={op=op,value=value};for k,v in pairs(extra or {}) do e[k]=v end
 return {kind='effect',effect=e}
end
function M.planHpLost(state,owner,damageAmount)
 assert(type(damageAmount)=='number' and damageAmount==damageAmount,'invalid HP-loss hook amount')
 local result={top={},bottom={}};local n=amount(state,'rupture')
 if damageAmount>0 and owner==state.player and n>0 then
  result.top[1]=action('gainStatus',n,{status='strength'})
 end
 return result
end
end

do
local M={}
Out.triggers=M
local MAX=2147483647
local function integer(n,lo,hi) return type(n)=="number" and n==n and n%1==0 and n>=lo and n<=hi end
local function plain(t,why) assert(type(t)=="table" and getmetatable(t)==nil,why) end
local function dense(t)
    plain(t,"invalid card-trigger list")
    local n=0
    for k in next,t do assert(integer(k,1,MAX),"invalid card-trigger index");n=n+1 end
    for i=1,n do assert(rawget(t,i)~=nil,"sparse card-trigger list") end
    return n
end
local function powers(s)
    plain(s,"invalid card-trigger state");plain(s.player,"missing card-trigger player")
    plain(s.player.statuses,"missing card-trigger powers")
    return s.player.statuses
end
local function live(s)
    if not Presence.isActive(s.player) then return false end
    dense(s.enemies)
    for _,enemy in ipairs(s.enemies) do if Presence.isPresent(enemy) then return true end end
    return false
end
function M.resolveEnvenom(s,effect,Actors)
    powers(s);plain(effect,"invalid Envenom action")
    assert(effect.op=="cardTriggerPoison" and type(effect.targetId)=="string" and integer(effect.value,1,MAX),"invalid Envenom action")
    if not live(s) then return false end
    local target
    for _,enemy in ipairs(s.enemies) do if enemy.id==effect.targetId then assert(not target,"duplicate Envenom target");target=enemy end end
    if not target or not Presence.isActive(target) then return false end
    local old=target.statuses.poison or 0
    assert(integer(old,0,MAX),"invalid existing Envenom poison")
    -- PoisonPower's constructor caps a NEW Power, while an existing Power's
    -- stack uses the uncapped action amount. Actor adds Snake Skull after this
    -- constructor cap, before the shared Artifact gate.
    local value=old>0 and effect.value or math.min(9999,effect.value)
    return Actors.applyPower(s,target,"poison",value,s.player,nil,effect.poisonBonus)
end
end
return Out
