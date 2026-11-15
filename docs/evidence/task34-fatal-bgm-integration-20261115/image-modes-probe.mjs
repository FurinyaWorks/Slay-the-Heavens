// Read-only compatibility evidence. Run with cwd = the exact PR #672 tree.
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,readdirSync,rmSync} from 'node:fs';
import {execFileSync,spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const expected='1f7ce04c53189db8c39b59c797a45d57a2c7bac1';
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),expected);
const path='src/lua/abyss_ui.lua',normalize=s=>s.replaceAll('\r\n','\n');
const source=normalize(readFileSync(path,'utf8'));
assert.equal(source,execFileSync('git',['show',expected+':'+path],{encoding:'utf8'}),'PR entry must be clean');
assert.match(source,/if imageModes then imageModes:release\(\);imageModes=nil end/);
function once(source,before,after){assert.equal(source.split(before).length,2,before);return source.replace(before,after);}
let patched=once(source,'local attempted = false\n','local attempted = false\nlocal fatalMusic\n');
patched=once(patched,'local function failed(phase, reason)\n','local function failed(phase, reason)\n    -- The independent server music graph survives a disabled Lua UI. Retire\n    -- this live signal port before cleanup; failure must never retry it.\n    local stopMusic=fatalMusic;fatalMusic=nil\n    if stopMusic then pcall(stopMusic,"ABYSS_BGM_STOP") end\n');
patched=once(patched,'                print("ABYSS_BGM_REQUEST " .. signal)\n            end\n','                print("ABYSS_BGM_REQUEST " .. signal)\n            end\n            fatalMusic=music\n');
patched=once(patched,'function OnDestroy()\n','function OnDestroy()\n    fatalMusic=nil -- Engine teardown only forgets ownership; no native signals.\n');
const {buildUI}=await import(pathToFileURL(join(process.cwd(),'scripts/build-ui.mjs')));
const {buildLuaData,luaString,toLua}=await import(pathToFileURL(join(process.cwd(),'scripts/build-lua-data.mjs')));
const directory=mkdtempSync(join(tmpdir(),'fatal-bgm-pr672-'));
try{
 buildUI(directory,undefined,{officialAssets:true});buildLuaData('data',join(directory,'abyss_data.lua'));
 const modules=readdirSync(directory).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const prelude=`package.path=${luaString(directory.replaceAll('\\','/')+'/?.lua;src/lua/?.lua;')}\nfor _,n in ipairs(${toLua(modules)})do package.preload[n]=assert(loadfile(${luaString(directory.replaceAll('\\','/')+'/')}..n..'.lua'))end\nlocal originalDofile=dofile\ndofile=function(path)if path=='src/lua/abyss_ui.lua' then return assert(load(${luaString(patched)},'@pr672-with-fatal-bgm'))()end;return originalDofile(path)end\n`;
 for(const fixture of ['tests/lua/native_image_modes.lua','tests/lua/native_image_modes_startup.lua']){
  const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',prelude+`dofile(${luaString(fixture)})`],{encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
  process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
  assert.equal(result.status,0,String(result.error??'')+' '+fixture);
  console.log('PR672_COMPAT_PASS '+fixture);
 }
 assert.equal(normalize(readFileSync(path,'utf8')),source,'probe must not write PR entry');
 const hash=s=>createHash('sha256').update(s).digest('hex');
 console.log(JSON.stringify({pr:672,head:expected,beforeSha256:hash(source),overlaySha256:hash(patched),entryWritten:false,scope:'offline imageModes runtime + startup/recycle/cancel/destroy; BGM disabled by existing startup fixture'}));
}finally{rmSync(directory,{recursive:true,force:true});}
