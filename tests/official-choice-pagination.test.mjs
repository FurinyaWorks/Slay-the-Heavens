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

test('official choice reuses a five-column native card grid and keeps the legacy layout available',()=>{
 const snapshot=structuredClone(nativeTheme),official=officialAssetsTheme(nativeTheme);
 assert.equal(cards(nativeTheme).length,10);
 assert.equal(cards(official).length,0,'no card faces are serialized into the choice panel');
 const panel=experimentalCharacterControls(official).find(n=>n.name==='choicePanel');
 const grid=parts(panel).find(n=>n.name==='cards');
 assert.equal(grid.kind,'grid');
 assert.equal(grid.itemTemplate,'AbyssDeckCard');
 assert.equal(grid.grid.columns,5);
 assert.equal(grid.grid.horizontal,false);
 const [top,bottom,left,right]=grid.grid.padding;
 const [width,height]=grid.grid.itemSize, [gapX,gapY]=grid.grid.spacing;
 assert.ok(grid.size[0]>=5*width+4*gapX+left+right,'five complete cards fit per row');
 assert.equal(grid.size[1],2*height+gapY+top+bottom,'two full rows start in view');
 assert.ok(!parts(panel).some(n=>n.name==='face'||n.name==='border'));
 assert.deepEqual(official.layout.nativeNode.forge,nativeTheme.layout.nativeNode.forge);
 assert.deepEqual(official.layout.nativeNode.picker,{...nativeTheme.layout.nativeNode.picker,columns:[-246,0,246]});
 assert.deepEqual(nativeTheme,snapshot);
});

test('generated official pickers use the intended native receivers',async t=>{
 const root=resolve('.artifacts/test-tmp');mkdirSync(root,{recursive:true});
 const dir=mkdtempSync(join(root,'official-choice-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 buildLuaData('data',join(dir,'abyss_data.lua'));
 buildUI(dir,undefined,{officialAssets:true,nativePageLifecycle:true});
 const layout=JSON.parse(readFileSync(join(dir,'game-ui.json'),'utf8'));
 const choice=all(layout).find(n=>n.name==='choicePanel');
 assert.equal(parts(choice).find(n=>n.name==='cards').itemTemplate,'AbyssDeckCard');
 assert.equal(parts(choice).filter(n=>/^card\d+$/.test(n.name)).length,0);
 for(const name of ['confirm','before','after','option1','option2']){
  const hit=parts(parts(choice).find(n=>n.name===name)).find(n=>n.name==='hit');
  assert.ok(parts(hit).every(state=>parts(state).some(n=>n.name==='roundedButton')));
 }
 const picker=all(layout).find(n=>n.name==='pickerView');
 const slots=parts(picker).filter(n=>/^card\d+$/.test(n.name));
 assert.equal(slots.length,6,'six semantic parents remain for camp and Match');
 assert.deepEqual(slots.slice(0,3).map(n=>n.position[0]),[-246,0,246]);
 for(const slot of slots.slice(3)){assert.equal(slot.visible,false);assert.deepEqual(slot.children,[]);}
 assert.equal(parts(parts(picker).find(n=>n.name==='forgeGrid')).length,12);
 const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const prelude=`
local generated=${luaString(dir.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
`;
 function runFixture(name,expected){
  const body=prelude+`dofile('tests/lua/support/${name}.lua')`;
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{
   cwd:process.cwd(),encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''},
  });
  assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
  assert.match(result.stdout,expected);
 }
 await t.test('combat choices scroll, retain ordered selection, and reject stale gestures',()=>
  runFixture('official_choice_pagination',/OFFICIAL_CHOICE_GRID_PASS/));
 await t.test('room pickers and Match preserve their existing flows',()=>
  runFixture('official_node_picker_pagination',/OFFICIAL_NODE_PICKER_PAGINATION_PASS/));
});
