// Exact menu continuation; prior production corpora and assertions stay intact.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export function assertOriginalSessionMenuWitness(menu){
 const source=JSON.stringify(menu);
 assert.equal(hash(source),'faf5708dea4f2c825683b9a0673eb1af8c64d094268b0c154de2a923e3397bac','immutable original session menu source witness');
 // The historical witness was produced by pinned Node 24 on Windows. Gzip's
 // OS header is metadata; reproduce that exact physical witness on every OS.
 const original=gzipSync(source);original[9]=10;
 assert.equal(hash(original),'ee5c239203d26701a31b1a5b71db4aa984c664db6b2bcc2482007f567ff94f52','immutable original Windows gzip witness');
}
export function assertPriorSessionMenuWitness(packet){
 const {mobileContinuation,...prior}=packet;
 const bytes=gzipSync(JSON.stringify(prior));bytes[9]=10;
 assert.equal(hash(bytes),'a01740a49c5e118391a852344365df664c85b06b2c550093b868dc1dac0418c6','immutable complete deck notification witness');
 const {continuation,...menu}=prior;
 assertOriginalSessionMenuWitness(menu);
}
export function extendMobileSessionMenuEpoch(original,mobile){
 const prior=original.proof;
 assert.equal(prior.currentCommit,'aa2060671da1bfd5b7151c48ae8babf7b38d5640');
 assert.equal(mobile.schemaVersion,1);
 assert.equal(mobile.baseCommit,prior.currentCommit);
 assert.equal(mobile.currentCommit,'ca103dedb636ad064951c33f207a01bad93bbef8','exact committed mobile source producer');
 const changed=['src/lua/abyss_ui.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_view.lua'];
 assert.deepEqual(Object.keys(mobile.before),changed,'complete mobile predecessor owners');
 assert.deepEqual(Object.keys(mobile.current),changed,'complete mobile current owners');
 for(const path of changed){
  assert.deepEqual(mobile.before[path],prior.current[path],'exact mobile source predecessor: '+path);
  assert.notEqual(mobile.current[path].sha256,prior.current[path].sha256,'changed mobile source: '+path);
 }
 const current={...prior.current,...mobile.current},paths=Object.keys(current).sort();
 const targets={...prior.targets};assert(!Object.hasOwn(targets,'mobilePrior'));
 targets.mobilePrior={commit:prior.currentCommit,files:prior.current};
 const owners=paths.filter(path=>Object.values(targets).some(t=>t.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,currentCommit:mobile.currentCommit,
  currentCommitRole:'exact committed mobile exit and HUD source continuation',current,targets,owners}),
 {allowConfigLayout:true,reuseFrozenInput:true});
}
export function extendSessionMenuEpoch(original){
 const bytes=readFileSync(new URL('./session-menu-source-epoch.json.gz',import.meta.url));
 assert.equal(hash(bytes),'a7d36a9dfdb6aa9111e6c6c5fcef75c0a84d2274b7bb537cc8b21da15176c9cd','complete session menu and mobile source witness');
 const patch=JSON.parse(gunzipSync(bytes)),prior=original.proof;
 assertPriorSessionMenuWitness(patch);
 const {mobileContinuation,continuation,...menu}=patch;
 assert.equal(patch.schemaVersion,1);assert.equal(patch.normalization,'LF');
 assert.equal(patch.menuCommit,'a0d3cd6cfe5e19f720837db2d39b1b69aa995bae');
 assert.equal(patch.baseCommit,'fbb455a502f436390a539f4d4f3181fb084be472');
 assert.deepEqual(patch.inventoryBefore,Object.keys(prior.current).sort(),'complete menu predecessor inventory');
 assert.deepEqual(Object.keys(patch.before),Object.keys(patch.current),'complete registered menu source slice');
 for(const [path,row]of Object.entries(patch.before))assert.deepEqual(row,prior.current[path]??null,'exact menu source predecessor: '+path);
 const menuCurrent={...prior.current,...patch.current},paths=Object.keys(menuCurrent).sort();
 assert.deepEqual(paths,patch.inventoryAfter,'complete menu current inventory');
 assert.equal(continuation.schemaVersion,1);
 assert.equal(continuation.baseCommit,patch.menuCommit);
 assert.equal(continuation.currentCommit,'aa2060671da1bfd5b7151c48ae8babf7b38d5640');
 const changed=['src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_view.lua'];
 assert.deepEqual(Object.keys(continuation.before),changed);
 assert.deepEqual(Object.keys(continuation.current),changed);
 for(const path of changed){
  assert.deepEqual(continuation.before[path],menuCurrent[path],'exact deck notification predecessor: '+path);
  assert.notEqual(continuation.current[path].sha256,menuCurrent[path].sha256,'changed deck notification source: '+path);
 }
 const current={...menuCurrent,...continuation.current};
 const pad=files=>Object.fromEntries(paths.map(p=>[p,files[p]??null]));
 const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,row])=>[name,{...row,files:pad(row.files)}]));
 assert(!Object.hasOwn(targets,'sessionMenuPrior'));
 targets.sessionMenuPrior={commit:patch.baseCommit,files:pad(prior.current)};
 assert(!Object.hasOwn(targets,'sessionMenuReviewed'));
 targets.sessionMenuReviewed={commit:patch.menuCommit,files:pad(menuCurrent)};
 const owners=paths.filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 const menuEpoch=createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,
  currentCommit:continuation.currentCommit,currentCommitRole:'exact reviewed deck notification continuation over immutable menu sources',current,targets,owners}),
 {allowConfigLayout:true,reuseFrozenInput:true});
 return extendMobileSessionMenuEpoch(menuEpoch,mobileContinuation);
}
