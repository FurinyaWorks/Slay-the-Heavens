import test from 'node:test';
import assert from 'node:assert/strict';
import { gameLayout } from '../scripts/game-ui-layout.mjs';
import { deckCardTemplate } from '../scripts/deck-ui-layout.mjs';
import { nativeTheme as theme } from '../scripts/native-ui-theme.mjs';

test('read-only piles reserve an empty native host and retain the separate selection Grid', () => {
  const panel=gameLayout().controls.find(c=>c.name==='deckPanel');
  const grid=panel.children.find(c=>c.name==='pileGrid');
  const chrome=panel.children.find(c=>c.name==='pileChrome');
  const veil=chrome.children.find(c=>c.name==='shade');
  assert.equal(grid.kind,'container');
  assert.equal(grid.visible,false);
  assert.equal(grid.grid,undefined);
  assert.equal(grid.itemTemplate,undefined);
  assert.deepEqual(grid.children??[],[]);
  assert.equal(veil.colour,'#000000');assert.equal(veil.opacity,.85);assert.equal(chrome.visible,false);
  assert.ok(panel.children.indexOf(chrome)<panel.children.findIndex(c=>c.name==='blocker'));
  assert.equal(panel.children.find(c=>c.name==='grid').grid.columns,6);
});

function walk(control, fn) { fn(control); for (const child of control.children ?? []) walk(child, fn); }
test('approved deck uses a six-column vertical native scroller and a read-only reusable card template', () => {
  const panel = gameLayout().controls.find(c => c.name === 'deckPanel');
  const grid = panel.children.find(c => c.name === 'grid');
  assert.ok(panel.children.every(control => !control.name.startsWith('filter')));
  assert.equal(panel.children.find(c => c.name === 'sortoriginal').children[0].kind, 'presetButton');
  assert.equal(panel.children.find(c => c.name === 'browseTitle').visible, false);
  assert.equal(panel.visible, false);
  const veil = panel.children.find(c => c.name === 'veil');
  assert.equal(veil.colour, theme.color.backdropVeil.slice(0, 7));
  assert.equal(veil.opacity, 0.8);
  const header = panel.children.find(c => c.name === 'header');
  assert.equal(header.colour, theme.color.panel, 'opaque header must mask the underlying scene title');
  assert(header.position[1] - header.size[1] / 2 >= grid.position[1] + grid.size[1] / 2);
  assert.equal(grid.kind, 'grid');
  assert.equal(grid.itemTemplate, deckCardTemplate().name);
  assert.equal(grid.grid.columns, 6);
  assert.equal(grid.grid.scrollbar, true);
  assert.equal(grid.grid.horizontal, false);
  assert.deepEqual(grid.size, [1120, 560]);
  assert.equal(panel.children.find(c => c.name === 'blocker').kind, 'cursorArea');
  const template = deckCardTemplate();
  walk(template, c => {
    if(c.name==='hit'){
      assert.equal(c.kind,'cursorArea','choices need a native cursor receiver');
      assert.equal(c.visible,false,'read-only cards cannot steal scroll gestures');
      assert.deepEqual(c.size,theme.layout.card.size);
    }else assert.ok(!['cursorArea','presetButton'].includes(c.kind),'only the hidden choice receiver may handle input');
    assert.ok((c.children?.length ?? 0) <= 60);
  });
  assert.ok(template.children.find(c => c.name === 'uid'));
  const selection = template.children.find(c => c.name === 'uid');
  assert.equal(selection.size[1], theme.layout.nativeText.lineHeight);
  assert.equal(template.size[1], theme.layout.card.size[1] + selection.size[1]);
  assert.deepEqual(grid.grid.itemSize, template.size);
  const face = template.children.find(c => c.name === 'face');
  assert.deepEqual(face.size, theme.layout.card.size);
  assert.deepEqual(face.children.find(c => c.name === 'label').size, theme.layout.card.textBox);
  const [top, bottom, left, right] = grid.grid.padding;
  assert.ok(left + 6 * grid.grid.itemSize[0] + 5 * grid.grid.spacing[0] + right <= grid.size[0]);
  assert.ok(top + grid.grid.itemSize[1] + bottom <= grid.size[1]);
  for (const name of ['open', 'close']) {
    const wrapper = name === 'open' ? gameLayout().controls.find(c => c.name === 'deckEntry').children[0]
      : panel.children.find(c => c.name === name);
    const hit = wrapper.children.find(c => c.name === 'hit');
    assert.equal(hit.kind, 'presetButton');
    for (const state of ['normal', 'hover', 'pressed', 'disabled']) assert.ok(hit.children.find(c => c.name === hit.states[state]));
    assert.deepEqual(hit.children.find(c => c.name === 'pressed').scale, [0.96, 0.96]);
  }
});

