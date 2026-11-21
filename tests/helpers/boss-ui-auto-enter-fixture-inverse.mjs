// Historical boss-room consumers keep their original fixture inputs.
import {restoreExactFixtureHunks} from './exact-fixture-hunks.mjs';
import {bossUiFaultFixture} from './boss-ui-fault-fixture-inverse.mjs';
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
