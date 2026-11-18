import {runLua} from '../../scripts/test-lua.mjs';
import {assertEnemyMetricsCiCurrent,beforeEnemyMetricsCiSource} from './release-potion-enemy-source.mjs';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './isolated-battle-regression.mjs';

test('coordinate-only monster geometry avoids status derivation while full metrics and Host state remain exact',()=>{
 const result=runIsolatedBattleRegression('tests/lua/support/enemy_geometry_metrics.lua',{officialAssets:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/ENEMY_GEOMETRY_METRICS_PASS profiles=2 statusChanges=3 geometryVariants=8 powerCounts=1,2,3,1/);
 assert.match(result.stdout,/ENEMY_GEOMETRY_HOST_PASS idleFrames=300 statusQueries=0 runRngEqual=true/);
});

test('raw Lua geometry entry prepares its complete official profile without rewriting shared theme',()=>{
 const before=readFileSync('build/lua/abyss_theme.lua');
 const result=runLua('tests/lua/support/enemy_geometry_metrics.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/ENEMY_GEOMETRY_METRICS_PASS profiles=2 statusChanges=3 geometryVariants=8 powerCounts=1,2,3,1/);
 assert.match(result.stdout,/ENEMY_GEOMETRY_HOST_PASS idleFrames=300 statusQueries=0 runRngEqual=true/);
 assert.deepEqual(readFileSync('build/lua/abyss_theme.lua'),before,'raw fixture must own its generated profile');
});

test('a same-named geometry fixture in another workspace retains its ordinary Lua entry',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-geometry-other-'));
 try{
  mkdirSync(join(directory,'tests/lua/support'),{recursive:true});
  writeFileSync(join(directory,'tests/lua/support/enemy_geometry_metrics.lua'),"print('OTHER_GEOMETRY_WORKSPACE_PASS')\n");
  const result=runLua('tests/lua/support/enemy_geometry_metrics.lua',{cwd:directory});
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/OTHER_GEOMETRY_WORKSPACE_PASS/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});

test('enemy geometry continuation authenticates new CI bytes and rejects stale or missing owners',()=>{
 const path='tests/helpers/closeout-source-epoch.mjs';
 const current=readFileSync(path,'utf8');
 const prior=beforeEnemyMetricsCiSource(path,current);
 assert.notEqual(prior,current);
 assert.equal(beforeEnemyMetricsCiSource(path,current+'\n'),current+'\n');
 assert.equal(beforeEnemyMetricsCiSource(path,prior),prior);
 assertEnemyMetricsCiCurrent();
 assert.throws(()=>assertEnemyMetricsCiCurrent((name,encoding)=>
  name===path?prior:readFileSync(name,encoding)),/fresh complete integration source: enemy metrics/);
 assert.throws(()=>assertEnemyMetricsCiCurrent((name,encoding)=>{
  if(name===path)throw Error('missing exact source');
  return readFileSync(name,encoding);
 }),/missing exact source/);
});
