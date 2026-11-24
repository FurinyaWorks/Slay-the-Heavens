import assert from 'node:assert/strict';
import test from 'node:test';
import {assertClientScriptText} from '../scripts/check-release-text.mjs';

test('the production script gate blocks retired names in sources, module names and serialized filenames', () => {
  for (const text of ['Drug Dealer', 'drug_dealer', 'Addict', 'addict',
    'CultistMask', 'cultist_mask', 'CultistPotion', 'cultist_potion', 'chooseAddict']) {
    const name = text.replaceAll(' ', '_');
    for (const script of [
      {name: 'clean', source: `-- ${text}\nreturn true`},
      {name: 'clean', source: `return "${text}"`},
      {name: `abyss_${name}_entry`, source: 'return true'},
      {name: 'clean', file: `client/abyss_${name}_entry.lua`, source: 'return true'},
    ]) {
      assert.throws(() => assertClientScriptText([script], 'candidate.gil'), /retired client identity/);
    }
  }
  assert.throws(() => assertClientScriptText([
    {name: 'clean', source: String.raw`return "Cultist\x50otion"`},
  ], 'candidate.gil'), /retired client identity: "CultistPotion" \(decoded Lua literal\)/);
});

test('replacement names and ordinary combat language pass the production script gate', () => {
  const scripts = [{
    name: 'abyss_augmenter_event',
    file: 'client/abyss_augmenter_event.lua',
    source: '-- 自爆 自毁 死亡 攻击 伤害 addiction\nreturn {"TravelingMerchant", "RavenMask", "RavenPotion", "traveling_merchant", "raven_mask", "raven_potion"}',
  }];
  assert.deepEqual(assertClientScriptText(scripts, 'candidate.gil'), {files: 1});
});

test('remaining retired client identities fail in names, comments and decoded Lua', () => {
  for (const identity of ['enemy_suicide', 'reptomancerSuicide', 'GamblersBrew', 'Calculated Gamble',
    'rareGamblingChip', 'bet_for', 'settleBet', 'Blue Slaver', 'slavers_collar', 'cultist_solo',
    'shed_blood', 'SteroidPotion', 'MutagenicStrength', 'sacrificeDagger']) {
    assert.throws(() => assertClientScriptText([{name:'probe',source:`-- ${identity}\nreturn true`}], 'candidate.gil'),
      /retired client identity/);
  }
  assert.throws(() => assertClientScriptText([{name:'abyss_red_slaver_ai',source:'return true'}], 'candidate.gil'),
    /retired client identity/);
  assert.throws(() => assertClientScriptText([{name:'probe',source:String.raw`return "Gambling\x20Chip"`}], 'candidate.gil'),
    /retired client identity/);
});
