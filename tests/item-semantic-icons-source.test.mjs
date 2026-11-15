import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {sourceEpoch,sourceSlice,menuPresentationEpoch} from './helpers/closeout-source-epoch.mjs';
import {itemIconWitness as witness,itemIconPaths as paths,itemIconProofMatches} from './helpers/item-semantic-icons-source.mjs';
import {copyCurrentSourceFixture} from './helpers/isolated-current-source.mjs';
import {itemIconHelperCopies} from './helpers/copy-integration-source-closure.mjs';
import {createSourceEpochProjector} from './helpers/combined-epoch/source-epoch-runtime.mjs';
const proof=sourceEpoch.proof,crlf=s=>s.replaceAll('\n','\r\n');
const targetFor=(path,changed=true)=>Object.keys(proof.targets).find(target=>proof.targets[target].files[path]&&(proof.targets[target].files[path].sha256!==proof.current[path].sha256)===changed);
function readerFor(states,ending=s=>s){
 const calls=new Map();
 const read=path=>{calls.set(path,(calls.get(path)??0)+1);const index=paths.indexOf(path);const source=index>=0?witness[states[index]][path].source:proof.current[path]?.source;return typeof source==='string'?ending(source):source??null;};
 return {read,calls,reset:()=>calls.clear(),once:()=>assert.deepEqual([...calls].sort(),proof.owners.map(path=>[path,1]).sort())};
}
test('exact icon witness preserves all old proof rows and authorizes only the complete five predecessor set',()=>{
 assert(itemIconProofMatches(proof));
 for(const path of paths)assert.deepEqual(proof.current[path],witness.before[path]);
 assert.equal(itemIconProofMatches({...proof,current:{...proof.current,[paths[0]]:witness.after[paths[0]]}}),false);
 assert.equal(itemIconProofMatches({...proof,owners:proof.owners.filter(path=>path!==paths[0])}),false);
 // Earlier composition has different UI predecessors and must gain no after permission.
 assert.equal(itemIconProofMatches(menuPresentationEpoch.proof),false);
 let reads=0;
 assert.equal(menuPresentationEpoch.preCombinedSource(paths[0],witness.after[paths[0]].source,{target:'develop',readSource:()=>{reads++;throw Error('earlier proof');}}),witness.after[paths[0]].source);
 assert.equal(reads,0);
});
test('LF/CRLF before and after project with every owner freshly read once per successful call',()=>{
 for(const ending of [s=>s,crlf])for(const side of ['before','after']){
  const raw=readerFor(paths.map(()=>side),ending);
  for(const path of paths){const target=targetFor(path);assert(target);
   for(let call=0;call<2;call++){
    raw.reset();assert.equal(sourceEpoch.preCombinedSource(path,ending(witness[side][path].source),{target,readSource:raw.read}),proof.targets[target].files[path].source);raw.once();
    raw.reset();assert.equal(sourceSlice(path,ending(witness[side][path].source),target,raw.read),proof.targets[target].files[path].source);raw.once();
   }
  }
 }
});
test('all 30 mixed live tuples fail, including on unchanged core projections, without duplicate owner reads',()=>{
 const path=paths[0],target=targetFor(path),core=Object.keys(proof.current).find(path=>!paths.includes(path)&&proof.current[path]&&proof.targets[target].files[path]?.sha256!==proof.current[path].sha256);
 assert(core);
 for(let mask=1;mask<31;mask++){
  const raw=readerFor(paths.map((_,i)=>mask&(1<<i)?'after':'before'));
  assert.throws(()=>sourceSlice(path,witness.after[path].source,target,raw.read),/linked owner identity/);raw.once();
  raw.reset();assert.throws(()=>sourceEpoch.preCombinedSource(core,proof.current[core].source,{target,readSource:raw.read}),/linked owner identity/);raw.once();
 }
});
test('both parameter/raw mismatches fail only where an original target projection is needed',()=>{
 for(const path of paths){const target=targetFor(path);for(const side of ['before','after']){
  const raw=readerFor(paths.map(()=>side==='before'?'after':'before'));
  assert.throws(()=>sourceSlice(path,witness[side][path].source,target,raw.read),/linked owner identity/);raw.once();
 }
 const unchanged=targetFor(path,false);if(unchanged){
  let reads=0;const opaque=()=>{reads++;throw Error('no projection');};
  assert.equal(sourceSlice(path,witness.before[path].source,unchanged,opaque),witness.before[path].source);assert.equal(reads,0);
  const raw=readerFor(paths.map(()=>'after'));assert.equal(sourceSlice(path,witness.after[path].source,unchanged,raw.read),witness.before[path].source);raw.once();
  const beforeRaw=readerFor(paths.map(()=>'before'));assert.throws(()=>sourceSlice(path,witness.after[path].source,unchanged,beforeRaw.read),/linked owner identity/);
 }
 const absent=Object.keys(proof.targets).find(target=>proof.targets[target].files[path]===null);if(absent){let reads=0;assert.equal(sourceSlice(path,witness.after[path].source,absent,()=>{reads++;throw Error('no predecessor');}),witness.after[path].source);assert.equal(reads,0);}
 }
});
test('warm readers cannot cache drift, missing owners or a previous all-before/all-after tuple',()=>{
 const path=paths[0],target=targetFor(path);let side='before',bad=null,missing=false;
 const read=owner=>{if(owner===bad){if(missing)throw Error('missing');return witness.after[owner].source+'-- drift\n';}return paths.includes(owner)?witness[side][owner].source:proof.current[owner]?.source??null;};
 const project=()=>sourceSlice(path,witness[side][path].source,target,read);
 for(const owner of paths){side='before';assert.equal(project(),proof.targets[target].files[path].source);side='after';assert.equal(project(),proof.targets[target].files[path].source);
  bad=owner;assert.throws(project,/linked owner identity/);missing=true;assert.throws(project,/linked owner missing/);bad=null;missing=false;assert.equal(project(),proof.targets[target].files[path].source);
  for(const absent of [null,undefined,17])assert.throws(()=>sourceSlice(path,witness.after[path].source,target,p=>p===owner?absent:read(p)),/linked owner identity/);
 }
});
test('unknown, appended, foreign, nonstring and absent-target inputs remain opaque with zero raw reads',()=>{
 const target=targetFor(paths[0]);let reads=0;const read=()=>{reads++;throw Error('unexpected');};
 for(const [path,source]of [['src/lua/unknown.lua',witness.after[paths[0]].source],[paths[0],witness.after[paths[0]].source+'--comment\n'],[paths[0],witness.after[paths[1]].source],[paths[0],null],[paths[0],17]]){
  assert.equal(sourceSlice(path,source,target,read),source);assert.equal(sourceEpoch.preCombinedSource(path,source,{target,readSource:read}),source);assert.equal(reads,0);
 }
 const copy=structuredClone(proof),path=paths[0];copy.targets[target].files[path]=null;
 const absent=createSourceEpochProjector(copy);
 assert.equal(absent.preCombinedSource(path,witness.after[path].source,{target,readSource:read}),witness.after[path].source);assert.equal(reads,0);
});
test('copy closure pins both reviewed closeout compositions and copies the new witness/helper with fresh owner checks',()=>{
 const entry=itemIconHelperCopies.find(row=>row.path==='tests/helpers/closeout-source-epoch.mjs');assert.equal(entry.versions.length,2);
 const sha=text=>createHash('sha256').update(text.replaceAll('\r\n','\n')).digest('hex');
 const current=readFileSync(entry.path,'utf8').replaceAll('\r\n','\n');assert.equal(sha(current),entry.versions[0].after);
 const session=current.replace("import {extendReleaseSourceEpoch} from './release-source-epoch.mjs';","import {extendReleaseSourceEpoch} from './release-source-epoch.mjs';\nimport {extendSessionMenuEpoch} from './session-menu-source-epoch.mjs';").replace('export const sourceEpoch=extendReleaseSourceEpoch(menuPresentationEpoch);','export const releaseSourceEpoch=extendReleaseSourceEpoch(menuPresentationEpoch);\nexport const sourceEpoch=extendSessionMenuEpoch(releaseSourceEpoch);');
 assert.equal(sha(session),entry.versions[1].after,'exact future PR663 composition with the same independent precheck');
 for(const ending of [false,true]){
  const dir=mkdtempSync(join(tmpdir(),'item-icon-source-'));
  try{
   copyCurrentSourceFixture(dir,{crlf:ending});
   for(const name of ['item-semantic-icons-source.mjs','item-semantic-icons-source-witness.json'])assert.equal(sha(readFileSync(join(dir,'tests/helpers',name),'utf8')),sha(readFileSync('tests/helpers/'+name,'utf8')));
   const copiedWitness=join(dir,'tests/helpers/item-semantic-icons-source-witness.json');
   if(ending)writeFileSync(copiedWitness,crlf(readFileSync(copiedWitness,'utf8')));
   const script=`import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {sourceSlice,sourceEpoch} from './tests/helpers/closeout-source-epoch.mjs';const p='${paths[3]}',target=${JSON.stringify(targetFor(paths[3]))};const source=readFileSync(p,'utf8');assert.equal(sourceSlice(p,source,target),sourceEpoch.proof.targets[target].files[p].source);writeFileSync(p,source+'-- drift\\n');assert.throws(()=>sourceSlice(p,source,target),/linked owner identity/);`;
   execFileSync(process.execPath,['--input-type=module','-e',script],{cwd:dir,stdio:'pipe'});
   writeFileSync(copiedWitness,readFileSync(copiedWitness,'utf8')+' ');
   assert.throws(()=>execFileSync(process.execPath,['--input-type=module','-e',"await import('./tests/helpers/item-semantic-icons-source.mjs')"],{cwd:dir,stdio:'pipe'}),/Command failed/,'JSON whitespace beyond CRLF normalization still fails immutable pin');
  }finally{rmSync(dir,{recursive:true,force:true});}
 }
});
