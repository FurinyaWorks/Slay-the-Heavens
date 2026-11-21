// Historical witnesses only. The current Boss UI still executes the complete
// explicit missing-definition adversary against production modules.
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
export const bossUiFaultFixture=Object.freeze({
 path:'tests/lua/game_ui_boss_treasure.lua',
 beforeSha256:'b551bca139eb44e7a84b96a3d12be598dab9dc28592b903a9438623577b78073',
 afterSha256:'973b7bb108d5cb7c0f06823efc321852c1856f6b99e7211ea69ddf4cb2a5d2e2',
 hunks:[{at:136,
  before:[
   "test('real seed1 source offer keeps unavailable identities visible and rejects every claim atomically',function()",
   '    local ui,root=enterTreasure(nil,nil,true)',
  ].join('\n'),
  after:[
   "test('real seed1 source offer keeps injected missing definitions visible and rejects every claim atomically',function()",
   '    local ui,root=enterTreasure(nil,function(run)',
   '        -- Fault input only: these effects are now implemented. Preserve the',
   '        -- complete source catalog/RNG while retaining the refusal regression.',
   "        local missing={['Snecko Eye']=true,['Calling Bell']=true,['Cursed Key']=true}",
   '        run.data=F.Combat.copy(run.data);local removed=0',
   '        for i=#run.data.relics.relics,1,-1 do',
   '            if missing[run.data.relics.relics[i].sourceId]then table.remove(run.data.relics.relics,i);removed=removed+1 end',
   '        end',
   "        assert(removed==3,'missing-definition adversary must start from all three implemented effects')",
   '    end,true)',
  ].join('\n'),
 }],
});
const bossUiAutoEnterFixture=Object.freeze({
 path:bossUiFaultFixture.path,
 beforeSha256:bossUiFaultFixture.afterSha256,
 afterSha256:'a17c2dae4af374e4bdcf4b797e899453f3b94e748f7033aa74815143cc101ade',
 hunks:[
  {at:29,before:"    assert(Run.claimCardReward(ui.run,0)); dofile('tests/lua/support/finish_combat_rewards.lua')(ui.run); ui:refresh()\n    assert(ui.mode==\"map\" and ui.run.nodeFlow.result==\"boss_victory\")",
   after:"    assert(Run.claimCardReward(ui.run,0)); dofile('tests/lua/support/finish_combat_rewards.lua')(ui.run)"},
  {at:34,before:"    assert(ui.mapUI:choose(F.Nodes.available(ui.run,ui.map)[1].id))",
   after:"    ui:refresh()"},
  {at:46,before:"    assert(ui.mode==\"map\" and not ui:settle() and calls==0)\n    assert(ui.mapUI:choose(F.Nodes.available(ui.run,ui.map)[1].id))\n    assert(ui.mode==\"node\" and not ui:settle())",
   after:"    assert(ui.mode==\"node\" and ui.map.floor==17 and not ui:settle() and calls==0)"},
 ],
});
const definedBossAutoEnterFixture=Object.freeze({
 path:'tests/lua/relic_defined_boss_descriptions.lua',
 beforeSha256:'34a01fa5c5a6483db21df54d0f9f35a0d790c6cb3ff3617b83dc657a0794064b',
 afterSha256:'7beb44be69350ab9ce02b2a83caee31d5f7ae8fbbbd24ce8ad4cebbe0998a79b',
 hunks:[{at:9,
  before:'assert(h.mapUI:choose(F.Nodes.available(h.run,h.map)[1].id))',
  after:"assert(h.mode=='node' and h.run.nodeFlow.roomKind=='boss_treasure' and h.map.floor==17)",
 }],
});
export function preBossUiAutoEnterFixtureSource(path,source){
 return restoreExactFixtureHunks(bossUiAutoEnterFixture,path,restoreExactFixtureHunks(definedBossAutoEnterFixture,path,source));
}
export function preBossUiFaultFixtureSource(path,source){
 return restoreExactFixtureHunks(bossUiFaultFixture,path,preBossUiAutoEnterFixtureSource(path,source));
}
