import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './helpers/isolated-battle-regression.mjs';

test('coordinate-only monster geometry avoids status derivation while full metrics and Host state remain exact',()=>{
 const result=runIsolatedBattleRegression('tests/lua/enemy_geometry_metrics.lua',{officialAssets:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/ENEMY_GEOMETRY_METRICS_PASS profiles=2 statusChanges=3 geometryVariants=8 powerCounts=1,2,3,1/);
 assert.match(result.stdout,/ENEMY_GEOMETRY_HOST_PASS idleFrames=300 statusQueries=0 runRngEqual=true/);
});

test('raw Lua geometry entry prepares its complete official profile without rewriting shared theme',()=>{
 const before=readFileSync('build/lua/abyss_theme.lua');
 const result=runLua('tests/lua/enemy_geometry_metrics.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/ENEMY_GEOMETRY_METRICS_PASS profiles=2 statusChanges=3 geometryVariants=8 powerCounts=1,2,3,1/);
 assert.match(result.stdout,/ENEMY_GEOMETRY_HOST_PASS idleFrames=300 statusQueries=0 runRngEqual=true/);
 assert.deepEqual(readFileSync('build/lua/abyss_theme.lua'),before,'raw fixture must own its generated profile');
});

test('a same-named geometry fixture in another workspace retains its ordinary Lua entry',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-geometry-other-'));
 try{
  mkdirSync(join(directory,'tests/lua'),{recursive:true});
  writeFileSync(join(directory,'tests/lua/enemy_geometry_metrics.lua'),"print('OTHER_GEOMETRY_WORKSPACE_PASS')\n");
  const result=runLua('tests/lua/enemy_geometry_metrics.lua',{cwd:directory});
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/OTHER_GEOMETRY_WORKSPACE_PASS/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});
