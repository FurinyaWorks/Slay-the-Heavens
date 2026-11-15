import {mkdirSync,mkdtempSync,readdirSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {buildUI} from '../../scripts/build-ui.mjs';
import {buildLuaData,luaString} from '../../scripts/build-lua-data.mjs';
import {runLua} from '../../scripts/test-lua.mjs';

// Own generated modules without changing another test's shared profile.
export function runIsolatedBattleRegression(script,options={}){
 mkdirSync('build',{recursive:true});
 const directory=mkdtempSync(join(process.cwd(),'build','battle-regression-'));
 try{
  buildLuaData('data',join(directory,'abyss_data.lua'));
  buildUI(directory,undefined,options);
  const modules=readdirSync(directory).filter(name=>name.endsWith('.lua'));
  const wrapper=join(directory,'regression.lua');
  writeFileSync(wrapper,`package.path=${luaString(directory.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}..package.path\n`
   +modules.map(name=>`require(${luaString(name.slice(0,-4))})`).join('\n')
   +`\ndofile(${luaString(script)})\n`);
  return runLua(wrapper);
 }finally{rmSync(directory,{recursive:true,force:true});}
}
