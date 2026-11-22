// Production catalogue: no legacy prototype payload, feature toggles, or paths supplied by the registry.
import { createHash } from 'node:crypto';

export const refinedReleaseMonsterRegistry = 'data/release/refined-monster-art.json';
export const refinedReleaseMonsterIds = Object.freeze([
  'acid_slime_s', 'acid_slime_m', 'acid_slime_l', 'spike_slime_s', 'spike_slime_m', 'spike_slime_l',
  'red_louse', 'green_louse', 'cultist', 'looter', 'mugger', 'blue_slaver', 'red_slaver', 'taskmaster',
  'sneaky_gremlin', 'shield_gremlin', 'wizard_gremlin', 'mad_gremlin', 'fat_gremlin', 'gremlin_nob',
  'jaw_worm', 'fungi_beast', 'lagavulin', 'sentry', 'spheric_guardian', 'guardian', 'slime_boss',
  'hexaghost', 'centurion', 'mystic', 'chosen', 'book_of_stabbing', 'snake_plant', 'shelled_parasite',
  'byrd', 'snecko', 'torch_head', 'collector', 'automaton', 'bronze_orb', 'champ', 'gremlin_leader',
]);
const ids = new Set(refinedReleaseMonsterIds);
const slotKeys = ['anchorMax','anchorMin','colour','image','imageType','pivot','position','rotation','scale','size'];
const canvas = [106, 106];
const maxSlots = 115;
const isSha256 = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const vector = (value, size) => Array.isArray(value) && value.length === size &&
  Array.from(value).every(Number.isFinite);
const pair = (value, x, y) => vector(value, 2) && value[0] === x && value[1] === y;
const hasFields = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));

// Ordered shape rows are semantically significant. Hash in canonical field order,
// independently of object key ordering in the authored JSON.
export function refinedMonsterGeometrySha256(slots) {
  const ordered = slots.map(slot => Object.fromEntries(slotKeys.map(key => [key,slot[key]])));
  return createHash('sha256').update(JSON.stringify(ordered)).digest('hex');
}

function validateSlot(slot, id, i) {
  const at = `${id}[${i}]`;
  if (!hasFields(slot,slotKeys)) throw Error('Unexpected refined monster slot field: '+at);
  if (![100001,100002,100003].includes(slot.image) || !['basic','stretch'].includes(slot.imageType)) {
    throw Error('Unsupported refined monster image/type: '+at);
  }
  if (!vector(slot.position,2) || !vector(slot.size,2) || slot.size.some(n=>n<=0) ||
      !vector(slot.rotation,3) || !pair(slot.scale,1,1) ||
      !['anchorMin','anchorMax','pivot'].every(key=>pair(slot[key],.5,.5)) ||
      !vector(slot.colour,4) || slot.colour.some(n=>!Number.isInteger(n)||n<0||n>255)) {
    throw Error('Invalid refined monster slot geometry/RGBA: '+at);
  }
}

export function prepareRefinedReleaseMonsterArt(input) {
  if (!hasFields(input,['schemaVersion','canvas','assets']) || input.schemaVersion !== 1 ||
      !pair(input.canvas,...canvas)) throw Error('Invalid refined monster registry');
  if (!Array.isArray(input.assets) || input.assets.length !== ids.size) {
    throw Error('Refined monster registry requires the exact 42 release enemies');
  }
  const seen = new Map(), shapes = new Set();
  for (const entry of input.assets) {
    if (!hasFields(entry,['enemyId','slots','provenance'])) throw Error('Invalid refined monster asset');
    const {enemyId:id,slots,provenance} = entry;
    if (!ids.has(id)) throw Error('Unknown refined monster enemy: '+id);
    if (seen.has(id)) throw Error('duplicate refined monster enemy: '+id);
    if (!Array.isArray(slots) || slots.length < 1 || slots.length > maxSlots) {
      throw Error('Refined monster requires 1–115 native slots: '+id);
    }
    if (!hasFields(provenance,['geometrySha256','sourceSha256']) ||
        !isSha256(provenance.geometrySha256) || !isSha256(provenance.sourceSha256)) {
      throw Error('Invalid refined monster provenance: '+id);
    }
    for (const [i,slot] of slots.entries()) validateSlot(slot,id,i);
    const geometrySha256=refinedMonsterGeometrySha256(slots);
    if (provenance.geometrySha256 !== geometrySha256) throw Error('Refined monster geometry hash mismatch: '+id);
    if (shapes.has(geometrySha256)) throw Error('duplicate refined monster asset geometry: '+id);
    shapes.add(geometrySha256);
    seen.set(id,{enemyId:id,cardId:id,slots:structuredClone(slots),capacity:slots.length,geometrySha256});
  }
  const assets=Object.fromEntries(refinedReleaseMonsterIds.map(id=>[id,seen.get(id)]));
  const bindings=Object.fromEntries(refinedReleaseMonsterIds.map(id=>[id,id]));
  return {enabled:true,canvas:[...canvas],assets,bindings,hostOrigin:[0,0],status:'refined-release',
    poolCapacity:Math.max(...[...seen.values()].map(asset=>asset.capacity)),
    surfaceAllocation:'per-drawable-actor-instance',inputPaths:[refinedReleaseMonsterRegistry],
    provenance:{orderedAssets:input.assets.map(({enemyId,slots,provenance})=>
      ({enemyId,slotCount:slots.length,geometrySha256:provenance.geometrySha256,sourceSha256:provenance.sourceSha256}))
      .sort((a,b)=>a.enemyId<b.enemyId?-1:a.enemyId>b.enemyId?1:0)}};
}
