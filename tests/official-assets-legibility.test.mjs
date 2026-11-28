import test from 'node:test';
import {replayReviewedSelection} from './helpers/replay-reviewed-selection.mjs';
import assert from 'node:assert/strict';
import {gameLayout} from '../scripts/game-ui-layout.mjs';
import {nativeTheme} from '../scripts/native-ui-theme.mjs';
import {applyOfficialAssets,officialAssetsTheme} from '../scripts/official-assets-layout.mjs';
import {battleLayout} from '../scripts/ui-layout.mjs';
import {chapterBattleScenes,chapterBattleSceneHost} from '../scripts/v220-chapter-battle-scenes.mjs';
import {deckCardTemplate} from '../scripts/deck-ui-layout.mjs';
import {geoCardReferenceTokens,stsReferenceRuntimeGeometry} from '../scripts/sts-card-reference-profile.mjs';
const children=n=>n.controls??n.children??[];
const child=(n,key)=>children(n).find(c=>c.name===key);
const all=n=>[n,...children(n).flatMap(all)];
function assertFlagInk(panel,theme){
 for(const key of ['cancel','confirm']){
  const button=child(panel,key),hit=child(button,'hit');
  // The approved full-background V25 selection supersedes the old idle layout.
  // Keep its native hit and readable labels checked independently of the adapter.
  assert.deepEqual(button.size,[180,60],'approved selection button bounds');
  assert.deepEqual(hit.size,[180,60],'original native hit remains aligned');
  for(const name of ['normal','hover','pressed']){
   const face=child(hit,name),flag=child(face,'v25Flag'),label=child(face,'label');
   assert(flag&&child(flag,'cloth')&&child(flag,'rim'),'shared irregular flag material');
   assert.equal(child(face,'plate').visible,false);assert.equal(child(face,'border').visible,false);
   assert.equal(label.text.colour,theme.officialAssets.buttonInk,'shared character ink token');
   assert.equal(label.text.minFontSize,24);assert(label.text.minFontSize>=Math.max(14,theme.font.minimum),'native reading minimum');
   assert.equal(label.text.fontSize,24);assert.equal(label.text.content,key==='cancel'?'返回':'开始挑战');
  }
 }
}
function assertSharedCard(card,theme){
 const back=child(card,'stsReferenceBack'),front=child(card,'stsReferenceChrome'),tokens=geoCardReferenceTokens(theme);
 assert(back&&front,'shared StS back and front must own the visible frame');
 assert.deepEqual(children(back).map(n=>n.name),['body','portraits']);
 assert.deepEqual(children(front).map(n=>n.name),['frame','plaqueFace','banner']);
 const index=n=>children(card).indexOf(n),art=children(card).filter(n=>n.name==='art'||n.name.startsWith('art_')||n.name==='artSamples');
 assert(art.length>0);for(const image of art)assert(index(back)<index(image)&&index(image)<index(front),'illustration stays between back and front');
 const cost=child(card,'cost'),layer=child(card,'stsReferenceCost'),material=child(layer,'costMaterial');
 assert(index(child(card,'blockedVeil'))<index(layer)&&index(layer)<index(cost),'cost survives the blocked veil');
 assert(cost&&cost.visible!==false,'printed cost remains visible');assert(index(front)<index(cost),'printed cost is above its material');
 assert.equal(child(material,'field').colour,tokens.cost.face,'shared character cost face token');
 assert.equal(child(material,'rim').colour,tokens.cost.rim);assert.equal(child(material,'light').colour,tokens.cost.light);
 assert.equal(child(material,'field').size[0],child(material,'field').size[1],'inner cost lens is circular');
 for(const name of ['costDisc','costCore','nativeCostOrb','nativeCardBody','nativeRibbon','roleRing','roleMark','nameBand','nameRule'])if(child(card,name))assert.equal(child(card,name).visible,false,'old material cannot cover new '+name);
 const geometry=theme.officialAssets.stsCardReference.geometry;
 for(const [name,spec]of [['name',geometry.title],['cost',geometry.cost],['type',geometry.type],['label',geometry.body],['description',geometry.body]]){
  const text=child(card,name);if(!text)continue;
  assert.deepEqual(text.position,spec.position);assert.deepEqual(text.size,spec.size);
  assert(text.text.minFontSize>=Math.max(14,theme.font.minimum),name+' keeps native minimum');
  assert.equal(text.text.autoSize,false,'source-sized labels must not shrink away');assert.equal(text.text.valign,'middle');
 }
}
function assertTypeFrame(card,theme){
 const front=child(card,'stsReferenceChrome'),back=child(card,'stsReferenceBack'),geometry=theme.officialAssets.stsCardReference.geometry;
 assert(front&&back,'shared StS type frame required');
 assert.deepEqual(geometry.frameProfiles,stsReferenceRuntimeGeometry.frameProfiles,'measured independent type contours');
 const pool=all(child(front,'frame')).filter(n=>n.kind==='image'),profiles=geometry.frameProfiles;
 assert.equal(pool.length,Math.max(...Object.values(profiles).map(rows=>rows.length)),'single fixed type-frame pool');
 for(const [i,shape]of pool.entries()){
  assert.equal(shape.visible,i<profiles.attack.length);
  if(i<profiles.attack.length){
   for(const key of ['position','size','rotation','scale'])assert.deepEqual(shape[key],profiles.attack[i][key],'source attack '+key);
  }
 }
 const portraits=child(back,'portraits');assert.deepEqual(children(portraits).map(n=>n.name),['attack','skill','power']);
 for(const kind of ['attack','skill','power']){
  const well=child(portraits,kind);assert.equal(well.visible,kind==='attack');assert.deepEqual(children(well).map(n=>n.name),['well'],'only the source well lives behind artwork');
 }
 if(child(card,'skin')){assert.equal(child(card,'skin').visible,false);assert.equal(children(child(card,'skin')).length,0,'old rounded frame cannot survive behind new chrome');}
}
function assertDisabledInk(hit,theme){
 const enabled=child(child(hit,'normal'),'label'),disabled=child(child(hit,'disabled'),'label');
 assert.equal(enabled.text.colour,theme.officialAssets.buttonInk);assert.equal(disabled.text.colour,theme.color.textMuted,'shared disabled selection token');
 assert.notEqual(disabled.text.colour,enabled.text.colour,'disabled label retains contrast');
 for(const text of [enabled,disabled])assert(text.text.minFontSize>=Math.max(14,theme.font.minimum));
 const brightness=hex=>[1,3,5].reduce((sum,i)=>sum+parseInt(hex.slice(i,i+2),16),0);
 assert(brightness(disabled.text.colour)<brightness(enabled.text.colour),'disabled label is visibly dimmer');
}

