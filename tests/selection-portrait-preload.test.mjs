import {createLegacySelectionFixture} from './helpers/legacy-selection-fixture.mjs';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createOptInArtFixture} from './helpers/opt-in-art-fixture.mjs';
import {portraitRuntimeInventory} from '../scripts/official-portraits.mjs';
const fixture=createOptInArtFixture({bindTemplates:true});
after(()=>fixture.dispose());
test('title preloads hidden selection art within budget and entering selection reuses it',()=>{
 const assets=portraitRuntimeInventory(fixture.directory).assets;
 const count=id=>{const a=assets.find(a=>a.asset===id);assert(a,'source inventory '+id);return a.images+a.groups+a.pages;};
 assert.equal(count('lowpolyHero')+count('traveler-geo/portraits/avatar96'),2512);
 assert.equal(count('traveler-geo/portraits/battle133'),4389);
 assert.doesNotMatch(readFileSync(join(fixture.directory,'abyss_traveler_portrait_assets.lua'),'utf8'),/^selection133=/m);
 const r=fixture.runLua('tests/lua/support/selection_portrait_preload.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SELECTION_PORTRAIT_PRELOAD_PASS/);
});

test('legacy selection retains its complete isolated selection_portrait_preload contract',async t=>{
 const legacy=await createLegacySelectionFixture();t.after(()=>legacy.dispose());
 const r=legacy.runLua('tests/lua/support/selection_portrait_preload.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SELECTION_PORTRAIT_PRELOAD_PASS/);
});
