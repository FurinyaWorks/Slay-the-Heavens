import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,win32} from 'node:path';
import {pathToFileURL} from 'node:url';
const cwd=process.cwd(),load=p=>import(pathToFileURL(resolve(cwd,p)));
const git=(...args)=>execFileSync('git',args);
const sha=b=>createHash('sha256').update(b).digest('hex');
const base='676508d246b6033d543fd8515b881cba27ad41b6';
const helper='tests/helpers/historical-card-input.mjs';
assert.equal(git('hash-object','--no-filters',helper).toString().trim(),'ca9fde49f25f161b476da6e7269f7a3020851b20');
const [hist,old,inverse,hand,event,texture,b]=await Promise.all([
 helper,'tests/helpers/historical-baseline-inputs.mjs','tests/helpers/pr372-integration-source.mjs',
 'tests/helpers/battle-life-frozen-hand.mjs','tests/helpers/event-combat-route-input.mjs',
 'tests/helpers/v25-texture-binding-fixture.mjs','scripts/build-lua-data.mjs'].map(load));
const routes=['tests/lua/card_input_port.lua','tests/lua/card_input_port_slice_2.lua','tests/lua/card_input_port_slice_3.lua'];
assert.deepEqual(hist.historicalCardInputFixtures,routes);
const untouched=['scripts/test-lua.mjs','tests/lua/support/card_input_port_cases.lua',...routes,
 'tests/helpers/battle-life-frozen-hand.mjs','tests/helpers/event-combat-route-input.mjs','tests/helpers/v25-texture-binding-fixture.mjs'];
for(const p of untouched)assert.deepEqual(readFileSync(p),git('show',base+':'+p),p);
const x='src/lua/abyss_battle_card_gestures.lua',y='src/lua/abyss_battle_card_bindings.lua',z='src/lua/abyss_monster_intent_particle_view.lua';
const inputs=old.loadHistoricalBaselineInputs();
const original=p=>{assert(Object.hasOwn(inputs,p),p);return inputs[p].toString('utf8')};
const prior=p=>inverse.preIntegrationSource(p,original(p),'base',{readSource:original});
const [gesture,bindings]=[prior(x),prior(y)];
assert.equal(sha(gesture),'3750e191291bd11d34d7c9b28a83d08d5a6763f17800432a3f85478fab756e0c');
assert.equal(sha(bindings),'0c370951117718e9f2c7247cc6ff4db7836e019d6c59a097e3b9ea9e632cbf8b');
const preload=(m,p,h)=>`package.preload.abyss_battle_card_${m}=function()return assert(load(${b.luaString(p)},'@pre-browse-${h}'))()end\n`;
const priorMark="print('HISTORICAL_CARD_INPUT_PRE_BROWSE')\n";
const pair=priorMark+preload('gestures',gesture,'gesture')+preload('bindings',bindings,'binding');
assert.equal(sha(pair),'5a0ace5ebc817da95d0de565ccd583753b56c8c683320f678bc69ecf76285b35');
let testedNegative=0;
for(const script of routes){
 assert.equal(hist.historicalCardInputPrelude(script,{cwd}),pair);
 assert.equal(hist.historicalCardInputPrelude(script,{cwd,readSource:p=>original(p).replaceAll('\n','\r\n')}),pair);
 let fault,count=0,afterBinding=false;
 const readSource=p=>{
  if(p===y)afterBinding=true;
  if(fault&&p===fault.file&&(!fault.second||afterBinding)){
   count++;
   if(fault.kind==='missing')throw Error('isolated missing '+p);
   return original(p)+'\n-- isolated drift';
  }
  return original(p);
 };
 const project=()=>{afterBinding=false;return hist.historicalCardInputPrelude(script,{cwd,readSource})};
 assert.equal(project(),pair);
 for(const [file,second,expectDrift,expectMissing] of [
  [x,false,'unreviewed source-input gesture host','isolated missing '+x],
  [y,false,'unreviewed source-input binding host','isolated missing '+y],
  [z,false,'delivery linked source identity: '+z,'delivery linked source missing: '+z],
  [z,true,'delivery linked source identity: '+z,'delivery linked source missing: '+z],
 ])for(const kind of ['drift','missing']){
  fault={file,second,kind};count=0;
  assert.throws(project,e=>{
   assert.equal(e.message.split('\n')[0],kind==='drift'?expectDrift:expectMissing);
   assert.equal(e instanceof assert.AssertionError,kind==='drift'||file===z);return true;
  });
  assert(count>=1,'fault must reach the selected reader');
  fault=null;assert.equal(project(),pair);testedNegative++;
 }
 assert.equal(hist.historicalCardInputPrelude(script,{cwd:resolve(cwd,'not-this-checkout'),readSource:()=>{throw Error('must remain untouched')}}),'');
}
for(const script of ['tests/lua/hand_flick_intent.lua','tests/lua/battle_hand_fan_swipe.lua','tests/lua/aim_visual_parity.lua','tests/lua/card_input_port_slice_4.lua']){
 assert.equal(hist.historicalCardInputPrelude(script,{cwd,readSource:()=>{throw Error('must remain untouched')}}),'');
}
// Count Windows CRT command-line quoting, including escaped quotes/backslashes.
// This is a conservative source and argv sizing probe, not a Windows execution.
function quoteCount(s){
 if(s==='')return 2;
 if(!/[\s"]/.test(s))return s.length;
 let n=2,slashes=0;
 for(const c of s){
  if(c==='\\'){slashes++;continue;}
  n+=c==='"' ? 2*slashes+2 : slashes+c.length;
  slashes=0;
 }
 return n+2*slashes;
}
const ciRoot='D:\\a\\Slay-the-Heavens\\Slay-the-Heavens';
const shellExe='C:\\hostedtoolcache\\windows\\node\\24.22.1\\x64\\node.exe';
const shellCli=win32.join(ciRoot,'node_modules','fengari-node-cli','src','lua-cli.js');
const sizing=routes.map(script=>{
 const prefix=pair+hand.frozenBattleHandPrelude(script,{cwd})+event.eventCombatRoutePrelude(script,{cwd})+texture.v25TextureBindingPrelude(script,{cwd});
 const body=prefix+`dofile(${b.luaString(win32.join(ciRoot,...script.split('/')))})`;
 const argc=[shellExe,shellCli,'-e',body];
 const commandUnits=argc.map(quoteCount).reduce((a,b)=>a+b,0)+(argc.length-1)+1;
 assert(commandUnits<18000);
 return {script,rawArgumentBytes:Buffer.byteLength(body),windowsCrtQuotedCommandUnits:commandUnits};
});
console.log(JSON.stringify({scope:'helper source, fresh authorization, Windows sizing only; no Lua/Full',
 helperGitBlob:'ca9fde49f25f161b476da6e7269f7a3020851b20',gesture:sha(gesture),bindings:sha(bindings),pair:sha(pair),
 testedNegative,untouched,sizing},null,2));
