import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { nativeTheme } from '../scripts/native-ui-theme.mjs';
import { nodeLayout } from '../scripts/node-ui-layout.mjs';
import { relicTooltip } from '../scripts/relic-view-layout.mjs';
import { gameLayout } from '../scripts/game-ui-layout.mjs';
import { buildUI } from '../scripts/build-ui.mjs';

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
  assert.equal(child(relic, 'border').raycastTarget, false);
  assert.equal(child(relic, 'face').raycastTarget, false);
});

test('generated official UI uses the compact material at every item-detail path', t => {
  const directory = mkdtempSync(join(tmpdir(), 'abyss-popup-ui-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  buildUI(directory, undefined, { officialAssets: true, nativePageLifecycle: true });
  const read = name => JSON.parse(readFileSync(join(directory, name + '.json'), 'utf8'));
  const theme = read('official-assets-theme');
  const game = read('game-ui'), battle = read('battle-ui');
  for (const tree of [game, battle, ...read('game-ui-templates')]) {
    walk(tree, node => {
      if (node.kind === 'image') assert.notEqual(node.image, 107311, `${tree.name}/${node.name}`);
    });
  }
  const stage = child(game, 'stage'), rooms = child(stage, 'nodePanel');
  const shop = child(child(rooms, 'shopView'), 'detail');
  const treasure = child(child(rooms, 'treasureView'), 'details');
  for (const [owner, fields] of [[shop, ['name', 'description']],
    [treasure, ['name', 'description', 'relatedName', 'relatedDescription']]]) {
    verifyShell(owner, 'panel', theme);
    for (const field of fields) assert.equal(child(owner, field)?.kind, 'text');
  }
  const relic = child(child(stage, 'relicBar'), 'tooltip');
  verifyShell(relic, 'face', theme);
  assert.ok([relic, ...relic.children].every(control => control.raycastTarget === false));
  for (const potion of [findDeep(battle, 'potionPopup'), findDeep(game, 'potionPopup'), child(stage, 'potionPanel')]) {
    verifyShell(potion, 'plate', theme);
    for (const action of ['use', 'discard', 'dismiss']) assert.ok(child(potion, action));
  }
  for (const name of ['rewardStage', 'rewardList']) {
    const plate = child(child(child(stage, 'battlePanel'), name), 'plate');
    assert.equal(plate.colour, theme.color.panelSunken, `${name} retains its authored material`);
    assert.equal(plate.opacity, 0);
  }
});
