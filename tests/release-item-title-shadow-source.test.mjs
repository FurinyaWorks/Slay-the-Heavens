import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync as actualReadFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {discoverJs} from '../scripts/ci-shards.mjs';
import {sourceEpoch,preReleaseItemTitleShadowSourceEpoch} from './helpers/closeout-source-epoch.mjs';
import {releaseItemTitleShadowSourcePacket,extendReleaseItemTitleShadowSource} from './helpers/release-item-title-shadow-source.mjs';
import {releaseItemTitleShadowCiPacket,releaseItemTitleShadowCiSource,releaseItemTitleShadowPriorInventory,assertReleaseItemTitleShadowRawInventory,assertReleaseItemTitleShadowCiCurrent} from './helpers/release-item-title-shadow-ci-source.mjs';
import {retirementPlanningReceipt,assertRetirementPlanningCurrent,shadowPlanningReceipt,assertShadowPlanningCurrent,assertReleaseItemTitleShadowPhysicalGuards} from './helpers/release-item-title-shadow-planning.mjs';
import {itemTitleShadowBootstrapPacket,itemTitleShadowBootstrapSource,itemTitleShadowBootstrapRead,itemTitleShadowBootstrapInventory,assertItemTitleShadowBootstrapCurrent,assertItemTitleShadowBootstrapRawInventory} from './helpers/release-item-title-shadow-bootstrap-source.mjs';
import {releaseBootstrapCiPacket,assertReleaseBootstrapCiCurrent} from './helpers/release-bootstrap-ci-source.mjs';
import {itemCiRepairPacket,itemCiRepairSource,itemCiRepairRead,assertItemCiRepairCurrent} from './helpers/release-item-ci-repair-source.mjs';
const readFileSync=itemTitleShadowBootstrapRead('item',actualReadFileSync);
const hash=b=>createHash('sha256').update(b).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');

test('item CI repair authenticates every changed source and retains exact opaque boundaries',()=>{
 assertItemCiRepairCurrent(actualReadFileSync);
 for(const [path,row]of Object.entries(itemCiRepairPacket.files)){
  const raw=actualReadFileSync(path,'utf8');assert.equal(itemCiRepairSource(path,raw),row.before.source,path);
  for(const foreign of [raw+'\n',raw.slice(1),null,{},17])assert.equal(itemCiRepairSource(path,foreign),foreign,path);
  assert.throws(()=>assertItemCiRepairCurrent((p,e)=>{const b=actualReadFileSync(p,e);return p===path?typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]):b;}),/fresh complete integration source: item CI repair/);
  assert.throws(()=>assertItemCiRepairCurrent((p,e)=>{if(p===path)throw Error('missing');return actualReadFileSync(p,e);}),/missing/);
 }
 for(const path of ['src/lua/abyss_combat.lua','config/architecture.json','__proto__'])assert.equal(itemCiRepairSource(path,'foreign'),'foreign');
 for(const verify of [assertRetirementPlanningCurrent,assertShadowPlanningCurrent]){
  const lf=(p,e)=>{const b=actualReadFileSync(p,e);if(p!=='node_modules/.package-lock.json')return b;const s=norm(b.toString());return typeof b==='string'?s:Buffer.from(s);};
  verify(lf);
  assert.throws(()=>verify((p,e)=>{const b=lf(p,e);return p==='node_modules/.package-lock.json'?typeof b==='string'?b+' ':Buffer.concat([b,Buffer.from(' ')]):b;}),/dependency input/);
 }
});

