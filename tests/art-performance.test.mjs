import {createLegacySelectionFixture} from './helpers/legacy-selection-fixture.mjs';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {loadPerformancePack} from '../scripts/art/performance-pack.mjs';
import {portraitRuntimeInventory} from '../scripts/official-portraits.mjs';
import {createOptInArtFixture} from './helpers/opt-in-art-fixture.mjs';
const fixture=createOptInArtFixture({bindTemplates:true});
after(()=>fixture.dispose());
test('reduced selection preserves battle art and reuses both cached selection hosts',()=>{
 const selection=portraitRuntimeInventory(fixture.directory).assets.filter(a=>a.asset==='lowpolyHero'||a.asset.endsWith('/avatar96'));
 assert.deepEqual(selection.map(a=>[a.asset,a.images]),[['traveler-geo/portraits/avatar96',457],['lowpolyHero',2011]]);
 assert.equal(selection.reduce((sum,a)=>sum+a.images+a.groups+a.pages,0),2512,'current source inventory pins the full selection control count');
 assert.doesNotMatch(readFileSync(join(fixture.directory,'abyss_traveler_portrait_assets.lua'),'utf8'),/^selection133=/m);
 const r=fixture.runLua('tests/lua/support/selection_budget_loading.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SELECTION_BUDGET_LOADING_PASS/);
});
test('native startup shows official scenery without loading custom background art',()=>{
 const r=fixture.runLua('tests/lua/support/direct_selection_startup.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/OFFICIAL_TITLE_STARTUP_PASS/);
});
test('performance pack has all 75 cards and bounded source-verified character assets',()=>{
 const pack=loadPerformancePack();
 assert.equal(Object.keys(pack.assets).length,78);
 assert(pack.assets.background.count<=3600);
 assert(pack.assets.avatar96.count<=1024);
 assert(pack.assets.battle133.count<=2304);
 assert(Object.values(pack.assets).filter(a=>a.rectangles).every(a=>a.count<=1056));
});
test('adaptive background builds hidden, loads with progress and reuses without navigation or teardown destruction',()=>{
 const r=fixture.runLua('tests/lua/support/compact_art_loading.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/COMPACT_ART_LOADING_PASS/);
});
test('actual default run activates Geo portrait without changing other classes',()=>{
 const r=fixture.runLua('tests/lua/default_traveler_portrait.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/DEFAULT_TRAVELER_PORTRAIT_PASS/);
});

test('legacy selection retains its complete isolated selection_budget_loading contract',async t=>{
 const legacy=await createLegacySelectionFixture();t.after(()=>legacy.dispose());
 const r=legacy.runLua('tests/lua/support/selection_budget_loading.lua');
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/SELECTION_BUDGET_LOADING_PASS/);
});
