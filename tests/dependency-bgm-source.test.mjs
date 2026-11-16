import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {sourceEpoch,sessionMenuSourceEpoch} from './helpers/closeout-source-epoch.mjs';
const norm=s=>s.replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const path='src/lua/abyss_ui.lua',raw=p=>sourceEpoch.proof.current[p]?.source??null;

test('successor reproduction uses authenticated predecessor bytes in a shallow checkout',()=>{
 const script=String.raw`
  import assert from 'node:assert/strict';
  import childProcess from 'node:child_process';
  import fs from 'node:fs';
  import {syncBuiltinESMExports} from 'node:module';
  import {dependencyCiProof as patch} from './tests/helpers/dependency-ci-source.mjs';
  import {dependencyCiRepairRead,assertDependencyCiRepairCurrent} from './tests/helpers/dependency-ci-repair-source.mjs';
  const original=childProcess.execFileSync;
  const beforePaths=Object.entries(patch.files).filter(([,row])=>row.before).map(([path])=>path);
  const changedPaths=[...Object.keys(patch.files),...Object.keys(patch.binary)].sort();
  const reply=(text,options)=>options?.encoding?text:Buffer.from(text);
  let historicalReads=0;
  const read=fs.readFileSync;
  // Reproduce the immutable 1b checkpoint through its complete authenticated
  // successor view; do not regenerate that old packet from later fixture bytes.
  assertDependencyCiRepairCurrent(read);
  const historicalRead=dependencyCiRepairRead(read);
  fs.readFileSync=(file,options)=>{
   const value=historicalRead(file,options);
   if(process.env.ABYSS_SOURCE_TEST_EOL!=='crlf'||!String(file).endsWith('.mjs'))return value;
   const text=(typeof value==='string'?value:value.toString('utf8')).replace(/\r?\n/g,'\r\n');
   return typeof value==='string'?text:Buffer.from(text);
  };
  childProcess.execFileSync=(command,args,options)=>{
   if(command!=='git')return original(command,args,options);
   if(args.some(arg=>String(arg).includes('158c492a')))
    throw Error('retired side-branch object unavailable');
   // Only historical Git input is substituted from the authenticated packet.
   // The generator reads every retained checkpoint file, closure and inventory
   // itself; each later current-to-checkpoint conversion is freshly authenticated.
   if(args[0]==='rev-parse') {
    assert.equal(args[1],patch.baseCommit.slice(0,8)+'^{commit}');
    return reply(patch.baseCommit+'\n',options);
   }
   if(args[0]==='ls-tree')return reply(beforePaths.join('\n')+'\n',options);
   if(args[0]==='diff')return reply(changedPaths.join('\n')+'\n',options);
   if(args[0]==='ls-files')return reply('',options);
   if(args[0]==='show') {
    assert(args[1].startsWith(patch.baseCommit+':'));
    const row=patch.files[args[1].slice(patch.baseCommit.length+1)];
    assert(row?.before,'registered complete predecessor required');
    historicalReads++;
    return reply(row.before.source,options);
   }
   throw Error('real Git unavailable in shallow regression: '+args.join(' '));
  };
  syncBuiltinESMExports();
  process.argv[2]='--check';
  await import('./tests/helpers/generate-dependency-ci-source.mjs');
  assert(historicalReads>0,'exercise complete before/after collection');
  console.log('SELF_CONTAINED_SUCCESSOR_PASS');
 `;
 for(const checkout of ['native','crlf']) {
  const result=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8',timeout:30000,windowsHide:true,
   env:{...process.env,ABYSS_SOURCE_TEST_EOL:checkout}});
  assert.ifError(result.error);
  assert.equal(result.status,0,checkout+'\n'+result.stdout+result.stderr);
  assert.match(result.stdout,/SELF_CONTAINED_SUCCESSOR_PASS/);
 }
});

