import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeSources} from '../scripts/check-architecture.mjs';
import {architectureSources,discoverSources,dependencyCycles} from '../scripts/lua-quality-metrics.mjs';

test('Actor arithmetic no longer participates in the deferred combat dependency component',()=>{
 const entries=discoverSources();
 const policy=JSON.parse(readFileSync('config/architecture.json','utf8'));
 const {byModule,sourcePaths}=architectureSources(entries);
 const graph=analyzeSources(byModule,policy,undefined,sourcePaths);
 const cycles=dependencyCycles(graph.nodes,graph.edges);
 assert(!cycles.some(c=>c.members.includes('abyss_actor')),
  `Actor still belongs to a ${cycles.find(c=>c.members.includes('abyss_actor'))?.members.length}-module component`);
});

test('cold leaf ownership, public dynamic slots and failures retain their runtime contracts',async()=>{
 const {runLua}=await import('../scripts/test-lua.mjs');
 const result=runLua('tests/lua/core_actor_leaf_contract.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/CORE_ACTOR_LEAF_CONTRACT 4 groups passed/);
});
