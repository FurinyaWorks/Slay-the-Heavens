import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=resolve('task111-formal-inventory-0049/repo'),out=resolve('task111-v4-omit-probe-0110');
const {candidateScriptFiles,generatedModules}=await import(join(root,'scripts/native-candidate-scripts.mjs'));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const excluded='abyss_original_v4_data';
const full=candidateScriptFiles(join(root,'src/lua'),join(root,'build/formal'));
const omit=candidateScriptFiles(join(root,'src/lua'),join(root,'build/formal'),generatedModules.filter(n=>n!==excluded));
const rows=fs=>fs.map(f=>({name:f.name,bytes:readFileSync(f.sourceFile).length,sha256:hash(f.sourceFile)}));
const before=rows(full),after=rows(omit);
if(JSON.stringify(before.filter(f=>f.name!==excluded))!==JSON.stringify(after))throw Error('Non-omit difference');
for(const [name,files]of [['include',full],['omit',omit]]){
 mkdirSync(join(out,name),{recursive:true});
 for(const f of files)copyFileSync(f.sourceFile,join(out,name,f.name+'.lua'));
 for(const name2 of ['abyss_ui_layout','abyss_ui_templates'])copyFileSync(join(root,'build/formal',name2+'.lua'),join(out,name,name2+'.lua'));
}
const manifest={sourceCommit:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),generatedDirectory:'build/formal',before,after,onlyOmitted:before.filter(f=>f.name===excluded),remainingEqual:true,testBridges:['abyss_ui_layout','abyss_ui_templates'],officialSDK:'NOT_RUN',officialCapacity:'UNVERIFIED'};
writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const cli=join(root,'node_modules/fengari-node-cli/src/lua-cli.js');
const results=[];
for(const profile of ['include','omit']){
 const luaPath=join(out,profile,'?.lua');
 const cases=[['geo',`dofile('tests/lua/geo_public_entry.lua')`],['v4',`local ok,err=pcall(function() return require('abyss_original_v4_profiles').prepare(require('abyss_data'),'raiden') end); print('V4_PREPARE',ok,tostring(err)); ${profile==='include'?"assert(ok)":"assert(not ok and tostring(err):find(\"module 'abyss_original_v4_data' not found\",1,true))"}`]];
 for(const [kind,code]of cases){
  const start=Date.now();
  const r=spawnSync(process.execPath,[cli,'-e',`package.path=${JSON.stringify(luaPath)}; package.cpath=''; ${code}`],{cwd:root,encoding:'utf8',timeout:75000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:'',LUA_PATH:luaPath,LUA_PATH_5_3:luaPath}});
  writeFileSync(join(out,`${profile}-${kind}.log`),(r.stdout||'')+'\n'+(r.stderr||''));
  const result={profile,kind,status:r.status,signal:r.signal,error:r.error?.message,ms:Date.now()-start};results.push(result);console.log(JSON.stringify(result));
 }
}
manifest.sourceFilesUnchanged=JSON.stringify(rows(full))===JSON.stringify(before);
manifest.results=results;writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
