package.path='src/lua/?.lua;build/lua/?.lua;'..package.path
local CardHooks=require('abyss_combat_card_hooks')
local RelicHooks=require('abyss_relic_actor_hooks')
local Artifact=require('abyss_actor_artifact')
local Upgrade=require('abyss_card_upgrade')
local StanceDamage=require('abyss_stance_damage')
local V4Death=require('abyss_original_v4_actor_hooks')
assert(not package.loaded.abyss_actor and not package.loaded.abyss_combat and not package.loaded.abyss_card_actions,'leaves must cold-load without command owners')
local C,A,D=require('abyss_combat'),require('abyss_actor'),require('abyss_data')
local Colorless,Silent,Defect,Watcher=require('abyss_colorless_cards'),require('abyss_silent_final_cards'),require('abyss_defect_final_cards'),require('abyss_watcher_final_cards')
local Relics,Stances,V4=require('abyss_relic_combat_hooks'),require('abyss_stances'),require('abyss_original_v4')
local function battle()return C.new(D,{seed=42,deck={{cardId='strike',upgraded=false}},enemies={'jaw_worm','jaw_worm'}})end
local count=0
local function test(name,fn)fn();count=count+1;print('PASS '..name)end
local marker={kind='leaf-error'}
test('ordinary facade slots and saved functions share the leaf implementations',function()
 assert(Colorless.debuffApplied==CardHooks.colorless.debuffApplied)
 assert(Silent.powerDescription==CardHooks.silent.powerDescription)
 assert(Defect.incoming==CardHooks.defect.incoming and Watcher.gainedBlock==CardHooks.watcher.gainedBlock)
 assert(Relics.hpChanged==RelicHooks.combat.hpChanged and A.tryBlockDebuff==Artifact.tryBlockDebuff)
 assert(C.upgrade==Upgrade.upgrade and Stances.damageMultiplier==StanceDamage.damageMultiplier and V4.enemyDied==V4Death.enemyDied)
 local old=Silent.powerDescription
 Silent.powerDescription=function(_,id)if id=='weak'then return 'live-shared-description'end end
 local s=battle();s.player.statuses.weak=1
 local found;for _,v in ipairs(A.statusView(s.player))do if v.id=='weak'then found=v.description end end
 assert(found=='live-shared-description');Silent.powerDescription=old
end)
test('Actor observes live incoming and HP hooks through the public facade',function()
 local incoming,hp=Defect.incoming,Relics.hpChanged
 local s=battle();local p=s.player;local before=p.hp;local calls=0
 Defect.incoming=function(state,target,amount)assert(state==s and target==p and amount==5);calls=calls+1;return 0 end
 Relics.hpChanged=function(state,target)assert(state==s and target==p);calls=calls+1 end
 A.damage(s,s.enemies[1],p,5,true)
 assert(p.hp==before and calls==2)
 Defect.incoming,Relics.hpChanged=incoming,hp
end)
test('explicit leaf callbacks retain thrown object identity',function()
 local old=Watcher.gainedBlock;Watcher.gainedBlock=function()error(marker)end
 local s=battle();local ok,why=pcall(A.block,s,s.player,1,true)
 assert(not ok and why==marker);Watcher.gainedBlock=old
 local oldArtifact=A.tryBlockDebuff;A.tryBlockDebuff=function()error(marker)end
 local focus=require('abyss_focus');ok,why=pcall(focus.apply,s,s.player,-1,s.player)
 assert(not ok and why==marker);A.tryBlockDebuff=oldArtifact
end)
test('Stasis reads current shared upgrade methods and retains the stored card identity',function()
 local oldCan,oldUpgrade=C.canUpgrade,C.upgrade
 local s=battle();local orb=s.enemies[1];local card=s.hand[1];local calls=0
 s.player.statuses.master_reality=1;s.act2StasisCards={[orb.id]=card}
 C.canUpgrade=function(state,c)assert(state==s and c==card);calls=calls+1;return true end
 C.upgrade=function(state,c)assert(state==s and c==card);calls=calls+1;c.upgraded=true;return true end
 local result=require('abyss_act2_stasis').death(s,orb)
 assert(calls==2 and result.op=='stasis_return'and result.ownerId==orb.id and s.act2StasisCards[orb.id]==card and card.upgraded)
 C.canUpgrade,C.upgrade=oldCan,oldUpgrade
end)
print('CORE_ACTOR_LEAF_CONTRACT '..count..' groups passed')
