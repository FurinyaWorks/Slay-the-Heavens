import test from 'node:test';
import assert from 'node:assert/strict';
import {runLua} from '../scripts/test-lua.mjs';
import {readFileSync} from 'node:fs';
import {battleLayout,statusDetailLineTemplate} from '../scripts/ui-layout.mjs';
import {assertNativeUiCapacity} from '../scripts/build-ui.mjs';
import {preflightOfficialRoots} from '../scripts/official-run-layout.mjs';
test('unit status details scroll through the native grid and retain safe click-only paging',()=>{
 const result=runLua('tests/lua/status_detail_scroll.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
});
test('native state scroller references a packaged real item template and stays inside native control limits',()=>{
 const tree=battleLayout(),templates=JSON.parse(readFileSync('build/lua/game-ui-templates.json','utf8'));
 const stage=tree.controls.find(control=>control.name==='stage');
 const panel=stage.children.find(control=>control.name==='statusInfo');
 const grid=panel.children.find(control=>control.name==='statusGrid');
 assert.equal(grid.kind,'grid');assert.equal(grid.grid.columns,1);assert.equal(grid.grid.scrollbar,true);
 assert.deepEqual(templates.find(control=>control.name===grid.itemTemplate),statusDetailLineTemplate());
 assertNativeUiCapacity(tree);assertNativeUiCapacity(statusDetailLineTemplate());
 preflightOfficialRoots([statusDetailLineTemplate()]);
});