test('item CI repair readers require fresh complete authorization after every warm conversion',()=>{
 const anchor=Object.keys(itemCiRepairPacket.files)[0],before=itemCiRepairPacket.files[anchor].before.source;
 let broken=null,mode=null;
 const read=(path,encoding)=>{
  if(path===broken){if(mode==='missing')throw Error('missing '+path);if(mode==='null')return null;const raw=actualReadFileSync(path,encoding);return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);}
  return actualReadFileSync(path,encoding);
 };
 const warm=itemCiRepairRead(read),source=actualReadFileSync(anchor,'utf8');
 assert.equal(warm(anchor,'utf8'),before);
 const others=[Object.keys(itemCiRepairPacket.files).find(p=>p!==anchor),Object.keys(itemCiRepairPacket.archives)[0],Object.keys(itemCiRepairPacket.production)[0]];
 for(const path of others)for(const failure of ['missing','null','drift']){
  broken=path;mode=failure;
  assert.throws(()=>warm(anchor,'utf8'),'same warm reader must reauthenticate '+path+'/'+failure);
  assert.throws(()=>itemCiRepairSource(anchor,source,{read}),'direct source conversion must reauthenticate '+path+'/'+failure);
  assert.equal(itemCiRepairSource(anchor,before,{read}),before,'already historical source stays opaque');
  assert.equal(itemCiRepairSource('foreign/path',source,{read}),source,'unknown path stays opaque');
  broken=null;assert.equal(warm(anchor,'utf8'),before,'restored complete inputs authorize again');
 }
});

test('retirement observed local floor authenticates its execution inputs and preserves every original cost',()=>{
 const p=assertRetirementPlanningCurrent(),prior=JSON.parse(releaseItemTitleShadowCiPacket.files['scripts/ci-test-timings.json'].before.source),current=JSON.parse(readFileSync('scripts/ci-test-timings.json','utf8'));
 delete current.jsPlanning.localLowerBounds[p.entry];delete current.jsPlanning.localLowerBounds[shadowPlanningReceipt.entry];assert.deepEqual(current,prior,'only the two exact new observed lower bounds are appended');
 assert.equal(p,retirementPlanningReceipt);
 for(const path of [p.entry,'tests/helpers/reward-pool-retirement-runtime.lua','tests/lua/support/game_ui_fixture.lua','src/lua/abyss_battle_reward_layout.lua','scripts/build-ui.mjs','data/presentation/ui_theme.json','.release-please-manifest.json','CHANGELOG.md',p.closure.find(row=>row.path.endsWith('.png')).path,p.dependencies[0].path]){
  for(const change of ['append','missing'])assert.throws(()=>assertRetirementPlanningCurrent((file,encoding)=>{
   if(file===path){if(change==='missing')throw Error('missing retirement execution input');const b=readFileSync(file,encoding);return typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]);}
   return readFileSync(file,encoding);
  }),/fresh retirement|missing retirement/,'execution drift is rejected: '+path);
 }
 assertRetirementPlanningCurrent((path,encoding)=>{assert(!path.startsWith('backlog/'),'task metadata is outside execution authentication');return readFileSync(path,encoding);});
 for(const metadata of ['data/README.md','data/SOURCES.md'])assertRetirementPlanningCurrent((path,encoding)=>{
  const b=readFileSync(path,encoding);return path===metadata?typeof b==='string'?b+'\nmetadata-only change':Buffer.concat([b,Buffer.from('\nmetadata-only change')]):b;
 });
});

