import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,readdirSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {buildUI} from '../scripts/build-ui.mjs';
import {buildLuaData,luaString,toLua} from '../scripts/build-lua-data.mjs';
import {officialAssetFlags} from '../scripts/official-assets-profile.mjs';
import {readArtFeatures} from '../scripts/art-features.mjs';
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
  for(const [surface,radius] of [[rim,10],[cloth,8]]){
   const [width,height]=surface.size;
   assert.deepEqual(parts(surface).map(n=>n.image),[theme.image.rect,theme.image.rect,...Array(4).fill(theme.image.disc)]);
   assert.deepEqual(parts(surface).map(n=>n.size),[[width-2*radius,height],[width,height-2*radius],...Array(4).fill([2*radius,2*radius])]);
  }
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
  ['menuPanel','22ba44505ce84d1a0db1fc106c385c2fd1594d4dafe2703de04e7cb8ba0b4173'],
  ['exitPanel','7823696e5eab9c33d02a0d1f2f575bed9a16927d8476d94f9f32a7769e287888'],
  ['runMenu','0e7ac3c3d114fc0f66ea0e1dd0717dfb08824d1abbbf577cecbda500413cafb0'],
 ]){
  assert.equal(createHash('sha256').update(JSON.stringify(child(stage,name))).digest('hex'),sha,
   'preserve the complete integrated pile and menu layout: '+name);
 }
 const script=`package.path=${luaString(directory.replaceAll('\\','/')+'/?.lua;src/lua/?.lua')}
dofile('tests/lua/support/sts_ui_closeout.lua')`;
 const require=createRequire(import.meta.url);
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',script],{encoding:'utf8',timeout:60000});
 assert.equal(result.status,0,result.error?.message??result.stderr+result.stdout);
 assert.match(result.stdout,/STS_UI_CLOSEOUT_PASS/);
});

const require=createRequire(import.meta.url),directory=mkdtempSync(join(tmpdir(),'selection-overlay-'));
after(()=>rmSync(directory,{recursive:true,force:true}));
buildLuaData('data',join(directory,'abyss_data.lua'));
buildUI(directory,undefined,{officialAssets:true,nativePageLifecycle:true});
const layout=JSON.parse(readFileSync(join(directory,'game-ui.json'),'utf8'));
const panel=child(child(layout,'stage'),'characterPanel');

test('official generated selection retires the legacy full-screen shade above its approved artwork',()=>{
 const background=child(panel,'lumineSelectionBackground'),shade=child(panel,'officialBackdropVeil');
 assert(parts(panel).indexOf(shade)>parts(panel).indexOf(background),'exercise the inherited foreground shade');
 assert.deepEqual(shade.size,[1280,720]);
 assert.equal(shade.visible,false,'ready artwork must not inherit the old full-screen backdrop shade');
 assert.equal(child(panel,'blocker').kind,'cursorArea','retire paint only; retain the selection input barrier');
 const fallback=child(panel,'v25Background');
 assert.equal(fallback.visible,true,'the controller still owns its loading fallback');
 assert.deepEqual(parts(fallback),[{
  name:'fill',kind:'image',position:[0,0],size:[1280,720],image:100001,colour:'#0F1117',raycastTarget:false,
 }],'loading and failure have one opaque dark fill with no picture or hit surface');
 assert(!all(layout).some(node=>node.image===107271),'the purple catalog picture must not be shipped in this layout');
 assert.deepEqual(readArtFeatures(directory),officialAssetFlags);
});

