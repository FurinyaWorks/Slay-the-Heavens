import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {discoverJs}=await import(pathToFileURL(resolve('scripts/ci-shards.mjs')));
const mode=process.argv[2]??'--check';assert(['--check','--write'].includes(mode),'Use --check or --write');
function output(path,value){if(mode==='--write')writeFileSync(path,value);else assert.deepEqual(readFileSync(path),Buffer.isBuffer(value)?value:Buffer.from(value),'stale integrated source: '+path);}
const mobileUiPrior='1a62b5e517e138b825b8b663a973065c62ad89ec';
const portraitIdlePrior='df2efb4225de667fa3daf4c71296198b0a579866';
const sources={native:'97af2fed6db0d8c77ea29165ec6395bfb55e2161',closeout:'fdb91c7e30688f593728bde26db0e4d6f614d933',sts:'afd8834b1e7f613b7d68c7a4b6d68ca196f37064',menu:'ec0d0b990bb4baa7d45413101599ef3030f33892',selection:'f0581b708a62378fa838233139d2efef1db7ed8b',release:'900527d931df941eed642a9667ccde92f76b73db',mobileUiPrior,portraitIdlePrior};
const hash=s=>createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const bind=source=>({source,sha256:hash(source),gitBlob:createHash('sha1').update(`blob ${Buffer.byteLength(source)}\0`).update(source).digest('hex')});
const git=args=>execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024});
const priorBytes=execFileSync('git',['show',mobileUiPrior+':tests/helpers/integrated-ci-source.json.gz'],{maxBuffer:8*1024*1024});
assert.equal(hash(priorBytes),'ed7f631311904dcacc155c434b9b37597e9a7fa1fda15c18d34687c2daf66be0','complete original P0 CI archive');
const priorRaw=gunzipSync(priorBytes),prior=JSON.parse(priorRaw);
const {mobileUiPrior:_newTarget,portraitIdlePrior:_portraitTarget,...oldSources}=sources;assert.deepEqual(prior.sources,oldSources);
const portraitPriorBytes=execFileSync('git',['show',portraitIdlePrior+':tests/helpers/integrated-ci-source.json.gz'],{maxBuffer:8*1024*1024});
assert.equal(hash(portraitPriorBytes),'4fa9180316f62c859aaa6545af7b5c1f6956a39c91b544b7f4a04b5cfdb6328c','complete seven-owner CI predecessor');
const portraitPriorRaw=gunzipSync(portraitPriorBytes),portraitPrior=JSON.parse(portraitPriorRaw);
const {portraitIdlePrior:_onlyNew,...sevenSources}=sources;assert.deepEqual(portraitPrior.sources,sevenSources);
const packed=p=>JSON.parse(gunzipSync(readFileSync(p)));
const style=packed('tests/helpers/sts-style-ci-source.json.gz'),feedback=packed('tests/helpers/sts-feedback-ci.json.gz'),menu=packed('tests/helpers/menu-red-ci-source.json.gz');
const all=new Set([...Object.keys(style.files),...Object.keys(style.helperSources),...Object.keys(feedback.files),...Object.keys(menu.files)]);
Object.keys(prior.files).forEach(p=>all.add(p));
Object.keys(portraitPrior.files).forEach(p=>all.add(p));
for(const revision of [...Object.values(sources),'HEAD'])for(const p of git(['diff','--name-only','e805a87dc4df1a048ba5995931d98a4e4899b5e9',revision]).trim().split('\n'))all.add(p);
for(const p of [...git(['diff','--name-only','HEAD']).trim().split('\n'),...git(['ls-files','--others','--exclude-standard','tests']).trim().split('\n')])all.add(p);
const production=['src/lua/abyss_game_ui_menu_view.lua','src/lua/abyss_game_ui_view.lua','src/lua/abyss_v25_menu_view.lua','src/lua/abyss_traveler_portraits.lua'];
production.forEach(p=>all.add(p));
// Full reviewed UI builds need these exact release inputs even in a shallow checkout.
const releaseInputs=['package.json','package-lock.json','.release-please-manifest.json','CHANGELOG.md','data/release/publications.json'];
releaseInputs.forEach(p=>all.add(p));
const paths=[...all].filter(p=>p&&existsSync(p)&&p!=='tests/helpers/integrated-ci-binding.mjs'&&(
 releaseInputs.includes(p)||production.includes(p)||p==='.gitattributes'||p==='package.json'||p==='package-lock.json'||p==='docs/legal/assets.json'||/^(scripts|tests|data|config|tools|\.github)\//.test(p))&&(/\.(mjs|json|lua|yml|yaml)$/.test(p)||p==='.gitattributes'||releaseInputs.includes(p))).sort();
const requests=paths.flatMap(p=>Object.values(sources).map(revision=>revision+':'+p));
const payload=execFileSync('git',['cat-file','--batch'],{input:requests.join('\n')+'\n',maxBuffer:64*1024*1024}),viewsByRef=new Map();
let offset=0;
for(const ref of requests){
 const end=payload.indexOf(10,offset);assert(end>=offset,'complete Git batch header');
 const header=payload.subarray(offset,end).toString();offset=end+1;
 if(header.endsWith(' missing')){viewsByRef.set(ref,null);continue;}
 const [object,type,length]=header.split(' '),size=Number(length);
 assert(/^[a-f0-9]{40}$/.test(object)&&type==='blob'&&Number.isSafeInteger(size)&&size>=0&&offset+size<payload.length,'complete frozen Git blob');
 viewsByRef.set(ref,bind(norm(payload.subarray(offset,offset+size).toString())));offset+=size+1;
}
assert.equal(offset,payload.length,'complete Git batch response');
const files={};for(const p of paths){const views={};for(const [name,revision]of Object.entries(sources)){
 const fromGit=viewsByRef.get(revision+':'+p);
 if(portraitPrior.files[p]&&name==='portraitIdlePrior'){
  assert.deepEqual(fromGit,portraitPrior.files[p].current,'complete committed seven-owner CI predecessor: '+p);
  views[name]=portraitPrior.files[p].current;
 }else if(prior.files[p]&&name==='mobileUiPrior'){
  assert.deepEqual(fromGit,prior.files[p].current,'complete prior CI current equals committed P0 source: '+p);
  views[name]=prior.files[p].current;
 }else if(prior.files[p]&&Object.hasOwn(prior.sources,name)){
  assert.deepEqual(fromGit,prior.files[p].views[name],'unchanged complete historical view: '+p);
  views[name]=prior.files[p].views[name];
 }else views[name]=fromGit;
}
 files[p]={current:bind(norm(readFileSync(p,'utf8'))),views};}
for(const [p,row]of Object.entries(portraitPrior.files))for(const [name,view]of Object.entries(row.views))
 assert.deepEqual(files[p].views[name],view,'complete retained seven-owner CI view '+name+': '+p);
const closure={};for(const p of ['tests/helpers/closeout-source-epoch.mjs','tests/helpers/menu-presentation-source.json.gz','tests/helpers/menu-red-production-source.json.gz','tests/helpers/menu-red-source-epoch.mjs','tests/helpers/release-source-epoch.mjs','tests/helpers/release-source-epoch.json.gz','tests/helpers/session-menu-source-epoch.mjs','tests/helpers/session-menu-source-epoch.json.gz','tests/helpers/mobile-ui-source-plan.mjs','tests/helpers/mobile-ui-source-epoch.mjs','tests/helpers/mobile-ui-source-epoch.json.gz','tests/helpers/portrait-idle-source-epoch.mjs','tests/helpers/portrait-idle-source-epoch.json.gz'])
 closure[p]={before:feedback.helperClosure[p]?.after??null,after:hash(p.endsWith('.gz')?readFileSync(p):norm(readFileSync(p,'utf8')))};
const binaryViews={'tests/helpers/menu-red-production-source.json.gz':{current:closure['tests/helpers/menu-red-production-source.json.gz'].after,
 views:{menu:{path:'tests/helpers/menu-red-before-integration-production-source.json.gz',sha256:'ee888fd1686beaeffc2e439164619ecedee9ac00d2ca00a2711bd74c63e28cae'}}}};
const inventories=Object.fromEntries(Object.entries(sources).map(([name,revision])=>[name,{
 js:git(['ls-tree','--name-only',revision+':tests']).trim().split('\n').filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p).sort(),
 lua:git(['ls-tree','--name-only',revision+':tests/lua']).trim().split('\n').filter(p=>p.endsWith('.lua')).map(p=>'tests/lua/'+p).sort(),
}]));
for(const [name,inventory]of Object.entries(prior.inventories))assert.deepEqual(inventories[name],inventory,'unchanged historical inventory: '+name);
assert.deepEqual(inventories.mobileUiPrior,{js:prior.inventory,lua:prior.luaInventory},'complete original P0 JS and Lua inventories');
for(const [name,inventory]of Object.entries(portraitPrior.inventories))assert.deepEqual(inventories[name],inventory,'complete retained seven-owner inventory '+name);
assert.deepEqual(inventories.portraitIdlePrior,{js:portraitPrior.inventory,lua:portraitPrior.luaInventory});
// Reuse the prior view records to reconstruct the complete old physical archive.
// No second multi-MB archive and no runtime old-Git lookup are needed for replay.
const priorArchive={sha256:hash(priorBytes),rawSha256:hash(priorRaw),gzipOs:priorBytes[9],
 binding:bind(norm(git(['show',mobileUiPrior+':tests/helpers/integrated-ci-binding.mjs']))),
 body:{...prior,files:null},fileOrder:Object.keys(prior.files)};
const indexPaths=git(['ls-tree','-r','--name-only',mobileUiPrior,'--','scripts','data','config','tools','tests/helpers']).trim().split('\n');
const indexPayload=execFileSync('git',['cat-file','--batch'],{input:indexPaths.map(p=>mobileUiPrior+':'+p).join('\n')+'\n',maxBuffer:128*1024*1024});
let indexOffset=0;
priorArchive.indexFiles=Object.fromEntries(indexPaths.map(path=>{
 const end=indexPayload.indexOf(10,indexOffset),header=indexPayload.subarray(indexOffset,end).toString().split(' ');
 const [gitBlob,type,length]=header,size=Number(length);assert.equal(type,'blob');assert(Number.isSafeInteger(size)&&size>=0);
 indexOffset=end+1;let raw=indexPayload.subarray(indexOffset,indexOffset+size);indexOffset+=size+1;
 assert.equal(createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'),gitBlob);
 const pointer=/^version https:\/\/git-lfs.github.com\/spec\/v1\noid sha256:([a-f0-9]{64})\nsize (\d+)\n$/.exec(raw.toString());
 if(pointer){raw=readFileSync(path);assert.equal(raw.length,Number(pointer[2]));assert.equal(hash(raw),pointer[1],'exact hydrated immutable index leaf');}
 const normalization=pointer||raw.subarray(0,8192).includes(0)?'raw':'LF';
 return [path,{gitBlob,normalization,sha256:hash(normalization==='raw'?raw:norm(raw.toString()))}];
}));
assert.equal(indexOffset,indexPayload.length,'complete frozen local path-index snapshot');
const reconstructed={...priorArchive.body,files:Object.fromEntries(priorArchive.fileOrder.map(p=>[p,{
 current:files[p].views.mobileUiPrior,views:Object.fromEntries(Object.keys(prior.sources).map(name=>[name,files[p].views[name]]))}]))};
const reconstructedRaw=Buffer.from(JSON.stringify(reconstructed));assert.equal(hash(reconstructedRaw),priorArchive.rawSha256);
const reconstructedBytes=gzipSync(reconstructedRaw);reconstructedBytes[9]=priorArchive.gzipOs;assert.deepEqual(reconstructedBytes,priorBytes,'complete original P0 physical witness');
const portraitIdlePriorArchive={sha256:hash(portraitPriorBytes),rawSha256:hash(portraitPriorRaw),gzipOs:portraitPriorBytes[9],
 binding:bind(norm(git(['show',portraitIdlePrior+':tests/helpers/integrated-ci-binding.mjs']))),
 body:{...portraitPrior,files:null},fileOrder:Object.keys(portraitPrior.files)};
const portraitReconstructed={...portraitIdlePriorArchive.body,files:Object.fromEntries(portraitIdlePriorArchive.fileOrder.map(p=>[p,{
 current:files[p].views.portraitIdlePrior,views:Object.fromEntries(Object.keys(portraitPrior.sources).map(name=>[name,files[p].views[name]]))}]))};
const portraitReconstructedRaw=Buffer.from(JSON.stringify(portraitReconstructed));assert.equal(hash(portraitReconstructedRaw),portraitIdlePriorArchive.rawSha256);
const portraitReconstructedBytes=gzipSync(portraitReconstructedRaw);portraitReconstructedBytes[9]=portraitIdlePriorArchive.gzipOs;
assert.deepEqual(portraitReconstructedBytes,portraitPriorBytes,'complete original seven-owner CI physical witness');
const luaInventory=git(['ls-files','tests/lua']).trim().split('\n').filter(p=>/^tests\/lua\/[^/]+\.lua$/.test(p)).sort();
const bytes=gzipSync(JSON.stringify({schemaVersion:1,sources,production,files,closure,binaryViews,inventory:discoverJs(),luaInventory,inventories,priorArchive,portraitIdlePriorArchive}));
bytes[9]=10; // The committed physical witness is deterministic on POSIX too.
const sha=hash(bytes);
output('tests/helpers/integrated-ci-source.json.gz',bytes);
output('tests/helpers/integrated-ci-binding.mjs',`// Fixed trust leaf; excluded from its own archive.\nimport assert from 'node:assert/strict';\nimport {readFileSync} from 'node:fs';\nimport {createHash} from 'node:crypto';\nexport const integratedCiBytes=readFileSync(new URL('./integrated-ci-source.json.gz',import.meta.url));\nassert.equal(createHash('sha256').update(integratedCiBytes).digest('hex'),${JSON.stringify(sha)},'complete reviewed integration CI sources');\n`);
console.log(JSON.stringify({paths:paths.length,bytes:bytes.length,sha256:sha}));
