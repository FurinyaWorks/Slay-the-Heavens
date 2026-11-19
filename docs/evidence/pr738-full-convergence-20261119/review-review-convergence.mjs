import assert from 'node:assert/strict';
import {readFileSync as raw} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const cwd=process.cwd(),load=p=>import(pathToFileURL(resolve(cwd,p)));
const git=(...args)=>execFileSync('git',args);
const sha=s=>createHash('sha256').update(s).digest('hex');
const norm=s=>s.replaceAll('\r\n','\n');
const blob=b=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
const stems={
 history:'tests/helpers/release-historical-input-ci.json.gz',
 pc22:'tests/helpers/release-pc22-noop-ci.json.gz',
 join:'tests/helpers/release-full-converge-ci.json.gz',
};
const refs={
 history:['85cfc9c3ba0755b544ed7a614f8ff9c9f55c22f7','9a651ea13d67ed8e05ad12914b46286c707ba854','084241f90e65edddc70bfaf2ea83ec78c53a90eb'],
 pc22:['9bfba629b4717f6321398944b3cd4a5a3bae448d','17e31bb138046fd8694efd3ab3465eb24cb89354','2f569b9b3cc704b951a200ebf4e20739df031cfa'],
 common:['c3d7cf072b1942291a4ab7a14cc7231274a545bc','6d267ca80abd80efb334f8f7581111166174de2d','e57acd44f70a608975d207908236729a8d5b4446'],
};
const p='tests/integrated-ci-source.cases.mjs', owner='src/lua/abyss_battle_actions.lua';
const fixed={
 'tests/helpers/release-card-contact-integration.mjs':'966fe019346d8e96cc7d6beb31b466e810abdc29',
 'tests/helpers/release-potion-enemy-source.mjs':'0b1f58166cd64d5b6fed612344cf0d9243623060',
 [stems.pc22]:'cbd118f0bc254a4b9fa63ed875b8ae45fad7e51c',
 [stems.join]:'0b8b7b95a57cc5078e86cfe5173e1426c7e4fdc4',
 [p]:'28c27f0da173b62edc38427ec703ff00cdfd7f22',
};
for(const [f,b] of Object.entries(fixed))assert.equal(blob(raw(f)),b,f);
for(const [local,remote,tree] of Object.values(refs))assert.equal(git('rev-parse',local+'^{tree}').toString().trim(),tree,local);
const packets=Object.fromEntries(Object.entries(stems).map(([k,f])=>[k,JSON.parse(gunzipSync(raw(f)))]));
assert.deepEqual(packets.join.parents,{history:refs.history[1],pc22:refs.pc22[1]});
assert.equal(packets.join.path,p);
assert.equal(sha(raw(stems.join)),'5d592694c229fdfeba7e9106e39a3ca30ce584d904de4f93c9c4229a9bf5efe2');
assert.equal(packets.join.afterSha256,sha(norm(raw(p,'utf8'))));
for(const leg of ['history','pc22']){
 const local=refs[leg][0],gitParent=(path)=>git('show',local+':'+path);
 assert.deepEqual(raw(stems[leg]),gitParent(stems[leg]),leg+' frozen package');
 const exact=gitParent(p),v=packets.join.sources[leg];
 assert.equal(v.text,norm(exact.toString()),leg);
 assert.equal(v.gitBlob,blob(exact),leg);
 assert.equal(sha(v.text),packets[leg].files[p].afterSha256,leg);
 for(const [path,row] of Object.entries(packets[leg].files))if(path!==p){
  assert.deepEqual(raw(path),gitParent(path),leg+' exclusive exact source');
  assert.equal(row.afterSha256,sha(norm(raw(path,'utf8'))),leg);
 }
}
const before=packets.history.files[p].before;
assert.equal(before,packets.pc22.files[p].before);
assert.equal(before,norm(git('show',refs.common[0]+':'+p).toString()));
const live=norm(raw(p,'utf8'));
assert(live.startsWith(packets.join.sources.history.text),'entire historical parent assertions preserved');
assert(packets.join.sources.pc22.text.startsWith(before),'PC22 additions have exact common prefix');
assert(live.includes(packets.join.sources.pc22.text.slice(before.length)),'complete PC22 test delta preserved without rewriting');
const unchanged=['tests/helpers/historical-card-input.mjs','tests/card-input-slices.test.mjs','scripts/test-lua.mjs',
 'tests/lua/card_input_port.lua','tests/lua/card_input_port_slice_2.lua','tests/lua/card_input_port_slice_3.lua',
 'tests/lua/support/card_input_port_cases.lua','tests/helpers/copy-integration-source-closure.mjs','tests/helpers/closeout-source-epoch.mjs'];
