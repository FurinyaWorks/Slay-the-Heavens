import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { toLua } from './build-lua-data.mjs';
import { nativeFontSize } from './native-ui-theme.mjs';

// Approved 20-control ink master, shared by the layout writer and map runtime.
export const mapBossInk = JSON.parse(readFileSync(new URL('../data/presentation/map-boss-ink.json', import.meta.url), 'utf8'));
export function mapBossInkHost() {
  const { cap, size } = mapBossInk;
  return { name:'bossInkHost',kind:'container',position:[0,0],size:[size,size],visible:false,
    children:Array.from({length:cap},(_,i)=>({name:'ink'+String(i).padStart(2,'0'),kind:'image',
      position:[0,0],size:[1,1],image:100001,colour:'#233237',visible:false,raycastTarget:false})) };
}

export const loadMapTheme = () => JSON.parse(readFileSync('data/presentation/ui_theme.json', 'utf8'));
export const mapLegendRows = [['event', '未知'], ['shop', '商人'], ['treasure', '宝箱'],
  ['camp', '休息'], ['combat', '敌人'], ['elite', '精英']];

// Positions absent from the shared theme come from PR #19's approved map viewport.
// These are presentation capacities, never a replacement for Map.view's graph.
export function mapGeometry(theme = loadMapTheme()) {
  const { floorGap, viewportHeight, bossNode, bossFloorLift } = theme.layout.map;
  const firstY = -308 + 60, top = -308 + viewportHeight;
  return { bossInk: mapBossInk, floors: 17, generatedRows: 15, lanes: 7, maxNodes: 92, maxEdges: 126,
    viewport: { left: -460, right: 440, bottom: -308, top },
    firstY, contentHeight: 17 * floorGap + 120,
    maxScroll: 17 * floorGap + 120 - viewportHeight, focusY: -72,
    bossTreasureMaxScroll: firstY + 15 * floorGap + bossFloorLift - top + Math.ceil(bossNode * .65) + 8,
    scrollStep: floorGap * theme.layout.map.scrollStepFloors, scrollSeconds: theme.motion.base,
    breathSeconds: 1.4, breathScale: 1.5,
    // Ported constants from STS MapRoomNode/MapEdge (aeubanks/sts@319009d, TASK-40 hash).
    // iconPerScale maps STS scale 0.5 (64px of a 128px glyph) onto 0.6 of our node box.
    sts: { baseScale: .5, iconPerScale: 1.2, circlePerScale: 1.35, oscillateRate: 5, lerpSpeed: 8, snap: .003,
      srcRadius: 29 / 64 * .6, dstRadius: 20 / 64 * .6, bossRadius: .35 },
    glowPadding: 0, lineWidth: theme.layout.map.presentation.pathWidth, dragThreshold: theme.layout.cardDrag.threshold };
}

