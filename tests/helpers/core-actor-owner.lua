local C,A,D=require('abyss_combat'),require('abyss_actor'),require('abyss_data')
local function observe(label,value)ACTOR_GRAPH_WRITE(value,label)end
local function battle()
 return C.new(D,{seed=42,deck={{cardId='strike',upgraded=false},{cardId='defend',upgraded=false}},enemies={'jaw_worm','jaw_worm'}})
end
local function snapshot(label,s,fn)
 local ok,a,b=pcall(fn)
 if not ok and type(a)=='string'then a=a:gsub('^.-:%d+: ','')end
 observe(label,{state=s,ok=ok,a=a,b=b})
end
for _,slow in ipairs({false,0,1,3})do
 for _,fixed in ipairs({false,true})do
  for _,base in ipairs({0,1,7,17.25,16777217})do
   local s=battle();local p,t=s.player,s.enemies[1]
   p.statuses.strength,p.statuses.vigor,p.statuses.double_damage,p.statuses.pen_nib,p.statuses.weak=2,3,1,1,1
   t.statuses.vulnerable,t.statuses.flight=2,1
   if slow~=false then t.statuses.slow=slow end
   p.stance='Wrath'
   snapshot('attack:'..tostring(slow)..':'..tostring(fixed)..':'..base,s,function()
    return A.intentAttackPreview(s,p,t,base,fixed)
   end)
  end
 end
end
for _,phase in ipairs({'startTurnEffects','endRound','endTurn'})do
 for _,hp in ipairs({1,20,80})do
  local s=battle();local p=s.player;p.hp=hp
  p.statuses.poison,p.statuses.regen,p.statuses.weak,p.statuses.frail,p.statuses.vulnerable=2,3,2,1,2
  p.weakJustApplied=true;p.frailJustApplied=true
  snapshot('decay:'..phase..':'..hp,s,function()return A[phase](s,p)end)
 end
end
for _,kind in ipairs({'ordinary','spore','looter','stasis'})do
 local s=battle();local t=s.enemies[1];t.hp=1
 if kind=='spore'then t.statuses.spore_cloud=2
 elseif kind=='looter'then t.ai={kind='looter'};t.stolenGold=17
 elseif kind=='stasis'then
  t.statuses.stasis=1;s.act2StasisCards={[t.id]=s.hand[1]};s.player.statuses.master_reality=1
 end
 snapshot('death:'..kind,s,function()return A.damage(s,s.player,t,6,true)end)
end
local s=battle();s.player.statuses.missing=2
snapshot('invalid-status',s,function()return A.endRound(s,s.player)end)
