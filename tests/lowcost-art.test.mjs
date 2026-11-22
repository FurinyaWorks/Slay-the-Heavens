import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {eventArtRegistry,loadLowCostArt} from '../scripts/lowcost-art.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {runLua} from '../scripts/test-lua.mjs';
test('authored art covers every placeholder relic and every two-act enemy within small fixed pools',()=>{
 const art=loadLowCostArt(),id=v=>typeof v==='object'?v.id:v;
 const relics=JSON.parse(readFileSync('data/relics.json','utf8')).relics;
 const wanted=relics.filter(r=>id(nativeTheme.officialAssets.battleRelicIcons[r.id]??nativeTheme.icon.relic[r.id])===102028).map(r=>r.id).sort();
 assert.deepEqual(Object.keys(art.relic.assets).sort(),[...wanted,'burning_blood'].sort());
 assert.deepEqual(Object.keys(art.enemy.assets).sort(),Object.keys(nativeTheme.icon.enemy).filter(id=>id!=='verify').sort());
 for(const registry of Object.values(art))for(const asset of Object.values(registry.assets)){
  assert(asset.shapes.length<=registry.capacity);
  for(const s of asset.shapes){
   const angle=(s.rotation??0)*Math.PI/180;
   assert(Math.abs(s.x)+(Math.abs(s.w*Math.cos(angle))+Math.abs(s.h*Math.sin(angle)))/2<=50.01,asset.name+' horizontal bounds');
   assert(Math.abs(s.y)+(Math.abs(s.h*Math.cos(angle))+Math.abs(s.w*Math.sin(angle)))/2<=50.01,asset.name+' vertical bounds');
  }
 }
});
test('real imported pools switch all illustrations, retain fallback on failure, and do not repaint cached shapes',()=>{
 const fits=JSON.parse(readFileSync(eventArtRegistry,'utf8')).fits;
 assert.equal(Object.keys(fits).length,49);
 for(const [id,fit] of Object.entries(fits))
  assert.notEqual(fit.tiers['60'].method.method,'repo-rectangle-grid',id+' must use the reviewed contour fit');
 const before=readFileSync('build/lua/abyss_ui_layout.lua');
 const r=runLua('tests/lua/lowcost_art.lua',{timeout:60000});
 assert.deepEqual(readFileSync('build/lua/abyss_ui_layout.lua'),before,'art fixture must not alter the default layout');
 assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/LOWCOST_ART_PASS 89 42/);
 assert.match(r.stdout,/EVENT_ART_POOL_PASS 49 268/);
});
