// Reviewed navigation continuation; no previous target or archive is rewritten.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {createSourceEpochProjector} from './combined-epoch/source-epoch-runtime.mjs';
const bytes=readFileSync(new URL('./navigation-source-epoch.json.gz',import.meta.url));
assert.equal(createHash('sha256').update(bytes).digest('hex'),'ee601a622539a61c1041501c3027f2d5b5e0918614cda64f99d208d5382d3e7e');
export const navigationPatch=JSON.parse(gunzipSync(bytes));
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const paths=['config/architecture.json','src/lua/abyss_game_ui.lua','src/lua/abyss_game_ui_input.lua','src/lua/abyss_game_ui_lifecycle.lua','src/lua/abyss_game_ui_menu_view.lua','src/lua/abyss_game_ui_navigation.lua','src/lua/abyss_game_ui_navigation_view.lua','src/lua/abyss_game_ui_overlays.lua','src/lua/abyss_game_ui_run.lua','src/lua/abyss_game_ui_view.lua','src/lua/abyss_v25_menu_view.lua'];
export function extendNavigationEpoch(original,patch=navigationPatch){
 const prior=original.proof;
 assert.equal(patch.schemaVersion,1);
 assert.equal(patch.baseCommit,'58a30edfcb06cb34403ca71d04fcea9d3e4352ef');
 assert.equal(patch.currentCommit,'3f627d5dfb764826c9ab5a13de12bcdca5aefd24');
 assert.deepEqual(patch.inventoryBefore,Object.keys(prior.current).sort());
 assert.deepEqual(Object.keys(patch.before).sort(),paths);
 assert.deepEqual(Object.keys(patch.current).sort(),paths);
 for(const path of paths){assert.deepEqual(patch.before[path],prior.current[path]??null,'complete navigation predecessor: '+path);assert(patch.current[path]);}
 const current={...prior.current,...patch.current},all=Object.keys(current).sort();
 const pad=files=>Object.fromEntries(all.map(path=>[path,files[path]??null]));
 const targets=Object.fromEntries(Object.entries(prior.targets).map(([name,row])=>[name,{...row,files:pad(row.files)}]));
 assert(!Object.hasOwn(targets,'navigationPrior'));
 targets.navigationPrior={commit:patch.baseCommit,files:pad(prior.current)};
 const owners=all.filter(path=>Object.values(targets).some(row=>row.files[path]?.sha256!==current[path]?.sha256));
 return createSourceEpochProjector(freeze({...prior,currentCommit:patch.currentCommit,currentTreeCommitted:false,
  currentCommitRole:'reviewed release and navigation combination',current,targets,owners}),{allowConfigLayout:true,reuseFrozenInput:true});
}
