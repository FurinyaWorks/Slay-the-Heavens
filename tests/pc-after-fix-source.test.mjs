import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {sourceEpoch as epoch,pcBeforeFixEpoch as prior} from './helpers/closeout-source-epoch.mjs';
import {pcAfterFixPacket as packet,extendPcAfterFixSource} from './helpers/pc-after-fix-source.mjs';
const norm=s=>s.replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const proof=epoch.proof,target='pcBeforeFix',changed=Object.keys(packet.current);
const anchor=changed.find(path=>packet.before[path]&&packet.current[path]);

test('appended production keeps every 572 binding/old target and authenticates the complete frozen source tree',()=>{
 assert.equal(packet.currentCommit,'9b7794e944eb8dde1c5e9f9b2c1800dc5d653caf');
 assert.equal(Object.keys(prior.proof.current).length,354);assert.equal(prior.proof.owners.length,120);
 const added=Object.keys(proof.current).filter(path=>!Object.hasOwn(prior.proof.current,path));
 for(const [name,view]of Object.entries(prior.proof.targets)){
  assert.equal(proof.targets[name].commit,view.commit);
  for(const [path,row]of Object.entries(view.files))assert.deepEqual(proof.targets[name].files[path],row);
  for(const path of added)assert.equal(proof.targets[name].files[path],null);
 }
 assert.equal(proof.targets[target].commit,'57201aa97d2498c8c3c4deea8af1c23044c0adaf');
 for(const [path,row]of Object.entries(prior.proof.current))assert.deepEqual(proof.targets[target].files[path],row);
 for(const path of added)assert.equal(proof.targets[target].files[path],null);
 for(const path of prior.proof.owners)assert(proof.owners.includes(path),'prior owner remains freshly authorized');
 assert(proof.owners.length>=120);
 const files=['config/architecture.json',...readdirSync('src/lua').filter(path=>path.endsWith('.lua')).map(path=>'src/lua/'+path)].sort();
 assert.deepEqual(files,Object.keys(proof.current).filter(path=>proof.current[path]!==null).sort());
 for(const path of files)assert.equal(hash(norm(readFileSync(path,'utf8'))),proof.current[path].sha256,path);
});

test('every appended/current owner is read once on repeated LF/CRLF calls and cannot drift, disappear or mix with its old source',()=>{
 assert(anchor);
 for(const ending of [norm,s=>norm(s).replaceAll('\n','\r\n')])for(let attempt=0;attempt<2;attempt++){
  const calls=new Map(),read=path=>{calls.set(path,(calls.get(path)??0)+1);return ending(readFileSync(path,'utf8'));};
  assert.equal(epoch.preCombinedSource(anchor,ending(readFileSync(anchor,'utf8')),{target,readSource:read}),packet.before[anchor].source);
  assert.deepEqual([...calls].sort(),proof.owners.map(path=>[path,1]).sort());
 }
 for(const owner of proof.owners)for(const missing of [false,true]){
  const read=path=>path===owner?(missing?null:readFileSync(path,'utf8')+'\n'):readFileSync(path,'utf8');
  assert.throws(()=>epoch.preCombinedSource(anchor,readFileSync(anchor,'utf8'),{target,readSource:read}),/linked owner identity|linked owner missing/,owner);
 }
 for(const owner of changed){
  const read=path=>path===owner?(packet.before[owner]?.source??null):readFileSync(path,'utf8');
  assert.throws(()=>epoch.preCombinedSource(anchor,readFileSync(anchor,'utf8'),{target,readSource:read}),/linked owner identity|linked owner missing/,'old/current mixed owner '+owner);
 }
});

test('partial/forged append packets are rejected while unknown, foreign and appended inputs remain opaque',()=>{
 const partial=structuredClone(packet);delete partial.current[changed[0]];delete partial.before[changed[0]];delete partial.producers[changed[0]];
 assert.throws(()=>extendPcAfterFixSource(prior,partial),/appended path set/);
 const forged=structuredClone(packet);forged.current[anchor]={...forged.current[anchor],source:forged.current[anchor].source+'\n'};
 assert.throws(()=>extendPcAfterFixSource(prior,forged),/after bindings/);
 let reads=0;const read=()=>{reads++;throw Error('unknown input read owners');};
 for(const [path,source]of [['src/lua/foreign.lua','foreign'],[anchor,proof.current[anchor].source+'\n'],[anchor,null]]){
  assert.equal(epoch.preCombinedSource(path,source,{target,readSource:read}),source);assert.equal(reads,0);
 }
});
