import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './helpers/isolated-battle-regression.mjs';

test('coordinate-only monster geometry avoids status derivation while full metrics and Host state remain exact',()=>{
 const result=runIsolatedBattleRegression('tests/lua/enemy_geometry_metrics.lua',{officialAssets:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/ENEMY_GEOMETRY_METRICS_PASS profiles=2 statusChanges=3 geometryVariants=8 powerCounts=1,2,3,1/);
 assert.match(result.stdout,/ENEMY_GEOMETRY_HOST_PASS idleFrames=300 statusQueries=0 runRngEqual=true/);
});
