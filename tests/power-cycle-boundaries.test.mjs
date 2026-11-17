import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyzeSources} from '../scripts/check-architecture.mjs';
import {discoverSources,dependencyCycles} from '../scripts/lua-quality-metrics.mjs';
import {runLua} from '../scripts/test-lua.mjs';

test('Power display membership and schedule have no immediate or deferred dependency cycle',()=>{
 const sources=Object.fromEntries(Object.entries(discoverSources()).map(([path,value])=>[path.slice(8,-4),value]));
 const policy=JSON.parse(readFileSync('config/architecture.json','utf8'));
 // The integration owner adds this new module to the shared architecture policy.
 policy.layers.abyss_power_membership='core';
 const graph=analyzeSources(sources,policy);
 const roots=new Set(['abyss_power_order','abyss_power_schedule','abyss_power_membership']);
 assert.deepEqual(dependencyCycles(graph.nodes,graph.edges).filter(c=>c.members.some(name=>roots.has(name))),[]);
});

test('schedule removal preserves shared public slots, copy-on-write and errors in either cold load order',()=>{
 const result=runLua('tests/lua/power_cycle_boundaries.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/POWER_CYCLE_BOUNDARIES 2 cold orders passed/);
});
