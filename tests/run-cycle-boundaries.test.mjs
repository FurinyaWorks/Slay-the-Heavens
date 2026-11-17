import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {luaString} from '../scripts/build-lua-data.mjs';
import {checkArchitecture} from '../scripts/check-architecture.mjs';
import {dependencyCycles,measureSources} from '../scripts/lua-quality-metrics.mjs';
import {parseDiagnostics} from '../scripts/check-lua-static.mjs';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {runLua} from '../scripts/test-lua.mjs';

test('relic commands depend on explicit Run owners without complete-graph return edges',()=>{
 const report=checkArchitecture();
 const consumers=new Set(['abyss_boss_relics','abyss_relic_card_rewards','abyss_relic_choices','abyss_relic_pending','abyss_uncommon_relics']);
 assert.deepEqual(report.edges.filter(e=>consumers.has(e.from)&&e.to==='abyss_run'),[]);
 assert.deepEqual(report.edges.filter(e=>e.from==='abyss_boss_relics'&&e.to==='abyss_relic_hooks'),[]);
 assert.deepEqual(report.edges.filter(e=>e.from==='abyss_shop_relics'&&e.to==='abyss_relic_choices'),[]);
 const cycles=dependencyCycles(report.nodes,report.edges);
 assert(!cycles.some(c=>c.members.includes('abyss_run')),'Run reward, equipment and pending owners are acyclic including deferred imports');
});

test('cold relic consumers use only explicit owners and preserve actual Run late-failure rollback',()=>{
 const result=runLua('tests/lua/run_cycle_host.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/RUN_CYCLE_HOST_PASS cold-load,explicit-owner,dynamic-slot,nested-transaction,late-rollback/);
});

test('changing a real owner exception identity is rejected by the host boundary probe',()=>{
 const file='src/lua/abyss_relic_choices.lua',source=readFileSync(file,'utf8');
 const before='return Run.obtainCardCopy(run,uid)';
 assert.equal(source.split(before).length-1,1);
 const mutant=source.replace(before,"local ok,a,b=pcall(Run.obtainCardCopy,run,uid);if not ok then error(tostring(a))end;return a,b ");
 const cli=createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js');
 const prelude=`package.path='src/lua/?.lua;build/lua/?.lua;'..package.path;package.preload.abyss_relic_choices=assert(load(${luaString(mutant)},'@${file}'));dofile('tests/lua/run_cycle_host.lua')`;
 const result=spawnSync(process.execPath,[cli,'-e',prelude],{encoding:'utf8',timeout:30000});
 assert.notEqual(result.status,0);assert.match(result.stderr,/\[RUN_CYCLE_HOST\] explicit owner error identity changed/);
});

test('pending reward projections and every extracted helper have complete CC15 measurements',()=>{
 const file='src/lua/abyss_relic_pending.lua',tool=requireLuaTool();
 const result=spawnSync(tool.file,[file,'--formatter','plain','--codes','--ranges','--no-color','--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:10000});
 assert([0,1].includes(result.status),result.stdout+result.stderr);assert.equal(result.stderr,'');
 const measured=measureSources({[file]:readFileSync(file,'utf8')},parseDiagnostics(result.stdout));
 assert.deepEqual(measured.errors,[]);
 for(const fn of measured.modules[0].functions)assert(fn.complexity<=15,`${fn.name} CC${fn.complexity} exceeds 15`);
});
