import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics} from '../scripts/check-lua-static.mjs';
import {measureSources} from '../scripts/lua-quality-metrics.mjs';

test('explicit card-generation and hand-choice owners and new helpers retain CC15',()=>{
 const files=['build_actions','hand_choice','silent'].map(name=>`src/lua/abyss_${name}.lua`);
 const result=spawnSync(requireLuaTool().file,[...files,'--formatter','plain','--codes','--ranges','--no-color',
  '--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
 assert([0,1].includes(result.status),result.stdout+result.stderr);
 const metrics=measureSources(Object.fromEntries(files.map(file=>[file,readFileSync(file,'utf8')])),parseDiagnostics(result.stdout));
 assert.deepEqual(metrics.errors,[]);
 const roots=['M.makeCard','M.begin','M.choose','M.generateShivs'];
 const selected=metrics.modules.flatMap(module=>module.functions.filter(fn=>roots.includes(fn.name)
  ||/^(buildCard|handChoice|silentGeneration)/.test(fn.name)).map(fn=>({...fn,file:module.file})));
 for(const name of roots)assert(selected.some(fn=>fn.name===name),`missing owner ${name}`);
 assert.deepEqual(selected.filter(fn=>fn.complexity>15).map(fn=>`${fn.file}:${fn.name}: CC${fn.complexity}`),[]);
});