test('one UI successor authenticates actual current bytes after the latest menu/Neow epoch',()=>{
 assert.equal(raw(path),norm(readFileSync(path,'utf8')));
 const prior=sourceEpoch.proof.targets.fatalBgmPrior;
 assert(prior,'retain the complete latest predecessor');
 assert.equal(prior.commit,'9783f9ed4fdf021270668b66c863b9dfeebc7150');
 assert.deepEqual(Object.keys(prior.files),Object.keys(sourceEpoch.proof.current));
 assert.deepEqual(prior.files,sessionMenuSourceEpoch.proof.current);
 for(const [name,target]of Object.entries(sessionMenuSourceEpoch.proof.targets))assert.deepEqual(sourceEpoch.proof.targets[name],target,name+' unchanged complete target');
 assert.deepEqual(Object.keys(prior.files).filter(p=>prior.files[p]?.sha256!==sourceEpoch.proof.current[p]?.sha256),[path]);
 for(const target of ['sessionMenuPrior','sessionMenuReviewed','navigationRetirementPrior','neowRetirementStaticPrior'])assert(sourceEpoch.proof.targets[target],target);
});

test('UI compatibility is restricted to the complete exact binding and path',async()=>{
 const {fatalBgmPair:pair,projectFatalBgmSource:project}=await import('./helpers/fatal-bgm-source-continuation.mjs');
 assert.equal(project(path,pair.after.source,pair.before),pair.before.source);
 assert.equal(project(path,pair.after.source.replaceAll('\n','\r\n'),pair.before),pair.before.source);
 for(const binding of [null,{},pair.after,{...pair.before,source:pair.before.source+'\n'},{...pair.before,sha256:'0'.repeat(64)},{...pair.before,gitBlob:'0'.repeat(40)}])assert.equal(project(path,pair.after.source,binding),pair.after.source);
 for(const input of [null,17,{},pair.after.source+'\n',pair.after.source.replaceAll('\n','\r\r\n')])assert.equal(project(path,input,pair.before),input);
 for(const p of ['__proto__','constructor','src/lua/abyss_game_ui_input.lua','src/lua/abyss_battle_ui_input.lua'])assert.equal(project(p,pair.after.source,pair.before),pair.after.source);
});

test('historical projectors reject mixed old/new UI samples, warm drift and missing owners',async()=>{
 const {releaseSourceEpoch:historical}=await import('./helpers/closeout-source-epoch.mjs');
 const current=norm(readFileSync(path,'utf8')),old=historical.proof.current[path].source;
 const input='config/architecture.json',source=historical.proof.current[input].source,target='develop';
 const reader=p=>p===path?current:historical.proof.current[p]?.source??null;
 assert.notEqual(current,old);
 const expected=historical.proof.targets[target].files[input].source;
 assert.equal(historical.preCombinedSource(input,source,{target,readSource:reader}),expected);
 for(const value of [null,undefined,17,old+'\n'])assert.throws(()=>historical.preCombinedSource(input,source,{target,readSource:p=>p===path?value:reader(p)}),/linked owner/);
 for(const [first,last]of [[old,current],[current,old]]){
  let reads=0;
  assert.throws(()=>historical.preCombinedSource(input,source,{target,readSource:p=>p===path?(++reads===1?first:last):reader(p)}),/linked owner/);
 }
 assert.throws(()=>historical.preCombinedSource(path,old,{target,readSource:reader}),/linked owner/);
 assert.throws(()=>historical.preCombinedSource(path,current,{target,readSource:p=>p===path?old:reader(p)}),/linked owner/);
 assert.throws(()=>historical.preCombinedSource(input,source,{target,readSource:p=>{if(p===path)throw Error('missing UI');return reader(p);}}),/linked owner missing/);
 let changed=false;
 const warm=p=>p===path&&changed?old:reader(p);
 assert.equal(historical.preCombinedSource(input,source,{target,readSource:warm}),expected);changed=true;
 // A fully historical tree remains valid; a new input cannot borrow its old owner.
 assert.throws(()=>historical.preCombinedSource(path,current,{target,readSource:warm}),/linked owner/);
 for(const [p,s]of [[path,current+'\n'],['foreign',current],['__proto__',current],['constructor',current],[path,null],[path,undefined]]){
  let reads=0;assert.equal(historical.preCombinedSource(p,s,{target,readSource:()=>{reads++;throw Error('unexpected');}}),s);assert.equal(reads,0);
 }
});

