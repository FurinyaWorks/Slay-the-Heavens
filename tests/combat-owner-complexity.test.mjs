import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics} from '../scripts/check-lua-static.mjs';
import {measureSources} from '../scripts/lua-quality-metrics.mjs';

test('queued play, player turn and enemy action owners and their helpers stay within CC15',()=>{
 const file='src/lua/abyss_combat.lua';
 const result=spawnSync(requireLuaTool().file,[file,'--formatter','plain','--codes','--ranges','--no-color',
  '--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
 assert([0,1].includes(result.status),result.stdout+result.stderr);
 const metrics=measureSources({[file]:readFileSync(file,'utf8')},parseDiagnostics(result.stdout));
 assert.deepEqual(metrics.errors,[]);
 const roots=['M.resolveQueuedCard','M.startPlayerTurn','M.resolveEnemyAction','queueEnemyTurn'];
 const functions=metrics.modules[0].functions;
 for(const name of roots)assert(functions.some(fn=>fn.name===name),`missing owner ${name}`);
 const selected=functions.filter(fn=>roots.includes(fn.name)||/^(queuedCard|playerTurn|enemyAction|enemyTurn)/.test(fn.name));
 assert.deepEqual(selected.filter(fn=>fn.complexity>15).map(fn=>`${fn.name}: CC${fn.complexity}`),[]);
});
