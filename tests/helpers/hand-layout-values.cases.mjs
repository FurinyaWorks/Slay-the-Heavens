import test from 'node:test';
import assert from 'node:assert/strict';
import {runIsolatedBattleRegression} from './isolated-battle-regression.mjs';
for(const [fixture,marker] of [
 ['hand_layout_values','HAND_LAYOUT_VALUES_PASS variants=243'],
 ['hand_layout_host','HAND_LAYOUT_HOST_PASS idle=300 temporaryTuples=0 originSnapshots=1500 hover=20 drag=12 resize=2 runRngEqual=true'],
])test(`allocation-free hand geometry: ${fixture}`,()=>{
 const result=runIsolatedBattleRegression(`tests/lua/support/${fixture}.lua`,{officialAssets:true});
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.ok(result.stdout.includes(marker),result.stdout);
});

import {readFileSync} from 'node:fs';
import {assertHandLayoutCiCurrent, beforeHandLayoutCiSource} from './release-potion-enemy-source.mjs';

test('hand layout CI continuation binds current inputs and preserves the prior source', () => {
 const path='tests/helpers/closeout-source-epoch.mjs';
 const current=readFileSync(path,'utf8');
 const prior=beforeHandLayoutCiSource(path,current);
 assert.notEqual(prior,current);
 assert.equal(beforeHandLayoutCiSource(path,current+'\n'),current+'\n');
 assert.equal(beforeHandLayoutCiSource(path,prior),prior);
 assertHandLayoutCiCurrent();
 assert.throws(()=>assertHandLayoutCiCurrent((name,encoding)=>
  name===path?prior:readFileSync(name,encoding)),/fresh complete integration source: hand-layout/);
 assert.throws(()=>assertHandLayoutCiCurrent((name,encoding)=>{
  if(name===path)throw Error('missing exact source');
  return readFileSync(name,encoding);
 }),/missing exact source/);
});