test('corrected shadow floor accepts only complete execution inputs and projects only its own new config record',()=>{
 const p=assertShadowPlanningCurrent();assert.equal(p,shadowPlanningReceipt);
 for(const path of [p.entry,'scripts/test-lua.mjs','tests/lua/player_ground_shadow.lua','tests/lua/support/game_ui_fixture.lua','data/presentation/ui_theme.json',...p.closure.filter(r=>r.path.endsWith('.png')).map(r=>r.path)])
  assert.throws(()=>assertShadowPlanningCurrent((file,encoding)=>{const b=readFileSync(file,encoding);return file===path?typeof b==='string'?b+'\n':Buffer.concat([b,Buffer.from('\n')]):b;}),/fresh shadow execution input/);
 for(const change of [c=>c.unknownJsMs++,c=>c.initialMs.win32[0]++,c=>c.jsPlanning.localLowerBounds[retirementPlanningReceipt.entry].durationMs++,c=>{c.foreignBudget=2700001;}])
  assert.throws(()=>assertShadowPlanningCurrent((path,encoding)=>{if(path!==p.config.path)return readFileSync(path,encoding);const c=JSON.parse(readFileSync(path,'utf8'));change(c);return JSON.stringify(c,null,2)+'\n';}),/complete shadow planning config/);
 assert.throws(()=>assertShadowPlanningCurrent((path,encoding)=>{if(path!==p.config.path)return readFileSync(path,encoding);const c=JSON.parse(readFileSync(path,'utf8'));c.jsPlanning.localLowerBounds[p.entry].durationMs++;return JSON.stringify(c,null,2)+'\n';}),/exact new shadow floor/);
 for(const metadata of p.sampledMetadataExcluded)assertShadowPlanningCurrent((path,encoding)=>{assert.notEqual(path,metadata,'non-executable description is never read');return readFileSync(path,encoding);});
});

test('raw Release physical job guards reject missing changed duplicate step-only and wrong-job timeouts',()=>{
 const source=norm(readFileSync('.github/workflows/quality.yml','utf8'));assertReleaseItemTitleShadowPhysicalGuards(source);
 for(const value of ["${{ matrix.os == 'windows-2025' && 45 || 30 }}","${{ inputs.runner_pool == 'local-special' && 75 || 45 }}",'30']){
  const line='    timeout-minutes: '+value;
  for(const changed of ['',line.replace(value,'999'),line+'\n'+line,'      timeout-minutes: '+value])
   assert.throws(()=>assertReleaseItemTitleShadowPhysicalGuards(source.replace(line,changed)),/physical job timeout/);
 }
 assert.throws(()=>assertReleaseItemTitleShadowPhysicalGuards(source.replace('  engineering-posix-shards:','  foreign-posix-shards:')),/physical guard job/);
});

test('release item-title-shadow production preserves every complete prior target and freshly authenticates the committed source tree',()=>{
 const p=sourceEpoch.proof,prior=preReleaseItemTitleShadowSourceEpoch.proof;
 for(const [name,target]of Object.entries(prior.targets))assert.deepEqual(p.targets[name],target,name);
 assert.deepEqual(p.targets.releaseItemTitleShadowPrior.files,prior.current);
 assert.equal(p.currentTreeCommitted,true);assert.equal(p.currentCommit,releaseItemTitleShadowSourcePacket.currentCommit);
 const files=['config/architecture.json',...readdirSync('src/lua').filter(n=>n.endsWith('.lua')).map(n=>'src/lua/'+n)].sort();
 assert.deepEqual(files,Object.keys(p.current).filter(path=>p.current[path]!==null).sort());
 for(const path of files)assert.equal(norm(readFileSync(path,'utf8')),p.current[path].source,path);
 for(const [path,before]of Object.entries(releaseItemTitleShadowSourcePacket.before))assert.deepEqual(before,prior.current[path]);
 assert.throws(()=>extendReleaseItemTitleShadowSource(preReleaseItemTitleShadowSourceEpoch,{...releaseItemTitleShadowSourcePacket,current:{}}),/only the eight approved item-title-shadow owners advance/);
});

