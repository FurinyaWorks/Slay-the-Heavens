import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync,mkdirSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {luaString,toLua} from '../scripts/build-lua-data.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {attachCompendium,assertCompendiumDisplayOnly} from '../scripts/compendium-ui-layout.mjs';
import {assertNativeUiCapacity} from '../scripts/build-ui.mjs';
import {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {v25Theme} from '../scripts/v25-layout.mjs';
import {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData} from '../scripts/build-lua-data.mjs';

test('retained native Grid bindings reject old gestures and current color tab preserves source state',()=>{
 const result=runLua('tests/lua/compendium_recycled_binding.lua');
 writeFileSync('build/compendium-review-retained-green.log',result.stdout+result.stderr);
 assert.equal(result.status,0,result.stdout+result.stderr);
});
for(const [module,expected] of [['ui','recycled card accepted old gesture'],['actions','same color tab reset source sorting or scroll']]){
 test(`exact previous ${module} reproduces independent review regression`,()=>{
  const manifest=JSON.parse(readFileSync('tests/fixtures/compendium-review-before.json','utf8'));
  const row=manifest.rows.find(row=>row.path.endsWith(`_${module}.lua`));
  const compressed=readFileSync(join('tests/fixtures',row.file)),raw=gunzipSync(compressed);
  assert.equal(createHash('sha256').update(compressed).digest('hex'),row.gzipSha256);
  assert.equal(raw.length,row.bytes);assert.equal(createHash('sha256').update(raw).digest('hex'),row.sha256);
  const entry=join(tmpdir(),`compendium-review-${randomUUID()}.lua`);
  writeFileSync(entry,`package.preload.abyss_compendium_${module}=assert(load(${luaString(raw.toString('utf8'))}))\ndofile('tests/lua/compendium_recycled_binding.lua')\n`);
  try{const result=runLua(entry);writeFileSync(`build/compendium-review-previous-${module}-red.log`,result.stdout+result.stderr);
   assert.notEqual(result.status,0);assert.ok((result.stdout+result.stderr).includes(expected),result.stdout+result.stderr);}
  finally{unlinkSync(entry);}
 });
}

test('real generated Production catalogue UI browses without a Run or RNG',()=>{
 const result=runLua('tests/lua/compendium_ui.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
});

test('official native card materials and the complete compendium input lifecycle use the same source contract',()=>{
 const generated=resolve('build/compendium-official-runtime',randomUUID());mkdirSync(generated,{recursive:true});
 buildLuaData('data',join(generated,'abyss_data.lua'));buildUI(generated,undefined,{officialAssets:true});
 const modules=readdirSync(generated).filter(name=>name.endsWith('.lua')).map(name=>name.slice(0,-4));
 const script=join(generated,'run.lua');
 writeFileSync(script,`for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(${luaString(generated.replaceAll('\\','/'))}..'/'..name..'.lua'))end\ndofile('tests/lua/compendium_ui.lua')\n`);
 const result=runLua(script);writeFileSync(join(generated,'run.log'),result.stdout+result.stderr);
 assert.equal(result.status,0,result.stdout+result.stderr);
});
test('bounded catalogue layout composes with native and official themes',()=>{
 for(const theme of [nativeTheme,officialAssetsTheme(nativeTheme),v25Theme(nativeTheme)]){
  const layout=withViewport(gameLayout(),theme),stage=layout.controls.find(n=>n.name==='stage');
  assert.equal(stage.children.find(n=>n.name==='compendiumEntries'),undefined,'baseline reproduction changed');
  attachCompendium(layout,theme);assertNativeUiCapacity(layout);
  const panel=stage.children.find(n=>n.name==='compendiumPanel');
  const popupFace=panel.children.find(n=>n.name==='popup').children.find(n=>n.name==='face');
  const popup=panel.children.find(n=>n.name==='popup');
  const part=name=>popup.children.find(n=>n.name===name);
  const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
  close(part('relicIcon').position[1],76*2/3);close(part('relicIcon').size[0],128*2*2/3);
  close(part('detailTitle').position[1],280*2/3);close(part('rarity').position[1],240*2/3);
  close(part('detail').size[0],418*2/3);
  close(part('detail').position[0]-part('detail').size[0]/2,-200*2/3);
  // Chinese smartHeight is negative; centered glyph baseline adds half its height.
  close(part('detail').position[1],(-140-8)*2/3);
  assert.equal(part('detail').text.valign,'middle');assert.ok(part('detail').text.fontSize>=18);
  const previewFace=panel.children.find(n=>n.name==='popup').children.find(n=>n.name==='previewFace');
  const hoverFace=panel.children.find(n=>n.name==='hoverHints').children.find(n=>n.name==='hoverFace');
  const shared=deckCardTemplate(theme).children.find(n=>n.name==='face').children;
  const popupExpected=structuredClone(shared);popupExpected.find(n=>n.name==='label').text.valign='middle';
  assert.deepEqual(popupFace.children,popupExpected,'popup permits only source multiline centering over the shared renderer');
  assert.deepEqual(previewFace.children,shared,'derived preview must use the shared native card renderer');
  assert.deepEqual(hoverFace.children,shared,'unclipped hover must use the shared native card renderer');
  const hoverLayer=panel.children.find(n=>n.name==='hoverHints');
  assert.doesNotThrow(()=>assertCompendiumDisplayOnly(hoverLayer));
  const hitStealing=structuredClone(hoverLayer);hitStealing.children.push({name:'hit-stealer',kind:'cursorArea',size:[400,560]});
  assert.throws(()=>assertCompendiumDisplayOnly(hitStealing),/Interactive control in compendium hover display/);
  const nativeText=n=>{
   // Shared card-face glyph frames have their own native card contracts.
   if(['face','previewFace','hoverFace'].includes(n.name))return;
   if(n.kind==='text')assert.ok(n.text.minFontSize*1.45+4<=n.size[1],`${n.name}: no whole native text line`);
   for(const child of n.children??[])nativeText(child);
  };
  nativeText(panel);nativeText(stage.children.find(n=>n.name==='compendiumEntries'));
  assert.equal(panel.children.filter(n=>/^row\d+$/.test(n.name)).length,0,'legacy text-list UI returned');
  assert.equal(panel.children.find(n=>n.name==='cardGrid').kind,'grid');
  assert.equal(panel.children.find(n=>n.name==='iconGrid').kind,'grid');
  for(const kind of ['cards','relics','potions'])assert(stage.children.find(n=>n.name==='compendiumEntries').children.some(n=>n.name===kind));
 }
 const host=readFileSync('src/lua/abyss_ui.lua','utf8');
 assert.match(host,/require\('abyss_compendium_host'\)\.attach\(view,stage,Data,Presentation/);
});
test('catalogue entry rejects the pre-fix stale menu gesture',()=>{
 const source=readFileSync('src/lua/abyss_compendium_host.lua','utf8');
 const anchor='if changed then generation=generation+1 end';
 assert.equal(source.split(anchor).length,2);
 const entry=join(tmpdir(),`compendium-mutant-${randomUUID()}.lua`);
 writeFileSync(entry,`ABYSS_COMPENDIUM_MUTANT=${luaString(source.replace(anchor,'if changed then generation=generation end'))}\ndofile('tests/lua/compendium_ui.lua')\n`);
 try{
  const result=runLua(entry);
  assert.notEqual(result.status,0);
  assert.match(result.stdout+result.stderr,/old entry gesture survived characters transition/);
 }finally{unlinkSync(entry);}
});
test('original menu layout without the build attachment reproduces the missing entry',()=>{
 const original=withViewport(gameLayout(),nativeTheme);
 const entry=join(tmpdir(),`compendium-original-menu-${randomUUID()}.lua`);
 writeFileSync(entry,`package.preload.abyss_ui_layout=function()return ${toLua(original.controls)}end\ndofile('tests/lua/compendium_ui.lua')\n`);
 try{
  const result=runLua(entry);
  assert.notEqual(result.status,0);
  assert.match(result.stdout+result.stderr,/missing actual generated catalogue entries/);
 }finally{unlinkSync(entry);}
});
