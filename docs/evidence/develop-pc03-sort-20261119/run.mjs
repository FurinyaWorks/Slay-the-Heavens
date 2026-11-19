import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,relative,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildUI} from '../../../scripts/build-ui.mjs';
import {buildLuaData} from '../../../scripts/build-lua-data.mjs';
const base='62328bdac7703c3ab241e0ddb19e0fa05474f76a';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
assert.equal(git('diff',base,'--','src','scripts','data','config','tests','package.json','package-lock.json'),'');
const dir=relative(process.cwd(),fileURLToPath(new URL('.',import.meta.url))).replaceAll('\\','/');
const output=resolve(process.argv[2]??'/tmp/pc03-current');mkdirSync(output,{recursive:true});
const req=createRequire(resolve('package.json')),cli=req.resolve('fengari-node-cli/src/lua-cli.js');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const lfsInputs={};
for(const size of ['avatar96','battle133']){
 const p=`art/characters/traveler-geo/portraits/${size}/preview-native-1x.png`;
 const pointer=git('show',`${base}:${p}`),oid=pointer.match(/oid sha256:([a-f0-9]{64})/)[1],bytes=Number(pointer.match(/size (\d+)/)[1]);
 assert.equal(sha(p),oid);assert.equal(readFileSync(p).length,bytes);lfsInputs[p]={sha256:oid,bytes};
}
const report={baseCommit:base,baseTree:git('rev-parse',`${base}^{tree}`),node:process.version,platform:process.platform,
 lfsInputs,boundary:'Instrumented current-source offline Host only. Synthetic 60/200 card stress is not a supported-deck claim. No device, official import, ready, capacity or FPS proof.',
 timing:'Fengari Node os.clock calls process.uptime. Milliseconds are elapsed process measurements, not CPU or real PC latency. Comparator column includes table.sort and its instrumented callbacks; settle always runs five synthetic update/refresh steps.',profiles:{}};
for(const official of [false,true]){
 const key=official?'official-assets-nonrelease':'default-fallback',built=join(output,key);mkdirSync(built,{recursive:true});
 buildLuaData('data',join(built,'abyss_data.lua'));
 buildUI(built,undefined,{officialAssets:official,nativePageLifecycle:official});
 const expression=`package.path=${JSON.stringify(built+'/?.lua;./src/lua/?.lua')};dofile(${JSON.stringify(resolve(dir,'probe.lua'))})`;
 const result=spawnSync(process.execPath,[cli,'-e',expression],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024,
  env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:'',LUA_PATH:'',LUA_PATH_5_3:''}});
 const log=((result.stdout??'')+(result.stderr??'')).replaceAll(process.cwd()+'/', '<repo>/');
 writeFileSync(join(output,key+'.log'),log);process.stdout.write(log);assert.ifError(result.error);assert.equal(result.status,0);
 assert.match(result.stdout,/PC03_BASELINE_COMPLETED/);
 const rows=[...result.stdout.matchAll(/PC03_BASELINE profile=(\S+) cards=(\d+) mode=(\S+) sorts=(\d+) clickMs=([\d.]+) settleMs=([\d.]+) comparatorMs=([\d.]+) comparisons=(\d+) refreshCalls=(\d+) coverTrueCalls=(\d+)/g)].map(m=>({profile:m[1],cards:+m[2],mode:m[3],sorts:+m[4],clickMs:+m[5],settleMs:+m[6],comparatorMs:+m[7],comparisons:+m[8],refreshCalls:+m[9],coverTrueCalls:+m[10]}));
 assert.equal(rows.length,9);
 for(const [i,row]of rows.entries()){
  assert.equal(row.profile,official?'official-assets-first':'default');assert.equal(row.cards,[12,60,200][Math.floor(i/3)]);assert.equal(row.mode,['original','type','cost'][i%3]);
  assert.equal(row.sorts,5);assert.equal(row.refreshCalls,official?5:10);assert.equal(row.coverTrueCalls,official?0:15);
 }
 report.profiles[key]={sortOperations:45,observedSamePageCover:!official,rows,
  generated:Object.fromEntries(readdirSync(built).filter(p=>p.endsWith('.lua')||p==='game-ui.json').sort().map(p=>[p,sha(join(built,p))]))};
}
const inputs=['src/lua/abyss_deck_ui.lua','src/lua/abyss_game_ui.lua','src/lua/abyss_page_reveal.lua','src/lua/abyss_card_art_runtime.lua',
 'tests/lua/support/game_ui_fixture.lua',`${dir}/probe.lua`,`${dir}/run.mjs`];
report.inputs=Object.fromEntries(inputs.map(p=>[p,sha(p)]));
writeFileSync(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('PC03 observations PASS 90 sorts; default re-cover observed, official no re-cover; no latency acceptance');
