import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './helpers/isolated-battle-regression.mjs';
test('same-page deck preparation protects its list without full-screen black frames',()=>{
 const result=runIsolatedBattleRegression('tests/lua/modal_loading_frames.lua',{officialAssets:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.ok(result.stdout.includes('MODAL_LOADING_FRAMES_PASS'));
});
