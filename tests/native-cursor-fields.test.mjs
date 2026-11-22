import test from 'node:test';
import assert from 'node:assert/strict';
import { runLua } from '../scripts/test-lua.mjs';
test('native cursor fields and generated startup keep engine activation and pointer input separate',()=>{
 const result=runLua('tests/lua/native_cursor_fields.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
 assert.match(result.stdout,/NATIVE_CURSOR_FIELDS_PASS/);
});
