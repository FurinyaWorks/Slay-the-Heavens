import test from 'node:test';
import assert from 'node:assert/strict';
import { mapLayout, loadMapTheme } from '../scripts/map-ui-layout.mjs';

const theme = loadMapTheme();
const controls = mapLayout(theme).controls[1].children[0].children.flatMap(group => group.children);
const get = name => {
  const control = controls.find(item => item.name === name);
  assert.ok(control, `missing map control: ${name}`);
  return control;
};
const bounds = control => ({
  left: control.position[0] - control.size[0] / 2,
  right: control.position[0] + control.size[0] / 2,
  bottom: control.position[1] - control.size[1] / 2,
  top: control.position[1] + control.size[1] / 2,
});
const intersects = (a, b) => a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;

test('the map legend leaves the drag surface clear on the shared canvas', () => {
  const legend = bounds(get('typeLegend'));
  assert.equal(intersects(legend, bounds(get('dragArea'))), false);
  assert.ok(legend.right <= theme.canvas.base[0] / 2 - theme.canvas.safe.x);
  assert.ok(legend.bottom >= -theme.canvas.base[1] / 2 + theme.canvas.safe.y);
});

test('the shared type legend keeps its position and no paging or recenter control takes input', () => {
  for (const name of ['next', 'previous', 'focus']) {
    assert.equal(controls.some(control => control.name === name), false, name);
  }
  assert.deepEqual(get('typeLegend').position, theme.layout.map.presentation.typeLegend.position);
  assert.deepEqual(get('typeLegend').size, theme.layout.map.presentation.typeLegend.size);
});