test('treasure details and room backdrop retain authored materials with room for full reward text',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const rooms=child(layout,'nodePanel'),treasure=child(rooms,'treasureView');
 assert.equal(child(rooms,'backdrop').image,theme.image.rect,'room background must not use a catalog landscape');
 const detail=child(treasure,'details');
 assert.equal(child(detail,'panel').image,theme.image.rect,'generic panel skin must not overwrite readable details');
 assert(all(treasure).every(n=>n.image!==theme.image.officialBackdrops.act1_3));
 const description=child(child(treasure,'rewardItem2'),'description');
 assert(description.size[1]>=2*(description.text.fontSize*1.45+2),'long reward effects need two full native lines');
 assert(child(detail,'relatedDescription').size[1]>=3*(20*1.45+2),'related status explanation needs three native lines');
 assert.equal(child(treasure,'bossDescription').text.colour,theme.color.text);
});
test('official battle HUD can render at least one full native text line without hiding its values',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const battle=child(layout,'battlePanel');
 const numberSize=theme.officialAssets.battleHud.numberSize;
 assert.equal(numberSize,18,'approved native HUD number size');
 const fullValues={player:'2147483647/2147483647',piles:'2147483647',title:'99'};
 for(const [key,value]of Object.entries(fullValues)){
  const label=child(battle,key),minimum=label.text.minFontSize;
  assert.notEqual(label.visible,false,key+' remains visible');
  assert.equal(label.text.autoSize,false,key+' uses the fixed official resource font');
  assert.equal(label.text.fontSize,numberSize);
  assert.equal(minimum,numberSize);
  assert(minimum>=Math.max(14,theme.font.minimum),key+' keeps the native reading minimum');
  assert(minimum*1.45+4<=label.size[1],key+' has no fitting native text size');
  assert(value.length*.6*numberSize+8<=label.size[0],key+' fits the complete native value with padding');
 }
});
test('official selection flags retain readable shared ink and their aligned native hit surface',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const panel=child(layout,'characterPanel');assertFlagInk(panel,theme);
 const old=structuredClone(panel);child(child(child(old,'confirm'),'hit'),'normal').children.find(n=>n.name==='label').text.colour=theme.layout.stsCharacter.colour.buttonInk;
 assert.throws(()=>assertFlagInk(old,theme),/shared character ink token/,'superseded idle-layout ink must fail');
 const misaligned=structuredClone(panel);child(child(misaligned,'confirm'),'hit').size=[180,54];
 assert.throws(()=>assertFlagInk(misaligned,theme),/original native hit remains aligned/,'old hit bounds must fail');
});
test('historical official card host capacity and readability retain all original assertions',t=>{
 t.diagnostic(replayReviewedSelection('tests/official-assets-legibility.test.mjs'));
});

