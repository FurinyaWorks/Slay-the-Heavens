package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local C=require('abyss_combat')
local D=require('abyss_data')
local Run=require('abyss_run')
local failed=0
local function test(name,fn)
 local ok,why=pcall(fn)
 print((ok and 'PASS 'or 'FAIL ')..name..(ok and ''or ': '..tostring(why)))
 if not ok then failed=failed+1 end
end
test('purged unplayable queued cards never acquire a discard owner',function()
 local s=C.new(D,{enemies={'cultist'},deck={},seed=42})
 s.catalog.cards.owner_unplayable={id='owner_unplayable',type='skill',cost=-2,effects={}}
 local before=#s.discard
 C.resolveQueuedCard(s,{card={uid=s.nextUid,cardId='owner_unplayable'},purge=true,autoplay=false})
 assert(#s.discard==before,'purged rejection changed physical card ownership')
end)
test('experimental player opening recharges energy before its draw phase',function()
 local r=Run.new(D,42,{character='defect',experimental=true})
 r.deck={{uid=31,cardId='defend_blue'}};r.relics={}
 assert(Run.startCombat(r,'cultist_solo'))
 local s=r.combat
 assert(s.experimentalMechanics)
 s.energy=0
 assert(C.startPlayerTurn(s))
 assert(s.energy==3,'player opening lost the ordinary energy recharge')
end)
test('enemy owner end executes the actual status lifecycle',function()
 local s=C.new(D,{enemies={'cultist'},deck={},seed=42})
 local enemy=s.enemies[1];enemy.hp=20;enemy.maxHp=40
 C.addStatus(enemy,'regen',3)
 C.resolveEnemyAction(s,{stage='ownerEnd'},enemy)
 assert(enemy.hp==23,'owner end skipped its real regeneration')
end)
test('each source enemy damage hit remains a separate queued action',function()
 local s=C.new(D,{enemies={'cultist'},deck={},seed=42})
 local enemy=s.enemies[1]
 enemy.intents[enemy.intentIndex].effects={{op='damage',value=2,times=3}}
 local before=s.player.hp
 assert(C.endTurn(s))
 assert(s.player.hp==before-6,'enemy intent lost a captured damage hit')
end)
test('private handler names do not add public enemy stages',function()
 local s=C.new(D,{enemies={'cultist'},deck={},seed=42})
 local ok,why=pcall(C.resolveEnemyAction,s,{stage='darkling'},s.enemies[1])
 assert(not ok and type(why)=='string'and why:find('unknown queued enemy action',1,true),
  'private helper became a public enemy action stage')
end)
assert(failed==0,tostring(failed)..' COMBAT_OWNER_SEMANTICS failures')
print('COMBAT_OWNER_SEMANTICS 5 groups passed')
