import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const cwd=process.cwd(), importRepo=p=>import(pathToFileURL(resolve(cwd,p)));
const hash=b=>createHash('sha256').update(b).digest('hex');
const norm=s=>s.replaceAll('\r\n','\n');
const git=(...args)=>execFileSync('git',args);
const [old,inverse,historical,hand,event,texture]=await Promise.all([
  'historical-baseline-inputs','pr372-integration-source','historical-card-input',
  'battle-life-frozen-hand','event-combat-route-input','v25-texture-binding-fixture',
].map(n=>importRepo('tests/helpers/'+n+'.mjs')));
const {luaString}=await importRepo('scripts/build-lua-data.mjs');
const srcBase='c3d7cf072b1942291a4ab7a14cc7231274a545bc';
const srcTree='e57acd44f70a608975d207908236729a8d5b4446';
assert.equal(git('rev-parse',srcBase+'^{tree}').toString().trim(),srcTree);
assert.equal(git('rev-parse','HEAD^{tree}').toString().trim(),srcTree);
const entries=['tests/lua/card_input_port.lua','tests/lua/card_input_port_slice_2.lua','tests/lua/card_input_port_slice_3.lua'];
assert.deepEqual(historical.historicalCardInputFixtures,entries);
const cases='tests/lua/support/card_input_port_cases.lua';
const paths=[cases,...entries,'scripts/test-lua.mjs','tests/card-input-slices.test.mjs',
 ...['historical-baseline-inputs','pr372-integration-source','historical-card-input','battle-life-frozen-hand','event-combat-route-input','v25-texture-binding-fixture'].map(n=>'tests/helpers/'+n+'.mjs')];