const originalCardHosts=[
 ...Array.from({length:10},(_,i)=>'/SlayTheAbyss/battlePanel/card'+(i+1)),
 ...Array.from({length:7},(_,i)=>'/SlayTheAbyss/nodePanel/shopView/card'+(i+1)),
 ...Array.from({length:3},(_,i)=>'/SlayTheAbyss/nodePanel/pickerView/card'+(i+1)),
 ...['before','after','target'].map(n=>'/SlayTheAbyss/nodePanel/pickerView/'+n),
 ...Array.from({length:12},(_,i)=>'/SlayTheAbyss/nodePanel/pickerView/forgeGrid/card'+(i+1)),
 ...Array.from({length:2},(_,i)=>'/SlayTheAbyss/choicePanel/card'+(i+1)+'/face'),
 '/AbyssDeckCard/face',
].sort();
const paths=(node,prefix='')=>{
 const path=prefix+'/'+node.name;return [[path,node],...children(node).flatMap(c=>paths(c,path))];
};
const focusFacePath='/SlayTheAbyss/deckPanel/cardFocus/face';
const retiredChoiceFaces=new Set(['/SlayTheAbyss/choicePanel/card1/face','/SlayTheAbyss/choicePanel/card2/face']);
function assertCardHostPaths(layout,cards){
 const original=cards.map(([path])=>path).filter(path=>path!==focusFacePath).sort();
 assert.equal(original.length+retiredChoiceFaces.size,38,'account for every original official card host');
 assert.deepEqual(original,originalCardHosts.filter(path=>!retiredChoiceFaces.has(path)),
  'retain every original card host outside the shared choice grid');
 const extras=cards.filter(([path])=>path===focusFacePath);
 assert.equal(extras.length,1,'the approved deck detail has exactly one face');
 const detail=child(child(layout,'deckPanel'),'cardFocus');
 assert.strictEqual(extras[0][1],child(detail,'face'));
 assert.equal(detail.visible,false,'read-only deck focus starts closed');
 assert(!all(detail).some(node=>node.kind==='cursorArea'),'deck detail adds no duplicate input receiver');
}

test('official card hosts share the measured back/front frame, visible cost and native reading minimum',()=>{
 const source=JSON.stringify(nativeTheme),theme=officialAssetsTheme(nativeTheme);
 const layout=gameLayout(),template=deckCardTemplate();applyOfficialAssets([layout,template],theme);
 const battleCards=new Set(all(child(layout,'battlePanel')).filter(n=>child(n,'roundFrame')&&child(n,'costDisc')));
 assert.equal(battleCards.size,10);
 const hosts=[...paths(layout),...paths(template)].filter(([,node])=>child(node,'roundFrame')&&child(node,'costDisc'));
 assertCardHostPaths(layout,hosts);
 const cards=hosts.map(([,node])=>node);
 for(const card of cards)assertSharedCard(card,theme);
 const old=structuredClone(cards[0]);old.children=children(old).filter(n=>!['stsReferenceBack','stsReferenceChrome'].includes(n.name));
 assert.throws(()=>assertSharedCard(old,theme),/shared StS back and front/,'old card frame rollback must fail');
 const hiddenCost=structuredClone(cards[0]);child(hiddenCost,'cost').visible=false;
 assert.throws(()=>assertSharedCard(hiddenCost,theme),/printed cost remains visible/);
 const changed=structuredClone(theme);changed.color.geo='#123456';const tokenTemplate=deckCardTemplate();applyOfficialAssets([tokenTemplate],changed);
 assertSharedCard(all(tokenTemplate).find(n=>child(n,'roundFrame')&&child(n,'costDisc')),changed);
 assert.deepEqual(theme.cardSkin.costTone,nativeTheme.cardSkin.costTone,'red/green cost semantics');
 assert.equal(JSON.stringify(nativeTheme),source,'candidate must not change the legacy theme');
});

