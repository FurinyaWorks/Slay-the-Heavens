import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {battleLayout} from '../scripts/ui-layout.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {officialAssetsTheme,applyOfficialAssets} from '../scripts/official-assets-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {attachLowCostArt,loadLowCostArt} from '../scripts/lowcost-art.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';
const require=createRequire(import.meta.url);
const extraRelics='art_of_war,black_blood,blood_vial,boot,bottled_flame,bottled_lightning,bottled_tornado,bronze_scales,burning_blood,centennial_puzzle,darkstone_periapt,eternal_feather,ginger,golden_idol,ink_bottle,lees_waffle,letter_opener,mango,maw_bank,molten_egg,oddly_smooth_stone,old_coin,omamori,orichalcum,ornamental_fan,pear,pen_nib,potion_belt,toxic_egg,toy_ornithopter,turnip,war_paint,whetstone'.split(',');
const children=n=>n.controls??n.children??[];
function pools(tree){const found=[];function walk(n,path=''){path+='/'+n.name;
 if(['bottleArt','rewardIconArt'].includes(n.name)||n.name==='iconArt'&&/\/potion\d\//.test(path))found.push({path,node:n});
 for(const c of children(n))walk(c,path);
}walk(tree);return found;}

test('potion pools are bounded to live owners, leave the default profile and old registries unchanged',t=>{
 const plain=[battleLayout(),gameLayout()];assert.deepEqual(plain.map(pools).map(p=>p.length),[0,0]);
 const trees=[battleLayout(),withViewport(gameLayout(),nativeTheme)];applyOfficialAssets(trees,officialAssetsTheme(nativeTheme));
 assert.deepEqual(trees.map(pools).map(p=>p.length),[26,49]);
 for(const tree of trees){const before=JSON.stringify(tree);attachLowCostArt(tree);assert.equal(JSON.stringify(tree),before,'idempotent imported pools');
  for(const {path,node}of pools(tree)){assert.equal(node.children.length,path.includes('/relicReward')?16:10,path);assert.equal(node.raycastTarget,false);assert(node.children.every(n=>n.raycastTarget===false));assert(!path.includes('potionHelp1/'));}
 }
 const art=loadLowCostArt();assert.equal(Object.keys(art.relic.assets).length,121);assert.equal(Object.keys(art.enemy.assets).length,42);assert.equal(Object.keys(art.potion.assets).length,42);
 const id=v=>typeof v==='object'?v.id:v;
 const wanted=JSON.parse(readFileSync('data/relics.json','utf8')).relics.filter(r=>id(nativeTheme.officialAssets.battleRelicIcons[r.id]??nativeTheme.icon.relic[r.id])===102028).map(r=>r.id).sort();
 assert.equal(wanted.length,88);assert.deepEqual(Object.keys(art.relic.assets).sort(),[...wanted,...extraRelics].sort());
 assert.equal(createHash('sha256').update(JSON.stringify(Object.fromEntries(wanted.map(id=>[id,art.relic.assets[id]])))).digest('hex'),'1f8732b6833e137e19bcf76ddff08e1ec91dba99e3320f7d9b874aa2089fd115','all original 88 complete assets stay unchanged');
 assert.equal(new Set(extraRelics.map(id=>JSON.stringify(art.relic.assets[id].shapes.map(({colour,...shape})=>shape)))).size,33,'new glyphs differ without colour');
 for(const [kind,sha]of [['enemy','0244dc45e5bc69f5c912c89469f2f5025073c6e7dd706d47da0754c60907f89f']])
  assert.equal(createHash('sha256').update(readFileSync(`data/presentation/lowcost-${kind}-art.json`,'utf8').replaceAll('\r\n','\n')).digest('hex'),sha);
 t.diagnostic('official complete Host potion47/517 + relic-reward2/34 =49 pools/551 controls; standalone battle potion24/264 + relic-reward2/34 =26/298; default +0. Offline counts, not FPS.');
});

test('reward semantic art short Host preserves potion binding and paints both relic rows with source aliases',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-reward-runtime-'));
 try{
  buildLuaData('data',join(directory,'abyss_data.lua'));buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',"dofile('tests/helpers/reward-art-runtime.lua')"],{
   encoding:'utf8',timeout:60000,maxBuffer:1024*1024,env:{...process.env,LUA_PATH:directory.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;'},
  });
  assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));assert.match(result.stdout,/REWARD_ART_RUNTIME_PASS 2 4/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});

test('42 recipes in native pool and six representatives across four paths',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-potion-runtime-'));
 try{
  buildLuaData('data',join(directory,'abyss_data.lua'));buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
  const cli=require.resolve('fengari-node-cli/src/lua-cli.js');
  const result=spawnSync(process.execPath,[cli,'-e',"dofile('tests/helpers/potion-art-runtime.lua')"],{
   encoding:'utf8',timeout:60000,maxBuffer:1024*1024,env:{...process.env,LUA_PATH:directory.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;'},
  });
  assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));assert.match(result.stdout,/POTION_ART_RUNTIME_PASS 42_GENERIC 4_PATHS 6_SAMPLES/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});

test('relic native fallback survives unavailable pools in shop, treasure, single and list owners',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-relic-fallback-'));
 try{
  buildLuaData('data',join(directory,'abyss_data.lua'));buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',"dofile('tests/helpers/relic-fallback-runtime.lua')"],{
   encoding:'utf8',timeout:60000,maxBuffer:1024*1024,env:{...process.env,LUA_PATH:directory.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;'},
  });
  assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));assert.match(result.stdout,/RELIC_FALLBACK_CASES 25 0/);assert.match(result.stdout,/RELIC_FALLBACK_RUNTIME_PASS 4_SURFACES 2_SETS 3_FAILURES/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});

test('formal relic source aliases share canonical native and semantic reward mapping without state writes',()=>{
 const directory=mkdtempSync(join(tmpdir(),'abyss-reward-alias-'));
 try{
  buildLuaData('data',join(directory,'abyss_data.lua'));buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',"dofile('tests/helpers/reward-alias-runtime.lua')"],{
   encoding:'utf8',timeout:60000,maxBuffer:1024*1024,env:{...process.env,LUA_PATH:directory.replaceAll('\\','/')+'/?.lua;./src/lua/?.lua;;'},
  });
  assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));assert.match(result.stdout,/REWARD_ALIAS_FULL_RUN_RNG_UNCHANGED/);assert.match(result.stdout,/REWARD_ALIAS_RUNTIME_PASS 13_ALIASES 2_ROWS 4_STATES 139_CHECKS/);
 }finally{rmSync(directory,{recursive:true,force:true});}
});
