import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('particle publication initializes each native lifetime once and preserves failure/retirement boundaries',()=>{
 const r=runLua('tests/lua/intent_particle_publication.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/INTENT_PARTICLE_PUBLICATION_PASS 7/);
});
