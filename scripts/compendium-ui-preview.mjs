import {mkdirSync,writeFileSync,readdirSync,readFileSync,openSync,closeSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {buildUI} from './build-ui.mjs';
import {buildLuaData,toLua,luaString} from './build-lua-data.mjs';
import {page} from './official-assets-preview.mjs';

const out=resolve('build/compendium-preview');mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url);
const all=[];
for(const [profile,options]of [['native',{}],['official',{officialAssets:true}],['v25',{v25BattleChrome:true}]]){
 const generated=join(out,profile);mkdirSync(generated,{recursive:true});
 buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,options);
 const modules=readdirSync(generated).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const capture=join(generated,'capture.lua');
 const scenePath=join(generated,'raw-scenes.log');
 writeFileSync(capture,`for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(${luaString(generated.replaceAll('\\','/'))}..'/'..name..'.lua'))end\ndofile('tests/lua/compendium_ui_preview.lua')\n`);
 // Full card trees are artifacts, not console diagnostics. Stream them without
 // changing the existing Lua execution timeout or test-runner buffer contract.
 const fd=openSync(scenePath,'w');let result;
 try{result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',`dofile(${luaString(capture.replaceAll('\\','/'))})`],{
  stdio:['ignore',fd,'pipe'],encoding:'utf8',timeout:90000,
  env:{...process.env,LUA_PATH:'./build/lua/?.lua;./src/lua/?.lua;;',LUA_PATH_5_3:'./build/lua/?.lua;./src/lua/?.lua;;',LUA_INIT:'',LUA_INIT_5_3:''}});
 }finally{closeSync(fd);}
 assert.equal(result.status,0,result.error?.message??result.stderr);
 const scenes=JSON.parse(readFileSync(scenePath,'utf8').split('\n').find(line=>line.startsWith('OFFICIAL_VISUAL_SCENES ')).slice(23));
 for(const scene of scenes){
  scene.name=profile+'-'+scene.name;
  scene.provenance+='; diagnostic CSS clips Grid and paints declared shade only; fixed SCP font sizes are drawn without browser auto-shrink, not proof of native font rendering';
  const diagnostic=structuredClone(scene);
  const lockPopupFonts=(node,path='')=>{
   path+='/'+node.name;
   if(path.includes('/popup/face/')&&['name','label','cost','type'].includes(node.name)&&node.text)node.text.minFontSize=node.text.fontSize;
   for(const child of Array.isArray(node.children)?node.children:[])lockPopupFonts(child,path);
  };
  lockPopupFonts(diagnostic.tree);
  const html=page(diagnostic).replace('</style>','[data-kind="grid"]{overflow:hidden}[data-path$="/popup/shade"]{background:#080B12}.text>span{display:block;min-width:0;width:100%}</style>');
  writeFileSync(join(out,scene.name+'.html'),html);all.push(scene);
 }
}
writeFileSync(join(out,'scenes.json'),JSON.stringify(all,null,2));
console.log(`Compendium real Host previews: ${all.length} scenes, native/official/V25, ${out}`);
