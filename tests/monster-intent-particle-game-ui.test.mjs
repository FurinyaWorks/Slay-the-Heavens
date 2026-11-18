import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('actual generated actor outputs original UNKNOWN and STUN effect lifetimes without gameplay updates',()=>{
 const r=runLua('tests/lua/monster_intent_particle_game_ui.lua');assert.equal(r.status,0,r.stdout+r.stderr);
 assert.match(r.stdout,/MONSTER_INTENT_PARTICLE_GAME_UI_PASS/);
});

test('particle publication initializes each native lifetime once and preserves failure/retirement boundaries',()=>{
 const result=runLua('tests/lua/support/intent_particle_publication.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/INTENT_PARTICLE_PUBLICATION_PASS 7/);
});
