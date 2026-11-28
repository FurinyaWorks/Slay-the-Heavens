import {candidateBattleScene, collectorThrone, groundY, paintWidth, sceneHeight} from './v220-battle-scene-geometry.mjs';
import {refinedReleaseMonsterIds} from './refined-release-monsters.mjs';

const batchSize = 60;
const backgroundCapacity = 261;
export const chapterBattleSceneHost = 'chapterBattleScene';
const children = node => node.controls ?? node.children ?? [];
const find = (node, name) => children(node).find(child => child.name === name);
const images = node => node.kind === 'image' ? [node] : children(node).flatMap(images);
const isBasicShape = image => image.image >= 100001 && image.image <= 100006;
const rounded = value => Math.round(value * 1000) / 1000;

// Visible sole row and opaque foot ranges relative to the centre of the
// 106px refined release matte.
const measuredStances = Object.freeze({
  acid_slime_s: [38, [[-22, 20]]], acid_slime_m: [46, [[-26, 25]]], acid_slime_l: [45, [[-26, 23]]],
  spike_slime_s: [30, [[-35, 22]]], spike_slime_m: [38, [[-23, 17]]], spike_slime_l: [22, [[-24, 24]]],
  slime_boss: [38, [[-37, 33]]],
  blue_guard: [47, [[-28, -13], [26, 43]]], taskmaster: [47, [[-24, -7], [12, 29]]],
  red_guard: [47, [[-41, -25], [25, 42]]],
  red_louse: [50, [[10, 17]]], green_louse: [44, [[-12, 5]]], raven_adept: [46, [[4, 10], [16, 22]]],
  looter: [46, [[-21, -15], [13, 20]]], mugger: [48, [[-26, -15], [14, 29]]],
  sneaky_gremlin: [45, [[-17, 0], [13, 30]]], shield_gremlin: [44, [[-35, -18], [34, 45]]],
  wizard_gremlin: [49, [[-2, 0]]], mad_gremlin: [42, [[-16, -3], [9, 15]]], fat_gremlin: [44, [[13, 20]]],
  jaw_worm: [44, [[-17, 13]]], fungi_beast: [47, [[-2, 7]]],
  lagavulin: [48, [[-40, -6], [18, 45]]], guardian: [48, [[-40, -18], [15, 35]]],
  centurion: [52, [[14, 30]]], mystic: [47, [[21, 31]]],
  snake_plant: [43, [[-25, 28]]], shelled_parasite: [44, [[-14, -8], [6, 12]]],
  snecko: [33, [[-26, -15], [27, 38]]], automaton: [46, [[-23, -5], [2, 26]]],
  // Champ's raised forefoot ends five matte rows above the weight-bearing sole.
  champ: [48, [[10, 30]]],
  // Measure the body above the baked contact ellipse and keep that ellipse.
  gremlin_nob: [43, []], chosen: [43, []], torch_head: [34, []], gremlin_leader: [43, []],
});
const sourceAltitudeStances = Object.freeze({
  sentry: 'hovering', hexaghost: 'hovering', spheric_guardian: 'hovering',
  book_of_stabbing: 'hovering', bronze_orb: 'hovering',
  // Collector sits above the room's floor on its throne in the source battle.
  collector: 'perched',
  // EnemyView and ByrdTrial resolve the landing pose when Flight is depleted.
  byrd: 'flight',
});
const footprints = ranges => ranges.map(([left, right]) => [(left + right) / 2, right - left + 1]);

function enemyGroundContact(y, healthGap) {
  const measured = Object.entries(measuredStances);
  const classes = [
    ...measured.map(([id]) => [id, 'grounded']),
    ...Object.entries(sourceAltitudeStances),
  ];
  const unclassified = new Set(refinedReleaseMonsterIds);
  for (const [id] of classes) {
    if (!unclassified.delete(id)) throw Error('Unknown or duplicate release monster stance: ' + id);
  }
  if (unclassified.size) throw Error('Missing release monster stance: ' + [...unclassified].join(', '));
  return {
    y, depth: .35, healthGap, artSize: 106,
    classification: Object.fromEntries(classes),
    feet: Object.fromEntries(measured.map(([id, [row]]) => [id, row / 106])),
    footprints: Object.fromEntries(measured.map(([id, [, ranges]]) => [id, footprints(ranges)])),
  };
}

export function applyChapterBattlePlacement(theme) {
  const {layout, canvas} = theme;
  const {hand, enemyHealthGap, enemyPowerFloorY} = theme.officialAssets.refinedBattlePlacement;
  const centerY = canvas.base[1] / 2;
  // The 210px production Traveler matte puts the visible soles 93px below
  // the figure centre. Move only the art and contact, keeping the HUD anchor.
  const portraitOffsetY = -6;
  layout.player.position[1] = centerY - (groundY - 5) + 93;
  theme.officialAssets.battlePortraitPosition = [theme.officialAssets.battlePortraitPosition[0], portraitOffsetY];
  layout.player.groundShadow = {y: -93, offsetY: portraitOffsetY, footprints: [[-21, 12], [28, 18]]};
  layout.player.groundedStatusLane = [-168, 42];
  // The reference five-card centre projects to -313.33 at 720p. The native
  // cost badge protrudes above the card, so the settled fan sits 6.67px lower.
  Object.assign(layout.hand, hand);
  layout.enemyRow.nativePowerFloorY = enemyPowerFloorY;
  layout.enemyRow.groundContact = enemyGroundContact(centerY - (groundY - 21), enemyHealthGap);
  layout.battleNotice.position = [0, 252];
}

