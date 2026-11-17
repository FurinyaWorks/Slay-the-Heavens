import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {requireLuaTool} from '../scripts/setup-lua-static.mjs';
import {parseDiagnostics} from '../scripts/check-lua-static.mjs';
import {measureSources} from '../scripts/lua-quality-metrics.mjs';

const names=['traveler_portraits','choice_ui','map_ui','deck_ui','treasure_ui','match_event_ui'];
// These existing responsibilities are outside this slice. Each allowance is
// tied to the existing lexical function identity; new helpers have no allowance.
const existing={
 traveler_portraits:{'$/controller#1/self.begin#1':22,'$/M.new#1/paint#1':20,'$/M.new#1/self.syncResult#1':22},
 choice_ui:{'$/candidates#1':28,'$/M.new#1/fresh#1':20},
 map_ui:{'$/chapterFor#1':29,'$/M.new#1':23,'$/M.new#1/paintButton#1':22,'$/M.new#1/self.update#1':22,'$/M.new#1/self.choose#1':29},
 deck_ui:{'$/M.new#1/paintCardDetail#1':22,'$/M.new#1/self.update#1':22},
};

test('UI ownership, rendering and every extracted helper retain absolute CC15',()=>{
 const tool=requireLuaTool();
 const files=names.map(name=>`src/lua/abyss_${name}.lua`);
 const measured=spawnSync(tool.file,[...files,'--formatter','plain','--codes','--ranges','--no-color',
  '--max-cyclomatic-complexity','0','--only','561'],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
 assert([0,1].includes(measured.status),measured.stdout+measured.stderr);assert.equal(measured.stderr,'');
 const sources=Object.fromEntries(files.map(file=>[file,readFileSync(file,'utf8')]));
 const result=measureSources(sources,parseDiagnostics(measured.stdout));
 assert.deepEqual(result.errors,[]);
 const failures=[];
 for(const module of result.modules){
  const name=names.find(name=>module.file.endsWith(`abyss_${name}.lua`));
  for(const fn of module.functions){
   const cap=existing[name]?.[fn.id]??15;
   if(fn.complexity>cap)failures.push(`${name}:${fn.name}:${fn.line} CC${fn.complexity}>${cap}`);
  }
 }
 assert.deepEqual(failures,[]);
});
