import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,realpathSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {join,relative,isAbsolute,sep} from 'node:path';
import {pathToFileURL} from 'node:url';
// Run from repository root: node proof.mjs /tmp/pr738-historical-proof paired
const cwd=realpathSync(process.cwd()), requested=process.argv[2];
assert(requested&&isAbsolute(requested),'explicit absolute output directory outside the repository');
const requestedRelative=relative(cwd,requested);
assert(requestedRelative&&(isAbsolute(requestedRelative)||requestedRelative.startsWith('..'+sep)),'output must be outside source tree');
mkdirSync(requested,{recursive:true});
const out=realpathSync(requested), outside=relative(cwd,out);
assert(outside&&(isAbsolute(outside)||outside.startsWith('..'+sep)),'output must be outside source tree');
const git=(...args)=>{
 const result=spawnSync('git',args,{cwd,encoding:'utf8'});
 assert.ifError(result.error);assert.equal(result.status,0,result.stderr);
 return result.stdout.trim();
};
const digest=name=>{const bytes=readFileSync(name);return {sha256:hash(bytes),size:bytes.length}};

const load=path=>import(pathToFileURL(join(cwd,path)));
const req=createRequire(join(cwd,'package.json')), cli=req.resolve('fengari-node-cli/src/lua-cli.js');
const hash=source=>createHash('sha256').update(source).digest('hex');
const [old,{integrationSources,preIntegrationSource},{historicalCardInputPrelude,historicalCardInputFixtures},{luaString},hand,combat,texture]=await Promise.all(
 ['tests/helpers/historical-baseline-inputs.mjs','tests/helpers/pr372-integration-source.mjs','tests/helpers/historical-card-input.mjs','scripts/build-lua-data.mjs','tests/helpers/battle-life-frozen-hand.mjs','tests/helpers/event-combat-route-input.mjs','tests/helpers/v25-texture-binding-fixture.mjs'].map(load));
