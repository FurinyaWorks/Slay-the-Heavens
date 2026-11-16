import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {nodeLayout} from '../scripts/node-ui-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';

test('only the precise shop dismissal background is a nonfocusable bottom input layer',()=>{
  const panel=nodeLayout().controls[0];
  const index=panel.children.findIndex(c=>c.name==='shopDismiss');
  const dismiss=panel.children[index];
  assert.equal(dismiss.kind,'cursorArea');
  assert.equal(dismiss.focusable,false);
  assert.deepEqual(dismiss.position,[0,0]);
  assert.deepEqual(dismiss.size,nativeTheme.canvas.base);
  assert.equal(panel.children[index-1].name,'backdrop');
  for(const name of ['shopView','merchant','back','confirm']) {
    assert.ok(panel.children.findIndex(c=>c.name===name)>index,name);
  }
});

test('shop outside dismissal preserves current selection and purchase ownership',()=>{
  const result=runLua('tests/lua/shop_dismiss.lua');
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.match(result.stdout,/SHOP_DISMISS_PASS 12/);
});
