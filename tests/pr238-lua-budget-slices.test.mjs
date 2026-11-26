import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {preSmallSlimesReferenceFixtureSource} from './helpers/small-slimes-reference-fixture-inverse.mjs';
import {restoreExactFixtureHunks} from './helpers/exact-fixture-hunks.mjs';
import {exactSourceMatches} from './helpers/source-fingerprint.mjs';

// #951 renamed the encounter in three calls in the live potion fixture.
const potionEncounterNames={
 "path": "tests/lua/potion_flex_speed.lua",
 "beforeSha256": "bf70b21aa13891ccdd4378f864fbcc4cad4eddd64377a7572e0b6fdf8c8c1109",
 "afterSha256": "dec6f811f85c2b56297219c5c25a1fa9454a27d9bf6857f6a469ab1983c1cdf5",
 "hunks": [
  {
   "at": 23,
   "before": " assert(Run.startCombat(run,'cultist_solo'));return run",
   "after": " assert(Run.startCombat(run,'raven_adept_solo'));return run"
  },
  {
   "at": 108,
   "before": "  local run=C.copy(prepared);assert(Run.obtainPotion(run,v[1]));assert(Run.startCombat(run,'cultist_solo'))",
   "after": "  local run=C.copy(prepared);assert(Run.obtainPotion(run,v[1]));assert(Run.startCombat(run,'raven_adept_solo'))"
  },
  {
   "at": 122,
   "before": " local run=Run.new(source,42);assert(Run.obtainPotion(run,'flex_potion'));assert(Run.startCombat(run,'cultist_solo'));local s=run.combat",
   "after": " local run=Run.new(source,42);assert(Run.obtainPotion(run,'flex_potion'));assert(Run.startCombat(run,'raven_adept_solo'));local s=run.combat"
  }
 ]
};
const potionCurrent={sha256:potionEncounterNames.afterSha256,gitBlob:'ddfdae63601a510a6357f75679178be17cf3a33f'};
const potionPrevious={sha256:potionEncounterNames.beforeSha256,gitBlob:'51c903e2a99feed410fe2ac8e9b507716d93dac7'};

function beforePotionEncounterNames(path,source){
 if(path!==potionEncounterNames.path||!exactSourceMatches(source,potionCurrent))return source;
 const lf=source.replaceAll('\r\n','\n');
 if(source!==lf&&source!==lf.replaceAll('\n','\r\n'))return source;
 const prior=restoreExactFixtureHunks(potionEncounterNames,path,source);
 assert(exactSourceMatches(prior,potionPrevious),'exact pre-#951 Flex and Speed fixture');
 return prior;
}

const read = file => {
  const source=beforePotionEncounterNames(file,readFileSync(file,'utf8'));
  return preSmallSlimesReferenceFixtureSource(file,source).replaceAll('\r\n','\n');
};
const hash = text => createHash('sha256').update(text).digest('hex');
const budget = JSON.parse(read('tests/fixtures/pr238-lua-budget.json'));

test('PR238 bounded fixtures retain every original input and assertion with exact once coverage', () => {
  assert.equal(budget.base, '28869011c26bcead7f925e78f00dbda454daa231');
  assert.equal(budget.timeoutMilliseconds, 30000);
  assert.deepEqual(budget.fixtures.map(f => [f.entry, f.total]), [
    ['tests/lua/node_transactions.lua', 11], ['tests/lua/spike_slime_l.lua', 17],
    ['tests/lua/small_slimes.lua', 18], ['tests/lua/potion_flex_speed.lua', 11],
  ]);
  for (const fixture of budget.fixtures) {
    let original = read(fixture.entry);
    // Invert only the declared registration/range harness edits. The hash then
    // locks the entire original file, including helpers, seeds and assertions.
    for (const edit of [...fixture.edits].reverse()) {
      assert.equal(original.split(edit.after).length, 2, fixture.entry + ': unique harness edit');
      original = original.replace(edit.after, edit.before);
    }
    assert.equal(hash(original), fixture.originalSha256LF, fixture.entry + ': frozen full source');
    if (!fixture.reviewedMigration) assert.equal(fixture.originalSha256LF, fixture.baseSha256LF);
    const seen = [], histories = [];
    for (const [index, slice] of fixture.slices.entries()) {
      assert(slice.first >= 1 && slice.last <= fixture.total && slice.first <= slice.last);
      if (index === 0) {
        assert.equal('tests/lua/' + slice.file, fixture.entry);
        assert(read(fixture.entry).includes(`first,last=first or ${slice.first},last or ${slice.last}`));
      } else {
        assert.equal(read('tests/lua/' + slice.file),
          `assert(loadfile('${fixture.entry}'))(${[slice.first, slice.last, ...(slice.historyRange ?? [])].join(',')})\n`);
      }
      if (slice.historyRange) {
        assert.equal(fixture.entry, 'tests/lua/spike_slime_l.lua');
        assert.equal(slice.first, 6); assert.equal(slice.last, 6);
        const [first, last] = slice.historyRange;
        assert(first >= 1 && first <= last && last <= 6);
        for (let i = first; i <= last; i++) histories.push(i);
        if (first === 1) seen.push(6);
      } else for (let i = slice.first; i <= slice.last; i++) seen.push(i);
    }
    assert.deepEqual(seen, Array.from({ length: fixture.total }, (_, i) => i + 1));
    assert.deepEqual(histories, fixture.entry.endsWith('/spike_slime_l.lua') ? [1, 2, 3, 4, 5, 6] : []);
  }
});
