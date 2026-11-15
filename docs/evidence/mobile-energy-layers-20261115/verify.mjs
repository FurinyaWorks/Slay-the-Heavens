// Bounded deferred-patch experiment; never installs a dependency into src/.
import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const repo=process.cwd(),here=fileURLToPath(new URL('.',import.meta.url));
const at=process.argv.indexOf('--dependency-root');
if(at<0||!process.argv[at+1])throw Error('Pass --dependency-root pointing to the exact #672 source snapshot');
const dependency=resolve(process.argv[at+1]);
const out=resolve('.artifacts/mobile-energy-layers-develop-1115/verification');mkdirSync(out,{recursive:true});
const blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length)).update(Buffer.from([0])).update(bytes).digest('hex');
const lf=bytes=>Buffer.from(bytes.toString('utf8').replaceAll(String.fromCharCode(13,10),String.fromCharCode(10)));
const rawBefore=readFileSync(join(dependency,'src/lua/abyss_mobile_hud.lua'));
const before=lf(rawBefore);
if(blob(before)!=='7b5c7f688715773fedfd97400f16ea6d00d41b38')throw Error('Dependency source drift: refresh the patch review instead of guessing');
// This exact experiment's Release comparison requires identical runtime inputs.
execFileSync('git',['diff','--exit-code','36b9b157ee6f05b65eb9f1da7e2978647d36c210','HEAD','--','src','scripts','data','art','config','package.json','package-lock.json']);
const staged=join(out,'staged');mkdirSync(join(staged,'src/lua'),{recursive:true});
const patched=join(staged,'src/lua/abyss_mobile_hud.lua');writeFileSync(patched,before);
const patch=join(here,'energy-layers.patch'),prefix=relative(repo,staged).replaceAll(String.fromCharCode(92),'/');
execFileSync('git',['apply','--check',`--directory=${prefix}`,patch]);
execFileSync('git',['apply',`--directory=${prefix}`,patch]);
const require=createRequire(import.meta.url),cli=require.resolve('fengari-node-cli/src/lua-cli.js');
const results=[];
for(const [label,source,cases]of [
 ['release',repo,[[false,false,0],[true,false,0]]],
 ['pr672',dependency,[[true,false,1],[true,true,0],[false,true,0]]],
]){
 const {buildUI}=await import(pathToFileURL(join(source,'scripts/build-ui.mjs')));
 const {buildLuaData,luaString,toLua}=await import(pathToFileURL(join(source,'scripts/build-lua-data.mjs')));
 const generated=join(out,label);mkdirSync(generated,{recursive:true});
 try{process.chdir(source);buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,{officialAssets:true});}
 finally{process.chdir(repo);}
 const modules=readdirSync(generated).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 for(const [touch,usePatch,expected]of cases){
  const script=`local generated=${luaString(generated.replaceAll(String.fromCharCode(92),'/'))}
package.path=generated..'/?.lua;'..${luaString(source.replaceAll(String.fromCharCode(92),'/'))}..'/src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
${usePatch?`package.preload.abyss_mobile_hud=assert(loadfile(${luaString(patched.replaceAll(String.fromCharCode(92),'/'))}))`:''}
M17_TOUCH=${touch};M17_HAS_MOBILE=${label==='pr672'};M17_PATCHED=${usePatch}
dofile(${luaString(join(here,'energy-layers.lua').replaceAll(String.fromCharCode(92),'/'))})`;
  const r=spawnSync(process.execPath,[cli,'-e',script],{cwd:repo,encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,windowsHide:true,
   env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
  const log=join(out,`${label}-${touch}-${usePatch?'patched':'original'}.log`);
  writeFileSync(log,(r.stdout??'')+(r.stderr??'')+String(r.error??''));
  const matched=r.status===expected&&(expected!==1||r.stderr.includes('M17_ENERGY_LAYER_RED'));
  const row={label,touch,usePatch,expected,status:r.status,matched,log:relative(repo,log)};results.push(row);console.log(JSON.stringify(row));
 }
}
const receipt={schemaVersion:1,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 dependencyRevision:'1f7ce04c53189db8c39b59c797a45d57a2c7bac1',rawBeforeBlob:blob(rawBefore),beforeBlob:blob(before),afterBlob:blob(lf(readFileSync(patched))),results};
writeFileSync(join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
if(results.some(r=>!r.matched))process.exitCode=1;
