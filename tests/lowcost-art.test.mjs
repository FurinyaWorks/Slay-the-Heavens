import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadLowCostArt} from '../scripts/lowcost-art.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {createHash} from 'node:crypto';
const extraRelics='art_of_war,black_blood,blood_vial,boot,bottled_flame,bottled_lightning,bottled_tornado,bronze_scales,burning_blood,centennial_puzzle,darkstone_periapt,eternal_feather,ginger,golden_idol,ink_bottle,lees_waffle,letter_opener,mango,maw_bank,molten_egg,oddly_smooth_stone,old_coin,omamori,orichalcum,ornamental_fan,pear,pen_nib,potion_belt,toxic_egg,toy_ornithopter,turnip,war_paint,whetstone'.split(',');
test('authored art covers every placeholder relic and every two-act enemy within small fixed pools',()=>{
 const art=loadLowCostArt(),id=v=>typeof v==='object'?v.id:v;
 const relics=JSON.parse(readFileSync('data/relics.json','utf8')).relics;
 const wanted=relics.filter(r=>id(nativeTheme.officialAssets.battleRelicIcons[r.id]??nativeTheme.icon.relic[r.id])===102028).map(r=>r.id).sort();
 assert.equal(wanted.length,88);
 assert.deepEqual(Object.keys(art.relic.assets).sort(),[...wanted,...extraRelics].sort());
 const original=Object.fromEntries(wanted.map(id=>[id,art.relic.assets[id]]));
 assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'),'1f8732b6833e137e19bcf76ddff08e1ec91dba99e3320f7d9b874aa2089fd115','all original 88 complete assets stay unchanged');
 const geometry=extraRelics.map(id=>JSON.stringify(art.relic.assets[id].shapes.map(({colour,...shape})=>shape)));
 assert.equal(new Set(geometry).size,33,'new native relic glyphs differ without colour');
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
 const before=readFileSync('build/lua/abyss_ui_layout.lua');
 const r=runLua('tests/lua/lowcost_art.lua',{timeout:60000});
 assert.deepEqual(readFileSync('build/lua/abyss_ui_layout.lua'),before,'art fixture must not alter the default layout');
 assert.equal(r.status,0,r.stdout+r.stderr+String(r.error??''));assert.match(r.stdout,/LOWCOST_ART_PASS 121 42/);
});

test('reviewed 33 relic recipes and seven archived small-size sheets retain exact identities',()=>{
 const directory='docs/evidence/relic-semantic-icons-20261115/';
 const hash=b=>createHash('sha256').update(b).digest('hex');
 const source=readFileSync(directory+'extra-assets.json','utf8').replaceAll('\r\n','\n');
 assert.equal(hash(source),'6e1acdf53dd5ba9f41e5c100a9077a433648db8a2c7a7571574559e2b948cc8b');
 const selection=JSON.parse(source),audit=JSON.parse(readFileSync(directory+'audit.json','utf8'));
 assert.equal(selection.canvas,100);assert.equal(selection.capacity,16);assert.deepEqual(Object.keys(selection.assets).sort(),extraRelics);
 const registry=loadLowCostArt().relic;
 for(const id of extraRelics)assert.deepEqual(registry.assets[id],selection.assets[id],id);
 assert.deepEqual(audit.neutral24ExactDuplicates,[]);
 const names=[...['24','32'].flatMap(size=>['colour','gray','neutral'].map(mode=>`relics-${size}px-${mode}.png`)),'relics-named-64px.png'];
 assert.deepEqual(audit.files.map(row=>row.file),names);
 for(const row of audit.files){
  const data=readFileSync(directory+row.file);assert.equal(hash(data),row.sha256,row.file);assert.equal(data.subarray(1,4).toString(),'PNG');
  const pixels=Number(row.file.match(/(24|32)px/)?.[1]);
  assert.equal(data.readUInt32BE(16),pixels?7*(pixels+20):7*192);assert.equal(data.readUInt32BE(20),pixels?5*(pixels+20):5*128);
 }
});
