// Exact menu continuation; prior production corpora and assertions stay intact.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export function extendSessionMenuEpoch(original){
 const bytes=readFileSync(new URL('./session-menu-source-epoch.json.gz',import.meta.url));
 assert.equal(hash(bytes),'ee5c239203d26701a31b1a5b71db4aa984c664db6b2bcc2482007f567ff94f52','complete session menu source witness');
 const patch=JSON.parse(gunzipSync(bytes)),prior=original.proof;
 assert.equal(patch.schemaVersion,1);assert.equal(patch.normalization,'LF');
 assert.equal(patch.menuCommit,'a0d3cd6cfe5e19f720837db2d39b1b69aa995bae');
 assert.equal(patch.baseCommit,'fbb455a502f436390a539f4d4f3181fb084be472');
 assert.deepEqual(patch.inventoryBefore,Object.keys(prior.current).sort(),'complete menu predecessor inventory');
 assert.deepEqual(Object.keys(patch.before),Object.keys(patch.current),'complete registered menu source slice');
 for(const [path,row]of Object.entries(patch.before))assert.deepEqual(row,prior.current[path]??null,'exact menu source predecessor: '+path);
 const current={...prior.current,...patch.current},paths=Object.keys(current).sort();
 assert.deepEqual(paths,patch.inventoryAfter,'complete menu current inventory');
 const pad=files=>Object.fromEntries(paths.map(p=>[p,files[p]??null]));
 const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,row])=>[name,{...row,files:pad(row.files)}]));
 assert(!Object.hasOwn(targets,'sessionMenuPrior'));
 targets.sessionMenuPrior={commit:patch.baseCommit,files:pad(prior.current)};
 const owners=paths.filter(p=>Object.values(targets).some(t=>t.files[p]?.sha256!==current[p]?.sha256));
 return createSourceEpochProjector(freeze({...prior,currentTreeCommitted:false,
  currentCommit:prior.currentCommit,currentCommitRole:'exact reviewed menu continuation over release sources',current,targets,owners}),
 {allowConfigLayout:true,reuseFrozenInput:true});
}
