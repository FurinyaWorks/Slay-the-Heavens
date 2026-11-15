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
import {assertNativeUiCapacity} from '../scripts/build-ui.mjs';
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
 assert.deepEqual(child(menu,'start').position,[-450,-170]);
 assert.deepEqual(child(child(menu,'start'),'officialResultLabel'),{...resultLabel,name:'officialResultLabel',visible:false});
 for(const key of ['confirm','cancel'])for(const state of parts(child(child(panel,key),'hit'))){
  const flag=child(state,'v25Flag'),cloth=child(flag,'cloth'),rim=child(flag,'rim');
  assert(rim&&cloth,'smooth buttons retain separate rim and cloth');
  assert(parts(cloth).length>1&&parts(rim).length>1,'reference flag must retain its curved silhouette instead of two rectangles');
  assert(new Set(all(cloth).filter(n=>n.kind==='image').map(n=>n.size[0])).size>1,'flag width follows its measured silhouette');
  assert(all(cloth).filter(n=>n.kind==='image').every(n=>n.image===100003||(n.name==='interior'&&n.image===theme.image.rect)),
   'curved cloth must use the registered native triangle instead of visible horizontal scan bands');
  assert(all(rim).filter(n=>n.kind==='image').every(n=>n.image===100003||(n.name==='interior'&&n.image===theme.image.rect)));
  assert(all(cloth).some(n=>n.image===100003));assert(all(rim).some(n=>n.image===100003));
  assert(all(flag).length<=150,'continuous edges must not multiply the native control budget');
  assert.equal(child(state,'label').text.colour,state.name==='disabled'?theme.color.textMuted:theme.officialAssets.buttonInk,'shared official button ink preserves disabled distinction');
  assert.equal(child(state,'plate').visible,false);assert.equal(child(state,'border').visible,false);
  assert.equal(all(flag).some(n=>n.image===theme.officialAssets.images.button),false,'official rectangle must not replace original flag');
 }
 assert.equal(child(panel,'v25Background').visible,true);
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
 assert.equal(child(selectedSlot(panel),'innerFrame0').colour,'#957749');
 assert.deepEqual(child(child(panel,'details'),'officialSelectionFigure').scale,[1,1]);
});
function selectedSlot(panel){return child(child(panel,'v25Roster'),'selected');}

test('integrated selection retains the shared deck input below its summary without overlapping the selected card',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=withViewport(gameLayout(),theme);
 const panel=child(child(layout,'stage')??layout,'characterPanel'),details=child(panel,'details');
 const deck=child(details,'deckOpen'),hit=child(deck,'hit');
 applyOfficialNoncombatLayout(layout,theme);
 assert.equal(child(child(details,'deckOpen'),'hit'),hit,'reuse the live shared-browser input');
 assert.deepEqual(deck.size,[180,48]);assert.deepEqual(hit.size,[180,48]);
 const overlaps=(a,b)=>Math.abs(a.position[0]-b.position[0])*2<a.size[0]+b.size[0]
  &&Math.abs(a.position[1]-b.position[1])*2<a.size[1]+b.size[1];
 for(const other of [child(details,'deckSummary'),selectedSlot(panel),child(panel,'cancel')])
  assert.equal(overlaps(deck,other),false,'deck entry overlaps '+other.name);
 for(const state of parts(hit))for(const face of [child(state,'border'),child(state,'plate')]){
  assert(face.size[0]<=deck.size[0]&&face.size[1]<=deck.size[1],'painted button surface escapes its hit box');
 }
});

test('continuous native flags retain the measured StS frame and four existing hits',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=withViewport(gameLayout(),theme);
 const panel=child(child(layout,'stage')??layout,'characterPanel');
 const original=Object.fromEntries(['cancel','confirm'].map(k=>[k,child(child(panel,k),'hit')]));
 applyOfficialNoncombatLayout(layout,theme);
 for(const name of ['cancel','confirm']){
  const button=child(panel,name),hit=child(button,'hit');assert.equal(hit,original[name]);
  const [x,y,w,h]=theme.layout.stsCharacter.rectangles[name];
  assert.deepEqual(button.position,[x+w/2-640,360-y-h/2]);assert.deepEqual(hit.size,[w,h]);
  assert.deepEqual(hit.states,{normal:'normal',hover:'hover',pressed:'pressed',disabled:'disabled'});
  for(const state of parts(hit)){
   const flag=child(state,'v25Flag'),[low,high]=flag.flagBounds;
   const measured=name==='cancel'?[-29,28]:[-29,20];
   flag.flagBounds.forEach((v,i)=>assert(Math.abs(v-measured[i])<=.25,'seam overlap stays subpixel at the measured contour'));
   assert(Math.abs((high-low)*state.scale[1]-h)<1e-9,'actual silhouette keeps the original hit height');
   assert(Math.abs((flag.position[1]+(low+high)/2)*state.scale[1])<1e-9,'silhouette remains centered');
   assert.equal(state.scale[0],1);assert.equal(child(state,'label').position[1],0);
   assert.equal(all(flag).some(n=>['cursorArea','presetButton','text'].includes(n.kind)),false);
   // Project the actual native triangle vertices, including supported XYZ
   // squash and the right-half fallback. Texture box bounds are not geometry.
   const vertices=all(child(flag,'rim')).filter(n=>n.kind==='image').flatMap(n=>{
    const [w,h]=n.size,half=n.fill?.from==='right',r=Array.isArray(n.rotation)?n.rotation:[0,0,n.rotation??0];
    const [rx,ry,rz]=r.map(v=>v*Math.PI/180);
    return (half?[[0,0],[w/2,0],[0,h]]:[[-w/2,-h/2],[w/2,-h/2],[0,h/2]]).map(([x,y])=>{
     x*=n.scale?.[0]??1;y*=n.scale?.[1]??1;
     return [n.position[0]+(x*Math.cos(rz)-y*Math.sin(rz))*Math.cos(ry),
      n.position[1]+(x*Math.sin(rz)+y*Math.cos(rz))*Math.cos(rx)];});
   });
   assert(Math.abs(Math.min(...vertices.map(p=>p[1]))-low)<1e-6,'native geometry reaches the measured bottom');
   assert(Math.abs(Math.max(...vertices.map(p=>p[1]))-high)<1e-6,'native geometry reaches the measured top');
  }
 }
 assertNativeUiCapacity(layout);
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
 assert.deepEqual(slot.size,[124,124]);assert(child(slot,'rim'));
 assert.equal(initial,undefined);
 const symbol=child(slot,'v25Constellation');assert.deepEqual(symbol.size,[118,118]);
 assert.deepEqual(symbol.position,[0,0]);assert(symbol.visible);
 assert(all(symbol).filter(n=>n.kind==='image').every(n=>[theme.image.rect,100006].includes(n.image)&&n.colour==='#FFE0A2'));
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
