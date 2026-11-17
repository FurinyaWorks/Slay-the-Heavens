import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics} from '../scripts/check-lua-static.mjs';
import {measureSources} from '../scripts/lua-quality-metrics.mjs';
// Existing unrelated responsibilities remain visible; no new helper inherits
// their debt. These limits are the measured c2409ad7 values, not exclusions.
const retained={
  map:{configuration:24,'M.generate':17,'M.available':16,'M.restore':28},
  ending_history:{identity:17},treasure_source:{item:19},wheel_event:{},winding_event:{},
  act2_events:{'M.options':19,chooseAddict:22,chooseMausoleum:19},act3_events:{'M.prepare':17},
};
for(const [name,legacy]of Object.entries(retained))test(`architecture admission ${name}: governed entries and every new helper CC15`,()=>{
 const file=`src/lua/abyss_${name}.lua`,source=readFileSync(file,'utf8');
 const result=spawnSync(requireLuaTool().file,[file,'--formatter','plain','--codes','--ranges','--no-color','--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:10000});
 assert.ifError(result.error);assert([0,1].includes(result.status),result.stdout+result.stderr);assert.equal(result.stderr,'');
 const measured=measureSources({[file]:source},parseDiagnostics(result.stdout));assert.deepEqual(measured.errors,[]);
 for(const fn of measured.modules[0].functions){const limit=legacy[fn.name]??15;assert(fn.complexity<=limit,`${fn.name}: CC${fn.complexity} exceeds ${limit}`);}
});