test('official native portrait ready, pause and reentry cannot restore the retired full-screen shade',t=>{
 const modules=readdirSync(directory).filter(n=>n.endsWith('.lua')).map(n=>n.slice(0,-4));
 const script=`
local generated=${luaString(directory.replaceAll('\\','/'))}
package.path=generated..'/?.lua;src/lua/?.lua'
for _,name in ipairs(${toLua(modules)})do package.preload[name]=assert(loadfile(generated..'/'..name..'.lua'))end
local F=dofile('tests/lua/support/game_ui_fixture.lua')
local root=F.Viewport.apply(F.control({children=F.Layout}),1280,720)
local panel=root:GetChild('characterPanel');panel:SetVisible(true)
local art=panel:GetChild('lumineSelectionBackground')
local details=panel:GetChild('details')
local dots,fade=details:GetChild('portraitLoading'),details:GetChild('portraitFade')
local legacy=panel:GetChild('officialBackdropVeil')
local fallback=panel:GetChild('v25Background')
local fill=fallback:GetChild('fill')
local Asset=require('abyss_traveler_portrait_assets')
Asset.imagePrefabId,Asset.containerPrefabId,Asset.selectionHalfImagePrefabId=41,73,99
Enum={ImageSource={StaticReference='static'},ImageType={Stretch=23},ImageFillHorizontalType={Right=1}}
Color={FromRGBA=function(...)return {...}end}
local methods={}
function methods:SetVisible(value)self.visible=value end
function methods:SetActive(value)self.active=value end
function methods:SetImage(source,id)self.imageId=id end
for _,name in ipairs({'SetAnchorMin','SetAnchorMax','SetPivot','SetSizeDelta','SetLocalScale','SetLocalRotation','SetAnchoredPosition','SetAsLastSibling','SetFillHorizontal','SetFillUnused'})do methods[name]=function()end end
local function install(control)
 control.SetActive=methods.SetActive
 for _,c in pairs(control.children)do install(c)end
end
install(root)
local created,destroyed,rejectCreation=0,0,false
game={InstantiateClientUIControl=function(index,parent)
 assert(index==41 or index==73 or index==99)
 if rejectCreation then return nil end
 created=created+1;return setmetatable({parent=parent,alive=true},{__index=methods})
end,DestroyClientUIControl=function()destroyed=destroyed+1 end}
local portraits=require('abyss_traveler_portraits').new(root,nil,{selectionAvatar=true,battlePortrait=true})
local covered={}
local function scope(label)
 print('SELECTION_SCOPE '..label..' legacy='..tostring(legacy.visible)..' fallback='..tostring(fallback.visible)..' art='..tostring(art.visible)..' phase='..portraits:status().selection.phase)
 assert(fill.visible)
 if legacy.visible then covered[#covered+1]=label end
end
portraits:sync('menu',true,false,'ironclad');scope('building')
portraits:tick(.49);assert(not dots.visible and not fade.visible)
portraits:tick(.02);assert(dots.visible and dots.text=='• · ·' and not art.visible)
portraits:tick(.17);assert(dots.text=='· • ·')
for _=1,600 do portraits:tick();if portraits:readyForPage('menu',true,'ironclad','characterPanel')then break end end
assert(portraits:readyForPage('menu',true,'ironclad','characterPanel'))
assert(portraits:status().selection.phase=='ready' and art.visible and not fallback.visible)
assert(not dots.visible and fade.visible)
portraits:tick(.17);assert(not fade.visible)
scope('ready')
local total=created
portraits:sync('menu',false,false,'ironclad');assert(not art.visible and fallback.visible);scope('paused')
portraits:sync('menu',true,false,'ironclad');portraits:tick()
assert(art.visible and not fallback.visible and created==total and destroyed==0);scope('reentry')
assert(panel:GetChild('blocker').visible,'input barrier was removed with legacy paint')
assert(portraits:release());rejectCreation=true
portraits:sync('menu',true,false,'ironclad');portraits:tick()
assert(portraits:status().selection.phase=='failed' and not art.visible and fallback.visible)
scope('failed')
rejectCreation=false
portraits:sync('menu',false,false,'ironclad')
portraits:sync('menu',true,false,'ironclad')
portraits:tick(4);local timedOut=created
for _=1,10 do portraits:tick(1/60)end
assert(created==timedOut and fallback.visible and not dots.visible and not art.visible)
portraits:sync('menu',false,false,'ironclad')
portraits:sync('menu',true,false,'ironclad')
local setVisible=art.SetVisible;local reentered=false
art.SetVisible=function(self,value)
 setVisible(self,value)
 if value and not reentered then
  reentered=true;portraits:sync('menu',true,false,'hutao')
 end
end
for _=1,600 do portraits:tick(1/60);if reentered then break end end
assert(reentered and not art.visible and fallback.visible and not fade.visible and not dots.visible,
 'late Geo art became visible after the next role was chosen')
portraits:onEngineDestroy();portraits:tick();scope('destroyed')
assert(#covered==0,'inherited full-screen shade covers the approved selection art: '..table.concat(covered,','))
print('SELECTION_OVERLAY_SCOPE_PASS created='..created)
`;
 const result=spawnSync(process.execPath,[require.resolve('fengari-node-cli/src/lua-cli.js'),'-e',script],{
  encoding:'utf8',timeout:30000,maxBuffer:2*1024*1024,env:{...process.env,LUA_INIT:'',LUA_INIT_5_3:''}});
 assert.equal(result.status,0,result.stdout+result.stderr+String(result.error??''));
 assert.match(result.stdout,/SELECTION_OVERLAY_SCOPE_PASS/);
 t.diagnostic(result.stdout);
});

test('default opt-out retains its existing backdrop shade and no approved native selection host',()=>{
 const output=join(directory,'default');buildUI(output);
 const tree=JSON.parse(readFileSync(join(output,'game-ui.json'),'utf8'));
 const selection=child(child(tree,'stage'),'characterPanel');
 assert.notEqual(child(selection,'officialBackdropVeil').visible,false);
 assert.equal(child(selection,'lumineSelectionBackground'),undefined);
 assert.equal(child(selection,'veil').opacity,1);
});
