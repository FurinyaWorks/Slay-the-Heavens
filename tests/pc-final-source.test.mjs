import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {sourceEpoch as epoch,prePcFinalSourceEpoch as prior,sourceSlice} from './helpers/closeout-source-epoch.mjs';
import {pcFinalPacket} from './helpers/pc-final-source-epoch.mjs';
import {copyCurrentSourceFixture} from './helpers/isolated-current-source.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const proof=epoch.proof,config='config/architecture.json',target='pcFinalPrior';

test('final production preserves every original source/target and records new module absence',()=>{
 assert.equal(pcFinalPacket.currentCommit,'97ed740e83e2f6bb0f8377eea2209070a300b36c');
 assert.equal(Object.keys(prior.proof.current).length,352);
 const added=Object.keys(proof.current).filter(path=>!Object.hasOwn(prior.proof.current,path));
 assert.deepEqual(added,['src/lua/abyss_image_modes.lua','src/lua/abyss_mobile_hud.lua']);
 for(const [name,view]of Object.entries(prior.proof.targets)){
  assert.equal(proof.targets[name].commit,view.commit);
  for(const [path,binding]of Object.entries(view.files))assert.deepEqual(proof.targets[name].files[path],binding);
  for(const path of added)assert.equal(proof.targets[name].files[path],null);
 }
 for(const [path,binding]of Object.entries(prior.proof.current))assert.deepEqual(proof.targets[target].files[path],binding);
 for(const path of added)assert.equal(proof.targets[target].files[path],null);
 const files=[config,...readdirSync('src/lua').filter(path=>path.endsWith('.lua')).map(path=>'src/lua/'+path)].sort();
 assert.deepEqual(files,Object.keys(proof.current).filter(path=>proof.current[path]!==null).sort());
 for(const path of files)assert.equal(hash(norm(readFileSync(path,'utf8'))),proof.current[path].sha256,path);
});

test('final projection reads each live owner freshly on every call and rejects every owner drift or missing source',()=>{
 const source=readFileSync(config,'utf8');
 for(const ending of [norm,s=>norm(s).replaceAll('\n','\r\n')])for(let attempt=0;attempt<2;attempt++){
  const reads=new Map(),read=path=>{reads.set(path,(reads.get(path)??0)+1);return ending(readFileSync(path,'utf8'));};
  assert.equal(epoch.preCombinedSource(config,ending(source),{target,readSource:read}),prior.proof.current[config].source);
  assert.deepEqual([...reads].sort(),proof.owners.map(path=>[path,1]).sort());
 }
 for(const owner of proof.owners){
  for(const bad of ['drift','missing']){
   const read=path=>path===owner?(bad==='drift'?readFileSync(path,'utf8')+'\n':null):readFileSync(path,'utf8');
   assert.throws(()=>sourceSlice(config,source,target,read),/linked owner identity|linked owner missing/,owner+' '+bad);
  }
 }
});

test('unknown, appended, and newly absent historical inputs cannot authorize owner reads',()=>{
 let reads=0;const read=()=>{reads++;throw Error('unexpected');};
 for(const [path,source]of [['src/lua/unknown.lua','unknown'],[config,proof.current[config].source+'\n'],['src/lua/abyss_image_modes.lua',proof.current['src/lua/abyss_image_modes.lua'].source]]){
  assert.equal(sourceSlice(path,source,target,read),source);assert.equal(reads,0);
 }
});

test('historical materialization rejects a prepopulated historically absent module',t=>{
 const parent=resolve('.artifacts/test-tmp');mkdirSync(parent,{recursive:true});
 const directory=mkdtempSync(join(parent,'pc-source-absence-'));t.after(()=>rmSync(directory,{recursive:true,force:true}));
 const file=join(directory,'src/lua/abyss_image_modes.lua');mkdirSync(join(directory,'src/lua'),{recursive:true});writeFileSync(file,'foreign retained module');
 assert.throws(()=>copyCurrentSourceFixture(directory,{snapshotTarget:'pcFinalPrior'}),/historically absent source already exists/);
 assert.equal(readFileSync(file,'utf8'),'foreign retained module');
});
