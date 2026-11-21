import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lumineSelectionBackground} from '../scripts/lumine-selection-background.mjs';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {withViewport} from '../scripts/viewport-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {attachOfficialPortraits} from '../scripts/official-portraits.mjs';
import {applyOfficialNoncombatLayout} from '../scripts/noncombat-v25-layout.mjs';
const parts=n=>n?.controls??n?.children??[],child=(n,name)=>parts(n).find(c=>c.name===name);
const all=n=>[n,...parts(n).flatMap(all)];
test('official menu and selection reuse live inputs with bounded native decoration',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=withViewport(gameLayout(),theme);
 attachOfficialPortraits(layout,{selectionAvatar:true,battlePortrait:true});
 const stage=child(layout,'stage')??layout,menu=child(stage,'menuPanel'),panel=child(stage,'characterPanel');
 const start=child(child(menu,'start'),'hit'),confirm=child(child(panel,'confirm'),'hit'),modal=child(panel,'deckView');
 const resultLabel=structuredClone(child(child(menu,'start'),'label'));
 const oldBattle=JSON.stringify(child(stage,'battlePanel'));
 applyOfficialNoncombatLayout(layout,theme);
 assert.equal(child(child(menu,'start'),'hit'),start);
 assert.equal(child(child(panel,'confirm'),'hit'),confirm);
 assert.equal(parts(panel).at(-1),modal);
 assert.equal(modal.visible,false);assert.deepEqual(modal.children,[],'retire the duplicated selection deck; reuse the shared browser');
 assert.equal(JSON.stringify(child(stage,'battlePanel')),oldBattle);
 assert.equal(child(menu,'vista').visible,false);
 assert.equal(child(menu,'emblem').visible,false);
 assert(child(child(menu,'v25MainMenu'),'sts1TitleLogo'),'retain the released #797 logo');
 for(const name of ['exitPanel','runMenu'])for(const key of ['guide','help'])
  assert.equal(child(child(stage,name),key),undefined,'retain the released #784 removal in '+name);
 // Pin the approved menu geometry independently of the layout theme.
 assert.deepEqual(child(menu,'start').position,[-464,-114]);
 assert.deepEqual(child(menu,'start').size,[208,48]);
 assert.deepEqual(start.size,child(menu,'start').size,'paint and hit areas share the approved bounds');
 assert.deepEqual(child(child(menu,'start'),'officialResultLabel'),{...resultLabel,name:'officialResultLabel',visible:false});
 for(const key of ['confirm','cancel'])for(const state of parts(child(child(panel,key),'hit'))){
  assert.equal(child(state,'label').text.content,key==='confirm'?'开始挑战':'返回');
  const flag=child(state,'v25Flag'),cloth=child(flag,'cloth'),rim=child(flag,'rim');
  assert(rim&&cloth,'smooth buttons retain separate rim and cloth');
  assert.equal(parts(cloth).length,6,'preserve #785 smooth rounded cloth');assert.equal(parts(rim).length,6);
  assert.equal(all(cloth).filter(n=>n.image===theme.image.disc).length,4,'reuse original four native rounded corners');
  assert(all(cloth).filter(n=>n.kind==='image').every(n=>[theme.image.rect,theme.image.disc].includes(n.image)));
  assert.equal(child(state,'label').text.colour,state.name==='disabled'?theme.color.textMuted:theme.officialAssets.buttonInk,'shared official button ink preserves disabled distinction');
  assert.equal(child(state,'plate').visible,false);assert.equal(child(state,'border').visible,false);
  assert.equal(all(flag).some(n=>n.image===theme.officialAssets.images.button),false,'official rectangle must not replace original flag');
 }
 assert.equal(child(panel,'v25Background').visible,true);
 assert.equal(child(child(panel,'v25Background'),'veil'),undefined,'preserve #785 removal of persistent full-screen selection shade');
 assert.equal(all(panel).filter(n=>n.name==='officialGeoBadge').length,0,'the selected character must not become an unrelated geo icon');
 const constellation=child(child(child(panel,'v25Roster'),'selected'),'v25Constellation');
 assert.equal(constellation.visible,true);assert.equal(all(constellation).filter(n=>n.kind==='image').length,93);
 const initial=child(selectedSlot(panel),'selectedInitial');
 assert.equal(initial,undefined,'initial must not cover the exact-alpha constellation');
 assert.equal(child(selectedSlot(panel),'selectedPixelAvatar'),undefined);
 const details=child(panel,'details'),bag=child(details,'v25GoldIcon');
 assert.equal(bag.kind,'container');assert.equal(all(bag).some(n=>n.image===theme.icon.gold),false,'approved grey money bag must not become a round coin');
 assert(all(bag).filter(n=>n.kind==='image').every(n=>n.image===theme.image.rect));
 assert.equal(child(bag,'bag').children[0].colour,'#D1D0BD');
 assert.equal(child(selectedSlot(panel),'selection').children[0].colour,'#E5C846');
 assert.equal(child(selectedSlot(panel),'selection').visible,false,'gold frame is selected only at runtime');
 assert.deepEqual(child(child(panel,'details'),'officialSelectionFigure').scale,[1,1]);
});
function selectedSlot(panel){return child(child(panel,'v25Roster'),'selected');}

