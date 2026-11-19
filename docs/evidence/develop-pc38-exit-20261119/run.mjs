// Offline evidence only. Deliberately not scripts/test-lua.mjs: no historical prelude.
import assert from 'node:assert/strict';
import {spawnSync,execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const base='2ec45b9e52c870badc4d4888f6243a30556eecb4';
const dir=relative(process.cwd(),fileURLToPath(new URL('.',import.meta.url))).replaceAll('\\','/');
const out=resolve(process.argv[2]??'/tmp/pc38-current');mkdirSync(out,{recursive:true});
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
// No changed tracked product, builder, test-fixture or configuration bytes may pass.
assert.equal(git('diff',base,'--','src','scripts','data','config','tests','package.json','package-lock.json'),'');
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const layout=JSON.parse(readFileSync('build/lua/game-ui.json','utf8'));
const find=(items,name)=>items.find(x=>x.name===name);
const stage=find(layout.controls,'stage');const controls=stage?.children??layout.controls;
const exit=find(controls,'exitPanel'),menu=find(controls,'runMenu');
const paths=['exitPanel/help','exitPanel/guide','runMenu/help'].filter(p=>{
 const [panel,name]=p.split('/');return find((panel==='exitPanel'?exit:menu).children,name);
});
assert.deepEqual(paths,['exitPanel/help','exitPanel/guide','runMenu/help']);
for(const name of ['cancel','confirm'])assert.ok(find(exit.children,name));
const req=createRequire(resolve('package.json'));
const cli=req.resolve('fengari-node-cli/src/lua-cli.js');
const probe=`${dir}/probe.lua`;
const expression=`dofile(${JSON.stringify(resolve(probe))})`;
const env={...process.env,LUA_PATH:'./build/lua/?.lua;./src/lua/?.lua;;',LUA_PATH_5_3:'./build/lua/?.lua;./src/lua/?.lua;;',LUA_INIT:'',LUA_INIT_5_3:''};
const result=spawnSync(process.execPath,[cli,'-e',expression],{cwd:process.cwd(),env,encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
const sanitize=s=>s.replaceAll(process.cwd()+'/', '<repo>/');
const log=sanitize((result.stdout??'')+(result.stderr??''));
writeFileSync(resolve(out,'host.log'),log);process.stdout.write(log);
assert.ifError(result.error);assert.equal(result.status,0);
assert.match(result.stdout,/PC38_CURRENT_OBSERVATIONS_PASS 4/);
assert.match(result.stdout,/PC38_REMOVAL_REQUIREMENT_FAIL/);
const files=['scripts/exit-ui-layout.mjs','scripts/controls-guide-layout.mjs','src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_overlays.lua','src/lua/abyss_game_ui_navigation.lua','tests/lua/support/game_ui_fixture.lua',probe,`${dir}/run.mjs`];
const built=readdirSync('build/lua').filter(x=>x.endsWith('.lua')||x==='game-ui.json').sort().map(x=>'build/lua/'+x);
const report={schemaVersion:1,baseCommit:base,baseTree:git('rev-parse',`${base}^{tree}`),node:process.version,platform:process.platform,
 boundary:'Linux Fengari + real current Lua Host + generated default UI + mock native controls; not official PC/device/ready evidence',
 runner:'direct fengari-node-cli -e dofile(probe.lua), no historical source projection or preloads',
 productTrackedDiffAgainstBase:'empty',layoutHelpPaths:paths,hostObservations:{passed:4,total:4},pc38RemovalRequirement:'FAIL',
 unchangedExitPaths:'abandon cancellation/confirmation, platform cancellation/failed retry/dedup passed offline',
 inputs:Object.fromEntries(files.map(p=>[p,sha(p)])),generated:Object.fromEntries(built.map(p=>[p,sha(p)]))};
writeFileSync(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log('PC38_REPORT '+JSON.stringify({base,observations:'4/4',requirement:'FAIL',layoutHelpPaths:paths}));
