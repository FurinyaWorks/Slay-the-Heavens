import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {extendRuntimeParticleSource,runtimeParticleSourcePacket,verifyParticleGitProof} from './helpers/runtime-particle-source.mjs';
import {preRuntimeParticleSourceEpoch,sourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {assertRuntimeParticleCiCurrent,runtimeParticleCiPacket,assertRuntimeParticleRawInventory,runtimeParticlePriorInventory,runtimeParticleCiSource} from './helpers/runtime-particle-ci-source.mjs';
import {discoverJs} from '../scripts/ci-shards.mjs';
const path='src/lua/abyss_monster_intent_particle_view.lua';
test('particle source continuation binds real Git producer and preserves the full original corpus',()=>{
 const p=runtimeParticleSourcePacket;
 assert.equal(verifyParticleGitProof(p.gitProofs.current,p.current[path]),p.currentCommit);
 assert.equal(verifyParticleGitProof(p.gitProofs.before,p.before[path]),p.baseCommit);
 assert.throws(()=>verifyParticleGitProof({...p.gitProofs.current,commit:'0'.repeat(40)},p.current[path]));
 assert.deepEqual(sourceEpoch.proof.targets.runtimeParticlePrior.files,preRuntimeParticleSourceEpoch.proof.current);
 for(const [key,binding]of Object.entries(preRuntimeParticleSourceEpoch.proof.current))if(key!==path)assert.deepEqual(sourceEpoch.proof.current[key],binding);
 assert.throws(()=>extendRuntimeParticleSource(preRuntimeParticleSourceEpoch,{...p,currentCommit:'0'.repeat(40)}));
});
test('fresh production owner authorization rejects missing or changed particle source after warm success',()=>{
 const p=sourceEpoch.proof,read=key=>p.current[key]?.source??null;
 const target='runtimeParticlePrior',current=read(path);
 assert.equal(sourceEpoch.preCombinedSource(path,current,{target,readSource:read}),runtimeParticleSourcePacket.before[path].source);
 for(const bad of [null,current+'\n'])assert.throws(()=>sourceEpoch.preCombinedSource(path,current,{target,readSource:key=>key===path?bad:read(key)}));
});
test('raw CI discovery stays complete and rejects drift, duplicates, missing inputs and production projection bypass',()=>{
 assertRuntimeParticleCiCurrent();
 const js=discoverJs(),lua=readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort();
 assertRuntimeParticleRawInventory(js);assertRuntimeParticleRawInventory(lua,'lua');
 assert.deepEqual(runtimeParticlePriorInventory(js).sort(),runtimeParticleCiPacket.priorInventory.js);
 for(const list of [js.slice(1),[...js,js[0]],[...js,'tests/forged.test.mjs']])assert.throws(()=>assertRuntimeParticleRawInventory(list));
 const file=Object.keys(runtimeParticleCiPacket.files)[0],source=readFileSync(file,'utf8');
 for(const bad of [null,source+'\n'])assert.throws(()=>assertRuntimeParticleCiCurrent(p=>p===file?bad:readFileSync(p,'utf8')));
 const raw=readFileSync(path,'utf8');assert.equal(runtimeParticleCiSource(path,raw),raw,'CI helper must never project production source');
});

test('isolated production helper copies freshly reject new dependency drift and deletion after warm success',async()=>{
 const {copyIntegrationSourceClosure,runtimeParticleHelperCopies}=await import('./helpers/copy-integration-source-closure.mjs');
 const fs=await import('node:fs'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const source=fs.mkdtempSync(join(tmpdir(),'particle-copy-source-')),target=fs.mkdtempSync(join(tmpdir(),'particle-copy-target-'));
 try{
  copyIntegrationSourceClosure(source);copyIntegrationSourceClosure(target,{sourceRoot:source});
  for(const {path}of runtimeParticleHelperCopies){
   const file=join(source,path),bytes=fs.readFileSync(file);
   fs.writeFileSync(file,Buffer.concat([bytes,Buffer.from('\n')]));
   assert.throws(()=>copyIntegrationSourceClosure(target,{sourceRoot:source}),/fresh helper copy identity/);
   fs.writeFileSync(file,bytes);fs.unlinkSync(file);assert.throws(()=>copyIntegrationSourceClosure(target,{sourceRoot:source}),/ENOENT/);
   fs.writeFileSync(file,bytes);copyIntegrationSourceClosure(target,{sourceRoot:source});
  }
 }finally{fs.rmSync(source,{recursive:true,force:true});fs.rmSync(target,{recursive:true,force:true});}
});
