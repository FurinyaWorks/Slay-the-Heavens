import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './helpers/isolated-battle-regression.mjs';
for(const [fixture,marker] of [
 ['hand_layout_values','HAND_LAYOUT_VALUES_PASS variants=243'],
 ['hand_layout_host','HAND_LAYOUT_HOST_PASS idle=300 temporaryTuples=0 originSnapshots=1500 hover=20 drag=12 resize=2 runRngEqual=true'],
])test(`allocation-free hand geometry: ${fixture}`,()=>{
 const result=runIsolatedBattleRegression(`tests/lua/${fixture}.lua`,{officialAssets:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.ok(result.stdout.includes(marker),result.stdout);
});
