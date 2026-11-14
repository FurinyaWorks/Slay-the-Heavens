import {mkdirSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {buildUI} from './build-ui.mjs';
import {buildLuaData,toLua,luaString} from './build-lua-data.mjs';
import {runLua} from './test-lua.mjs';
import {page} from './official-assets-preview.mjs';

const out=resolve('build/compendium-preview');mkdirSync(out,{recursive:true});
const all=[];
for(const [profile,options]of [['native',{}],['official',{officialAssets:true}],['v25',{v25BattleChrome:true}]]){
 const generated=join(out,profile);mkdirSync(generated,{recursive:true});
 buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,options);
 const modules=readdirSync(generated).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const capture=join(generated,'capture.lua');
 writeFileSync(capture,`for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(${luaString(generated.replaceAll('\\','/'))}..'/'..name..'.lua'))end\ndofile('tests/lua/compendium_ui_preview.lua')\n`);
 const result=runLua(capture);assert.equal(result.status,0,result.stdout+result.stderr);
 const scenes=JSON.parse(result.stdout.split('\n').find(n=>n.startsWith('OFFICIAL_VISUAL_SCENES ')).slice(23));
 for(const scene of scenes){scene.name=profile+'-'+scene.name;writeFileSync(join(out,scene.name+'.html'),page(scene));all.push(scene);}
}
writeFileSync(join(out,'scenes.json'),JSON.stringify(all,null,2));
console.log(`Compendium real Host previews: ${all.length} scenes, native/official/V25, ${out}`);
