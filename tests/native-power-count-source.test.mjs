import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createSourceEpochProjector} from './helpers/combined-epoch/source-epoch-runtime.mjs';
import {nativePowerCountPath as path,projectHistoricalNativePowerCount as project} from './helpers/native-power-count-historical-source.mjs';
const read=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n');
const before=read('tests/fixtures/native-power-count-before.lua'),after=read('tests/fixtures/native-power-count-after.lua');
const binding=source=>({source,sha256:createHash('sha256').update(source).digest('hex'),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});

test('exact native count continuation changes only its projected Y, never archived source identities',()=>{
 assert.equal(project(path,after),before);assert.equal(project(path,after.replaceAll('\n','\r\n')),before);
 assert.equal(after.replace("  -- Source RightTopAligned raises the glyph centre above its amount anchor.\n  -- Native top alignment uses the existing font budget, not original GDX H0.\n  local countY=(mobile and -22 or -18)*s+Theme.font.small*1.5-Theme.layout.nativeText.lineHeight/2\n  native(count,'SetAnchoredPosition',22*s-width/2,countY)","  native(count,'SetAnchoredPosition',22*s-width/2,(mobile and -22 or -18)*s-Theme.layout.nativeText.lineHeight/2)"),before);
 for(const dirty of [after+'\n',after.slice(1),'\ufeff'+after,after.replace('Theme.font.small*1.5','Theme.font.small*1.6')])assert.equal(project(path,dirty),dirty);
 assert.equal(project('foreign/'+path,after),after);
});
test('bounded historical projection binds exact owner input and rejects changing readers without authorization caches',()=>{
 const other='src/lua/bounded_count_owner.lua',old='return "prior"\n',now='return "current"\n';
 const proof={schemaVersion:1,normalization:'LF',currentCommit:'1'.repeat(40),current:{[path]:binding(before),[other]:binding(now)},owners:[path,other],targets:{prior:{commit:'2'.repeat(40),files:{[path]:binding(old),[other]:binding(old)}}}};
 const epoch=createSourceEpochProjector(proof),raw=p=>p===path?after:now;
 assert.equal(epoch.preCombinedSource(path,after,{target:'prior',readSource:raw}),old);
 assert.equal(epoch.preCombinedSource(path,before,{target:'prior',readSource:p=>p===path?before:now}),old);
 for(const input of [after+'\n',after.slice(1),null,undefined,{},17]){
  let reads=0;assert.equal(epoch.preCombinedSource(path,input,{target:'prior',readSource:()=>{reads++;throw Error('unexpected');}}),input);assert.equal(reads,0);
 }
 let reads=0;assert.equal(epoch.preCombinedSource('foreign/'+path,after,{target:'prior',readSource:()=>{reads++;}}),after);assert.equal(reads,0);
 for(const changed of [before,after+'\n',null,undefined,17])assert.throws(()=>epoch.preCombinedSource(path,after,{target:'prior',readSource:p=>p===path?changed:now}),/linked owner/);
 assert.throws(()=>epoch.preCombinedSource(path,after,{target:'prior',readSource:()=>{throw Error('missing source');}}),/linked owner missing/);
 assert.throws(()=>epoch.preCombinedSource(path,after,{target:'prior',readSource:p=>p===other?now+'\n':after}),/linked owner/);
 for(const samples of [[after,before],[before,after]]){
  let calls=0;const reader=p=>p===path?samples[Math.min(calls++,1)]:now;
  assert.throws(()=>epoch.combinedReader(reader,'prior')(path),/sampled input identity/);assert.equal(calls,2);
 }
 assert.equal(epoch.preCombinedSource(path,after,{target:'prior',readSource:raw}),old,'fresh valid read after failed/warm contamination');
 // Real corpus case: a historically unchanged file is absent from owners.
 // A new continuation still needs its own exact raw input sample.
 const unchanged=createSourceEpochProjector({...proof,owners:[other],targets:{prior:{commit:'2'.repeat(40),files:{[path]:binding(before),[other]:binding(old)}}}});
 assert.equal(unchanged.preCombinedSource(path,after,{target:'prior',readSource:raw}),before);
 assert.throws(()=>unchanged.preCombinedSource(path,after,{target:'prior',readSource:p=>p===path?before:now}),/sampled input identity/);
});
test('actual complete historical owner corpus accepts only exact live native count continuation',async()=>{
 const {sourceEpoch}=await import('./helpers/combined-epoch/source-epoch.mjs');
 const proof=sourceEpoch.proof,target=Object.keys(proof.targets).find(t=>proof.targets[t].files[path]);
 assert.equal(proof.current[path].source,before);assert(target);
 const raw=p=>p===path?after:proof.current[p]?.source??null;
 assert.equal(sourceEpoch.preCombinedSource(path,after,{target,readSource:raw}),proof.targets[target].files[path].source);
 for(const samples of [[after,before],[before,after]]){
  let calls=0;const reader=p=>p===path?samples[Math.min(calls++,1)]:raw(p);
  if(samples[0]===before&&proof.targets[target].files[path].sha256===proof.current[path].sha256)continue; // unchanged original source requires no authorization/read.
  assert.throws(()=>sourceEpoch.combinedReader(reader,target)(path),/linked owner/);
 }
 for(const owner of [path,proof.owners.find(p=>p!==path)])assert.throws(()=>sourceEpoch.preCombinedSource(path,after,{target,readSource:p=>p===owner?'-- dirty':raw(p)}),/linked owner/);
});
