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
export function assertNavigationRetirementPredecessor(packet){
 const {neowRetirementContinuation,...prior}=packet;
 const bytes=gzipSync(JSON.stringify(prior));bytes[9]=10;
 assert.equal(hash(bytes),'a7d36a9dfdb6aa9111e6c6c5fcef75c0a84d2274b7bb537cc8b21da15176c9cd','immutable complete navigation predecessor packet');
 assertPriorSessionMenuWitness(prior);
}
export function assertNeowStaticPredecessor(packet){
 const {neowRetirementStaticContinuation,...prior}=packet;
 const bytes=gzipSync(JSON.stringify(prior));bytes[9]=10;
 assert.equal(hash(bytes),'96ce4a31979d92038e046af850cef169e225e684378e3f81cab7e74b8110ede8','immutable original one-owner Neow retirement packet');
 assertNavigationRetirementPredecessor(prior);
}
export function extendNeowStaticEpoch(original,continuation){
 const prior=original.proof,path='src/lua/abyss_node_ui_feedback.lua';
 assert.equal(continuation.schemaVersion,1);
 assert.equal(continuation.baseCommit,'b1c2cb0f1f0a15524c3c57734cc7efbc10ac319a');
 assert.equal(continuation.currentCommit,'9783f9ed4fdf021270668b66c863b9dfeebc7150','exact optional-flow helper producer');
 assert.deepEqual(Object.keys(continuation.before),[path]);assert.deepEqual(Object.keys(continuation.current),[path]);
 assert.deepEqual(continuation.before[path],prior.current[path],'exact original Neow retirement source');
 assert.notEqual(continuation.current[path].sha256,prior.current[path].sha256);
 const current={...prior.current,...continuation.current},targets={...prior.targets};
 assert(!Object.hasOwn(targets,'neowRetirementStaticPrior'));
 targets.neowRetirementStaticPrior={commit:continuation.baseCommit,files:prior.current};
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,currentCommit:continuation.currentCommit,
  currentCommitRole:'exact one-owner optional Neow flow helper producer; mobile sources retain their separately bound producer',current,targets,owners}),
 {allowConfigLayout:true,reuseFrozenInput:true});
}
export function extendNeowRetirementEpoch(original,retirement){
 const prior=original.proof,path='src/lua/abyss_node_ui_feedback.lua';
 assert.equal(retirement.schemaVersion,1);
 assert.equal(retirement.baseCommit,'808a310cfc9a0c2734ec424d7ac80d3a040557c8');
 assert.equal(retirement.currentCommit,'b1c2cb0f1f0a15524c3c57734cc7efbc10ac319a','exact one-owner navigation retirement producer');
 assert.deepEqual(Object.keys(retirement.before),[path]);assert.deepEqual(Object.keys(retirement.current),[path]);
 assert.deepEqual(retirement.before[path],prior.current[path],'exact retired Neow source predecessor');
 assert.notEqual(retirement.current[path].sha256,prior.current[path].sha256,'changed Neow retirement source');
 const current={...prior.current,...retirement.current},targets={...prior.targets};
 assert(!Object.hasOwn(targets,'navigationRetirementPrior'));
 // A later mobile layer retains its separately frozen full predecessor. Never
 // label the one-owner fix producer as the producer of those mobile sources.
 targets.navigationRetirementPrior={commit:retirement.baseCommit,files:prior.targets.mobilePrior?.files??prior.current};
 if(prior.targets.mobilePrior){
  assert(!Object.hasOwn(targets,'mobileRetirementPrior'));
  targets.mobileRetirementPrior={commit:prior.currentCommit,files:prior.current};
 }
 const owners=Object.keys(current).sort().filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,currentCommit:retirement.currentCommit,
  currentCommitRole:'exact one-owner Neow retirement fix producer; other owners retain their separately bound producer',current,targets,owners}),
 {allowConfigLayout:true,reuseFrozenInput:true});
}
export function extendSessionMenuEpoch(original){
 const bytes=readFileSync(new URL('./session-menu-source-epoch.json.gz',import.meta.url));
 assert.equal(hash(bytes),"bba0ec427b8c036d15149cfff4800f3559f6dbf2f282e22368e30afdc3805665",'complete session menu, mobile and Neow retirement source witness');
 const patch=JSON.parse(gunzipSync(bytes)),prior=original.proof;
 assertNeowStaticPredecessor(patch);
 const {neowRetirementStaticContinuation,neowRetirementContinuation,mobileContinuation,continuation,...menu}=patch;
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
 return extendNeowStaticEpoch(extendNeowRetirementEpoch(extendMobileSessionMenuEpoch(menuEpoch,mobileContinuation),neowRetirementContinuation),neowRetirementStaticContinuation);
}
