import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync,gzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
const root=process.cwd(),hash=s=>createHash('sha256').update(s).digest('hex');
const load=p=>import(pathToFileURL(root+'/'+p));
const {settingsReleasePacket:packet,assertSettingsReleaseCurrent:check,settingsReleaseSource:project,settingsReleaseRead:parentRead,settingsReleaseHistoricalRead:historicalRead,assertSettingsReleaseRawInventory:checkRaw}=await load('tests/helpers/settings-release-source.mjs');
const {assertSettingsMapCurrent,settingsMapRead,settingsMapPriorInventory}=await load('tests/helpers/settings-map-integration.mjs');
const {integratedSource,integratedRead,integratedCurrentInventory,integratedPriorInventory,integratedCiProof}=await load('tests/helpers/integrated-ci-source.mjs');
const {discoverJs}=await load('scripts/ci-shards.mjs');
let checks=0;
check();checks++;
check((p,e)=>{const x=readFileSync(p,e);return typeof x==='string'?x.replaceAll('\n','\r\n'):x;});checks++;
for(const [path,row]of Object.entries(packet.files)){
 assert.equal(readFileSync(path,'utf8').replaceAll('\r\n','\n'),row.current.source);checks++;
 for(const [side,binding]of Object.entries(row.views)){
  const original=execFileSync('git',['show',packet.parents[side]+':'+path],{encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(binding.source,original.replaceAll('\r\n','\n'));checks++;
 }
 for(const mode of ['missing','buffer','drift','crcrlf']){
  const read=(p,e)=>{
   const value=readFileSync(p,e);if(p!==path)return value;
   if(mode==='missing')throw Error('missing '+p);
   return mode==='buffer'?Buffer.from(value):mode==='drift'?value+'\n':value.replaceAll('\n','\r\r\n');
  };
  assert.throws(()=>check(read),error=>{assert(error.message.includes(path));return true;});checks++;
 }
 for(const side of ['release','settings']){
  for(const source of [row.current.source+'\n',row.current.source.slice(1),null,17,{},Buffer.from(row.current.source)]){
   assert.equal(project(path,source,side),source);checks++;
  }
  for(const foreign of ['__proto__','constructor','foreign/'+path]){assert.equal(project(foreign,row.current.source,side),row.current.source);checks++;}
 }
}
for(const path of ['scripts/official-battle-hud.mjs','src/lua/abyss_card_flow.lua','src/lua/abyss_game_ui_input.lua','config/architecture.json']){
 const source=readFileSync(path,'utf8');
 for(const side of ['release','settings']){
  assert.equal(project(path,source,side),source);assert.equal(parentRead(side)(path,'utf8'),source);assert.equal(settingsMapRead(side==='release'?'selection':'settings')(path,'utf8'),source);checks+=3;
 }
 assert.equal(integratedSource(path,source,'native'),source);assert.equal(integratedRead('native')(path,'utf8'),source);checks+=2;
}
for(const [kind,paths]of Object.entries({js:discoverJs(),lua:readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort()})){
 assert.deepEqual(paths,packet.inventory[kind]);assert.deepEqual(integratedCurrentInventory(kind),paths);checks+=2;
 checkRaw(paths,kind);checks++;
 for(const target of ['selection','release']){
  assert.deepEqual(integratedPriorInventory(paths,target,kind),integratedCiProof.inventories[target][kind]);checks++;
  const before=packet.inventories.settings[kind];
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,kind==='js'?'tests/foreign.test.mjs':'tests/lua/foreign.lua'],before]){
   assert.throws(()=>checkRaw(bad,kind),/complete settings Release raw/);checks++;
   assert.throws(()=>settingsMapPriorInventory(bad,kind),/complete settings Release raw/);checks++;
   const historic=kind==='js'?integratedCiProof.inventory:integratedCiProof.luaInventory;
   if(JSON.stringify([...bad].sort())!==JSON.stringify(historic)){assert.throws(()=>integratedPriorInventory(bad,target,kind),/complete settings Release raw/);checks++;}
  }
  assert.deepEqual(integratedPriorInventory(kind==='js'?integratedCiProof.inventory:integratedCiProof.luaInventory,target,kind),integratedCiProof.inventories[target][kind]);checks++;
 }
}
// The old full receipt remains valid in the historical adapter, but deleting
// every new file cannot turn current discovery into an authorized raw input.
for(const kind of ['js','lua']){
 const old=kind==='js'?integratedCiProof.inventory:integratedCiProof.luaInventory;
 const stripped=packet.inventory[kind].filter(p=>old.includes(p));assert.deepEqual(stripped,old);checks++;
 assert.throws(()=>checkRaw(stripped,kind),/complete settings Release raw/);checks++;
 assert.throws(()=>settingsMapPriorInventory(stripped,kind),/complete settings Release raw/);checks++;
}
const {capacityPreflightSource}=await load('tests/helpers/release-capacity-preflight-source.mjs');
const capacity=JSON.parse(gunzipSync(readFileSync('tests/helpers/release-capacity-preflight-source.json.gz')));
for(const path of Object.keys(packet.files))for(const eol of ['\n','\r\n']){
 const input=readFileSync(path,'utf8').replaceAll('\r\n','\n').replaceAll('\n',eol);
 for(const view of ['preflight','capacity','foreign']){
  const binding=capacity.files[path]?.views[view];
  assert.equal(capacityPreflightSource(path,input,view),binding?binding.source.replaceAll('\n',eol):input);checks++;
  for(const before of [{},{sha256:'0'.repeat(64)}]){assert.equal(capacityPreflightSource(path,input,view,before),input);checks++;}
 }
}
// No successful call can authorize a later bad source or historical caller view.
for(const path of ['tests/helpers/integrated-ci-source.mjs','tests/integrated-ci-source.cases.mjs','tests/helpers/settings-map-integration.mjs']){
 let bad=false;
 const read=(p,e)=>{const x=readFileSync(p,e);return bad&&p===path?x+'\n':x;};
 check(read);bad=true;
 assert.throws(()=>integratedPriorInventory(discoverJs(),'selection','js',read),error=>{assert(error.message.includes(path));return true;});checks++;
 assert.throws(()=>assertSettingsMapCurrent(read),error=>{assert(error.message.includes(path));return true;});checks++;
 bad=false;check(read);checks++;
}
const packetPath='tests/helpers/settings-release-source.json.gz',bytes=readFileSync(packetPath);
// Product history is available only to the explicitly named fixture reader,
// after complete fresh authentication on each projection, never ordinary reads.
for(const crlf of [false,true]){
 let bad=null,missing=false;const reads=[];
 const read=(p,e)=>{reads.push(p);if(p===bad&&missing)throw Error('missing '+p);const x=readFileSync(p,e);return p===bad?x+'\n':typeof x==='string'&&crlf?x.replaceAll('\n','\r\n'):x;};
 const fixture=historicalRead('release',read),path='scripts/official-battle-hud.mjs',expected=packet.files[path].views.release.source;
 for(let repeat=0;repeat<2;repeat++){reads.length=0;assert.equal(fixture(path,'utf8'),crlf?expected.replaceAll('\n','\r\n'):expected);assert(reads.includes('tests/helpers/settings-release-integration.cases.mjs'));checks+=2;}
 for(const owner of ['tests/helpers/integrated-ci-source.mjs','tests/ci-complete-calibration.test.mjs',packetPath])for(const absent of [false,true]){
  bad=owner;missing=absent;assert.throws(()=>fixture(path,'utf8'));checks++;
 }
 bad=null;assert.equal(fixture(path,'utf8'),crlf?expected.replaceAll('\n','\r\n'):expected);checks++;
}
for(const bad of [bytes.subarray(0,-1),Buffer.concat([bytes,Buffer.from('\n')])]){assert.throws(()=>check((p,e)=>p===packetPath?bad:readFileSync(p,e)),/fresh immutable settings Release join/);checks++;}
const leaf=readFileSync('tests/helpers/settings-release-source.mjs','utf8'),marker="const bytes=readFileSync(new URL('./settings-release-source.json.gz',import.meta.url));";
assert.equal(leaf.split(marker).length,2);checks++;
const partial=JSON.parse(gunzipSync(bytes));delete partial.files['tests/helpers/integrated-ci-source.mjs'];
for(const bad of [bytes.subarray(0,-1),gzipSync(JSON.stringify(partial))]){
 const source=leaf.replace(marker,`const bytes=Buffer.from('${bad.toString('base64')}','base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')),/complete settings Release join/);checks++;
}
const frozen='tests/helpers/settings-standalone-selection-ci.mjs';
assert.deepEqual(readFileSync(frozen),execFileSync('git',['show',packet.parents.settings+':tests/helpers/release-selection-map-ci-source.mjs']));checks++;
// Every old settings gzip remains byte-for-byte unchanged; LFS materials match its OID.
const oldPaths=execFileSync('git',['ls-tree','-r','--name-only',packet.parents.settings,'tests/helpers'],{encoding:'utf8'}).trim().split('\n').filter(p=>p.endsWith('.gz'));
for(const path of oldPaths){
 const original=execFileSync('git',['show',packet.parents.settings+':'+path],{maxBuffer:64*1024*1024});
 if(original.subarray(0,43).toString().startsWith('version https://git-lfs.github.com/spec/v1')){
  const oid=/oid sha256:([a-f0-9]+)/.exec(original.toString())[1];assert.equal(hash(readFileSync(path)),oid);
 }else assert.deepEqual(readFileSync(path),original);
 checks++;
}
const productDiff=execFileSync('git',['diff','--name-only',packet.parents.release,'--','scripts','src'],{encoding:'utf8'}).trim().split('\n');assert.deepEqual(productDiff,['scripts/official-battle-hud.mjs']);checks++;
assert.deepEqual(readFileSync('scripts/official-battle-hud.mjs'),execFileSync('git',['show',packet.parents.settings+':scripts/official-battle-hud.mjs']));checks++;
const originalCases=execFileSync('git',['show',packet.parents.settings+':tests/integrated-ci-source.cases.mjs'],{encoding:'utf8'});
const caseNames=s=>[...s.matchAll(/test\('([^']+)'/g)].map(m=>m[1]).sort();
assert.deepEqual(caseNames(readFileSync('tests/integrated-ci-source.cases.mjs','utf8')+readFileSync('tests/helpers/settings-release-integration.cases.mjs','utf8')),caseNames(originalCases));checks++;
console.log(JSON.stringify({status:'PASS',checks,parents:packet.parents,currentInputs:Object.keys(packet.files).length,oldSettingsArchives:oldPaths.length,inventory:{js:packet.inventory.js.length,lua:packet.inventory.lua.length},productionDelta:'only original settings image HUD',originalCaseNamesRetained:9}));