function paintRows(slots) {
  return slots.map(image => {
    if (!image) return false;
    const [x, y] = image.position;
    const [r, g, b] = image.colour.slice(1).match(/../g).map(value => parseInt(value, 16));
    const [px, py] = image.pivot ?? [.5, .5];
    const [sx, sy] = image.scale ?? [1, 1];
    return [image.image, rounded(x), rounded(y), ...image.size.map(rounded),
      px, py, sx, sy, rounded(image.rotation ?? 0), image.fill ? 1 : 0,
      r, g, b, Math.round((image.opacity ?? 1) * 255)];
  });
}

// A live built-in shape has no imageType setter. Align both paint orders
// by their renderer families, leaving gaps hidden rather than converting a slot.
function sharedPaintSlots(first, second) {
  const cost = Array.from({length: first.length + 1}, () => new Uint16Array(second.length + 1));
  const matches = (a, b) => a < first.length && b < second.length
    && isBasicShape(first[a]) === isBasicShape(second[b]);
  for (let a = first.length; a >= 0; a--) {
    for (let b = second.length; b >= 0; b--) {
      if (a === first.length) cost[a][b] = second.length - b;
      else if (b === second.length) cost[a][b] = first.length - a;
      else cost[a][b] = 1 + (matches(a, b) ? cost[a + 1][b + 1] : Math.min(cost[a + 1][b], cost[a][b + 1]));
    }
  }
  const slots = [];
  let a = 0;
  let b = 0;
  while (a < first.length || b < second.length) {
    if (matches(a, b)) slots.push([first[a++], second[b++]]);
    else if (b === second.length || a < first.length && cost[a + 1][b] <= cost[a][b + 1])
      slots.push([first[a++]]);
    else slots.push([undefined, second[b++]]);
  }
  return slots;
}

function collectorPaintSlots(gallery, theme) {
  const throne = collectorThrone(theme);
  let next = 0;
  const slots = gallery.map(image => {
    if (next === throne.length || !image || !/^(WestBreak|EastBreak|WestNearDebris|EastNearDebris)/.test(image.name)) return image;
    const piece = throne[next++];
    if (isBasicShape(piece) !== isBasicShape(image)) throw Error('Collector throne renderer family differs');
    return piece;
  });
  if (next !== throne.length) throw Error('Collector throne exceeds the gallery decoration slots');
  return slots;
}

export function chapterBattleScenes(theme) {
  const scenes = [candidateBattleScene(1, theme), candidateBattleScene(2, theme)];
  const paintSlots = sharedPaintSlots(images(scenes[0]), images(scenes[1]));
  const slotCount = paintSlots.length;
  const batchCount = Math.ceil(slotCount / batchSize);
  if (slotCount + batchCount + 1 > backgroundCapacity)
    throw Error('Chapter scene exceeds existing background control budget');

  // Act I is authored at build time and requires no runtime setter burst at
  // startup. All slots are pre-sized once; the other act reuses those slots.
  const batches = Array.from({length: batchCount}, (_, batch) => ({
    name: 'paintBatch' + (batch + 1), kind: 'container', position: [0, 0], size: [paintWidth, sceneHeight],
    children: Array.from({length: Math.min(batchSize, slotCount - batch * batchSize)}, (_, offset) => {
      const index = batch * batchSize + offset;
      const [first, second] = paintSlots[index];
      const image = first ?? second;
      return {...image, ...(!isBasicShape(image) ? {imageType: 'stretch'} : {}),
        name: 'paintSlot' + (index + 1), visible: !!first};
    }),
  }));
  const scene = {...scenes[0], name: chapterBattleSceneHost, children: batches};
  const [actOne, gallery] = [0, 1].map(act => paintSlots.map(pair => pair[act]));
  return {scene, rows: [actOne, gallery, collectorPaintSlots(gallery, theme)].map(paintRows), slotCount, batchSize};
}

export function applyChapterBattleScene(layout, chapterScenes, theme) {
  const stage = find(layout, 'stage') ?? layout;
  const battle = find(stage, 'battlePanel') ?? stage;
  if (!find(battle, 'endTurn') || find(battle, chapterBattleSceneHost))
    throw Error('Chapter scene requires an unused battle host');
  find(battle, 'notice').position = [...theme.layout.battleNotice.position];
  battle.children = [structuredClone(chapterScenes.scene),
    ...children(battle).filter(node => node.name !== 'lowpolyScene')];
}
