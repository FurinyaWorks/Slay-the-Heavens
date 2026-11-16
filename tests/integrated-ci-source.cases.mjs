import {settingsMapRead,settingsMapSource,settingsMapPriorInventory,settingsMapPacket,assertSettingsMapCurrent} from './helpers/settings-map-integration.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as physicalReadFileSync,readdirSync,mkdtempSync,rmSync,writeFileSync,unlinkSync,existsSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {pc06CiPacket,pc06CiSource,pc06CiRead,assertPc06CiCurrent,pc06HistoricalSource,pc06HistoricalRead} from './helpers/pc06-settings-ci-source.mjs';
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent,assertReleaseBootstrapRawInventory} from './helpers/release-bootstrap-ci-source.mjs';
import {createHash} from 'node:crypto';
import {discoverJs as physicalDiscoverJs} from '../scripts/ci-shards.mjs';
const discoverJs=()=>settingsMapPriorInventory(physicalDiscoverJs());
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
const rawReadFileSync=settingsMapRead('settings',physicalReadFileSync);
const readFileSync=releaseBootstrapCiRead(pc06CiRead(rawReadFileSync));
const pc06LiveReadFileSync=rawReadFileSync;

test('integration validates complete raw sources and leaves every foreign byte and production owner visible',()=>{
 assertIntegratedCurrent();assert.deepEqual(discoverJs(),proof.inventory);assert.equal(new Set(proof.inventory).size,proof.inventory.length);
 for(const [path,row]of Object.entries(proof.files))for(const target of Object.keys(proof.sources)){
  const source=raw(path),production=path.startsWith('src/')||path==='config/architecture.json';
  const expected=production?source:row.views[target]?.source??source;
  assert.equal(integratedSource(path,source,target),expected);
  if(!production&&row.views[target]){
   const crlf=source.replaceAll('\n','\r\n');
   assert.equal(integratedSource(path,crlf,target),row.views[target].sha256===row.current.sha256?crlf:expected);
  }
  for(const input of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(integratedSource(path,input,target),input);
  for(const foreign of ['__proto__','constructor','foreign/'+path])assert.equal(integratedSource(foreign,source,target),source);
 }
 for(const path of ['.gitattributes','docs/legal/assets.json','tests/helpers/closeout-source-epoch.mjs','tests/helpers/run-hud-ci-source.mjs','tests/helpers/integrated-ci-source.mjs'])
  assert.throws(()=>assertIntegratedCurrent((p,e)=>{
   const value=physicalReadFileSync(p,e);
   return p!==path?value:typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  }),error=>{assert.match(error.message,/fresh complete integration source/);assert(error.message.includes(path),'reject the intended current owner');return true;});
 assert.equal(raw('tests/helpers/integrated-ci-binding.mjs'),renderIntegratedCiBinding(hash(readFileSync('tests/helpers/integrated-ci-source.json.gz'))));
 assert.equal(hash(readFileSync('tests/helpers/menu-red-before-integration-production-source.json.gz')),'ee888fd1686beaeffc2e439164619ecedee9ac00d2ca00a2711bd74c63e28cae');
});

test('integration copy closure requires its complete exact predecessor and current dependency bytes',()=>{
 const predecessor=Object.fromEntries(Object.entries(proof.closure).filter(([,row])=>row.before!==null).map(([p,row])=>[p,row.before]));
 predecessor['tests/helpers/retained.mjs']='a'.repeat(64);
 const result=extendIntegratedHelperClosure(predecessor);assert.equal(result['tests/helpers/retained.mjs'],predecessor['tests/helpers/retained.mjs']);
 for(const [path,row]of Object.entries(proof.closure)){
  assert.equal(result[path],row.after);
  assert.equal(hash(path.endsWith('.gz')?readFileSync(path):raw(path)),row.after);
  assert.throws(()=>extendIntegratedHelperClosure({...predecessor,[path]:'f'.repeat(64)}),/copy predecessor/);
 }
});

test('Release bootstrap exact sources retain every old byte and reject missing drift and partial packets',async()=>{
 // The unchanged bootstrap receipt receives its exact 1cc input. The PC06
 // current guard above and below separately authenticates the live after tree.
 const rawReadFileSync=pc06CiRead(pc06LiveReadFileSync);
 assertReleaseBootstrapCiCurrent(rawReadFileSync);
 for(const [path,row]of Object.entries(releaseBootstrapCiPacket.files)){
  const source=rawReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(releaseBootstrapCiSource(path,source),row.before.source,path);
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),null,{},17])assert.equal(releaseBootstrapCiSource(path,foreign),foreign);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseBootstrapCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{
   const value=rawReadFileSync(p,e);return p!==path?value:typeof value==='string'?value.slice(1):value.subarray(1);
  }),error=>{assert(error.message.includes(path));return true;});
  assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>{if(p===path)throw Error('missing '+p);return rawReadFileSync(p,e);}),/missing/);
  if(path.startsWith('.github/')){
   for(const input of [source,source.replaceAll('\n','\r\n')])assert.equal(releaseBootstrapWorkflowBefore(path,input),row.before.source);
   for(const foreign of [source+'\n',source.slice(1),source.replace('release/**','foreign/**')])
    assert.throws(()=>releaseBootstrapWorkflowBefore(path,foreign),/fresh complete Release bootstrap workflow/);
  }
 }
 const archive=Object.keys(releaseBootstrapCiPacket.immutableArchives)[0];
 assert.throws(()=>assertReleaseBootstrapCiCurrent((p,e)=>p===archive?rawReadFileSync(p).subarray(1):rawReadFileSync(p,e)),/immutable bootstrap predecessor/);
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assertReleaseBootstrapRawInventory(paths,kind);
  for(const bad of [[],paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>assertReleaseBootstrapRawInventory(bad,kind),/raw discovery inventory/);
 }
 const leaf=rawReadFileSync('tests/helpers/release-bootstrap-ci-source.mjs','utf8');
 const bytes=rawReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-bootstrap-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,bytes.length-1).toString('base64'))},'base64');`);
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete Release bootstrap CI continuation/);
});

test('PC06 CI continuation freshly authenticates its six exact inputs and preserves unknown source identities',()=>{
 assertPc06CiCurrent(rawReadFileSync);assertIntegratedCurrent();
 for(const [path,row]of Object.entries(pc06CiPacket.files)){
  const source=rawReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  assert.equal(hash(source),row.current.sha256);
  for(const input of [source,source.replaceAll('\n','\r\n')])
   assert.equal(pc06CiSource(path,input),row.project?row.before.source:input,path);
  assert.equal(pc06CiSource(path,source,{sha256:'f'.repeat(64)}),source,'wrong predecessor remains visible');
  for(const foreign of [source+'\n',source.slice(1),source.slice(0,-1),source.replaceAll('\n','\r\r\n'),null,{},17,Buffer.from(source)])
   assert.equal(pc06CiSource(path,foreign),foreign,path);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path,'src/lua/abyss_game_ui.lua'])
   assert.equal(pc06CiSource(foreignPath,source),source,foreignPath);
  const binary=Buffer.from(source);assert.equal(pc06CiRead(()=>binary)(path,'utf8'),binary,'Buffer is never promoted');
  for(const mode of ['missing','changed','buffer']){
   const read=(p,e)=>{
    if(p!==path)return rawReadFileSync(p,e);
    if(mode==='missing')throw Error('missing '+p);
    const value=rawReadFileSync(p,e);return mode==='buffer'?Buffer.from(value):value+'\n';
   };
   assert.throws(()=>assertPc06CiCurrent(read),error=>{assert(error.message.includes(path),'freshly reject intended input');return true;});
  }
 }
 for(const [path]of Object.entries(pc06CiPacket.immutableArchives))
  assert.throws(()=>assertPc06CiCurrent((p,e)=>p===path?rawReadFileSync(p).subarray(1):rawReadFileSync(p,e)),error=>{assert(error.message.includes(path));return true;});
 for(const path of Object.keys(pc06CiPacket.retainedSources))
  assert.throws(()=>assertPc06CiCurrent((p,e)=>{
   const value=rawReadFileSync(p,e);return p===path?value+'\n':value;
  }),error=>{assert(error.message.includes(path));return true;});
 const js=discoverJs(),lua=readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort();
 assert.deepEqual(js,pc06CiPacket.inventory.js);assert.deepEqual(lua,pc06CiPacket.inventory.lua);
 assert.equal(js.length,876);assert.equal(lua.length,1423);
 assert.equal(new Set(js).size,js.length);assert.equal(new Set(lua).size,lua.length);
 assertReleaseBootstrapRawInventory(js);assertReleaseBootstrapRawInventory(lua,'lua');
 assert.equal(Object.keys(releaseBootstrapCiPacket.files).length,10);
 assert.equal(hash(rawReadFileSync('tests/helpers/release-bootstrap-ci-source.json.gz')),'868f4e717b4ebe7af6a77b8bf6239748629d6d11b6de6e15af9f0e668a3971d6');
});

test('PC06 historical fixture view authenticates all live inputs afresh and keeps the product visible to ordinary readers',()=>{
 const path='scripts/official-battle-hud.mjs',source=rawReadFileSync(path,'utf8'),expected=pc06CiPacket.files[path].before.source;
 assert.notEqual(source.replaceAll('\r\n','\n'),expected);
 assert.equal(pc06CiSource(path,source),source,'the CI seam never intercepts the current product');
 assert.equal(pc06CiRead(rawReadFileSync)(path,'utf8'),source,'ordinary CI readers retain the current product');
 for(const crlf of [false,true]){
  let bad=null,missing=false;const reads=[];
  const read=(p,e)=>{reads.push(p);if(p===bad&&missing)throw Error('missing '+p);const raw=rawReadFileSync(p,e);return p===bad?raw+'\n':raw;};
  const input=crlf?source.replaceAll('\r\n','\n').replaceAll('\n','\r\n'):source;
  const ordered=[...Object.keys(pc06CiPacket.files),...Object.keys(pc06CiPacket.immutableArchives),...Object.keys(pc06CiPacket.retainedSources)];
  for(let repeat=0;repeat<2;repeat++){reads.length=0;assert.equal(pc06HistoricalSource(path,input,read),expected);assert.deepEqual(reads,ordered);}
  for(const owner of Object.keys(pc06CiPacket.files)){
   for(const absent of [false,true]){
    bad=owner;missing=absent;reads.length=0;
    assert.throws(()=>pc06HistoricalSource(path,input,read),error=>{assert(error.message.includes(owner));return true;});
    assert.deepEqual(reads,Object.keys(pc06CiPacket.files).slice(0,Object.keys(pc06CiPacket.files).indexOf(owner)+1));
   }
   bad=null;reads.length=0;assert.equal(pc06HistoricalSource(path,input,read),expected);assert.deepEqual(reads,ordered);
  }
  for(const foreign of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),null,17,{},Buffer.from(source)]){
   reads.length=0;assert.equal(pc06HistoricalSource(path,foreign,read),foreign);assert.deepEqual(reads,[]);
  }
 }
 assert.equal(pc06HistoricalRead(rawReadFileSync)(path,'utf8'),expected);
 const binary=Buffer.from(source);assert.equal(pc06HistoricalRead(()=>binary)(path,'utf8'),binary,'binary UTF-8 input stays opaque');
});

test('PC06 fixture continuation retains the complete original four-input packet and every exact predecessor',async()=>{
 const {gunzipSync}=await import('node:zlib');
 const path='tests/helpers/pc06-settings-before-fixture-repair-ci-source.json.gz',bytes=rawReadFileSync(path);
 assert.equal(hash(bytes),'cef63cfac0c079e6f95a913c20a897464833bac8012404c4062fbb7ddebf87eb');
 assert.equal(pc06CiPacket.immutableArchives[path],hash(bytes));
 const prior=JSON.parse(gunzipSync(bytes));
 assert.deepEqual(Object.keys(prior.files).sort(),['scripts/official-battle-hud.mjs','tests/helpers/integrated-ci-source.mjs','tests/integrated-ci-source.cases.mjs','tests/official-run-chrome.test.mjs']);
 const added=['tests/ci-complete-calibration.test.mjs','tests/encounter-formation-source-epoch.test.mjs'];
 assert.deepEqual(Object.keys(pc06CiPacket.files).sort(),[...Object.keys(prior.files),...added].sort());
 for(const [path,row]of Object.entries(prior.files)){
  const {current,...old}=row,{current:after,...now}=pc06CiPacket.files[path];assert.deepEqual(now,old,path);
  if(path==='tests/integrated-ci-source.cases.mjs')assert.notEqual(after.sha256,current.sha256,path);
  else assert.deepEqual(after,current,path);
 }
 // Read from actual 1cc locally; CI verifies the complete Git object identity
 // without requiring historical commits in its shallow checkout.
 const beforeGitBlobs={
  'tests/ci-complete-calibration.test.mjs':'a6753dcc9e77d6166b9fd1d530f511eb4d178523',
  'tests/encounter-formation-source-epoch.test.mjs':'d137ae680404eb393544e301c08d0b1f7589afb6',
 };
 for(const path of added){
  const row=pc06CiPacket.files[path];
  assert.equal(row.beforeCommit,'1cc5479b713edab6fd26db4e20f8eb22b7401cb2');
  assert.equal(row.before.gitBlob,beforeGitBlobs[path],path);
  assert.equal(createHash('sha1').update(`blob ${Buffer.byteLength(row.before.source)}\0`).update(row.before.source).digest('hex'),beforeGitBlobs[path],path);
  assert.equal(hash(row.before.source),row.before.sha256,path);
 }
 assert.equal(Object.keys(prior.immutableArchives).length,93);assert.equal(Object.keys(pc06CiPacket.immutableArchives).length,94);
 for(const [path,sha]of Object.entries(prior.immutableArchives))assert.equal(pc06CiPacket.immutableArchives[path],sha,path);
 for(const field of Object.keys(prior).filter(k=>!['files','immutableArchives'].includes(k)))assert.deepEqual(pc06CiPacket[field],prior[field],field);
});

test('PC06 CI trust leaf rejects truncated or partial packets before accepting any binding',async()=>{
 const leaf=rawReadFileSync('tests/helpers/pc06-settings-ci-source.mjs','utf8');
 const bytes=rawReadFileSync('tests/helpers/pc06-settings-ci-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./pc06-settings-ci-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const {gunzipSync,gzipSync}=await import('node:zlib');
 const partial=JSON.parse(gunzipSync(bytes));delete partial.files['tests/official-run-chrome.test.mjs'];
 for(const bad of [bytes.subarray(0,bytes.length-1),gzipSync(JSON.stringify(partial))]){
  const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bad.toString('base64'))},'base64');`);
  await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete PC06 CI continuation/);
 }
});

