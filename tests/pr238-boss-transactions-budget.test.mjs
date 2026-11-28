import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
test('Boss transaction parts preserve all claims, refusal inputs, three seeds per tier and completed/unfinished cases',()=>{
 const f=JSON.parse(read('tests/fixtures/pr238-boss-transactions-budget.json'));assert.equal(f.timeoutMilliseconds,30000);assert.equal(f.base,'7593e8272b363f06d3cdaa62f29967756b3c1102');let s=read(f.entry);
 for(const e of [...f.edits].reverse()){assert.equal(s.split(e.after).length,2);s=s.replace(e.after,e.before);}
 // #951 renamed this encounter and its comment; the Lua suite still runs the current values.
 const renames=[
  ['-- original-RNG parity claim; Raven Adept now also consumes its required opening roll.',
   '-- original-RNG parity claim; Cultist now also consumes its required opening roll.'],
  ["        assert(Run.startCombat(run, 'raven_adept_solo'))",
   "        assert(Run.startCombat(run, 'cultist_solo'))"],
 ];
 for(const [current,prior] of renames){
  assert.equal(s.split('\n').filter(line=>line===current).length,1,'exact current boss transaction encounter line');
  s=s.split('\n').map(line=>line===current?prior:line).join('\n');
 }
 assert.equal(createHash('sha256').update(s).digest('hex'),f.originalSha256LF);
 assert.deepEqual(f.parts.map(p=>p.part),[1,2,3,4,5,6,7]);for(const p of f.parts.slice(1))assert.equal(read('tests/lua/'+p.file),`assert(loadfile('${f.entry}'))(${p.part})\n`);
});
