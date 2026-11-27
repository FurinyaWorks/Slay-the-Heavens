import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const read = path => readFileSync(path, 'utf8').replaceAll('\r\n', '\n');
test('Boss chest parts preserve the complete reviewed migration and execute each of eight groups once', () => {
  const contract = JSON.parse(read('tests/fixtures/sts1-boss-treasure-budget.json'));
  assert.equal(contract.base, '2425ad622eed31ad6a965b90086a6838a1db96f4');
  assert.equal(contract.timeoutMilliseconds, 30000);
  let source = read(contract.entry);
  for (const edit of [...contract.edits].reverse()) {
    assert.equal(source.split(edit.after).length, 2, 'every partition edit is unique');
    source = source.replace(edit.after, edit.before);
  }
  // #951 renamed this relic in the live fixture. Only the sealed pre-partition view uses the old IDs.
  const rename = [
    ["    Source.stageQueue(run,{'Black Blood','ArenaCollar'},{'Sozu'})", 'ArenaCollar', 'SlaversCollar'],
    ["    equal(#run.nodeFlow.reward.relics,3);equal(run.nodeFlow.reward.relics[1],'arena_collar')", 'arena_collar', 'slavers_collar'],
    ["    assert(Nodes.claimBossTreasure(run,1));same(run.relics,{'sozu','arena_collar'})", 'arena_collar', 'slavers_collar'],
    ["    local run,map=beforeChest();run.relics={'black_blood','sozu','arena_collar'}", 'arena_collar', 'slavers_collar'],
    ["                        assert(offer.id~='black_blood' and offer.id~='sozu' and offer.id~='arena_collar')", 'arena_collar', 'slavers_collar'],
  ];
  for (const [live, from, to] of rename) {
    assert.equal(source.split('\n').filter(line => line === live).length, 1, 'every current relic binding is unique');
    source = source.split('\n').map(line => line === live ? line.replace(from, to) : line).join('\n');
  }
  assert.equal(createHash('sha256').update(source).digest('hex'), contract.migratedSourceSha256LF);
  assert.equal((source.match(/^test\(/gm) || []).length, 8);
  assert.deepEqual(contract.parts.map(part => part.part), [1, 2]);
  assert.deepEqual(contract.parts.flatMap(part => part.groups), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(contract.parts[0].file, 'boss_treasure.lua');
  assert.equal(read(`tests/lua/${contract.parts[1].file}`), `assert(loadfile('${contract.entry}'))(2)\n`);
});
