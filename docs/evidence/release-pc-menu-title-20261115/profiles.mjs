import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
const load=p=>import(pathToFileURL(resolve(p)));
const {buildUI}=await load('scripts/build-ui.mjs');
const {menuRedScene}=await load('scripts/menu-red-scene.mjs');
const {toLua}=await load('scripts/build-lua-data.mjs');
const {luaTimeoutMs}=await load('scripts/ci-timeout-policy.mjs');
const require=createRequire(pathToFileURL(resolve('package.json')));
const children=n=>n?.controls??n?.children??[],all=n=>[n,...children(n).flatMap(all)];
const root=resolve(process.env.PC01_EVIDENCE_DIR??'docs/evidence/release-pc-menu-title-20261115');
const hash=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const reports=[];
for(const [profile,options]of [['default',{}],['official',{officialAssets:true}],['v25',{v25BattleChrome:true}]]){
 const directory=`build/pc01-${profile}`;mkdirSync(directory,{recursive:true});
 buildUI(directory,undefined,options);
 const layout=JSON.parse(readFileSync(`${directory}/game-ui.json`,'utf8'));
 const menu=all(layout).find(n=>n.name==='menuPanel'),mark=all(menu).find(n=>n.name==='titleMark');
 const row={profile,generatedTreeSha256:hash(readFileSync(`${directory}/game-ui.json`,'utf8')),controls:all(menu).length,titleControls:mark?all(mark).length:0};
 if(profile==='default')assert(!mark,'default profile remains the existing default skin');
 else{
  assert(mark);assert.equal(all(menu).filter(n=>n.name==='titleMark').length,1);
  const scene=all(menu).find(n=>n.name==='menuRuinsScene');
  assert.equal(JSON.stringify(scene),JSON.stringify(menuRedScene()),'exact unchanged approved background');
  row.backgroundSha256=hash(scene);row.backgroundControls=all(scene).length;
  for(const name of ['start','continueRun','titleQuit']){
   const button=children(menu).find(n=>n.name===name);
   assert(children(button).find(n=>n.name==='hit'));
   assert.equal(all(button).filter(n=>n.name==='arrowTop').length,4);
  }
 }
 // Exercise the production-generated full tree with the existing C-tier controller
 // fixture. Its frames reflect the profile generated above, without test timing overrides.
 if(profile!=='default'){
  const theme=JSON.parse(readFileSync(`${directory}/${profile==='official'?'official-assets':'v25'}-theme.json`,'utf8'));
  writeFileSync('build/lua/session_menu_v25_layout.lua',`return ${toLua({controls:layout.controls,frames:theme.layout.v25Menu})}\n`);
  const luaPath=`./${directory}/?.lua;./build/lua/?.lua;./src/lua/?.lua;;`;
  const host=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',"dofile('tests/lua/support/session_menu_v25.lua')"],{
   encoding:'utf8',timeout:luaTimeoutMs.default,maxBuffer:1024*1024,
   env:{...process.env,LUA_PATH:luaPath,LUA_PATH_5_3:luaPath,LUA_INIT:'',LUA_INIT_5_3:''},
  });
  writeFileSync(`${root}/generated-host-${profile}.log`,host.stdout+host.stderr);
  row.hostStatus=host.status;row.hostError=host.error?.message??null;
  assert.equal(host.status,0,host.stdout+host.stderr);assert.match(host.stdout,/SESSION_MENU_V25_PASS/);
 }
 reports.push(row);writeFileSync(`${root}/profiles.json`,JSON.stringify(reports,null,2)+'\n');
 console.log(JSON.stringify(row));
}