test('release item-title-shadow CI validates complete live bindings while unknown or changed bytes stay visible',()=>{
 assertReleaseItemTitleShadowCiCurrent(readFileSync);
 for(const [path,row]of Object.entries(releaseItemTitleShadowCiPacket.files)){
  const source=norm(readFileSync(path,'utf8'));assert.equal(hash(source),row.current.sha256,path);
  const production=path.startsWith('src/')||path==='config/architecture.json';
  assert.equal(releaseItemTitleShadowCiSource(path,source),production?source:row.before?.source??source,path);
  for(const foreign of [source+'\n',source.slice(1),null,{},17])assert.equal(releaseItemTitleShadowCiSource(path,foreign),foreign,path);
  for(const foreignPath of ['__proto__','constructor','foreign/'+path])assert.equal(releaseItemTitleShadowCiSource(foreignPath,source),source);
  assert.throws(()=>assertReleaseItemTitleShadowCiCurrent((p,encoding)=>{
   const raw=readFileSync(p,encoding);return p===path?typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]):raw;
  }),/fresh complete integration source/);
 }
 for(const path of Object.keys(releaseItemTitleShadowSourcePacket.current))assert.equal(releaseItemTitleShadowCiSource(path,sourceEpoch.proof.current[path].source),sourceEpoch.proof.current[path].source,'CI does not intercept production authorization');
});

test('release item-title-shadow raw JS and Lua inventories reject missing duplicate foreign and changed additions',()=>{
 const inventories={js:discoverJs(),lua:readdirSync('tests/lua').filter(n=>n.endsWith('.lua')).map(n=>'tests/lua/'+n).sort()};
 for(const [kind,paths]of Object.entries(inventories)){
  assert.deepEqual(paths,releaseItemTitleShadowCiPacket.currentInventory[kind]);
  assertReleaseItemTitleShadowRawInventory(paths,kind);
  assert.deepEqual(releaseItemTitleShadowPriorInventory(paths,kind,readFileSync),releaseItemTitleShadowCiPacket.priorInventory[kind]);
  const opaque=[`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`];
  assert.deepEqual(releaseItemTitleShadowPriorInventory(opaque,kind),opaque,'unrelated historical input stays opaque for its own validator');
  const noAdditions=paths.filter(path=>releaseItemTitleShadowCiPacket.priorInventory[kind].includes(path));
  assert.throws(()=>assertReleaseItemTitleShadowRawInventory(noAdditions,kind),/raw discovery inventory/,'deleting every release addition cannot pass raw Full validation');
  assert.throws(()=>assertReleaseItemTitleShadowRawInventory(opaque,kind),/raw discovery inventory/);
  for(const bad of [paths.slice(1),[...paths,paths[0]],[...paths,`tests/${kind==='lua'?'lua/':''}foreign.${kind==='lua'?'lua':'test.mjs'}`]])
   assert.throws(()=>releaseItemTitleShadowPriorInventory(bad,kind),/raw .* inventory/);
  for(const path of paths.filter(p=>!releaseItemTitleShadowCiPacket.priorInventory[kind].includes(p)))
   assert.throws(()=>releaseItemTitleShadowPriorInventory(paths,kind,(p,e)=>readFileSync(p,e)+(p===path?'\n':'')),/fresh release item-title-shadow added inventory source/);
 }
});

test('actual Release composition preserves both complete source views and the unchanged production base',()=>{
 const p=itemTitleShadowBootstrapPacket;
 assertItemTitleShadowBootstrapCurrent(actualReadFileSync);
 assertReleaseItemTitleShadowCiCurrent(itemTitleShadowBootstrapRead('item',actualReadFileSync));
 assertReleaseBootstrapCiCurrent(itemTitleShadowBootstrapRead('release',actualReadFileSync));
 assert.equal(releaseBootstrapCiPacket.currentCommit,'36b9b157ee6f05b65eb9f1da7e2978647d36c210');
 assert.equal(releaseBootstrapCiPacket.currentTreeCommitted,false,'original bootstrap capture metadata is retained');
 assert.deepEqual(Object.keys(p.productionEquivalence).sort(),Object.keys(sourceEpoch.proof.current).sort());
 for(const [path,row]of Object.entries(p.productionEquivalence))assert.equal(row.beforeGitBlob,row.releaseGitBlob,path);
 assert.equal(Object.keys(p.releaseGitFiles).length,10);
 for(const [path,row]of Object.entries(releaseItemTitleShadowCiPacket.files))assert.deepEqual(p.files[path].views.item,row.current,'complete original slice view: '+path);
 for(const [path,row]of Object.entries(releaseBootstrapCiPacket.files))assert.deepEqual(p.files[path].views.release,row.current,'complete actual Release view: '+path);
 for(const original of [releaseItemTitleShadowCiPacket,releaseBootstrapCiPacket])for(const [path,sha]of Object.entries(original.immutableArchives))assert.equal(p.archives[path],sha,path);
 for(const path of Object.keys(releaseItemTitleShadowSourcePacket.current))for(const view of ['item','release'])assert.equal(itemTitleShadowBootstrapSource(path,sourceEpoch.proof.current[path].source,view),sourceEpoch.proof.current[path].source,'composition does not authorize production projection');
});