test('CI successor preserves immutable archive and six views while authenticating raw discovery',async()=>{
 const {integratedCiProof:proof,priorIntegratedCiProof:prior,assertIntegratedCurrent,integratedSource,integratedPriorInventory}=await import('./helpers/integrated-ci-source.mjs');
 const {dependencyCiProof:patch,extendDependencyCiProof,extendDependencyHelperClosure}=await import('./helpers/dependency-ci-source.mjs');
 assert(prior,'explicit immutable prior CI proof');
 assert.deepEqual(prior,JSON.parse(gunzipSync(readFileSync('tests/helpers/integrated-ci-source.json.gz'))));
 assert.deepEqual(proof.sources,prior.sources);
 assertIntegratedCurrent();
 for(const [p,row]of Object.entries(prior.files))assert.deepEqual(proof.files[p].views,row.views,p+' immutable six views');
 const file='scripts/backlog-metadata.mjs',source=norm(readFileSync(file,'utf8'));
 assert.equal(proof.files[file].oldSource.source,prior.files[file].current.source);
 for(const target of Object.keys(proof.sources))assert.equal(integratedSource(file,source,target),prior.files[file].views[target]?.source??prior.files[file].current.source);
 assert.throws(()=>extendDependencyCiProof({...prior,files:{...prior.files,[file]:{...prior.files[file],current:proof.files[file].current}}}),/immutable CI source predecessor/);
 for(const [p,row]of Object.entries(patch.files))if(row.before&&!p.startsWith('src/'))for(const target of Object.keys(proof.sources)){
  assert.equal(integratedSource(p,row.after.source,target),prior.files[p]?.views[target]?.source??row.before.source,p+' exact inherited oldSource');
  assert.equal(integratedSource(p,row.before.source,target),row.before.source,p+' old bytes stay visible');
 }
 const closureBefore=Object.fromEntries(Object.entries(patch.helperClosure).filter(([,r])=>r.before!==null).map(([p,r])=>[p,r.before]));
 const closure=extendDependencyHelperClosure(closureBefore);
 for(const [p,row]of Object.entries(patch.helperClosure)){
  assert.equal(closure[p],row.after);
  assert.throws(()=>extendDependencyHelperClosure({...closureBefore,[p]:'f'.repeat(64)}),/copy predecessor/);
 }
 for(const p of ['tests/helpers/dependency-ci-source.json.gz','tests/helpers/dependency-ci-binding.mjs'])assert(Object.hasOwn(closure,p),'copy includes authenticated transport: '+p);
 const inventory=(dir,ext)=>readdirSync(dir).filter(p=>p.endsWith(ext)).map(p=>dir+'/'+p).sort();
 for(const [kind,paths]of [['js',inventory('tests','.test.mjs')],['lua',inventory('tests/lua','.lua')]]){
  assert.deepEqual(paths,kind==='js'?proof.inventory:proof.luaInventory);
  assert.deepEqual(integratedPriorInventory(paths,'release',kind),prior.inventories.release[kind]);
  assert.throws(()=>integratedPriorInventory([...paths,'tests/foreign.'+kind],'release',kind),/inventory/);
  assert.throws(()=>integratedPriorInventory(paths.slice(1),'release',kind),/inventory/);
  const added=paths.find(p=>!(kind==='js'?prior.inventory:prior.luaInventory).includes(p));assert(added);
  assert.throws(()=>integratedPriorInventory(paths,'release',kind,(p,e)=>readFileSync(p,e)+(p===added?'\n':'')),/fresh added inventory source/);
 }
 for(const p of [file,'tests/helpers/closeout-source-epoch.mjs','tests/dependency-bgm-source.test.mjs','tests/helpers/dependency-ci-source.json.gz','tests/fixtures/fatal-bgm-e65-source.json.gz']){
  assert.throws(()=>assertIntegratedCurrent((f,e)=>{const b=readFileSync(f,e);return f===p?(typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')])):b;}),/fresh complete integration source/);
 }
 assert.equal(hash(readFileSync('tests/helpers/integrated-ci-source.json.gz')),'f0b7137f7d0462dff36b78e39a39aab8804ba9a097b1b72bdf6686cf10f15c35');
});
