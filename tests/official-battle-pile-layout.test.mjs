import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';
import{battlePileChrome}from'../scripts/official-battle-pile-chrome.mjs';
import{gameLayout}from'../scripts/game-ui-layout.mjs';
import{nativeTheme}from'../scripts/native-ui-theme.mjs';
import{officialAssetsTheme,applyOfficialAssets}from'../scripts/official-assets-layout.mjs';
const child=(node,name)=>(node.controls??node.children??[]).find(item=>item.name===name);
const returnButton=tree=>child(child(tree,'deckPanel'),'pileReturn');
const label=face=>child(face,'label');
const materialColour=(face,role)=>child(child(child(face,'roundedButton'),role),'vertical').colour;
function luminance(hex){const values=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);return values[0]*.2126+values[1]*.7152+values[2]*.0722;}
function contrast(first,second){const a=luminance(first),b=luminance(second);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
test('V25 pile chrome fits the internal design canvas rather than Simulator device pixels',()=>{
 const theme=JSON.parse(readFileSync('data/presentation/ui_theme.json')),chrome=battlePileChrome(theme);
 assert.deepEqual(theme.canvas.base,[1280,720]);
 const shade=chrome.children.find(n=>n.name==='shade');
 assert.equal(shade.position[1]+shade.size[1]/2,316);
 assert.equal(shade.position[1]-shade.size[1]/2,-360);
 for(const n of chrome.children.filter(n=>!n.name.startsWith('vignette'))){const [x,y]=n.position,[w,h]=n.size;assert(x-w/2>=-640.1&&x+w/2<=640.1&&y-h/2>=-360.1&&y+h/2<=360.1,n.name);}
 const button=returnButton(gameLayout());
 assert.deepEqual(button.position,[-550,-237]);assert(button.position[0]-180/2>=-640);assert(button.position[1]-54/2>=-360);
});
test('the shared cursor return face preserves its layout, ink and one hit receiver',()=>{
 const source=structuredClone(nativeTheme);source.officialAssets.buttonInk='#FDFDFD';
 for(const official of [false,true]){
  const theme=official?officialAssetsTheme(source):source,tree=gameLayout(theme);
  if(official)applyOfficialAssets([tree],theme);
  const button=returnButton(tree),art=child(button,'art'),hit=child(button,'hit');
  assert.deepEqual(button.children.map(part=>part.name),['art','hit']);
  assert.equal(button.visible,false);assert.deepEqual(button.position,[-550,-237]);assert.deepEqual(button.size,[180,54]);
  assert.equal(label(art).text.colour,source.officialAssets.buttonInk);assert.equal(label(art).text.content,'返回');
  assert.equal(label(art).raycastTarget,false);assert.ok(contrast(label(art).text.colour,materialColour(art,'cloth'))>=4.5);
  assert.equal(hit.kind,'cursorArea');assert.equal(hit.focusable,true);assert.deepEqual(hit.size,button.size);
  for(const role of ['rim','cloth'])for(const part of child(child(art,'roundedButton'),role).children)
   assert.equal(part.raycastTarget,false,part.name);
 }
});
test('the return face and all four cancel preset states share the rounded button tokens',()=>{
 const source=structuredClone(nativeTheme);source.officialAssets.roundedCancelStates.hover[1]='#944748';
 const theme=officialAssetsTheme(source),tree=gameLayout(theme);applyOfficialAssets([tree],theme);
 const palette=theme.officialAssets.roundedButtonPalettes.cancel,art=child(returnButton(tree),'art');
 assert.equal(palette.hover[1],'#944748');
 assert.deepEqual([materialColour(art,'rim'),materialColour(art,'cloth')],palette.normal);
 for(const [panel,name]of [['runMenu','abandon'],['exitPanel','confirm']]){
  const hit=child(child(child(tree,panel),name),'hit');
  for(const state of ['normal','hover','pressed','disabled']){
   const face=child(hit,state);
   assert.deepEqual([materialColour(face,'rim'),materialColour(face,'cloth')],palette[state],panel+'/'+state);
   assert.ok(contrast(label(face).text.colour,palette[state][1])>=4.5,panel+'/'+state);
  }
 }
});
