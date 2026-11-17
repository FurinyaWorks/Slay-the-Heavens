import {dragReplay} from '../../../tests/helpers/historical-drag-replay.mjs';
import assert from 'node:assert/strict';
try{
 const result=await dragReplay.run('tests/lua/battle_ui_drag_click_compatibility.lua');
 assert.equal(result.status,0,result.stderr);
 assert.match(result.stdout,/LUA_DRAG_CLICK_COMPATIBILITY 7 passed; 0 failed/);
 console.log(result.stdout);
}finally{await dragReplay.close();}
