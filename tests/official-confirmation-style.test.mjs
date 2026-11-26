import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {buildLuaData,luaString} from '../scripts/build-lua-data.mjs';
import {buildUI} from '../scripts/build-ui.mjs';

const require=createRequire(import.meta.url);
function build(t){
 const directory=mkdtempSync(join(tmpdir(),'confirmation-style-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 buildLuaData('data',join(directory,'abyss_data.lua'));
 buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
 const {controls}=JSON.parse(readFileSync(join(directory,'game-ui.json'),'utf8'));
 return {stage:controls.find(c=>c.name==='stage'),directory};
}

test('official abandon, overwrite and platform exit share unscaled confirmation hit geometry',t=>{
 const {stage, directory}=build(t);
 const flow=`
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local h,root=F.fixture()
assert(F.start(h))
local run=h.run
local panel=root:GetChild('exitPanel')
local font=require('abyss_theme').font.confirmationAction
local function check()
 assert(panel.visible)
 local left=panel:GetChild('cancel')
 local right=panel:GetChild('confirm')
 assert(right.anchoredPositionX-left.anchoredPositionX==200,'confirmation pair spacing')
 for _,button in ipairs({left,right})do
  local hit=button:GetChild('hit')
  assert(hit.sizeDeltaX==168 and hit.sizeDeltaY==72,'confirmation hit size')
  assert(not button.scale or (button.scale[1]==1 and button.scale[2]==1),'confirmation must not scale labels on either axis')
  for _,state in ipairs({'normal','hover','pressed','disabled'})do
   local label=hit:GetChild(state):GetChild('label')
   assert(utf8.len(label.text)*font<=label.sizeDeltaX,'confirmation label exceeds its full-width glyph budget')
  end
 end
 local previous=panel:GetChild('title')
 for _,control in ipairs({panel:GetChild('message'),panel:GetChild('status'),left})do
  assert(previous.anchoredPositionY-previous.sizeDeltaY/2>=control.anchoredPositionY+control.sizeDeltaY/2,
   previous.name..' overlaps '..control.name)
  previous=control
 end
end
assert(h:openMenu() and h:requestNavigation('abandon'))
check()
assert(h:closeExit() and h.run==run)
assert(h:openMenu() and h:returnToMainMenu())
assert(h:requestNavigation('new'))
check()
assert(h:closeExit() and h.run==run)
assert(h:openExit())
check()
assert(h:closeExit() and h.run==run)
print('SHARED_CONFIRMATION_GEOMETRY_PASS')
`;
 const script=`package.path=${luaString(directory.replaceAll('\\','/')+'/?.lua;src/lua/?.lua')}\n${flow}`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',script],
  {encoding:'utf8',timeout:30000,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.error?.message??result.stderr+result.stdout);
 assert.match(result.stdout,/SHARED_CONFIRMATION_GEOMETRY_PASS/);
 const panel=stage.children.find(c=>c.name==='exitPanel');
 for(const action of panel.children.filter(c=>['cancel','confirm'].includes(c.name))){
  assert.deepEqual(action.size,[168,72]);
  const hit=action.children.find(c=>c.name==='hit');
  assert.deepEqual(hit.size,action.size);
  for(const state of hit.children){
   const label=state.children.find(c=>c.name==='label');
   assert.deepEqual(state.size,action.size);
   assert.deepEqual(state.children.map(c=>c.name),['roundedButton','label']);
   assert.deepEqual(label.position,[0,0]);
   assert.deepEqual(label.size,[144,68]);
   assert.equal(label.text.fontSize,24);
   assert.equal(label.text.minFontSize,24);
   assert.equal(label.text.align,'centre');
   assert.equal(label.text.valign,'middle');
   assert.equal(state.scale[0],state.scale[1]);
  }
 }
});