export function mapLayout(theme = loadMapTheme()) {
  const g = mapGeometry(theme), c = theme.color, f = theme.font, im = theme.image;
  const text = (name, x, y, w, h, content = '', fontSize = f.body, colour = c.text, align = 'centre') => ({
    name, kind: 'text', position: [x, y], size: [w, h],
    text: { content, fontSize: nativeFontSize(fontSize, f.minimum), colour, align, valign: 'middle', autoSize: true, minFontSize: nativeFontSize(fontSize, f.minimum) },
  });
  const image = (name, x, y, w, h, colour, picture = im.rect) => ({
    name, kind: 'image', position: [x, y], size: [w, h], image: picture, colour,
  });
  const hit = (w, h) => ({ name: 'hit', kind: 'cursorArea', size: [w, h] });
  const visual = theme.layout.map.presentation;
  // Map.dc.html retains TYPE explanations. Only the old STATE key was retired.
  const legend = visual.typeLegend;
  const typeLegend = { name: 'typeLegend', kind: 'container', position: legend.position, size: legend.size,
    children: [text('title', 0, legend.titleY, legend.size[0], legend.textHeight, '图例', f.label, c.mapHeader.title),
      ...mapLegendRows.flatMap(([kind, label], i) => {
        const y = legend.firstY - i * legend.rowGap;
        return [image(`${kind}Icon`, legend.iconX, y, legend.iconSize, legend.iconSize, c.mapHeader.legendInk, theme.icon.node[kind]),
          text(`${kind}Label`, legend.labelX, y, legend.labelWidth, legend.textHeight, label, f.label, c.mapHeader.legendInk, 'left')];
      })] };
  const { left, right, bottom, top } = g.viewport;
  const header = visual.header;
  const controls = [
    image('mapField', 0, 0, ...theme.canvas.base, c.mapCanvas.backdrop),
    { ...image('mapLight', 0, 0, 1040, 680, c.mapCanvas.field, im.glow), opacity: .8 },
    // Native glow plates approximate the canvas fog beneath all text and input.
    ...visual.fog.map(([x, y, w, h], i) => ({
      ...image(`fog${i + 1}`, x, y, w, h, c.mapCanvas.fog, im.glow), opacity: visual.fogOpacity,
    })),
    // Map/Main canvas header: subdued dark band, copper hairline and title wings.
    { ...image('headerShade', ...header.shade, c.mapHeader.shade), opacity: header.shadeOpacity },
    image('headerDivider', ...header.divider, c.mapHeader.border, im.fadeLine),
    image('titleLineLeft', ...header.titleLineLeft, c.mapHeader.border, im.fadeLine),
    image('titleLineRight', ...header.titleLineRight, c.mapHeader.border, im.fadeLine),
    // Lowest layer: dragging anywhere on the route scrolls it; node hits sit above.
    { name: 'dragArea', kind: 'cursorArea', position: [(left + right) / 2, (bottom + top) / 2],
      size: [right - left, top - bottom], focusable: false },
    // TASK-4.13: one parchment hierarchy — act title is the only heading-size ink in the bar.
    text('title', 0, 316, 380, 40, '', f.number, c.mapHeader.title),
    { ...text('notice', 0, -324, 1160, visual.noticeHeight, '', f.small, c.textDim), visible: false },
    typeLegend,
  ];
  // Runtime clips these line segments geometrically to the themed viewport.
  for (let i = 1; i <= g.maxEdges; i++) controls.push({
    ...image(`edge${i}`, 0, 0, 1, g.lineWidth, c.node.path), visible: false,
  });
  for (let i = 1; i <= g.maxNodes; i++) {
    const s = theme.layout.map.node;
    // Two offset native strokes give the rotated circle uneven ink weight.
    const stroke = (name, min, max) => ({
      ...image(name, 0, 0, 0, 0, c.goldBright, im.ring), anchor: { min, max },
    });
    const children = [
      { name: 'ring', kind: 'container', size: [s * .95, s * .95], visible: false, children: [
        stroke('outline', [.025, .06], [.975, .94]),
        stroke('brush', [.08, .045], [.97, .96]),
      ] },
      image('icon', 0, 0, s * .6, s * .6, c.node.locked, theme.icon.node.combat), hit(s, s)];
    children.push({ ...text('emeraldLabel', ...theme.layout.map.emeraldLabel, '绿钥匙', f.label, c.positive), visible: false });
    controls.push({ name: `node${i}`, kind: 'container', position: [0, 0], size: [s, s], visible: false, children });
  }
  // MCP accepts at most 60 children per control. Keep draw order and positions
  // while putting the large edge/node pools in zero-offset containers.
  const groups = [];
  for (let i = 0; i < controls.length; i += 50) groups.push({
    name: `mapGroup${groups.length + 1}`, kind: 'container', size: theme.canvas.base,
    children: controls.slice(i, i + 50),
  });
  const background = groups[0].children;
  background.splice(background.findIndex(item => item.name === 'dragArea'), 0,
    { ...image('mapReturnShade', 0, 0, ...theme.canvas.base, '#000000'),
      visible: false, raycastTarget: false });
  return { name: 'AbyssMap', showCursor: true, blockKeys: true, blockCursor: true,
    controls: [image('mapBackdrop', 0, 0, ...theme.canvas.base, c.backdrop),
      { name: 'stage', kind: 'container', size: theme.canvas.base, children: [
        { name: 'mapPanel', kind: 'container', size: theme.canvas.base, children: groups },
      ] }],
  };
}

// Build separately so no shared battle entry point or package command is changed.
export function buildMapLayout(output = 'build/map-ui.json', contract = 'build/lua/abyss_map_layout.lua',
  controls = 'build/lua/abyss_map_controls.lua') {
  const theme = loadMapTheme();
  const layout = mapLayout(theme);
  for (const file of [output, contract, controls]) mkdirSync(dirname(file), { recursive: true });
  writeFileSync(output, JSON.stringify(layout, null, 2) + '\n');
  writeFileSync(contract, '-- Generated by scripts/map-ui-layout.mjs. Do not edit.\nreturn ' + toLua(mapGeometry(theme)) + '\n');
  // Same schema in Lua lets the test harness exercise the exact generated tree.
  writeFileSync(controls, '-- Generated map control schema.\nreturn ' + toLua(layout) + '\n');
}

// Main UI builds can put all runtime artifacts in the same custom directory.
export function buildMapUI(outputDirectory = 'build/lua') {
  buildMapLayout(join(outputDirectory, 'map-ui.json'),
    join(outputDirectory, 'abyss_map_layout.lua'), join(outputDirectory, 'abyss_map_controls.lua'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  buildMapLayout();
  console.log('Map controls and Lua layout contract built.');
}
