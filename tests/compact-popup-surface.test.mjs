import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeTheme } from '../scripts/native-ui-theme.mjs';
import { compactPopupSurface } from '../scripts/compact-popup-surface.mjs';
import { nodeLayout } from '../scripts/node-ui-layout.mjs';
import { relicTooltip } from '../scripts/relic-view-layout.mjs';
import { gameLayout } from '../scripts/game-ui-layout.mjs';
import { applyOfficialAssets, officialAssetsTheme } from '../scripts/official-assets-layout.mjs';

const parts = node => node?.controls ?? node?.children ?? [];
const child = (node, name) => parts(node).find(part => part.name === name);
function walk(node, visit) {
  visit(node);
  for (const part of parts(node)) walk(part, visit);
}
function findDeep(node, name) {
  let found;
  walk(node, part => { if (!found && part.name === name) found = part; });
  return found;
}
function verifyShell(owner, faceName, theme) {
  const border = child(owner, 'border'), face = child(owner, faceName);
  assert.ok(border && face, owner.name + ' preserves its live view paths');
  assert.deepEqual(border.position, [0, 0]);
  assert.deepEqual(face.position, [0, 0]);
  assert.deepEqual(border.size, owner.size);
  assert.deepEqual(face.size, owner.size.map(value => value - 2));
  assert.equal(border.image, theme.image.rect);
  assert.equal(face.image, theme.image.rect);
  assert.equal(border.colour, theme.color.goldDim);
  assert.equal(face.colour, theme.color.panel);
}

test('potion and read-only item windows share one flat popup material without changing their controls', () => {
  const theme = nativeTheme;
  const root = nodeLayout(theme).controls[0];
  const shop = child(child(root, 'shopView'), 'detail');
  const treasure = child(child(root, 'treasureView'), 'details');
  const relic = relicTooltip(theme);
  for (const [owner, name] of [[shop, 'panel'], [treasure, 'panel'], [relic, 'face']]) {
    verifyShell(owner, name, theme);
    for (const field of ['name', 'description']) {
      if (owner !== relic) assert.ok(child(owner, field), owner.name + ' keeps ' + field);
    }
  }
  const potion = findDeep(gameLayout(theme), 'potionPopup');
  assert.ok(potion, 'battle potion action window exists');
  verifyShell(potion, 'plate', theme);
  for (const action of ['use', 'discard', 'dismiss']) assert.ok(child(potion, action));
  for (const surface of compactPopupSurface(theme, [360, 156], {face:'face',readOnly:true})) {
    assert.equal(surface.raycastTarget, false, 'relic hover surface must not steal input');
  }
  assert.equal(child(relic, 'border').raycastTarget, false);
  assert.equal(child(relic, 'face').raycastTarget, false);
});

test('official-assets composition never resurrects the retired ornate landscape information plaque', () => {
  const theme = officialAssetsTheme(nativeTheme);
  const tree = gameLayout();
  applyOfficialAssets([tree], theme);
  const consumers = [];
  walk(tree, node => {
    if (node.kind === 'image' && node.image === theme.officialAssets.images.panel)
      consumers.push(node.name);
  });
  assert.deepEqual(consumers, [], 'retired ornate panel must not appear anywhere in generated UI');
  const root = child(tree, 'nodePanel');
  const shop = child(child(root, 'shopView'), 'detail');
  const treasure = child(child(root, 'treasureView'), 'details');
  for (const owner of [shop, treasure]) {
    verifyShell(owner, 'panel', theme);
    assert.ok(child(owner, 'description'), 'details survive official transformation');
  }
  const potion = findDeep(tree, 'potionPopup');
  verifyShell(potion, 'plate', theme);
});
