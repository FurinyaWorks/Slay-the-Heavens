import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {frozenRelicLifecycleSources,frozenPurgeA27Sources,readFrozenPurgeA27Source,relicLifecycleGroups,runRelicLifecycle,lifecycleHash} from './helpers/relic-lifecycle-baseline.mjs';
import {lifecycleGeneratedIdentities,relicLifecycleReplayInput,verifyFrozenLifecycle,verifyLifecycleTrace} from './helpers/relic-lifecycle-reference.mjs';
import {frozenRelicQuerySources} from './helpers/relic-query-baseline.mjs';
import {frozenPurgeQuerySources} from './helpers/purge-query-baseline.mjs';

const reference=JSON.parse(readFileSync(new URL('./fixtures/relic-lifecycle-reference.json',import.meta.url),'utf8'));
const generated=lifecycleGeneratedIdentities(),replayInput=relicLifecycleReplayInput(generated);
const matchingReference=reference.replayInput===replayInput;
const observations=new Map();
const frozen391=frozenRelicLifecycleSources().files,frozenA27=frozenPurgeA27Sources().files;

test('the frozen reference binds every group, generated inputs and executable witnesses',()=>{
 assert.equal(reference.schemaVersion,1);
 assert.match(reference.replayInput,/^[0-9a-f]{64}$/);
 assert.deepEqual(Object.keys(reference.groups),relicLifecycleGroups);
 for(const signature of Object.values(reference.groups))assert.match(signature,/^[0-9a-f]{64}$/);
 const changed={...generated,abyss_data:{...generated.abyss_data,sha256:lifecycleHash('changed generated data')}};
 assert.notEqual(relicLifecycleReplayInput(changed),replayInput,'changed generated inputs require fresh replay');
 for(const target of ['package-lock.json','tests/helpers/lua-graph-observer.mjs','tests/lua/rare_relics_hooks.lua']){
  const read=path=>readFileSync(path,'utf8')+(path===target?'\n':'');
  assert.notEqual(relicLifecycleReplayInput(generated,read),replayInput,'changed replay input requires fresh replay: '+target);
 }
});
test('relic lifecycle pins all 329 historical handwritten Lua sources with LF SHA256 and Git blob identities',()=>{
 assert.equal(Object.keys(frozen391).length,329);
 for(const name of ['abyss_actor','abyss_combat','abyss_run','abyss_relic_hooks','abyss_writhing_mass'])assert(frozen391[name]);
});
test('complete independent epochs retain original six/two-source query witnesses byte for byte',()=>{
 assert.equal(Object.keys(frozenA27).length,330);
 for(const [name,file] of Object.entries(frozenRelicQuerySources().files))assert.equal(frozen391[name].source,file.source,'original six-source 391 witness');
 for(const [name,file] of Object.entries(frozenPurgeQuerySources().files))assert.equal(frozenA27[name].source,file.source,'original two-source a27 witness');
 assert.throws(()=>readFrozenPurgeA27Source('src/lua/nonexistent.lua'),/registered complete/);
});
test('frozen VMs reject live new-source preloads and allow only each complete epoch plus exact generated inputs',()=>{
 for(const a27 of [false,true]){
  const result=runRelicLifecycle('hp',{frozen:true,trace:false,isolation:true,a27});
  assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/RELIC_FROZEN_ISOLATION_PASS 0/);
  for(const [name,origin]of Object.entries(result.manifest.loadedOrigins)){
   const files=a27?frozenA27:frozen391;
   assert(origin==='handwritten'&&Object.hasOwn(files,name)||origin==='generated'&&Object.hasOwn(result.manifest.generatedBindings,name));
  }
 }
});
test('bounded dispatch preserves every original fatal/turn/attack fixture byte and fixed source hash',()=>{
 const contract=JSON.parse(readFileSync('tests/helpers/relic-lifecycle-baseline-fixture-contract.json','utf8'));
 assert.equal(contract.schemaVersion,1);assert.equal(contract.normalization,'LF');
 const source=readFileSync('tests/helpers/relic-lifecycle-baseline-fixtures.lua','utf8').replaceAll('\r\n','\n');
 const entries=[...source.matchAll(/(\w+)=\{path='([^']+)',sha256='([a-f0-9]+)',source=\[====\[([\s\S]*?)\]====\]\},/g)];
 assert.deepEqual(entries.map(m=>m[1]),['fatal','turns','attacks','uncommon','shop','parasite']);
 for(const [,key,path,sha,body]of entries){
  const original=readFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(path,contract.fixtures[key].path);assert.equal(sha,contract.fixtures[key].sha256);
  assert.equal(lifecycleHash(original),sha,'complete fixed original fixture hash');assert.equal(body,original,'all original assertions remain unchanged');
 }
});
for(const group of relicLifecycleGroups)test(`relic lifecycle ${group} current complete graph matches the frozen source`,()=>{
 const after=runRelicLifecycle(group),actual=verifyLifecycleTrace(after,group);
 assert.equal(after.manifest.preloadedSources,0,'current VM reads real current source files');
 assert.deepEqual(after.manifest.generatedBindings,generated,'identical generated source input hashes');
 observations.set(group,after.manifest);
 const expected=reference.groups[group];
 if(matchingReference&&actual===expected&&process.env.RELIC_LIFECYCLE_REPLAY!=='1')return;

 // A changed input or result replays the original VM for a direct comparison.
 const before=runRelicLifecycle(group,{frozen:true}),frozen=verifyLifecycleTrace(before,group);
 verifyFrozenLifecycle(before,generated);
 if(matchingReference)assert.equal(frozen,expected,'pinned frozen replay signature: '+group);
 assert.equal(actual,frozen,`${group}: lifecycle trace, cases, coverage or output differs; inspect ${before.directory} and ${after.directory}`);
 assert(after.graph===before.graph,`${group}: complete graph differs; inspect ${before.directory} and ${after.directory}`);
});
test('bounded fatal and hook case partitions have complete unions and no duplicate execution',()=>{
 const read=group=>observations.get(group);
 const fatal=['fatal_native','fatal_shared','fatal_orb','fatal_guardian'].map(read);
 for(const row of fatal)assert.deepEqual(row.registeredCases,fatal[0].registeredCases,'entire original registration inventory');
 const executed=fatal.flatMap(row=>row.executedCases);
 assert.equal(new Set(executed).size,executed.length,'each original fatal case executes exactly once');
 assert.deepEqual([...executed].sort(),[...fatal[0].registeredCases].sort(),'all original fatal assertions covered');
 for(const [group,count]of [['hooks_turns',5],['hooks_attacks',6],['hooks_opening',2]]){
  const row=read(group);assert.equal(row.executedCases.length,count);assert.deepEqual(row.executedCases,row.registeredCases);
 }
 for(const groups of [Array.from({length:11},(_,i)=>`uncommon_${String(i+1).padStart(2,'0')}`),['shop_early','shop_late'],Array.from({length:9},(_,i)=>`parasite_${String(i+1).padStart(2,'0')}`)]){
  const rows=groups.map(read),all=rows.flatMap(row=>row.executedCases);
  for(const row of rows)assert.deepEqual(row.registeredCases,rows[0].registeredCases,'entire original case inventory retained');
  assert.equal(new Set(all).size,all.length,'no duplicated original cases');
  assert.deepEqual([...all].sort(),[...rows[0].registeredCases].sort(),'complete original assertion union');
 }
});
test('real lifecycle witnesses exercise all 14 Combat Hooks and every moved family/common method',()=>{
 const expected={
  hooks:'enqueuePostDraw upgradeRandomHand onVictory bindBattle preBattle hpChanged wasHpLost atTurnStart prepareTurnStart onUseCard afterCard battleStart endTurnBlock onPlayerEndTurn',
  boss:'atTurnStart onPlayCard wasHpLost preBattle onSpawnMonster battleStart',
  uncommon:'onVictory atTurnStart onShuffle onUseCard onMonsterDeath wasHpLost strikeBonus vulnerablePercent canPlayCurse',
  rare:'bindBattle battleStart atTurnStart postDraw onPlayCard onUseCard onPlayerEndTurn disableTop onRefreshHand blockPower onVulnerableApplied onAttacked blockAtTurnStart rechargeEnergy modifyHealing randomCardId onExhaust chooseGambling applyEffect onVictory',
  shop:'battleStartActions turnStartActions onBlockBroken onShuffle medicalCard exhaustAfterUse onUseCard execute beginToolbox chooseToolbox',
  common:'gainGold beforeObtainCard onPreviewObtainCard previewCardReward onObtainCard',
 };
 const coverage={};for(const group of relicLifecycleGroups){
  const row=observations.get(group);
  for(const [name,n]of Object.entries(row.coverage))coverage[name]=(coverage[name]??0)+n;
 }
 for(const [scope,names]of Object.entries(expected))for(const name of names.split(' '))
  assert(coverage[`${scope==='common'?'hooks':scope}.${name}`]>0,`missing real ${scope}.${name} invocation`);
 const dynamic=observations.get('dynamic');
 assert.equal(dynamic.executedCases.length,114,'all original function fields replace, call, nil and restore');
});
