-- Candidate-local entry adapter; production files are never changed.
function MonsterFitBattle()
 assert(view and not view.disabled,'normal GameUI must be ready')
 if not view.run then
  assert(view:start());assert(view:selectCharacter('traveler'));assert(view:selectElement('ironclad'));assert(view:confirmCharacter())
 end
 local Run=require('abyss_run')
 -- Dedicated combat lab skips the opening blessing; no campaign save is changed.
 view.run.phase='map';view.run.node=nil;view.run.floor=1
 assert(Run.startCombat(view.run,'cultist_solo'))
 view.run.combat=require('abyss_combat').new(view.run.data,{enemies={'spike_slime_l','lagavulin'},deck={'strike','strike','strike','defend','defend','strike','defend','strike','defend','strike'},seed=1258})
 -- Authored lab formation, using the production source-coordinate transform.
 view.run.combat.enemies[1].sourcePosition={x=-420,y=0}
 view.run.combat.enemies[2].sourcePosition={x=100,y=0}
 view:refresh()
 print('MONSTER_FIT battle ready')
end
local monsterFitStart=OnStart
function OnStart()
 monsterFitStart()
 if script:GetParam('monsterFitDemo')~=false then MonsterFitBattle()end
end
