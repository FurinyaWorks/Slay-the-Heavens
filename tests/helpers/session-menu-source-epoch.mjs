// Exact menu continuation; prior production corpora and assertions stay intact.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync,gzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export function extendSessionMenuEpoch(original){
 const bytes=readFileSync(new URL('./session-menu-source-epoch.json.gz',import.meta.url));
 assert.equal(hash(bytes),'a01740a49c5e118391a852344365df664c85b06b2c550093b868dc1dac0418c6','complete session menu source witness');
 const patch=JSON.parse(gunzipSync(bytes)),prior=original.proof;
 const {continuation,...menu}=patch;
 assert.equal(hash(gzipSync(JSON.stringify(menu))),'ee5c239203d26701a31b1a5b71db4aa984c664db6b2bcc2482007f567ff94f52','immutable original session menu source witness');
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
 return createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,
  currentCommit:continuation.currentCommit,currentCommitRole:'exact reviewed deck notification continuation over immutable menu sources',current,targets,owners}),
 {allowConfigLayout:true,reuseFrozenInput:true});
}
