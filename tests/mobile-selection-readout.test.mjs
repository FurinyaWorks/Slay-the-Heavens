import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';

const require=createRequire(import.meta.url);
for(const official of [false,true])test(`${official?'official icon':'legacy labelled'} selection keeps complete loadout numbers`,t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const dir=mkdtempSync(join(root,'selection-readout-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildLuaData('data',join(dir,'abyss_data.lua'));
 buildUI(dir,undefined,official?{officialAssets:true}:{});
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const body=`local generated=${luaString(dir.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local View=require('abyss_character_select_view')
local ui,root=F.fixture()
assert(ui:start() and ui:selectCharacter('traveler') and ui:selectElement('ironclad'))
local panel=root:GetChild('characterPanel')
local details=panel:GetChild('details')
local info=ui.characterSelection.info
assert(info and info.maxHp==80 and info.gold==99,'real traveler loadout changed')
local function check(hp,gold)
 info.maxHp,info.gold=hp,gold
 View.render(panel,ui.characterSelection,{})
 assert(details:GetChild('stats').text==${official?"tostring(hp)..'/'..tostring(hp)":"'生命  '..hp..' / '..hp"},'HP label exceeds icon readout')
 assert(details:GetChild('gold').text==${official?"tostring(gold)":"'金币  '..gold"},'gold label exceeds icon readout')
end
check(80,99);check(9,0);check(9999,9999)
print('MOBILE_SELECTION_READOUT_PASS')`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{
  cwd:process.cwd(),encoding:'utf8',timeout:30000,maxBuffer:1024*1024,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''},windowsHide:true,
 });
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/MOBILE_SELECTION_READOUT_PASS/);
});
