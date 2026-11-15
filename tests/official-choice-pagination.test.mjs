import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,readFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {experimentalCharacterControls} from '../scripts/character-ui-layout.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';

const require=createRequire(import.meta.url);
const parts=n=>n.controls??n.children??[];
const all=n=>[n,...parts(n).flatMap(all)];
const cards=theme=>experimentalCharacterControls(theme).find(n=>n.name==='choicePanel').children.filter(n=>/^card\d+$/.test(n.name));

test('official choice profile keeps two unchanged faces while default retains ten and Match retains twelve',()=>{
 const snapshot=structuredClone(nativeTheme),official=officialAssetsTheme(nativeTheme);
 assert.equal(cards(nativeTheme).length,10);
 assert.equal(cards(official).length,2);
 assert.deepEqual(cards(official).map(n=>n.position),[[-108,0],[108,0]]);
 const legacy=structuredClone(official);legacy.layout.combatChoice=structuredClone(nativeTheme.layout.combatChoice);
 for(let i=0;i<2;i++){
  assert.deepEqual(cards(official)[i].size,cards(legacy)[i].size);
  assert.deepEqual(cards(official)[i].children,cards(legacy)[i].children,'only host count/position may change');
 }
 const {previous:forgePrevious,next:forgeNext,...forge}=official.layout.nativeNode.forge;
 const {previous:defaultForgePrevious,next:defaultForgeNext,...defaultForge}=nativeTheme.layout.nativeNode.forge;
 assert.deepEqual(forge,defaultForge,'all non-footer forge fields retain their original contract');
 const {previous,next,...picker}=official.layout.nativeNode.picker;
 const {previous:defaultPrevious,next:defaultNext,...defaultPicker}=nativeTheme.layout.nativeNode.picker;
 assert.deepEqual(picker,{...defaultPicker,columns:[-246,0,246]},'all non-footer picker fields retain their original contract');
 // PC26/30 reuses the approved Deck footer below the hovered forge cards.
 assert.deepEqual({previous:forgePrevious,next:forgeNext},{previous:[-430,-245.4,200,48],next:[430,-245.4,200,48]});
 assert.deepEqual({previous,next},{previous:[-430,-245.4,200,48],next:[430,-245.4,200,48]});
 assert.deepEqual({previous:defaultForgePrevious,next:defaultForgeNext},{previous:[-490,-236,56,44],next:[490,-236,56,44]},'default forge keeps its original footer');
 assert.deepEqual({previous:defaultPrevious,next:defaultNext},{previous:[-530,116,44,208],next:[530,116,44,208]},'default profile keeps its original side arrows');
 assert.deepEqual(nativeTheme,snapshot);
});

test('generated official two-face choice pages ten real discard candidates with ordered commit and stale guards',t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const dir=mkdtempSync(join(root,'official-choice-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildLuaData('data',join(dir,'abyss_data.lua'));
 buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true});
 const layout=JSON.parse(readFileSync(join(dir,'game-ui.json'),'utf8'));
 assert.equal(parts(all(layout).find(n=>n.name==='choicePanel')).filter(n=>/^card\d+$/.test(n.name)).length,2);
 const picker=all(layout).find(n=>n.name==='pickerView');
 const slots=parts(picker).filter(n=>/^card\d+$/.test(n.name));
 assert.equal(slots.length,6,'six semantic parents remain for camp and Match');
 assert.deepEqual(slots.slice(0,3).map(n=>n.position[0]),[-246,0,246]);
 for(const slot of slots.slice(3)){assert.equal(slot.visible,false);assert.deepEqual(slot.children,[]);}
 assert.equal(parts(parts(picker).find(n=>n.name==='forgeGrid')).length,12);
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const body=`
local generated=${luaString(dir.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
dofile('tests/lua/support/official_choice_pagination.lua')
dofile('tests/lua/support/official_node_picker_pagination.lua')
`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{
  cwd:process.cwd(),encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''},
 });
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/OFFICIAL_CHOICE_PAGINATION_PASS/);
 assert.match(result.stdout,/OFFICIAL_NODE_PICKER_PAGINATION_PASS/);
});
