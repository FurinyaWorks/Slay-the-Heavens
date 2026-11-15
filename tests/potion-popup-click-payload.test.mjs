import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
test('popup accepts a uniquely owned release when native Click omits its ID without weakening pointer boundaries',()=>{
 const r=runLua('tests/lua/potion_popup_click_payload.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/POTION_POPUP_CLICK_PAYLOAD_PASS/);
});