test('deck overlay and close remain inside approved canvas safe areas at every device scale', () => {
  const layout = gameLayout();
  for (const control of layout.controls) walk(control, c => assert.ok((c.children?.length ?? 0) <= 60, c.name));
  for (const device of Object.values(theme.canvas.devices)) {
    const k = Math.min(device[0] / theme.canvas.base[0], device[1] / theme.canvas.base[1]);
    const panel = layout.controls.find(c => c.name === 'deckPanel');
    for (const c of ['close','grid','browseTitle','sortoriginal','sorttype','sortcost',
      'previous','next','pageHint','upgradePreview'].map(name => panel.children.find(c => c.name === name)).concat([
      layout.controls.find(c => c.name === 'deckEntry').children.find(c => c.name === 'open')])) {
      assert.ok((Math.abs(c.position[0]) + c.size[0] / 2 + theme.canvas.safe.x) * k <= device[0] / 2);
      assert.ok((Math.abs(c.position[1]) + c.size[1] / 2 + theme.canvas.safe.y) * k <= device[1] / 2);
    }
  }
});

test('the simplified-Chinese sort header has three native buttons and clears the shared HUD', () => {
  const panel = gameLayout().controls.find(c => c.name === 'deckPanel');
  const sort = panel.children.find(c => c.name === 'deckSort');
  const chrome = panel.children.find(c => c.name === 'pileChrome');
  const shade = chrome.children.find(c => c.name === 'shade');
  const {height} = theme.officialAssets.battleHud;
  assert.deepEqual(sort.children.map(control => control.name), ['plate', 'original', 'type', 'cost']);
  assert.deepEqual(sort.children.slice(1).map(control => control.children[0].text.content), ['获得顺序', '类型', '耗能']);
  assert.equal(shade.position[1] + shade.size[1] / 2, theme.canvas.base[1] / 2 - height);
  assert.ok(sort.position[1] + 22 < shade.position[1] + shade.size[1] / 2);
});

test('overlays avoid navigation metadata and deck pages leave the card viewport clear', () => {
  const layout = gameLayout(undefined, {originalCharacters: true});
  for (const name of ['deckPanel','potionPanel','choicePanel','characterPanel','exitPanel']) {
    assert.equal(layout.controls.find(c => c.name === name).isolateNavigation, undefined, name);
  }
  const deck = layout.controls.find(c => c.name === 'deckPanel');
  const grid = deck.children.find(c => c.name === 'grid');
  for (const name of ['previous','next','pageHint']) {
    const control = deck.children.find(c => c.name === name);
    assert.equal(control.visible, false, 'paging starts hidden until the browser opens');
    assert.ok(control.position[1] + control.size[1] / 2 < grid.position[1] - grid.size[1] / 2);
  }
});

 test('upgrade preview is an explicit native button outside the text paging hit', () => {
 const panel=gameLayout().controls.find(c=>c.name==='deckPanel');
 const toggle=panel.children.find(c=>c.name==='upgradePreview');
 const textHit=panel.children.find(c=>c.name==='detailHit');
 assert.equal(toggle.visible,false);
 assert.equal(toggle.children[0].kind,'presetButton');
 assert.equal(toggle.children[0].focusable,undefined);
 assert.ok(toggle.size[1]>=48);
 assert.ok(toggle.position[1]+toggle.size[1]/2<textHit.position[1]-textHit.size[1]/2);
 for(const state of toggle.children[0].children)assert.equal(state.children.find(c=>c.name==='label').text.content,'升级预览');
 });

 test('original Chinese sort labels fit in every state without truncation at all reported sizes', () => {
  const panel=gameLayout().controls.find(c=>c.name==='deckPanel');
  for(const [name,label] of [['sortoriginal','获得顺序 ↓'],['sorttype','类型 ↓'],['sortcost','耗能 ↓']]) {
    const control=panel.children.find(c=>c.name===name);
    for(const state of control.children[0].children) {
      const text=state.children.find(c=>c.name==='label');
      for(const [w,h] of [[1280,720],[2048,1150],[2048,1171],[2048,1152]]) {
        const scale=Math.min(w/1280,h/720)*state.scale[0];
        assert.ok([...label].length*theme.font.label*scale <= text.size[0]*scale, name+' full label');
        assert.ok(theme.font.label*scale <= text.size[1]*scale);
      }
    }
  }
 });