test('both official build orders retain exact choice and picker semantics and every readable card face',()=>{
 for(const themeFirst of [false,true]){
  const theme=officialAssetsTheme(nativeTheme),layout=gameLayout(themeFirst?theme:nativeTheme),template=deckCardTemplate();
  const picker=child(child(layout,'nodePanel'),'pickerView'),choice=child(layout,'choicePanel');
  const retained=['card1','card2','card3'].map(n=>child(picker,n));
  const hits=retained.map(n=>child(n,'hit'));
  const result=applyOfficialAssets([layout,template],theme);
  assert.deepEqual(children(choice).filter(n=>/^card\d+$/.test(n.name)),[]);
  const grid=child(choice,'cards');
  assert.equal(grid.kind,'grid');
  assert.equal(grid.grid.columns,5);
  assert.equal(grid.itemTemplate,template.name);
  for(const name of ['option1','option2']){
   const option=child(choice,name);
   assert.equal(option.visible,false);
   assert.deepEqual(children(option).map(node=>[node.name,node.kind]),[['hit','presetButton']],
    'potion controls retain a native button without a second card face');
  }
  assert.deepEqual(children(picker).filter(n=>/^card\d+$/.test(n.name)).map(n=>n.name),['card1','card2','card3','card4','card5','card6']);
  for(let i=1;i<=3;i++)assert(child(child(picker,'card'+i),'stsReferenceChrome'),'visible picker retains a full card face');
  for(let i=4;i<=6;i++){
   const parent=child(picker,'card'+i);assert.equal(parent.kind,'container');
   assert.equal(parent.visible,false);assert.deepEqual(children(parent),[],'unused semantic parent has no serialized card face');
  }
  retained.forEach((n,i)=>assert.strictEqual(child(n,'hit'),hits[i],'retained native receiver identity'));
  const cards=[...paths(layout),...paths(template)].filter(([,n])=>child(n,'stsReferenceChrome'));
  assertCardHostPaths(layout,cards);
  assert.equal(result.cardHosts,cards.length+12,'host accounting retires only the twelve-card duplicate selection deck');
  for(const [,card]of cards)assertSharedCard(card,theme);
  assert(!all(layout).some(n=>n.name==='StsAngerReferencePrototype'));
 }
});
test('official battle reuses the approved complete V25 architecture instead of stretched pillar icons',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const scenes=child(layout,'officialBattleBackdrop');
 for(const key of ['act1_1','act1_2','act1_3','act2_1','act2_2','act2_3','boss1','boss2']){
  const scene=child(scenes,key);assert.equal(scene.kind,'container');assert.equal(scene.visible,false);
  assert.equal(children(scene).length,0,key+' retains the superseded icon scenery');
 }
 const foreground=child(child(layout,'battlePanel'),'v25BattleScene');assert(foreground);
 assert(child(foreground,'gate')&&child(foreground,'floor')&&child(foreground,'perspective'));
});
test('chapter artwork publishes a single bounded pool for the official stage',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);
 const plan=chapterBattleScenes(theme);
 applyOfficialAssets([layout],theme,{chapterScenes:plan});
 const stage=child(layout,'stage')??layout,battle=child(stage,'battlePanel');
 const scene=child(battle,chapterBattleSceneHost);
 assert.deepEqual(child(battle,'hero').position,[-324,-35]);
 assert.deepEqual(child(battle,'notice').position,theme.layout.battleNotice.position);
 assert.deepEqual(theme.layout.player.groundedStatusLane,[-168,42]);
 const contact=theme.layout.enemyRow.groundContact;
 assert.equal(contact.feet.blue_guard,47/106);
 assert.equal(contact.feet.red_louse,50/106);
 assert.equal(contact.feet.wizard_gremlin,49/106);
 assert.equal(contact.feet.sentry,undefined);
 assert.equal(contact.feet.champ,48/106);
 assert.equal(Object.keys(contact.feet).length,35);
 assert.equal(Object.keys(contact.classification).length,42);
 assert(Object.values(contact.footprints).every(footprints=>footprints.length<=2));
 assert(!child(battle,'v25BattleScene')&&!child(battle,'lowpolyScene'));
 assert.equal(children(battle)[0],scene,'scene paints behind battle interaction');
 assert.equal(children(scene).length,5);
 assert(children(scene).every(batch=>children(batch).length<=60));
 assert.equal(all(scene).length,256);
 assert.deepEqual(plan.rows.map(rows=>rows.filter(Boolean).length),[229,249]);
 const slots=all(scene).filter(node=>node.kind==='image');
 assert.equal(slots.length,250);
 assert.equal(slots.filter(node=>node.visible===false).length,21);
 for(const rows of plan.rows)for(const [i,row]of rows.entries()){
  if(row)assert.equal(row[0]>100006,slots[i].image>100006,'one renderer family per native slot');
 }
});
test('measured type frames share one native pool and preserve original illustration identities',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const card=child(child(layout,'battlePanel'),'card1');assertTypeFrame(card,theme);
 const old=structuredClone(card);child(old,'stsReferenceChrome').children.find(n=>n.name==='frame').children=[];
 assert.throws(()=>assertTypeFrame(old,theme),/single fixed type-frame pool/,'old independent rounded frame cannot replace the measured shared pool');
 assert.deepEqual(theme.cardSkin.artWells,theme.officialAssets.battleArtWells);
 assert.deepEqual(theme.icon.cardPortraits,nativeTheme.icon.cardPortraits);
 assert.deepEqual(theme.icon.cardArt,nativeTheme.icon.cardArt);
 assert.deepEqual(theme.cardSkin.rarities.basic,nativeTheme.cardSkin.rarities.common);
});
test('standalone battle output receives the same geometry and required turn-notice tree',()=>{
 const layout=battleLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const stage=child(layout,'stage')??layout;
 assert.deepEqual(child(stage,'card1').size,[150,210]);
 assert(child(child(stage,'feedback'),'v25TurnNotice'));
 assert(child(stage,'v25BattleScene'));
});