const inputs=old.loadHistoricalBaselineInputs();
const fixture='tests/lua/support/card_input_port_cases.lua';
const source=old.readHistoricalBaselineSource(fixture).replaceAll('\r\n','\n');
const header='return function(first,last)\nfirst,last=assert(first),assert(last)\nlocal registered=0\n';
const gating='    registered=registered+1\n    if registered<first or registered>last then return end\n';
const tail="assert(registered==12 and passed==last-first+1,'source input partition coverage changed')\nend\n";
assert(source.startsWith(header)&&source.endsWith(tail));assert.equal(source.split(gating).length,2);
const original=source.slice(header.length,-tail.length).replace(gating,'');
assert.equal(hash(original),'62b56bbabbe457f0c6480f576cc2f83d34d71e698d354d0a4644820f2a47fa14');
const names=[...original.matchAll(/^test\('([^']+)', function\(\)/gm)].map(m=>m[1]);assert.equal(names.length,12);
const bindingPath='src/lua/abyss_battle_card_bindings.lua',gesturePath='src/lua/abyss_battle_card_gestures.lua';
const reads=new Set();
const readSource=path=>{reads.add(path);assert(Object.hasOwn(inputs,path),path);return inputs[path].toString('utf8')};
const liveBinding=readSource(bindingPath);assert.equal(hash(liveBinding),integrationSources[bindingPath].sha256);
const binding=preIntegrationSource(bindingPath,liveBinding,'base',{readSource});
assert.equal(hash(binding),'0c370951117718e9f2c7247cc6ff4db7836e019d6c59a097e3b9ea9e632cbf8b');
const gesture=preIntegrationSource(gesturePath,readSource(gesturePath),'base',{readSource});
assert.equal(hash(gesture),'3750e191291bd11d34d7c9b28a83d08d5a6763f17800432a3f85478fab756e0c');
console.log(JSON.stringify({binding:{live:hash(liveBinding),prior:hash(binding),working:hash(readFileSync(bindingPath))},gesture:{live:hash(inputs[gesturePath]),prior:hash(gesture),working:hash(readFileSync(gesturePath))},fixture:{original:hash(original),working:hash(readFileSync(fixture))},reads:[...reads].sort().map(p=>[p,hash(inputs[p])])},null,2));
const env={...process.env,LUA_PATH:'./build/lua/?.lua;./src/lua/?.lua;;',LUA_PATH_5_3:'./build/lua/?.lua;./src/lua/?.lua;;',LUA_INIT:'',LUA_INIT_5_3:''};
const manifestPaths=['tests/fixtures/pr323-historical-fixtures.json.gz','tests/fixtures/pr372-integration-sources.json','tests/helpers/historical-card-input.mjs','tests/helpers/battle-life-frozen-hand.mjs','tests/helpers/event-combat-route-input.mjs','tests/helpers/v25-texture-binding-fixture.mjs','scripts/test-lua.mjs',fixture,...historicalCardInputFixtures,bindingPath,gesturePath,'src/lua/abyss_battle_card_view.lua','src/lua/abyss_battle_action_bindings.lua','src/lua/abyss_battle_actions.lua','src/lua/abyss_battle_input_state.lua'];
const manifest=Object.fromEntries(manifestPaths.map(path=>{
 const blob=git('rev-parse','HEAD:'+path);
 assert.equal(git('hash-object','--no-filters',path),blob,'working input must equal the exact committed blob (use LF checkout): '+path);
 return [path,{...digest(path),blob}];
}));
git('diff','--quiet','HEAD','--','src/lua');
const production=git('ls-tree','-r','--name-only','HEAD','src/lua').split('\n').sort();
const regularLuaFiles=dir=>readdirSync(dir,{withFileTypes:true}).filter(entry=>entry.name.endsWith('.lua')).map(entry=>{
 assert.ok(entry.isFile()&&!entry.isSymbolicLink(),'regular Lua source required: '+dir+'/'+entry.name);return dir+'/'+entry.name;
}).sort();
assert.deepEqual(regularLuaFiles('src/lua'),production.filter(path=>/^src\/lua\/[^/]+\.lua$/.test(path)),'no untracked direct Lua module can enter source lookup');
const built=regularLuaFiles('build/lua');
const srcNames=new Set(regularLuaFiles('src/lua').map(path=>path.substring('src/lua/'.length)));
for(const path of built)assert(!srcNames.has(path.substring('build/lua/'.length)),'generated output must not shadow tracked production module: '+path);
const identity={head:git('rev-parse','HEAD'),tree:git('rev-parse','HEAD^{tree}'),inputs:manifest,generatedLua:Object.fromEntries(built.map(path=>[path,digest(path)])),
 productionInputCount:production.length,generatedShadowing:0};
writeFileSync(join(out,'source-manifest.json'),JSON.stringify(identity,null,2)+'\n');
console.log(JSON.stringify(identity,null,2));
const mode=process.argv[3]??'paired', seen=[];
assert(['paired','archive-binding-only','unpaired'].includes(mode));
for(const [i,[first,last]] of [[1,6],[7,10],[11,12]].entries()){
 const script=historicalCardInputFixtures[i];
 assert.equal(readFileSync(script,'utf8').trim(),`dofile('tests/lua/support/card_input_port_cases.lua')(${first},${last})`);
 const pre=historicalCardInputPrelude(script,{cwd,readSource});
 assert.equal(pre,historicalCardInputPrelude(script));
 assert(pre.includes(luaString(gesture)));
 const prefixes=[pre,hand.frozenBattleHandPrelude(script,{cwd}),combat.eventCombatRoutePrelude(script,{cwd}),texture.v25TextureBindingPrelude(script,{cwd})];
 const extra=prefixes.slice(1).join('');
 console.log(JSON.stringify({prefixes:['historicalCardInputPrelude','frozenBattleHandPrelude','eventCombatRoutePrelude','v25TextureBindingPrelude'].map((name,i)=>[name,hash(prefixes[i]),Buffer.byteLength(prefixes[i])])}));
 const paired=mode==='unpaired'?'':`package.preload.abyss_battle_card_bindings=function()return assert(load(${luaString(mode==='paired'?binding:liveBinding)},'@pre-browse-binding'))()end\n`;
 const entry=join(out,`${mode}-${i+1}.lua`),started=Date.now();
 writeFileSync(entry,pre+paired+extra+`dofile(${luaString(join(cwd,script))})\n`);
 const r=spawnSync(process.execPath,[cli,'-e',`dofile(${luaString(entry)})`],{cwd,env,encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
 console.log(JSON.stringify({script,first,last,status:r.status,error:r.error?.code,elapsedMs:Date.now()-started}));
 console.log(r.stdout);console.error(r.stderr);
 if(mode==='unpaired'){assert.ifError(r.error);assert.equal(r.status,1);assert.match(r.stdout,/attempt to index a nil value \(upvalue 'Intent'\)/);break;}
 if(mode==='paired'){
  assert.ifError(r.error);assert.equal(r.status,0);
  const actual=[...r.stdout.matchAll(/^PASS source card input (.+)$/gm)].map(m=>m[1]);
  assert.deepEqual(actual,names.slice(first-1,last));seen.push(...actual);
 }
}
if(mode==='unpaired')console.log('Unpaired first-slice red: exact current binding cannot load frozen gesture API.');
if(mode==='paired'){assert.deepEqual(seen,names);console.log('PAIRED ORIGINAL 12/12; unmodified Lua stubs, body & 30s each')}
