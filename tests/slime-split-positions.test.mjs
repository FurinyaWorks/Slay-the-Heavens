import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './helpers/isolated-battle-regression.mjs';
test('split children retain parent-relative source positions in real native surfaces',()=>{
 const result=runIsolatedBattleRegression('tests/lua/slime_split_positions.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 for(const family of ['acid','spike'])assert.ok(result.stdout.includes(`SPLIT_NATIVE_POSITIONS ${family} source/native/nonoverlap PASS`));
});
