import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {luaString,toLua} from '../scripts/build-lua-data.mjs';
import {runLua} from '../scripts/test-lua.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {attachCompendium} from '../scripts/compendium-ui-layout.mjs';
import {assertNativeUiCapacity} from '../scripts/build-ui.mjs';
import {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {v25Theme} from '../scripts/v25-layout.mjs';

test('real generated Production catalogue UI browses without a Run or RNG',()=>{
 const result=runLua('tests/lua/compendium_ui.lua');
 assert.equal(result.status,0,result.stdout+result.stderr);
});
test('bounded catalogue layout composes with native and official themes',()=>{
 for(const theme of [nativeTheme,officialAssetsTheme(nativeTheme),v25Theme(nativeTheme)]){
  const layout=withViewport(gameLayout(),theme),stage=layout.controls.find(n=>n.name==='stage');
  assert.equal(stage.children.find(n=>n.name==='compendiumEntries'),undefined,'baseline reproduction changed');
  attachCompendium(layout,theme);assertNativeUiCapacity(layout);
  const panel=stage.children.find(n=>n.name==='compendiumPanel');
  const nativeText=n=>{
   if(n.kind==='text')assert.ok(n.text.minFontSize*1.45+4<=n.size[1],`${n.name}: no whole native text line`);
   for(const child of n.children??[])nativeText(child);
  };
  nativeText(panel);nativeText(stage.children.find(n=>n.name==='compendiumEntries'));
  assert.equal(panel.children.filter(n=>/^row\d+$/.test(n.name)).length,6);
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