test('actual Release composition rejects fresh source and binary drift without hiding foreign inputs',async()=>{
 const p=itemTitleShadowBootstrapPacket;
 for(const [path,row]of Object.entries(p.files)){
  for(const mode of ['changed','missing'])assert.throws(()=>assertItemTitleShadowBootstrapCurrent((file,encoding)=>{
   if(file===path){if(mode==='missing')throw Error('missing '+path);const raw=actualReadFileSync(file,encoding);return typeof raw==='string'?raw+'\n':Buffer.concat([raw,Buffer.from('\n')]);}
   return actualReadFileSync(file,encoding);
  }),error=>{assert(error.message.includes(path),'reject the intended fresh current input');return true;});
  if(row.current.kind!=='text')continue;
  const source=actualReadFileSync(path,'utf8').replaceAll('\r\n','\n');
  for(const view of ['item','release']){
   const production=path.startsWith('src/')||path==='config/architecture.json',expected=production?source:row.views[view]?.source??source;
   for(const current of [source,source.replaceAll('\n','\r\n')])assert.equal(itemTitleShadowBootstrapSource(path,current,view),production||!row.views[view]?current:expected);
   for(const foreign of [source+'\n',source.slice(1),source.replaceAll('\n','\r\r\n'),Buffer.from(source),null,17])assert.equal(itemTitleShadowBootstrapSource(path,foreign,view),foreign);
   for(const foreign of ['__proto__','constructor','foreign/'+path])assert.equal(itemTitleShadowBootstrapSource(foreign,source,view),source);
  }
 }
 for(const kind of ['js','lua']){
  assertItemTitleShadowBootstrapRawInventory(kind);
  const current=p.inventory.current[kind];
  for(const view of ['item','release'])assert.deepEqual(itemTitleShadowBootstrapInventory(current,view,kind),p.inventory[view][kind]);
  for(const bad of [[],current.slice(1),[...current,current[0]],[...current,'foreign']])assert.throws(()=>itemTitleShadowBootstrapInventory(bad,'release',kind),/raw inventory/);
 }
 const archive=Object.keys(p.archives)[0];
 assert.throws(()=>assertItemTitleShadowBootstrapCurrent((path,encoding)=>path===archive?Buffer.concat([actualReadFileSync(path),Buffer.from('\n')]):actualReadFileSync(path,encoding)),/retained immutable/);
 const leaf=actualReadFileSync('tests/helpers/release-item-title-shadow-bootstrap-source.mjs','utf8'),bytes=actualReadFileSync('tests/helpers/release-item-title-shadow-bootstrap-source.json.gz');
 const marker="const bytes=readFileSync(new URL('./release-item-title-shadow-bootstrap-source.json.gz',import.meta.url));";
 assert.equal(leaf.split(marker).length,2);
 const broken=leaf.replace(marker,`const bytes=Buffer.from(${JSON.stringify(bytes.subarray(0,-1).toString('base64'))},'base64');`)
  .replace("'./release-item-ci-repair-source.mjs'",JSON.stringify(new URL('./helpers/release-item-ci-repair-source.mjs',import.meta.url).href));
 await assert.rejects(import('data:text/javascript;base64,'+Buffer.from(broken).toString('base64')),/complete item title shadow actual Release composition/);
});
