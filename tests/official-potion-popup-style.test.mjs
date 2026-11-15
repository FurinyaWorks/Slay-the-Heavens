import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,readdirSync,rmSync,realpathSync} from 'node:fs';
import {join,relative,isAbsolute} from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {battleLayout} from '../scripts/ui-layout.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {officialAssetsTheme,applyOfficialAssets} from '../scripts/official-assets-layout.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url),parts=n=>n.children??n.controls??[];
const all=n=>[n,...parts(n).flatMap(all)];
const trees=()=>[battleLayout(),withViewport(gameLayout(),nativeTheme),deckCardTemplate()];
const popup=n=>all(n).find(c=>c.name==='potionPopup');
function removePopups(node){
 for(const key of ['children','controls'])if(node[key]){node[key]=node[key].filter(n=>n.name!=='potionPopup');for(const c of node[key])removePopups(c);}
 return node;
}
test('official standalone and full Host popup retain the complete shared native rectangle and action states',()=>{
 const roots=trees(),expected=roots.slice(0,2).map(n=>structuredClone(popup(n)));
 applyOfficialAssets(roots,officialAssetsTheme(nativeTheme));
 for(const [i,root]of roots.slice(0,2).entries()){
  assert.deepEqual(popup(root),expected[i],'popup material transformation changed source tokens, geometry, text or hit controls');
  for(const image of all(popup(root)).filter(n=>n.kind==='image'))assert.equal(image.image,nativeTheme.image.rect);
 }
});
test('popup protection does not change any non-popup control/template or the original default source trees',()=>{
 const source=trees(),original=structuredClone(source),withPopup=structuredClone(source),withoutPopup=structuredClone(source).map(removePopups);
 applyOfficialAssets(withPopup,officialAssetsTheme(nativeTheme));applyOfficialAssets(withoutPopup,officialAssetsTheme(nativeTheme));
 assert.deepEqual(withPopup.map(removePopups),withoutPopup,'preserving the popup must not alter the rest of the official trees');
 assert.deepEqual(source,original,'default source must remain complete and unmodified');
 assert.deepEqual(trees(),original,'official styling must not mutate global default theme/constructors');
});
for(const officialAssets of [false,true])test(`${officialAssets?'official':'default'} popup keeps explicit use/discard, target selection and stale input ownership`,()=>{
 const temp=realpathSync.native(tmpdir()),dir=mkdtempSync(join(temp,'potion-popup-'));
 try{
  mkdirSync(dir,{recursive:true});buildLuaData('data',join(dir,'abyss_data.lua'));buildUI(dir,undefined,{officialAssets});
  const modules=readdirSync(dir).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
  const body=`package.path=${luaString(dir.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}..package.path
for _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(dir.replaceAll('\\','/')+'/')}..n..'.lua'))end
dofile('tests/lua/approved_main_potions.lua')`;
  const r=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',body],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
  assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/APPROVED_MAIN_POTIONS_PASS/);
 }finally{const target=realpathSync.native(dir),within=relative(temp,target);assert(!isAbsolute(within)&&within.startsWith('potion-popup-')&&!within.startsWith('..'));rmSync(target,{recursive:true,force:true});}
});