test('integrated selection has a native starter relic and no pre-run deck hit area',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=withViewport(gameLayout(),theme);
 const panel=child(child(layout,'stage')??layout,'characterPanel'),details=child(panel,'details');
 applyOfficialNoncombatLayout(layout,theme);
 assert.equal(child(details,'deckOpen'),undefined);
 const relic=child(details,'v25RelicIcon');
 assert.equal(relic.visible,true);
 assert.deepEqual(relic.size,[36,44]);
 assert(parts(relic).length>=3 && parts(relic).every(n=>n.kind==='image'&&n.image===100003));
 assert(parts(relic).every(n=>n.raycastTarget===false),'the relic ornament must not claim input');
});

test('production background preserves the exact approved experiment rows, including colour and half masks',()=>{
 const background=lumineSelectionBackground();
 const rows=background.rows.map(r=>[...r.slice(0,7),...r.slice(11,13),r[18],r[19],r[13],...r.slice(14,17),r[20]]
  .map(v=>Number.isInteger(v)?v:Math.round(v*1000)/1000));
 // Independently frozen from lumine-native-v11/rows-1600.json, not this adapter.
 assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'),'8feed38c818cfa0abda50d1955cfaa99f360ec60bf501544a7245aa4c779eee5');
 assert.equal(rows.length,1600);assert.equal(rows.filter(r=>r[15]===1).length,224);
});

test('selection uses static exact-alpha geometry and reuses the selected frame without a glyph overlay',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=withViewport(gameLayout(),theme);applyOfficialNoncombatLayout(layout,theme);
 const panel=child(child(layout,'stage')??layout,'characterPanel'),slot=selectedSlot(panel),initial=child(slot,'selectedInitial');
 assert.deepEqual(slot.size,[100,100]);assert(child(slot,'stone'));
 assert.deepEqual(slot.position,[-226,-226.5]);
 assert.equal(initial,undefined);
 const symbol=child(slot,'v25Constellation');assert.deepEqual(symbol.size,[118,118]);
 assert.deepEqual(symbol.position,[0,0]);assert(symbol.visible);
 assert(all(symbol).filter(n=>n.kind==='image').every(n=>[theme.image.rect,100006].includes(n.image)&&n.colour==='#202A29'));
 assert.equal(all(symbol).filter(n=>n.kind==='image'&&n.image===100006).length,49);
 for(const arc of all(symbol).filter(n=>n.kind==='image'&&n.image===100006)){
  assert.equal(arc.fill.shape,'horizontal');assert.equal(arc.fill.from,'right');
  assert(arc.fill.amount>0&&arc.fill.amount<1);
 }
 assert.equal(all(symbol).some(n=>['text','presetButton','cursorArea'].includes(n.kind)),false);
 applyOfficialNoncombatLayout(layout,theme);
 assert.equal(parts(selectedSlot(panel)).filter(n=>n.name==='v25Constellation').length,1);
 assert.equal(parts(panel).filter(n=>n.name==='lumineSelectionBackground').length,1);
});

test('official host uses direct inventory actions, read-only relic details and explicit run discard',async t=>{
 const {mkdtempSync,mkdirSync,readFileSync,rmSync}=await import('node:fs');
 const {join,resolve}=await import('node:path');
 const {spawnSync}=await import('node:child_process');
 const {createRequire}=await import('node:module');
 const {buildUI}=await import('../scripts/build-ui.mjs');
 const {buildLuaData,luaString}=await import('../scripts/build-lua-data.mjs');
 mkdirSync('build/test-tmp',{recursive:true});
 const directory=mkdtempSync(resolve('build/test-tmp/sts-ui-'));
 t.after(()=>rmSync(directory,{recursive:true,force:true}));
 buildLuaData('data',join(directory,'abyss_data.lua'));
 buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
 const stage=child(JSON.parse(readFileSync(join(directory,'game-ui.json'),'utf8')),'stage');
 for(const [name,sha] of [
  ['menuPanel','9978170ae0f37c189e71a6dfbf6b5f24128230e576961e3be212e69804d70ab0'],
  ['exitPanel','7715c4bf68220f4110d3e600032647e2d6d3a1a47b9ff5fcd268af3e9acfa82b'],
 ]){
  assert.equal(createHash('sha256').update(JSON.stringify(child(stage,name))).digest('hex'),sha,
   'preserve the complete released layout at 8af38667: '+name);
 }
 const script=`package.path=${luaString(directory.replaceAll('\\','/')+'/?.lua;src/lua/?.lua')}
dofile('tests/lua/support/sts_ui_closeout.lua')`;
 const require=createRequire(import.meta.url);
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',script],{encoding:'utf8',timeout:60000});
 assert.equal(result.status,0,result.error?.message??result.stderr+result.stdout);
 assert.match(result.stdout,/STS_UI_CLOSEOUT_PASS/);
});
