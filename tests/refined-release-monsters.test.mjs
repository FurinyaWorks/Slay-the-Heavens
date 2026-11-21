import { createHash } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareRefinedReleaseMonsterArt } from '../scripts/refined-release-monsters.mjs';

const ids = ('acid_slime_s acid_slime_m acid_slime_l spike_slime_s spike_slime_m spike_slime_l red_louse green_louse cultist looter mugger blue_slaver red_slaver taskmaster sneaky_gremlin shield_gremlin wizard_gremlin mad_gremlin fat_gremlin gremlin_nob jaw_worm fungi_beast lagavulin sentry spheric_guardian guardian slime_boss hexaghost centurion mystic chosen book_of_stabbing snake_plant shelled_parasite byrd snecko torch_head collector automaton bronze_orb champ gremlin_leader').split(' ');
const sha = value => createHash('sha256').update(value).digest('hex');
function fixture() {
  return { schemaVersion: 1, canvas: [106, 106], assets: ids.map((enemyId,index) => {
    const slots = [{anchorMax:[.5,.5],anchorMin:[.5,.5],colour:[index,2,3,255],image:100003,
      imageType:'stretch',pivot:[.5,.5],position:[0,0],rotation:[12,0,18],scale:[1,1],size:[15,20]}];
    return {enemyId,slots,provenance:{geometrySha256:sha(JSON.stringify(slots)),sourceSha256:sha(enemyId)}};
  }) };
}

test('exact curated roster compiles to identity bindings and no legacy payload', () => {
  const input = fixture();
  const art = prepareRefinedReleaseMonsterArt(input);
  assert.deepEqual(Object.keys(art.assets).sort(), [...ids].sort());
  assert.deepEqual(Object.keys(art.bindings).sort(), [...ids].sort());
  assert.equal(art.poolCapacity, 1);
  assert.equal(art.asset, undefined);
  assert.equal(art.enabled, true);
  assert.deepEqual(art.canvas, [106,106]);
  assert.equal(art.provenance.orderedAssets.length, 42);
  for(const a of input.assets) {
    assert.equal(art.bindings[a.enemyId],a.enemyId);
    assert.equal(art.assets[a.enemyId].cardId,a.enemyId);
    assert.deepEqual(art.assets[a.enemyId].slots,a.slots);
    assert.equal(art.assets[a.enemyId].geometrySha256,a.provenance.geometrySha256);
  }
  input.assets[0].slots[0].size[0]=999;
  assert.notEqual(art.assets[ids[0]].slots[0].size[0],999);
});

for(const [label,mutate,error] of [
  ['missing enemy',r=>r.assets.pop(),/42/],
  ['duplicate enemy',r=>r.assets[1]=r.assets[0],/duplicate/],
  ['wrong enemy',r=>r.assets[0].enemyId='cultist_alt',/unknown/i],
  ['duplicate asset',r=>{r.assets[1].slots=r.assets[0].slots;r.assets[1].provenance=r.assets[0].provenance;},/duplicate/],
  ['capacity overflow',r=>r.assets[0].slots=Array(116).fill(r.assets[0].slots[0]),/115/],
  ['empty slots',r=>r.assets[0].slots=[],/115/],
  ['geometry changed',r=>r.assets[0].slots[0].size[0]++,/geometry hash mismatch/],
  ['invalid geometry',r=>r.assets[0].slots[0].size[0]=0,/geometry/],
  ['invalid colour',r=>r.assets[0].slots[0].colour[3]=256,/geometry/],
  ['unknown slot field',r=>r.assets[0].slots[0].path=['group000','shape0000'],/slot field/],
  ['unsupported image',r=>r.assets[0].slots[0].image=106057,/image/],
  ['untrusted provenance',r=>r.assets[0].provenance.sourceSha256='bad',/provenance/],
  ['declared approval injection',r=>r.approval=true,/registry/],
  ['wrong shared canvas',r=>r.canvas=[64,144],/registry/],
]) test('refined release rejects '+label,()=>{
  const input=fixture();mutate(input);assert.throws(()=>prepareRefinedReleaseMonsterArt(input),error);
});

test('counts ordered rows for production tiers without padding and keeps geometry hash independent of property order', () => {
  const input=fixture();
  for(const [i,count] of [[0,41],[1,115]]) {
    const entry=input.assets[i], slot=entry.slots[0];
    entry.slots=Array.from({length:count},(_,n)=>({...slot,position:[n/4,-n/4]}));
    entry.provenance.geometrySha256=sha(JSON.stringify(entry.slots));
    entry.slots=entry.slots.map(row=>Object.fromEntries(Object.entries(row).reverse()));
  }
  const art=prepareRefinedReleaseMonsterArt(input);
  assert.equal(art.poolCapacity,115);
  assert.equal(art.assets[ids[0]].slots.length,41);
  assert.equal(art.assets[ids[1]].slots.length,115);
  assert.equal(art.assets[ids[2]].slots.length,1);
  assert.throws(()=>prepareRefinedReleaseMonsterArt({...input,assets:input.assets.map((entry,i)=>
    i===0?{...entry,slots:[...entry.slots].reverse()}:entry)}),/geometry hash mismatch/);
});
