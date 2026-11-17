import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeSources} from '../scripts/check-architecture.mjs';
import {discoverSources} from '../scripts/lua-quality-metrics.mjs';
import {runLua} from '../scripts/test-lua.mjs';

const forbidden={
 abyss_act2_stasis:['abyss_combat'],
 abyss_build_actions:['abyss_combat','abyss_watcher_final_cards'],
 abyss_card_actions:['abyss_defect_final_cards','abyss_silent_final_cards','abyss_watcher_final_cards'],
 abyss_colorless_cards:['abyss_card_actions'],
 abyss_defect_final_cards:['abyss_card_capability','abyss_combat'],
 abyss_discard:['abyss_combat'],
 abyss_hand_choice:['abyss_defect_final_cards'],
 abyss_inventory:['abyss_combat'],
 abyss_original_v4_health:['abyss_relic_combat_hooks'],
 abyss_relic_family_combat:['abyss_build_actions'],
 abyss_silent_potions:['abyss_combat'],
 abyss_silent:['abyss_combat'],
 abyss_watcher_final_cards:['abyss_card_capability'],
 abyss_writhing_mass:['abyss_inventory','abyss_relic_family_combat'],
};
test('card and effect strategies do not import their command owners, including deferred imports',()=>{
 const sources=Object.fromEntries(Object.entries(discoverSources()).map(([path,value])=>[path.slice(8,-4),value]));
 const graph=analyzeSources(sources,JSON.parse(readFileSync('config/architecture.json','utf8')));
 assert.deepEqual(graph.edges.filter(e=>forbidden[e.from]?.includes(e.to)).map(e=>`${e.from}:${e.to}:${e.line}`),[]);
});

test('explicit host commands preserve existing dynamic slots and error identities',()=>{
 const result=runLua('tests/lua/core_other_host_boundaries.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/CORE_OTHER_HOST_BOUNDARIES 4 groups passed/);
});
