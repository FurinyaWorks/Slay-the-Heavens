import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,toLua,luaString} from '../scripts/build-lua-data.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {page} from '../scripts/official-assets-preview.mjs';

test('final official build preserves approved resource type without shrinking to old size',()=>{
 const out=resolve('build/official-resource-readability');mkdirSync(out,{recursive:true});
 const generated=join(out,'generated');mkdirSync(generated,{recursive:true});
 buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,{officialAssets:true});
 const modules=readdirSync(generated).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const capture=join(out,'capture.lua');
 writeFileSync(capture,`for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(${luaString(generated.replaceAll('\\','/'))}..'/'..name..'.lua'))end\ndofile('tests/lua/official_resource_readability.lua')\n`);
 const result=runLua(capture);writeFileSync(join(out,'capture.log'),result.stdout+result.stderr);
 assert.equal(result.status,0,(result.stderr||result.stdout).slice(-3000));
 const records=result.stdout.split('\n').filter(s=>s.startsWith('UI_READABILITY\t')).map(s=>JSON.parse(s.split('\t')[2]));
 assert.equal(records.length,3);
 const scenes=JSON.parse(result.stdout.split('\n').find(s=>s.startsWith('OFFICIAL_VISUAL_SCENES ')).slice(23));
 writeFileSync(join(out,'scenes.json'),JSON.stringify(scenes,null,2));
 for(const scene of scenes)writeFileSync(join(out,scene.name+'.html'),page(scene));
 for(const record of records){
  const values=record.nodes.filter(n=>/^(?:\/battlePanel\/(?:player|piles)|\/mapPanel\/resources\/(?:hp|gold)|\/nodePanel\/(?:hp|gold))$/.test(n.path)&&n.visible);
  assert.equal(values.length,2,'each actual run page must expose both resources');
  for(const value of values){
   assert.equal(value.font,18,'preserve approved official number style');
   assert.equal(value.minimum,value.font,`${value.path}: critical number must not shrink`);
   assert.ok([...value.text].length*.6*value.font+4<=value.size[0],`${value.path}: full exact value exceeds its own slot`);
   assert.ok(value.size[1]>=value.font*1.45+4,`${value.path}: no native line`);
  }
 }
 const layout=JSON.parse(readFileSync(join(generated,'game-ui.json'),'utf8'));
 const child=(node,name)=>(node.children??node.controls??[]).find(n=>n.name===name);
 const battle=child(child(layout,'stage'),'battlePanel'),hints=child(battle,'resourceHints');
 const bounds=(node,parent=[0,0])=>{const [x,y]=node.position??[0,0],[w,h]=node.size;return [x+parent[0]-w/2,y+parent[1]-h/2,x+parent[0]+w/2,y+parent[1]+h/2];};
 const clear=(a,b)=>a[2]<=b[0]||b[2]<=a[0]||a[3]<=b[1]||b[3]<=a[1];
 const controls=[child(hints,'hp'),child(hints,'gold')],help=child(battle,'potionHelp');
 for(let i=1;i<=5;i++)controls.push(child(help,'potionHelp'+i));
 controls.push(child(battle,'title'));
 const bar=child(battle,'topBar'),route=child(bar,'battleRoute');
 controls.push({...route,position:[route.position[0]+bar.position[0],route.position[1]+bar.position[1]]});
 for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++)assert.ok(clear(bounds(controls[i]),bounds(controls[j])),`${controls[i].name} overlaps ${controls[j].name}`);
 for(const [name,value]of [['hp','player'],['gold','piles']]){
  const hit=bounds(child(hints,name)),text=bounds(child(battle,value));
  assert.ok(hit[0]<=text[0]&&hit[2]>=text[2]&&hit[1]<=text[1]&&hit[3]>=text[3],name+' exact value outside readout hit');
 }
 assert.match(result.stdout,/OFFICIAL_RESOURCE_READABILITY_PASS/);
});
