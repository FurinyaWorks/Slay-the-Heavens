import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildUI} from '../../../scripts/build-ui.mjs';
import {buildLuaData} from '../../../scripts/build-lua-data.mjs';
const base='b1669c6db9d268f897f5380523bb82595279cdcf';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
assert.equal(git('diff',base,'--','src','scripts','data','config','tests','package.json','package-lock.json'),'');
const dir=relative(process.cwd(),fileURLToPath(new URL('.',import.meta.url))).replaceAll('\\','/');
const output=resolve(process.argv[2]??'/tmp/pc11-current');mkdirSync(output,{recursive:true});
const req=createRequire(resolve('package.json')),cli=req.resolve('fengari-node-cli/src/lua-cli.js');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const lfsInputs={};
for(const size of ['avatar96','battle133']){
 const p=`art/characters/traveler-geo/portraits/${size}/preview-native-1x.png`;
 const pointer=git('show',`${base}:${p}`),oid=pointer.match(/oid sha256:([a-f0-9]{64})/)[1],bytes=Number(pointer.match(/size (\d+)/)[1]);
 assert.equal(sha(p),oid);assert.equal(readFileSync(p).length,bytes);lfsInputs[p]={sha256:oid,bytes};
}
const report={baseCommit:base,baseTree:git('rev-parse',`${base}^{tree}`),node:process.version,platform:process.platform,
 lfsInputs, boundary:'Current-source offline Host/navigation only; no official device, GIL, ready, combat or two-act proof',profiles:{}};
for(const official of [false,true]){
 const key=official?'official-assets-nonrelease':'default-fallback',built=join(output,key);mkdirSync(built,{recursive:true});
 buildLuaData('data',join(built,'abyss_data.lua'));
 buildUI(built,undefined,{officialAssets:official,nativePageLifecycle:official});
 const expression=`package.path=${JSON.stringify(built+'/?.lua;./src/lua/?.lua')};dofile(${JSON.stringify(resolve(dir,'probe.lua'))})`;
 const result=spawnSync(process.execPath,[cli,'-e',expression],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:'',LUA_PATH:'',LUA_PATH_5_3:''}});
 const log=((result.stdout??'')+(result.stderr??'')).replaceAll(process.cwd()+'/', '<repo>/');
 writeFileSync(join(output,key+'.log'),log);process.stdout.write(log);assert.ifError(result.error);assert.equal(result.status,0);
 assert.match(result.stdout,/PC11_CURRENT_OBSERVATIONS_PASS 4/);
 assert.match(result.stdout,official?/PC11_SINGLE_ENTRY_REQUIREMENT_FAIL/:/PC11_DEFAULT_FALLBACK_PASS/);
 report.profiles[key]={observations:'4/4',singleRouteEntryRequirement:official?'FAIL':'PASS',
  generated:Object.fromEntries(readdirSync(built).filter(p=>p.endsWith('.lua')||p==='game-ui.json').sort().map(p=>[p,sha(join(built,p))]))};
}
const inputs=['src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_navigation_view.lua','src/lua/abyss_game_ui_overlays.lua',
 'tests/lua/support/game_ui_fixture.lua','tests/lua/support/map_routes.lua',`${dir}/probe.lua`,`${dir}/run.mjs`];
report.inputs=Object.fromEntries(inputs.map(p=>[p,sha(p)]));
writeFileSync(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('PC11 observations 8/8; official duplicate FAIL, default fallback PASS');
