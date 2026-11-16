import {readFileSync,writeFileSync}from'node:fs';import{resolve,join}from'node:path';import{spawnSync}from'node:child_process';
const root=resolve('task111-formal-inventory-0049/repo'),out=resolve('task111-v4-omit-probe-0110');
const source=readFileSync(join(root,'tests/lua/competition_character_admission.lua'),'utf8');
const scoped=source.slice(0,source.indexOf('local development='))+source.slice(source.indexOf("local F=dofile"),source.indexOf('-- Execute the actual entry'))+"\nprint('SCOPED_PUBLIC_SELECTION_HOST_PASS; art adapters/native actual entry NOT_TESTED')\n";
writeFileSync(join(out,'scoped-public.lua'),scoped);
const results=[];for(const profile of ['include','omit']){const p=join(out,profile,'?.lua');const r=spawnSync(process.execPath,[join(root,'node_modules/fengari-node-cli/src/lua-cli.js'),'-e',`package.path=${JSON.stringify(p)};package.cpath='';dofile(${JSON.stringify(join(out,'scoped-public.lua'))})`],{cwd:root,encoding:'utf8',timeout:75000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});writeFileSync(join(out,profile+'-scoped-public.log'),r.stdout+'\n'+r.stderr);results.push({profile,status:r.status,error:r.error?.message});}
writeFileSync(join(out,'scoped-results.json'),JSON.stringify(results,null,2)+'\n');console.log(results);