test('PC06 CI continuation leaves the complete isolated production copy independent of its CI trust leaf',async t=>{
 const {copyIntegrationSourceClosure}=await import('./helpers/copy-integration-source-closure.mjs');
 const {sourceEpoch}=await import('./helpers/closeout-source-epoch.mjs');
 const directory=mkdtempSync(join(tmpdir(),'pc06-ci-copy-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 copyIntegrationSourceClosure(directory);
 assert(!existsSync(join(directory,'tests/helpers/pc06-settings-ci-source.mjs')));
 assert(!existsSync(join(directory,'tests/helpers/pc06-settings-ci-source.json.gz')));
 const copied=await import(pathToFileURL(join(directory,'tests/helpers/closeout-source-epoch.mjs')).href);
 assert.deepEqual(copied.sourceEpoch.proof,sourceEpoch.proof);
 assert.equal(Object.keys(sourceEpoch.proof.current).length,352);assert.equal(sourceEpoch.proof.owners.length,116);
 const destination=join(directory,'copy');mkdirSync(destination);
 copyIntegrationSourceClosure(destination,{sourceRoot:directory});
 const helper=join(directory,'tests/helpers/combined-epoch/source-epoch-runtime.mjs'),saved=rawReadFileSync(helper);
 writeFileSync(helper,Buffer.concat([saved,Buffer.from('\n')]));
 assert.throws(()=>copyIntegrationSourceClosure(destination,{sourceRoot:directory}),/fresh helper copy identity/);
 writeFileSync(helper,saved);
 const archive=join(directory,'tests/helpers/release-source-epoch.json.gz');unlinkSync(archive);
 assert.throws(()=>copyIntegrationSourceClosure(destination,{sourceRoot:directory}),/ENOENT/);
});

test('settings and landed map authenticate every actual current input and reject post-success drift',()=>{
 assertSettingsMapCurrent();
 for(const [path,sha]of Object.entries(settingsMapPacket.files)){
  const source=physicalReadFileSync(path,'utf8');assert.equal(hash(source.replaceAll('\r\n','\n')),sha,path);
  for(const mode of ['missing','changed','buffer'])assert.throws(()=>assertSettingsMapCurrent((p,e)=>{
   if(p!==path)return physicalReadFileSync(p,e);if(mode==='missing')throw Error('missing '+p);
   return mode==='buffer'?Buffer.from(source):source+'\n';
  }),error=>{assert(error.message.includes(path));return true;});
  for(const foreign of [source+'\n',source.slice(1),null,17,{},Buffer.from(source)])
   for(const side of ['settings','selection'])assert.equal(settingsMapSource(path,foreign,side),foreign);
 }
 for(const path of Object.keys(settingsMapPacket.archives))assert.throws(()=>assertSettingsMapCurrent((p,e)=>p===path?physicalReadFileSync(p).subarray(1):physicalReadFileSync(p,e)),/immutable settings\/map predecessor/);
 for(const kind of ['js','lua']){
  const raw=kind==='js'?physicalDiscoverJs():readdirSync('tests/lua').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort();
  assert.deepEqual(settingsMapPriorInventory(raw,kind),pc06CiPacket.inventory[kind]);
  for(const bad of [raw.slice(1),[...raw,raw[0]],[...raw,'tests/forged.test.mjs']])assert.throws(()=>settingsMapPriorInventory(bad,kind));
 }
});