const pinned={};
for(const p of paths){
 const disk=norm(readFileSync(p,'utf8'));assert.equal(disk,norm(git('show',srcBase+':'+p).toString()),p);pinned[p]=hash(disk);
}
assert.equal(pinned[cases],'bcfdea2be826104160de7f80e8d9f4f83562d5757aca0efd98fc059e7415b471');
const formal=readFileSync('scripts/test-lua.mjs','utf8');
assert.match(formal,/const frozenHand = historicalCardInputPrelude\(normalizedScript,\{cwd\}\) \+ frozenBattleHandPrelude\(normalizedScript, \{cwd\}\)\s*\+ eventCombatRoutePrelude\(normalizedScript,\{cwd\}\) \+ v25TextureBindingPrelude\(normalizedScript,\{cwd\}\);/);
assert.match(readFileSync('tests/card-input-slices.test.mjs','utf8'),/runLua`?\([^\n]+\{ timeout: 30000 \}\);/);
const inputs=old.loadHistoricalBaselineInputs();
const source=norm(old.readHistoricalBaselineSource(cases));
const prefix='return function(first,last)\nfirst,last=assert(first),assert(last)\nlocal registered=0\n';
const gating='    registered=registered+1\n    if registered<first or registered>last then return end\n';
const tail="assert(registered==12 and passed==last-first+1,'source input partition coverage changed')\nend\n";
assert(source.startsWith(prefix)&&source.endsWith(tail));assert.equal(source.split(gating).length,2);
const original=source.slice(prefix.length,-tail.length).replace(gating,'');
const names=text=>[...text.matchAll(/^test\('([^']+)', function\(\)/gm)].map(m=>m[1]);
assert.equal(hash(original),'62b56bbabbe457f0c6480f576cc2f83d34d71e698d354d0a4644820f2a47fa14');
assert.equal(names(original).length,12);
assert.deepEqual(names(readFileSync(cases,'utf8')),names(original));
const host='src/lua/abyss_battle_card_gestures.lua',binding='src/lua/abyss_battle_card_bindings.lua';
const linked='src/lua/abyss_monster_intent_particle_view.lua';
const expected={
 [host]:'3750e191291bd11d34d7c9b28a83d08d5a6763f17800432a3f85478fab756e0c',
 [binding]:'0c370951117718e9f2c7247cc6ff4db7836e019d6c59a097e3b9ea9e632cbf8b',
};
const read=p=>{assert.ok(Object.hasOwn(inputs,p),'registered original source: '+p);return inputs[p].toString('utf8')};
const exact=(p,reader=read)=>{
 const raw=norm(reader(p));const witness=inverse.integrationSources[p];
 assert.equal(hash(raw),witness.sha256,'original input host identity: '+p);
 const result=inverse.preIntegrationSource(p,raw,'base',{readSource:reader});
 assert.equal(hash(result),witness.targets.base.sha256,'original base output: '+p);
 assert.equal(hash(result),expected[p]);
 return result;
};
const results={},requiredReadPaths={};
for(const p of [host,binding]){
 const seen=new Set();
 results[p]=exact(p,q=>{seen.add(q);return read(q)});
 requiredReadPaths[p]=[...seen].sort();
 assert(seen.has(p)&&seen.has(linked));
 assert.equal(exact(p,q=>read(q).replaceAll('\n','\r\n')),results[p]);
 for(const damaged of [p,linked])for(const mode of ['drift','missing']){
  let observed=0;
  assert.throws(()=>exact(p,q=>{
   if(q!==damaged)return read(q);
   observed++;
   if(mode==='missing')throw Error('missing isolated source: '+q);
   return read(q)+'\n-- independent drift control';
  }),e=>mode==='missing'?e.message.split('\n')[0]===(damaged===p?'missing isolated source: ':'delivery linked source missing: ')+damaged:
    /original input host identity|delivery linked source identity|unreviewed combined linked module/.test(e.message));
  assert(observed>=1,damaged+' read must really occur');
  assert.equal(exact(p),results[p]);
 }
}
assert.notEqual(hash(read(binding)),hash(results[binding]),'archive host is not the projected base');
assert.notEqual(hash(readFileSync(host)),hash(results[host]),'live gestures are not the projected base');
assert.notEqual(hash(readFileSync(binding)),hash(results[binding]),'live bindings are not the projected base');
const spans=[[1,6],[7,10],[11,12]],preludes={};
for(const [i,p] of entries.entries()){
 const [first,last]=spans[i];
 assert.equal(readFileSync(p,'utf8').trim(),`dofile('tests/lua/support/card_input_port_cases.lua')(${first},${last})`);
 const a=historical.historicalCardInputPrelude(p,{cwd,readSource:read});
 assert.equal(a,historical.historicalCardInputPrelude(p,{cwd}));
 assert(a.includes(luaString(results[host]))&&!a.includes('package.preload.abyss_battle_card_bindings'));
 const b=hand.frozenBattleHandPrelude(p,{cwd}),c=event.eventCombatRoutePrelude(p,{cwd}),d=texture.v25TextureBindingPrelude(p,{cwd});
 assert.match(b,/for _=1,80 do instance\.update\(1\/60\)end/);
 assert.equal(c,'');assert.equal(d,'');
 preludes[p]={currentRunnerPrefixSha256:hash(a+b+c+d),withoutFrozenHandSha256:hash(a+c+d),frozenHandSha256:hash(b)};
}
for(const p of ['tests/lua/hand_flick_intent.lua','tests/lua/battle_hand_fan_swipe.lua','tests/lua/aim_visual_parity.lua','tests/lua/card_input_port_slice_4.lua']){
 assert.equal(historical.historicalCardInputPrelude(p,{cwd,readSource:()=>{throw Error('must not read outside exact roles')}}),'');
}
for(const p of entries)assert.equal(historical.historicalCardInputPrelude(p,{cwd:resolve(cwd,'another-cwd'),readSource:()=>{throw Error('must not read outside exact cwd')}}),'');
console.log(JSON.stringify({scope:'source-only; no Lua or suite execution',base:srcBase,tree:srcTree,pinned,
 archiveBody:hash(original),currentBody:pinned[cases],names:names(original),expected,preludes,requiredReadPaths,
 sourceChecks:'8 drift/missing mutations, restored reads; original CRLF; no non-target/cwd takeover'},null,2));
