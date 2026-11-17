import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync,gzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';

// Run from the isolated candidate root; Git identities require the base object.
const root=process.cwd(),base='e887258ce603292b94c8f342a8ce792b20fd19ab';
const hash=s=>createHash('sha256').update(s).digest('hex');
const {settingsMapBeforeRepairSource:before,settingsMapRead,settingsMapSource,settingsMapPacket,assertSettingsMapCurrent:check}=await import(pathToFileURL(root+'/tests/helpers/settings-map-integration.mjs'));
const {integratedPriorInventory,integratedCurrentInventory}=await import(pathToFileURL(root+'/tests/helpers/integrated-ci-source.mjs'));
let checks=0;
for(const name of ['inventory','cases']){
 const packetPath=`tests/helpers/settings-map-${name}-repair.json.gz`,bytes=readFileSync(packetPath),patch=JSON.parse(gunzipSync(bytes));
 assert.equal(patch.current,readFileSync(patch.path,'utf8'));checks++;
 assert.equal(patch.before,execFileSync('git',['show',patch.parent+':'+patch.path],{encoding:'utf8'}));checks++;
 assert.equal(hash(patch.before),settingsMapPacket.files[patch.path]);checks++;
 for(const source of [patch.current,patch.current.replaceAll('\n','\r\n')]){assert.equal(before(patch.path,source),patch.before);checks++;}
 for(const foreign of [patch.current+'\n',patch.current.slice(1),patch.current.slice(0,-1),patch.current.replaceAll('\n','\r\r\n'),null,{},17,Buffer.from(patch.current)]){
  assert.equal(before(patch.path,foreign),foreign);checks++;
 }
 for(const path of ['__proto__','constructor','foreign/'+patch.path,'src/lua/abyss_game_ui.lua','scripts/official-battle-hud.mjs']){
  assert.equal(before(path,patch.current),patch.current);checks++;
 }
 // A successful prior call must never authorize a subsequent bad caller read.
 let bad=null;
 const read=(p,e)=>{
  if(p!==patch.path&&p!==packetPath)return readFileSync(p,e);
  if(bad==='missing')throw Error('missing '+p);
  const x=readFileSync(p,e);
  if(bad==='buffer'&&p===patch.path)return Buffer.from(x);
  if(bad==='historical'&&p===patch.path)return patch.before;
  if(bad==='drift')return typeof x==='string'?x+'\n':Buffer.concat([x,Buffer.from('\n')]);
  return x;
 };
 check(read);checks++;
 for(const mode of ['missing','buffer','historical','drift']){
  bad=mode;assert.throws(()=>check(read));checks++;
  assert.throws(()=>integratedPriorInventory(integratedCurrentInventory(),'selection','js',read));checks++;
  bad=null;check(read);checks++;
 }
 for(const mutation of [bytes.subarray(0,-1),Buffer.concat([bytes,Buffer.from('\n')])]){
  assert.throws(()=>check((p,e)=>p===packetPath?mutation:readFileSync(p,e)));checks++;
 }
}
const crlf=(p,e)=>{const x=readFileSync(p,e);return typeof x==='string'?x.replaceAll('\n','\r\n'):x;};check(crlf);checks++;
for(const path of ['scripts/official-battle-hud.mjs','src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua','config/architecture.json']){
 const raw=readFileSync(path,'utf8');
 for(const side of ['settings','selection']){assert.equal(settingsMapRead(side)(path,'utf8'),raw);assert.equal(settingsMapSource(path,raw,side),raw);checks+=2;}
}
const leafPath='tests/helpers/settings-map-integration.mjs';
const leaf=readFileSync(leafPath,'utf8').replace(/from '(\.\/[^']+)'/g,(_,p)=>`from '${new URL(p,pathToFileURL(root+'/'+leafPath)).href}'`);
const bytes=readFileSync('tests/helpers/settings-map-cases-repair.json.gz'),partial=JSON.parse(gunzipSync(bytes));delete partial.current;
const marker="const casesRepairBytes=readFileSync(new URL('./settings-map-cases-repair.json.gz',import.meta.url));";
assert.equal(leaf.split(marker).length,2);checks++;
for(const bad of [bytes.subarray(0,-1),gzipSync(JSON.stringify(partial))]){
 const source=leaf.replace(marker,`const casesRepairBytes=Buffer.from('${bad.toString('base64')}','base64');`).replaceAll('import.meta.url',JSON.stringify(pathToFileURL(root+'/'+leafPath).href));
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(source).toString('base64')),/complete settings cases repair/);checks++;
}
// All old binary packets and both immutable identity manifests remain exact Git blobs.
const paths=execFileSync('git',['ls-tree','-r','--name-only',base,'tests/helpers'],{encoding:'utf8'}).trim().split('\n').filter(p=>p.endsWith('.gz')&&!p.endsWith('/closeout-ci-source.json.gz')&&!p.endsWith('/release-source-epoch.json.gz'));
for(const path of [...paths,'tests/helpers/settings-map-integration.json','tests/helpers/integrated-ci-source.mjs']){
 assert.deepEqual(readFileSync(path),execFileSync('git',['show',base+':'+path],{maxBuffer:64*1024*1024}));checks++;
}
console.log(JSON.stringify({status:'PASS',checks,base,oldPacketsExact:paths.length,productionReadersCurrent:true,originalInventoriesUnchanged:true}));