test('official reward choice adopts the approved dark field and title ribbon without a stretched catalog panel',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const battle=child(layout,'battlePanel'),stage=child(battle,'rewardStage');
 assert.deepEqual(stage.size,[1280,720]);
 assert.equal(child(stage,'plate').opacity,0);
 assert.equal(child(stage,'border').opacity,0);
 assert(child(stage,'v25RewardField')&&child(stage,'v25RewardPaper'));
 assert.deepEqual(child(stage,'title').position,[0,180]);
 assert.deepEqual(child(battle,'skip').position,[0,-235]);
 assert.equal(theme.layout.rewardPick.scale,1.133333333333);
 assert.equal(theme.layout.rewardPick.step,270);
});
test('selection disabled labels keep their shared muted token and visible contrast',()=>{
 const layout=gameLayout(),theme=officialAssetsTheme(nativeTheme);applyOfficialAssets([layout],theme);
 const hit=child(child(child(layout,'characterPanel'),'confirm'),'hit');
 assertDisabledInk(hit,theme);
 const old=structuredClone(hit);child(child(old,'disabled'),'label').text.colour=child(child(old,'normal'),'label').text.colour;
 assert.throws(()=>assertDisabledInk(old,theme),/shared disabled selection token/,'losing disabled distinction must fail');
 const changed=structuredClone(theme);changed.color.textMuted='#777777';const tokenLayout=gameLayout();applyOfficialAssets([tokenLayout],changed);
 assertDisabledInk(child(child(child(tokenLayout,'characterPanel'),'confirm'),'hit'),changed);
});

test('run pages share the final battle bar without copied inputs or a covering legacy header',()=>{
 const theme=officialAssetsTheme(nativeTheme),layout=gameLayout(theme);applyOfficialAssets([layout],theme);
 const battle=child(layout,'battlePanel'),hud=theme.officialAssets.battleHud;
 const original=structuredClone(child(battle,'topBar'));original.name='officialRunBar';
 original.children=children(original).filter(part=>!['battleRoute','floorIcon'].includes(part.name));
 for(const name of ['mapPanel','nodePanel']){
  const page=child(layout,name),bar=child(page,'officialRunBar'),resources=child(page,'resources')??page;
  assert.deepEqual(bar,original,name+' shares the canonical bar');
  assert(!all(bar).some(control=>control.kind==='cursorArea'),name+' has no unbound cloned receiver');
  for(const control of all(page).filter(control=>['headerShade','headerDivider','titleLineLeft','titleLineRight'].includes(control.name)))assert.equal(control.visible,false,name+'/'+control.name);
  for(const [key,reference]of [['hp','player'],['gold','piles']]){
   assert.deepEqual(child(resources,key).position,hud[key].slice(0,2));
   assert.equal(child(resources,key).text.colour,child(battle,reference).text.colour);
  }
 }
 assert.equal(child(child(layout,'potionEntry'),'open').position[1],hud.y);
});