for(const f of unchanged)assert.deepEqual(raw(f),git('show',refs.history[0]+':'+f),f);
assert.equal(git('diff','--name-only',refs.history[0],'--','src','scripts','tests/lua').toString(),'');
const {assertReleasePotionEnemyCurrent}=await load('tests/helpers/release-potion-enemy-source.mjs');
const {integratedSource,integratedRead}=await load('tests/helpers/integrated-ci-source.mjs');
const {integrationCiSource,integrationRead}=await load('tests/helpers/release-card-contact-integration.mjs');
const {sourceEpoch}=await load('tests/helpers/closeout-source-epoch.mjs');
assert.deepEqual([Object.keys(sourceEpoch.proof.current).length,sourceEpoch.proof.owners.length,Object.keys(sourceEpoch.proof.targets).length],[352,129,88]);
assertReleasePotionEnemyCurrent(raw);
const a='tests/native-startup-contract.test.mjs',current=raw(a,'utf8');
const previous=integratedSource(a,current,'menu',raw);
assert.notEqual(current,previous);
let total=0;
for(const f of [...Object.values(stems),owner])for(const mode of ['missing','drift']){
 let hit=0;
 const read=(path,enc)=>{
  if(path!==f)return raw(path,enc);hit++;
  if(mode==='missing')throw Error('isolated missing: '+f);
  const source=raw(path,enc);
  return typeof source==='string'?source+'\n':Buffer.concat([source,Buffer.from('\n')]);
 };
 assert.throws(()=>integratedSource(a,current,'menu',read));
 assert.throws(()=>integratedRead('menu',{read})(a));
 assert.equal(hit,2,f);total+=2;
 assert.equal(integratedSource(a,current,'menu',raw),previous);
}
for(const foreign of [packets.join.sources.history.text,packets.join.sources.pc22.text,live+'\n']){
 assert.throws(()=>assertReleasePotionEnemyCurrent((f,e)=>f===p?foreign:raw(f,e)),
  e=>e.message.split('\n')[0]==='fresh Release Full CI convergence source: '+p);
}
const noOp='tests/helpers/release-pc22-basic-feedback-source.mjs';
const crlf=norm(raw(noOp,'utf8')).replaceAll('\n','\r\n'),bytes=Buffer.from(crlf);
const readNoOp=(path,enc)=>path===noOp?(enc?crlf:bytes):raw(path,enc);
assert.equal(integrationCiSource(noOp,crlf,'pc22',readNoOp),crlf);
assert.strictEqual(integrationRead('pc22',readNoOp)(noOp),bytes);
assert.strictEqual(integratedRead('menu',{read:readNoOp})(noOp),bytes);
console.log(JSON.stringify({scope:'source-only minimal probe; no Lua, suite, or CI execution',refs,blobs:fixed,
 packages:Object.fromEntries(Object.entries(stems).map(([l,f])=>[l,sha(raw(f))])),
 publisher:'remote trees independently read back through GitHub Git data',
 relatedMissingAndDriftRejects:total,legacyCurrentSubstitutions:3,
 liveProductionOwnersTargets:[352,129,88], preservedParentCases:true, crlfNoOpIdentity:true},null,2));
