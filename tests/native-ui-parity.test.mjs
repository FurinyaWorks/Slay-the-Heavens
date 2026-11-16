import test from 'node:test';
import assert from 'node:assert/strict';
import { controlsGuide } from '../scripts/controls-guide-layout.mjs';
import { gameLayout } from '../scripts/game-ui-layout.mjs';
import { nativeTheme as theme } from '../scripts/native-ui-theme.mjs';
import { runLua } from '../scripts/test-lua.mjs';

test('retained guide source stays readable while actual navigation retires both help receivers', () => {
  const guide = controlsGuide();
  const sections = guide.children.filter(c => ['battle', 'map', 'resources'].includes(c.name));
  assert.equal(sections.length, 3);
  assert.equal(sections.find(c => c.name === 'battle').children.find(c => c.name === 'how4').text.content, '点击右下角「结束回合」');
  assert.equal(sections.find(c => c.name === 'map').children.find(c => c.name === 'how4').text.content, '先点商品查看详情，再确认购买');
  for (const section of sections) {
    assert.equal(section.children.filter(c => c.name.startsWith('action')).length, 4);
    assert.equal(section.children.filter(c => c.name.startsWith('how')).length, 4);
  }
  const visit = (c, x=0, y=0) => {
    x += c.position?.[0] ?? 0; y += c.position?.[1] ?? 0;
    assert(Math.abs(x) + c.size[0]/2 <= 640, c.name);
    assert(Math.abs(y) + c.size[1]/2 <= 360, c.name);
    if (c.text) assert(c.size[1] >= 40, c.name);
    for (const child of c.children ?? []) visit(child,x,y);
  };
  visit(guide);
  const content = JSON.stringify(guide);
  assert(!content.includes('1–9') && !content.includes('Esc') && !content.includes('Tab'));
  const controls = gameLayout().controls;
  for(const name of ['exitPanel','runMenu']) {
    const panel = controls.find(c=>c.name===name);
    assert(panel);
    assert(!panel.children.some(c=>['help','guide'].includes(c.name)), 'retired help must have no generated hit area');
  }
  const exit = controls.find(c=>c.name==='exitPanel');
  assert.deepEqual(exit.children.find(c=>c.name==='cancel').position,theme.layout.exitMenu.cancel.slice(0,2));
});

test('real host isolates exit input, returns controller focus, and retains map navigation after input switching', () => {
  const result=runLua('tests/lua/native_ui_parity.lua');
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.match(result.stdout,/NATIVE_UI_PARITY_PASS/);
});
