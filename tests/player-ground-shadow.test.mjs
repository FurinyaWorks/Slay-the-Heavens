import test from 'node:test';import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,readFileSync,rmSync} from 'node:fs';import {join} from 'node:path';import {createRequire} from 'node:module';import {spawnSync} from 'node:child_process';
import {attachOfficialPortraits} from '../scripts/official-portraits.mjs';import {gameLayout} from '../scripts/game-ui-layout.mjs';import {withViewport} from '../scripts/viewport-layout.mjs';
import {buildUI} from '../scripts/build-ui.mjs';import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
const require=createRequire(import.meta.url),all=n=>[n,...(n.children??n.controls??[]).flatMap(all)];
test('official enabled hero gains exactly one non-input shadow at the approved solid foot bound',()=>{
 const before=withViewport(gameLayout(),nativeTheme),after=structuredClone(before);
 attachOfficialPortraits(before,{selectionAvatar:false,battlePortrait:true});
 attachOfficialPortraits(after,{selectionAvatar:false,battlePortrait:true,officialAssets:true});
 const shadow=all(after).find(n=>n.name==='groundShadow');assert(shadow,'approved full body has no ground shadow');
 const drawing=JSON.parse(readFileSync('art/characters/traveler-geo/idle-approved-v1/native-idle-210.json'));
 const rows=drawing.rows.filter(r=>r[17]>=128),floor=Math.min(...rows.map(r=>r[2]-r[4]/2)),feet=rows.filter(r=>r[2]-r[4]/2<=floor+4);
 const left=Math.min(...feet.map(r=>r[1]-r[3]/2)),right=Math.max(...feet.map(r=>r[1]+r[3]/2));
 const monster=JSON.parse(readFileSync('data/presentation/lowcost-enemy-art.json')).assets.lagavulin.shapes[0];
 assert.deepEqual(shadow.position,[(left+right)/2,floor]);assert.deepEqual(shadow.size,[right-left,(right-left)*monster.h/monster.w]);
 assert.equal(shadow.image,monster.image);assert.equal(shadow.colour,monster.colour);assert.equal(shadow.raycastTarget,false);
 const figure=all(after).find(n=>n.name==='officialFigure');assert.equal(figure.children[0],shadow,'shadow must precede every dynamic figure page');
 assert.equal(all(after).length,all(before).length+1);figure.children=[];assert.deepEqual(after,before,'all other controls, hits and transforms must remain identical');
 const disabled=withViewport(gameLayout(),nativeTheme);attachOfficialPortraits(disabled,{selectionAvatar:false,battlePortrait:false,officialAssets:true});
 assert(!all(disabled).some(n=>n.name==='groundShadow'||n.name==='officialFigure'));
});
test('actual approved portrait keeps foot anchoring, death alpha and shared lifecycle for its one shadow',()=>{
 mkdirSync('build',{recursive:true});const dir=mkdtempSync(join(process.cwd(),'build','ground-shadow-'));
 try{
  buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets:true});
  const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
  const body=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}..package.path
for _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..n..'.lua'))end
dofile('tests/lua/player_ground_shadow.lua')`;
  const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8',windowsHide:true,timeout:90000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
  assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/PLAYER_GROUND_SHADOW_PASS/);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
