import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as rawReadFileSync,readdirSync,mkdtempSync,rmSync,writeFileSync,unlinkSync,existsSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {pc06CiPacket,pc06CiSource,pc06CiRead,assertPc06CiCurrent} from './helpers/pc06-settings-ci-source.mjs';
import {releaseBootstrapCiRead,releaseBootstrapCiPacket,releaseBootstrapCiSource,releaseBootstrapWorkflowBefore,assertReleaseBootstrapCiCurrent,assertReleaseBootstrapRawInventory} from './helpers/release-bootstrap-ci-source.mjs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {integratedCiProof as proof,integratedSource,assertIntegratedCurrent,renderIntegratedCiBinding,extendIntegratedHelperClosure} from './helpers/integrated-ci-source.mjs';
const raw=p=>readFileSync(p,'utf8').replaceAll('\r\n','\n'),hash=s=>createHash('sha256').update(s).digest('hex');
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
   const value=rawReadFileSync(p,e);
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

test('PC06 CI continuation freshly authenticates its four exact inputs and preserves unknown source identities',()=>{
 assertPc06CiCurrent();assertIntegratedCurrent();
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
   assert.throws(()=>assertIntegratedCurrent(read),error=>{assert(error.message.includes(path),'freshly reject intended input');return true;});
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
